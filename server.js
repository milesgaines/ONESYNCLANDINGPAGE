const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// OneSync Recordings Partnership Application
app.post('/api/recordings-application', (req, res) => {
  const { name, email, artistName, genre, socialLinks, streamingNumbers, message } = req.body;
  
  // In production, this would send an email to info@onesync.music
  // For now, we'll log it and return success
  console.log('OneSync Recordings Application:', {
    name,
    email,
    artistName,
    genre,
    socialLinks,
    streamingNumbers,
    message,
    timestamp: new Date().toISOString()
  });
  
  // Here you would integrate with an email service like SendGrid, Mailgun, etc.
  // Example: sendEmail('info@onesync.music', 'New Recordings Application', applicationData);
  
  res.json({ 
    success: true, 
    message: 'Your application has been submitted successfully! Our team will review and contact you soon.' 
  });
});

// Partner Application (Top Tier Artists)
app.post('/api/partner-application', (req, res) => {
  const { name, email, artistName, label, monthlyStreams, achievements, requestedAdvance, message } = req.body;
  
  console.log('Partner Application (Top Tier):', {
    name,
    email,
    artistName,
    label,
    monthlyStreams,
    achievements,
    requestedAdvance,
    message,
    timestamp: new Date().toISOString()
  });
  
  res.json({ 
    success: true, 
    message: 'Your partner application has been submitted! Our A&R team will review your profile and reach out within 48 hours.' 
  });
});

// Admin verification endpoint
app.post('/api/admin/verify', requireOnesyncAdmin, (req, res) => {
  res.json({ success: true, message: 'Admin access verified.' });
});

// Protected admin routes
app.get('/api/admin/*', requireOnesyncAdmin, (req, res, next) => {
  next();
});

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});