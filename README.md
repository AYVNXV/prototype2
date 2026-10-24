# LuxeEstates — Real Estate Website

A complete static real estate website built with pure **HTML5, CSS3, and Vanilla JavaScript**. No backend required — 100% GitHub Pages ready.

---

## 📁 File Structure

```
real estate/
├── index.html          # Home page
├── about.html          # About page + Google Maps embed
├── services.html       # Services offered
├── projects.html       # All 20 property cards (auto-loaded from Google Sheets)
├── view_1.html         # Property 1 detail page
├── view_2.html         # Property 2 detail page
│   ...
├── view_20.html        # Property 20 detail page
├── 404.html            # Custom error page
├── style.css           # Global stylesheet
└── main.js             # Shared JavaScript (fetch, slider, navbar)
```

---

## ⚙️ Setup — Google Sheets Connection

### Step 1: Prepare Your Google Sheet

Your sheet must have these **exact columns** (Row 1 = headers, Rows 2–21 = your 20 properties):

| Col | Index | Content |
|-----|-------|---------|
| A | 0 | **ID** |
| B | 1 | **Title** |
| C | 2 | **Price** |
| D | 3 | **Location** |
| E | 4 | **Description** |
| F | 5 | **Image_url_1** |
| G | 6 | **Image_url_2** |
| H | 7 | **Image_url_3** |
| I | 8 | **Image_url_4** |
| J | 9 | **Image_url_5** |
| K | 10 | **Bedrooms** |
| L | 11 | **Furnished_status** |
| M | 12 | **Propert_Floors** |
| N | 13 | **Construction_year** |
| O | 14 | **Electricity&gass** |
| P | 15 | **Water_Supply** |
| Q | 16 | **Status** (`Available`, `Rented`, `Sold Out`) |

### Step 2: Publish the Sheet

1. Open your Google Sheet
2. **File → Share → Publish to web**
3. Select **Sheet 1** and format **Comma-separated values (.csv)**
4. Click **Publish** and copy the URL

### Step 3: Update main.js

Open `main.js` and replace line 4:

```js
// BEFORE:
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&id=YOUR_SHEET_ID';

// AFTER (use the URL you copied in Step 2):
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoP/pub?output=csv';
```

> ⚠️ **CORS Note**: Fetching from Google Sheets works on deployed sites (GitHub Pages). For local testing, open Chrome with `--disable-web-security` or use the VS Code Live Server extension.

---

## 🎨 Color Palette

| Role | Color |
|------|-------|
| Background | `#F8F6F0` — Soft luxury off-white |
| Primary | `#CA8A56` — Warm terracotta/tan |
| Secondary | `#2D4030` — Deep forest green |
| Text/Dark | `#1C1917` — Deep charcoal |

---

## 🚀 Deploy to GitHub Pages

1. Create a new GitHub repository
2. Upload all files in this folder to the repo root
3. Go to **Settings → Pages**
4. Set source to **main branch / root**
5. Your site is live at `https://yourusername.github.io/repo-name/`

> 💡 **CORS works perfectly** on GitHub Pages — fetch requests to Google Sheets are allowed.

---

## 📱 Features

- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Fixed navbar with scroll-triggered styling + mobile hamburger
- ✅ Auto-playing image slider with arrows, dots, swipe & keyboard support
- ✅ All property data fetched live from Google Sheets CSV
- ✅ WhatsApp inquiry button per property (auto-generates message)
- ✅ Smooth scroll animations (IntersectionObserver)
- ✅ Custom 404 page with "Made by AYYAN" credit
- ✅ Instagram, Facebook, TikTok social links in footer
- ✅ Google Maps embed on About page

---

## 📞 Contact / Social Links Update

To update social links, search for `href="https://instagram.com"`, `href="https://facebook.com"`, `href="https://tiktok.com"` in all HTML files and replace with your actual profile URLs.

To update the WhatsApp number, search for `923257927244` in `main.js` (fallback) and in `index.html`.

---

## 🔧 Customization

### Change business name/branding
Search and replace `LuxeEstates` across all HTML files.

### Change contact info
Update the footer in each HTML file (phone, email, address appear in `footer-contact-item` divs).

### Add more properties
The sheet currently supports rows 1–20 mapping to view_1.html–view_20.html. To add more, create additional `view_N.html` files following the same pattern, and update `fetchAllProjects()` in `main.js` to process more than 20 rows.

---

*Built with ❤️ · Static & Fast · GitHub Pages Ready*
