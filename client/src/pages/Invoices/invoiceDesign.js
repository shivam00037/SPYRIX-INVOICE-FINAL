export const invoiceTemplates = [
  { id: 'xenmark', name: 'Xenmark Reference', category: 'Manufacturing', description: 'Reference-matched manufacturing invoice with uploadable logo, payment QR and signature.', color: '#85172d', font: 'Arial', layout: 'xenmark' },
  { id: 'executive', name: 'Executive Red', category: 'Corporate', description: 'Confident red header with executive-style totals and signature block.', color: '#b3132b', font: 'Inter', layout: 'executive' },
  { id: 'classic', name: 'Classic Business', category: 'Classic', description: 'Traditional invoice layout with a clean title band and table.', color: '#bd1e31', font: 'Arial', layout: 'classic' },
  { id: 'minimal', name: 'Minimal White', category: 'Minimal', description: 'Lots of whitespace, light rules and understated typography.', color: '#3b4655', font: 'Inter', layout: 'minimal' },
  { id: 'corporate', name: 'Corporate Ledger', category: 'Corporate', description: 'Organised company blocks and a formal financial summary.', color: '#26364a', font: 'Arial', layout: 'corporate' },
  { id: 'modern', name: 'Modern Edge', category: 'Modern', description: 'Angled color panels, bold hierarchy and modern totals.', color: '#e33442', font: 'Poppins', layout: 'modern' },
  { id: 'elegant', name: 'Elegant Serif', category: 'Luxury', description: 'Refined serif typography, delicate dividers and spacious blocks.', color: '#7e2638', font: 'Georgia', layout: 'elegant' },
  { id: 'gst', name: 'GST Detailed', category: 'Tax', description: 'Tax-friendly item rows with GSTIN and tax summary emphasis.', color: '#9a2031', font: 'Arial', layout: 'gst' },
  { id: 'retail', name: 'Retail Counter', category: 'Retail', description: 'Compact sales invoice with clear quantities and payment status.', color: '#bc2438', font: 'Tahoma', layout: 'retail' },
  { id: 'service', name: 'Service Pro', category: 'Services', description: 'Service description first, with project and customer references.', color: '#354d69', font: 'Inter', layout: 'service' },
  { id: 'freelancer', name: 'Freelancer', category: 'Freelance', description: 'Personal brand, clean client information and simple fee breakdown.', color: '#6540a2', font: 'Poppins', layout: 'freelancer' },
  { id: 'creative', name: 'Creative Studio', category: 'Creative', description: 'Color-forward design with a large visual heading and modern table.', color: '#d44d38', font: 'Poppins', layout: 'creative' },
  { id: 'international', name: 'International', category: 'Global', description: 'Neutral international layout with currency and reference fields.', color: '#1e5268', font: 'Arial', layout: 'international' },
  { id: 'luxury', name: 'Luxury Black', category: 'Luxury', description: 'Dark header, warm metallic accent and premium spacing.', color: '#22242a', font: 'Georgia', layout: 'luxury' },
  { id: 'navy', name: 'Navy Ledger', category: 'Corporate', description: 'Deep navy title band with structured finance columns.', color: '#183b64', font: 'Arial', layout: 'navy' },
  { id: 'green', name: 'Emerald Accounts', category: 'Finance', description: 'Fresh green accents, balanced details and payment information.', color: '#167653', font: 'Inter', layout: 'green' },
  { id: 'tech', name: 'Tech Grid', category: 'Modern', description: 'Crisp grid, monospaced invoice code and technical information layout.', color: '#374151', font: 'Consolas', layout: 'tech' },
  { id: 'mono', name: 'Monochrome', category: 'Minimal', description: 'Pure black and white with high-contrast headings.', color: '#191919', font: 'Arial', layout: 'mono' },
  { id: 'compact', name: 'Compact A5', category: 'Compact', description: 'Space-efficient invoice designed for shorter printouts.', color: '#9d2436', font: 'Tahoma', layout: 'compact' },
  { id: 'bold', name: 'Bold Commerce', category: 'Commerce', description: 'Large total strip, high-visibility metadata and strong table header.', color: '#b81428', font: 'Inter', layout: 'bold' },
];

// Visual presets keep the thumbnail, live canvas and exported invoice style aligned.
export const invoiceTemplateStylePresets = {
  xenmark: { headerStyle: 'line', tableStyle: 'clean', frameStyle: 'thin', tableDensity: 'normal', paperBackground: '#ffffff' },
  executive: { headerStyle: 'band', tableStyle: 'striped', frameStyle: 'thin', tableDensity: 'normal', headingAlignment: 'right' },
  classic: { headerStyle: 'line', tableStyle: 'clean', frameStyle: 'thin', tableDensity: 'normal' },
  minimal: { headerStyle: 'minimal', tableStyle: 'minimal', frameStyle: 'none', tableDensity: 'spacious', headingAlignment: 'right' },
  corporate: { headerStyle: 'band', tableStyle: 'boxed', frameStyle: 'thin', tableDensity: 'normal' },
  modern: { headerStyle: 'split', tableStyle: 'striped', frameStyle: 'none', tableDensity: 'normal', headingAlignment: 'right' },
  elegant: { headerStyle: 'minimal', tableStyle: 'minimal', frameStyle: 'thin', tableDensity: 'spacious', headingAlignment: 'right' },
  gst: { headerStyle: 'band', tableStyle: 'boxed', frameStyle: 'double', tableDensity: 'normal', showSku: true, showBusinessGstin: true, showCustomerGstin: true },
  retail: { headerStyle: 'band', tableStyle: 'striped', frameStyle: 'none', tableDensity: 'compact' },
  service: { headerStyle: 'line', tableStyle: 'clean', frameStyle: 'thin', tableDensity: 'normal' },
  freelancer: { headerStyle: 'minimal', tableStyle: 'clean', frameStyle: 'none', tableDensity: 'spacious' },
  creative: { headerStyle: 'split', tableStyle: 'boxed', frameStyle: 'dashed', tableDensity: 'spacious' },
  international: { headerStyle: 'line', tableStyle: 'clean', frameStyle: 'thin', tableDensity: 'normal' },
  luxury: { headerStyle: 'band', tableStyle: 'minimal', frameStyle: 'double', tableDensity: 'spacious', headingAlignment: 'right' },
  navy: { headerStyle: 'band', tableStyle: 'boxed', frameStyle: 'thin', tableDensity: 'normal' },
  green: { headerStyle: 'line', tableStyle: 'striped', frameStyle: 'thin', tableDensity: 'normal' },
  tech: { headerStyle: 'split', tableStyle: 'boxed', frameStyle: 'dashed', tableDensity: 'compact' },
  mono: { headerStyle: 'minimal', tableStyle: 'minimal', frameStyle: 'thin', tableDensity: 'normal' },
  compact: { headerStyle: 'line', tableStyle: 'striped', frameStyle: 'none', tableDensity: 'compact' },
  bold: { headerStyle: 'band', tableStyle: 'boxed', frameStyle: 'thin', tableDensity: 'normal' },
};

export function applyInvoiceTemplate(design, templateOrId) {
  const template = typeof templateOrId === 'string'
    ? invoiceTemplates.find(item => item.id === templateOrId)
    : templateOrId;
  if (!template) return design;
  return {
    ...design,
    ...(invoiceTemplateStylePresets[template.id] || {}),
    templateId: template.id,
    accentColor: template.color,
    fontFamily: template.font,
    ...(template.id === 'xenmark' ? { xenmarkRevision: 3 } : {}),
  };
}

export const defaultInvoiceDesign = {
  templateId: 'xenmark',
  xenmarkRevision: 3,
  accentColor: '#85172d',
  fontFamily: 'Arial',
  invoiceTitle: 'INVOICE',
  showLogo: true,
  showQr: true,
  showBusinessGstin: true,
  showCustomerGstin: true,
  showItemSku: true,
  showItemDescription: true,
  showUnitColumn: true,
  showPurchaseReference: true,
  showDueDate: true,
  showFooter: true,
  showTaxBreakdown: true,
  footerText: 'GARMENTS | PRINTING | CUSTOMIZATION',
  paymentInstructions: '• Please scan the QR code and pay the amount.\n• After payment, share the screenshot with your order/bill number.\n• For any payment issues, contact us.\n• Thank you for your business.',
  logoDataUrl: '',
  qrDataUrl: '',
  signatureDataUrl: '',
  showSignature: false,
  signatureName: '',
  signatureTitle: 'Authorised Signatory',
  signatureWidth: 170,
  signatureAlignment: 'right',
  signatureCaption: 'AUTHORISED SIGNATORY',
  qrWidth: 82,
  qrPosition: 'right',
  qrCaption: 'SCAN TO PAY',
  qrInstruction: 'Scan the QR code with your UPI app to complete payment.',
  businessTagline: 'GARMENT MANUFACTURER & PRINTING HOUSE',
  businessServiceLine: 'T-SHIRTS | CAPS | HOODIES | JACKETS',
  businessServiceLine2: 'EMBROIDERY | DTF | DTG | CUSTOM PRINTING',
  topIssueDateLabel: 'Date',
  ribbonServices: 'T-SHIRTS | CAPS | HOODIES | JACKETS | DTF / DTG | EMBROIDERY | CUSTOM PRINTS',
  serviceBannerText: 'CUSTOM APPAREL\nFOR YOUR\nBRAND & BUSINESS',
  businessSocialHandle: '',
  qrPaymentProvider: 'PhonePe',
  qrScanText: 'Scan & Pay',
  qrScanSubtext: 'Pay with any UPI App',
  invoiceSubtitle: '',
  invoiceNumberLabel: 'Bill No.',
  paymentDetailsLabel: 'Payment Details',
  subtotalLabel: 'Sub Total',
  taxLabel: 'GST (18%)',
  totalLabel: 'Total Amount',
  amountPaidLabel: 'Amount paid:',
  dueAmountLabel: 'Due amount:',
  businessGstinLabel: 'GSTIN',
  customerGstinLabel: 'GSTIN',
  customerNameLabel: 'Name',
  customerCompanyLabel: 'Company Name',
  customerAddressLabel: 'Address',
  customerPhoneLabel: 'Phone',
  customerEmailLabel: 'Email',
  businessNameLabel: 'Name',
  businessAddressLabel: 'Address',
  businessPhoneLabel: 'Phone',
  businessEmailLabel: 'Email',
  websiteLabel: 'Website',
  panLabel: 'PAN',
  accountNumberLabel: 'A/C',
  ifscLabel: 'IFSC',
  upiLabel: 'UPI',
  logoWidth: 64,
  logoPosition: 'left',
  paperBackground: '#ffffff',
  paperPattern: 'plain',
  backgroundImageDataUrl: '',
  backgroundImageOpacity: 24,
  backgroundImageFit: 'cover',
  showWatermark: false,
  watermarkText: 'SPYRIX',
  watermarkOpacity: 7,
  fontSize: 10,
  frameStyle: 'thin',
  headerStyle: 'line',
  tableStyle: 'clean',
  tableDensity: 'normal',
  businessName: '',
  businessAddress: '',
  businessPhone: '',
  businessEmail: '',
  businessWebsite: '',
  businessGstin: '',
  businessPan: '',
  businessBankName: '',
  businessAccountNumber: '',
  businessIfsc: '',
  businessServices: 'T-SHIRTS | CAPS | HOODIES | JACKETS | EMBROIDERY | DTF / DTG | CUSTOM PRINTS',
  documentLabel: 'S. No.',
  issueDateLabel: 'Invoice Date',
  dueDateLabel: 'Due Date',
  purchaseOrderLabel: 'PO No.',
  referenceLabel: 'Reference',
  billToLabel: 'BILL TO',
  billFromLabel: 'BILL BY',
  paymentDetailsLabel: 'Payment Details',
  thankYouText: 'Thank You!',
  trustText: 'FOR YOUR TRUST',
  paymentStatusText: 'PAYMENT STATUS: UNPAID',
  showPaymentStatusSummary: false,
  amountPaidLabel: 'Amount paid',
  dueAmountLabel: 'Due amount',
  upiId: '',
  pageSize: 'A4',
  pageOrientation: 'portrait',
  layoutDensity: 'comfortable',
  borderStyle: 'solid',
  headingAlignment: 'left',
  showBusinessServices: true,
};

export function loadInvoiceDesign() {
  try {
    const hasSavedDesign = Boolean(localStorage.getItem('spyrix_invoice_design') || localStorage.getItem('spyrix_invoice_template'));
    const stored = JSON.parse(localStorage.getItem('spyrix_invoice_design') || '{}');
    const templateId = stored.templateId || localStorage.getItem('spyrix_invoice_template') || 'xenmark';
    const selected = invoiceTemplates.find(item => item.id === templateId);
    const merged = { ...defaultInvoiceDesign, ...(selected ? { accentColor: selected.color, fontFamily: selected.font } : {}), ...stored, ...(!hasSavedDesign ? { templateId: 'xenmark', accentColor: '#85172d', fontFamily: 'Arial' } : {}) };

    // One-time refresh of the old built-in Xenmark layout so existing browsers receive
    // the new reference-matched defaults without losing their logo, QR, signature or business data.
    if (templateId === 'xenmark' && Number(stored.xenmarkRevision || 0) < 3) {
      const refreshed = {
        ...merged,
        xenmarkRevision: 3,
        accentColor: '#85172d',
        fontFamily: 'Arial',
        invoiceTitle: 'INVOICE',
        topIssueDateLabel: 'Date',
        invoiceNumberLabel: 'Bill No.',
        issueDateLabel: 'Invoice Date',
        dueDateLabel: 'Due Date',
        purchaseOrderLabel: 'PO No.',
        referenceLabel: 'Reference',
        billToLabel: 'BILL TO',
        billFromLabel: 'BILL BY',
        documentLabel: 'S. No.',
        itemLabel: 'Description',
        quantityLabel: 'Pieces',
        rateLabel: 'Rate (₹)',
        amountLabel: 'Amount (₹)',
        subtotalLabel: 'Sub Total',
        discountLabel: 'Discount',
        taxLabel: 'GST (18%)',
        totalLabel: 'Total Amount',
        paymentDetailsLabel: 'Payment Details',
        paymentInstructionsLabel: 'Payment Instructions',
        paymentStatusText: 'PAYMENT STATUS: UNPAID',
  showPaymentStatusSummary: false,
        amountPaidLabel: 'Amount paid:',
        dueAmountLabel: 'Due amount:',
        thankYouText: 'Thank You!',
        trustText: 'FOR YOUR TRUST',
        footerText: 'GARMENTS | PRINTING | CUSTOMIZATION',
        ribbonServices: 'T-SHIRTS | CAPS | HOODIES | JACKETS | DTF / DTG | EMBROIDERY | CUSTOM PRINTS',
        serviceBannerText: 'CUSTOM APPAREL\nFOR YOUR\nBRAND & BUSINESS',
        qrPaymentProvider: 'PhonePe',
        qrScanText: 'Scan & Pay',
        qrScanSubtext: 'Pay with any UPI App',
        businessSocialHandle: merged.businessSocialHandle || '',
      };
      localStorage.setItem('spyrix_invoice_design', JSON.stringify(refreshed));
      localStorage.setItem('spyrix_invoice_template', 'xenmark');
      return refreshed;
    }
    return merged;
  } catch {
    return { ...defaultInvoiceDesign };
  }
}

export function saveInvoiceDesign(next) {
  const safe = { ...defaultInvoiceDesign, ...next };
  localStorage.setItem('spyrix_invoice_design', JSON.stringify(safe));
  localStorage.setItem('spyrix_invoice_template', safe.templateId);
  return safe;
}

export async function readImageFile(file, options = {}) {
  if (!file) return '';
  const settings = typeof options === 'number' ? { targetBytes: options } : (options || {});
  const purpose = String(settings.purpose || 'image');
  const targetBytes = Math.max(180 * 1024, Number(settings.targetBytes || 460 * 1024));
  const maxSourceBytes = Math.max(1024 * 1024, Number(settings.maxSourceBytes || 18 * 1024 * 1024));
  const extension = String(file.name || '').split('.').pop().toLowerCase();
  const mimeByExtension = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp', avif: 'image/avif', svg: 'image/svg+xml', tif: 'image/tiff', tiff: 'image/tiff' };
  const mime = String(file.type || mimeByExtension[extension] || '').toLowerCase();
  if (!mime.startsWith('image/')) throw new Error('Please select a supported image file (PNG, JPG, WEBP, GIF, BMP, AVIF or SVG).');
  if (file.size > maxSourceBytes) throw new Error('This image is too large to process. Please choose an image smaller than 18 MB.');

  const raw = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read this image. Please try another file.'));
    reader.readAsDataURL(file);
  });
  // Small SVGs are best kept as vectors. Inline data URLs keep images visible without requiring uploads to a server.
  if (mime === 'image/svg+xml' && raw.length <= targetBytes * 1.37) return raw.replace(/^data:[^;,]+/, 'data:image/svg+xml');

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('This image could not be decoded. Try a PNG, JPG or WEBP image.'));
    img.src = raw.replace(/^data:application\/octet-stream/, `data:${mime}`);
  });
  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;
  if (!originalWidth || !originalHeight) throw new Error('This image has no readable dimensions.');

  const maxDimension = purpose === 'qr' ? 1400 : 1600;
  const needsResize = Math.max(originalWidth, originalHeight) > maxDimension;
  if (file.size <= targetBytes && !needsResize) return raw.replace(/^data:application\/octet-stream/, `data:${mime}`);

  const scale = Math.min(1, maxDimension / Math.max(originalWidth, originalHeight));
  let width = Math.max(1, Math.round(originalWidth * scale));
  let height = Math.max(1, Math.round(originalHeight * scale));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not prepare this image. Try another browser.');
  // White matte for JPEG inputs; preserve transparency for logos/signatures when using PNG/WEBP.
  const alphaFriendly = /png|webp|svg|gif|avif/.test(mime) || purpose === 'signature' || purpose === 'logo';
  const exportImage = () => {
    canvas.width = width; canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    if (!alphaFriendly && purpose !== 'qr') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height); }
    ctx.drawImage(image, 0, 0, width, height);
    if (purpose === 'qr') {
      const png = canvas.toDataURL('image/png');
      if (png.length <= targetBytes * 1.37) return png;
      return canvas.toDataURL('image/webp', 0.94);
    }
    const webp = canvas.toDataURL('image/webp', 0.86);
    return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/png');
  };
  let result = exportImage();
  // Keep data URLs small enough for browser storage and MongoDB-backed invoice designs.
  for (let pass = 0; result.length > targetBytes * 1.37 && pass < 5; pass += 1) {
    width = Math.max(320, Math.round(width * 0.82));
    height = Math.max(320, Math.round(height * 0.82));
    result = exportImage();
  }
  if (result.length > targetBytes * 1.37) {
    canvas.width = Math.min(width, 900); canvas.height = Math.min(height, 900);
    width = canvas.width; height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    if (!alphaFriendly && purpose !== 'qr') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height); }
    ctx.drawImage(image, 0, 0, width, height);
    result = canvas.toDataURL('image/webp', 0.72);
  }
  return result;
}
