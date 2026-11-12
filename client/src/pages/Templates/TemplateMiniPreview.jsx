import './TemplateSelection.css';

const previewLines = [
  { name: 'Cotton T-Shirt · Custom Print', qty: '50', rate: '210', amount: '10,500' },
  { name: 'Cap · Embroidery', qty: '20', rate: '150', amount: '3,000' },
  { name: 'Hoodie · Logo Stitch', qty: '10', rate: '450', amount: '4,500' },
  { name: 'DTF Printing Charges', qty: '1', rate: '2,500', amount: '2,500' },
];

const qrPattern = [
  '1111100101111', '1000101101001', '1010100101011', '1000101111001', '1111101011111',
  '0000001110000', '1101010011010', '0110111100101', '1011000111010', '0001111010001',
  '1111101010111', '1000100010101', '1111101111101',
];

function PreviewQr() {
  return <span className="artwork-qr" aria-hidden="true">{qrPattern.join('').split('').map((pixel, index) => <i key={index} className={pixel === '1' ? 'on' : ''} />)}</span>;
}

/** A populated miniature invoice, not a grey wireframe. It is used by the invoice hub,
 * template gallery, and create-invoice template picker so users see a realistic preview. */
export default function TemplateMiniPreview({ template, selected, variant = 'card', compact = false }) {
  const layout = template?.layout || 'classic';
  const accent = selected?.templateId === template?.id ? (selected?.accentColor || template?.color) : template?.color;
  const font = selected?.templateId === template?.id ? (selected?.fontFamily || template?.font) : template?.font;
  const isXenmark = template?.id === 'xenmark';
  const logo = selected?.templateId === template?.id ? selected?.logoDataUrl : '';
  const actualVariant = compact ? 'compact' : variant;
  const businessName = isXenmark ? 'XENMARK' : (template?.name === 'Freelancer' ? 'STUDIO ALEX' : 'SPYRIX BUSINESS');
  return (
    <div
      className={`template-choice-preview invoice-artwork invoice-artwork-${actualVariant} layout-${layout}`}
      style={{ '--template-accent': accent || '#85172d', '--template-font': font || 'Arial' }}
      aria-label={`${template?.name || 'Invoice'} sample preview`}
    >
      <div className="invoice-artwork-paper">
        <header className="artwork-head">
          <div className="artwork-brand">
            <span className="artwork-mark">{logo ? <img src={logo} alt="" /> : isXenmark ? 'X' : 'S'}</span>
            <span className="artwork-brand-copy"><b>{businessName}</b><small>{isXenmark ? 'GARMENT MANUFACTURER & PRINTING HOUSE' : 'BUSINESS · SERVICES · COMMERCE'}</small><small>{isXenmark ? 'T-SHIRTS · CAPS · HOODIES · JACKETS' : 'Your business address · City, State'}</small></span>
          </div>
          <div className="artwork-invoice-number"><strong>INVOICE</strong><b>INV-2026-001</b><small>12 NOV 2026</small></div>
        </header>
        {isXenmark && <div className="artwork-service-line">EMBROIDERY&nbsp; | &nbsp;DTF / DTG&nbsp; | &nbsp;CUSTOM PRINTING</div>}
        <div className="artwork-meta-grid"><span><small>INVOICE DATE</small><b>12 Nov 2026</b></span><span><small>DUE DATE</small><b>26 Nov 2026</b></span><span><small>REFERENCE</small><b>XM-001</b></span></div>
        <div className="artwork-parties">
          <section><b className="artwork-section-label">BILL TO</b><strong>Acme Retail Pvt. Ltd.</strong><span>Prayagraj, Uttar Pradesh</span><span>accounts@acme.example</span><span>GSTIN: 09ABCDE1234F1Z5</span></section>
          <section><b className="artwork-section-label">BILL FROM</b><strong>{businessName}</strong><span>Prayagraj, Uttar Pradesh</span><span>+91 98765 43210</span><span>GSTIN: 09XENMA1234A1Z7</span></section>
        </div>
        <div className="artwork-items-table">
          <div className="artwork-items-row artwork-items-head"><b>DESCRIPTION</b><b>QTY</b><b>RATE</b><b>AMOUNT</b></div>
          {previewLines.map((line, index) => <div className="artwork-items-row" key={line.name}><span>{line.name}</span><span>{line.qty}</span><span>{line.rate}</span><b>{line.amount}</b></div>)}
        </div>
        <div className="artwork-bottom">
          <section className="artwork-payment"><b>PAYMENT DETAILS</b><div className="artwork-payment-row"><PreviewQr/><span><strong>Scan & Pay</strong><small>UPI / PhonePe</small><small>Thank you for your business.</small></span></div></section>
          <section className="artwork-totals"><div><span>Sub total</span><b>₹20,500</b></div><div><span>GST (18%)</span><b>₹3,690</b></div><div className="artwork-grand-total"><span>TOTAL DUE</span><b>₹24,190</b></div><div className="artwork-signature"><span>Authorised signature</span><i /></div></section>
        </div>
        {isXenmark && <div className="artwork-service-ribbon">CUSTOM APPAREL FOR YOUR BRAND &amp; BUSINESS</div>}
        <footer className="artwork-footer"><b>THANK YOU FOR YOUR BUSINESS</b><span>www.yourbusiness.example&nbsp; · &nbsp;+91 98765 43210</span></footer>
      </div>
    </div>
  );
}
