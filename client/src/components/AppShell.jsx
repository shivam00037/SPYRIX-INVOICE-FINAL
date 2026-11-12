import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { DataProvider } from '../data/DataContext';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import InvoicesPage from '../pages/Invoices/InvoicesPage';
import InvoiceCreatorPage from '../pages/InvoiceCreator/InvoiceCreatorPage';
import TemplatesPage from '../pages/Templates/TemplatesPage';
import QuotationsPage from '../pages/Quotations/QuotationsPage';
import CustomersPage from '../pages/Customers/CustomersPage';
import ProductsPage from '../pages/Products/ProductsPage';
import InventoryPage from '../pages/Inventory/InventoryPage';
import PaymentsPage from '../pages/Payments/PaymentsPage';
import ExpensesPage from '../pages/Expenses/ExpensesPage';
import ReportsPage from '../pages/Reports/ReportsPage';
import CalendarPage from '../pages/Calendar/CalendarPage';
import RecurringPage from '../pages/Recurring/RecurringPage';
import DocumentsPage from '../pages/Documents/DocumentsPage';
import NotificationsPage from '../pages/Notifications/NotificationsPage';
import DownloadsPage from '../pages/Downloads/DownloadsPage';
import BackupsPage from '../pages/Backups/BackupsPage';
import ImportsPage from '../pages/Imports/ImportsPage';
import BusinessSettingsPage from '../pages/BusinessSettings/BusinessSettingsPage';
import AccountSettingsPage from '../pages/AccountSettings/AccountSettingsPage';
import HelpPage from '../pages/Help/HelpPage';
import ToolsPage from '../pages/Tools/ToolsPage';
import AIAssistantPage from '../pages/AIAssistant/AIAssistantPage';

function AppShellContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => { const saved = localStorage.getItem('spyrix_theme'); return ['red','yellow','purple','burgundy','mono','neon'].includes(saved) ? saved : 'mono'; });
  const [dark, setDark] = useState(() => localStorage.getItem('spyrix_dark') === 'true');

  const changeTheme = (nextTheme) => {
    const safeTheme = ['red','yellow','purple','burgundy','mono','neon'].includes(nextTheme) ? nextTheme : 'mono';
    setTheme(safeTheme);
    localStorage.setItem('spyrix_theme', safeTheme);
  };
  const toggleDark = () => {
    setDark(value => {
      localStorage.setItem('spyrix_dark', String(!value));
      return !value;
    });
  };

  useEffect(() => {
    const handleThemeChange = event => {
      const nextTheme = event.detail;
      if (!['red', 'yellow', 'purple', 'burgundy', 'mono', 'neon'].includes(nextTheme)) return;
      changeTheme(nextTheme);
    };
    window.addEventListener('spyrix:theme-change', handleThemeChange);
    return () => window.removeEventListener('spyrix:theme-change', handleThemeChange);
  }, []);

  return (
    <div className={`app-shell ${dark ? 'dark-mode' : ''}`} data-theme={theme}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main-area">
        <Topbar onOpenMenu={() => setMobileOpen(true)} theme={theme} onThemeChange={changeTheme} dark={dark} onToggleDark={toggleDark} />
        <div className="page-content">
          <Routes>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="ai-assistant" element={<AIAssistantPage />} />
            <Route path="invoices/new" element={<InvoiceCreatorPage />} />
            <Route path="invoices/*" element={<InvoicesPage />} />
            <Route path="templates/*" element={<TemplatesPage />} />
            <Route path="quotations" element={<QuotationsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="recurring" element={<RecurringPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="downloads" element={<DownloadsPage />} />
            <Route path="backups" element={<BackupsPage />} />
            <Route path="imports" element={<ImportsPage />} />
            <Route path="business-settings" element={<BusinessSettingsPage />} />
            <Route path="settings" element={<AccountSettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function AppShell() {
  return <DataProvider><AppShellContent /></DataProvider>;
}
