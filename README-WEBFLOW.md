# OneSync Distribution - Webflow Upload Guide

## 🚀 Complete Manual Upload Instructions

Your OneSync website is ready to be uploaded to Webflow! This guide will walk you through the entire process.

---

## 📁 Files Created for You

1. **`webflow-custom-code.html`** - Complete CSS styles to paste into Webflow Head Code
2. **`webflow-body.html`** - HTML content to paste into Webflow HTML Embed
3. **`README-WEBFLOW.md`** - This comprehensive guide

---

## 🎯 Upload Process Overview

### Step 1: Prepare Your Webflow Project

**Option A: New Site (Recommended)**
1. Go to [webflow.com](https://webflow.com) and login
2. Create a new blank site
3. Choose a plan that supports custom code (Starter plan or higher)

**Option B: Existing Site**
1. Open your existing OneSync Webflow project
2. Create a new page or edit an existing one

### Step 2: Upload All Assets First ⚠️

**CRITICAL:** Upload these files to Webflow Assets panel BEFORE pasting HTML:

#### 🖼️ Images to Upload:
```
images/ONESYNC-LOGO-WHITE.PNG          (Main logo - used in navbar & hero)
images/icons8-arrow-3.svg              (Button arrow icon)
images/Beatport-White.png               (Logo carousel)
images/APPLE-MUSIC.png                  (Logo carousel)
images/SPOTI-WHITE.png                  (Logo carousel)  
images/allmusic-logo-66ECF95ADC-seeklogo.com.png (Logo carousel)
```

#### 🎥 Videos to Upload:
```
VIDS/Warm-Realism-8a24eb44.mp4         (3.2MB - Background video 1)
VIDS/text-to-video-8f7839b8.mp4        (1.4MB - Background video 2)  
VIDS/text-to-video-9bb42e9d.mp4        (9.9MB - Background video 3)
```

**How to Upload:**
1. In Webflow Designer → Assets panel (left sidebar)
2. Click "Upload" and select all files above
3. Wait for upload completion
4. **Copy each asset's Webflow URL** (you'll need these next)

### Step 3: Add Custom CSS

1. In Webflow Designer → Site Settings → Custom Code
2. Open `webflow-custom-code.html` 
3. Copy EVERYTHING inside the `<style>` tags
4. Paste into **Head Code** section
5. Save settings

### Step 4: Create the Page Structure

1. **Delete existing elements** from your page (if any)
2. **Add HTML Embed element:**
   - Drag "HTML Embed" from Elements panel
   - Set Width: `100vw` 
   - Set Height: `100vh`
   - Position: Fill entire page

### Step 5: Insert HTML Content

1. Open `webflow-body.html`
2. **IMPORTANT:** Update all image/video src paths first:

**Find and Replace Examples:**
```html
<!-- BEFORE (in webflow-body.html): -->
<img src="images/ONESYNC-LOGO-WHITE.PNG" alt="OneSync" class="navbar-logo">

<!-- AFTER (with your Webflow asset URL): -->
<img src="https://assets.website-files.com/[your-site-id]/[asset-id]/ONESYNC-LOGO-WHITE.png" alt="OneSync" class="navbar-logo">
```

3. Copy the updated HTML
4. Paste into the HTML Embed element
5. Save the embed

### Step 6: Publish Your Site

1. Click **Publish** button (top right)
2. Choose your domain or Webflow subdomain
3. Your site will be live!

---

## 🔗 Current Live Version

The site is also deployed on Heroku for reference:
**https://onesync-distribution-fae0d954e7bf.herokuapp.com/**

---

## ✅ Features Included

- ✅ Premium glassmorphism navigation bar
- ✅ Multi-video background system with smooth transitions  
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Infinite scrolling logo carousel
- ✅ Purple gradient button animations
- ✅ Professional hero section with tagline
- ✅ All links pointing to `app.onesync.music/auth/login`
- ✅ Contact links to `support@onesync.music`

---

## 🎨 Design Specifications

- **Colors:** Purple gradient theme (#8A2BE2 to #4B0082)
- **Fonts:** Inter, Montserrat fallbacks
- **Animations:** Smooth 0.3s transitions throughout
- **Video:** Dimmed to 30% opacity with 40% brightness
- **Mobile:** Fully responsive with optimized touch targets

---

## 🔧 Troubleshooting

**Videos not playing?**
- Webflow may compress videos during upload
- Original videos are optimized for web (H.264, web-friendly formats)
- Fallback gradient background will show if videos fail

**Styling looks different?**
- Ensure ALL CSS was copied from `webflow-custom-code.html` 
- Check that it was pasted in Head Code (not Footer Code)
- Webflow may have conflicting styles - use `!important` declarations

**Assets not loading?**
- Double-check all src paths are updated to Webflow asset URLs
- Ensure assets were fully uploaded before publishing

---

## 💡 Pro Tips

1. **Test locally first:** Use the HTML files to preview in a browser
2. **Backup your work:** Export your Webflow project before major changes  
3. **SEO Ready:** The HTML includes proper alt tags and semantic structure
4. **Performance:** Videos are web-optimized, but consider hosting large files on CDN for faster loading

---

## 🚨 Important Notes

- **Custom Code Requirement:** This requires a paid Webflow plan (Starter or higher)
- **Asset URLs:** Must update ALL src paths to use Webflow's asset URLs
- **Video Size:** The 9.9MB video may need compression if Webflow upload fails
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)

---

## 📞 Support

If you encounter issues during upload:
1. Check the Webflow console for JavaScript errors
2. Verify all assets uploaded successfully  
3. Test the current Heroku version for comparison
4. Contact Webflow support for platform-specific issues

**Current Status:** ✅ All files ready for Webflow upload