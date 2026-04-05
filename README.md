# Rashmi Bhaskara — Personal Portfolio

## Files
- `index.html` — main page
- `style.css` — all styles
- `animations.js` — animated pipeline diagrams
- `Resume.pdf` — (add your resume PDF here)

## Deploy to GitHub Pages (free, ~5 minutes)

### Step 1 — Create a GitHub account
Go to https://github.com and sign up if you don't have an account.

### Step 2 — Create a new repository
- Click the "+" icon → "New repository"
- Name it exactly: `yourusername.github.io` (replace with your GitHub username)
- Set it to **Public**
- Click "Create repository"

### Step 3 — Upload your files
- Click "uploading an existing file"
- Drag all 4 files into the upload area: `index.html`, `style.css`, `animations.js`, and your `Resume.pdf`
- Click "Commit changes"

### Step 4 — Enable GitHub Pages
- Go to your repo → Settings → Pages (left sidebar)
- Under "Source", select "Deploy from a branch"
- Branch: `main`, folder: `/ (root)`
- Click Save

### Step 5 — Visit your site
Wait ~2 minutes, then visit:
```
https://yourusername.github.io
```

## Customization tips

### Add a photo
Replace the "RB" avatar in `index.html`:
```html
<!-- Find this line: -->
<div class="avatar">RB</div>
<!-- Replace with: -->
<img src="photo.jpg" class="avatar" style="object-fit:cover;" alt="Rashmi Bhaskara" />
```
Then upload your photo to the repo.

### Add your Google Scholar / GitHub links
In `index.html`, find the `.hero-links` section and update the `href` attributes.

### Update the resume link
Make sure `Resume.pdf` is uploaded to the repo root, or change the link to point to your actual CV.

### Add more projects
Copy a `.project-card` block in `index.html` and fill in the details.

## Alternative hosting: Vercel (even simpler)
1. Go to https://vercel.com → sign up with GitHub
2. Click "Add New Project" → import your GitHub repo
3. Click Deploy — done. Your site gets a `yourname.vercel.app` URL instantly.
