const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Admin email for partner applications
const ADMIN_EMAIL = 'info@onesync.music';

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, company, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, and message are required.'
    });
  }

  // Log contact form submission
  console.log('=== NEW CONTACT FORM ===');
  console.log({ name, email, company, message, submittedAt: new Date().toISOString() });
  console.log('========================');

  return res.json({ success: true, message: 'Thanks! Your message has been sent.' });
});

// Spotify API Configuration
const SPOTIFY_CLIENT_ID = '474879af111c44ec8f835be52ac8ef01';
const SPOTIFY_CLIENT_SECRET = '43bf4784ce07415293d751f451b5e21a';
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'https://onesync.music/api/spotify/callback';

// Store pending applications temporarily (in production, use a database)
const pendingApplications = new Map();

// Spotify access token cache (for client credentials flow)
let spotifyAccessToken = null;
let spotifyTokenExpiry = 0;

// Get Spotify access token using client credentials
async function getSpotifyAccessToken() {
  if (spotifyAccessToken && Date.now() < spotifyTokenExpiry) {
    return spotifyAccessToken;
  }
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });
  
  const data = await response.json();
  spotifyAccessToken = data.access_token;
  spotifyTokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early
  return spotifyAccessToken;
}

// SEO: Serve robots.txt and sitemap.xml with correct content types
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

// SEO: Add security and cache headers that improve Google ranking signals
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Serve static files from the current directory
app.use(express.static('.', {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

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

// Spotify Artist Search (public - uses client credentials)
app.get('/api/spotify/search', async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.json({ artists: [] });
  }
  
  try {
    const token = await getSpotifyAccessToken();
    
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=artist&limit=10`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    const searchData = await searchResponse.json();
    
    if (!searchData.artists?.items) {
      return res.json({ artists: [] });
    }
    
    const artists = searchData.artists.items.map(artist => ({
      id: artist.id,
      name: artist.name,
      followers: artist.followers?.total || 0,
      popularity: artist.popularity || 0,
      genres: artist.genres || [],
      image: artist.images?.[0]?.url || null,
      url: artist.external_urls?.spotify
    }));
    
    res.json({ artists });
    
  } catch (err) {
    console.error('Spotify search error:', err);
    res.status(500).json({ error: 'Failed to search Spotify' });
  }
});

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
app.post('/api/partner-application', async (req, res) => {
  const { 
    name, 
    email, 
    genre, 
    message,
    spotifyArtistId,
    spotifyArtistName,
    spotifyFollowers,
    spotifyPopularity,
    spotifyUrl
  } = req.body;
  
  const application = {
    name,
    email,
    artistName: spotifyArtistName || 'Not provided',
    genre,
    message,
    spotifyProfile: spotifyArtistId ? {
      artistId: spotifyArtistId,
      artistName: spotifyArtistName,
      followers: parseInt(spotifyFollowers) || 0,
      popularity: parseInt(spotifyPopularity) || 0,
      spotifyUrl: spotifyUrl
    } : null,
    submittedAt: new Date().toISOString(),
    submissionType: spotifyArtistId ? 'spotify-search' : 'manual'
  };
  
  console.log('=== NEW PARTNER APPLICATION ===');
  console.log(JSON.stringify(application, null, 2));
  console.log('===============================');
  
  const applicationId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  pendingApplications.set(applicationId, application);
  
  // Send admin notification email
  const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 30px; border-radius: 10px;">
      <h1 style="color: #667eea; margin-bottom: 20px;">𝄞 New Partner Application</h1>
      <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #fff; margin-top: 0;">Applicant Details</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #667eea;">${email}</a></p>
        <p><strong>Genre:</strong> ${genre || 'Not specified'}</p>
        <p><strong>Message:</strong> ${message || 'No message provided'}</p>
      </div>
      ${spotifyArtistId ? `
      <div style="background: #1DB954; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #fff; margin-top: 0;">🎧 Spotify Profile</h2>
        <p><strong>Artist Name:</strong> ${spotifyArtistName}</p>
        <p><strong>Followers:</strong> ${parseInt(spotifyFollowers).toLocaleString()}</p>
        <p><strong>Popularity Score:</strong> ${spotifyPopularity}%</p>
        <p><a href="${spotifyUrl}" style="color: #fff; text-decoration: underline;">View on Spotify →</a></p>
      </div>
      ` : '<p style="color: #f87171;">⚠️ No Spotify profile linked</p>'}
      <div style="background: #333; padding: 15px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #888;">Application ID: ${applicationId}</p>
        <p style="margin: 5px 0 0; color: #888;">Submitted: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
  
  // Email is sent client-side via mailto: link
  
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