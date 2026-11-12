import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Home, Menu, Moon, Palette, Search, Sun, LogOut, UserRound, Check } from 'lucide-react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../data/DataContext';

export default function Topbar({ onOpenMenu, theme, onThemeChange, dark, onToggleDark }) {
  const [query, setQuery] = useState('');
  const searchInput = useRef(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState('');
  const { user, business, logout } = useAuth();
  const { records } = useData();
  const navigate = useNavigate();
  const notificationCount = records.invoices.filter(row => row.status === 'overdue').length + records.products.filter(row => row.lowStockAt > 0 && row.stockOnHand <= row.lowStockAt).length;

  useEffect(() => {
    const onShortcut = event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchInput.current?.focus(); } };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  const search = async (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) { setResults(null); return; }
    try {
      setError('');
      const data = await apiRequest(`/search?q=${encodeURIComponent(term)}`);
      setResults(data.results || []);
      setOpen('search');
    } catch (err) { setError(err.message); setResults([]); setOpen('search'); }
  };

  return (
    <header className="topbar">
      <button className="mobile-menu-button" onClick={onOpenMenu} aria-label="Open menu"><Menu size={22} /></button>
      <div className="topbar-search-wrap">
        <form className="topbar-search" onSubmit={search}>
          <Search size={25} strokeWidth={2.4} />
          <input ref={searchInput} value={query} onChange={e => setQuery(e.target.value)} onFocus={() => results && setOpen('search')} placeholder="Search customers, invoices, products..." />
          <kbd>Ctrl + K</kbd>
        </form>
        {open === 'search' && <div className="topbar-popover search-results"><div className="popover-title">Search results <button onClick={() => setOpen('')}>✕</button></div>{error ? <p className="popover-empty">{error}</p> : results?.length ? results.map(item => <button key={`${item.type}-${item.id}`} className="search-result" onClick={() => { navigate(item.path || '/app/dashboard'); setOpen(''); }}><span className="result-type">{item.type}</span><span><strong>{item.title}</strong><small>{item.subtitle}</small></span></button>) : <p className="popover-empty">No matching records found.</p>}</div>}
      </div>
      <div className="topbar-actions">
        <button className="top-icon home-top-icon" aria-label="Dashboard" onClick={() => navigate('/app/dashboard')}><Home size={20} /></button>
        <div className="popover-anchor">
          <button className="top-icon" aria-label="Change theme" onClick={() => setOpen(open === 'theme' ? '' : 'theme')}><Palette size={20} /></button>
          {open === 'theme' && <div className="topbar-popover theme-popover"><strong>Choose theme</strong>{[['mono','Black & White'],['neon','Neon Yellow & Black'],['burgundy','Burgundy · White · Black'],['red','Red & White'],['yellow','Yellow & White'],['purple','Purple & White']].map(([value,label]) => <button key={value} onClick={() => { onThemeChange(value); setOpen(''); }}><span className={`theme-dot ${value}`} />{label}{theme === value && <Check size={16} />}</button>)}</div>}
        </div>
        <button className="top-icon" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={onToggleDark}>{dark ? <Sun size={20} /> : <Moon size={20} />}</button>
        <div className="popover-anchor">
          <button className="top-icon notification-top-icon" aria-label="Notifications" onClick={() => setOpen(open === 'notifications' ? '' : 'notifications')}><Bell size={20} />{notificationCount > 0 && <i>{notificationCount > 9 ? '9+' : notificationCount}</i>}</button>
          {open === 'notifications' && <div className="topbar-popover notification-popover"><strong>Notifications</strong><p className="popover-empty">{notificationCount ? `${notificationCount} business alert${notificationCount === 1 ? '' : 's'} need attention: overdue invoices or low-stock products.` : 'You are all caught up. There are no overdue invoices or low-stock alerts.'}</p><button className="popover-link" onClick={() => { navigate('/app/notifications'); setOpen(''); }}>Open notifications</button></div>}
        </div>
        <div className="popover-anchor profile-anchor">
          <button className="profile-button" onClick={() => setOpen(open === 'profile' ? '' : 'profile')}><span className="profile-avatar">{(user?.name || 'SP').split(' ').map(part => part[0]).slice(0,2).join('').toUpperCase()}</span><span className="profile-copy"><strong>{user?.name || 'Business Owner'}</strong><small>{business?.name || 'Workspace'}</small></span><ChevronDown size={17} /></button>
          {open === 'profile' && <div className="topbar-popover profile-popover"><div className="profile-popover-user"><UserRound size={18} /><span><strong>{user?.email}</strong><small>{business?.name}</small></span></div><button onClick={() => { logout(); navigate('/'); }}><LogOut size={16} /> Sign out</button></div>}
        </div>
      </div>
    </header>
  );
}
