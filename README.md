# CommonCentss — Agency Website

A high-converting, dark-themed marketing website for **CommonCentss**, a performance-driven client acquisition agency built exclusively for med spas, cosmetic clinics, and aesthetic practices.

**Predictable Leads. Booked Appointments. Scalable Growth.**

## Pages

| Page | Path |
|---|---|
| Home | `index.html` |
| Meta Ads Management | `services/meta-ads.html` |
| Landing Pages & Funnels | `services/landing-pages.html` |
| Ad Creative Development | `services/ad-creative.html` |
| CRM & Follow-Up Automation | `services/crm-automation.html` |
| Book a Call / Contact | `contact.html` |

## Features

- **Dark navy/black premium design** with electric blue & cyan accents, a slow-drifting aurora gradient background, and a cursor-following spotlight
- **Interactive hero** — particle network canvas that follows the cursor, plus a glassmorphism "client growth dashboard" with an animated chart and simulated real-time lead feed
- **Cinematic scroll journey** — stacked service cards that overlap and recede while scrolling, a horizontal scroll-linked process timeline, parallax image layers, staggered scroll-reveal transitions, and a scroll progress bar
- **3D interactions** — mouse-tracking tilt with light glare on the dashboard and media frames, 3D flip cards on service pages (tap-friendly on mobile)
- **Premium details** — magnetic buttons, odometer-style rolling number counters, shimmering gradient headlines, seamless trust marquee, and microinteractions on every clickable element
- **Conversion-focused** — repeated "Book a Free Strategy Call" CTAs, comparison table, real client results, testimonials, FAQ accordions, urgency badges (1 client/month)
- **Fast & accessible** — GPU-friendly transforms/opacity only, single rAF loop for scroll effects, mobile-first responsive with a full-screen menu, `prefers-reduced-motion` support, keyboard focus styles, content visible with JavaScript disabled

## Tech

Pure static **HTML + CSS + vanilla JavaScript** — no frameworks, no build step, no dependencies. Custom imagery lives in `assets/img/` as optimized WebP (all under 32 KB each).

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

The site is fully static, so it works out of the box on any host:

- **GitHub Pages** — Settings → Pages → deploy from branch (root)
- **Netlify / Vercel / Cloudflare Pages** — point at the repo, no build command, publish directory `/`

## Contact

- Email: [Kumar_g@commoncentss.com](mailto:Kumar_g@commoncentss.com)
- Phone: +1 (240) 477-0710
- Instagram: [@commoncentss.llc](https://www.instagram.com/commoncentss.llc)
