const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Spotify API Configuration
const SPOTIFY_CLIENT_ID = '474879af111c44ec8f835be52ac8ef01';
const SPOTIFY_CLIENT_SECRET = '43bf4784ce07415293d751f451b5e21a';
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'https://onesync.music/api/spotify/callback';

// Store pending applications temporarily (in production, use a database)
const pendingApplications = new Map();

// Serve static files from the current directory
app.use(express.static('.'));

// Admin email gate - only allow @onesync.music emails
const ALLOWED_ADMIN_DOMAIN = '@onesync.music';

// Middleware to check admin access
function requireOnesyncAdmin(req, res, next) {
  const email = req.body.email || req.query.email || req.headers['x-user-email'];
  if (!email || !email.toLowerCase().endsWith(ALLOWED_ADMIN_DOMAIN)) {
    return res.status(403).json({ 
      error: 'Access denied. Admin access is restricted to @onesync.music email addresses only.' 
    });
  }
  next();
}

// Spotify OAuth - Initiate authorization
app.get('/api/spotify/auth', (req, res) => {
  const { applicationType, name, email, artistName, genre, message } = req.query;
  
  // Store application data temporarily with a state token
  const state = Buffer.from(JSON.stringify({
    applicationType,
    name,
    email,
    artistName,
    genre,
    message,
    timestamp: Date.now()
  })).toString('base64');
  
  const scopes = 'user-read-private user-read-email user-top-read user-follow-read';
  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${SPOTIFY_CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=${encodeURIComponent(state)}`;
  
  res.redirect(authUrl);
});

// Spotify OAuth Callback
app.get('/api/spotify/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  if (error) {
    return res.redirect('/?error=spotify_auth_failed');
  }
  
  try {
    // Decode state to get application data
    const applicationData = JSON.parse(Buffer.from(state, 'base64').toString());
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return res.redirect('/?error=token_exchange_failed');
    }
    
    // Get user profile
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    const profile = await profileResponse.json();
    
    // Try to get artist data if they have an artist profile
    let artistData = null;
    let monthlyListeners = 'N/A';
    let followers = profile.followers?.total || 0;
    let topTracks = [];
    
    // Search for artist profile matching their name
    if (applicationData.artistName) {
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(applicationData.artistName)}&type=artist&limit=5`,
        { headers: { 'Authorization': `Bearer ${tokenData.access_token}` } }
      );
      const searchData = await searchResponse.json();
      
      if (searchData.artists?.items?.length > 0) {
        // Find best match
        artistData = searchData.artists.items.find(a => 
          a.name.toLowerCase() === applicationData.artistName.toLowerCase()
        ) || searchData.artists.items[0];
        
        if (artistData) {
          followers = artistData.followers?.total || followers;
          
          // Get top tracks
          const topTracksResponse = await fetch(
            `https://api.spotify.com/v1/artists/${artistData.id}/top-tracks?market=US`,
            { headers: { 'Authorization': `Bearer ${tokenData.access_token}` } }
          );
          const topTracksData = await topTracksResponse.json();
          topTracks = topTracksData.tracks?.slice(0, 5).map(t => ({
            name: t.name,
            popularity: t.popularity,
            previewUrl: t.preview_url
          })) || [];
        }
      }
    }
    
    // Get user's top tracks for additional context
    const userTopTracksResponse = await fetch(
      'https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=medium_term',
      { headers: { 'Authorization': `Bearer ${tokenData.access_token}` } }
    );
    const userTopTracks = await userTopTracksResponse.json();
    
    // Compile full application
    const fullApplication = {
      ...applicationData,
      spotifyProfile: {
        id: profile.id,
        displayName: profile.display_name,
        email: profile.email,
        country: profile.country,
        followers: followers,
        profileUrl: profile.external_urls?.spotify,
        images: profile.images
      },
      artistProfile: artistData ? {
        id: artistData.id,
        name: artistData.name,
        followers: artistData.followers?.total,
        popularity: artistData.popularity,
        genres: artistData.genres,
        spotifyUrl: artistData.external_urls?.spotify,
        images: artistData.images
      } : null,
      topTracks: topTracks,
      submittedAt: new Date().toISOString()
    };
    
    // Log the application (in production, save to database and send email)
    console.log('=== NEW PARTNER APPLICATION ===');
    console.log(JSON.stringify(fullApplication, null, 2));
    console.log('===============================');
    
    // Store for retrieval
    const applicationId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    pendingApplications.set(applicationId, fullApplication);
    
    // Redirect to success page with application details
    res.redirect(`/application-success.html?id=${applicationId}&name=${encodeURIComponent(applicationData.artistName || profile.display_name)}&followers=${followers}`);
    
  } catch (err) {
    console.error('Spotify callback error:', err);
    res.redirect('/?error=spotify_api_error');
  }
});

// Get application details
app.get('/api/application/:id', (req, res) => {
  const application = pendingApplications.get(req.params.id);
  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }
  res.json(application);
});

// Submit application without Spotify (fallback)
app.post('/api/partner-application', (req, res) => {
  const { name, email, artistName, spotifyUrl, genre, monthlyStreams, achievements, message } = req.body;
  
  const application = {
    name,
    email,
    artistName,
    spotifyUrl,
    genre,
    monthlyStreams,
    achievements,
    message,
    submittedAt: new Date().toISOString(),
    submissionType: 'manual'
  };
  
  console.log('=== MANUAL PARTNER APPLICATION ===');
  console.log(JSON.stringify(application, null, 2));
  console.log('==================================');
  
  const applicationId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  pendingApplications.set(applicationId, application);
  
  res.json({ 
    success: true, 
    applicationId,
    message: 'Your application has been submitted! Our A&R team will review your profile and reach out within 48 hours.' 
  });
});

// Admin verification endpoint
app.post('/api/admin/verify', requireOnesyncAdmin, (req, res) => {
  res.json({ success: true, message: 'Admin access verified.' });
});

// Protected admin routes - get all applications
app.get('/api/admin/applications', requireOnesyncAdmin, (req, res) => {
  const applications = Array.from(pendingApplications.entries()).map(([id, app]) => ({
    id,
    ...app
  }));
  res.json(applications);
});

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    // Check if file exists, otherwise serve index.html
    const filePath = path.join(__dirname, req.path);
    if (req.path !== '/' && require('fs').existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});