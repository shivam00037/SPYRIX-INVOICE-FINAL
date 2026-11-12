import { useLocation, Navigate } from 'react-router-dom';
import TemplateSelection from './TemplateSelection';
import InvoiceCreatorPage from '../InvoiceCreator/InvoiceCreatorPage';
import { templatesPageConfig } from './page.config.js';

export default function TemplatesPage() {
  const { pathname } = useLocation();
  // Template and invoice editing intentionally share one three-panel studio.
  if (pathname.endsWith(templatesPageConfig.customizeSuffix)) return <InvoiceCreatorPage mode="template" />;
  if (pathname.endsWith(templatesPageConfig.previewSuffix)) return <InvoiceCreatorPage mode="preview" />;
  if (pathname === templatesPageConfig.routeBase || pathname === `${templatesPageConfig.routeBase}/`) return <TemplateSelection />;
  return <Navigate to={templatesPageConfig.routeBase} replace />;
}
