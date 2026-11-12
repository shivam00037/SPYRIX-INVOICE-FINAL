import { Router } from 'express';
import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import Quotation from '../models/Quotation.js';
import InvoiceSequence from '../models/InvoiceSequence.js';
import Business from '../models/Business.js';

const router = Router();
const models = { customers: Customer, products: Product, invoices: Invoice, payments: Payment, expenses: Expense, quotations: Quotation };
const paise = value => Math.round(Number(value || 0) * 100);
const rupees = value => Number(value || 0) / 100;
const clean = value => String(value ?? '').trim();
const validId = value => mongoose.isValidObjectId(value);

function customerSnapshot(customer, overrides = {}) {
  const snapshot = {
    customerCode: customer.customerCode || `CUS-${String(customer._id || '').slice(-8).toUpperCase()}`, name: customer.name || '', contactPerson: customer.contactPerson || '',
    companyName: customer.companyName || '', email: customer.email || '', phone: customer.phone || '',
    alternatePhone: customer.alternatePhone || '', billingAddress: customer.billingAddress || '',
    shippingAddress: customer.shippingAddress || '', city: customer.city || '', state: customer.state || '',
    stateCode: customer.stateCode || '', postalCode: customer.postalCode || '', country: customer.country || 'India',
    gstin: customer.gstin || '', pan: customer.pan || '', paymentTerms: customer.paymentTerms || 'Due on receipt',
    customFields: Array.isArray(customer.customFields) ? customer.customFields : [],
  };
  const editableKeys = ['name', 'contactPerson', 'companyName', 'email', 'phone', 'alternatePhone', 'billingAddress', 'shippingAddress', 'city', 'state', 'stateCode', 'postalCode', 'country', 'gstin', 'pan'];
  for (const key of editableKeys) {
    if (overrides[key] !== undefined) snapshot[key] = clean(overrides[key]).slice(0, key === 'billingAddress' || key === 'shippingAddress' ? 1000 : 250);
  }
  return snapshot;
}

function invoiceDesign(input = {}) {
  const allowed = ['templateId', 'accentColor', 'fontFamily', 'showLogo', 'showQr', 'showSignature', 'showWatermark', 'watermarkText', 'watermarkOpacity', 'paperBackground', 'paperPattern', 'backgroundImageDataUrl', 'backgroundImageOpacity', 'backgroundImageFit', 'fontSize', 'frameStyle', 'headerStyle', 'tableStyle', 'tableDensity', 'showBusinessGstin', 'showCustomerGstin', 'showSku', 'showPaymentInstructions', 'showFooter', 'footerText', 'paymentInstructions', 'logoDataUrl', 'qrDataUrl', 'signatureDataUrl', 'signatureName', 'signatureTitle', 'signatureWidth', 'signatureAlignment', 'signatureCaption', 'logoWidth', 'logoPosition', 'qrWidth', 'qrPosition', 'qrCaption', 'qrInstruction', 'businessName', 'businessAddress', 'businessPhone', 'businessEmail', 'businessWebsite', 'businessGstin', 'businessPan', 'businessBankName', 'businessAccountNumber', 'businessIfsc', 'businessServices', 'businessTagline', 'businessServiceLine', 'businessServiceLine2', 'customerNameLabel', 'customerCompanyLabel', 'customerAddressLabel', 'customerPhoneLabel', 'customerEmailLabel', 'businessNameLabel', 'businessAddressLabel', 'businessPhoneLabel', 'businessEmailLabel', 'websiteLabel', 'thankYouText', 'trustText', 'paymentStatusText', 'amountPaidLabel', 'dueAmountLabel', 'invoiceSubtitle', 'invoiceNumberLabel', 'paymentDetailsLabel', 'businessGstinLabel', 'customerGstinLabel', 'panLabel', 'accountNumberLabel', 'ifscLabel', 'upiLabel', 'upiId', 'invoiceTitle', 'documentLabel', 'issueDateLabel', 'dueDateLabel', 'referenceLabel', 'purchaseOrderLabel', 'paymentInstructionsLabel', 'skuLabel', 'pageSize', 'pageOrientation', 'headingAlignment', 'billToLabel', 'billFromLabel', 'itemLabel', 'quantityLabel', 'rateLabel', 'amountLabel', 'subtotalLabel', 'discountLabel', 'taxLabel', 'totalLabel', 'notesLabel', 'termsLabel'];
  const output = {};
  for (const key of allowed) {
    if (input[key] === undefined) continue;
    if (['showLogo', 'showQr', 'showSignature', 'showWatermark', 'showBusinessGstin', 'showCustomerGstin', 'showSku', 'showPaymentInstructions', 'showFooter'].includes(key)) output[key] = Boolean(input[key]);
    else if (['watermarkOpacity', 'backgroundImageOpacity', 'fontSize', 'signatureWidth', 'logoWidth', 'qrWidth'].includes(key)) output[key] = Math.max(0, Math.min(key === 'watermarkOpacity' ? 30 : key === 'backgroundImageOpacity' ? 100 : 300, Number(input[key]) || 0));
    else output[key] = String(input[key] ?? '').slice(0, key.endsWith('DataUrl') ? 1_250_000 : 4000);
  }
  return output;
}

function cleanCustomFields(fields = []) {
  if (!Array.isArray(fields)) return [];
  return fields.slice(0, 30).map(field => ({ label: clean(field?.label).slice(0, 80), value: clean(field?.value).slice(0, 500) })).filter(field => field.label);
}

function resourceModel(resource) {
  const Model = models[resource];
  if (!Model) {
    const error = new Error('This workspace module is not available yet.');
    error.status = 404;
    throw error;
  }
  return Model;
}

async function nextNumber(businessId, kind = 'invoice') {
  const key = kind === 'quotation' ? 'quotationValue' : 'invoiceValue';
  const seq = await InvoiceSequence.findOneAndUpdate(
    { businessId },
    { $inc: { [key]: 1 }, $setOnInsert: { businessId } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  const business = await Business.findById(businessId).select('invoicePrefix').lean();
  const prefix = kind === 'quotation' ? 'quote' : (business?.invoicePrefix || 'spyrix');
  return `${prefix}${String(seq[key]).padStart(3, '0')}`;
}

async function buildItems(businessId, inputItems = []) {
  if (!Array.isArray(inputItems) || inputItems.length < 1 || inputItems.length > 100) {
    const error = new Error('Add at least one item to continue.'); error.status = 400; throw error;
  }
  const result = [];
  for (const input of inputItems) {
    const quantity = Number(input.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 1000000) {
      const error = new Error('Item quantity must be greater than zero.'); error.status = 400; throw error;
    }
    let product = null;
    if (input.productId && validId(input.productId)) {
      product = await Product.findOne({ _id: input.productId, businessId, active: true }).lean();
      if (!product) { const error = new Error('One selected product could not be found.'); error.status = 400; throw error; }
    }
    const name = clean(input.name || product?.name);
    if (!name) { const error = new Error('Every invoice item needs a name.'); error.status = 400; throw error; }
    const ratePaise = input.rate !== undefined ? paise(input.rate) : (product?.pricePaise || 0);
    const discountPaise = Math.max(0, input.discount !== undefined ? paise(input.discount) : 0);
    const basePaise = Math.round(quantity * ratePaise);
    if (discountPaise > basePaise) { const error = new Error('An item discount cannot exceed its line value.'); error.status = 400; throw error; }
    const taxablePaise = Math.max(0, basePaise - discountPaise);
    const taxRate = Number(input.taxRate ?? product?.taxRate ?? 0);
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) { const error = new Error('Tax rate must be between 0 and 100.'); error.status = 400; throw error; }
    const taxPaise = Math.round(taxablePaise * taxRate / 100);
    result.push({
      productId: product?._id || null,
      name,
      description: clean(input.description || product?.description),
      sku: clean(input.sku || product?.sku),
      quantity,
      unit: clean(input.unit || product?.unit || 'pcs'),
      ratePaise,
      discountPaise,
      taxRate,
      taxablePaise,
      taxPaise,
      lineTotalPaise: taxablePaise + taxPaise,
    });
  }
  const subtotalPaise = result.reduce((sum, item) => sum + Math.round(item.quantity * item.ratePaise), 0);
  const discountPaise = result.reduce((sum, item) => sum + item.discountPaise, 0);
  const taxPaise = result.reduce((sum, item) => sum + item.taxPaise, 0);
  return { items: result, subtotalPaise, discountPaise, taxPaise, totalPaise: subtotalPaise - discountPaise + taxPaise };
}

async function getCustomer(businessId, customerId) {
  if (!validId(customerId)) { const error = new Error('Select a valid customer.'); error.status = 400; throw error; }
  const customer = await Customer.findOne({ _id: customerId, businessId, status: 'active' }).lean();
  if (!customer) { const error = new Error('The selected customer was not found in this workspace.'); error.status = 400; throw error; }
  return customer;
}

async function recalculateInvoiceStatus(businessId, invoiceId) {
  const invoice = await Invoice.findOne({ _id: invoiceId, businessId });
  if (!invoice || ['draft', 'cancelled'].includes(invoice.status)) return;
  const rows = await Payment.aggregate([
    { $match: { businessId: new mongoose.Types.ObjectId(businessId), status: 'completed' } },
    { $unwind: '$allocations' },
    { $match: { 'allocations.invoiceId': invoice._id } },
    { $group: { _id: null, paid: { $sum: '$allocations.amountPaise' } } },
  ]);
  const paid = rows[0]?.paid || 0;
  invoice.status = paid >= invoice.totalPaise ? 'paid' : paid > 0 ? 'partially_paid' : (invoice.dueDate && new Date(invoice.dueDate) < new Date() ? 'overdue' : 'issued');
  await invoice.save();
}

router.get('/:resource', async (req, res, next) => {
  try {
    const Model = resourceModel(req.params.resource);
    const businessId = req.auth.businessId;
    const filter = { businessId };
    if (req.params.resource === 'customers') filter.status = 'active';
    if (req.params.resource === 'products') filter.active = true;
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 100));
    let query = Model.find(filter).sort({ createdAt: -1 }).limit(limit);
    if (req.params.resource === 'invoices' || req.params.resource === 'quotations') query = query.populate('customerId', 'customerCode name contactPerson companyName email phone alternatePhone billingAddress shippingAddress city state stateCode postalCode country gstin pan paymentTerms customFields');
    if (req.params.resource === 'payments') query = query.populate('customerId', 'name companyName').populate('allocations.invoiceId', 'invoiceNumber');
    let items = await query.lean();
    if (req.params.resource === 'customers' && items.length) {
      items = await Promise.all(items.map(async customer => {
        if (customer.customerCode) return customer;
        const customerCode = `CUS-${String(customer._id).slice(-8).toUpperCase()}`;
        await Customer.updateOne({ _id: customer._id, businessId, $or: [{ customerCode: { $exists: false } }, { customerCode: '' }] }, { $set: { customerCode } });
        return { ...customer, customerCode };
      }));
    }
    if (req.params.resource === 'invoices' && items.length) {
      const invoiceIds = items.map(invoice => invoice._id);
      const paidRows = await Payment.aggregate([
        { $match: { businessId: new mongoose.Types.ObjectId(businessId), status: 'completed' } },
        { $unwind: '$allocations' },
        { $match: { 'allocations.invoiceId': { $in: invoiceIds } } },
        { $group: { _id: '$allocations.invoiceId', paidPaise: { $sum: '$allocations.amountPaise' } } },
      ]);
      const paidByInvoice = new Map(paidRows.map(row => [String(row._id), row.paidPaise]));
      const today = new Date(); today.setHours(0, 0, 0, 0);
      items = items.map(invoice => {
        const paidPaise = paidByInvoice.get(String(invoice._id)) || 0;
        const isPastDue = invoice.dueDate && new Date(invoice.dueDate) < today && paidPaise < invoice.totalPaise;
        return { ...invoice, paidPaise, ...(invoice.status === 'issued' && isPastDue ? { status: 'overdue' } : {}) };
      });
    }
    res.json({ items, source: 'mongodb' });
  } catch (error) { next(error); }
});

router.post('/:resource', async (req, res, next) => {
  try {
    const resource = req.params.resource;
    resourceModel(resource);
    const businessId = req.auth.businessId;
    const body = req.body || {};
    let item;

    if (resource === 'customers') {
      const name = clean(body.name);
      if (!name) return res.status(400).json({ message: 'Customer name is required.' });
      const customerId = new mongoose.Types.ObjectId();
      const customerCode = clean(body.customerCode) || `CUS-${customerId.toString().slice(-8).toUpperCase()}`;
      item = await Customer.create({
        _id: customerId, businessId, customerCode, name, contactPerson: clean(body.contactPerson),
        companyName: clean(body.companyName), email: clean(body.email).toLowerCase(), phone: clean(body.phone),
        alternatePhone: clean(body.alternatePhone), billingAddress: clean(body.billingAddress), shippingAddress: clean(body.shippingAddress),
        city: clean(body.city), state: clean(body.state), stateCode: clean(body.stateCode), postalCode: clean(body.postalCode),
        country: clean(body.country) || 'India', gstin: clean(body.gstin).toUpperCase(), pan: clean(body.pan).toUpperCase(),
        paymentTerms: clean(body.paymentTerms) || 'Due on receipt', customFields: cleanCustomFields(body.customFields), notes: clean(body.notes),
      });
    } else if (resource === 'products') {
      const name = clean(body.name);
      if (!name) return res.status(400).json({ message: 'Product name is required.' });
      item = await Product.create({ businessId, name, sku: clean(body.sku).toUpperCase(), description: clean(body.description), category: clean(body.category) || 'General', unit: clean(body.unit) || 'pcs', pricePaise: paise(body.price), costPaise: paise(body.cost), taxRate: Number(body.taxRate || 0), stockOnHand: Number(body.stockOnHand || 0), lowStockAt: Number(body.lowStockAt || 0) });
    } else if (resource === 'invoices' || resource === 'quotations') {
      const customer = await getCustomer(businessId, body.customerId);
      const totals = await buildItems(businessId, body.items);
      if (resource === 'invoices') {
        const requestedNumber = clean(body.invoiceNumber);
        if (requestedNumber.length > 80) return res.status(400).json({ message: 'Invoice number must be 80 characters or fewer.' });
        if (requestedNumber && await Invoice.exists({ businessId, invoiceNumber: requestedNumber })) {
          return res.status(409).json({ message: `Invoice number ${requestedNumber} is already in use in this business.` });
        }
        const invoiceNumber = requestedNumber || await nextNumber(businessId, 'invoice');
        item = await Invoice.create({ businessId, invoiceNumber, customerId: customer._id, customerSnapshot: customerSnapshot(customer, body.customerSnapshot), status: body.status === 'issued' ? 'issued' : 'draft', ...totals, notes: clean(body.notes), terms: clean(body.terms), templateId: clean(body.templateId) || 'xenmark', design: invoiceDesign(body.design), purchaseOrder: clean(body.purchaseOrder), reference: clean(body.reference), customFields: cleanCustomFields(body.customFields), issueDate: body.issueDate || new Date(), dueDate: body.dueDate || undefined });
      } else {
        const quotationNumber = await nextNumber(businessId, 'quotation');
        item = await Quotation.create({ businessId, quotationNumber, customerId: customer._id, customerSnapshot: { name: customer.name, companyName: customer.companyName, email: customer.email }, items: totals.items, totalPaise: totals.totalPaise, status: 'draft', validUntil: body.validUntil || undefined, notes: clean(body.notes) });
      }
    } else if (resource === 'payments') {
      const amountPaise = paise(body.amount);
      if (!Number.isSafeInteger(amountPaise) || amountPaise < 1) return res.status(400).json({ message: 'Enter a payment amount greater than zero.' });
      const allocations = [];
      if (body.invoiceId) {
        if (!validId(body.invoiceId)) return res.status(400).json({ message: 'Select a valid invoice.' });
        const invoice = await Invoice.findOne({ _id: body.invoiceId, businessId, status: { $nin: ['draft', 'cancelled'] } });
        if (!invoice) return res.status(400).json({ message: 'The selected invoice is not available for payment.' });
        const paymentRows = await Payment.aggregate([
          { $match: { businessId: new mongoose.Types.ObjectId(businessId), status: 'completed' } }, { $unwind: '$allocations' },
          { $match: { 'allocations.invoiceId': invoice._id } }, { $group: { _id: null, paid: { $sum: '$allocations.amountPaise' } } },
        ]);
        const outstanding = Math.max(0, invoice.totalPaise - (paymentRows[0]?.paid || 0));
        if (amountPaise > outstanding) return res.status(400).json({ message: `Payment exceeds the outstanding balance of ₹${rupees(outstanding).toFixed(2)}.` });
        allocations.push({ invoiceId: invoice._id, amountPaise });
        body.customerId = invoice.customerId;
      }
      item = await Payment.create({ businessId, customerId: body.customerId && validId(body.customerId) ? body.customerId : null, amountPaise, paymentDate: body.paymentDate || new Date(), method: body.method || 'other', reference: clean(body.reference), status: 'completed', allocations });
      for (const allocation of allocations) await recalculateInvoiceStatus(businessId, allocation.invoiceId);
    } else if (resource === 'expenses') {
      const title = clean(body.title);
      const amountPaise = paise(body.amount);
      if (!title || amountPaise < 1) return res.status(400).json({ message: 'Enter an expense title and amount greater than zero.' });
      item = await Expense.create({ businessId, title, amountPaise, category: clean(body.category) || 'General', vendor: clean(body.vendor), paymentMethod: clean(body.paymentMethod) || 'other', expenseDate: body.expenseDate || new Date(), notes: clean(body.notes), status: body.status === 'unpaid' ? 'unpaid' : 'paid' });
    }
    res.status(201).json({ item, source: 'mongodb' });
  } catch (error) { next(error); }
});

router.put('/:resource/:id', async (req, res, next) => {
  try {
    const resource = req.params.resource;
    resourceModel(resource);
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid record ID.' });
    const businessId = req.auth.businessId;
    const body = req.body || {};
    let item;
    if (resource === 'customers') {
      const allowed = ['name', 'contactPerson', 'companyName', 'email', 'phone', 'alternatePhone', 'billingAddress', 'shippingAddress', 'city', 'state', 'stateCode', 'postalCode', 'country', 'gstin', 'pan', 'paymentTerms', 'notes'];
      const update = Object.fromEntries(allowed.filter(key => body[key] !== undefined).map(key => [key, key === 'email' ? clean(body[key]).toLowerCase() : clean(body[key])]));
      if (body.customFields !== undefined) update.customFields = cleanCustomFields(body.customFields);
      item = await Customer.findOneAndUpdate({ _id: req.params.id, businessId }, update, { new: true, runValidators: true });
    } else if (resource === 'products') {
      const allowed = ['name', 'sku', 'description', 'category', 'unit', 'taxRate', 'stockOnHand', 'lowStockAt'];
      const update = Object.fromEntries(allowed.filter(key => body[key] !== undefined).map(key => [key, typeof body[key] === 'string' ? clean(body[key]) : Number(body[key])]));
      if (body.price !== undefined) update.pricePaise = paise(body.price);
      if (body.cost !== undefined) update.costPaise = paise(body.cost);
      item = await Product.findOneAndUpdate({ _id: req.params.id, businessId }, update, { new: true, runValidators: true });
    } else if (resource === 'expenses') {
      const update = {};
      for (const key of ['title', 'category', 'vendor', 'paymentMethod', 'notes', 'status']) if (body[key] !== undefined) update[key] = clean(body[key]);
      if (body.amount !== undefined) update.amountPaise = paise(body.amount);
      if (body.expenseDate !== undefined) update.expenseDate = body.expenseDate;
      item = await Expense.findOneAndUpdate({ _id: req.params.id, businessId }, update, { new: true, runValidators: true });
    } else if (resource === 'invoices') {
      const invoice = await Invoice.findOne({ _id: req.params.id, businessId });
      if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
      if (body.status === 'issued' && invoice.status === 'draft') {
        invoice.status = 'issued'; invoice.issueDate = invoice.issueDate || new Date(); await invoice.save();
      } else if (body.status === 'cancelled' && ['draft', 'issued'].includes(invoice.status)) {
        invoice.status = 'cancelled'; await invoice.save();
      } else if (invoice.status === 'draft' && Array.isArray(body.items)) {
        const customer = await getCustomer(businessId, body.customerId || invoice.customerId);
        const totals = await buildItems(businessId, body.items);
        invoice.customerId = customer._id;
        invoice.customerSnapshot = customerSnapshot(customer, body.customerSnapshot);
        invoice.items = totals.items;
        invoice.subtotalPaise = totals.subtotalPaise;
        invoice.discountPaise = totals.discountPaise;
        invoice.taxPaise = totals.taxPaise;
        invoice.totalPaise = totals.totalPaise;
        if (body.issueDate) invoice.issueDate = body.issueDate;
        if (body.dueDate !== undefined) invoice.dueDate = body.dueDate || undefined;
        if (body.notes !== undefined) invoice.notes = clean(body.notes);
        if (body.templateId) invoice.templateId = clean(body.templateId);
        if (body.design) invoice.design = invoiceDesign(body.design);
        if (body.purchaseOrder !== undefined) invoice.purchaseOrder = clean(body.purchaseOrder);
        if (body.reference !== undefined) invoice.reference = clean(body.reference);
        if (body.customFields !== undefined) invoice.customFields = cleanCustomFields(body.customFields);
        await invoice.save();
      } else {
        return res.status(400).json({ message: 'Only draft invoices can be edited or issued. Issued invoices are retained as financial history.' });
      }
      item = invoice;
    } else if (resource === 'quotations') {
      const update = {};
      for (const key of ['status', 'notes']) if (body[key] !== undefined) update[key] = clean(body[key]);
      if (body.validUntil !== undefined) update.validUntil = body.validUntil;
      item = await Quotation.findOneAndUpdate({ _id: req.params.id, businessId }, update, { new: true, runValidators: true });
    } else {
      return res.status(405).json({ message: 'This record type cannot be edited from this screen.' });
    }
    if (!item) return res.status(404).json({ message: 'Record not found.' });
    res.json({ item, source: 'mongodb' });
  } catch (error) { next(error); }
});

router.delete('/:resource/:id', async (req, res, next) => {
  try {
    const resource = req.params.resource;
    resourceModel(resource);
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid record ID.' });
    const businessId = req.auth.businessId;
    let item;
    if (resource === 'customers') item = await Customer.findOneAndUpdate({ _id: req.params.id, businessId }, { status: 'archived' }, { new: true });
    else if (resource === 'products') item = await Product.findOneAndUpdate({ _id: req.params.id, businessId }, { active: false }, { new: true });
    else if (resource === 'expenses') item = await Expense.findOneAndDelete({ _id: req.params.id, businessId });
    else if (resource === 'quotations') item = await Quotation.findOneAndDelete({ _id: req.params.id, businessId });
    else return res.status(405).json({ message: 'Financial records such as invoices and payments are retained for audit history.' });
    if (!item) return res.status(404).json({ message: 'Record not found.' });
    res.json({ success: true, id: req.params.id, source: 'mongodb' });
  } catch (error) { next(error); }
});

export default router;
