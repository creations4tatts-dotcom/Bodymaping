# Bodymap 3D Viewer

This is a small static viewer that uses Google's `model-viewer` to display a GLB body model and interactive hotspots. Hotspots store simple metadata (label, pain, aftercare, heal time) in `localStorage` by default.

Files added
- `index.html` — main viewer and side panel
- `styles.css` — layout and styling
- `app.js` — hotspot logic, storage, UI wiring

How to run

1. From the project root run a simple static server. For example with Python 3:

```bash
python3 -m http.server 8000
```

2. Open http://localhost:8000 in your browser.

Notes and next steps
- The GLB is loaded from your Supabase public storage URL. No secret key is required for public objects.
- Do NOT embed your Supabase secret keys in client-side code. Use server-side functions or environment variables for private operations.
- Hotspot coordinates in `app.js` are approximate. Use the `model-viewer` inspector or trial-and-error to fine-tune `data-position` values.
- If you want to persist hotspot metadata to Supabase, create a server endpoint and authenticate with a service role key kept on the server. I can help scaffold that.

Security
- The secrets you pasted into your prompt must never be committed to a public repository. Rotate these keys immediately if they are real.
# Bodymaping
 tattoo pain body map
