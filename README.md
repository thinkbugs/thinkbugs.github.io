# CallMind Official Site

Official product site for **CallMind — AI 电销智能体** for every sales team, published with GitHub Pages.

- Production: https://thinkbugs.github.io/
- Positioning: all-industry AI outbound agent (education, real estate, beauty, home improvement, auto, B2B), configurable per customer
- Stack: static HTML / CSS / vanilla JS (no build step)
- Pages: `index.html`, `privacy.html`, `404.html`

## Local preview

```bash
python -m http.server 4000
# open http://127.0.0.1:4000/
```

Or simply open `index.html` in a browser.

## Structure

```
assets/css/style.css   design system + responsive layout
assets/js/main.js      nav, scroll reveal, tabs, demo modal
assets/img/            brand logo, splash, OG image
```

## Editing

- Copy lives in `index.html`; keep claims factual and avoid customer data.
- Brand colors: blue `#2f6bff`, violet `#7c5cff`, cyan `#49d6ff`, ink `#0b1020`.
- Keep the site dependency-free for fast GitHub Pages delivery.
