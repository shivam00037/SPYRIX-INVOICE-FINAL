import { Router } from 'express';
import Customer from '../models/Customer.js';
import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 80);
    if (q.length < 2) return res.json({ results: [] });
    const businessId = req.auth.businessId;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const expression = new RegExp(escaped, 'i');
    const [customers, invoices, products] = await Promise.all([
      Customer.find({ businessId, status: 'active', $or: [{ name: expression }, { customerCode: expression }, { companyName: expression }, { email: expression }, { phone: expression }, { gstin: expression }] }).limit(4).select('customerCode name companyName email phone').lean(),
      Invoice.find({ businessId, invoiceNumber: expression }).limit(4).populate('customerId', 'name companyName').select('invoiceNumber status customerId').lean(),
      Product.find({ businessId, active: true, $or: [{ name: expression }, { sku: expression }] }).limit(4).select('name sku').lean(),
    ]);
    const results = [
      ...invoices.map(item => ({ id: item._id, type: 'Invoice', title: item.invoiceNumber, subtitle: item.customerId?.companyName || item.customerId?.name || item.status, path: '/app/invoices' })),
      ...customers.map(item => ({ id: item._id, type: 'Customer', title: item.name, subtitle: [item.customerCode, item.companyName || item.email].filter(Boolean).join(' · ') || 'Customer record', path: '/app/customers' })),
      ...products.map(item => ({ id: item._id, type: 'Product', title: item.name, subtitle: item.sku || 'Product record', path: '/app/products' })),
    ].slice(0, 10);
    res.json({ results });
  } catch (error) { next(error); }
});

export default router;
