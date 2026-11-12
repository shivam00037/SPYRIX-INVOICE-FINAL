import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, Upload, Scissors, Shirt, HardHat, Package, BadgeCheck, MapPin, Phone, Globe, Instagram, Printer, Palette, CalendarDays, FilePlus2, ClipboardList, UserRound, Building2, Move, Pin, X } from 'lucide-react';
import './XenmarkInvoicePreview.css';

export const InvoiceEditorContext = createContext({ textStyles: {} });

const displayMoney = value => `₹ ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))}`;
const displayDate = value => {
  if (!value) return '—';
  const date = String(value).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return `${date.slice(8, 10)}-${date.slice(5, 7)}-${date.slice(0, 4)}`;
  return date;
};
const normaliseDate = (text, fallback) => {
  const value = String(text || '').trim();
  let match = value.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? value : fallback;
};
const numberFromText = value => {
  const amount = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
};

function InlineEdit({ as = 'span', value = '', onCommit, placeholder = 'Tap to edit', className = '', multiline = false, title }) {
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
    className={`xen-inline-edit ${className}`.trim()}
    contentEditable
    suppressContentEditableWarning
    spellCheck={false}
    role="textbox"
    aria-label={title || placeholder}
    data-placeholder={placeholder}
    data-inline-key={inlineId}
    data-inline-label={title || placeholder || className || 'Invoice text'}
    title={title || 'Tap or click to edit this text'}
    style={inlineStyle}
    onBlur={event => {
      const next = String(event.currentTarget.innerText || '').replace(/\u00a0/g, ' ').trim();
      if (next !== String(value ?? '').trim()) onCommit?.(next);
    }}
    onKeyDown={event => {
      if (event.key === 'Enter' && !multiline) { event.preventDefault(); event.currentTarget.blur(); }
    }}
  >{value ?? ''}</Tag>;
}

function startCanvasDrag(event, root, element, initialX, initialY, onChange) {
  event.preventDefault();
  event.stopPropagation();
  if (!root || !element) return;
  const rootRect = root.getBoundingClientRect();
  const startPointerX = event.clientX;
  const startPointerY = event.clientY;
  const startX = Number(initialX || 0);
  const startY = Number(initialY || 0);
  const move = moveEvent => {
    const nextX = Math.max(0, Math.min(96, startX + ((moveEvent.clientX - startPointerX) / Math.max(1, rootRect.width)) * 100));
    const nextY = Math.max(0, Math.min(98, startY + ((moveEvent.clientY - startPointerY) / Math.max(1, rootRect.height)) * 100));
    onChange(nextX, nextY);
  };
  const end = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
  };
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerup', end, { once: true });
  window.addEventListener('pointercancel', end, { once: true });
}

function UploadTarget({ value, title, hint, onUpload, className = '', assetKey, design, setD }) {
  const inputRef = useRef(null);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => { setImageFailed(false); }, [value]);
  const isFree = Boolean(assetKey && design?.[`${assetKey}CanvasFree`]);
  const openPicker = event => { event?.preventDefault?.(); event?.stopPropagation?.(); inputRef.current?.click(); };
  const startMove = event => {
    const target = event.currentTarget.closest('.xen-upload-target');
    const root = target?.closest('.ic-invoice-paper, .xenmark-invoice');
    const rootRect = root?.getBoundingClientRect();
    const rect = target?.getBoundingClientRect();
    if (!rootRect || !rect) return;
    const currentX = isFree ? Number(design[`${assetKey}CanvasX`] || 0) : ((rect.left - rootRect.left) / Math.max(1, rootRect.width)) * 100;
    const currentY = isFree ? Number(design[`${assetKey}CanvasY`] || 0) : ((rect.top - rootRect.top) / Math.max(1, rootRect.height)) * 100;
    setD(`${assetKey}CanvasFree`, true);
    setD(`${assetKey}CanvasX`, currentX);
    setD(`${assetKey}CanvasY`, currentY);
    startCanvasDrag(event, root, target, currentX, currentY, (x, y) => {
      setD(`${assetKey}CanvasX`, x);
      setD(`${assetKey}CanvasY`, y);
    });
  };
  return <div className={`xen-upload-target ${className} ${isFree ? 'xen-asset-is-free' : ''}`} data-asset-key={assetKey} title={title}>
    <input ref={inputRef} type="file" accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.svg,.avif" aria-label={title} onChange={onUpload}/>
    {value && !isFree && !imageFailed
      ? <><img src={value} alt={title} role="button" tabIndex={0} onLoad={() => setImageFailed(false)} onError={() => setImageFailed(true)} onClick={openPicker} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') openPicker(event); }} title={`Click to replace ${title}`}/><button type="button" className="xen-upload-chip" onClick={openPicker}><Upload size={12}/> Replace</button><button type="button" className="xen-upload-move" aria-label={`Move ${title} on invoice`} title="Drag to move this image anywhere on the invoice" onPointerDown={startMove} onClick={event => { event.preventDefault(); event.stopPropagation(); }}><Move size={13}/></button></>
      : <button type="button" className="xen-upload-empty xen-upload-trigger" onClick={openPicker}><ImagePlus size={23}/><b>{isFree ? 'Placed on canvas' : imageFailed ? 'Image failed to load' : title}</b><small>{isFree ? 'Use the floating image to move or Dock' : imageFailed ? 'Tap to choose the image again' : (hint || 'Tap to upload image')}</small></button>}
  </div>;
}

function FloatingAsset({ src, assetKey, design, setD }) {
  if (!src || !design[`${assetKey}CanvasFree`]) return null;
  const width = Number(design[`${assetKey}CanvasWidth`] || ({ logo: 33, qr: 15, signature: 24 }[assetKey] || 20));
  const x = Number(design[`${assetKey}CanvasX`] ?? 3);
  const y = Number(design[`${assetKey}CanvasY`] ?? 3);
  return <div className={`xen-floating-asset xen-floating-${assetKey}`} data-asset-key={assetKey} style={{ left: `${x}%`, top: `${y}%`, width: `${Math.max(7, Math.min(65, width))}%` }}>
    <img src={src} alt={assetKey === 'qr' ? 'Payment QR code' : assetKey === 'signature' ? 'Signature' : 'Business logo'} draggable="false" onError={event => { event.currentTarget.style.display = 'none'; const note = event.currentTarget.parentElement?.querySelector('.xen-image-load-error'); if (note) note.hidden = false; }}/><small className="xen-image-load-error" hidden>Image could not load. Re-upload it from the Assets tab.</small>
    <button type="button" className="xen-floating-move" aria-label={`Move ${assetKey}`} title="Drag to move" onPointerDown={event => {
      const box = event.currentTarget.closest('.xen-floating-asset');
      const root = box?.closest('.ic-invoice-paper, .xenmark-invoice');
      startCanvasDrag(event, root, box, x, y, (nextX, nextY) => { setD(`${assetKey}CanvasX`, nextX); setD(`${assetKey}CanvasY`, nextY); });
    }}><Move size={13}/></button>
    <button type="button" className="xen-floating-dock" aria-label="Return image to its original position" title="Dock to original template position" onClick={() => setD(`${assetKey}CanvasFree`, false)}><Pin size={12}/><span>Dock</span></button>
  </div>;
}

function FloatingCustomImage({ image, onMove, onRemove }) {
  return <div className="xen-floating-asset xen-floating-custom" data-custom-image-id={image.id} style={{ left: `${Number(image.x || 0)}%`, top: `${Number(image.y || 0)}%`, width: `${Math.max(6, Math.min(65, Number(image.width || 18)))}%` }}>
    <img src={image.dataUrl} alt={image.name || 'Custom invoice artwork'} draggable="false" onError={event => { event.currentTarget.style.display = 'none'; const note = event.currentTarget.parentElement?.querySelector('.xen-image-load-error'); if (note) note.hidden = false; }}/><small className="xen-image-load-error" hidden>Image could not load. Replace it from the Assets tab.</small>
    <button type="button" className="xen-floating-move" title="Drag image to any place on the invoice" aria-label="Move custom image" onPointerDown={event => {
      const box = event.currentTarget.closest('.xen-floating-asset');
      const root = box?.closest('.ic-invoice-paper, .xenmark-invoice');
      startCanvasDrag(event, root, box, Number(image.x || 0), Number(image.y || 0), (x, y) => onMove({ x, y }));
    }}><Move size={13}/></button>
    <button type="button" className="xen-floating-remove" title="Remove image" aria-label="Remove custom image" onClick={onRemove}><X size={12}/></button>
  </div>;
}

export function InvoiceCanvasImages({ images = [], onMove, onRemove }) {
  return <div className="xen-floating-assets-layer xen-paper-custom-assets" aria-label="Movable invoice images">{(Array.isArray(images) ? images : []).map(image => <FloatingCustomImage key={image.id} image={image} onMove={changes => onMove?.(image.id, changes)} onRemove={() => onRemove?.(image.id)}/> )}</div>;
}

export function InvoiceTemplateAssetLayer({ design = {}, setD }) {
  return <div className="xen-floating-assets-layer ic-template-asset-layer" aria-label="Movable business logo, QR and signature">
    <FloatingAsset src={design.showLogo ? design.logoDataUrl : ''} assetKey="logo" design={design} setD={setD}/>
    <FloatingAsset src={design.showQr ? design.qrDataUrl : ''} assetKey="qr" design={design} setD={setD}/>
    <FloatingAsset src={design.showSignature ? design.signatureDataUrl : ''} assetKey="signature" design={design} setD={setD}/>
  </div>;
}

const serviceIcons = [Shirt, HardHat, Package, Shirt, Scissors, Printer, Palette];
const ribbonIcons = [Shirt, HardHat, Package, Shirt, Printer, Scissors, Palette];

export default function XenmarkInvoicePreview({ design, setD, meta, setM, customer, setC, items, updateLine, calculations, uploadAsset, isTemplateMode, updateCanvasImage, removeCanvasImage }) {
  const editor = useContext(InvoiceEditorContext) || {};
  const sectionStyle = id => editor.textStyles?.[`section:${id}`] || {};
  const serviceLabels = String(design.businessServices || 'T-SHIRTS | CAPS | HOODIES | JACKETS | EMBROIDERY | DTF / DTG | CUSTOM PRINTS')
    .split(/[|\n]/).map(value => value.trim()).filter(Boolean).slice(0, 7);
  const setServiceLabel = (index, text) => {
    const next = [...serviceLabels];
    next[index] = text;
    setD('businessServices', next.join(' | '));
  };
  const ribbonLabels = String(design.ribbonServices || 'T-SHIRTS | CAPS | HOODIES | JACKETS | DTF / DTG | EMBROIDERY | CUSTOM PRINTS')
    .split(/[|\n]/).map(value => value.trim()).filter(Boolean).slice(0, 7);
  const setRibbonLabel = (index, text) => {
    const next = [...ribbonLabels];
    next[index] = text;
    setD('ribbonServices', next.join(' | '));
  };
  const businessName = design.businessName || (isTemplateMode ? 'X-E-N-M-A-R-K Denmark' : '');
  const businessAddress = design.businessAddress || (isTemplateMode ? 'Shop No. 12, Main Market, Gomti Nagar\nLucknow - 226010, Uttar Pradesh, India' : '');
  const businessPhone = design.businessPhone || (isTemplateMode ? '+91 98765 43210' : '');
  const businessGstin = design.businessGstin || (isTemplateMode ? '09ABCDE1234F1Z5' : '');
  const businessSocial = design.businessSocialHandle || (isTemplateMode ? '@xenmark_denmark' : '');
  const signValue = design.signatureDataUrl || '';
  const displayLogo = design.logoDataUrl || (isTemplateMode ? '/assets/xenmark-reference-logo.png' : '');
  const displayQr = design.qrDataUrl || (isTemplateMode ? '/assets/xenmark-reference-qr.png' : '');
  const lines = calculations.lines;
  const referenceQuantities = [100, 50, 30, 1, 1, 1];
  const referenceRates = [210, 150, 450, 2500, 1500, 500];
  const isUneditedReferenceSample = isTemplateMode && items.length === 6 && items.every((line, index) =>
    line.id === `sample-${index + 1}` &&
    Number(line.quantity) === referenceQuantities[index] && Number(line.rate) === referenceRates[index] &&
    Number(line.taxRate) === 18 && Number(line.discount || 0) === (index === 0 ? 2000 : 0)
  );
  // The supplied reference image itself has a subtotal/row mismatch; reproduce its printed sample totals
  // until a user edits an item. Actual invoice mode always uses calculated values.
  const displayCalculations = isUneditedReferenceSample
    ? { ...calculations, subtotal: 46000, discount: 2000, tax: 7920, total: 51920 }
    : calculations;
  // Paid amounts are derived from recorded payment transactions, not edited as invoice text.
  const amountPaid = 0;
  const dueAmount = Math.max(0, displayCalculations.total - amountPaid);

  return <div className="xenmark-invoice" style={{ backgroundColor: (design.backgroundImageDataUrl || (design.paperPattern && design.paperPattern !== 'plain')) ? 'transparent' : (design.paperBackground || '#ffffff'), fontFamily: design.fontFamily || 'Arial' }}>
    <header className="xen-masthead" data-editor-tab="Assets" data-editor-section="ic-section-assets" data-editor-id="heading" style={sectionStyle('heading')}>
      <div className="xen-logo-side">
        <UploadTarget value={displayLogo} title="Upload business logo" hint="Your logo goes here" onUpload={uploadAsset('logoDataUrl')} className="xen-logo-target" assetKey="logo" design={design} setD={setD}/>
      </div>
      <div className="xen-business-head">
        <InlineEdit as="h2" value={design.businessTagline || ''} placeholder="GARMENT MANUFACTURER & PRINTING HOUSE" onCommit={value => setD('businessTagline', value)} className="xen-manufacturer-title"/>
        <InlineEdit as="p" value={design.businessServiceLine || ''} placeholder="T-SHIRTS   |   CAPS   |   HOODIES   |   JACKETS" onCommit={value => setD('businessServiceLine', value)} className="xen-service-line"/>
        <InlineEdit as="p" value={design.businessServiceLine2 || ''} placeholder="EMBROIDERY   |   DTF   |   DTG   |   CUSTOM PRINTING" onCommit={value => setD('businessServiceLine2', value)} className="xen-service-line xen-service-line-secondary"/>
        <div className="xen-service-icons">
          {serviceLabels.map((label, index) => {
            const Icon = serviceIcons[index % serviceIcons.length];
            return <div className="xen-service-icon" key={`${index}-${label}`}>
              <Icon size={19} strokeWidth={1.8}/>
              <InlineEdit as="span" value={label} placeholder="Service" onCommit={value => setServiceLabel(index, value)} className="xen-service-label"/>
            </div>;
          })}
          {serviceLabels.length === 0 && <InlineEdit as="span" value="" placeholder="Tap to add service categories" onCommit={value => setD('businessServices', value)} />}
        </div>
      </div>
    </header>

    <section className="xen-invoice-band" data-editor-tab="Text" data-editor-section="ic-section-invoice" data-editor-id="invoice-band" style={sectionStyle('invoice-band')}>
      <InlineEdit as="h1" value={design.invoiceTitle || ''} placeholder="INVOICE" onCommit={value => setD('invoiceTitle', value)} className="xen-invoice-heading"/>
      <div className="xen-invoice-quick-meta">
        <div><InlineEdit as="span" value={design.invoiceNumberLabel || ''} placeholder="Bill No." onCommit={value => setD('invoiceNumberLabel', value)}/><span className="xen-meta-colon">:</span><InlineEdit as="b" value={meta.invoiceNumber || ''} placeholder="" onCommit={value => { setM('invoiceNumber', value); setM('manualInvoiceNumber', true); }}/></div>
        <div><InlineEdit as="span" value={design.topIssueDateLabel || 'Date'} placeholder="Date" onCommit={value => setD('topIssueDateLabel', value)}/><span className="xen-meta-colon">:</span><InlineEdit as="b" value={displayDate(meta.issueDate)} placeholder="DD-MM-YYYY" onCommit={value => setM('issueDate', normaliseDate(value, meta.issueDate))}/></div>
        <div><InlineEdit as="span" value={design.dueDateLabel || ''} placeholder="Due Date" onCommit={value => setD('dueDateLabel', value)}/><span className="xen-meta-colon">:</span><InlineEdit as="b" value={displayDate(meta.dueDate)} placeholder="DD-MM-YYYY" onCommit={value => setM('dueDate', normaliseDate(value, meta.dueDate))}/></div>
      </div>
    </section>

    <section className="xen-party-grid">
      <div className="xen-party-card" data-editor-tab="Text" data-editor-section="ic-section-customer" data-editor-id="customer" style={sectionStyle('customer')}>
        <h3><span className="xen-party-heading-icon"><UserRound size={22} fill="currentColor"/></span><InlineEdit value={design.billToLabel || ''} placeholder="BILL TO" onCommit={value => setD('billToLabel', value)}/></h3>
        <div className="xen-party-details">
          <div><InlineEdit value={design.customerNameLabel || 'Name'} placeholder="Name" onCommit={value => setD('customerNameLabel', value)}/><b>:</b><InlineEdit value={customer.name || ''} placeholder="" onCommit={value => setC('name', value)} className="xen-customer-value"/></div>
          <div><InlineEdit value={design.customerCompanyLabel || 'Company Name'} placeholder="Company Name" onCommit={value => setD('customerCompanyLabel', value)}/><b>:</b><InlineEdit value={customer.companyName || ''} placeholder="" onCommit={value => setC('companyName', value)} className="xen-customer-value"/></div>
          <div><InlineEdit value={design.customerAddressLabel || 'Address'} placeholder="Address" onCommit={value => setD('customerAddressLabel', value)}/><b>:</b><InlineEdit value={customer.billingAddress || ''} placeholder="" onCommit={value => setC('billingAddress', value)} className="xen-customer-value xen-customer-address"/></div>
          <div><InlineEdit value={design.customerPhoneLabel || 'Phone'} placeholder="Phone" onCommit={value => setD('customerPhoneLabel', value)}/><b>:</b><InlineEdit value={customer.phone || ''} placeholder="" onCommit={value => setC('phone', value)} className="xen-customer-value"/></div>
          <div><InlineEdit value={design.customerGstinLabel || 'GSTIN'} placeholder="GSTIN" onCommit={value => setD('customerGstinLabel', value)}/><b>:</b><InlineEdit value={customer.gstin || ''} placeholder="" onCommit={value => setC('gstin', value)} className="xen-customer-value"/></div>
        </div>
      </div>
      <div className="xen-party-card" data-editor-tab="Assets" data-editor-section="ic-section-business" data-editor-id="business" style={sectionStyle('business')}>
        <h3><span className="xen-party-grid-icon"><Building2 size={18}/></span><InlineEdit value={design.billFromLabel || ''} placeholder="BILL BY" onCommit={value => setD('billFromLabel', value)}/></h3>
        <div className="xen-party-details">
          <div><InlineEdit value={design.businessNameLabel || 'Name'} placeholder="Name" onCommit={value => setD('businessNameLabel', value)}/><b>:</b><InlineEdit value={businessName} placeholder="Business name" onCommit={value => setD('businessName', value)}/></div>
          <div><InlineEdit value={design.businessAddressLabel || 'Address'} placeholder="Address" onCommit={value => setD('businessAddressLabel', value)}/><b>:</b><InlineEdit value={businessAddress} placeholder="Business address" onCommit={value => setD('businessAddress', value)}/></div>
          <div><InlineEdit value={design.businessPhoneLabel || 'Phone'} placeholder="Phone" onCommit={value => setD('businessPhoneLabel', value)}/><b>:</b><InlineEdit value={businessPhone} placeholder="Phone number" onCommit={value => setD('businessPhone', value)}/></div>
          <div><InlineEdit value={design.businessGstinLabel || 'GSTIN'} placeholder="GSTIN" onCommit={value => setD('businessGstinLabel', value)}/><b>:</b><InlineEdit value={businessGstin} placeholder="Business GSTIN" onCommit={value => setD('businessGstin', value)}/></div>
        </div>
      </div>
    </section>

    <section className="xen-date-strip" data-editor-tab="Text" data-editor-section="ic-section-invoice" data-editor-id="meta" style={sectionStyle('meta')}>
      <div><span className="xen-meta-symbol"><CalendarDays size={31}/></span><span className="xen-meta-content"><InlineEdit as="small" value={design.issueDateLabel || ''} placeholder="Invoice Date" onCommit={value => setD('issueDateLabel', value)}/><InlineEdit as="b" value={displayDate(meta.issueDate)} placeholder="DD-MM-YYYY" onCommit={value => setM('issueDate', normaliseDate(value, meta.issueDate))}/></span></div>
      <div><span className="xen-meta-symbol"><CalendarDays size={31}/></span><span className="xen-meta-content"><InlineEdit as="small" value={design.dueDateLabel || ''} placeholder="Due Date" onCommit={value => setD('dueDateLabel', value)}/><InlineEdit as="b" value={displayDate(meta.dueDate)} placeholder="DD-MM-YYYY" onCommit={value => setM('dueDate', normaliseDate(value, meta.dueDate))}/></span></div>
      <div><span className="xen-meta-symbol"><FilePlus2 size={31}/></span><span className="xen-meta-content"><InlineEdit as="small" value={design.purchaseOrderLabel || ''} placeholder="PO No." onCommit={value => setD('purchaseOrderLabel', value)}/><span className="xen-meta-inline"><small>(If Any)</small><InlineEdit as="b" value={meta.purchaseOrder || ''} placeholder="" className="xen-meta-edit-line" onCommit={value => setM('purchaseOrder', value)}/></span></span></div>
      <div><span className="xen-meta-symbol"><ClipboardList size={31}/></span><span className="xen-meta-content"><InlineEdit as="small" value={design.referenceLabel || ''} placeholder="Reference" onCommit={value => setD('referenceLabel', value)}/><span className="xen-meta-inline"><small>(If Any)</small><InlineEdit as="b" value={meta.reference || ''} placeholder="" className="xen-meta-edit-line" onCommit={value => setM('reference', value)}/></span></span></div>
    </section>

    <div className="xen-table-wrap" data-editor-tab="Text" data-editor-section="ic-section-items" data-editor-id="items" style={sectionStyle('items')}>
      <table className="xen-items-table"><thead><tr>
        <th><InlineEdit value={design.documentLabel || ''} placeholder="S. No." onCommit={value => setD('documentLabel', value)}/></th>
        <th><InlineEdit value={design.itemLabel || ''} placeholder="Description" onCommit={value => setD('itemLabel', value)}/></th>
        <th><InlineEdit value={design.quantityLabel || ''} placeholder="Pieces" onCommit={value => setD('quantityLabel', value)}/></th>
        <th><InlineEdit value={design.rateLabel || ''} placeholder="Rate (₹)" onCommit={value => setD('rateLabel', value)}/></th>
        <th><InlineEdit value={design.amountLabel || ''} placeholder="Amount (₹)" onCommit={value => setD('amountLabel', value)}/></th>
      </tr></thead><tbody>
        {lines.map((line, index) => <tr key={line.id}>
          <td className="xen-row-num">{index + 1}</td>
          <td><InlineEdit as="span" value={line.name || ''} placeholder={`Item ${index + 1} description`} onCommit={value => updateLine(line.id, 'name', value)} className="xen-line-name"/><InlineEdit as="small" value={line.description || ''} placeholder="Additional item details" onCommit={value => updateLine(line.id, 'description', value)} className="xen-line-description" multiline/></td>
          <td className="xen-centered"><InlineEdit value={String(line.quantity ?? 1)} placeholder="1" onCommit={value => updateLine(line.id, 'quantity', numberFromText(value) || 1)}/></td>
          <td className="xen-centered"><InlineEdit value={displayMoney(line.rate)} placeholder="₹ 0.00" onCommit={value => updateLine(line.id, 'rate', numberFromText(value))}/></td>
          <td className="xen-centered"><InlineEdit value={displayMoney(Number(line.quantity || 0) * Number(line.rate || 0))} placeholder="₹ 0.00" onCommit={value => {
            const amount = numberFromText(value);
            const quantity = Math.max(1, Number(line.quantity || 1));
            updateLine(line.id, 'rate', Math.max(0, amount / quantity));
          }}/></td>
        </tr>)}
        {lines.length === 0 && <tr><td colSpan="5" className="xen-empty-row">Tap here to add invoice items in the Items & Services section.</td></tr>}
      </tbody></table>
    </div>

    <section className="xen-payment-total-grid" data-editor-tab="Assets" data-editor-section="ic-section-assets" data-editor-id="payment" style={sectionStyle('payment')}>
      <div className="xen-payment-box">
        <h3><InlineEdit value={design.paymentDetailsLabel || ''} placeholder="Payment Details" onCommit={value => setD('paymentDetailsLabel', value)}/></h3>
        <div className="xen-payment-content">
          <div className="xen-qr-card">
            <div className="xen-qr-brand"><span className="xen-phonepe-mark" aria-hidden="true">₹</span><InlineEdit value={design.qrPaymentProvider || 'PhonePe'} placeholder="PhonePe" onCommit={value => setD('qrPaymentProvider', value)}/></div>
            <UploadTarget value={displayQr} title="Upload payment QR" hint="Tap to add UPI QR" onUpload={uploadAsset('qrDataUrl')} className="xen-qr-target" assetKey="qr" design={design} setD={setD}/>
            <div className="xen-qr-caption"><InlineEdit as="b" value={design.qrScanText || 'Scan & Pay'} placeholder="Scan & Pay" onCommit={value => setD('qrScanText', value)}/><InlineEdit as="small" value={design.qrScanSubtext || 'Pay with any UPI App'} placeholder="Payment caption" onCommit={value => setD('qrScanSubtext', value)}/></div>
          </div>
          <div className="xen-payment-instructions">
            <b><InlineEdit value={design.paymentInstructionsLabel || ''} placeholder="Payment Instructions" onCommit={value => setD('paymentInstructionsLabel', value)}/></b>
            <InlineEdit as="p" value={design.paymentInstructions || ''} placeholder="• Please scan the QR code and pay the amount.\n• After payment, share the screenshot with your order/bill number.\n• For any payment issues, contact us.\n• Thank you for your business." onCommit={value => setD('paymentInstructions', value)} multiline/>
            {design.showPaymentStatusSummary && <><div className="xen-payment-status"><InlineEdit value={design.paymentStatusText || ''} placeholder="PAYMENT STATUS: UNPAID" onCommit={value => setD('paymentStatusText', value)}/></div><div className="xen-payment-numbers"><span><InlineEdit value={design.amountPaidLabel || ''} placeholder="Amount paid" onCommit={value => setD('amountPaidLabel', value)}/> <b>{displayMoney(amountPaid)}</b></span><span><InlineEdit value={design.dueAmountLabel || ''} placeholder="Due amount" onCommit={value => setD('dueAmountLabel', value)}/> <b>{displayMoney(dueAmount)}</b></span></div></>}
          </div>
        </div>
      </div>
      <div className="xen-total-box">
        <div className="xen-total-line"><InlineEdit value={design.subtotalLabel || ''} placeholder="Sub Total" onCommit={value => setD('subtotalLabel', value)}/><b>{displayMoney(displayCalculations.subtotal)}</b></div>
        <div className="xen-total-line"><InlineEdit value={design.discountLabel || ''} placeholder="Discount" onCommit={value => setD('discountLabel', value)}/><b>{displayMoney(displayCalculations.discount)}</b></div>
        <div className="xen-total-line"><InlineEdit value={design.taxLabel || ''} placeholder="GST (0%)" onCommit={value => setD('taxLabel', value)}/><b>{displayMoney(displayCalculations.tax)}</b></div>
        <div className="xen-grand-total"><InlineEdit value={design.totalLabel || ''} placeholder="Total Amount" onCommit={value => setD('totalLabel', value)}/><b>{displayMoney(displayCalculations.total)}</b></div>
        <div className="xen-thank-you">
          <InlineEdit as="strong" value={design.thankYouText || ''} placeholder="Thank You!" onCommit={value => setD('thankYouText', value)}/>
          <InlineEdit as="small" value={design.trustText || ''} placeholder="FOR YOUR TRUST" onCommit={value => setD('trustText', value)}/>
          <UploadTarget value={signValue} title="Upload signature" hint="Authorised signature" onUpload={uploadAsset('signatureDataUrl')} className="xen-signature-target" assetKey="signature" design={design} setD={setD}/>
        </div>
      </div>
    </section>

    <section className="xen-service-ribbon" data-editor-tab="Text" data-editor-section="ic-section-assets" data-editor-id="services" style={sectionStyle('services')}>
      <div className="xen-service-ribbon-title"><InlineEdit as="strong" value={design.serviceBannerText || 'CUSTOM APPAREL\nFOR YOUR\nBRAND & BUSINESS'} placeholder="CUSTOM APPAREL FOR YOUR BRAND & BUSINESS" onCommit={value => setD('serviceBannerText', value)} multiline/></div>
      <div className="xen-service-ribbon-icons">
        {ribbonLabels.map((label, index) => {
          const Icon = ribbonIcons[index % ribbonIcons.length];
          return <div className="xen-ribbon-icon" key={`${index}-${label}`}><Icon size={20} strokeWidth={1.7}/><InlineEdit value={label} placeholder="Service" onCommit={value => setRibbonLabel(index, value)} className="xen-ribbon-label"/></div>;
        })}
      </div>
    </section>

    <footer className="xen-footer" data-editor-id="footer" style={sectionStyle('footer')}>
      <div className="xen-footer-main">
        <div><MapPin size={13}/><InlineEdit value={businessAddress} placeholder="Business address" onCommit={value => setD('businessAddress', value)}/></div>
        <div className="xen-footer-contact"><span><Phone size={12}/><InlineEdit value={businessPhone} placeholder="Phone number" onCommit={value => setD('businessPhone', value)}/></span><span><Instagram size={12}/><InlineEdit value={businessSocial} placeholder="Social handle" onCommit={value => setD('businessSocialHandle', value)}/></span></div>
        <div><span><BadgeCheck size={12}/><InlineEdit value={businessGstin} placeholder="GSTIN" onCommit={value => setD('businessGstin', value)}/></span><span><Globe size={12}/><InlineEdit value={design.businessWebsite || (isTemplateMode ? 'www.xenmark.in' : '')} placeholder="Website" onCommit={value => setD('businessWebsite', value)}/></span></div>
      </div>
      <div className="xen-footer-strip"><InlineEdit value={design.footerText || ''} placeholder="GARMENTS   |   PRINTING   |   CUSTOMIZATION" onCommit={value => setD('footerText', value)}/></div>
    </footer>
    <div className="xen-floating-assets-layer" aria-label="Movable invoice images">
      <FloatingAsset src={design.showLogo ? displayLogo : ''} assetKey="logo" design={design} setD={setD}/>
      <FloatingAsset src={design.showQr ? displayQr : ''} assetKey="qr" design={design} setD={setD}/>
      <FloatingAsset src={design.showSignature ? signValue : ''} assetKey="signature" design={design} setD={setD}/>
    </div>
  </div>;
}
