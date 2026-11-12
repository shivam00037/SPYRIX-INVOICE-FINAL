# Invoice Template Studio

- `TemplatesPage.jsx` mounts the independent `TemplateStudio.jsx` interface.
- `TemplateStudio.css` owns the gallery and customizer styling.
- Twenty designs are listed in `../Invoices/invoiceDesign.js` and printed through the invoice output renderer.
- Custom settings include accent colour, font, business identity, logo, QR, signature, UPI/payment instructions and footer text.
- Default settings can be cached locally and are saved to `Business.invoiceDesign` in MongoDB for authenticated Owner/Admin users.
- Each invoice records its selected template and design settings so future default changes do not change already saved invoices.

- `page.config.js` — this page folder’s JavaScript configuration (page identity, route or copy settings).
