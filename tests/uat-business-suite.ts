// @ts-nocheck
/**
 * Comprehensive Enterprise UAT Test Suite for AlphaERP
 * Atmos Aircon Enterprise HVAC Suite
 * 
 * Verifies all 10 core business use cases against real service logic,
 * calculations, state transitions, security constraints, and database sync.
 */

import { storageService } from '../src/services/storageService';
import type {
  Lead,
  Quote,
  QuoteLineItem,
  Project,
  PurchaseRequisition,
  PurchaseOrder,
  InventoryItem,
  GoodsReceiptNote,
  PaymentRecord,
  Employee
} from '../src/types';

interface UATStepResult {
  step: string;
  passed: boolean;
  details: string;
  durationMs: number;
}

interface UATTestCaseResult {
  caseId: string;
  title: string;
  category: string;
  passed: boolean;
  steps: UATStepResult[];
  error?: string;
}

const testResults: UATTestCaseResult[] = [];

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runTestCase(
  caseId: string,
  title: string,
  category: string,
  fn: (addStep: (stepName: string, detailFn: () => void | Promise<void>) => Promise<void>) => Promise<void>
) {
  const steps: UATStepResult[] = [];
  let casePassed = true;
  let caseError: string | undefined;

  const addStep = async (stepName: string, detailFn: () => void | Promise<void>) => {
    const startStep = Date.now();
    try {
      await detailFn();
      steps.push({
        step: stepName,
        passed: true,
        details: 'Step executed successfully with all assertions passed.',
        durationMs: Date.now() - startStep
      });
    } catch (err: any) {
      casePassed = false;
      steps.push({
        step: stepName,
        passed: false,
        details: err.message || String(err),
        durationMs: Date.now() - startStep
      });
      throw err;
    }
  };

  try {
    await fn(addStep);
  } catch (err: any) {
    casePassed = false;
    caseError = err.message || String(err);
  }

  testResults.push({
    caseId,
    title,
    category,
    passed: casePassed,
    steps,
    error: caseError
  });
}

// Global test variables to chain realistic enterprise flows
let createdLead: Lead;
let createdQuote: Quote;
let createdProject: Project;
let createdPR: PurchaseRequisition;
let createdPO: PurchaseOrder;
let initialStockLevel: number = 0;
let createdGRN: GoodsReceiptNote;
let createdInvoice: PaymentRecord;
let testEmployee: Employee;

export async function executeAllUATTests() {
  console.log('================================================================');
  console.log('🚀 STARTING ALPHAERP ENTERPRISE UAT TEST SUITE');
  console.log('   Testing 10 Business Best-Practice Core Use Cases');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // USE CASE 1: CRM & OPPORTUNITY MANAGEMENT LIFECYCLE
  // --------------------------------------------------------------------------
  await runTestCase(
    'UAT-01',
    'Commercial HVAC Lead Lifecycle & Opportunity Pipeline',
    'CRM & Sales',
    async (step) => {
      await step('1.1 Create High-Value Hospital HVAC Enquiry', () => {
        createdLead = storageService.addLead({
          clientName: 'Apollo Medcity Healthcare Ltd',
          contactPerson: 'Dr. Rajiv Malhotra (Chief Infra Officer)',
          email: 'rajiv.malhotra@apollomedcity.org',
          phone: '+91 98201 44552',
          city: 'Mumbai',
          status: 'New',
          source: 'Tender / RFP',
          estimatedTonnage: 320,
          estimatedValue: 16500000,
          projectType: 'Commercial HVAC VRF & Central Chiller',
          assignedSalesRep: 'Rahul Sharma',
          remarks: '320 TR Hospital Tower requiring OT laminar air flow, VRF for wards and HEPA filtration.'
        });

        assert(createdLead.id, 'Lead ID must be generated');
        assert(createdLead.leadNumber.includes('LD') || createdLead.leadNumber.includes('LEAD'), `Lead number must contain series code LD, got: ${createdLead.leadNumber}`);
        assert(createdLead.estimatedValue === 16500000, 'Estimated value must match input');
        assert(createdLead.status === 'New', 'Initial status must be New');
      });

      await step('1.2 Log Site Survey Communication & Schedule Survey', () => {
        storageService.logLeadCommunication(
          createdLead.id,
          'Phone Call',
          'Discussed chiller plant room layout, electrical load availability (415V 3-phase) and cooling tower terrace load limits.'
        );

        storageService.addLeadFollowUp(createdLead.id, {
          date: '2026-09-15',
          notes: 'Conduct physical site survey of Apollo Medcity Tower with Senior HVAC Project Engineer.',
          assignedTo: 'Rahul Sharma'
        });

        const refreshed = storageService.getLeads().find((l) => l.id === createdLead.id);
        assert((refreshed?.communications.length || 0) >= 2, 'Communication log must contain entries');
        assert(refreshed?.followUps.length === 1, 'Follow-up list must contain 1 entry');
      });

      await step('1.3 Advance Pipeline: Survey Done -> BOQ Ready -> Won', () => {
        storageService.updateLead(createdLead.id, { status: 'Proposal Sent' });
        storageService.updateLead(createdLead.id, { status: 'Negotiation' });
        storageService.updateLead(createdLead.id, { status: 'Won' });

        const refreshed = storageService.getLeads().find((l) => l.id === createdLead.id);
        assert(refreshed?.status === 'Won', 'Lead status must be Won');
      });
    }
  );

  // --------------------------------------------------------------------------
  // USE CASE 2: MULTI-CATEGORY HVAC BOQ & QUOTATION ENGINE
  // --------------------------------------------------------------------------
  await runTestCase(
    'UAT-02',
    'Detailed Multi-Category BOQ & HVAC Pricing Engine',
    'Quotation & Engineering',
    async (step) => {
      await step('2.1 Build Multi-Category BOQ with High/Low Side Equipment', () => {
        const items: QuoteLineItem[] = [
          {
            id: 'item-1',
            category: 'Equipment',
            itemSku: 'CHL-SCR-160TR',
            description: 'Air-Cooled Screw Chiller 160 TR with Eco Refrigerant R134a & VFD Compressor',
            qty: 2,
            unit: 'Nos',
            unitCost: 3500000,
            unitPrice: 4200000,
            totalCost: 7000000,
            totalPrice: 8400000
          },
          {
            id: 'item-2',
            category: 'Ducting & Insulation',
            itemSku: 'DUCT-GI-24G',
            description: 'Class VIII Factory Fabricated Galvanized Iron (GI) Sheet Ducting with acoustic lining',
            qty: 1800,
            unit: 'Sq.Mt',
            unitCost: 1150,
            unitPrice: 1450,
            totalCost: 2070000,
            totalPrice: 2610000
          },
          {
            id: 'item-3',
            category: 'Piping & Valves',
            itemSku: 'PIP-MS-150-HEAVY',
            description: 'Heavy Class MS Chilled Water Piping (150mm NB) with 25mm Nitrile Rubber Insulation',
            qty: 650,
            unit: 'RMT',
            unitCost: 2600,
            unitPrice: 3200,
            totalCost: 1690000,
            totalPrice: 2080000
          },
          {
            id: 'item-4',
            category: 'Testing & Commissioning',
            description: 'Complete System Air Balancing (TAB), Chilled Water Flow Balancing & Handover Protocol',
            qty: 1,
            unit: 'Lot',
            unitCost: 320000,
            unitPrice: 450000,
            totalCost: 320000,
            totalPrice: 450000
          }
        ];

        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0); // 13,540,000
        const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0); // 11,080,000
        const taxPct = 18;
        const taxAmount = Math.round((subtotal * taxPct) / 100); // 2,437,200
        const totalAmount = subtotal + taxAmount; // 15,977,200
        const grossMarginAmount = subtotal - totalCost; // 2,460,000
        const grossMarginPct = Number(((grossMarginAmount / subtotal) * 100).toFixed(2));

        createdQuote = storageService.addQuote({
          leadId: createdLead.id,
          clientName: createdLead.clientName,
          companyName: createdLead.clientName,
          projectTitle: 'Apollo Medcity - 320 TR Hospital Central Chiller & OT HVAC Suite',
          siteAddress: 'Apollo Medcity Campus, Sector 18, Navi Mumbai',
          preparedBy: 'Rahul Sharma (Senior HVAC Sales Manager)',
          date: '2026-09-12',
          validUntil: '2026-10-30',
          items,
          subtotal,
          discountPct: 0,
          discountAmount: 0,
          taxPct,
          taxAmount,
          totalAmount,
          totalCost,
          grossMarginAmount,
          grossMarginPct,
          paymentTerms: '30% Advance, 50% Against Delivery, 20% on Testing & Handover',
          warrantyTerms: '12 Months DLP from Date of Handover',
          deliveryTimeline: '8-10 Weeks from Receipt of Advance & Civil Clearance',
          status: 'Draft',
          notes: 'Commercial quotation inclusive of 18% GST, freight, unloading and testing.'
        });

        assert(createdQuote.id, 'Quote ID must be generated');
        assert(createdQuote.quoteNumber.includes('QT') || createdQuote.quoteNumber.includes('QTE'), `Quote number must contain series code QT, got: ${createdQuote.quoteNumber}`);
        assert(createdQuote.items.length === 4, 'Must have 4 BOQ line items');
        assert(createdQuote.totalAmount === 15977200, `Total must equal 15977200, got: ${createdQuote.totalAmount}`);
        assert(createdQuote.grossMarginPct > 15, 'Margin percentage must be calculated');
      });

      await step('2.2 Submit Quote & Verify Status Update', () => {
        storageService.updateQuote(createdQuote.id, { status: 'Sent' });
        const refreshed = storageService.getQuotes().find((q) => q.id === createdQuote.id);
        assert(refreshed?.status === 'Sent', 'Quote status must be Sent');
      });
    }
  );

  // --------------------------------------------------------------------------
  // USE CASE 3: QUOTE AWARD & PROJECT INITIALIZATION
  // --------------------------------------------------------------------------
  await runTestCase(
    'UAT-03',
    'Quote Awarding, Contract Conversion & Project BOQ Initialization',
    'Projects & Execution',
    async (step) => {
      await step('3.1 Award Quote and Convert to Active Project', () => {
        const conversionResult = storageService.awardQuoteAndConvertToProject(createdQuote.id);
        createdProject = conversionResult.project;

        assert(createdProject, 'Project must be created');
        assert(createdProject.id, 'Project must have an ID');
        assert(createdProject.projectNumber.includes('PJ') || createdProject.projectNumber.includes('PRJ'), `Project number must contain series code PJ, got: ${createdProject.projectNumber}`);
        assert(createdProject.clientName === createdLead.clientName, 'Client name must match');
        assert(createdProject.contractValue === createdQuote.totalAmount, 'Contract value must match quote total');
      });

      await step('3.2 Verify Project BOQ items & Shortages Assessment', () => {
        assert(Array.isArray(createdProject.boqItems), 'Project must carry the BOQ items');
        assert(createdProject.boqItems.length === 4, 'Project must contain the 4 awarded BOQ items');
        assert(createdProject.status === 'Procurement', 'Project initial status must be Procurement');
      });

      await step('3.3 Verify Quote Status Updated to Awarded', () => {
        const refreshedQuote = storageService.getQuotes().find((q) => q.id === createdQuote.id);
        assert(refreshedQuote?.status === 'Awarded', 'Quote status must update to Awarded');
      });
    }
  );

  // --------------------------------------------------------------------------
  // USE CASE 4: SITE WORK ORDERS & DELAY AUDITS
  // --------------------------------------------------------------------------
  await runTestCase(
    'UAT-04',
    'Site Work Orders Execution & Progress Tracking',
    'Site Engineering',
    async (step) => {
      let createdWO: any;

      await step('4.1 Generate Site Work Order for Ducting & Piping', () => {
        createdWO = storageService.addWorkOrder({
          projectId: createdProject.id,
          projectName: createdProject.projectName,
          clientName: createdProject.clientName,
          title: 'Basement-1 Chilled Water Piping & AHU Ducting Installation',
          description: 'Erection of 150mm MS piping, welding, hydro-testing at 10 bar, and GI ducting layout.',
          assignedEngineer: 'Vikas Patil',
          status: 'In Progress',
          priority: 'High',
          startDate: '2026-09-10',
          targetDate: '2026-10-15',
          progressPct: 0
        });

        assert(createdWO.id, 'Work order ID must be generated');
        assert(createdWO.orderNumber.includes('WO'), `Work order must contain series code WO, got: ${createdWO.orderNumber}`);
      });

      await step('4.2 Progress Work Order to 50% and 100% Complete', () => {
        storageService.updateWorkOrder(createdWO.id, { progressPct: 50 });
        let refreshedWO = storageService.getWorkOrders().find((w) => w.id === createdWO.id);
        assert(refreshedWO?.progressPct === 50, 'Progress must be 50%');

        storageService.updateWorkOrder(createdWO.id, { progressPct: 100, status: 'Completed' });
        refreshedWO = storageService.getWorkOrders().find((w) => w.id === createdWO.id);
        assert(refreshedWO?.status === 'Completed', 'Work order status must be Completed');
      });

      await step('4.3 Record Project Delay Audit & Mitigation Plan', () => {
        storageService.updateProjectDelay(createdProject.id, {
          isDelayed: true,
          delayDays: 7,
          delayReason: 'Hospital plant room civil foundation curing delayed by 7 days due to client civil contractor.',
          delayMitigationPlan: 'Deploying double-shift welding team for piping fabrication to recover 5 lost calendar days.',
          delayCategory: 'Civil / Structural Pending'
        });

        const refreshedProject = storageService.getProjects().find((p) => p.id === createdProject.id);
        assert(refreshedProject?.isDelayed === true, 'Project isDelayed must be true');
        assert(refreshedProject?.delayReason?.includes('civil foundation'), 'Delay reason must be recorded');
      });
    }
  );

  // --------------------------------------------------------------------------
  // USE CASE 5: PROCUREMENT WORKFLOW (PR -> APPROVAL -> PO)
  // --------------------------------------------------------------------------
  await runTestCase(
    'UAT-05',
    'Procurement Lifecycle: Requisition, Management Approval & Purchase Order',
    'Procurement & SCM',
    async (step) => {
      await step('5.1 Create Purchase Requisition (PR) for MS Piping & Valves', () => {
        createdPR = storageService.createPR({
          projectId: createdProject.id,
          projectName: createdProject.projectName,
          priority: 'High',
          justification: 'Material required for Apollo Medcity Primary Chilled Water Circuit installation.',
          items: [
            {
              sku: 'PIP-MS-150-HEAVY',
              name: '150mm NB Heavy Class MS Seamless Pipe (Tata / Jindal)',
              requiredQty: 200,
              unit: 'RMT',
              estimatedUnitCost: 2800,
              estimatedTotal: 560000,
              category: 'Piping',
              reason: 'Primary chilled water riser'
            },
            {
              sku: 'VALV-BF-150-PN16',
              name: '150mm PN16 Cast Iron Butterfly Valves with Gear Operator (Audco)',
              requiredQty: 8,
              unit: 'Nos',
              estimatedUnitCost: 14500,
              estimatedTotal: 116000,
              category: 'Valves',
              reason: 'Chiller isolation valves'
            }
          ]
        });

        assert(createdPR.id, 'PR ID must be generated');
        assert(createdPR.prNumber.includes('PR'), `PR number must contain series code PR, got: ${createdPR.prNumber}`);
        assert(createdPR.status === 'Pending Approval', 'Initial status must be Pending Approval');
        assert(createdPR.items.length === 2, 'PR must have 2 line items');
        assert(createdPR.totalEstimatedAmount === 560000 + 116000, 'Estimated cost calculation must be accurate');
      });

      await step('5.2 Approve PR by Management', () => {
        storageService.approvePR(createdPR.id, 'Approved as per sanctioned project BOQ budget.');
        const refreshedPR = storageService.getPRs().find((p) => p.id === createdPR.id);
        assert(refreshedPR?.status === 'Approved', 'PR status must be Approved');
      });

      await step('5.3 Convert Approved PR to Purchase Order (PO)', () => {
        const vendors = storageService.getVendors();
        const vendor = vendors[0] || storageService.addVendor({
          name: 'Jindal Piping & Valves Industrial Supply',
          contactPerson: 'Mr. Arvind Gupta',
          email: 'sales@jindalpiping.com',
          phone: '+91 98210 99881',
          city: 'Mumbai',
          category: 'Piping & Valves',
          rating: 4.8,
          paymentTerms: '30 Days Net'
        });

        createdPO = storageService.convertPRToPO(
          createdPR.id,
          vendor.id,
          '2026-09-25',
          '30% Advance, 70% against delivery at Apollo Medcity site'
        );

        assert(createdPO.id, 'PO ID must be generated');
        assert(createdPO.poNumber.includes('PO'), `PO number must contain series code PO, got: ${createdPO.poNumber}`);
        assert(createdPO.status === 'Pending Approval', 'Initial PO status must be Pending Approval');
        assert(createdPO.items.length === 2, 'PO must carry items from PR');
        assert(createdPO.totalAmount > 0, 'PO total amount must be positive');

        // Approve PO
        storageService.approvePO(createdPO.id, 'Approved by Management for HVAC commitment');
        let refreshedPO = storageService.getPOs().find((p) => p.id === createdPO.id);
        assert(refreshedPO?.status === 'Approved', 'PO status must be Approved');

        // Transmit PO to Vendor
        storageService.sendPOToVendor(createdPO.id, 'Email');
        refreshedPO = storageService.getPOs().find((p) => p.id === createdPO.id);
        assert(refreshedPO?.status === 'Sent to Vendor' || refreshedPO?.status === 'Issued', 'PO status must be Sent to Vendor or Issued');
        createdPO = refreshedPO!;
      });
    }
  );

  // --------------------------------------------------------------------------
  // USE CASE 6: GOODS RECEIPT NOTE (GRN) & WAREHOUSE INVENTORY
  // --------------------------------------------------------------------------
  await runTestCase(
    'UAT-06',
    'Goods Receipt Note (GRN) Processing & Real-Time Inventory Stock Control',
    'Warehouse & Inventory',
    async (step) => {
      let targetItem: InventoryItem;

      await step('6.1 Identify or Create Target Inventory Item for GRN', () => {
        const existingItems = storageService.getInventory();
        const found = existingItems.find((i) => i.sku.includes('PIP') || i.category.toLowerCase().includes('pip'));
        if (found) {
          targetItem = found;
        } else {
          targetItem = storageService.addInventoryItem({
            sku: 'PIP-MS-150-HEAVY',
            name: '150mm Heavy Class MS Seamless Pipe',
            category: 'Piping',
            unit: 'RMT',
            currentStock: 50,
            reservedStock: 10,
            minThreshold: 30,
            unitCost: 2800,
            location: 'Warehouse Bay 3 - Rack C'
          });
        }
        initialStockLevel = targetItem.currentStock;
        assert(initialStockLevel >= 0, 'Initial stock level must be non-negative');
      });

      await step('6.2 Process Goods Receipt (GRN) for 100 RMT Pipes', () => {
        const receivedQty = 100;
        storageService.receivePOGoods(createdPO.id, [
          { sku: targetItem.sku, qty: receivedQty }
        ]);

        createdGRN = storageService.addGRN({
          poId: createdPO.id,
          poNumber: createdPO.poNumber,
          vendorName: createdPO.vendorName,
          invoiceNumber: 'INV-JINDAL-2026-904',
          invoiceDate: '2026-09-20',
          vehicleNumber: 'MH-04-AZ-8812',
          receivedBy: 'Suresh More (Store Manager)',
          remarks: 'Inspected for dimensional tolerance, wall thickness, and mill test certificate.',
          status: 'Accepted',
          items: [
            {
              sku: targetItem.sku,
              description: targetItem.name,
              orderedQty: 200,
              receivedQty: receivedQty,
              acceptedQty: receivedQty,
              rejectedQty: 0,
              unit: targetItem.unit,
              warehouseBin: 'Bay 3 - Rack C'
            }
          ]
        });

        assert(createdGRN.id, 'GRN ID must be generated');
        assert(createdGRN.grnNumber.includes('GR'), `GRN number must contain series code GR, got: ${createdGRN.grnNumber}`);
      });

      await step('6.3 Verify Warehouse Inventory Stock Level Increased', () => {
        const updatedItem = storageService.getInventory().find((i) => i.id === targetItem.id || i.sku === targetItem.sku);
        assert(updatedItem, 'Updated item must exist');
        assert(
          updatedItem!.currentStock >= initialStockLevel + 100,
          `Stock must increase by received qty. Before: ${initialStockLevel}, After: ${updatedItem!.currentStock}`
        );
      });

      await step('6.4 Test Safety Stock Alert Triggering', () => {
        // Set stock temporarily below safety threshold to test alert trigger
        storageService.updateInventoryItem(targetItem.id, {
          currentStock: 5,
          allocatedStock: 0,
          reorderLevel: 100
        });

        const alertCheck = storageService.checkSafetyStockAlerts(true);
        assert(alertCheck.flaggedItems.length > 0, 'Safety stock check must identify low stock item');
        assert(alertCheck.flaggedItems.some((i) => i.id === targetItem.id), 'Target item must be flagged');

        // Restore stock to healthy level
        storageService.updateInventoryItem(targetItem.id, {
          currentStock: 250,
          reorderLevel: 50
        });
      });

      await step('6.5 Trigger Automated Email Notification to Procurement Managers on Reorder Level Hit', async () => {
        // Temporarily breach reorder level on target item
        storageService.updateInventoryItem(targetItem.id, {
          currentStock: 12,
          allocatedStock: 2,
          reorderLevel: 40
        });

        const alertResult = await storageService.notifyProcurementReorderLevels({
          forceSend: true,
          recipientEmails: ['procurement.manager@alphaerp.com', 'shiven.k@gmail.com']
        });

        assert(alertResult.success === true, 'Reorder alert email notification must succeed');
        assert(alertResult.sentTo.includes('procurement.manager@alphaerp.com'), 'Alert must target procurement manager');
        assert(alertResult.itemCount > 0, 'Must identify at least 1 item at reorder level');
        assert(alertResult.totalEstimatedCost > 0, 'Estimated replenishment commitment must be calculated');
        assert(alertResult.mode === 'smtp' || alertResult.mode === 'mock_wrapper', 'Mode must be smtp or mock_wrapper');
        assert(alertResult.messageId !== undefined, 'Delivery messageId must be returned');

        // Restore stock to healthy operational level
        storageService.updateInventoryItem(targetItem.id, {
          currentStock: 250,
          allocatedStock: 0,
          reorderLevel: 50
        });
      });
    }
  );

  // --------------------------------------------------------------------------
  // USE CASE 7: FINANCE, MILESTONE INVOICING & ACCOUNTS RECEIVABLE
  // --------------------------------------------------------------------------
  await runTestCase(
    'UAT-07',
    'Milestone Tax Invoicing, GST Breakdown & Accounts Receivable (AR)',
    'Finance & Accounts',
    async (step) => {
      await step('7.1 Generate 20% Mobilization Advance Tax Invoice', () => {
        const advanceAmount = Math.round(createdProject.contractValue * 0.2); // 3,195,440
        const advanceTax = Math.round(advanceAmount * 0.18);
        createdInvoice = storageService.addPayment({
          projectId: createdProject.id,
          projectName: createdProject.projectName,
          referenceType: 'Project',
          referenceId: createdProject.id,
          referenceTitle: createdProject.projectName,
          clientOrVendorName: createdProject.clientName,
          isPayable: false,
          paymentType: 'Advance 30%',
          amount: advanceAmount,
          taxAmount: advanceTax,
          totalAmount: advanceAmount + advanceTax,
          dueDate: '2026-09-30',
          status: 'Pending',
          notes: '20% Mobilization Advance against Contract Signoff and Bank Guarantee submission.'
        });

        assert(createdInvoice.id, 'Invoice ID must be generated');
        assert(createdInvoice.invoiceNumber.includes('IN'), `Invoice must contain series code IN, got: ${createdInvoice.invoiceNumber}`);
        assert(createdInvoice.status === 'Pending', 'Initial status must be Pending');
        assert(createdInvoice.amount === advanceAmount, 'Invoice amount must match mobilization advance');
      });

      await step('7.2 Record Customer Wire Transfer Payment Receipt', () => {
        const receivedPayment = storageService.processPayment(
          createdInvoice.id,
          'Bank Transfer / NEFT',
          'HDFC Bank - RTGS Ref: HDFCR52026092200192410'
        );

        assert(receivedPayment.status === 'Paid', 'Invoice status must update to Paid');
        assert(receivedPayment.paidDate !== undefined, 'Paid date must be populated');
        assert(receivedPayment.paymentMethod === 'Bank Transfer / NEFT', 'Payment method must match');
      });

      await step('7.3 Add TDS Record under Section 194C & Deposit Challan', () => {
        const tdsEntry = storageService.addTDSRecord({
          panNumber: 'AAACA1234B',
          deducteeName: 'Jindal Piping & Valves Industrial Supply',
          section: '194C',
          quarter: 'Q2 (Jul-Sep)',
          financialYear: '2026-27',
          grossAmount: 560000,
          tdsRate: 2,
          tdsAmount: 11200,
          depositStatus: 'Pending',
          paymentDate: '2026-09-20'
        });

        assert(tdsEntry.id, 'TDS entry ID must be generated');
        assert(tdsEntry.tdsAmount === 11200, 'TDS amount must be 2% of 560000 = 11200');

        storageService.depositTDS(tdsEntry.id, 'CHAL-2026-Q2-0881', '0510311', '2026-10-05');
        const refreshedTDS = storageService.getTDSRecords().find((t) => t.id === tdsEntry.id);
        assert(refreshedTDS?.depositStatus === 'Deposited', 'TDS status must update to Deposited');
      });

      await step('7.4 Create Balanced Double-Entry Journal Voucher (JV)', () => {
        const jv = storageService.addJournalVoucher({
          voucherDate: '2026-09-22',
          narration: 'Being mobilization advance received from Apollo Medcity Healthcare via RTGS.',
          status: 'Approved',
          entries: [
            {
              accountCode: '1010',
              accountName: 'HDFC Bank Operative A/c',
              debit: createdInvoice.totalAmount,
              credit: 0
            },
            {
              accountCode: '2020',
              accountName: 'Apollo Medcity - Client Advance Account',
              debit: 0,
              credit: createdInvoice.totalAmount
            }
          ]
        });

        assert(jv.id, 'JV ID must be generated');
        assert(jv.voucherNumber.includes('JV'), `JV must contain series code JV, got: ${jv.voucherNumber}`);
        const totalDebit = jv.entries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = jv.entries.reduce((sum, e) => sum + e.credit, 0);
        assert(totalDebit === totalCredit, `Double-entry must balance: Debit (${totalDebit}) == Credit (${totalCredit})`);
      });
    }
  );

  // --------------------------------------------------------------------------
  // USE CASE 8: HR, BIOMETRIC ATTENDANCE & AUTOMATED PAYROLL
  // --------------------------------------------------------------------------
  await runTestCase(
    'UAT-08',
    'HR Employee Lifecycle, Biometric Attendance & Payroll Processing',
    'HR & Payroll',
    async (step) => {
      await step('8.1 Register HVAC Commissioning Engineer in HR Master', () => {
        testEmployee = storageService.addEmployee({
          firstName: 'Aniket',
          lastName: 'Deshmukh',
          email: 'aniket.deshmukh@atmosaircon.com',
          phone: '+91 97654 33210',
          department: 'HVAC Projects & Commissioning',
          designation: 'Senior Commissioning Engineer',
          dateOfJoining: '2025-04-01',
          status: 'Active',
          basicSalary: 65000,
          hra: 26000,
          specialAllowance: 15000,
          pfApplicable: true,
          esiApplicable: false,
          bankAccountNumber: '9876543210123',
          bankIfsc: 'HDFC0000123'
        });

        assert(testEmployee.id, 'Employee ID must be generated');
        assert(testEmployee.empCode.includes('EM'), `Employee code must contain series code EM, got: ${testEmployee.empCode}`);
        assert(testEmployee.status === 'Active', 'Status must be Active');
      });

      await step('8.2 Log Biometric In/Out Punch & Daily Attendance', () => {
        const today = new Date().toISOString().split('T')[0];
        storageService.logAttendancePunch({
          empId: testEmployee.id,
          empCode: testEmployee.empCode,
          empName: `${testEmployee.firstName} ${testEmployee.lastName}`,
          punchTime: `${today}T09:05:00Z`,
          punchType: 'IN',
          deviceId: 'BIO-DEV-01',
          deviceName: 'HQ Turnstile Gateway',
          verificationMethod: 'Fingerprint'
        });

        storageService.logAttendancePunch({
          empId: testEmployee.id,
          empCode: testEmployee.empCode,
          empName: `${testEmployee.firstName} ${testEmployee.lastName}`,
          punchTime: `${today}T18:30:00Z`,
          punchType: 'OUT',
          deviceId: 'BIO-DEV-01',
          deviceName: 'HQ Turnstile Gateway',
          verificationMethod: 'Fingerprint'
        });

        storageService.logAttendance({
          empId: testEmployee.id,
          date: today,
          status: 'Present',
          checkIn: '09:05',
          checkOut: '18:30',
          workHours: 9.4,
          source: 'Biometric'
        });

        const attendanceList = storageService.getAttendanceRecords().filter((a) => a.empId === testEmployee.id);
        assert(attendanceList.length > 0, 'Attendance record must be saved');
        assert(attendanceList[0].status === 'Present', 'Attendance status must be Present');
      });

      await step('8.3 Apply for Casual Leave and Approve', () => {
        const leave = storageService.applyLeave({
          empId: testEmployee.id,
          empName: `${testEmployee.firstName} ${testEmployee.lastName}`,
          leaveType: 'Casual Leave',
          startDate: '2026-09-28',
          endDate: '2026-09-29',
          days: 2,
          reason: 'Family urgent commitment in Pune.'
        });

        assert(leave.id, 'Leave ID must be generated');
        assert(leave.status === 'Pending', 'Initial status must be Pending');

        storageService.approveLeave(leave.id, 'HR Manager', 'Approved for 2 days.');
        const refreshedLeave = storageService.getLeaveApplications().find((l) => l.id === leave.id);
        assert(refreshedLeave?.status === 'Approved', 'Leave status must update to Approved');
      });

      await step('8.4 Run Automated Monthly Payroll for Current Month', () => {
        const payroll = storageService.runMonthlyPayroll('2026-09');
        assert(payroll.id, 'Payroll ID must be generated');
        assert(payroll.monthYear === '2026-09', 'Payroll month must match 2026-09');
        assert(payroll.totalGross > 0 || (payroll.totalGrossSalary || 0) > 0, 'Total gross pay must be positive');
        assert(payroll.totalNetPay > 0, 'Total net pay must be positive');
        assert(payroll.totalDeductions > 0, 'Total deductions must be positive');
        assert(
          payroll.totalGrossPay === payroll.totalNetPay + payroll.totalDeductions,
          `Payroll math must balance: Gross (${payroll.totalGrossPay}) == Net (${payroll.totalNetPay}) + Deductions (${payroll.totalDeductions})`
        );
      });
    }
  );

  // --------------------------------------------------------------------------
  // USE CASE 9: ROLE-BASED ACCESS CONTROL (RBAC) & SECURITY MATRIX
  // --------------------------------------------------------------------------
  await runTestCase(
    'UAT-09',
    'Role-Based Access Control (RBAC) & Module Security Enforcement',
    'Security & Administration',
    async (step) => {
      await step('9.1 Verify Role Access Hierarchy for All Enterprise Personas', () => {
        // Executive should have access to core management & financial modules
        assert(storageService.canRoleAccessModule('executive', 'dashboard'), 'Executive must access dashboard');
        assert(storageService.canRoleAccessModule('executive', 'finance'), 'Executive must access finance');
        assert(storageService.canRoleAccessModule('executive', 'users'), 'Executive must access users');

        // Sales Manager should access CRM & Quotes, restricted from users
        assert(storageService.canRoleAccessModule('sales_manager', 'crm'), 'Sales manager must access crm');
        assert(storageService.canRoleAccessModule('sales_manager', 'quotes'), 'Sales manager must access quotes');
        assert(!storageService.canRoleAccessModule('sales_manager', 'users'), 'Sales manager must NOT access users');

        // Technician should access work orders, restricted from finance
        assert(storageService.canRoleAccessModule('technician', 'workorders'), 'Technician must access workorders');
        assert(!storageService.canRoleAccessModule('technician', 'finance'), 'Technician must NOT access finance');

        // Finance role should access finance, restricted from users
        assert(storageService.canRoleAccessModule('finance', 'finance'), 'Finance role must access finance');
        assert(!storageService.canRoleAccessModule('finance', 'users'), 'Finance role must NOT access users');
      });

      await step('9.2 Test Custom Module Permission Assignment & Reset', () => {
        const originalSalesModules = storageService.getModulesForRole('sales_manager');
        // Grant temporary pitch deck permission to sales manager
        storageService.updateRoleModulePermissions('sales_manager', [...originalSalesModules, 'pitch_deck']);
        assert(storageService.canRoleAccessModule('sales_manager', 'pitch_deck'), 'Sales manager should now have pitch_deck');

        // Reset permissions to system defaults
        storageService.resetRoleModulePermissions('sales_manager');
        const resetModules = storageService.getModulesForRole('sales_manager');
        assert(!resetModules.includes('pitch_deck'), 'Reset should restore baseline security matrix');
      });

      await step('9.3 Validate Demo User Switching & Current Persona Verification', () => {
        const users = storageService.getUsers();
        const salesUser = users.find((u) => u.role === 'sales_manager');
        if (salesUser) {
          const switched = storageService.switchUser(salesUser.id);
          assert(switched.role === 'sales_manager', 'Switched persona must be sales_manager');
          assert(storageService.getCurrentUser().id === salesUser.id, 'Current user must reflect switched persona');

          // Switch back to Executive
          const executiveUser = users.find((u) => u.role === 'executive');
          if (executiveUser) {
            storageService.switchUser(executiveUser.id);
            assert(storageService.getCurrentUser().role === 'executive', 'Switched back to executive successfully');
          }
        }
      });
    }
  );

  // --------------------------------------------------------------------------
  // USE CASE 10: MULTI-DATABASE RESILIENCE & MONGODB ATLAS CLUSTER SYNC
  // --------------------------------------------------------------------------
  await runTestCase(
    'UAT-10',
    'Multi-Database Resilience, MongoDB Atlas Sync & Audit Integrity',
    'Database & Infrastructure',
    async (step) => {
      await step('10.1 Verify Sequential Auto-Numbering Series Generation', () => {
        const p1 = storageService.generateSeriesNumber('project');
        const p2 = storageService.generateSeriesNumber('project');
        assert(p1.includes('PJ') || p1.includes('PRJ'), `Generated number must contain series code PJ, got ${p1}`);
        assert(p2.includes('PJ') || p2.includes('PRJ'), `Generated number must contain series code PJ, got ${p2}`);
        assert(p1 !== p2, 'Sequential series must generate unique numbers');

        const poNumber = storageService.generateSeriesNumber('po');
        assert(poNumber.includes('PO'), `PO series must contain series code PO, got ${poNumber}`);
      });

      await step('10.2 Verify MongoDB Atlas Backend Connectivity via HTTP API', async () => {
        const res = await fetch('http://localhost:3000/api/mongodb/status');
        assert(res.ok, `HTTP ${res.status}: Failed to reach /api/mongodb/status`);
        const status = await res.json();
        assert(status.configured === true, 'MongoDB must be configured');
        assert(status.connected === true, 'MongoDB must be connected to cluster');
        assert(status.databaseName === 'alphaerp' || status.databaseName === 'shivenk_db_user', `Database name must be valid, got ${status.databaseName}`);
      });

      await step('10.3 Synchronize Projects to MongoDB Atlas and Validate Hydration', async () => {
        const allProjects = storageService.getProjects();
        const saveRes = await fetch('http://localhost:3000/api/mongodb/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projects: allProjects })
        });
        assert(saveRes.ok, `HTTP ${saveRes.status}: Failed to persist projects to MongoDB`);
        const saveJson = await saveRes.json();
        assert(saveJson.success === true, 'MongoDB save projects response must be success: true');

        // Read back from MongoDB
        const getRes = await fetch('http://localhost:3000/api/mongodb/projects');
        assert(getRes.ok, `HTTP ${getRes.status}: Failed to read projects from MongoDB`);
        const getJson = await getRes.json();
        assert(getJson.success === true, 'MongoDB get projects response must be success: true');
        assert(Array.isArray(getJson.projects), 'Response must contain projects array');
        assert(getJson.projects.length >= allProjects.length, 'Fetched project count must match or exceed saved count');
      });

      await step('10.4 Verify Tamper-Evident Audit Trail Logging', () => {
        const auditLogs = storageService.getAuditLogs();
        assert(auditLogs.length > 0, 'Audit logs must be populated');
        const recentLog = auditLogs[0];
        assert(recentLog.id, 'Audit log must have an ID');
        assert(recentLog.timestamp, 'Audit log must have a timestamp');
        assert(recentLog.action, 'Audit log must record the action');
        assert(recentLog.details, 'Audit log must record action details');
      });
    }
  );

  // --------------------------------------------------------------------------
  // SUMMARY REPORT GENERATION
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('📊 UAT TEST EXECUTION RESULTS SUMMARY');
  console.log('================================================================');

  let totalCases = testResults.length;
  let passedCases = testResults.filter((t) => t.passed).length;
  let failedCases = totalCases - passedCases;
  let totalSteps = testResults.reduce((sum, t) => sum + t.steps.length, 0);
  let passedSteps = testResults.reduce((sum, t) => sum + t.steps.filter((s) => s.passed).length, 0);

  testResults.forEach((t) => {
    const statusIcon = t.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${statusIcon} [${t.caseId}] ${t.title} (${t.category})`);
    t.steps.forEach((s) => {
      const stepIcon = s.passed ? '  ✓' : '  ✗';
      console.log(`   ${stepIcon} ${s.step} (${s.durationMs}ms)`);
      if (!s.passed) {
        console.log(`     Error: ${s.details}`);
      }
    });
    if (t.error) {
      console.log(`   Case Error: ${t.error}`);
    }
  });

  console.log('\n----------------------------------------------------------------');
  console.log(`Use Cases Tested: ${totalCases} | Passed: ${passedCases} | Failed: ${failedCases}`);
  console.log(`Total Steps:      ${totalSteps} | Passed: ${passedSteps} | Failed: ${totalSteps - passedSteps}`);
  console.log(`Success Rate:     ${Math.round((passedSteps / totalSteps) * 100)}%`);
  console.log('================================================================\n');

  if (failedCases > 0) {
    process.exit(1);
  }
}

// Auto-run if executed directly via tsx
if (process.argv[1]?.endsWith('uat-business-suite.ts')) {
  executeAllUATTests().catch((err) => {
    console.error('Fatal error during UAT execution:', err);
    process.exit(1);
  });
}
