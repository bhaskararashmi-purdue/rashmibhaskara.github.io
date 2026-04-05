# rashmibhaskara.github.io

Personal academic portfolio for Rashmi Bhaskara — Ph.D. Candidate in Medical Physics at Purdue University.

Live at: **https://rashmibhaskara.github.io**

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main portfolio page |
| `style.css` | All styles |
| `animations.js` | Animated pipeline diagrams (CBCT→CT, TME framework) |
| `Resume.pdf` | CV — upload this manually to the repo |

## How to update content

### Update your bio or links
Open `index.html` and find the `.hero` section near the top. Edit the text directly.

### Add a photo
Upload your photo to the repo as `photo.jpg`, then in `index.html` replace:
```html
<div class="avatar">RB</div>
```
with:
```html
<img src="photo.jpg" class="avatar" style="object-fit:cover;" alt="Rashmi Bhaskara" />
```

### Add a new project card
In `index.html`, find the `.project-grid` section and copy-paste a `.project-card` block:
```html
<div class="project-card">
  <span class="badge badge-blue">Status</span>
  <h3>Project title</h3>
  <p>Short description.</p>
  <div class="card-tags"><span>Tool 1</span><span>Tool 2</span></div>
</div>
```
Badge options: `badge-warn` (amber), `badge-blue` (blue), `badge-med` (teal), `badge-green` (green).

### Add a publication
In `index.html`, find the `.pub-list` section and add:
```html
<div class="pub">
  <div class="pub-year">2026</div>
  <div class="pub-body">
    <div class="pub-title">Paper title here</div>
    <div class="pub-venue">Journal or Conference</div>
    <div class="pub-authors">Author 1 &amp; Author 2</div>
    <a href="https://doi.org/..." target="_blank" class="pub-doi">DOI: ... ↗</a>
  </div>
</div>
```

### Update Google Scholar / GitHub links
In `index.html`, find the `.hero-links` section:
```html
<a href="https://github.com/bhaskararashmi-purdue" target="_blank" class="pill">GitHub</a>
<a href="https://scholar.google.com/citations?user=YOURID" target="_blank" class="pill">Google Scholar</a>
```

## Deploying changes

After editing any file on GitHub's web editor, scroll down and click **"Commit changes"**. The site rebuilds automatically within ~1 minute.

## Tech stack

Plain HTML, CSS, and vanilla JavaScript — no frameworks, no build step.
