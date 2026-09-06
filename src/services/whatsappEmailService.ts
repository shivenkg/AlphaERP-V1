import { Lead, Quote, PurchaseOrder, PaymentRecord, WorkOrder } from '../types';

export class CommunicationService {
  // Format clean phone for WhatsApp
  public static cleanPhoneNumber(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }

  // Generate WhatsApp Direct Link
  public static getWhatsAppUrl(phone: string, text: string): string {
    const cleanPhone = this.cleanPhoneNumber(phone);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }

  // Generate Mailto Link
  public static getMailtoUrl(email: string, subject: string, body: string): string {
    return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  // Lead Nurture / Site Survey Template
  public static getLeadNurtureTemplate(lead: Lead): { subject: string; message: string } {
    const subject = `HVAC Solution Proposal & Site Survey - ${lead.companyName}`;
    const message = `Hello ${lead.clientName},

Thank you for your inquiry regarding the HVAC solution (${lead.hvacType} ~${lead.estimatedCapacityTR} TR) for your facility at ${lead.projectAddress}.

Our senior HVAC application engineering team is ready to conduct a detailed heat load calculation and site survey to tailor an optimal energy-efficient setup for ${lead.companyName}.

Key Offerings:
✓ Advanced VRF / Chiller System Design with lowest lifecycle energy cost
✓ Turnkey Execution: AHUs, Ducting, Copper Piping, and BMS Integration
✓ Comprehensive warranty & 24/7 OEM-certified service support

Please let us know your preferred date & time for the site survey.

Best regards,
${lead.assignedToName || 'AlphaERP Engineering Team'}
Alpha HVAC Solutions & Engineering Services Ltd`;

    return { subject, message };
  }

  // Quotation Delivery Template
  public static getQuotationTemplate(quote: Quote): { subject: string; message: string } {
    const subject = `Official HVAC Techno-Commercial Quotation ${quote.quoteNumber} - ${quote.projectTitle}`;
    const message = `Dear ${quote.clientName},

We are pleased to submit our techno-commercial proposal for "${quote.projectTitle}" (${quote.quoteNumber}).

Quotation Summary:
• Total Line Items: ${quote.items.length} Scope Categories
• Equipment & Execution Cost: ₹${quote.subtotal.toLocaleString()}
• Special Discount: ₹${quote.discountAmount.toLocaleString()} (${quote.discountPct}%)
• Total Contract Value (incl. GST): ₹${quote.totalAmount.toLocaleString()}
• Delivery Timeline: ${quote.deliveryTimeline}
• Payment Terms: ${quote.paymentTerms}

The detailed Bill of Quantities (BOQ) and equipment specifications are ready for your review. We would be delighted to schedule a discussion to finalize the commercial award.

Warm regards,
${quote.preparedBy}
AlphaERP Projects Division`;

    return { subject, message };
  }

  // Purchase Order Transmission to Vendor (Stock Replenishment)
  public static getPOTemplate(po: PurchaseOrder): { subject: string; message: string } {
    const subject = `PURCHASE ORDER: ${po.poNumber} - HVAC Equipment & Stock Replenishment`;
    const message = `Dear ${po.vendorName} Team,

Please find our official Purchase Order ${po.poNumber} for material replenishment.

PO Summary:
• PO Number: ${po.poNumber}
• PR Reference: ${po.prNumber || 'Direct Procurement'}
• Project: ${po.projectName}
• Total Order Value: ₹${po.grandTotal.toLocaleString()} (inclusive of taxes)
• Expected Delivery Date: ${po.expectedDeliveryDate}
• Delivery Location: ${po.deliveryAddress}

Items Ordered:
${po.items.map((it, idx) => `${idx + 1}. [${it.sku}] ${it.name} | Qty: ${it.orderedQty} ${it.unit} @ ₹${it.unitRate.toLocaleString()}`).join('\n')}

Kindly share formal order confirmation, dispatch schedule, and logistics LR tracking once dispatched.

Sincerely,
Procurement & Supply Chain Department
AlphaERP Procurement`;

    return { subject, message };
  }

  // Payment Milestone Invoice Reminder
  public static getPaymentInvoiceTemplate(payment: PaymentRecord): { subject: string; message: string } {
    const subject = `Invoice & Milestone Payment Notification - ${payment.invoiceNumber} (₹${payment.totalAmount.toLocaleString()})`;
    const message = `Dear ${payment.clientOrVendorName},

This is regarding the payment milestone for "${payment.referenceTitle}".

Invoice Details:
• Invoice Number: ${payment.invoiceNumber}
• Milestone Type: ${payment.paymentType}
• Net Payable Amount: ₹${payment.totalAmount.toLocaleString()}
• Due Date: ${payment.dueDate}
• Status: ${payment.status.toUpperCase()}

Kindly arrange the remittance at your earliest convenience via Bank NEFT / RTGS or direct payment. Please share the UTR reference upon completion.

Thank you for your continued partnership.

Accounts & Finance Department
AlphaERP Financial Operations`;

    return { subject, message };
  }

  // Work Order Technician Dispatch Template
  public static getWorkOrderDispatchTemplate(wo: WorkOrder): { subject: string; message: string } {
    const subject = `HVAC Work Order Dispatch: ${wo.orderNumber} - ${wo.clientName}`;
    const message = `Work Order Assignment:
• Order #: ${wo.orderNumber}
• Client: ${wo.clientName}
• Site Address: ${wo.siteAddress}
• Service Type: ${wo.serviceType}
• Assigned Lead Tech: ${wo.assignedTechnician}
• Schedule: ${wo.scheduledStartDate} to ${wo.scheduledEndDate}

Scope Checklist:
${wo.scopeOfWork.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

Safety & Quality Compliance: Ensure all PPE is worn, brazing nitrogen purge protocol is followed, and client signature is obtained upon milestone signoff.`;

    return { subject, message };
  }
}
