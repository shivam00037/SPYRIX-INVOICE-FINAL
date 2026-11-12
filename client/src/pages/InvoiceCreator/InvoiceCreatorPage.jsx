import { useContext, useEffect, useId, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, ChevronDown, ChevronUp, Download, Eye, ImagePlus,
  Palette, Plus, Printer, Save, ShieldCheck, SlidersHorizontal, Sparkles, Type,
  Trash2, Upload, X, QrCode, Building2, UserRound, FileText, LayoutTemplate, ListChecks, BadgeIndianRupee, ClipboardList, Pin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../data/DataContext';
import { apiRequest } from '../../api';
import { applyInvoiceTemplate, invoiceTemplates, loadInvoiceDesign, readImageFile, saveInvoiceDesign } from '../Invoices/invoiceDesign';
import './InvoiceCreatorPage.css';
import XenmarkInvoicePreview, { InvoiceCanvasImages, InvoiceEditorContext, InvoiceTemplateAssetLayer } from './XenmarkInvoicePreview';
import TemplateMiniPreview from '../Templates/TemplateMiniPreview';

const today = new Date().toISOString().slice(0, 10);
const future = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
const currency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(Number(value || 0));
const money = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const emptyLine = () => ({ id: `line-${Date.now()}-${Math.random().toString(16).slice(2)}`, name: '', description: '', sku: '', quantity: 1, unit: 'pcs', rate: 0, discount: 0, taxRate: 0 });
const blankCustomer = { name: '', companyName: '', email: '', phone: '', billingAddress: '', city: '', state: '', postalCode: '', country: 'India', gstin: '' };
const sampleCustomer = { name: '', companyName: '', email: '', phone: '', billingAddress: '', city: '', state: '', postalCode: '', country: 'India', gstin: '' };
const sampleItems = [
  { id: 'sample-1', name: 'Cotton T-Shirt (Custom Print)', description: '', sku: '', quantity: 100, unit: 'pcs', rate: 210, discount: 2000, taxRate: 18 },
  { id: 'sample-2', name: 'Cap (DTF Print)', description: '', sku: '', quantity: 50, unit: 'pcs', rate: 150, discount: 0, taxRate: 18 },
  { id: 'sample-3', name: 'Hoodie (Embroidery)', description: '', sku: '', quantity: 30, unit: 'pcs', rate: 450, discount: 0, taxRate: 18 },
  { id: 'sample-4', name: 'Printing Charges (DTF)', description: '', sku: '', quantity: 1, unit: 'pcs', rate: 2500, discount: 0, taxRate: 18 },
  { id: 'sample-5', name: 'Embroidery Charges', description: '', sku: '', quantity: 1, unit: 'pcs', rate: 1500, discount: 0, taxRate: 18 },
  { id: 'sample-6', name: 'Other Charges / Packing', description: '', sku: '', quantity: 1, unit: 'pcs', rate: 500, discount: 0, taxRate: 18 },
];

const paperBackgrounds = [
  { id: 'snow', name: 'Snow white', description: 'Crisp and classic', color: '#ffffff' },
  { id: 'ivory', name: 'Warm ivory', description: 'Soft premium warmth', color: '#fff7e8' },
  { id: 'ice', name: 'Ice blue', description: 'Cool and professional', color: '#edf5ff' },
  { id: 'blush', name: 'Soft blush', description: 'Subtle creative tone', color: '#fff0f2' },
  { id: 'sage', name: 'Fresh sage', description: 'Calm natural finish', color: '#eff7ee' },
];

const layoutPresets = [
  { id: 'signature', name: 'Signature', description: 'Balanced everyday style', accentColor: '#171717', fontFamily: 'Arial', headerStyle: 'line', tableStyle: 'clean', frameStyle: 'thin' },
  { id: 'bold', name: 'Bold impact', description: 'Strong header and contrast', accentColor: '#18243a', fontFamily: 'Inter', headerStyle: 'band', tableStyle: 'striped', frameStyle: 'none' },
  { id: 'elegant', name: 'Elegant', description: 'Refined serif typography', accentColor: '#80533e', fontFamily: 'Georgia', headerStyle: 'minimal', tableStyle: 'minimal', frameStyle: 'thin' },
  { id: 'creative', name: 'Creative', description: 'Fresh colour and structure', accentColor: '#416b8c', fontFamily: 'Poppins', headerStyle: 'split', tableStyle: 'boxed', frameStyle: 'dashed' },
  { id: 'compact', name: 'Compact', description: 'Dense, space-saving layout', accentColor: '#315c4b', fontFamily: 'Tahoma', headerStyle: 'line', tableStyle: 'striped', frameStyle: 'none', tableDensity: 'compact' },
];

const paperPatternStyles = {
  plain: 'none',
  dots: 'radial-gradient(rgba(25,25,25,.09) .7px, transparent .7px)',
  grid: 'linear-gradient(rgba(25,25,25,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(25,25,25,.045) 1px, transparent 1px)',
  diagonal: 'repeating-linear-gradient(135deg, rgba(25,25,25,.035) 0 1px, transparent 1px 9px)',
};

const defaultDesign = {
  templateId: 'xenmark', xenmarkRevision: 3, accentColor: '#85172d', fontFamily: 'Arial', invoiceTitle: 'INVOICE',
  businessName: '', businessAddress: '', businessPhone: '', businessEmail: '', businessWebsite: '', businessGstin: '', businessPan: '', businessTagline: 'GARMENT MANUFACTURER & PRINTING HOUSE', businessServiceLine: 'T-SHIRTS | CAPS | HOODIES | JACKETS', businessServiceLine2: 'EMBROIDERY | DTF | DTG | CUSTOM PRINTING',
  businessBankName: '', businessAccountNumber: '', businessIfsc: '', upiId: '', businessServices: 'T-SHIRTS | CAPS | HOODIES | JACKETS | EMBROIDERY | DTF / DTG | CUSTOM PRINTS',
  logoDataUrl: '', qrDataUrl: '', showLogo: true, showQr: true, logoWidth: 64, logoPosition: 'left',
  footerText: 'GARMENTS | PRINTING | CUSTOMIZATION', ribbonServices: 'T-SHIRTS | CAPS | HOODIES | JACKETS | DTF / DTG | EMBROIDERY | CUSTOM PRINTS', serviceBannerText: 'CUSTOM APPAREL\nFOR YOUR\nBRAND & BUSINESS', businessSocialHandle: '', topIssueDateLabel: 'Date', qrPaymentProvider: 'UPI / PhonePe', qrScanText: 'Scan & Pay', qrScanSubtext: 'Pay with any UPI App', documentLabel: 'S. No.', invoiceNumberLabel: 'Bill No.', issueDateLabel: 'Invoice Date', dueDateLabel: 'Due Date', purchaseOrderLabel: 'PO No.', referenceLabel: 'Reference', billToLabel: 'BILL TO', billFromLabel: 'BILL BY', paymentDetailsLabel: 'Payment Details',
  customerNameLabel: 'Name', customerCompanyLabel: 'Company Name', customerAddressLabel: 'Address', customerPhoneLabel: 'Phone', customerEmailLabel: 'Email', businessNameLabel: 'Name', businessAddressLabel: 'Address', businessPhoneLabel: 'Phone', businessEmailLabel: 'Email', websiteLabel: 'Website',
  thankYouText: 'Thank You!', trustText: 'FOR YOUR TRUST', paymentStatusText: 'PAYMENT STATUS: UNPAID', amountPaidLabel: 'Amount paid:', dueAmountLabel: 'Due amount:',
  signatureDataUrl: '', showSignature: false, signatureName: '', signatureTitle: 'Authorised Signatory', signatureWidth: 170, signatureAlignment: 'right', signatureCaption: 'AUTHORISED SIGNATORY',
  qrWidth: 82, qrPosition: 'right', qrCaption: 'SCAN TO PAY', qrInstruction: 'Scan the QR code with your UPI app to complete payment.',
  invoiceSubtitle: '', invoiceNumberLabel: 'Bill No.', paymentDetailsLabel: 'Payment Details',
  businessGstinLabel: 'GSTIN', customerGstinLabel: 'GSTIN', panLabel: 'PAN', accountNumberLabel: 'A/C', ifscLabel: 'IFSC', upiLabel: 'UPI',
  paymentInstructions: '• Please scan the QR code and pay the amount.\n• After payment, share the screenshot with your order/bill number.\n• For any payment issues, contact us.\n• Thank you for your business.',
  documentLabel: 'S. No.', issueDateLabel: 'Invoice Date', dueDateLabel: 'Due Date', referenceLabel: 'Reference', purchaseOrderLabel: 'PO No.', paymentInstructionsLabel: 'Payment Instructions', skuLabel: 'SKU',
  billToLabel: 'BILL TO', billFromLabel: 'BILL BY', itemLabel: 'Description', quantityLabel: 'Pieces', rateLabel: 'Rate (₹)', amountLabel: 'Amount (₹)',
  subtotalLabel: 'Sub Total', discountLabel: 'Discount', taxLabel: 'GST (18%)', totalLabel: 'Total Amount', notesLabel: 'NOTES', termsLabel: 'TERMS & CONDITIONS',
  pageSize: 'A4', pageOrientation: 'portrait', paperBackground: '#ffffff', fontSize: 10, frameStyle: 'thin', headerStyle: 'line', tableStyle: 'clean', tableDensity: 'normal',
  showBusinessGstin: true, showCustomerGstin: true, showSku: false, showPaymentInstructions: true, showFooter: true,
  paperPattern: 'plain', backgroundImageDataUrl: '', backgroundImageOpacity: 24, backgroundImageFit: 'cover', showWatermark: false, watermarkText: 'SPYRIX', watermarkOpacity: 7,
};

function Field({ label, value, onChange, placeholder, type = 'text', multiline = false, hint, children, className = '' }) {
  return <label className={`ic-field ${className}`}><span>{label}</span>{children || (multiline ? <textarea value={value ?? ''} placeholder={placeholder} onChange={event => onChange(event.target.value)} rows={3}/> : <input type={type} value={value ?? ''} placeholder={placeholder} onChange={event => onChange(event.target.value)}/>)}{hint && <small>{hint}</small>}</label>;
}

function Section({ title, description, icon, children, defaultOpen = true, id }) {
  const [open, setOpen] = useState(defaultOpen);
  return <section id={id} className="ic-editor-section"><button className="ic-section-toggle" type="button" onClick={() => setOpen(value => !value)}><span className="ic-section-icon">{icon}</span><span className="ic-section-name"><b>{title}</b><small>{description}</small></span>{open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button>{open && <div className="ic-section-content">{children}</div>}</section>;
}

function UploadAsset({ title, hint, value, onUpload, onRemove, icon: Icon }) {
  return <div className="ic-upload-row"><div className="ic-logo-thumb">{value ? <img src={value} alt={title} onError={event => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement?.classList.add('image-preview-failed'); }}/> : <Icon size={21}/>}</div><div className="ic-upload-copy"><b>{title}</b><small>{hint}</small></div><label className="ic-small-upload">{value ? 'Replace' : 'Upload'}<input type="file" accept="image/*" onChange={onUpload}/></label>{value && <button type="button" className="ic-icon-button" onClick={onRemove} title={`Remove ${title}`}><Trash2 size={14}/></button>}</div>;
}

function ExportDropdown({ onExport, label = 'Export' }) {
  const [open, setOpen] = useState(false);
  const options = [
    { id: 'pdf', title: 'PDF document', description: 'Print-ready · one page', icon: 'PDF' },
    { id: 'png', title: 'PNG image', description: 'High-quality transparent-free image', icon: 'PNG' },
    { id: 'jpg', title: 'JPG image', description: 'Smaller image file', icon: 'JPG' },
  ];
  return <div className="ic-export-dropdown">
    <button type="button" className="ic-outline-btn" aria-expanded={open} onClick={() => setOpen(value => !value)}><Download size={15}/>{label}<ChevronDown size={14}/></button>
    {open && <><button type="button" className="ic-export-menu-backdrop" aria-label="Close export menu" onClick={() => setOpen(false)} /><div className="ic-export-menu" role="menu">{options.map(option => <button type="button" role="menuitem" key={option.id} onClick={() => { setOpen(false); onExport(option.id); }}><span className="ic-export-format">{option.icon}</span><span><b>{option.title}</b><small>{option.description}</small></span></button>)}</div></>}
  </div>;
}

function CanvasEditable({ as = 'span', value, placeholder = 'Click to edit', onCommit, multiline = false, className = '', label }) {
  const Tag = as;
  const inlineId = useId();
  const editor = useContext(InvoiceEditorContext) || {};
  const textStyle = editor.textStyles?.[inlineId] || {};
  const inlineStyle = {
    fontWeight: textStyle.bold ? 800 : undefined,
    fontStyle: textStyle.italic ? 'italic' : undefined,
    textDecoration: textStyle.underline ? 'underline' : undefined,
    fontSize: textStyle.fontSize ? `${Number(textStyle.fontSize)}px` : undefined,
    color: textStyle.color || undefined,
    textAlign: textStyle.textAlign || undefined,
    fontFamily: textStyle.fontFamily || undefined,
  };
  return <Tag
    className={`ic-canvas-editable ${className}`.trim()}
    contentEditable
    suppressContentEditableWarning
    spellCheck={false}
    role="textbox"
    aria-label={label || placeholder}
    data-inline-key={inlineId}
    data-inline-label={label || placeholder}
    data-placeholder={placeholder}
    title={`Click to edit ${label || placeholder}`}
    style={inlineStyle}
    onBlur={event => {
      const next = String(event.currentTarget.innerText || '').replace(/\u00a0/g, ' ').trim();
      if (next !== String(value ?? '').trim()) onCommit?.(next);
    }}
    onKeyDown={event => { if (event.key === 'Enter' && !multiline) { event.preventDefault(); event.currentTarget.blur(); } }}
  >{value ?? ''}</Tag>;
}

export default function InvoiceCreatorPage({ mode = 'invoice' }) {
  const isTemplateMode = mode === 'template' || mode === 'preview';
  const isPreviewMode = mode === 'preview';
  const navigate = useNavigate();
  const { business, session } = useAuth();
  const { records = {}, createRecord, updateRecord } = useData();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customer, setCustomer] = useState(() => isTemplateMode ? { ...sampleCustomer } : { ...blankCustomer });
  const [meta, setMeta] = useState(() => ({ issueDate: isTemplateMode ? '2025-10-26' : today, dueDate: isTemplateMode ? '2025-11-02' : future, invoiceNumber: isTemplateMode ? 'XM/2025/001' : `SPY-${new Date().getFullYear()}-001`, manualInvoiceNumber: isTemplateMode, purchaseOrder: '', reference: '', notes: 'Thank you for choosing our business.', terms: 'Payment is due by the due date shown above.' }));
  const [design, setDesign] = useState(() => {
    const saved = loadInvoiceDesign();
    return { ...defaultDesign, ...saved, businessName: saved.businessName || business?.name || '', businessAddress: saved.businessAddress || business?.address || '', businessPhone: saved.businessPhone || business?.phone || '', businessEmail: saved.businessEmail || business?.email || '', businessWebsite: saved.businessWebsite || business?.website || '', businessGstin: saved.businessGstin || business?.gstin || '' };
  });
  const [items, setItems] = useState(() => isTemplateMode ? sampleItems : [emptyLine()]);
  const [customFields, setCustomFields] = useState([]);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewDevice, setPreviewDevice] = useState(() => window.matchMedia?.('(max-width: 820px)').matches ? 'mobile' : 'desktop');
  const [activeToolTab, setActiveToolTab] = useState('Colors');
  const [selectedPreviewSection, setSelectedPreviewSection] = useState('');
  const [editorStage, setEditorStage] = useState(() => isTemplateMode ? 'editor' : 'select');
  const [selectedElementKind, setSelectedElementKind] = useState('page');
  const [selectedElementLabel, setSelectedElementLabel] = useState('Full invoice page');
  const [selectedTextId, setSelectedTextId] = useState('');
  const [selectedImageKey, setSelectedImageKey] = useState('');
  const [selectedCustomImageId, setSelectedCustomImageId] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All');
  const [templateSearch, setTemplateSearch] = useState('');
  const [showInvoiceFields, setShowInvoiceFields] = useState(false);
  const [canvasDropActive, setCanvasDropActive] = useState(false);

  useEffect(() => {
    if (!business) return;
    setDesign(current => ({
      ...current,
      businessName: current.businessName || business.name || '',
      businessAddress: current.businessAddress || business.address || '',
      businessPhone: current.businessPhone || business.phone || '',
      businessEmail: current.businessEmail || business.email || '',
      businessWebsite: current.businessWebsite || business.website || '',
      businessGstin: current.businessGstin || business.gstin || '',
    }));
  }, [business]);

  useEffect(() => {
    const updateDevice = () => setPreviewDevice(window.innerWidth <= 820 ? 'mobile' : 'desktop');
    window.addEventListener('resize', updateDevice, { passive: true });
    return () => window.removeEventListener('resize', updateDevice);
  }, []);

  const setD = (key, value) => setDesign(current => ({ ...current, [key]: value }));
  const applyLayoutPreset = preset => {
    const { id, name, description, ...styles } = preset;
    setDesign(current => ({ ...current, ...styles, tableDensity: styles.tableDensity || 'normal' }));
  };
  const applyPaperBackground = color => setD('paperBackground', color);
  const activePaperBackground = paperBackgrounds.find(item => item.color.toLowerCase() === String(design.paperBackground || '#ffffff').toLowerCase());
  const activeLayoutPreset = layoutPresets.find(item => item.accentColor === design.accentColor && item.fontFamily === design.fontFamily && item.headerStyle === design.headerStyle && item.tableStyle === design.tableStyle && item.frameStyle === design.frameStyle);
  const completionChecks = [
    { label: 'Business identity', done: Boolean(design.businessName?.trim() && design.businessAddress?.trim()) },
    { label: 'Customer details', done: Boolean(customer.name?.trim()) },
    { label: 'Invoice items', done: items.some(item => item.name?.trim() && money(item.quantity) > 0) },
    { label: 'Brand asset', done: Boolean(design.logoDataUrl) },
  ];
  const completionProgress = Math.round(completionChecks.filter(item => item.done).length / completionChecks.length * 100);
  const setM = (key, value) => setMeta(current => ({ ...current, [key]: value }));
  const setC = (key, value) => setCustomer(current => ({ ...current, [key]: value }));
  const selectedTemplate = invoiceTemplates.find(template => template.id === design.templateId) || invoiceTemplates[0];
  const matchingTemplates = invoiceTemplates.filter(template => {
    const matchesCategory = templateCategory === 'All' || (templateCategory === 'Business' ? ['Manufacturing', 'Corporate', 'Classic', 'Commerce', 'Services', 'Retail'].includes(template.category) : template.category === templateCategory);
    return matchesCategory && `${template.name} ${template.category}`.toLowerCase().includes(templateSearch.trim().toLowerCase());
  });
  const quickTemplates = matchingTemplates.slice(0, 6);
  const selectedCustomImage = (Array.isArray(design.customCanvasImages) ? design.customCanvasImages : []).find(image => image.id === selectedCustomImageId) || null;
  const selectedTextStyle = (design.textStyles || {})[selectedTextId] || {};
  const isInvoiceEditorStage = !isTemplateMode && editorStage === 'editor';
  const updateSelectedTextStyle = (key, value) => {
    if (!selectedTextId) return;
    setDesign(current => ({ ...current, textStyles: { ...(current.textStyles || {}), [selectedTextId]: { ...((current.textStyles || {})[selectedTextId] || {}), [key]: value } } }));
  };
  const backgroundFade = Math.max(0, Math.min(100, Number(design.backgroundImageOpacity ?? 24))) / 100;
  const backgroundTint = design.paperBackground || '#ffffff';
  const invoiceBackgroundImage = design.backgroundImageDataUrl ? `linear-gradient(color-mix(in srgb, ${backgroundTint} ${100 - Math.round(backgroundFade * 100)}%, transparent), color-mix(in srgb, ${backgroundTint} ${100 - Math.round(backgroundFade * 100)}%, transparent)), url("${design.backgroundImageDataUrl}")` : (paperPatternStyles[design.paperPattern || 'plain'] === 'none' ? 'none' : paperPatternStyles[design.paperPattern || 'plain']);
  const calculations = useMemo(() => {
    const lines = items.map(item => {
      const quantity = Math.max(0, money(item.quantity));
      const rate = Math.max(0, money(item.rate));
      const discount = Math.min(quantity * rate, Math.max(0, money(item.discount)));
      const taxable = Math.max(0, quantity * rate - discount);
      const tax = taxable * Math.max(0, Math.min(100, money(item.taxRate))) / 100;
      return { ...item, quantity, rate, discount, taxable, tax, lineTotal: taxable + tax };
    });
    return { lines, subtotal: lines.reduce((sum, item) => sum + item.quantity * item.rate, 0), discount: lines.reduce((sum, item) => sum + item.discount, 0), tax: lines.reduce((sum, item) => sum + item.tax, 0), total: lines.reduce((sum, item) => sum + item.lineTotal, 0) };
  }, [items]);

  const chooseCustomer = value => {
    setCustomerId(value);
    const found = (records.customers || []).find(item => item.id === value);
    if (found) setCustomer({ ...blankCustomer, name: found.name || '', companyName: found.companyName || '', email: found.email || '', phone: found.phone || '', billingAddress: found.billingAddress || found.address || '', city: found.city || '', state: found.state || '', postalCode: found.postalCode || '', country: found.country || 'India', gstin: found.gstin || '' });
    else setCustomer({ ...blankCustomer });
  };
  const updateLine = (id, key, value) => setItems(current => current.map(line => line.id === id ? { ...line, [key]: value } : line));
  const addLine = () => setItems(current => [...current, emptyLine()]);
  const removeLine = id => setItems(current => current.length > 1 ? current.filter(line => line.id !== id) : current);
  const chooseProduct = (lineId, productId) => {
    const product = (records.products || []).find(row => row.id === productId);
    if (!product) return updateLine(lineId, 'productId', '');
    setItems(current => current.map(line => line.id === lineId ? { ...line, productId, name: product.name || '', description: product.description || '', sku: product.sku || '', unit: product.unit || 'pcs', rate: Number(product.price || 0), taxRate: Number(product.taxRate || 0) } : line));
  };
  const uploadAsset = key => async event => {
    try {
      const purpose = key === 'logoDataUrl' ? 'logo' : key === 'qrDataUrl' ? 'qr' : key === 'signatureDataUrl' ? 'signature' : 'image';
      const dataUrl = await readImageFile(event.target.files?.[0], { purpose });
      const visibilityKey = key === 'logoDataUrl' ? 'showLogo' : key === 'qrDataUrl' ? 'showQr' : key === 'signatureDataUrl' ? 'showSignature' : null;
      setDesign(current => {
        const next = { ...current, [key]: dataUrl, ...(visibilityKey ? { [visibilityKey]: true } : {}) };
        try { saveInvoiceDesign(next); } catch (storageError) { console.warn('Could not cache uploaded invoice image locally:', storageError); }
        return next;
      });
      setError('');
      setNotice('Image uploaded and displayed on the invoice. Save the template to sync it to your business workspace.');
    } catch (err) { setError(err.message || 'Could not upload this image.'); }
    event.target.value = '';
  };
  const isSupportedImageFile = file => Boolean(file && (/^image\//i.test(String(file.type || '')) || /\.(png|jpe?g|webp|gif|bmp|avif|svg|tif|tiff)$/i.test(String(file.name || ''))));
  const addCanvasImageFile = async (file, position = { x: 35, y: 35 }) => {
    if (!file) return;
    if (!isSupportedImageFile(file)) {
      setError('Please choose an image file such as PNG, JPG or WEBP.');
      return;
    }
    try {
      const dataUrl = await readImageFile(file, { purpose: 'canvas' });
      const image = {
        id: `canvas-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        name: file.name || 'Added image', dataUrl,
        x: Math.max(0, Math.min(90, Number(position.x ?? 35))),
        y: Math.max(0, Math.min(92, Number(position.y ?? 35))), width: 18,
      };
      setDesign(current => {
        const next = { ...current, customCanvasImages: [...(Array.isArray(current.customCanvasImages) ? current.customCanvasImages : []), image] };
        try { saveInvoiceDesign(next); } catch (storageError) { console.warn('Could not cache canvas image locally:', storageError); }
        return next;
      });
      setNotice('Image added and shown on the invoice. Use the move handle to position it.');
      setError('');
    } catch (err) { setError(err.message || 'Could not upload this image.'); }
  };
  const uploadCanvasImage = async event => {
    await addCanvasImageFile(event.target.files?.[0]);
    event.target.value = '';
  };
  const onCanvasDragOver = event => {
    const hasImage = Array.from(event.dataTransfer?.items || []).some(item => item.kind === 'file' && /^image\//i.test(item.type || '')) || Array.from(event.dataTransfer?.files || []).some(isSupportedImageFile);
    if (!hasImage) return;
    event.preventDefault();
    setCanvasDropActive(true);
  };
  const onCanvasDragLeave = event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setCanvasDropActive(false);
  };
  const onCanvasDrop = async event => {
    const file = Array.from(event.dataTransfer?.files || []).find(isSupportedImageFile);
    if (!file) return;
    event.preventDefault();
    event.stopPropagation();
    setCanvasDropActive(false);
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 100;
    const y = ((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 100;
    await addCanvasImageFile(file, { x, y });
  };
  const updateCanvasImage = (id, changes) => setDesign(current => { const next = { ...current, customCanvasImages: (Array.isArray(current.customCanvasImages) ? current.customCanvasImages : []).map(image => image.id === id ? { ...image, ...changes } : image) }; try { saveInvoiceDesign(next); } catch (storageError) { console.warn('Could not cache image position locally:', storageError); } return next; });
  const removeCanvasImage = id => setDesign(current => { const next = { ...current, customCanvasImages: (Array.isArray(current.customCanvasImages) ? current.customCanvasImages : []).filter(image => image.id !== id) }; try { saveInvoiceDesign(next); } catch (storageError) { console.warn('Could not cache invoice images locally:', storageError); } return next; });

  const saveTemplateDesign = async () => {
    setSaving(true); setError(''); setNotice('');
    try {
      const saved = { ...design, templateId: selectedTemplate.id };
      if (localStorage.getItem('spyrix_token')) {
        await apiRequest('/business/settings', { method: 'PUT', body: JSON.stringify({ invoiceDesign: saved }) });
      }
      saveInvoiceDesign(saved);
      window.dispatchEvent(new CustomEvent('spyrix:invoice-design-updated'));
      setNotice('Template design saved as your default for future invoices.');
      window.setTimeout(() => navigate('/app/templates'), 900);
    } catch (err) { setError(err.message || 'Could not save this template design.'); }
    finally { setSaving(false); }
  };

  const saveInvoice = async status => {
    setError(''); setNotice('');
    if (!customer.name.trim()) return setError('Add a customer name before saving this invoice.');
    const activeLines = items.filter(item => item.name.trim());
    if (!activeLines.length) return setError('Add at least one invoice item with a description.');
    if (activeLines.some(item => money(item.quantity) <= 0 || money(item.rate) < 0 || money(item.discount) < 0 || money(item.discount) > money(item.quantity) * money(item.rate) || money(item.taxRate) < 0 || money(item.taxRate) > 100)) return setError('Check item quantities, prices, discounts and tax rates. Quantity must be above zero, discount cannot exceed the line value, and tax must be between 0 and 100%.');
    if (calculations.total < 0) return setError('Invoice total cannot be negative.');
    setSaving(true);
    try {
      let savedCustomerId = customerId;
      if (!savedCustomerId || !(records.customers || []).some(row => row.id === savedCustomerId)) {
        const createdCustomer = await createRecord('customers', { ...customer, name: customer.name.trim() });
        savedCustomerId = createdCustomer.id;
      }
      const payload = {
        customerId: savedCustomerId,
        customerName: customer.name,
        customerSnapshot: { ...customer },
        items: calculations.lines.filter(line => line.name.trim()).map(({ id: lineId, taxable, tax, lineTotal, ...line }) => ({ ...line, quantity: Number(line.quantity), rate: Number(line.rate), discount: Number(line.discount || 0), taxRate: Number(line.taxRate || 0) })),
        ...(meta.manualInvoiceNumber && String(meta.invoiceNumber || '').trim() ? { invoiceNumber: String(meta.invoiceNumber).trim() } : {}),
        issueDate: meta.issueDate, dueDate: meta.dueDate, purchaseOrder: meta.purchaseOrder, reference: meta.reference,
        notes: meta.notes, terms: meta.terms, customFields, templateId: design.templateId, design, subtotal: calculations.subtotal, discount: calculations.discount, tax: calculations.tax, total: calculations.total, status: 'draft',
      };
      saveInvoiceDesign(design);
      const created = await createRecord('invoices', payload);
      if (status === 'issued') await updateRecord('invoices', created.id, { status: 'issued' });
      setNotice(status === 'issued' ? 'Invoice saved and marked as issued.' : 'Invoice draft saved successfully.');
      window.setTimeout(() => navigate('/app/invoices'), 900);
    } catch (err) { setError(err.message || 'Could not save this invoice. Please try again.'); }
    finally { setSaving(false); }
  };

  const printInvoice = async () => {
    // Export only the invoice canvas and scale it to the printable area. This avoids
    // multi-page PDFs even when the on-screen editor preview is tall or zoomed.
    const paper = document.querySelector('.invoice-creator .ic-invoice-paper');
    if (!paper) { window.print(); return; }

    const pageMap = { A4: [794, 1123], A5: [559, 794], Letter: [816, 1056] };
    const outputSize = ['A4', 'A5', 'Letter'].includes(design.pageSize) ? design.pageSize : 'A4';
    const outputOrientation = ['portrait', 'landscape'].includes(design.pageOrientation) ? design.pageOrientation : 'portrait';
    let [pageWidth, pageHeight] = pageMap[outputSize];
    if (outputOrientation === 'landscape') [pageWidth, pageHeight] = [pageHeight, pageWidth];
    const safeWidth = pageWidth - 18;
    const safeHeight = pageHeight - 24;
    const propertyNames = ['width', 'max-width', 'min-height', 'height', 'padding', 'zoom', 'transform', 'position', 'left', 'top', 'margin', 'box-shadow', 'overflow'];
    const oldProperties = Object.fromEntries(propertyNames.map(name => [name, { value: paper.style.getPropertyValue(name), priority: paper.style.getPropertyPriority(name) }]));
    const restorePaper = () => propertyNames.forEach(name => {
      const old = oldProperties[name];
      if (old.value) paper.style.setProperty(name, old.value, old.priority);
      else paper.style.removeProperty(name);
    });
    const setMeasureStyle = (name, value) => paper.style.setProperty(name, value, 'important');

    // Match the compact print-only styling during measurement, so we don't over-shrink
    // the invoice based on the taller editing preview layout.
    const measureStyle = document.createElement('style');
    measureStyle.id = 'spyrix-invoice-print-measure';
    measureStyle.textContent = `.ic-invoice-paper.ic-print-measuring .xenmark-invoice{gap:2.4mm!important;font-size:8.5pt!important;line-height:1.2!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-masthead{min-height:36mm!important;padding:0 0 2mm!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-logo-target{height:31mm!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-party-card{min-height:0!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-party-card h3{padding:1.8mm 2.5mm!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-party-details{gap:1mm!important;padding:1.8mm 2.5mm!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-party-details>div{font-size:7.5pt!important;line-height:1.18!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-date-strip>div{padding:1.6mm!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-items-table{font-size:7.5pt!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-items-table th{padding:1.8mm 1mm!important;font-size:7.5pt!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-items-table td{padding:1.5mm 1.5mm!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-payment-total-grid{grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr)!important;gap:2.5mm!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-payment-box,.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-total-box{min-height:0!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-payment-content{gap:2mm!important;padding:1.8mm!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-qr-target{width:27mm!important;height:27mm!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-payment-instructions{gap:1mm!important;font-size:7pt!important;line-height:1.2!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-payment-instructions>b{padding:1.2mm!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-total-line{padding:1.8mm 2mm!important;font-size:7.5pt!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-grand-total{font-size:10pt!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-thank-you{min-height:0!important;padding:1.5mm!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-thank-you strong{font-size:17pt!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-service-ribbon{min-height:13mm!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-footer-main{min-height:14mm!important;padding:1.8mm 2.5mm!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-footer-main>div{font-size:7pt!important}.ic-invoice-paper.ic-print-measuring .xenmark-invoice .xen-footer-strip{min-height:11mm!important;padding:1.8mm!important;font-size:7pt!important;letter-spacing:2px!important}`;
    document.head.appendChild(measureStyle);
    paper.classList.add('ic-print-measuring');

    // Temporarily render at printable page width to measure the actual full invoice.
    setMeasureStyle('width', `${safeWidth}px`);
    setMeasureStyle('max-width', 'none');
    setMeasureStyle('min-height', '0');
    setMeasureStyle('height', 'auto');
    setMeasureStyle('padding', '8mm');
    setMeasureStyle('zoom', '1');
    setMeasureStyle('transform', 'none');
    setMeasureStyle('position', 'static');
    setMeasureStyle('margin', '0');
    setMeasureStyle('overflow', 'visible');
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const measuredRect = paper.getBoundingClientRect();
    const paperWidth = Math.max(1, measuredRect.width, paper.scrollWidth);
    const paperHeight = Math.max(1, measuredRect.height, paper.scrollHeight, paper.querySelector('.xenmark-invoice')?.scrollHeight || 0);
    const scale = Math.min(1, safeWidth / paperWidth, safeHeight / paperHeight);
    const left = Math.max(0, (pageWidth - (paperWidth * scale)) / 2);
    paper.classList.remove('ic-print-measuring');
    measureStyle.remove();
    restorePaper();

    document.getElementById('spyrix-invoice-print-page')?.remove();
    const printStyle = document.createElement('style');
    printStyle.id = 'spyrix-invoice-print-page';
    printStyle.textContent = `
      @page { size: ${outputSize} ${outputOrientation}; margin: 0; }
      @media print {
        html, body, #root, .app-shell, .main-area, .page-content { width:${pageWidth}px!important; height:${pageHeight - 2}px!important; min-height:0!important; max-height:${pageHeight - 2}px!important; margin:0!important; padding:0!important; overflow:hidden!important; background:#fff!important; }
        body * { visibility:hidden!important; }
        .invoice-creator { position:absolute!important; inset:0 auto auto 0!important; width:${pageWidth}px!important; height:${pageHeight - 2}px!important; min-height:0!important; max-height:${pageHeight - 2}px!important; margin:0!important; padding:0!important; overflow:hidden!important; }
        .invoice-creator .ic-preview-area, .invoice-creator .ic-preview-area * { visibility:visible!important; }
        .invoice-creator .ic-preview-area { position:absolute!important; inset:0 auto auto 0!important; display:block!important; width:${pageWidth}px!important; height:${pageHeight - 2}px!important; min-height:0!important; max-height:${pageHeight - 2}px!important; margin:0!important; padding:0!important; overflow:hidden!important; }
        .invoice-creator .ic-preview-toolbar, .invoice-creator .ic-preview-footnote, .invoice-creator .ic-preview-final-actions { display:none!important; }
        .invoice-creator .ic-paper-wrap { position:relative!important; display:block!important; width:${pageWidth}px!important; height:${pageHeight - 2}px!important; min-height:0!important; max-height:${pageHeight - 2}px!important; margin:0!important; padding:0!important; border:0!important; overflow:hidden!important; background:#fff!important; box-shadow:none!important; }
        .invoice-creator .ic-invoice-paper { position:absolute!important; left:${left}px!important; top:0!important; width:${paperWidth}px!important; max-width:none!important; height:auto!important; min-height:0!important; margin:0!important; padding:8mm!important; border:0!important; box-shadow:none!important; zoom:1!important; transform:scale(${scale})!important; transform-origin:top left!important; overflow:visible!important; break-inside:avoid!important; page-break-inside:avoid!important; }
        .invoice-creator .xenmark-invoice { gap:2.4mm!important; font-size:8.5pt!important; line-height:1.2!important; }
        .invoice-creator .xenmark-invoice .xen-masthead { min-height:36mm!important; padding:0 0 2mm!important; }
        .invoice-creator .xenmark-invoice .xen-logo-target { height:31mm!important; }
        .invoice-creator .xenmark-invoice .xen-party-card { min-height:0!important; }
        .invoice-creator .xenmark-invoice .xen-party-card h3 { padding:1.8mm 2.5mm!important; }
        .invoice-creator .xenmark-invoice .xen-party-details { gap:1mm!important; padding:1.8mm 2.5mm!important; }
        .invoice-creator .xenmark-invoice .xen-party-details>div { font-size:7.5pt!important; line-height:1.18!important; }
        .invoice-creator .xenmark-invoice .xen-date-strip>div { padding:1.6mm!important; }
        .invoice-creator .xenmark-invoice .xen-items-table { font-size:7.5pt!important; }
        .invoice-creator .xenmark-invoice .xen-items-table th { padding:1.8mm 1mm!important; font-size:7.5pt!important; }
        .invoice-creator .xenmark-invoice .xen-items-table td { padding:1.5mm 1.5mm!important; }
        .invoice-creator .xenmark-invoice .xen-payment-total-grid { grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr)!important; gap:2.5mm!important; }
        .invoice-creator .xenmark-invoice .xen-payment-box, .invoice-creator .xenmark-invoice .xen-total-box { min-height:0!important; }
        .invoice-creator .xenmark-invoice .xen-payment-content { gap:2mm!important; padding:1.8mm!important; }
        .invoice-creator .xenmark-invoice .xen-qr-target { width:27mm!important; height:27mm!important; }
        .invoice-creator .xenmark-invoice .xen-payment-instructions { gap:1mm!important; font-size:7pt!important; line-height:1.2!important; }
        .invoice-creator .xenmark-invoice .xen-payment-instructions>b { padding:1.2mm!important; }
        .invoice-creator .xenmark-invoice .xen-total-line { padding:1.8mm 2mm!important; font-size:7.5pt!important; }
        .invoice-creator .xenmark-invoice .xen-grand-total { font-size:10pt!important; }
        .invoice-creator .xenmark-invoice .xen-thank-you { min-height:0!important; padding:1.5mm!important; }
        .invoice-creator .xenmark-invoice .xen-thank-you strong { font-size:17pt!important; }
        .invoice-creator .xenmark-invoice .xen-service-ribbon { min-height:13mm!important; }
        .invoice-creator .xenmark-invoice .xen-footer-main { min-height:14mm!important; padding:1.8mm 2.5mm!important; }
        .invoice-creator .xenmark-invoice .xen-footer-main>div { font-size:7pt!important; }
        .invoice-creator .xenmark-invoice .xen-footer-strip { min-height:11mm!important; padding:1.8mm!important; font-size:7pt!important; letter-spacing:2px!important; }
        .invoice-creator .ic-invoice-paper [data-editor-id] { outline:0!important; box-shadow:none!important; }
      }
    `;
    document.head.appendChild(printStyle);
    const cleanup = () => {
      printStyle.remove();
      if (!paper.isConnected) return;
    };
    window.addEventListener('afterprint', cleanup, { once: true });
    window.print();
  };
  const addCustomField = () => setCustomFields(current => [...current, { label: 'Custom field', value: '' }]);
  const updateCustomField = (index, key, value) => setCustomFields(current => current.map((field, i) => i === index ? { ...field, [key]: value } : field));
  const setTemplate = value => {
    const template = invoiceTemplates.find(item => item.id === value) || value;
    setDesign(current => applyInvoiceTemplate(current, template));
  };
  const chooseTemplateAndEdit = value => {
    setTemplate(value);
    setEditorStage('editor');
    setSelectedElementKind('page');
    setSelectedElementLabel('Full invoice page');
    setSelectedPreviewSection('page');
    setSelectedTextId('');
    setSelectedImageKey('');
    setSelectedCustomImageId('');
    setActiveToolTab('Colors');
  };
  const handleCanvasSelection = event => {
    const target = event.target;
    if (!target || target.closest('.xen-upload-chip, .xen-upload-move, .xen-floating-move, .xen-floating-dock, .xen-floating-remove')) return;
    const inlineText = target.closest('[data-inline-key]');
    if (inlineText) {
      setSelectedElementKind('text');
      setSelectedElementLabel(inlineText.dataset.inlineLabel || 'Selected text');
      setSelectedTextId(inlineText.dataset.inlineKey);
      setSelectedPreviewSection(inlineText.dataset.inlineKey);
      setSelectedImageKey('');
      setSelectedCustomImageId('');
      setActiveToolTab('Advanced');
      return;
    }
    const customImage = target.closest('[data-custom-image-id]');
    if (customImage) {
      setSelectedElementKind('image');
      setSelectedElementLabel('Uploaded image');
      setSelectedImageKey('custom');
      setSelectedCustomImageId(customImage.dataset.customImageId || '');
      setSelectedPreviewSection(customImage.dataset.customImageId || 'custom-image');
      setSelectedTextId('');
      setActiveToolTab('Assets');
      return;
    }
    const assetTarget = target.closest('[data-asset-key]');
    if (assetTarget) {
      const key = assetTarget.dataset.assetKey || 'image';
      setSelectedElementKind('image');
      setSelectedImageKey(key);
      setSelectedElementLabel(key === 'qr' ? 'Payment QR code' : key === 'signature' ? 'Signature image' : 'Business logo');
      setSelectedPreviewSection(key);
      setSelectedCustomImageId('');
      setSelectedTextId('');
      setActiveToolTab('Assets');
      return;
    }
    const floatingAsset = target.closest('.xen-floating-asset');
    if (floatingAsset) {
      const key = floatingAsset.dataset.assetKey || 'custom';
      const customId = floatingAsset.dataset.customImageId || '';
      setSelectedElementKind('image');
      setSelectedImageKey(customId ? 'custom' : key);
      setSelectedCustomImageId(customId);
      setSelectedElementLabel(customId ? 'Uploaded image' : `${key.charAt(0).toUpperCase()}${key.slice(1)} image`);
      setSelectedPreviewSection(customId || key);
      setSelectedTextId('');
      setActiveToolTab('Assets');
      return;
    }
    const section = target.closest('[data-editor-tab],[data-editor-section]');
    if (section) {
      const sectionId = section.dataset.editorId || section.dataset.editorSection || (section.dataset.editorTab ? section.dataset.editorTab.toLowerCase() : 'selection');
      const tab = section.dataset.editorTab || '';
      setSelectedPreviewSection(sectionId);
      setSelectedElementLabel(sectionId.replaceAll('-', ' ').replace(/\b\w/g, char => char.toUpperCase()));
      setSelectedTextId(`section:${sectionId}`);
      setSelectedCustomImageId('');
      if (tab === 'Assets') {
        setSelectedElementKind('image');
        setSelectedImageKey(sectionId === 'qr' ? 'qr' : sectionId === 'signature' ? 'signature' : 'logo');
        setActiveToolTab('Assets');
      } else if (tab === 'Text') {
        setSelectedElementKind('text');
        setSelectedImageKey('');
        setActiveToolTab('Advanced');
      } else {
        setSelectedElementKind('page');
        setSelectedImageKey('');
        setActiveToolTab('Colors');
      }
      return;
    }
    setSelectedElementKind('page');
    setSelectedElementLabel('Full invoice page');
    setSelectedPreviewSection('page');
    setSelectedTextId('');
    setSelectedImageKey('');
    setSelectedCustomImageId('');
    setActiveToolTab('Colors');
  };

  const exportInvoiceImage = async format => {
    const paper = document.querySelector('.invoice-creator .ic-invoice-paper');
    if (!paper) { setError('Invoice canvas is not ready yet.'); return; }
    setError(''); setNotice('');
    setNotice(`Preparing ${format.toUpperCase()} export…`);
    try {
      const width = Math.max(1, Math.ceil(paper.scrollWidth || paper.getBoundingClientRect().width));
      const height = Math.max(1, Math.ceil(paper.scrollHeight || paper.getBoundingClientRect().height));
      const clone = paper.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      clone.style.setProperty('width', `${width}px`, 'important');
      clone.style.setProperty('height', `${height}px`, 'important');
      clone.style.setProperty('min-height', '0', 'important');
      clone.style.setProperty('max-width', 'none', 'important');
      clone.style.setProperty('margin', '0', 'important');
      clone.style.setProperty('zoom', '1', 'important');
      clone.style.setProperty('transform', 'none', 'important');
      clone.style.setProperty('box-shadow', 'none', 'important');
      clone.querySelectorAll('.xen-upload-chip,.xen-upload-move,.xen-floating-move,.xen-floating-dock,.xen-floating-remove,.ic-floating-move,.ic-floating-remove,input[type="file"]').forEach(node => node.remove());
      clone.querySelectorAll('[contenteditable="true"]').forEach(node => { node.removeAttribute('contenteditable'); node.removeAttribute('role'); node.style.outline = 'none'; });
      clone.querySelectorAll('[data-inline-key],[data-editor-tab],[data-editor-section],[data-asset-key]').forEach(node => { node.removeAttribute('data-inline-key'); node.removeAttribute('data-editor-tab'); node.removeAttribute('data-editor-section'); node.removeAttribute('data-asset-key'); });
      const sourceElements = [paper, ...paper.querySelectorAll('*')];
      const cloneElements = [clone, ...clone.querySelectorAll('*')];
      sourceElements.forEach((source, index) => {
        const dest = cloneElements[index];
        if (!dest || !source?.nodeType || source.nodeType !== 1) return;
        const computed = window.getComputedStyle(source);
        for (let i = 0; i < computed.length; i += 1) {
          const property = computed.item(i);
          if (property && property !== 'animation' && property !== 'transition' && property !== 'caret-color') dest.style.setProperty(property, computed.getPropertyValue(property));
        }
      });
      const wrapper = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
      wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      wrapper.style.width = `${width}px`;
      wrapper.style.height = `${height}px`;
      wrapper.style.overflow = 'hidden';
      wrapper.appendChild(clone);
      const svgText = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * 2}" height="${height * 2}" viewBox="0 0 ${width} ${height}"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(wrapper)}</foreignObject></svg>`;
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      try {
        const img = new Image();
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = () => reject(new Error('Your browser could not render this invoice as an image. Export PDF instead.')); img.src = url; });
        const scale = Math.min(2, 4096 / Math.max(width, height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Image export is not available in this browser.');
        if (format === 'jpg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const out = await new Promise(resolve => canvas.toBlob(resolve, format === 'jpg' ? 'image/jpeg' : 'image/png', .94));
        if (!out) throw new Error('The image file could not be created. Please try PDF export.');
        const downloadUrl = URL.createObjectURL(out);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `SPYRIX-INVOICE-${new Date().toISOString().slice(0, 10)}.${format === 'jpg' ? 'jpg' : 'png'}`;
        document.body.appendChild(link); link.click(); link.remove();
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);
        setNotice(`Invoice exported as ${format.toUpperCase()}.`);
      } finally { URL.revokeObjectURL(url); }
    } catch (err) { setError(err.message || `Could not export the invoice as ${format.toUpperCase()}.`); setNotice(''); }
  };
  const handleExport = format => format === 'pdf' ? printInvoice() : exportInvoiceImage(format);

  if (!isTemplateMode && editorStage === 'select') {
    return <div className="invoice-creator ic-template-stage">
      <header className="ic-topbar"><div className="ic-top-title"><button className="ic-back" type="button" onClick={() => navigate('/app/invoices')} aria-label="Back to invoices"><ArrowLeft size={18}/></button><div><div className="ic-breadcrumb">INVOICES <span>/</span> SELECT TEMPLATE</div><h1>Choose an invoice template</h1><p>Select a design first. The editor opens with your invoice on the left and contextual tools on the right.</p></div></div><button type="button" className="ic-outline-btn" onClick={() => navigate('/app/templates')}><LayoutTemplate size={15}/> Browse template studio</button></header>
      <section className="ic-template-selection-panel"><div className="ic-template-selection-heading"><div><span>START WITH A DESIGN</span><h2>Choose your invoice layout</h2><p>Your selected template opens in the live canvas editor. You can change it later.</p></div><span className="ic-template-selection-count">{matchingTemplates.length} templates</span></div>
        <label className="ic-template-search"><span>⌕</span><input value={templateSearch} onChange={event => setTemplateSearch(event.target.value)} placeholder="Search invoice templates…" aria-label="Search invoice templates"/></label>
        <div className="ic-template-filters">{['All','Business','Modern','Minimal'].map(category => <button type="button" key={category} className={templateCategory === category ? 'active' : ''} onClick={() => setTemplateCategory(category)}>{category}</button>)}</div>
        <div className="ic-template-selection-grid">{matchingTemplates.map(template => <button type="button" key={template.id} className={`ic-template-tile ${design.templateId === template.id ? 'selected' : ''}`} onClick={() => chooseTemplateAndEdit(template.id)} title={`Select ${template.name}`}><TemplateMiniPreview template={template} selected={design} compact /><b>{template.name}</b><small>{template.category}</small>{design.templateId === template.id && <em><Check size={11}/></em>}</button>)}</div>
        {!matchingTemplates.length && <p className="ic-template-empty">No templates match this search. Try a different category or name.</p>}
      </section>
    </div>;
  }

  return <div className="invoice-creator">
    <header className="ic-topbar">
      <div className="ic-top-title"><button className="ic-back" onClick={() => navigate(isTemplateMode ? '/app/templates' : '/app/invoices')} aria-label="Back"><ArrowLeft size={18}/></button><div><div className="ic-breadcrumb">{isTemplateMode ? 'TEMPLATES' : 'INVOICES'} <span>/</span> {isTemplateMode ? 'DESIGN STUDIO' : 'NEW INVOICE'}</div><h1>{isPreviewMode ? 'Invoice Designer' : isTemplateMode ? 'Invoice Designer' : 'Create Invoice'}</h1><p>Click any text on the invoice to edit it directly. Upload and move your own brand assets.</p></div></div>
      <div className="ic-top-actions"><span className="ic-autosave"><span/> LIVE PREVIEW</span>{isInvoiceEditorStage && <button type="button" className="ic-outline-btn" onClick={() => setEditorStage('select')}><LayoutTemplate size={15}/> Change template</button>}<ExportDropdown onExport={handleExport}/>{isTemplateMode ? <button className="ic-primary-btn" onClick={saveTemplateDesign} disabled={saving}><Save size={15}/>{saving ? 'Saving…' : 'Save template'}</button> : <button className="ic-primary-btn" onClick={() => saveInvoice('draft')} disabled={saving}><Save size={15}/>{saving ? 'Saving…' : 'Save draft'}</button>}</div>
    </header>
    {!isInvoiceEditorStage && <section className="ic-studio-hero">
      <div className="ic-hero-mark"><FileText size={31}/><Sparkles size={16}/></div>
      <div className="ic-hero-copy"><span>✦ CREATE STUNNING INVOICES</span><h2>{isTemplateMode ? 'Make this template yours' : 'Your brand. Your invoice. Your style.'}</h2><p>Pick a professional template, personalize every line and export a client-ready document.</p></div>
      <div className="ic-hero-points"><span><Check size={14}/> Editable content</span><span><Check size={14}/> Live A4 preview</span><span><Check size={14}/> Logo · QR · Signature</span></div>
    </section>}

    <div className={`ic-workspace ${isInvoiceEditorStage ? 'ic-workspace-editor-only' : ''}`}>
      {!isInvoiceEditorStage && <aside className="ic-controls">
        <div className="ic-controls-head"><div><span>DESIGN LIBRARY</span><h2>Templates Gallery</h2></div><span className="ic-step-count"><LayoutTemplate size={13}/> DESIGN</span></div>
        {error && <div className="ic-alert error"><X size={15}/>{error}</div>}{notice && <div className="ic-alert success"><Check size={15}/>{notice}</div>}
        <section className="ic-quick-template-picker">
          <div className="ic-quick-template-head"><div><span>START WITH A DESIGN</span><b>{selectedTemplate.name}</b><small>{selectedTemplate.category} · {invoiceTemplates.length} professional layouts</small></div><span className="ic-quick-template-mark"><LayoutTemplate size={17}/></span></div>
          <label className="ic-template-search"><span>⌕</span><input value={templateSearch} onChange={event => setTemplateSearch(event.target.value)} placeholder="Find a template..." aria-label="Search invoice templates"/></label>
          <div className="ic-template-filters">{['All','Business','Modern','Minimal'].map(category => <button type="button" key={category} className={templateCategory === category ? 'active' : ''} onClick={() => setTemplateCategory(category)}>{category}</button>)}</div>
          <div className="ic-quick-template-grid">{quickTemplates.map(template => <button type="button" key={template.id} className={`ic-quick-template ${design.templateId === template.id ? 'selected' : ''}`} onClick={() => setTemplate(template.id)} title={`Use ${template.name}`}><TemplateMiniPreview template={template} selected={design} compact /><b>{template.name}</b>{design.templateId === template.id && <em><Check size={11}/></em>}</button>)}</div>
          {!quickTemplates.length && <p className="ic-template-empty">No templates found. Try another search.</p>}
          <button type="button" className="ic-browse-templates" onClick={() => navigate('/app/templates')}>Browse all {invoiceTemplates.length} templates <ArrowLeft size={13}/></button>
        </section>
        <section className="ic-quick-tools-panel">
          <div className="ic-quick-tools-heading"><b>Quick Tools</b><span>Fast edits</span></div>
          <div className="ic-quick-tools-grid">
            <button type="button" onClick={() => setActiveToolTab('Assets')}><QrCode size={15}/> Add QR Code</button>
            <button type="button" onClick={() => setActiveToolTab('Assets')}><ImagePlus size={15}/> Add Signature</button>
            <button type="button" onClick={() => { setActiveToolTab('Advanced'); setShowInvoiceFields(true); }}><FileText size={15}/> Terms & Conditions</button>
            <button type="button" onClick={() => { setActiveToolTab('Advanced'); setShowInvoiceFields(true); }}><ClipboardList size={15}/> Notes</button>
            <button type="button" onClick={() => { setShowInvoiceFields(true); setTimeout(() => document.getElementById('ic-section-items')?.scrollIntoView({behavior:'smooth',block:'center'}), 80); }}><Plus size={15}/> Add Discount</button>
            <button type="button" onClick={() => { setItems(current => current.map(item => ({...item, taxRate: item.taxRate || 18}))); setShowInvoiceFields(true); }}><BadgeIndianRupee size={15}/> Add Tax</button>
          </div>
          <button type="button" className="ic-all-fields-toggle" aria-expanded={showInvoiceFields} onClick={() => setShowInvoiceFields(value => !value)}><SlidersHorizontal size={15}/>{showInvoiceFields ? 'Hide invoice detail form' : 'More invoice fields'}<ChevronDown size={15} className={showInvoiceFields ? 'turned' : ''}/></button>
        </section>
        {showInvoiceFields && <div className="ic-advanced-fields">
        <div className="ic-advanced-fields-heading"><b>Invoice details</b><small>Optional form controls — the canvas is editable directly too.</small></div>
        <Section id="ic-section-business" title="Business information" description="Company details and printed identity" icon={<Building2 size={15}/> }>
          <Field label="Business / brand name" value={design.businessName} onChange={v => setD('businessName', v)} placeholder="Your Business Name"/>
          <Field label="Registered address" value={design.businessAddress} onChange={v => setD('businessAddress', v)} placeholder="Street, city, state, PIN" multiline/>
          <div className="ic-two-col"><Field label="Mobile / phone number" value={design.businessPhone} onChange={v => setD('businessPhone', v)} placeholder="+91 98765 43210"/><Field label="Business email" type="email" value={design.businessEmail} onChange={v => setD('businessEmail', v)} placeholder="hello@company.com"/></div>
          <div className="ic-two-col"><Field label="Website" value={design.businessWebsite} onChange={v => setD('businessWebsite', v)} placeholder="www.company.com"/><Field label="GSTIN" value={design.businessGstin} onChange={v => setD('businessGstin', v)} placeholder="GSTIN number"/></div>
          <div className="ic-two-col"><Field label="PAN (optional)" value={design.businessPan} onChange={v => setD('businessPan', v)} placeholder="Business PAN"/><Field label="UPI ID" value={design.upiId} onChange={v => setD('upiId', v)} placeholder="business@upi"/></div>
          <Field label="Bank name" value={design.businessBankName} onChange={v => setD('businessBankName', v)} placeholder="Bank name"/>
          <div className="ic-two-col"><Field label="Account number" value={design.businessAccountNumber} onChange={v => setD('businessAccountNumber', v)} placeholder="Account number"/><Field label="IFSC code" value={design.businessIfsc} onChange={v => setD('businessIfsc', v)} placeholder="IFSC code"/></div>
        </Section>

        <Section id="ic-section-customer" title="Customer details" description="Select a customer or add their details" icon={<UserRound size={15}/>}>
          {!isTemplateMode && <Field label="Select saved customer" value={customerId} onChange={chooseCustomer}><select value={customerId} onChange={event => chooseCustomer(event.target.value)}><option value="">＋ New customer / enter manually</option>{(records.customers || []).map(row => <option value={row.id} key={row.id}>{row.name}{row.companyName ? ` · ${row.companyName}` : ''}</option>)}</select></Field>}
          <Field label="Customer name *" value={customer.name} onChange={v => setC('name', v)} placeholder="Customer full name"/>
          <Field label="Company name" value={customer.companyName} onChange={v => setC('companyName', v)} placeholder="Company / organisation"/>
          <div className="ic-two-col"><Field label="Email" type="email" value={customer.email} onChange={v => setC('email', v)} placeholder="customer@email.com"/><Field label="Mobile number" value={customer.phone} onChange={v => setC('phone', v)} placeholder="Contact number"/></div>
          <Field label="Billing address" value={customer.billingAddress} onChange={v => setC('billingAddress', v)} placeholder="Street address" multiline/>
          <div className="ic-three-col"><Field label="City" value={customer.city} onChange={v => setC('city', v)} placeholder="City"/><Field label="State" value={customer.state} onChange={v => setC('state', v)} placeholder="State"/><Field label="PIN code" value={customer.postalCode} onChange={v => setC('postalCode', v)} placeholder="PIN"/></div>
          <div className="ic-two-col"><Field label="Country" value={customer.country} onChange={v => setC('country', v)} placeholder="India"/><Field label="Customer GSTIN" value={customer.gstin} onChange={v => setC('gstin', v)} placeholder="GSTIN (optional)"/></div>
        </Section>

        <Section id="ic-section-invoice" title="Invoice details" description="Title, dates and reference numbers" icon={<FileText size={15}/>}>
          <Field label="Invoice heading / title" value={design.invoiceTitle} onChange={v => setD('invoiceTitle', v)} placeholder="TAX INVOICE"/>
          <div className="ic-two-col"><Field label="Issue date" type="date" value={meta.issueDate} onChange={v => setM('issueDate', v)}/><Field label="Due date" type="date" value={meta.dueDate} onChange={v => setM('dueDate', v)}/></div>
          <div className="ic-two-col"><Field label="Purchase order number" value={meta.purchaseOrder} onChange={v => setM('purchaseOrder', v)} placeholder="PO-0001"/><Field label="Reference" value={meta.reference} onChange={v => setM('reference', v)} placeholder="Project / reference"/></div>
          <div className="ic-two-col"><Field label="Document label" value={design.documentLabel} onChange={v => setD('documentLabel', v)} placeholder="DOCUMENT"/><Field label="Invoice title label" value={design.invoiceTitle} onChange={v => setD('invoiceTitle', v)} placeholder="INVOICE"/></div>
        </Section>

        <Section id="ic-section-items" title="Items & services" description="Add as many products or services as needed" icon={<ListChecks size={15}/>}>
          <div className="ic-lines-list">{items.map((line, index) => <div className="ic-line-editor" key={line.id}><div className="ic-line-head"><b>ITEM {String(index + 1).padStart(2, '0')}</b>{items.length > 1 && <button type="button" onClick={() => removeLine(line.id)} title="Remove item"><Trash2 size={14}/></button>}</div>
            {(records.products || []).length > 0 && !isTemplateMode && <Field label="Add from product catalogue" value={line.productId || ''} onChange={v => chooseProduct(line.id, v)}><select value={line.productId || ''} onChange={event => chooseProduct(line.id, event.target.value)}><option value="">Select a saved product (optional)</option>{records.products.map(product => <option value={product.id} key={product.id}>{product.name}</option>)}</select></Field>}
            <Field label="Item / service name" value={line.name} onChange={v => updateLine(line.id, 'name', v)} placeholder="e.g. Website design"/>
            <Field label="Description" value={line.description} onChange={v => updateLine(line.id, 'description', v)} placeholder="Details shown below the item"/>
            <div className="ic-three-col"><Field label="Qty" type="number" value={line.quantity} onChange={v => updateLine(line.id, 'quantity', v)}/><Field label="Unit" value={line.unit} onChange={v => updateLine(line.id, 'unit', v)} placeholder="pcs"/><Field label="Rate (₹)" type="number" value={line.rate} onChange={v => updateLine(line.id, 'rate', v)}/></div>
            <div className="ic-two-col"><Field label="Discount (₹)" type="number" value={line.discount} onChange={v => updateLine(line.id, 'discount', v)}/><Field label="Tax rate (%)" type="number" value={line.taxRate} onChange={v => updateLine(line.id, 'taxRate', v)}/></div>
            <div className="ic-line-total"><span>Line total · including tax</span><b>{currency(calculations.lines[index]?.lineTotal || 0)}</b></div>
          </div>)}</div>
          <button type="button" className="ic-add-line" onClick={addLine}><Plus size={15}/> Add another item</button>
        </Section>

        <Section id="ic-section-notes" title="Notes, payment & footer" description="Messages and payment instructions" icon={<FileText size={15}/>} defaultOpen={false}>
          <Field label="Notes" value={meta.notes} onChange={v => setM('notes', v)} placeholder="Add a message for your customer" multiline/>
          <Field label="Terms & conditions" value={meta.terms} onChange={v => setM('terms', v)} placeholder="Payment and delivery terms" multiline/>
          <Field label="Payment instructions" value={design.paymentInstructions} onChange={v => setD('paymentInstructions', v)} placeholder="How can the customer pay?" multiline/>
          <Field label="Footer message" value={design.footerText} onChange={v => setD('footerText', v)} placeholder="Thank you for your business" multiline/>
          <div className="ic-custom-fields-head"><b>Additional custom fields</b><button type="button" onClick={addCustomField}><Plus size={13}/> Add field</button></div>
          {customFields.map((field, index) => <div className="ic-two-col ic-custom-field" key={index}><Field label="Label" value={field.label} onChange={v => updateCustomField(index, 'label', v)} placeholder="Label"/><Field label="Value" value={field.value} onChange={v => updateCustomField(index, 'value', v)} placeholder="Value"/><button type="button" className="ic-icon-button" onClick={() => setCustomFields(current => current.filter((_, i) => i !== index))}><Trash2 size={14}/></button></div>)}
        </Section>
        </div>}

      </aside>}

      <section className="ic-preview-area">
        <div className="ic-preview-toolbar">
          <div><span>LIVE CANVAS</span><b><Eye size={15}/> Live document preview <i className="ic-live-dot"/></b></div>
          <div className="ic-preview-actions">
            <div className="ic-device-switch" aria-label="Preview device">
              <button type="button" className={previewDevice === 'desktop' ? 'active' : ''} onClick={() => setPreviewDevice('desktop')} title="Desktop preview">▣</button>
              <button type="button" className={previewDevice === 'mobile' ? 'active' : ''} onClick={() => setPreviewDevice('mobile')} title="Compact preview">▯</button>
            </div>
            <span>{design.pageSize || 'A4'} · {design.pageOrientation || 'portrait'}</span>
            <div className="ic-zoom-tools"><button type="button" aria-label="Zoom out" onClick={() => setPreviewZoom(value => Math.max(70, value - 10))}>−</button><b>{previewZoom}%</b><button type="button" aria-label="Zoom in" onClick={() => setPreviewZoom(value => Math.min(120, value + 10))}>+</button></div>
            <button type="button" onClick={() => setPreviewZoom(100)} title="Reset zoom">Reset</button>
            <ExportDropdown onExport={handleExport} label="Export"/>
          </div>
        </div>
        <div className={`ic-paper-wrap ${canvasDropActive ? 'canvas-drop-active' : ''}`}><article onDragOver={onCanvasDragOver} onDragLeave={onCanvasDragLeave} onDrop={onCanvasDrop} onClick={handleCanvasSelection} data-selected-editor={selectedPreviewSection} className={`ic-invoice-paper template-${design.templateId} paper-${String(design.pageSize || 'A4').toLowerCase()} ic-frame-${design.frameStyle || 'thin'} ic-header-${design.headerStyle || 'line'} ic-table-${design.tableStyle || 'clean'} ic-density-${design.tableDensity || 'normal'} ic-pattern-${design.paperPattern || 'plain'} ${design.pageOrientation === 'landscape' ? 'is-landscape' : ''}`} style={{ '--ic-accent': design.accentColor, '--ic-font': design.fontFamily, '--ic-font-scale': Number(design.fontSize || 10) / 10, '--ic-paper': design.paperBackground || '#ffffff', '--ic-logo-width': `${Number(design.logoWidth || 64)}px`, backgroundColor: design.paperBackground || '#ffffff', backgroundImage: invoiceBackgroundImage, backgroundSize: design.backgroundImageDataUrl ? (design.backgroundImageFit || 'cover') : design.paperPattern === 'dots' ? '12px 12px' : design.paperPattern === 'grid' ? '18px 18px' : 'auto', backgroundPosition: 'center', backgroundRepeat: design.backgroundImageDataUrl ? 'no-repeat' : 'repeat', zoom: previewZoom / 100, minHeight: design.pageOrientation === 'landscape' ? '700px' : design.pageSize === 'A5' ? '760px' : '1000px', maxWidth: previewDevice === 'mobile' ? '430px' : design.pageOrientation === 'landscape' ? '1050px' : design.pageSize === 'A5' ? '650px' : '1024px', width: previewDevice === 'mobile' ? '100%' : undefined }}>
          <InvoiceEditorContext.Provider value={{ textStyles: design.textStyles || {} }}>
          {design.templateId === 'xenmark' ? <XenmarkInvoicePreview
            design={design} setD={setD} meta={meta} setM={setM} customer={customer} setC={setC}
            items={items} updateLine={updateLine} calculations={calculations} uploadAsset={uploadAsset} isTemplateMode={isTemplateMode}
            uploadCanvasImage={uploadCanvasImage} updateCanvasImage={updateCanvasImage} removeCanvasImage={removeCanvasImage}
          /> : <>
          {design.showWatermark && design.watermarkText && <div className="ic-paper-watermark" style={{ opacity: Math.max(1, Math.min(18, Number(design.watermarkOpacity || 7))) / 100 }}>{design.watermarkText}</div>}
          <div className={`ic-document-top ${design.logoPosition === 'right' ? 'logo-right' : ''}`} data-editor-tab="Text" data-editor-section="ic-section-business" data-editor-id="heading" style={(design.textStyles || {})['section:heading'] || {}} title="Click to edit invoice heading text">
            <div className="ic-brand-block">
              {design.showLogo && !design.logoCanvasFree && (design.logoDataUrl ? <img className="ic-business-logo" src={design.logoDataUrl} alt="Business logo" data-editor-tab="Assets" data-asset-key="logo" title="Click to edit logo settings"/> : <button type="button" className="ic-logo-placeholder" data-editor-tab="Assets" data-asset-key="logo" title="Click to upload your business logo"><ImagePlus size={18}/><small>ADD LOGO</small></button>)}
              <div>
                <h2><CanvasEditable as="span" value={design.businessName} placeholder="YOUR BUSINESS NAME" onCommit={value => setD('businessName', value)} label="Business name"/></h2>
                {design.businessTagline && <p className="ic-business-tagline"><CanvasEditable value={design.businessTagline} placeholder="Business tagline" onCommit={value => setD('businessTagline', value)} label="Business tagline"/></p>}
                <p><CanvasEditable value={design.businessAddress} placeholder="Your business address will appear here" onCommit={value => setD('businessAddress', value)} label="Business address"/></p>
                <p><CanvasEditable value={[design.businessPhone, design.businessEmail, design.businessWebsite].filter(Boolean).join(' · ')} placeholder="Phone · Email · Website" onCommit={value => { const parts = value.split('·').map(part => part.trim()); setD('businessPhone', parts[0] || ''); setD('businessEmail', parts[1] || ''); setD('businessWebsite', parts[2] || ''); }} label="Business contact details"/></p>
                {design.showBusinessGstin && <p><CanvasEditable value={design.businessGstin ? `${design.businessGstinLabel || 'GSTIN'}: ${design.businessGstin}` : ''} placeholder="GSTIN" onCommit={value => setD('businessGstin', value.replace(/^GSTIN\s*:?\s*/i, ''))} label="Business GSTIN"/></p>}
                {design.businessPan && <p><CanvasEditable value={`${design.panLabel || 'PAN'}: ${design.businessPan}`} placeholder="PAN" onCommit={value => setD('businessPan', value.replace(/^PAN\s*:?\s*/i, ''))} label="Business PAN"/></p>}
              </div>
            </div>
            <div className="ic-invoice-title-block" style={{ textAlign: design.headingAlignment || 'right' }}>
              <CanvasEditable as="span" value={design.documentLabel} placeholder="DOCUMENT" onCommit={value => setD('documentLabel', value)} label="Document label"/>
              <h1><CanvasEditable value={design.invoiceTitle} placeholder="INVOICE" onCommit={value => setD('invoiceTitle', value)} label="Invoice title"/></h1>
              {design.invoiceSubtitle && <p className="ic-invoice-subtitle"><CanvasEditable value={design.invoiceSubtitle} placeholder="Invoice subtitle" onCommit={value => setD('invoiceSubtitle', value)} label="Invoice subtitle"/></p>}
              <b><CanvasEditable value={`${design.invoiceNumberLabel || 'INVOICE NO.'} · ${meta.invoiceNumber || `SPY-${new Date(meta.issueDate || today).getFullYear()}-001`}`} placeholder="INVOICE NO." onCommit={value => { const parts = value.split('·'); setD('invoiceNumberLabel', (parts[0] || '').trim()); if (parts[1]) { setM('invoiceNumber', parts[1].trim()); setM('manualInvoiceNumber', true); } }} label="Invoice number"/></b>
            </div>
          </div>
          <div className="ic-document-meta" data-editor-tab="Text" data-editor-section="ic-section-invoice" data-editor-id="meta" style={(design.textStyles || {})['section:meta'] || {}} title="Click to edit invoice labels">
            <div><small><CanvasEditable value={design.issueDateLabel} placeholder="ISSUE DATE" onCommit={value => setD('issueDateLabel', value)} label="Issue date label"/></small><b><CanvasEditable value={meta.issueDate ? new Date(`${meta.issueDate}T00:00:00`).toLocaleDateString('en-IN') : ''} placeholder="Issue date" onCommit={value => { const match = value.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/); setM('issueDate', match ? `${match[3]}-${match[2].padStart(2,'0')}-${match[1].padStart(2,'0')}` : value); }} label="Issue date"/></b></div>
            <div><small><CanvasEditable value={design.dueDateLabel} placeholder="DUE DATE" onCommit={value => setD('dueDateLabel', value)} label="Due date label"/></small><b><CanvasEditable value={meta.dueDate ? new Date(`${meta.dueDate}T00:00:00`).toLocaleDateString('en-IN') : ''} placeholder="Due date" onCommit={value => { const match = value.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/); setM('dueDate', match ? `${match[3]}-${match[2].padStart(2,'0')}-${match[1].padStart(2,'0')}` : value); }} label="Due date"/></b></div>
            <div><small><CanvasEditable value={design.referenceLabel} placeholder="REFERENCE" onCommit={value => setD('referenceLabel', value)} label="Reference label"/></small><b><CanvasEditable value={meta.reference} placeholder="Reference" onCommit={value => setM('reference', value)} label="Reference"/></b></div>
            <div><small><CanvasEditable value={design.purchaseOrderLabel} placeholder="PO NUMBER" onCommit={value => setD('purchaseOrderLabel', value)} label="Purchase order label"/></small><b><CanvasEditable value={meta.purchaseOrder} placeholder="PO number" onCommit={value => setM('purchaseOrder', value)} label="Purchase order number"/></b></div>
          </div>
          <div className="ic-parties" data-editor-tab="Text" data-editor-section="ic-section-customer" data-editor-id="parties" style={(design.textStyles || {})['section:parties'] || {}} title="Click to edit bill-to and bill-from details">
            <div><span><CanvasEditable value={design.billFromLabel} placeholder="BILL FROM" onCommit={value => setD('billFromLabel', value)} label="Bill from heading"/></span><b><CanvasEditable value={design.businessName} placeholder="Your business" onCommit={value => setD('businessName', value)} label="Business name"/></b><p><CanvasEditable value={design.businessAddress} placeholder="Business address" onCommit={value => setD('businessAddress', value)} label="Business address"/></p><p><CanvasEditable value={design.businessPhone} placeholder="Business phone" onCommit={value => setD('businessPhone', value)} label="Business phone"/></p><p><CanvasEditable value={design.businessEmail} placeholder="Business email" onCommit={value => setD('businessEmail', value)} label="Business email"/></p></div>
            <div><span><CanvasEditable value={design.billToLabel} placeholder="BILL TO" onCommit={value => setD('billToLabel', value)} label="Bill to heading"/></span><b><CanvasEditable value={customer.name} placeholder="Customer name" onCommit={value => setC('name', value)} label="Customer name"/></b><p><CanvasEditable value={customer.companyName} placeholder="Company / organisation" onCommit={value => setC('companyName', value)} label="Customer company"/></p><p><CanvasEditable value={customer.billingAddress} placeholder="Billing address" onCommit={value => setC('billingAddress', value)} label="Customer address"/></p><p><CanvasEditable value={[customer.city, customer.state, customer.postalCode, customer.country].filter(Boolean).join(', ')} placeholder="City, state, PIN, country" onCommit={value => { const parts = value.split(',').map(part => part.trim()); setC('city', parts[0] || ''); setC('state', parts[1] || ''); setC('postalCode', parts[2] || ''); setC('country', parts[3] || 'India'); }} label="Customer location"/></p><p><CanvasEditable value={[customer.email, customer.phone].filter(Boolean).join(' · ')} placeholder="Customer email · phone" onCommit={value => { const parts = value.split('·').map(part => part.trim()); const contact = parts.find(part => part.includes('@')) || ''; const phone = parts.find(part => part !== contact) || ''; setC('email', contact); setC('phone', phone); }} label="Customer contact"/></p>{design.showCustomerGstin && <p><CanvasEditable value={customer.gstin ? `${design.customerGstinLabel || 'GSTIN'}: ${customer.gstin}` : ''} placeholder="Customer GSTIN" onCommit={value => setC('gstin', value.replace(/^GSTIN\s*:?\s*/i, ''))} label="Customer GSTIN"/></p>}</div>
          </div>
          {customFields.length > 0 && <div className="ic-extra-fields">{customFields.map((field, index) => <div key={index}><small><CanvasEditable value={field.label} placeholder="FIELD" onCommit={value => updateCustomField(index, 'label', value)} label="Custom field label"/></small><b><CanvasEditable value={field.value} placeholder="Value" onCommit={value => updateCustomField(index, 'value', value)} label="Custom field value"/></b></div>)}</div>}
          <table className="ic-preview-table" data-editor-tab="Text" data-editor-section="ic-section-items" data-editor-id="items" style={(design.textStyles || {})['section:items'] || {}} title="Click to edit table headings"><thead><tr>
            <th><CanvasEditable value={design.itemLabel} placeholder="DESCRIPTION" onCommit={value => setD('itemLabel', value)} label="Item heading"/></th>{design.showSku && <th><CanvasEditable value={design.skuLabel} placeholder="SKU" onCommit={value => setD('skuLabel', value)} label="SKU heading"/></th>}<th><CanvasEditable value={design.quantityLabel} placeholder="QTY" onCommit={value => setD('quantityLabel', value)} label="Quantity heading"/></th><th><CanvasEditable value={design.rateLabel} placeholder="RATE" onCommit={value => setD('rateLabel', value)} label="Rate heading"/></th><th><CanvasEditable value={design.amountLabel} placeholder="AMOUNT" onCommit={value => setD('amountLabel', value)} label="Amount heading"/></th>
          </tr></thead><tbody>{calculations.lines.map((line, index) => <tr key={line.id}><td><b><CanvasEditable value={line.name} placeholder={`Invoice item ${index + 1}`} onCommit={value => updateLine(line.id, 'name', value)} label={`Item ${index + 1} description`}/></b>{line.description && <small><CanvasEditable value={line.description} placeholder="Item details" onCommit={value => updateLine(line.id, 'description', value)} label={`Item ${index + 1} details`}/></small>}</td>{design.showSku && <td><CanvasEditable value={line.sku} placeholder="SKU" onCommit={value => updateLine(line.id, 'sku', value)} label={`Item ${index + 1} SKU`}/></td>}<td><CanvasEditable value={`${line.quantity} ${line.unit}`} placeholder="1 pcs" onCommit={value => { const match = value.match(/^\s*(\d+(?:\.\d+)?)/); updateLine(line.id, 'quantity', match ? Number(match[1]) : 1); updateLine(line.id, 'unit', value.replace(/^\s*\d+(?:\.\d+)?\s*/, '') || 'pcs'); }} label={`Item ${index + 1} quantity`}/></td><td><CanvasEditable value={currency(line.rate)} placeholder="₹0.00" onCommit={value => updateLine(line.id, 'rate', Number(value.replace(/[^\d.-]/g, '')) || 0)} label={`Item ${index + 1} rate`}/></td><td><CanvasEditable value={currency(line.lineTotal)} placeholder="₹0.00" onCommit={value => { const amount = Number(value.replace(/[^\d.-]/g, '')) || 0; updateLine(line.id, 'rate', Math.max(0, amount / Math.max(1, Number(line.quantity) || 1))); }} label={`Item ${index + 1} amount`}/></td></tr>)}</tbody></table>
          <div className="ic-summary-area" data-editor-tab="Text" data-editor-section="ic-section-notes" data-editor-id="summary" style={(design.textStyles || {})['section:summary'] || {}} title="Click to edit summary and payment wording"><div className="ic-summary-notes">
            {meta.notes && <div><span><CanvasEditable value={design.notesLabel} placeholder="NOTES" onCommit={value => setD('notesLabel', value)} label="Notes label"/></span><p><CanvasEditable value={meta.notes} placeholder="Notes" onCommit={value => setM('notes', value)} label="Invoice notes" multiline/></p></div>}
            {meta.terms && <div><span><CanvasEditable value={design.termsLabel} placeholder="TERMS & CONDITIONS" onCommit={value => setD('termsLabel', value)} label="Terms label"/></span><p><CanvasEditable value={meta.terms} placeholder="Terms and conditions" onCommit={value => setM('terms', value)} label="Terms and conditions" multiline/></p></div>}
            {design.showPaymentInstructions && design.paymentInstructions && <div><span><CanvasEditable value={design.paymentInstructionsLabel} placeholder="PAYMENT INSTRUCTIONS" onCommit={value => setD('paymentInstructionsLabel', value)} label="Payment instructions label"/></span><p><CanvasEditable value={design.paymentInstructions} placeholder="Payment instructions" onCommit={value => setD('paymentInstructions', value)} label="Payment instructions" multiline/></p></div>}
            {(design.businessBankName || design.upiId || design.businessAccountNumber) && <div><span><CanvasEditable value={design.paymentDetailsLabel} placeholder="PAYMENT DETAILS" onCommit={value => setD('paymentDetailsLabel', value)} label="Payment details label"/></span><p><CanvasEditable value={[design.businessBankName, design.businessAccountNumber && `${design.accountNumberLabel || 'A/C'} ${design.businessAccountNumber}`, design.businessIfsc && `${design.ifscLabel || 'IFSC'} ${design.businessIfsc}`, design.upiId && `${design.upiLabel || 'UPI'} ${design.upiId}`].filter(Boolean).join(' · ')} placeholder="Bank / account / UPI" onCommit={value => setD('upiId', value)} label="Payment details"/></p></div>}
          </div><div className="ic-totals"><div><span><CanvasEditable value={design.subtotalLabel} placeholder="Subtotal" onCommit={value => setD('subtotalLabel', value)} label="Subtotal label"/></span><b>{currency(calculations.subtotal)}</b></div>{calculations.discount > 0 && <div><span><CanvasEditable value={design.discountLabel} placeholder="Discount" onCommit={value => setD('discountLabel', value)} label="Discount label"/></span><b>− {currency(calculations.discount)}</b></div>}<div><span><CanvasEditable value={design.taxLabel} placeholder="Tax" onCommit={value => setD('taxLabel', value)} label="Tax label"/></span><b>{currency(calculations.tax)}</b></div><div className="grand-total"><span><CanvasEditable value={design.totalLabel} placeholder="Total Due" onCommit={value => setD('totalLabel', value)} label="Grand total label"/></span><b>{currency(calculations.total)}</b></div></div></div>
          {design.showQr && !design.qrCanvasFree && <div className={`ic-payment-qr is-${design.qrPosition || 'right'}`} data-editor-tab="Assets" data-editor-id="qr" title="Click to edit QR placement and caption"><div className="ic-qr-art" style={{ width: `${Number(design.qrWidth || 82)}px`, height: `${Number(design.qrWidth || 82)}px` }}>{design.qrDataUrl ? <img src={design.qrDataUrl} data-asset-key="qr" alt="Payment QR code"/> : <div className="ic-qr-placeholder"><QrCode size={26}/><small>ADD QR</small></div>}</div><div><b><CanvasEditable value={design.qrCaption} placeholder="SCAN TO PAY" onCommit={value => setD('qrCaption', value)} label="QR caption"/></b><span><CanvasEditable value={design.qrInstruction} placeholder="Use your UPI app to pay this invoice" onCommit={value => setD('qrInstruction', value)} label="QR instruction"/></span></div></div>}
          {design.showSignature && !design.signatureCanvasFree && <div className={`ic-signature-block is-${design.signatureAlignment || 'right'}`} data-editor-tab="Assets" data-editor-id="signature" title="Click to edit signature details"><span className="ic-signature-caption"><CanvasEditable value={design.signatureCaption} placeholder="AUTHORISED SIGNATORY" onCommit={value => setD('signatureCaption', value)} label="Signature caption"/></span><div className="ic-signature-art">{design.signatureDataUrl ? <img src={design.signatureDataUrl} data-asset-key="signature" alt="Authorised signature" style={{ width: `${Number(design.signatureWidth || 170)}px` }}/> : <span data-asset-key="signature">Signature</span>}</div><div className="ic-signature-line"/><b><CanvasEditable value={design.signatureName} placeholder={design.businessName || 'Authorised Signatory'} onCommit={value => setD('signatureName', value)} label="Signature name"/></b><small><CanvasEditable value={design.signatureTitle} placeholder="Authorised Signatory" onCommit={value => setD('signatureTitle', value)} label="Signature designation"/></small></div>}
          {design.showFooter && <footer className="ic-paper-footer" data-editor-tab="Text" data-editor-id="footer" style={(design.textStyles || {})['section:footer'] || {}} title="Click to edit footer text"><b><CanvasEditable value={design.footerText} placeholder="Thank you for your business." onCommit={value => setD('footerText', value)} label="Footer message"/></b><span><CanvasEditable value={design.businessName} placeholder="SPYRIX INVOICE" onCommit={value => setD('businessName', value)} label="Business name in footer"/></span></footer>}
          </>}
          <InvoiceCanvasImages images={design.customCanvasImages} onMove={updateCanvasImage} onRemove={removeCanvasImage}/>
          </InvoiceEditorContext.Provider>
          {design.templateId !== 'xenmark' && <InvoiceTemplateAssetLayer design={design} setD={setD}/>}
        </article></div>
        <div className="ic-preview-footnote"><ShieldCheck size={14}/> Live preview · Tap any text in the document to edit it directly. Upload the logo, payment QR and signature from their positions in the invoice.</div>
        <div className="ic-preview-final-actions">{isTemplateMode ? <><button type="button" className="ic-outline-btn" onClick={() => navigate('/app/templates')}><X size={15}/> Cancel</button><button type="button" className="ic-primary-btn" onClick={saveTemplateDesign} disabled={saving}><Save size={15}/>{saving ? 'Saving…' : 'Save template design'}</button></> : <><button type="button" className="ic-outline-btn" onClick={() => navigate('/app/invoices')}><X size={15}/> Cancel</button><button type="button" className="ic-primary-btn" onClick={() => saveInvoice('draft')} disabled={saving}><Save size={15}/> Save draft</button><button type="button" className="ic-issue-btn" onClick={() => saveInvoice('issued')} disabled={saving}><Check size={15}/>{saving ? 'Saving…' : 'Save & issue'}</button></>}</div>
      </section>

      <aside className="ic-design-tools">
        {isInvoiceEditorStage ? <div className="ic-context-inspector">
          <div className="ic-controls-head"><div><span>CONTEXT TOOLS</span><h2>{selectedElementKind === 'text' ? 'Text formatting' : selectedElementKind === 'image' ? 'Image settings' : 'Page design'}</h2><p className="ic-context-selected-label">{selectedElementLabel}</p></div><span className="ic-step-count">{selectedElementKind.toUpperCase()}</span></div>
          {error && <div className="ic-alert error"><X size={15}/>{error}</div>}{notice && <div className="ic-alert success"><Check size={15}/>{notice}</div>}
          <button type="button" className="ic-outline-btn ic-change-template" onClick={() => setEditorStage('select')}><LayoutTemplate size={14}/> Change template</button>
          {selectedElementKind === 'text' && <div className="ic-inspector-content">
            <Section title="Text formatting" description="Apply formatting to the selected text" icon={<Type size={15}/> }>
              <div className="ic-text-format-buttons">
                <button type="button" className={selectedTextStyle.bold ? 'active' : ''} aria-pressed={Boolean(selectedTextStyle.bold)} onClick={() => updateSelectedTextStyle('bold', !selectedTextStyle.bold)}><b>B</b><span>Bold</span></button>
                <button type="button" className={selectedTextStyle.italic ? 'active' : ''} aria-pressed={Boolean(selectedTextStyle.italic)} onClick={() => updateSelectedTextStyle('italic', !selectedTextStyle.italic)}><i>I</i><span>Italic</span></button>
                <button type="button" className={selectedTextStyle.underline ? 'active' : ''} aria-pressed={Boolean(selectedTextStyle.underline)} onClick={() => updateSelectedTextStyle('underline', !selectedTextStyle.underline)}><u>U</u><span>Underline</span></button>
                <button type="button" className={selectedTextStyle.textAlign === 'center' ? 'active' : ''} onClick={() => updateSelectedTextStyle('textAlign', selectedTextStyle.textAlign === 'center' ? 'left' : 'center')}><span>↔</span><small>Align</small></button>
              </div>
              <Field label={`Font size · ${selectedTextStyle.fontSize || 12}px`} value={selectedTextStyle.fontSize || 12} onChange={value => updateSelectedTextStyle('fontSize', Number(value))}><input type="range" min="7" max="48" step="1" value={selectedTextStyle.fontSize || 12} onChange={event => updateSelectedTextStyle('fontSize', Number(event.target.value))}/></Field>
              <Field label="Text colour" value={selectedTextStyle.color || '#171717'} onChange={value => updateSelectedTextStyle('color', value)}><div className="ic-color-input"><input type="color" value={selectedTextStyle.color || '#171717'} onChange={event => updateSelectedTextStyle('color', event.target.value)}/><code>{selectedTextStyle.color || '#171717'}</code></div></Field>
              <Field label="Font family" value={selectedTextStyle.fontFamily || design.fontFamily || 'Arial'} onChange={value => updateSelectedTextStyle('fontFamily', value)}><select value={selectedTextStyle.fontFamily || design.fontFamily || 'Arial'} onChange={event => updateSelectedTextStyle('fontFamily', event.target.value)}>{['Arial','Inter','Poppins','Georgia','Tahoma','Verdana','Trebuchet MS','Courier New','Times New Roman'].map(font => <option key={font} value={font}>{font}</option>)}</select></Field>
              <Field label="Text alignment" value={selectedTextStyle.textAlign || 'left'} onChange={value => updateSelectedTextStyle('textAlign', value)}><select value={selectedTextStyle.textAlign || 'left'} onChange={event => updateSelectedTextStyle('textAlign', event.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option><option value="justify">Justify</option></select></Field>
              <button type="button" className="ic-outline-btn full" onClick={() => setDesign(current => { const next = { ...current, textStyles: { ...(current.textStyles || {}) } }; delete next.textStyles[selectedTextId]; return next; })}><X size={14}/> Reset selected formatting</button>
            </Section>
          </div>}
          {selectedElementKind === 'image' && <div className="ic-inspector-content">
            {selectedImageKey === 'custom' && selectedCustomImage ? <Section title="Selected canvas image" description="Resize, move or remove this uploaded image" icon={<ImagePlus size={15}/> }>
              <div className="ic-selected-image-preview"><img src={selectedCustomImage.dataUrl} alt={selectedCustomImage.name || 'Selected image'}/><span>{selectedCustomImage.name || 'Uploaded image'}</span></div>
              <Field label={`Width · ${selectedCustomImage.width || 18}%`} value={selectedCustomImage.width || 18} onChange={value => updateCanvasImage(selectedCustomImage.id, { width: Number(value) })}><input type="range" min="6" max="70" step="1" value={selectedCustomImage.width || 18} onChange={event => updateCanvasImage(selectedCustomImage.id, { width: Number(event.target.value) })}/></Field>
              <Field label={`Horizontal position · ${Math.round(selectedCustomImage.x || 0)}%`} value={selectedCustomImage.x || 0} onChange={value => updateCanvasImage(selectedCustomImage.id, { x: Number(value) })}><input type="range" min="0" max="94" step="1" value={selectedCustomImage.x || 0} onChange={event => updateCanvasImage(selectedCustomImage.id, { x: Number(event.target.value) })}/></Field>
              <Field label={`Vertical position · ${Math.round(selectedCustomImage.y || 0)}%`} value={selectedCustomImage.y || 0} onChange={value => updateCanvasImage(selectedCustomImage.id, { y: Number(value) })}><input type="range" min="0" max="96" step="1" value={selectedCustomImage.y || 0} onChange={event => updateCanvasImage(selectedCustomImage.id, { y: Number(event.target.value) })}/></Field>
              <button type="button" className="ic-danger-action full" onClick={() => { removeCanvasImage(selectedCustomImage.id); setSelectedCustomImageId(''); setSelectedElementKind('page'); setSelectedElementLabel('Full invoice page'); }}><Trash2 size={14}/> Remove image</button>
            </Section> : <>
              <Section title={selectedImageKey === 'qr' ? 'Payment QR code' : selectedImageKey === 'signature' ? 'Signature image' : 'Business logo'} description="Replace, resize or position the selected asset" icon={selectedImageKey === 'qr' ? <QrCode size={15}/> : <ImagePlus size={15}/> }>
                <UploadAsset title={selectedImageKey === 'qr' ? 'Payment QR code' : selectedImageKey === 'signature' ? 'Signature image' : 'Business logo'} hint="PNG, JPG or WEBP image" value={design[selectedImageKey === 'qr' ? 'qrDataUrl' : selectedImageKey === 'signature' ? 'signatureDataUrl' : 'logoDataUrl']} onUpload={uploadAsset(selectedImageKey === 'qr' ? 'qrDataUrl' : selectedImageKey === 'signature' ? 'signatureDataUrl' : 'logoDataUrl')} onRemove={() => { setD(selectedImageKey === 'qr' ? 'qrDataUrl' : selectedImageKey === 'signature' ? 'signatureDataUrl' : 'logoDataUrl', ''); setD(`${selectedImageKey === 'qr' ? 'showQr' : selectedImageKey === 'signature' ? 'showSignature' : 'showLogo'}`, false); }} icon={selectedImageKey === 'qr' ? QrCode : ImagePlus}/>
                <label className="ic-switch-row"><span>Allow free placement</span><input type="checkbox" checked={Boolean(design[`${selectedImageKey}CanvasFree`])} onChange={event => { const key = selectedImageKey || 'logo'; const free = event.target.checked; setD(`${key}CanvasFree`, free); if (free) { setD(`${key}CanvasX`, design[`${key}CanvasX`] ?? 4); setD(`${key}CanvasY`, design[`${key}CanvasY`] ?? 4); } }}/></label>
                <Field label={`Image width · ${design[`${selectedImageKey}CanvasFree`] ? `${design[`${selectedImageKey}CanvasWidth`] || ({logo:33,qr:15,signature:24}[selectedImageKey] || 18)}%` : `${design[selectedImageKey === 'qr' ? 'qrWidth' : selectedImageKey === 'signature' ? 'signatureWidth' : 'logoWidth'] || ({logo:64,qr:82,signature:170}[selectedImageKey] || 64)}px`}`} value={design[`${selectedImageKey}CanvasFree`] ? (design[`${selectedImageKey}CanvasWidth`] || ({logo:33,qr:15,signature:24}[selectedImageKey] || 18)) : (design[selectedImageKey === 'qr' ? 'qrWidth' : selectedImageKey === 'signature' ? 'signatureWidth' : 'logoWidth'] || ({logo:64,qr:82,signature:170}[selectedImageKey] || 64))} onChange={value => setD(design[`${selectedImageKey}CanvasFree`] ? `${selectedImageKey}CanvasWidth` : (selectedImageKey === 'qr' ? 'qrWidth' : selectedImageKey === 'signature' ? 'signatureWidth' : 'logoWidth'), Number(value))}><input type="range" min={design[`${selectedImageKey}CanvasFree`] ? 6 : 35} max={design[`${selectedImageKey}CanvasFree`] ? 70 : 240} step="1" value={design[`${selectedImageKey}CanvasFree`] ? (design[`${selectedImageKey}CanvasWidth`] || ({logo:33,qr:15,signature:24}[selectedImageKey] || 18)) : (design[selectedImageKey === 'qr' ? 'qrWidth' : selectedImageKey === 'signature' ? 'signatureWidth' : 'logoWidth'] || ({logo:64,qr:82,signature:170}[selectedImageKey] || 64))} onChange={event => setD(design[`${selectedImageKey}CanvasFree`] ? `${selectedImageKey}CanvasWidth` : (selectedImageKey === 'qr' ? 'qrWidth' : selectedImageKey === 'signature' ? 'signatureWidth' : 'logoWidth'), Number(event.target.value))}/></Field>
                {design[`${selectedImageKey}CanvasFree`] && <><Field label={`Horizontal position · ${Math.round(design[`${selectedImageKey}CanvasX`] || 0)}%`} value={design[`${selectedImageKey}CanvasX`] || 0} onChange={value => setD(`${selectedImageKey}CanvasX`, Number(value))}><input type="range" min="0" max="94" step="1" value={design[`${selectedImageKey}CanvasX`] || 0} onChange={event => setD(`${selectedImageKey}CanvasX`, Number(event.target.value))}/></Field><Field label={`Vertical position · ${Math.round(design[`${selectedImageKey}CanvasY`] || 0)}%`} value={design[`${selectedImageKey}CanvasY`] || 0} onChange={value => setD(`${selectedImageKey}CanvasY`, Number(value))}><input type="range" min="0" max="96" step="1" value={design[`${selectedImageKey}CanvasY`] || 0} onChange={event => setD(`${selectedImageKey}CanvasY`, Number(event.target.value))}/></Field><button type="button" className="ic-outline-btn full" onClick={() => setD(`${selectedImageKey}CanvasFree`, false)}><Pin size={14}/> Return to template position</button></>}
                <label className="ic-switch-row"><span>Show image on invoice</span><input type="checkbox" checked={Boolean(design[selectedImageKey === 'qr' ? 'showQr' : selectedImageKey === 'signature' ? 'showSignature' : 'showLogo'])} onChange={event => setD(selectedImageKey === 'qr' ? 'showQr' : selectedImageKey === 'signature' ? 'showSignature' : 'showLogo', event.target.checked)}/></label>
              </Section>
            </>}
            <Section title="Add another image" description="Upload any image, then drag it on the invoice" icon={<ImagePlus size={15}/> }><label className="ic-canvas-image-upload"><ImagePlus size={17}/><span><b>Upload image to canvas</b><small>PNG, JPG or WEBP</small></span><Upload size={15}/><input type="file" accept="image/*" onChange={uploadCanvasImage}/></label></Section>
          </div>}
          {selectedElementKind === 'page' && <div className="ic-inspector-content">
            <Section title="Page design" description="Change page colour, typography, frame and layout" icon={<Palette size={15}/> }>
              <Field label="Page colour" value={design.paperBackground || '#ffffff'} onChange={value => setD('paperBackground', value)}><div className="ic-color-input"><input type="color" value={design.paperBackground || '#ffffff'} onChange={event => setD('paperBackground', event.target.value)}/><code>{design.paperBackground || '#ffffff'}</code></div></Field>
              <Field label="Brand accent" value={design.accentColor || '#111111'} onChange={value => setD('accentColor', value)}><div className="ic-color-input"><input type="color" value={design.accentColor || '#111111'} onChange={event => setD('accentColor', event.target.value)}/><code>{design.accentColor || '#111111'}</code></div></Field>
              <Field label="Invoice font family" value={design.fontFamily || 'Arial'} onChange={value => setD('fontFamily', value)}><select value={design.fontFamily || 'Arial'} onChange={event => setD('fontFamily', event.target.value)}>{['Arial','Inter','Poppins','Georgia','Tahoma','Verdana','Trebuchet MS','Courier New','Times New Roman'].map(font => <option key={font} value={font}>{font}</option>)}</select></Field>
              <Field label={`Base font size · ${design.fontSize || 10}px`} value={design.fontSize || 10} onChange={value => setD('fontSize', Number(value))}><input type="range" min="8" max="18" step="1" value={design.fontSize || 10} onChange={event => setD('fontSize', Number(event.target.value))}/></Field>
              <Field label="Page frame" value={design.frameStyle || 'thin'} onChange={value => setD('frameStyle', value)}><select value={design.frameStyle || 'thin'} onChange={event => setD('frameStyle', event.target.value)}><option value="none">None</option><option value="thin">Thin border</option><option value="double">Double border</option><option value="dashed">Dashed border</option></select></Field>
              <Field label="Header design" value={design.headerStyle || 'line'} onChange={value => setD('headerStyle', value)}><select value={design.headerStyle || 'line'} onChange={event => setD('headerStyle', event.target.value)}><option value="line">Accent underline</option><option value="band">Solid colour band</option><option value="split">Split header</option><option value="minimal">Minimal</option></select></Field>
              <Field label="Table design" value={design.tableStyle || 'clean'} onChange={value => setD('tableStyle', value)}><select value={design.tableStyle || 'clean'} onChange={event => setD('tableStyle', event.target.value)}><option value="clean">Clean lines</option><option value="striped">Striped rows</option><option value="boxed">Boxed grid</option><option value="minimal">Minimal</option></select></Field>
              <div className="ic-two-col"><Field label="Paper size" value={design.pageSize || 'A4'} onChange={value => setD('pageSize', value)}><select value={design.pageSize || 'A4'} onChange={event => setD('pageSize', event.target.value)}><option>A4</option><option>A5</option><option>Letter</option></select></Field><Field label="Orientation" value={design.pageOrientation || 'portrait'} onChange={value => setD('pageOrientation', value)}><select value={design.pageOrientation || 'portrait'} onChange={event => setD('pageOrientation', event.target.value)}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></Field></div>
              <Field label="Paper texture" value={design.paperPattern || 'plain'} onChange={value => setD('paperPattern', value)}><select value={design.paperPattern || 'plain'} onChange={event => setD('paperPattern', event.target.value)}><option value="plain">Plain</option><option value="dots">Dots</option><option value="grid">Grid</option><option value="diagonal">Diagonal</option></select></Field>
              <button type="button" className="ic-outline-btn full" onClick={() => setEditorStage('select')}><LayoutTemplate size={14}/> Choose a different template</button>
            </Section>
            <Section title="Logo, QR & signature uploads" description="Upload assets even before selecting them on the canvas" icon={<ImagePlus size={15}/>} defaultOpen={false}>
              <UploadAsset title="Business logo" hint="Upload or replace the company logo" value={design.logoDataUrl} onUpload={uploadAsset('logoDataUrl')} onRemove={() => setD('logoDataUrl', '')} icon={ImagePlus}/>
              <UploadAsset title="Payment QR code" hint="UPI or payment QR image" value={design.qrDataUrl} onUpload={uploadAsset('qrDataUrl')} onRemove={() => setD('qrDataUrl', '')} icon={QrCode}/>
              <UploadAsset title="Signature image" hint="Transparent PNG recommended" value={design.signatureDataUrl} onUpload={uploadAsset('signatureDataUrl')} onRemove={() => setD('signatureDataUrl', '')} icon={ImagePlus}/>
            </Section>
          </div>}
          <div className="ic-context-bottom"><ExportDropdown onExport={handleExport} label="Export invoice"/><button type="button" className="ic-primary-btn full" onClick={() => saveInvoice('draft')} disabled={saving}><Save size={15}/>{saving ? 'Saving…' : 'Save draft'}</button><button type="button" className="ic-issue-btn full" onClick={() => saveInvoice('issued')} disabled={saving}><Check size={15}/>{saving ? 'Saving…' : 'Save & issue invoice'}</button></div>
        </div> : <>
        <div className="ic-controls-head"><div><span>DESIGN STUDIO</span><h2>Make it yours</h2></div><span className="ic-step-count"><SlidersHorizontal size={13}/> STYLE</span></div>
        <div className="ic-readiness-card"><div className="ic-readiness-top"><div><span>DOCUMENT READINESS</span><b>{completionProgress}% complete</b></div><strong>{completionChecks.filter(item => item.done).length}/{completionChecks.length}</strong></div><div className="ic-readiness-track"><i style={{ width: `${completionProgress}%` }}/></div><div className="ic-readiness-checks">{completionChecks.map(item => <span key={item.label} className={item.done ? 'complete' : ''}><i>{item.done ? '✓' : '·'}</i>{item.label}</span>)}</div></div>
        <div className="ic-inspector-tabs" role="tablist" aria-label="Invoice design tools">
          {[['Design', 'Colors', Palette], ['Elements', 'Assets', ImagePlus], ['Fonts', 'Fonts', Type], ['Advanced', 'Advanced', SlidersHorizontal]].map(([label, tab, Icon]) => <button type="button" key={tab} role="tab" aria-selected={activeToolTab === tab} className={activeToolTab === tab ? 'active' : ''} onClick={() => setActiveToolTab(tab)}><Icon size={15}/><span>{label}</span></button>)}
        </div>

        {activeToolTab === 'Colors' && <div className="ic-inspector-content">
          <Section title="Quick design moods" description="Apply a complete visual style in one click" icon={<Sparkles size={15}/> }>
            <div className="ic-layout-preset-grid">{layoutPresets.map(preset => <button type="button" key={preset.id} className={`ic-layout-preset ${activeLayoutPreset?.id === preset.id ? 'active' : ''}`} onClick={() => applyLayoutPreset(preset)}><span className="ic-layout-preset-art" style={{ '--preset-accent': preset.accentColor }}><i/><i/><i/><b/></span><span><b>{preset.name}</b><small>{preset.description}</small></span>{activeLayoutPreset?.id === preset.id && <Check size={14}/>}</button>)}</div>
          </Section>
          <Section title="Invoice background gallery" description="Five colour finishes · same invoice layout" icon={<Palette size={15}/> }>
            <div className="ic-background-gallery">{paperBackgrounds.map(preset => <button type="button" key={preset.id} className={`ic-background-card ${String(design.paperBackground || '#ffffff').toLowerCase() === preset.color.toLowerCase() ? 'selected' : ''}`} onClick={() => applyPaperBackground(preset.color)} aria-pressed={String(design.paperBackground || '#ffffff').toLowerCase() === preset.color.toLowerCase()}><span className="ic-background-thumb" style={{ '--preview-paper': preset.color, '--preview-accent': design.accentColor }}><span className="ic-background-invoice"><i className="mini-brand"/><i className="mini-title"/><i className="mini-meta"/><i className="mini-party"/><i className="mini-table-head"/><i className="mini-table-row"/><i className="mini-table-row short"/><i className="mini-total"/></span></span><span className="ic-background-info"><b>{preset.name}</b><small>{preset.description}</small></span>{String(design.paperBackground || '#ffffff').toLowerCase() === preset.color.toLowerCase() && <span className="ic-background-check"><Check size={12}/></span>}</button>)}</div>
            <div className="ic-selected-background"><span style={{ background: design.paperBackground || '#fff' }}/><div><b>{activePaperBackground?.name || 'Custom background'}</b><small>{design.paperBackground || '#ffffff'} · live invoice paper</small></div><button type="button" onClick={() => setD('paperBackground', '#ffffff')}>Reset</button></div>
          </Section>
          <Section title="Brand colour" description="Choose the signature accent used across the invoice" icon={<Palette size={15}/> }>
            <Field label="Accent colour" value={design.accentColor} onChange={v => setD('accentColor', v)}><div className="ic-color-input"><input type="color" value={design.accentColor} onChange={event => setD('accentColor', event.target.value)}/><code>{design.accentColor}</code></div></Field>
            <div className="ic-color-swatches">{['#171717','#dfff00','#92172b','#1d4ed8','#167653','#6540a2','#b45309','#ed0018'].map(color => <button type="button" key={color} title={color} style={{ background: color }} className={design.accentColor === color ? 'selected' : ''} onClick={() => setD('accentColor', color)}/>)}</div>
          </Section>
          <Section title="Paper finish" description="Texture and watermark options" icon={<Eye size={15}/> }>
            <Field label="Paper texture" value={design.paperPattern || 'plain'} onChange={v => setD('paperPattern', v)}><select value={design.paperPattern || 'plain'} onChange={event => setD('paperPattern', event.target.value)}><option value="plain">Plain paper</option><option value="dots">Soft dot texture</option><option value="grid">Fine grid</option><option value="diagonal">Diagonal texture</option></select></Field>
            <label className="ic-switch-row"><span>Show document watermark</span><input type="checkbox" checked={Boolean(design.showWatermark)} onChange={event => setD('showWatermark', event.target.checked)}/></label>
            {design.showWatermark && <><Field label="Watermark text" value={design.watermarkText || ''} onChange={v => setD('watermarkText', v)} placeholder="SPYRIX / PAID / DRAFT"/><Field label={`Watermark opacity · ${design.watermarkOpacity || 7}%`} value={design.watermarkOpacity || 7} onChange={v => setD('watermarkOpacity', Number(v))}><input type="range" min="1" max="18" step="1" value={design.watermarkOpacity || 7} onChange={event => setD('watermarkOpacity', Number(event.target.value))}/></Field></>}
          </Section>
        </div>}

        {activeToolTab === 'Fonts' && <div className="ic-inspector-content">
          <p className="ic-inspector-hint">Fine-tune typography just like the Template Preview studio. Every change appears on the canvas immediately.</p>
          <Section title="Typography" description="Set a clear, professional type system" icon={<Type size={15}/> }>
            <Field label="Font family" value={design.fontFamily} onChange={v => setD('fontFamily', v)}><select value={design.fontFamily} onChange={event => setD('fontFamily', event.target.value)}>{['Arial','Inter','Poppins','Georgia','Tahoma','Verdana','Trebuchet MS','Courier New','Times New Roman','Consolas'].map(font => <option key={font} value={font}>{font}</option>)}</select></Field>
            <Field label={`Base font size · ${design.fontSize || 10}px`} value={design.fontSize || 10} onChange={v => setD('fontSize', Number(v))}><input type="range" min="8" max="15" step="1" value={design.fontSize || 10} onChange={event => setD('fontSize', Number(event.target.value))}/></Field>
            <Field label="Heading alignment" value={design.headingAlignment || 'right'} onChange={v => setD('headingAlignment', v)}><select value={design.headingAlignment || 'right'} onChange={event => setD('headingAlignment', event.target.value)}><option value="right">Right</option><option value="left">Left</option><option value="center">Center</option></select></Field>
          </Section>
        </div>}

        {activeToolTab === 'Assets' && <div className="ic-inspector-content">
          <Section title="Business logo" description="Upload and position your brand mark" icon={<ImagePlus size={15}/> }>
            <UploadAsset title="Business logo" hint="Transparent PNG recommended · JPG and WEBP supported" value={design.logoDataUrl} onUpload={uploadAsset('logoDataUrl')} onRemove={() => setD('logoDataUrl', '')} icon={ImagePlus}/>
            <Field label={`Logo width · ${design.logoWidth || 64}px`} value={design.logoWidth || 64} onChange={v => setD('logoWidth', Number(v))}><input type="range" min="34" max="180" step="2" value={design.logoWidth || 64} onChange={event => setD('logoWidth', Number(event.target.value))}/></Field>
            <Field label="Logo position" value={design.logoPosition || 'left'} onChange={v => setD('logoPosition', v)}><select value={design.logoPosition || 'left'} onChange={event => setD('logoPosition', event.target.value)}><option value="left">Left</option><option value="right">Right</option></select></Field>
            <label className="ic-switch-row"><span>Show logo on invoice</span><input type="checkbox" checked={Boolean(design.showLogo)} onChange={event => setD('showLogo', event.target.checked)}/></label>
          </Section>
          <Section title="Payment QR code" description="Let customers scan and pay directly" icon={<QrCode size={15}/> }>
            <UploadAsset title="Payment QR code" hint="UPI QR or payment QR image · max 900 KB" value={design.qrDataUrl} onUpload={uploadAsset('qrDataUrl')} onRemove={() => setD('qrDataUrl', '')} icon={QrCode}/>
            <Field label={`QR image size · ${design.qrWidth || 82}px`} value={design.qrWidth || 82} onChange={v => setD('qrWidth', Number(v))}><input type="range" min="55" max="150" step="1" value={design.qrWidth || 82} onChange={event => setD('qrWidth', Number(event.target.value))}/></Field>
            <Field label="QR block alignment" value={design.qrPosition || 'right'} onChange={v => setD('qrPosition', v)}><select value={design.qrPosition || 'right'} onChange={event => setD('qrPosition', event.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></Field>
            <Field label="QR heading" value={design.qrCaption || ''} onChange={v => setD('qrCaption', v)} placeholder="SCAN TO PAY"/>
            <Field label="QR helper text" value={design.qrInstruction || ''} onChange={v => setD('qrInstruction', v)} placeholder="Scan with your UPI app" multiline/>
            <label className="ic-switch-row"><span>Show QR on invoice</span><input type="checkbox" checked={Boolean(design.showQr)} onChange={event => setD('showQr', event.target.checked)}/></label>
          </Section>
          <Section title="Authorised signature" description="Add a signed approval to the invoice" icon={<Check size={15}/> }>
            <UploadAsset title="Signature image" hint="Transparent PNG recommended · JPG or WEBP supported" value={design.signatureDataUrl} onUpload={uploadAsset('signatureDataUrl')} onRemove={() => setD('signatureDataUrl', '')} icon={ImagePlus}/>
            <Field label="Signatory name" value={design.signatureName || ''} onChange={v => setD('signatureName', v)} placeholder={design.businessName || 'Name of authorised person'}/>
            <Field label="Designation" value={design.signatureTitle || ''} onChange={v => setD('signatureTitle', v)} placeholder="Authorised Signatory"/>
            <Field label={`Signature width · ${design.signatureWidth || 170}px`} value={design.signatureWidth || 170} onChange={v => setD('signatureWidth', Number(v))}><input type="range" min="90" max="260" step="5" value={design.signatureWidth || 170} onChange={event => setD('signatureWidth', Number(event.target.value))}/></Field>
            <Field label="Signature alignment" value={design.signatureAlignment || 'right'} onChange={v => setD('signatureAlignment', v)}><select value={design.signatureAlignment || 'right'} onChange={event => setD('signatureAlignment', event.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></Field>
            <Field label="Signature label" value={design.signatureCaption || ''} onChange={v => setD('signatureCaption', v)} placeholder="AUTHORISED SIGNATORY"/>
            <label className="ic-switch-row"><span>Show signature on invoice</span><input type="checkbox" checked={Boolean(design.showSignature)} onChange={event => setD('showSignature', event.target.checked)}/></label>
          </Section>
          <Section title="Images you can place anywhere" description="Upload stamps, product photos or any extra artwork, then drag it on the canvas" icon={<ImagePlus size={15}/> }>
            <label className="ic-canvas-image-upload"><ImagePlus size={17}/><span><b>Upload image to canvas</b><small>PNG, JPG or WEBP</small></span><Upload size={15}/><input type="file" accept="image/*" onChange={uploadCanvasImage}/></label>
            {(Array.isArray(design.customCanvasImages) ? design.customCanvasImages : []).map((image, index) => <div className="ic-canvas-image-row" key={image.id}><img src={image.dataUrl} alt=""/><div><b>{image.name || `Canvas image ${index + 1}`}</b><small>Drag the image handle on the invoice to move it</small></div><button type="button" className="ic-icon-button" onClick={() => removeCanvasImage(image.id)} aria-label="Remove image"><Trash2 size={14}/></button></div>)}
            {(Array.isArray(design.customCanvasImages) ? design.customCanvasImages : []).map(image => <Field key={`${image.id}-width`} label={`Image width · ${image.width || 18}%`} value={image.width || 18} onChange={value => updateCanvasImage(image.id, { width: Number(value) })}><input type="range" min="6" max="60" step="1" value={image.width || 18} onChange={event => updateCanvasImage(image.id, { width: Number(event.target.value) })}/></Field>)}
          </Section>
          <Section title="Move logo, QR or signature" description="Use the small move handle on an uploaded asset directly on the invoice" icon={<SlidersHorizontal size={15}/> }>
            <p className="ic-inspector-hint">Move an uploaded logo, QR code or signature to free placement on the page. Use “Dock” on the floating image to restore its original template position.</p>
          </Section>
          <Section title="Invoice background artwork" description="Upload a soft paper texture, brand motif or subtle background image" icon={<ImagePlus size={15}/> }>
            <UploadAsset title="Background image" hint="Choose a light texture or branded artwork · auto-optimized on upload" value={design.backgroundImageDataUrl || ''} onUpload={uploadAsset('backgroundImageDataUrl')} onRemove={() => setD('backgroundImageDataUrl', '')} icon={ImagePlus}/>
            {design.backgroundImageDataUrl && <><Field label={`Artwork visibility · ${design.backgroundImageOpacity ?? 24}%`} value={design.backgroundImageOpacity ?? 24} onChange={v => setD('backgroundImageOpacity', Number(v))}><input type="range" min="5" max="100" step="1" value={design.backgroundImageOpacity ?? 24} onChange={event => setD('backgroundImageOpacity', Number(event.target.value))}/></Field><Field label="Artwork fit" value={design.backgroundImageFit || 'cover'} onChange={v => setD('backgroundImageFit', v)}><select value={design.backgroundImageFit || 'cover'} onChange={event => setD('backgroundImageFit', event.target.value)}><option value="cover">Cover page</option><option value="contain">Fit inside page</option><option value="auto">Original size</option></select></Field></>}
          </Section>
        </div>}

        {activeToolTab === 'Advanced' && <div className="ic-inspector-content">
          <p className="ic-inspector-hint">Edit the printed wording and labels below. Every change appears in the invoice preview immediately.</p>
          <Section title="Brand & invoice heading" description="Customize the main text at the top of the document" icon={<FileText size={15}/> }>
            <Field label="Business tagline" value={design.businessTagline || ''} onChange={v => setD('businessTagline', v)} placeholder="Your business promise or service line"/>
            <Field label="Document label" value={design.documentLabel || ''} onChange={v => setD('documentLabel', v)} placeholder="DOCUMENT"/>
            <Field label="Invoice title" value={design.invoiceTitle || ''} onChange={v => setD('invoiceTitle', v)} placeholder="TAX INVOICE"/>
            <Field label="Invoice subtitle" value={design.invoiceSubtitle || ''} onChange={v => setD('invoiceSubtitle', v)} placeholder="Original for recipient / Payment invoice"/>
            <Field label="Invoice number caption" value={design.invoiceNumberLabel || ''} onChange={v => setD('invoiceNumberLabel', v)} placeholder="INVOICE NO."/>
          </Section>
          <Section title="Section headings" description="Rename the labels printed throughout the invoice" icon={<SlidersHorizontal size={15}/> }>
            <div className="ic-two-col"><Field label="Bill from" value={design.billFromLabel || ''} onChange={v => setD('billFromLabel', v)}/><Field label="Bill to" value={design.billToLabel || ''} onChange={v => setD('billToLabel', v)}/></div>
            <div className="ic-two-col"><Field label="Issue date" value={design.issueDateLabel || ''} onChange={v => setD('issueDateLabel', v)}/><Field label="Due date" value={design.dueDateLabel || ''} onChange={v => setD('dueDateLabel', v)}/></div>
            <div className="ic-two-col"><Field label="Reference" value={design.referenceLabel || ''} onChange={v => setD('referenceLabel', v)}/><Field label="PO number" value={design.purchaseOrderLabel || ''} onChange={v => setD('purchaseOrderLabel', v)}/></div>
            <div className="ic-two-col"><Field label="Items" value={design.itemLabel || ''} onChange={v => setD('itemLabel', v)}/><Field label="SKU" value={design.skuLabel || ''} onChange={v => setD('skuLabel', v)}/></div>
            <div className="ic-three-col"><Field label="Quantity" value={design.quantityLabel || ''} onChange={v => setD('quantityLabel', v)}/><Field label="Rate" value={design.rateLabel || ''} onChange={v => setD('rateLabel', v)}/><Field label="Amount" value={design.amountLabel || ''} onChange={v => setD('amountLabel', v)}/></div>
            <div className="ic-two-col"><Field label="Subtotal" value={design.subtotalLabel || ''} onChange={v => setD('subtotalLabel', v)}/><Field label="Discount" value={design.discountLabel || ''} onChange={v => setD('discountLabel', v)}/></div>
            <div className="ic-two-col"><Field label="Tax" value={design.taxLabel || ''} onChange={v => setD('taxLabel', v)}/><Field label="Grand total" value={design.totalLabel || ''} onChange={v => setD('totalLabel', v)}/></div>
            <div className="ic-two-col"><Field label="Notes heading" value={design.notesLabel || ''} onChange={v => setD('notesLabel', v)}/><Field label="Terms heading" value={design.termsLabel || ''} onChange={v => setD('termsLabel', v)}/></div>
            <div className="ic-two-col"><Field label="Payment instructions" value={design.paymentInstructionsLabel || ''} onChange={v => setD('paymentInstructionsLabel', v)}/><Field label="Payment details" value={design.paymentDetailsLabel || ''} onChange={v => setD('paymentDetailsLabel', v)}/></div>
            <div className="ic-two-col"><Field label="Business GSTIN" value={design.businessGstinLabel || ''} onChange={v => setD('businessGstinLabel', v)}/><Field label="Customer GSTIN" value={design.customerGstinLabel || ''} onChange={v => setD('customerGstinLabel', v)}/></div>
            <div className="ic-two-col"><Field label="PAN caption" value={design.panLabel || ''} onChange={v => setD('panLabel', v)}/><Field label="Account caption" value={design.accountNumberLabel || ''} onChange={v => setD('accountNumberLabel', v)}/></div>
            <div className="ic-two-col"><Field label="IFSC caption" value={design.ifscLabel || ''} onChange={v => setD('ifscLabel', v)}/><Field label="UPI caption" value={design.upiLabel || ''} onChange={v => setD('upiLabel', v)}/></div>
          </Section>
          <Section title="Customer messages & footer" description="Edit the body copy shown on the document" icon={<FileText size={15}/> }>
            <Field label="Notes" value={meta.notes} onChange={v => setM('notes', v)} multiline placeholder="Add a message for your customer"/>
            <Field label="Terms & conditions" value={meta.terms} onChange={v => setM('terms', v)} multiline placeholder="Payment and delivery terms"/>
            <Field label="Payment instructions" value={design.paymentInstructions || ''} onChange={v => setD('paymentInstructions', v)} multiline placeholder="Explain how to pay"/>
            <Field label="Footer message" value={design.footerText || ''} onChange={v => setD('footerText', v)} multiline placeholder="Thank you for your business"/>
          </Section>
        </div>}

        {activeToolTab === 'Advanced' && <div className="ic-inspector-content">
          <Section title="Choose a template" description="Select a visual invoice design" icon={<LayoutTemplate size={15}/> }>
            <div className="ic-template-gallery">{invoiceTemplates.map(template => <button type="button" key={template.id} className={`ic-template-tile ${design.templateId === template.id ? 'selected' : ''}`} onClick={() => setTemplate(template.id)}><TemplateMiniPreview template={template} selected={design} compact /><b>{template.name}</b><small>{template.category}</small>{design.templateId === template.id && <em><Check size={11}/></em>}</button>)}</div>
          </Section>
          <Section title="Frame, header & table" description="Control the printed document structure" icon={<SlidersHorizontal size={15}/> }>
            <Field label="Page frame" value={design.frameStyle || 'thin'} onChange={v => setD('frameStyle', v)}><select value={design.frameStyle || 'thin'} onChange={event => setD('frameStyle', event.target.value)}><option value="none">No frame</option><option value="thin">Thin border</option><option value="double">Double border</option><option value="dashed">Dashed border</option></select></Field>
            <Field label="Header style" value={design.headerStyle || 'line'} onChange={v => setD('headerStyle', v)}><select value={design.headerStyle || 'line'} onChange={event => setD('headerStyle', event.target.value)}><option value="line">Accent underline</option><option value="band">Solid colour band</option><option value="split">Split header</option><option value="minimal">Minimal header</option></select></Field>
            <Field label="Table style" value={design.tableStyle || 'clean'} onChange={v => setD('tableStyle', v)}><select value={design.tableStyle || 'clean'} onChange={event => setD('tableStyle', event.target.value)}><option value="clean">Clean lines</option><option value="striped">Striped rows</option><option value="boxed">Boxed grid</option><option value="minimal">Minimal</option></select></Field>
            <Field label="Table density" value={design.tableDensity || 'normal'} onChange={v => setD('tableDensity', v)}><select value={design.tableDensity || 'normal'} onChange={event => setD('tableDensity', event.target.value)}><option value="compact">Compact</option><option value="normal">Comfortable</option><option value="spacious">Spacious</option></select></Field>
            <div className="ic-two-col"><Field label="Paper size" value={design.pageSize} onChange={v => setD('pageSize', v)}><select value={design.pageSize} onChange={event => setD('pageSize', event.target.value)}><option>A4</option><option>A5</option><option>Letter</option></select></Field><Field label="Orientation" value={design.pageOrientation} onChange={v => setD('pageOrientation', v)}><select value={design.pageOrientation} onChange={event => setD('pageOrientation', event.target.value)}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></Field></div>
            {[['showSku','Show SKU column'],['showPaymentInstructions','Show payment instructions'],['showFooter','Show footer message'],['showBusinessGstin','Show business GSTIN'],['showCustomerGstin','Show customer GSTIN']].map(([key,label]) => <label className="ic-switch-row" key={key}><span>{label}</span><input type="checkbox" checked={Boolean(design[key])} onChange={event => setD(key, event.target.checked)}/></label>)}
          </Section>
        </div>}

        <div className="ic-tools-export"><div><ShieldCheck size={16}/><span>All controls update the live document instantly.</span></div><ExportDropdown onExport={handleExport}/>{isTemplateMode ? <button type="button" className="ic-issue-btn full" onClick={saveTemplateDesign} disabled={saving}><Save size={15}/>{saving ? 'Saving…' : 'Save default design'}</button> : <button type="button" className="ic-issue-btn full" onClick={() => saveInvoice('issued')} disabled={saving}><Check size={15}/>{saving ? 'Saving…' : 'Save & issue invoice'}</button>}</div>
        </>}
      </aside>
    </div>
  </div>;
}
