import { Router } from 'express';
import Business from '../models/Business.js';

const router = Router();
const clean = value => String(value ?? '').trim();
const designKeys = ['templateId', 'accentColor', 'fontFamily', 'showLogo', 'showQr', 'showSignature', 'showWatermark', 'watermarkText', 'watermarkOpacity', 'paperBackground', 'paperPattern', 'backgroundImageDataUrl', 'backgroundImageOpacity', 'backgroundImageFit', 'fontSize', 'frameStyle', 'headerStyle', 'tableStyle', 'tableDensity', 'showBusinessGstin', 'showCustomerGstin', 'showSku', 'showPaymentInstructions', 'showFooter', 'footerText', 'paymentInstructions', 'logoDataUrl', 'qrDataUrl', 'signatureDataUrl', 'signatureName', 'signatureTitle', 'signatureWidth', 'signatureAlignment', 'signatureCaption', 'logoWidth', 'logoPosition', 'qrWidth', 'qrPosition', 'qrCaption', 'qrInstruction', 'businessName', 'businessAddress', 'businessPhone', 'businessEmail', 'businessWebsite', 'businessGstin', 'businessPan', 'businessBankName', 'businessAccountNumber', 'businessIfsc', 'businessServices', 'businessTagline', 'businessServiceLine', 'businessServiceLine2', 'customerNameLabel', 'customerCompanyLabel', 'customerAddressLabel', 'customerPhoneLabel', 'customerEmailLabel', 'businessNameLabel', 'businessAddressLabel', 'businessPhoneLabel', 'businessEmailLabel', 'websiteLabel', 'thankYouText', 'trustText', 'paymentStatusText', 'amountPaidLabel', 'dueAmountLabel', 'invoiceSubtitle', 'invoiceNumberLabel', 'paymentDetailsLabel', 'businessGstinLabel', 'customerGstinLabel', 'panLabel', 'accountNumberLabel', 'ifscLabel', 'upiLabel', 'upiId', 'invoiceTitle', 'documentLabel', 'issueDateLabel', 'dueDateLabel', 'referenceLabel', 'purchaseOrderLabel', 'paymentInstructionsLabel', 'skuLabel', 'pageSize', 'pageOrientation', 'headingAlignment', 'billToLabel', 'billFromLabel', 'itemLabel', 'quantityLabel', 'rateLabel', 'amountLabel', 'subtotalLabel', 'discountLabel', 'taxLabel', 'totalLabel', 'notesLabel', 'termsLabel'];

function sanitizeDesign(input = {}) {
  const output = {};
  for (const key of designKeys) {
    if (input[key] === undefined) continue;
    if (['showLogo', 'showQr', 'showSignature', 'showWatermark', 'showBusinessGstin', 'showCustomerGstin', 'showSku', 'showPaymentInstructions', 'showFooter'].includes(key)) output[key] = Boolean(input[key]);
    else if (['watermarkOpacity', 'backgroundImageOpacity', 'fontSize', 'signatureWidth', 'logoWidth', 'qrWidth'].includes(key)) output[key] = Math.max(0, Math.min(key === 'watermarkOpacity' ? 30 : key === 'backgroundImageOpacity' ? 100 : 300, Number(input[key]) || 0));
    else output[key] = String(input[key] ?? '').slice(0, key.endsWith('DataUrl') ? 1_250_000 : 4000);
  }
  return output;
}

router.get('/settings', async (req, res, next) => {
  try {
    const business = await Business.findById(req.auth.businessId).select('-ownerId').lean();
    if (!business) return res.status(404).json({ message: 'Business workspace not found.' });
    res.json({ business });
  } catch (error) { next(error); }
});

router.put('/settings', async (req, res, next) => {
  try {
    if (!['Owner', 'Admin'].includes(req.auth.role)) return res.status(403).json({ message: 'Only a workspace owner or admin can change business settings.' });
    const body = req.body || {};
    const allowed = ['name', 'address', 'phone', 'email', 'website', 'gstin', 'state', 'stateCode', 'postalCode', 'country', 'invoicePrefix'];
    const update = Object.fromEntries(allowed.filter(key => body[key] !== undefined).map(key => [key, key === 'email' ? clean(body[key]).toLowerCase() : key === 'gstin' ? clean(body[key]).toUpperCase() : clean(body[key])]));
    if (body.invoiceDesign !== undefined) update.invoiceDesign = sanitizeDesign(body.invoiceDesign);
    const business = await Business.findByIdAndUpdate(req.auth.businessId, update, { new: true, runValidators: true }).select('-ownerId').lean();
    if (!business) return res.status(404).json({ message: 'Business workspace not found.' });
    res.json({ business, source: 'mongodb' });
  } catch (error) { next(error); }
});

export default router;
