import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle2, ImagePlus, Palette, QrCode, Save, ShieldCheck, Type, Upload, X, SlidersHorizontal } from 'lucide-react';
import { invoiceTemplates, loadInvoiceDesign, readImageFile, saveInvoiceDesign } from '../Invoices/invoiceDesign';
import { apiRequest } from '../../api';
import { useAuth } from '../../context/AuthContext';
import './TemplateStudio.css';

function TemplatePreview({ template, design }) {
  const color = design.templateId === template.id ? design.accentColor : template.color;
  return (
    <div className={`studio-preview studio-preview-${template.layout}`} style={{ '--preview-accent': color, '--preview-font': design.templateId === template.id ? design.fontFamily : template.font }}>
      <div className="studio-preview-paper">
        <div className="studio-preview-head"><b>{design.showLogo && design.logoDataUrl ? <img src={design.logoDataUrl} alt="Business logo" /> : 'YOUR BUSINESS'}</b><span>INVOICE</span></div>
        <div className="studio-preview-meta"><i /><i /><i /></div>
        <div className="studio-preview-pair"><div><i /><i /><i /></div><div><i /><i /><i /></div></div>
        <div className="studio-preview-table"><b>DESCRIPTION</b><b>QTY</b><b>AMOUNT</b><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="studio-preview-total"><span>TOTAL</span><b>₹ 12,500.00</b></div>
        <div className="studio-preview-foot"><span>{design.showQr && design.qrDataUrl ? 'QR PAYMENT' : 'THANK YOU'}</span><span>SPYRIX INVOICE</span></div>
      </div>
    </div>
  );
}

export default function TemplateStudio() {
  const navigate = useNavigate();
  const { business, session } = useAuth();
  const [design, setDesign] = useState(() => {
    const saved = business?.invoiceDesign || {};
    const base = { ...loadInvoiceDesign(), ...saved };
    if (!Object.keys(saved).length) {
      base.businessName = base.businessName || business?.name || '';
      base.businessAddress = base.businessAddress || business?.address || '';
      base.businessPhone = base.businessPhone || business?.phone || '';
      base.businessEmail = base.businessEmail || business?.email || '';
      base.businessWebsite = base.businessWebsite || business?.website || '';
      base.businessGstin = base.businessGstin || business?.gstin || '';
    }
    return base;
  });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showCustomize] = useState(true);
  const categories = useMemo(() => ['All', ...new Set(invoiceTemplates.map(template => template.category))], []);
  const visibleTemplates = invoiceTemplates.filter(template => filter === 'All' || template.category === filter);
  const selected = invoiceTemplates.find(template => template.id === design.templateId) || invoiceTemplates[0];

  useEffect(() => {
    if (business?.invoiceDesign && Object.keys(business.invoiceDesign).length) {
      setDesign(current => ({
        ...current,
        ...business.invoiceDesign,
        businessName: business.invoiceDesign.businessName || current.businessName || business.name || '',
        businessAddress: business.invoiceDesign.businessAddress || current.businessAddress || business.address || '',
        businessPhone: business.invoiceDesign.businessPhone || current.businessPhone || business.phone || '',
        businessEmail: business.invoiceDesign.businessEmail || current.businessEmail || business.email || '',
        businessWebsite: business.invoiceDesign.businessWebsite || current.businessWebsite || business.website || '',
        businessGstin: business.invoiceDesign.businessGstin || current.businessGstin || business.gstin || '',
      }));
    } else if (business?.id) {
      setDesign(current => ({
        ...current,
        businessName: current.businessName || business.name || '',
        businessAddress: current.businessAddress || business.address || '',
        businessPhone: current.businessPhone || business.phone || '',
        businessEmail: current.businessEmail || business.email || '',
        businessWebsite: current.businessWebsite || business.website || '',
        businessGstin: current.businessGstin || business.gstin || '',
      }));
    }
  }, [business?.id, business?.invoiceDesign, business?.name, business?.address, business?.phone, business?.email, business?.website, business?.gstin]);

  const update = (key, value) => setDesign(current => ({ ...current, [key]: value }));
  const selectTemplate = template => {
    setDesign(current => ({ ...current, templateId: template.id, accentColor: template.color, fontFamily: template.font }));
    setMessage(`${template.name} selected. You can customise its colour, font and assets below.`);
    setError('');
  };
  const readAsset = async (key, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try { update(key, await readImageFile(file, { purpose: key === 'qrDataUrl' ? 'qr' : key === 'signatureDataUrl' ? 'signature' : 'logo' })); setError(''); setMessage('Image added to your invoice design.'); }
    catch (err) { setError(err.message); event.target.value = ''; }
  };
  const save = async () => {
    setSaving(true); setError(''); setMessage('');
    try {
      // Persist to the authenticated workspace first. Do not show a local-only
      // save as a successful MongoDB save if the API rejects the request.
      const saved = { ...design };
      if (localStorage.getItem('spyrix_token')) {
        await apiRequest('/business/settings', { method: 'PUT', body: JSON.stringify({ invoiceDesign: saved }) });
        saveInvoiceDesign(saved);
        setMessage('Invoice design saved to your MongoDB business workspace and this browser. It will be used for future invoices.');
      } else {
        saveInvoiceDesign(saved);
        setMessage('Invoice design saved in this browser. Sign in to sync it with your MongoDB workspace.');
      }
      window.dispatchEvent(new CustomEvent('spyrix:invoice-design-updated'));
    } catch (err) { setError(err.message || 'Could not save invoice design. Your previous saved design has been kept.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="module-page template-studio-page">
      <div className="module-breadcrumb">Workspace <span>›</span> <strong>Invoice Design Studio</strong></div>
      <header className="module-page-head">
        <div className="module-title-wrap"><span className="module-title-icon"><Palette size={24} /></span><div><div className="module-eyebrow">DOCUMENT DESIGN STUDIO</div><h1>Customise your invoice</h1><p>Fine-tune the selected template. Changes are previewed here and saved as your default for future invoices.</p></div></div>
        <div className="template-editor-actions"><button className="secondary-button" onClick={() => navigate('/app/templates')}><ArrowRight size={15} style={{transform:'rotate(180deg)'}}/> Back to templates</button><button className="primary-button" onClick={save} disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save design'}</button></div>
      </header>
      <section className="template-studio-hero">
        <div><span className="template-studio-kicker">20 PROFESSIONAL STARTING POINTS</span><h2>Make every invoice feel like <em>your brand.</em></h2><p>The Xenmark-inspired option follows your reference: maroon title band, two party panels, item grid, payment QR and strong total section.</p></div>
        <div className="template-studio-selected"><TemplatePreview template={selected} design={design}/><div><strong>{selected.name}</strong><small>Current selection · {selected.category}</small></div></div>
      </section>
      {message && <div className="template-studio-message"><CheckCircle2 size={16}/>{message}<button onClick={() => setMessage('')}><X size={14}/></button></div>}
      {error && <div className="template-studio-error">{error}</div>}
      <section className="template-customizer">
        <header className="template-customizer-head"><div><span className="template-studio-kicker">PERSONALISE THE OUTPUT</span><h2>Customise your invoice</h2><p>These settings are used by the invoice preview and print workflow.</p></div><span className="template-option-count">25+ personalisation controls</span></header>
        {showCustomize && <div className="template-customizer-grid">
          <div className="template-customizer-section"><h3><Palette size={17}/> Colour & typography</h3><label className="designer-field"><span>Invoice accent colour</span><div className="designer-color-input"><input type="color" value={design.accentColor} onChange={e => update('accentColor', e.target.value)}/><input value={design.accentColor} onChange={e => update('accentColor', e.target.value)} pattern="^#[0-9a-fA-F]{6}$"/></div></label><label className="designer-field"><span>Font family</span><select value={design.fontFamily} onChange={e => update('fontFamily', e.target.value)}>{['Arial','Inter','Poppins','Georgia','Tahoma','Verdana','Trebuchet MS','Courier New','Times New Roman','Consolas'].map(font => <option key={font} value={font}>{font}</option>)}</select></label><label className="designer-field"><span>Business name on invoice</span><input value={design.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Your business name"/></label><label className="designer-field"><span>Business address</span><textarea rows="2" value={design.businessAddress} onChange={e => update('businessAddress', e.target.value)} placeholder="Address, city, state and postal code"/></label><div className="designer-two-col"><label className="designer-field"><span>Business phone</span><input value={design.businessPhone} onChange={e => update('businessPhone', e.target.value)} placeholder="+91 ..."/></label><label className="designer-field"><span>Business email</span><input value={design.businessEmail} onChange={e => update('businessEmail', e.target.value)} placeholder="billing@business.com"/></label></div><label className="designer-field"><span>Business website</span><input value={design.businessWebsite || ''} onChange={e => update('businessWebsite', e.target.value)} placeholder="www.example.com"/></label><label className="designer-field"><span>Business GSTIN</span><input value={design.businessGstin} onChange={e => update('businessGstin', e.target.value.toUpperCase())} placeholder="GSTIN"/></label><label className="designer-field"><span>Business services / masthead line</span><textarea rows="3" value={design.businessServices || ''} onChange={e => update('businessServices', e.target.value)} placeholder="e.g. T-shirts · Caps · Hoodies · Custom Printing"/></label></div>
          <div className="template-customizer-section"><h3><ImagePlus size={17}/> Logo, QR & signature</h3><div className="designer-upload-grid"><label className="designer-upload"><span><ImagePlus size={21}/></span><b>Upload logo</b><small>PNG, JPG or WebP · max 900 KB</small><input type="file" accept="image/*" onChange={e => readAsset('logoDataUrl', e)}/>{design.logoDataUrl && <img src={design.logoDataUrl} alt="Uploaded logo preview"/>}</label><label className="designer-upload"><span><QrCode size={21}/></span><b>Upload payment QR</b><small>UPI or bank payment QR image</small><input type="file" accept="image/*" onChange={e => readAsset('qrDataUrl', e)}/>{design.qrDataUrl && <img src={design.qrDataUrl} alt="Uploaded QR preview"/>}</label><label className="designer-upload"><span><Upload size={21}/></span><b>Upload signature</b><small>Transparent PNG recommended</small><input type="file" accept="image/*" onChange={e => readAsset('signatureDataUrl', e)}/>{design.signatureDataUrl && <img src={design.signatureDataUrl} alt="Uploaded signature preview"/>}</label></div><div className="designer-toggle-list"><label><input type="checkbox" checked={design.showLogo} onChange={e => update('showLogo', e.target.checked)}/> Show logo on invoice</label><label><input type="checkbox" checked={design.showQr} onChange={e => update('showQr', e.target.checked)}/> Show payment QR section</label><label><input type="checkbox" checked={design.showSignature} onChange={e => update('showSignature', e.target.checked)}/> Show signature</label></div><label className="designer-field"><span>UPI ID</span><input value={design.upiId} onChange={e => update('upiId', e.target.value)} placeholder="business@upi"/></label></div>
          <div className="template-customizer-section"><h3><Type size={17}/> Payment instructions & footer</h3><label className="designer-field"><span>Payment instructions</span><textarea rows="4" value={design.paymentInstructions} onChange={e => update('paymentInstructions', e.target.value)} placeholder="How should customers pay?"/></label><label className="designer-field"><span>Thank-you / footer message</span><textarea rows="3" value={design.footerText} onChange={e => update('footerText', e.target.value)} placeholder="Thank you for your business."/></label><div className="template-save-note"><ShieldCheck size={17}/><span>Authenticated workspaces save defaults to MongoDB. The chosen design and image assets are copied into each invoice so the saved document keeps its appearance.</span></div><button className="primary-button full-width" onClick={save} disabled={saving}><Save size={16}/> {saving ? 'Saving…' : 'Save all design settings'}</button></div>
          <div className="template-customizer-section template-advanced-options"><h3><SlidersHorizontal size={17}/> Layout & invoice details</h3>
            <label className="designer-field"><span>Paper size</span><select value={design.pageSize || 'A4'} onChange={e => update('pageSize',e.target.value)}><option value="A4">A4</option><option value="A5">A5</option><option value="Letter">Letter</option></select></label>
            <label className="designer-field"><span>Page orientation</span><select value={design.pageOrientation || 'portrait'} onChange={e => update('pageOrientation',e.target.value)}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
            <label className="designer-field"><span>Layout density</span><select value={design.layoutDensity || 'comfortable'} onChange={e => update('layoutDensity',e.target.value)}><option value="comfortable">Comfortable</option><option value="compact">Compact</option><option value="spacious">Spacious</option></select></label>
            <label className="designer-field"><span>Border style</span><select value={design.borderStyle || 'solid'} onChange={e => update('borderStyle',e.target.value)}><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="double">Double</option><option value="none">Minimal / no border</option></select></label>
            <label className="designer-field"><span>Logo position</span><select value={design.logoPosition || 'left'} onChange={e => update('logoPosition',e.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
            <label className="designer-field"><span>Logo width · px</span><input type="number" min="48" max="220" value={design.logoWidth || 120} onChange={e => update('logoWidth',Math.max(48,Math.min(220,Number(e.target.value)||120)))}/></label>
            <label className="designer-field"><span>Invoice heading</span><input maxLength="28" value={design.invoiceTitle || 'INVOICE'} onChange={e => update('invoiceTitle',e.target.value)}/></label>
            <label className="designer-field"><span>Heading alignment</span><select value={design.headingAlignment || 'left'} onChange={e => update('headingAlignment',e.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
            <label className="designer-field"><span>Table row spacing</span><select value={design.tableDensity || 'normal'} onChange={e => update('tableDensity',e.target.value)}><option value="compact">Compact</option><option value="normal">Normal</option><option value="spacious">Spacious</option></select></label>
            <div className="designer-toggle-list">
              <label><input type="checkbox" checked={design.showBusinessServices !== false} onChange={e=>update('showBusinessServices',e.target.checked)}/> Show business services line</label>
              <label><input type="checkbox" checked={design.showBusinessGstin !== false} onChange={e=>update('showBusinessGstin',e.target.checked)}/> Show business GSTIN</label>
              <label><input type="checkbox" checked={design.showCustomerGstin !== false} onChange={e=>update('showCustomerGstin',e.target.checked)}/> Show customer GSTIN</label>
              <label><input type="checkbox" checked={design.showItemSku !== false} onChange={e=>update('showItemSku',e.target.checked)}/> Show product SKU</label>
              <label><input type="checkbox" checked={design.showItemDescription !== false} onChange={e=>update('showItemDescription',e.target.checked)}/> Show item descriptions</label>
              <label><input type="checkbox" checked={design.showUnitColumn !== false} onChange={e=>update('showUnitColumn',e.target.checked)}/> Show quantity units</label>
              <label><input type="checkbox" checked={design.showPurchaseReference !== false} onChange={e=>update('showPurchaseReference',e.target.checked)}/> Show PO and reference fields</label>
              <label><input type="checkbox" checked={design.showDueDate !== false} onChange={e=>update('showDueDate',e.target.checked)}/> Show due date</label>
              <label><input type="checkbox" checked={design.showFooter !== false} onChange={e=>update('showFooter',e.target.checked)}/> Show business footer</label>
              <label><input type="checkbox" checked={design.showTaxBreakdown !== false} onChange={e=>update('showTaxBreakdown',e.target.checked)}/> Show tax breakdown</label>
            </div>
            <div className="template-save-note"><ShieldCheck size={17}/><span>These layout options apply to new invoice output. Previously issued invoices retain their saved design snapshot.</span></div>
          </div>
        </div>}
      </section>
    </div>
  );
}
