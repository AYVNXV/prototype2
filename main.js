/* =============================================
   main.js — Shared JS with Fast Caching & Robust Google Sheet Integration
   ============================================= */

// ── Google Sheets CSV URL ──────────────────────
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQi_3M1nblxrYDB7MJk3FlKxGywTajvOITcLOGQOO6fmUqMPwb2z4HixkA2D2WElSPdIVzS5zeRCBce/pub?output=csv';
const CSV_CACHE_KEY = 'luxe_estates_csv_cache';

// ── Fallback data for offline / file:// protocol previews ──
const PROPERTY_1_FALLBACK = {
  id: "1",
  title: "Luxury Wila",
  price: "100k",
  location: "Sialkot",
  description: "3 Bed modern villa with lawn",
  images: [
    "https://i.postimg.cc/x8dTXP0X/360-F-660695767-a-Oa44h-O1go-QYAQ0Fv8k-Dgn-Nu-HGyo-C2D4.webp",
    "https://i.postimg.cc/Y0Sqvxph/free-photo-of-modern-house-on-hill-with-cloudy-sky-in-azerbaijan.webp",
    "https://i.postimg.cc/D0zySc24/house-roof-roofing-business-photo.webp",
    "https://i.postimg.cc/d30th9qC/house-with-lit-up-window-dark-background-188544-7705.webp",
    "https://i.postimg.cc/NF0fKxgr/love-new-house-and-family-in-their-backyard-together-looking-at-their-property-or-luxury-real.webp"
  ],
  bedrooms: "5",
  furnished: "unfurnished",
  floors: "3Floors",
  year: "2026",
  utility: "Commercial Meter, Gas Available, Solar Installed",
  water: "Goverment Supply",
  status: "Available"
};

const PROPERTY_2_FALLBACK = {
  id: "2",
  title: "Luxury House",
  price: "200k",
  location: "Lahore",
  description: "A house With Full Of Love",
  images: [
    "https://i.postimg.cc/ZqC8dXcK/360-F-837239185-Fq-LFXU2Dv2a-Yxy-HO5a-S3cl3vjfbrfq-NL.webp",
    "https://i.postimg.cc/LswzBvCK/3-rear-facade.webp",
    "https://i.postimg.cc/YSZ1f8nq/4048.webp",
    "https://i.postimg.cc/Pq9mzK3f/modern-farm-house-tim-cuppett-architects-img-5db1faaa025fdefb-7701-1-63d5ac4-w550-h550-b0-p0.webp",
    "https://i.postimg.cc/HLRQ43ZY/modern-luxury-house-and-garden-photo.webp"
  ],
  bedrooms: "2",
  furnished: "Furnished",
  floors: "2Floors",
  year: "2025",
  utility: "Commercial Meter, Gas Available, Solar Installed",
  water: "Borehole Water",
  status: "Sold Out"
};

const PROPERTY_3_FALLBACK = {
  id: "3",
  title: "Executive Residence",
  price: "150k",
  location: "Islamabad",
  description: "3 Bed luxury penthouse with panoramic city views",
  images: [
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80"
  ],
  bedrooms: "3",
  furnished: "Furnished",
  floors: "1Floor",
  year: "2024",
  utility: "Commercial Meter, Gas Available",
  water: "Goverment Supply",
  status: "Rented"
};

// ── Cache Helpers (Stale-While-Revalidate for 0ms load) ──────
function getCachedCSV() {
  try {
    return localStorage.getItem(CSV_CACHE_KEY);
  } catch (e) {
    return null;
  }
}

function setCachedCSV(csvText) {
  try {
    if (csvText && csvText.trim()) {
      localStorage.setItem(CSV_CACHE_KEY, csvText);
    }
  } catch (e) {
    // quota exceeded or privacy mode, safe to ignore
  }
}

// ── Navbar scroll behavior ─────────────────────
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const update = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ── Mobile navigation ──────────────────────────
(function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn  = document.querySelector('.mobile-nav-close');
  if (!hamburger || !mobileNav) return;

  const open = () => {
    hamburger.classList.add('open');
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// ── Active nav link highlight ──────────────────
(function setActiveNavLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ── Intersection Observer fade-in ──────────────
(function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

// ── CSV Row Parser (handles quoted fields & commas) ──────
function parseCSVRow(line) {
  if (!line) return [];
  const result = [];
  let current  = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ── Image Slider ───────────────────────────────
function initSlider(imageUrls) {
  const track         = document.getElementById('sliderTrack');
  const dotsContainer = document.getElementById('sliderDots');
  const counter       = document.getElementById('sliderCounter');
  if (!track) return;

  // Keep only valid HTTP URLs
  const images = (imageUrls || []).filter(url => url && typeof url === 'string' && url.trim().startsWith('http'));

  if (images.length === 0) {
    track.innerHTML = '<div class="slide" style="display:flex;align-items:center;justify-content:center;background:#2d4030;color:rgba(255,255,255,0.7);font-size:1rem;height:100%;min-height:300px;">No images available</div>';
    if (counter) counter.textContent = '0 / 0';
    if (dotsContainer) dotsContainer.innerHTML = '';
    return;
  }

  let currentIndex = 0;
  let autoplayTimer = null;

  // Build slides
  track.innerHTML = images.map((url, i) => `
    <div class="slide" aria-label="Image ${i + 1}">
      <img src="${url.trim()}"
           alt="Property image ${i + 1}"
           loading="${i === 0 ? 'eager' : 'lazy'}"
           onerror="this.parentElement.style.background='linear-gradient(135deg,#2D4030,#1a2a1d)';this.style.display='none'">
    </div>
  `).join('');

  // Build dots
  if (dotsContainer) {
    dotsContainer.innerHTML = images.map((_, i) => `
      <button class="slider-dot ${i === 0 ? 'active' : ''}" aria-label="Go to image ${i + 1}"></button>
    `).join('');
    dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });
  }

  function updateUI() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    if (counter) counter.textContent = `${currentIndex + 1} / ${images.length}`;
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }
  }

  function goTo(index) {
    currentIndex = (index + images.length) % images.length;
    updateUI();
    resetAutoplay();
  }

  function goNext() { goTo(currentIndex + 1); }
  function goPrev() { goTo(currentIndex - 1); }

  function startAutoplay() { autoplayTimer = setInterval(goNext, 4500); }
  function resetAutoplay()  { clearInterval(autoplayTimer); startAutoplay(); }

  // Arrow buttons
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  if (prevBtn) prevBtn.onclick = goPrev;
  if (nextBtn) nextBtn.onclick = goNext;

  // Touch / swipe support
  let touchStartX = 0;
  const sliderWrap = track.closest('.slider-wrap');
  if (sliderWrap) {
    sliderWrap.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    sliderWrap.addEventListener('touchend', e => {
      const delta = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(delta) > 40) delta > 0 ? goNext() : goPrev();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goPrev();
    if (e.key === 'ArrowRight') goNext();
  });

  updateUI();
  startAutoplay();
}

// ── Normalize status badge text & CSS class ────
function normalizeStatus(raw) {
  const str = (raw || '').trim();
  const lower = str.toLowerCase();

  if (lower.includes('sold')) {
    return { label: 'Sold Out', className: 'sold' };
  }
  if (lower.includes('rent') || lower.includes('lease')) {
    const label = lower.includes('for rent') ? 'For Rent' : 'Rented';
    return { label: label, className: 'rented' };
  }
  if (lower.includes('avail') || !lower) {
    return { label: 'Available', className: 'available' };
  }
  return { label: str, className: 'available' };
}

// ── Cache-busting URL helper ───────────────────
function getLiveSheetUrl() {
  return `${GOOGLE_SHEET_CSV_URL}&_nocache=${Date.now()}`;
}

// ── Map raw CSV row to property object ─────────
function parsePropertyFromRow(rawRow) {
  if (!rawRow || !rawRow.trim()) return null;
  const rowData = parseCSVRow(rawRow);
  const title = rowData[1];
  if (!title || !title.trim()) return null;

  return {
    id:          rowData[0]  || '',
    title:       title.trim(),
    price:       rowData[2]  || 'Price on Request',
    location:    rowData[3]  || 'Location TBD',
    description: rowData[4]  || 'No description available.',
    images:      [rowData[5], rowData[6], rowData[7], rowData[8], rowData[9]].filter(Boolean),
    bedrooms:    rowData[10] || '—',
    furnished:   rowData[11] || '—',
    floors:      rowData[12] || '—',
    year:        rowData[13] || '—',
    utility:     rowData[14] || '—',
    water:       rowData[15] || '—',
    status:      rowData[16] || 'Available'
  };
}

// ── Render property details into DOM ───────────
function renderPropertyDetails(data, rowIndex) {
  const loadingEl = document.getElementById('detailLoading');
  const contentEl = document.getElementById('detailContent');

  document.title = `${data.title} — LuxeEstates`;

  setEl('detailTitle',       data.title || 'Property Details');
  setEl('detailPrice',       data.price || 'Price on Request');
  setEl('detailLocation',    data.location || 'Location TBD');
  setEl('detailDescription', data.description || 'No description available for this property.');

  // Extra Meta Details
  setEl('detailBedrooms',  data.bedrooms  || '—');
  setEl('detailFurnished', data.furnished || '—');
  setEl('detailFloors',    data.floors    || '—');
  setEl('detailYear',      data.year      || '—');
  setEl('detailUtility',   data.utility   || '—');
  setEl('detailWater',     data.water     || '—');

  // Status badge — exact status from Google Sheets
  const statusEl = document.getElementById('detailStatus');
  if (statusEl) {
    const statusObj = normalizeStatus(data.status);
    statusEl.textContent = statusObj.label;
    statusEl.className   = 'detail-status ' + statusObj.className;
    statusEl.style.display = 'inline-flex';
  }

  // WhatsApp inquiry button
  const waBtn = document.getElementById('whatsappBtn');
  if (waBtn) {
    const msg = encodeURIComponent(`Hi LuxeEstates! I'm interested in "${data.title}" (${data.price}) in ${data.location}. Please share more details.`);
    waBtn.href = `https://wa.me/923257927244?text=${msg}`;
  }

  // Launch image slider
  initSlider(data.images);

  // Reveal content immediately
  if (loadingEl) loadingEl.style.display = 'none';
  if (contentEl) {
    contentEl.style.display = 'grid';
    contentEl.style.opacity = '1';
  }
}

// ── Render "Coming Soon" for unpopulated rows ─
function renderPropertyComingSoon(rowIndex) {
  const loadingEl = document.getElementById('detailLoading');
  const contentEl = document.getElementById('detailContent');

  if (loadingEl) loadingEl.style.display = 'none';
  if (contentEl) {
    contentEl.style.display = 'block';
    contentEl.style.opacity = '1';
    contentEl.innerHTML = `
      <div style="text-align:center;padding:5rem 1rem;max-width:620px;margin:0 auto;">
        <div style="font-size:3.5rem;margin-bottom:1rem;">🏗️</div>
        <span class="detail-status" style="background:rgba(202,138,86,0.15);color:var(--primary);margin-bottom:1rem;display:inline-block;padding:0.4rem 1.2rem;border-radius:50px;font-weight:600;font-size:0.85rem;">Listing In Progress</span>
        <h2 style="margin:1rem 0 0.5rem;font-family:var(--font-main);font-size:2rem;color:var(--dark);">Property #${rowIndex + 1} Coming Soon</h2>
        <p style="color:var(--light-text);line-height:1.8;margin-bottom:2rem;font-size:1rem;">
          The complete details and imagery for this property listing are currently being prepared. Check back shortly or explore our active portfolio.
        </p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
          <a href="projects.html" class="btn btn-primary">← View Available Properties</a>
          <a href="https://wa.me/923257927244?text=Hi%20LuxeEstates!%20I%20am%20inquiring%20about%20Property%20%23${rowIndex + 1}" class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">Inquire on WhatsApp</a>
        </div>
      </div>
    `;
  }
}

// ── Fetch single property row (view_1 → view_20) ─
function fetchPropertyRow(rowIndex) {
  let renderedFromCache = false;

  // Step 1: Instant Cache Display (0ms Perception)
  const cachedCSV = getCachedCSV();
  if (cachedCSV) {
    try {
      const rows = cachedCSV.split('\n').slice(1);
      const cachedRow = rows[rowIndex];
      if (cachedRow && cachedRow.trim()) {
        const prop = parsePropertyFromRow(cachedRow);
        if (prop) {
          renderPropertyDetails(prop, rowIndex);
          renderedFromCache = true;
        } else {
          renderPropertyComingSoon(rowIndex);
          renderedFromCache = true;
        }
      } else if (rows[rowIndex] !== undefined) {
        renderPropertyComingSoon(rowIndex);
        renderedFromCache = true;
      }
    } catch (e) {
      console.warn('Cache render error:', e);
    }
  }

  // Step 2: Background Live Network Fetch
  fetch(getLiveSheetUrl(), {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
  })
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.text();
    })
    .then(csvText => {
      setCachedCSV(csvText);

      const rows   = csvText.split('\n').slice(1); // skip header
      const rawRow = rows[rowIndex];

      // If row does not exist or has empty title
      if (!rawRow || !rawRow.trim()) {
        renderPropertyComingSoon(rowIndex);
        return;
      }

      const prop = parsePropertyFromRow(rawRow);
      if (!prop) {
        renderPropertyComingSoon(rowIndex);
        return;
      }

      renderPropertyDetails(prop, rowIndex);
    })
    .catch(err => {
      console.warn('Live fetch failed, checking fallbacks:', err);
      if (!renderedFromCache) {
        if (rowIndex === 0) {
          renderPropertyDetails(PROPERTY_1_FALLBACK, 0);
        } else if (rowIndex === 1) {
          renderPropertyDetails(PROPERTY_2_FALLBACK, 1);
        } else if (rowIndex === 2) {
          renderPropertyDetails(PROPERTY_3_FALLBACK, 2);
        } else {
          renderPropertyComingSoon(rowIndex);
        }
      }
    });
}

// ── Render project cards HTML into grid ────────
function renderProjectCards(csvText) {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const rows = csvText.split('\n').slice(1); // skip header row
  const cardsHtml = [];

  rows.slice(0, 20).forEach((rawRow, index) => {
    // Skip blank rows
    if (!rawRow || !rawRow.trim()) return;

    const rowData = parseCSVRow(rawRow);
    const title   = rowData[1];

    // Ignore completely empty rows where Title (index 1) is empty
    if (!title || title.trim() === '') return;

    const price       = rowData[2]  || 'Price on Request';
    const location    = rowData[3]  || '—';
    const description = rowData[4]  || '';
    const image       = rowData[5]  || '';
    const statusObj   = normalizeStatus(rowData[16]);
    const viewPage    = `view_${index + 1}.html`;

    // Category deduction
    const descLower  = (description + ' ' + title).toLowerCase();
    let category = 'residential';
    if (
      descLower.includes('commercial') || descLower.includes('office') ||
      descLower.includes('shop')       || descLower.includes('plaza')
    ) {
      category = 'commercial';
    } else if (
      descLower.includes('plot') || descLower.includes('land')
    ) {
      category = 'plot';
    }

    cardsHtml.push(`
      <div class="property-card fade-in" data-category="${category}" data-status="${statusObj.className}">
        <div class="card-img-wrap">
          ${image
            ? `<img src="${image}" alt="${title}" loading="lazy"
                    onerror="this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80'">`
            : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#2D4030,#1a2a1d);
                          display:flex;align-items:center;justify-content:center;
                          color:rgba(255,255,255,0.4);font-size:2.5rem;">🏠</div>`}
          <span class="card-badge ${statusObj.className}">${statusObj.label}</span>
        </div>
        <div class="card-body">
          <h3>${title}</h3>
          <div class="card-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ${location}
          </div>
          ${description ? `<p class="card-desc">${description}</p>` : ''}
          <div class="card-price">${price}</div>
          <div class="card-footer">
            <a href="${viewPage}" class="btn btn-primary"
               style="font-size:0.85rem;padding:0.6rem 1.4rem;">View Details →</a>
            <span style="font-size:0.78rem;color:var(--light-text);">
              #${String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    `);
  });

  if (cardsHtml.length > 0) {
    grid.innerHTML = cardsHtml.join('');
  } else {
    grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:3rem;color:var(--light-text);">No properties listed yet.</p>';
  }

  setupFilterButtons();
  setupObserver();
}

// ── Fetch all 20 projects (projects.html) ──────
function fetchAllProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  // Step 1: Fast Instant Cache Render (0ms Perception)
  let renderedFromCache = false;
  const cachedCSV = getCachedCSV();
  if (cachedCSV) {
    try {
      renderProjectCards(cachedCSV);
      renderedFromCache = true;
    } catch (e) {
      console.warn('Cache card render failed:', e);
    }
  }

  // If no cache, show spinner until fetch resolves
  if (!renderedFromCache) {
    grid.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading properties…</p>
      </div>
    `;
  }

  // Step 2: Background Network Fetch
  fetch(getLiveSheetUrl(), {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
  })
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.text();
    })
    .then(csvText => {
      setCachedCSV(csvText);
      renderProjectCards(csvText);
    })
    .catch(err => {
      console.warn('fetchAllProjects live fetch failed, using fallback preview:', err);
      if (!renderedFromCache) {
        const fallback1Status = normalizeStatus(PROPERTY_1_FALLBACK.status);
        const fallback2Status = normalizeStatus(PROPERTY_2_FALLBACK.status);
        const fallback3Status = normalizeStatus(PROPERTY_3_FALLBACK.status);
        grid.innerHTML = `
          <div class="property-card fade-in" data-category="residential" data-status="${fallback1Status.className}">
            <div class="card-img-wrap">
              <img src="${PROPERTY_1_FALLBACK.images[0]}" alt="${PROPERTY_1_FALLBACK.title}" loading="lazy">
              <span class="card-badge ${fallback1Status.className}">${fallback1Status.label}</span>
            </div>
            <div class="card-body">
              <h3>${PROPERTY_1_FALLBACK.title}</h3>
              <div class="card-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${PROPERTY_1_FALLBACK.location}
              </div>
              <p class="card-desc">${PROPERTY_1_FALLBACK.description}</p>
              <div class="card-price">${PROPERTY_1_FALLBACK.price}</div>
              <div class="card-footer">
                <a href="view_1.html" class="btn btn-primary" style="font-size:0.85rem;padding:0.6rem 1.4rem;">View Details →</a>
                <span style="font-size:0.78rem;color:var(--light-text);">#01</span>
              </div>
            </div>
          </div>
          <div class="property-card fade-in" data-category="residential" data-status="${fallback2Status.className}">
            <div class="card-img-wrap">
              <img src="${PROPERTY_2_FALLBACK.images[0]}" alt="${PROPERTY_2_FALLBACK.title}" loading="lazy">
              <span class="card-badge ${fallback2Status.className}">${fallback2Status.label}</span>
            </div>
            <div class="card-body">
              <h3>${PROPERTY_2_FALLBACK.title}</h3>
              <div class="card-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${PROPERTY_2_FALLBACK.location}
              </div>
              <p class="card-desc">${PROPERTY_2_FALLBACK.description}</p>
              <div class="card-price">${PROPERTY_2_FALLBACK.price}</div>
              <div class="card-footer">
                <a href="view_2.html" class="btn btn-primary" style="font-size:0.85rem;padding:0.6rem 1.4rem;">View Details →</a>
                <span style="font-size:0.78rem;color:var(--light-text);">#02</span>
              </div>
            </div>
          </div>
          <div class="property-card fade-in" data-category="residential" data-status="${fallback3Status.className}">
            <div class="card-img-wrap">
              <img src="${PROPERTY_3_FALLBACK.images[0]}" alt="${PROPERTY_3_FALLBACK.title}" loading="lazy">
              <span class="card-badge ${fallback3Status.className}">${fallback3Status.label}</span>
            </div>
            <div class="card-body">
              <h3>${PROPERTY_3_FALLBACK.title}</h3>
              <div class="card-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${PROPERTY_3_FALLBACK.location}
              </div>
              <p class="card-desc">${PROPERTY_3_FALLBACK.description}</p>
              <div class="card-price">${PROPERTY_3_FALLBACK.price}</div>
              <div class="card-footer">
                <a href="view_3.html" class="btn btn-primary" style="font-size:0.85rem;padding:0.6rem 1.4rem;">View Details →</a>
                <span style="font-size:0.78rem;color:var(--light-text);">#03</span>
              </div>
            </div>
          </div>
        `;
        setupFilterButtons();
        setupObserver();
      }
    });
}

// ── Setup filter buttons ───────────────────────
function setupFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      document.querySelectorAll('#projectsGrid .property-card').forEach(card => {
        const cat = card.getAttribute('data-category');
        const status = card.getAttribute('data-status');
        const show = filter === 'all' ||
                     cat === filter ||
                     (filter === 'plots' && cat === 'plot') ||
                     status === filter;
        card.style.display = show ? '' : 'none';
      });
    };
  });
}

// ── Setup fade-in observer ─────────────────────
function setupObserver() {
  if (typeof IntersectionObserver !== 'undefined') {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('#projectsGrid .fade-in').forEach(el => obs.observe(el));
  }
}

// ── Helper: safely set element text ───────────
function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
