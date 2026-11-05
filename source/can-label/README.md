# Can label source

`label.html` lays out the full 360° label of the Soully can (2400 × 1369 units,
seam on the can's right side, front at x = 1800, back panel at x = 600).
Render it at 1.7× (4080 × 2327 px) and save as `assets/soully-label.webp`:

    npx playwright screenshot --viewport-size=2400,1369 --device-scale-factor=1.7 label.html label.png

- `wordmark_clean.png`: front wordmark, traced from the product renders.
- `backpanel.png`: back panel (description, nutrition facts, barcode), unwrapped from the back render.
- Stripes, the "Lemon Matcha" band and the Swiss flag are drawn in the HTML.
