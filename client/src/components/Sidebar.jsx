import { NavLink } from 'react-router-dom';
import {
  Home, FileText, LayoutTemplate, Users, Package, Boxes,
  CreditCard, Wallet, ChartNoAxesCombined, CalendarDays, Folder, Bot,
  Bell, Download, Database, Settings, CircleHelp, X, WandSparkles, UserRound,
  ClipboardList, RefreshCw, MoreHorizontal,
} from 'lucide-react';

const primary = [
  ['Dashboard', '/app/dashboard', Home],
  ['Invoices', '/app/invoices', FileText],
  ['Customers', '/app/customers', Users],
  ['Products', '/app/products', Package],
  ['Inventory', '/app/inventory', Boxes],
  ['Templates', '/app/templates', LayoutTemplate],
  ['Reports', '/app/reports', ChartNoAxesCombined],
  ['Calendar', '/app/calendar', CalendarDays],
  ['Brand Studio', '/app/tools', WandSparkles],
  ['AI Assistant', '/app/ai-assistant', Bot],
  ['Settings', '/app/settings', Settings],
  ['Profile', '/app/business-settings', UserRound],
];
const more = [
  ['Payments', '/app/payments', CreditCard],
  ['Expenses', '/app/expenses', Wallet],
  ['Quotations', '/app/quotations', ClipboardList],
  ['Recurring Invoices', '/app/recurring', RefreshCw],
  ['Documents', '/app/documents', Folder],
  ['Downloads', '/app/downloads', Download],
  ['Notifications', '/app/notifications', Bell],
  ['Backup & Restore', '/app/backups', Database],
  ['Import Data', '/app/imports', Database],
  ['Help & Support', '/app/help', CircleHelp],
];

function NavGroup({ items, onNavigate }) {
  return items.map(([label, to, Icon]) => (
    <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <Icon size={19} strokeWidth={2.2} /><span>{label}</span>{to === '/app/dashboard' && <span className="nav-chevron">›</span>}
    </NavLink>
  ));
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand"><img src="/assets/spyrix-logo.svg" alt="SPYRIX" /><button className="sidebar-close" onClick={onClose} aria-label="Close menu"><X size={20} /></button></div>
        <nav className="sidebar-nav">
          <NavGroup items={primary} onNavigate={onClose} />
          <details className="sidebar-more">
            <summary><MoreHorizontal size={18} /><span>More workspace</span><span className="sidebar-more-chevron">⌄</span></summary>
            <div className="sidebar-more-list"><NavGroup items={more} onNavigate={onClose} /></div>
          </details>
        </nav>
        <div className="sidebar-growth"><div className="growth-spyrix-mark" aria-label="SPYRIX"><span>S</span><i /></div><div className="growth-copy"><strong>Grow Your Business</strong><span>Smarter. Stronger. Bigger.</span></div></div>
      </aside>
    </>
  );
}
