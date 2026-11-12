import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, BadgeIndianRupee, Bell, Boxes, CalendarDays, CheckCircle2,
  Clock3, CreditCard, Download, FileText, LayoutTemplate, Package, RefreshCw,
  TrendingUp, Users, Wallet, Zap, AlertTriangle, Sparkles, BarChart3, ShieldCheck,
} from 'lucide-react';
import { useData } from '../../data/DataContext';
import { useAuth } from '../../context/AuthContext';
import './DashboardPage.css';
import './DashboardTheme.css';
import { dashboardPageConfig } from './page.config.js';

const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
const dateLabel = value => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

const bannerSlides = [
  { id: 'invoice', eyebrow: 'INVOICE WORKSPACE', title: 'Make every invoice count.', text: 'Create a professional invoice in a few clear steps. Select a saved customer, add products, review the totals and issue it when everything is ready.', steps: ['Choose a customer', 'Add products and taxes', 'Preview, save or issue'], cta: 'Create invoice', to: '/app/invoices/new', icon: FileText, visualLabel: 'INVOICE PREVIEW', visualValue: '₹ 24,850.00', visualRows: ['Design selected', 'Customer details filled', 'Ready for review'] },
  { id: 'customers', eyebrow: 'CUSTOMER RELATIONSHIPS', title: 'Your customer records, all together.', text: 'Keep contact information, billing addresses, GST details and transaction history in one place. Find a client by name, phone or unique customer ID.', steps: ['Add a customer once', 'Find them in seconds', 'Reuse details across records'], cta: 'Open customers', to: '/app/customers', icon: Users, visualLabel: 'CUSTOMER DIRECTORY', visualValue: 'CUS-000128', visualRows: ['Contact and company', 'Billing and shipping', 'GST and payment terms'] },
  { id: 'payments', eyebrow: 'PAYMENT MANAGEMENT', title: 'See what came in and what remains.', text: 'Record full or partial collections against invoices. Your received amount and remaining balance stay connected to the invoice record.', steps: ['Select an invoice', 'Record payment details', 'Track the remaining balance'], cta: 'Record payment', to: '/app/payments', icon: BadgeIndianRupee, visualLabel: 'COLLECTION RECEIPT', visualValue: '₹ 18,500.00', visualRows: ['UPI · Completed', 'Payment allocated', 'Balance updated'] },
  { id: 'inventory', eyebrow: 'PRODUCTS & INVENTORY', title: 'Know your products. Know your stock.', text: 'Maintain a reusable product catalogue with SKU, unit, selling price and tax defaults. Spot products that are running low before the next order.', steps: ['Create your product list', 'Set price and stock levels', 'Review low-stock alerts'], cta: 'Open inventory', to: '/app/inventory', icon: Boxes, visualLabel: 'STOCK OVERVIEW', visualValue: 'STOCK HEALTH', visualRows: ['In stock · available', 'Low stock · review', 'Services · no tracking'] },
  { id: 'templates', eyebrow: 'INVOICE DESIGN STUDIO', title: 'Put your brand on every document.', text: 'Choose a layout and tailor the colour, typography, logo, payment QR, signature and footer. The design is saved for future invoices.', steps: ['Select a template', 'Customise your brand', 'Save the invoice design'], cta: 'Explore templates', to: '/app/templates', icon: LayoutTemplate, visualLabel: 'BRAND STYLE', visualValue: 'YOUR BUSINESS', visualRows: ['Colour and typography', 'Logo and payment QR', 'Signature and footer'] },
  { id: 'reports', eyebrow: 'BUSINESS INSIGHTS', title: 'Make decisions with clear numbers.', text: 'Review collections, expenses, outstanding balances and invoice status using figures calculated from your workspace records.', steps: ['Review collected revenue', 'Compare paid expenses', 'Follow up on balances'], cta: 'View reports', to: '/app/reports', icon: BarChart3, visualLabel: 'BUSINESS SNAPSHOT', visualValue: 'LIVE WORKSPACE DATA', visualRows: ['Collections and expenses', 'Invoice status overview', 'Upcoming due dates'] },
];

const quickActions = [
  { title: 'Create invoice', subtitle: 'Prepare a customer invoice', to: '/app/invoices/new', icon: FileText },
  { title: 'Add customer', subtitle: 'Save a customer profile', to: '/app/customers', icon: Users },
  { title: 'Add product', subtitle: 'Update your catalogue', to: '/app/products', icon: Package },
  { title: 'Manage inventory', subtitle: 'Review stock quantities', to: '/app/inventory', icon: Boxes },
  { title: 'Record payment', subtitle: 'Track money received', to: '/app/payments', icon: CreditCard },
  { title: 'Add expense', subtitle: 'Record business spending', to: '/app/expenses', icon: Wallet },
  { title: 'Invoice templates', subtitle: 'Customise document design', to: '/app/templates', icon: LayoutTemplate },
  { title: 'Download center', subtitle: 'Export business records', to: '/app/downloads', icon: Download },
];

function MetricCard({ title, value, caption, icon: Icon, tone = 'red', badge }) {
  return (
    <article className={`home-metric metric-${tone}`}>
      <div className="metric-card-top"><span className="metric-card-icon"><Icon size={22} strokeWidth={2.15} /></span><span className="metric-card-badge">{badge}</span></div>
      <div className="metric-card-label">{title}</div>
      <strong className="metric-card-value">{value}</strong>
      <div className="metric-card-foot"><span className="metric-foot-mark"><Sparkles size={12} /></span>{caption}</div>
      <Icon className="metric-card-watermark" size={82} strokeWidth={1.1} aria-hidden="true" />
    </article>
  );
}

function BannerArtwork({ slide }) {
  const Icon = slide.icon;
  return (
    <div className={`db-banner-art db-art-${slide.id}`} aria-hidden="true">
      <img className="db-hero-backdrop" src="/assets/hero-art.png" alt="" />
      <div className="db-art-backplate" />
      {slide.id === 'invoice' && <div className="db-invoice-sheet"><div className="db-sheet-top"><b>SPYRIX</b><span>INVOICE</span></div><div className="db-sheet-number">INV-2026-0148</div><div className="db-sheet-party"><i /><i /></div><div className="db-sheet-row"><span>DESCRIPTION</span><span>AMOUNT</span></div>{[0,1,2].map(row => <div className="db-sheet-line" key={row}><i /><b /></div>)}<div className="db-sheet-total"><span>TOTAL DUE</span><strong>{slide.visualValue}</strong></div></div>}
      {slide.id === 'customers' && <div className="db-customer-card"><div className="db-customer-head"><span>CLIENT PROFILE</span><b>VERIFIED</b></div><div className="db-customer-identity"><span className="db-customer-avatar"><Users size={30}/></span><div><strong>Customer record</strong><small>{slide.visualValue}</small></div></div><div className="db-customer-fields"><span>CONTACT DETAILS</span><i/><i/><span>BUSINESS INFORMATION</span><i/><i/></div><div className="db-customer-footer"><ShieldCheck size={15}/> SAVED & READY TO REUSE</div></div>}
      {slide.id === 'payments' && <div className="db-payment-card"><div className="db-payment-top"><span><BadgeIndianRupee size={22}/></span><small>PAYMENT RECEIVED</small></div><strong>{slide.visualValue}</strong><div className="db-payment-status"><CheckCircle2 size={16}/> PAYMENT RECORDED</div><div className="db-payment-lines"><i/><i/><i/></div><div className="db-payment-bottom"><span>PAYMENT METHOD</span><b>UPI / BANK / CASH</b></div></div>}
      {slide.id === 'inventory' && <div className="db-stock-card"><div className="db-stock-title"><span>INVENTORY STATUS</span><Package size={18}/></div><div className="db-stock-total">{slide.visualValue}</div><div className="db-stock-bars"><span><b>IN STOCK</b><i><em style={{width:'84%'}}/></i></span><span><b>LOW STOCK</b><i><em style={{width:'32%'}}/></i></span><span><b>SERVICES</b><i><em style={{width:'68%'}}/></i></span></div><div className="db-stock-footer">SKU · UNITS · REORDER LEVELS</div></div>}
      {slide.id === 'templates' && <div className="db-template-stack"><div className="db-template-back"><span>SPYRIX</span><b>ESTIMATE</b><i/><i/><i/></div><div className="db-template-front"><div><strong>SPYRIX</strong><span>INVOICE</span></div><b>{slide.visualValue}</b><i/><i/><i/><footer>YOUR BRAND · YOUR STYLE</footer></div></div>}
      {slide.id === 'reports' && <div className="db-report-card"><div className="db-report-head"><span>BUSINESS OVERVIEW</span><BarChart3 size={19}/></div><strong>{slide.visualValue}</strong><div className="db-report-chart">{[38,58,45,78,56,92,70].map((height,index)=><i key={index} style={{height:`${height}%`}}/>)}</div><div className="db-report-labels"><span>COLLECTIONS</span><span>EXPENSES</span><span>OUTSTANDING</span></div></div>}
      <div className="db-art-orbit db-art-orbit-one"/><div className="db-art-orbit db-art-orbit-two"/>
      <span className="db-art-stamp"><Icon size={15}/>{slide.visualLabel}</span>
    </div>
  );
}

function Status({ value }) { return <span className={`status-pill status-${String(value || '').replaceAll('_', '-')}`}>{String(value || 'active').replaceAll('_', ' ')}</span>; }

export default function Dashboard() {
  const navigate = useNavigate();
  const { records, loading, error, refresh } = useData();
  const { business } = useAuth();
  const [activeBanner, setActiveBanner] = useState(0);
  const [bannerPhase, setBannerPhase] = useState('shown');
  const [bannerDirection, setBannerDirection] = useState('left');
  const transitionTimer = useRef(null);

  const moveBanner = nextIndex => {
    const targetIndex = (nextIndex + bannerSlides.length) % bannerSlides.length;
    if (targetIndex === activeBanner) return;
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    // Slides 1, 3, 5 enter from the left; slides 2, 4, 6 enter from the right.
    setBannerDirection(targetIndex % 2 === 0 ? 'left' : 'right');
    setBannerPhase('leaving');
    transitionTimer.current = window.setTimeout(() => {
      setActiveBanner(targetIndex);
      setBannerPhase('entering');
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setBannerPhase('shown')));
    }, 210);
  };

  useEffect(() => {
    const interval = window.setInterval(() => moveBanner((activeBanner + 1) % bannerSlides.length), 3000);
    return () => window.clearInterval(interval);
  }, [activeBanner]);

  useEffect(() => () => { if (transitionTimer.current) window.clearTimeout(transitionTimer.current); }, []);

  const activeCustomers = records.customers.filter(customer => (customer.status || 'active') === 'active' && !customer.archived && customer.isActive !== false).length;
  const revenue = records.payments.filter(payment => payment.status === 'completed').reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const expenses = records.expenses.filter(expense => expense.status === 'paid').reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const pending = records.invoices.filter(invoice => ['issued', 'partially_paid', 'overdue'].includes(invoice.status)).reduce((sum, invoice) => sum + Math.max(0, Number(invoice.total || 0) - Number(invoice.paidAmount || 0)), 0);
  const paidInvoices = records.invoices.filter(invoice => invoice.status === 'paid').length;
  const lowStock = records.products.filter(product => Number(product.lowStockAt || 0) > 0 && Number(product.stockOnHand || 0) <= Number(product.lowStockAt || 0));
  const recentInvoices = [...records.invoices].sort((a, b) => String(b.issueDate || b.createdAt).localeCompare(String(a.issueDate || a.createdAt))).slice(0, 5);
  const collectionBars = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - index) * 4);
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const value = records.payments.filter(payment => { const paid = new Date(`${payment.paymentDate}T00:00:00`); const start = new Date(d); start.setDate(start.getDate() - 3); return paid >= start && paid <= d && payment.status === 'completed'; }).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return { label, value };
  }), [records.payments]);
  const maxBar = Math.max(1, ...collectionBars.map(bar => bar.value));
  const dueSoon = records.invoices.filter(invoice => invoice.dueDate && !['paid', 'cancelled', 'draft'].includes(invoice.status)).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const currentBanner = bannerSlides[activeBanner];

  return (
    <div className="dashboard-page redesigned-dashboard" aria-label={dashboardPageConfig.accessibleName}>

      <section className={`db-hero ${currentBanner.id} db-phase-${bannerPhase} db-entry-from-${bannerDirection}`} aria-roledescription="carousel" aria-label="SPYRIX business workflow highlights">
        <div className="db-hero-content" key={currentBanner.id}>
          <div className="db-hero-copy">
            <div className="db-hero-eyebrow"><span><currentBanner.icon size={16}/></span>{currentBanner.eyebrow}</div>
            <h1>{currentBanner.title}</h1>
            <p>{currentBanner.text}</p>
            <div className="db-hero-steps">{currentBanner.steps.map((step,index)=><span key={step}><b>{String(index+1).padStart(2,'0')}</b>{step}</span>)}</div>
            <div className="db-hero-actions"><button className="db-primary-action" onClick={() => navigate(currentBanner.to)}>{currentBanner.cta}<ArrowRight size={17}/></button><button className="db-secondary-action" onClick={() => navigate('/app/help')}>Explore workflow</button></div>
          </div>
          <BannerArtwork slide={currentBanner}/>
        </div>
        <div className="db-banner-nav"><span className="db-banner-counter">{String(activeBanner+1).padStart(2,'0')} <i>/</i> {String(bannerSlides.length).padStart(2,'0')}</span><div className="db-banner-dots">{bannerSlides.map((slide,index)=><button type="button" key={slide.id} className={index===activeBanner?'active':''} aria-label={`Show ${slide.eyebrow}`} aria-pressed={index===activeBanner} onClick={()=>moveBanner(index)}/>)}</div><div className="db-banner-arrows"><button type="button" aria-label="Previous banner" onClick={()=>moveBanner(activeBanner-1)}><ArrowLeft size={16}/></button><button type="button" aria-label="Next banner" onClick={()=>moveBanner(activeBanner+1)}><ArrowRight size={16}/></button></div></div>
      </section>

      {error && <div className="dashboard-error"><AlertTriangle size={17}/><span>{error}</span><button onClick={refresh}><RefreshCw size={15}/>Retry</button></div>}

      <section className="home-metrics-grid" aria-label="Business overview">
        <MetricCard title="Active customers" value={loading?'—':activeCustomers.toLocaleString('en-IN')} caption="Active customer profiles" icon={Users} tone="red" badge="CUSTOMERS"/>
        <MetricCard title="Recorded collections" value={loading?'—':money(revenue)} caption="Completed payments received" icon={BadgeIndianRupee} tone="green" badge="CASH RECEIVED"/>
        <MetricCard title="Pending collections" value={loading?'—':money(pending)} caption="Outstanding invoice balances" icon={Clock3} tone="amber" badge="TO COLLECT"/>
        <MetricCard title="Paid invoices" value={loading?'—':paidInvoices.toLocaleString('en-IN')} caption="Invoices fully settled" icon={CheckCircle2} tone="violet" badge="SETTLED"/>
      </section>

      <section className="quick-section redesigned-quick-section">
        <div className="quick-header"><div className="quick-heading"><span className="quick-bolt"><Zap size={28} fill="currentColor"/></span><div><h2>Quick actions</h2><p>Common tasks to keep your business moving.</p></div></div><button className="view-tools" onClick={()=>navigate('/app/tools')}>View all tools <ArrowRight size={17}/></button></div>
        <div className="quick-grid">{quickActions.map(({title,subtitle,to,icon:Icon})=><button className="quick-card" key={title} onClick={()=>navigate(to)}><span className="quick-card-icon"><Icon size={25} strokeWidth={2}/></span><span className="quick-card-copy"><strong>{title}</strong><small>{subtitle}</small></span><ArrowRight className="quick-arrow" size={19}/></button>)}</div>
      </section>

      <section className="dashboard-lower-grid">
        <article className="dashboard-panel collection-panel"><header className="dashboard-panel-head"><div><span className="panel-eyebrow">CASH FLOW</span><h2>Collection overview</h2><p>Recent recorded payment activity</p></div><button className="panel-link" onClick={()=>navigate('/app/reports')}>View reports <ArrowRight size={15}/></button></header><div className="collection-summary"><strong>{money(revenue)}</strong><span><TrendingUp size={15}/> Total received</span></div><div className="collection-chart">{collectionBars.map(bar=><div className="collection-bar-col" key={bar.label}><div className="collection-bar-track"><span style={{height:`${Math.max(bar.value?6:2,bar.value/maxBar*100)}%`}} title={money(bar.value)}/></div><small>{bar.label}</small></div>)}</div><div className="collection-legend"><span><i/> Recorded collections</span><span>Paid expenses: <b>{money(expenses)}</b></span></div></article>
        <article className="dashboard-panel due-panel"><header className="dashboard-panel-head"><div><span className="panel-eyebrow">FOLLOW UP</span><h2>Upcoming collections</h2><p>Invoices that still have a balance</p></div><button className="panel-icon-link" onClick={()=>navigate('/app/calendar')}><CalendarDays size={18}/></button></header>{dueSoon.length?<div className="due-list">{dueSoon.map(invoice=><div className="due-item" key={invoice.id}><span className="due-avatar">{(invoice.customerName||'C').slice(0,1).toUpperCase()}</span><div className="due-copy"><strong>{invoice.customerName}</strong><small>{invoice.invoiceNumber} · Due {dateLabel(invoice.dueDate)}</small></div><b>{money(Math.max(0,invoice.total-invoice.paidAmount))}</b></div>)}</div>:<div className="panel-empty"><CheckCircle2 size={23}/><span>No open invoices with due dates</span></div>}</article>
      </section>

      <section className="dashboard-lower-grid table-lower-grid">
        <article className="dashboard-panel recent-panel"><header className="dashboard-panel-head"><div><span className="panel-eyebrow">LATEST ACTIVITY</span><h2>Recent invoices</h2><p>Your latest invoice records</p></div><button className="panel-link" onClick={()=>navigate('/app/invoices')}>All invoices <ArrowRight size={15}/></button></header>{recentInvoices.length?<div className="dashboard-mini-table">{recentInvoices.map(invoice=><div className="mini-table-row" key={invoice.id}><div className="mini-doc-icon"><FileText size={17}/></div><div className="mini-table-copy"><strong>{invoice.invoiceNumber}</strong><small>{invoice.customerName} · {dateLabel(invoice.issueDate)}</small></div><b>{money(invoice.total)}</b><Status value={invoice.status}/></div>)}</div>:<div className="panel-empty">No invoices created yet.</div>}</article>
        <article className="dashboard-panel alerts-panel"><header className="dashboard-panel-head"><div><span className="panel-eyebrow">NEEDS ATTENTION</span><h2>Business alerts</h2><p>Items that may need your attention</p></div><button className="panel-icon-link" onClick={()=>navigate('/app/notifications')}><Bell size={18}/></button></header>{lowStock.length?<div className="alert-list">{lowStock.slice(0,4).map(product=><div className="alert-item" key={product.id}><span className="alert-icon"><Package size={17}/></span><div><strong>{product.name}</strong><small>Only {product.stockOnHand} left · Alert at {product.lowStockAt}</small></div><ArrowRight size={16}/></div>)}</div>:<div className="panel-empty"><CheckCircle2 size={23}/><span>No low-stock alerts</span></div>}<button className="alert-footer" onClick={()=>navigate('/app/inventory')}>Open inventory <ArrowRight size={14}/></button></article>
      </section>
      <div className="dashboard-data-note">{'Business overview is loaded from your MongoDB workspace.'}<button onClick={refresh} aria-label="Refresh dashboard"><RefreshCw size={14}/></button><span className="dashboard-business-name">{business?.name||'SPYRIX Workspace'}</span></div>
    </div>
  );
}
