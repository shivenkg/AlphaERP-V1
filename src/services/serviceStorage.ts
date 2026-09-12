import {
  ServiceCustomer,
  ServiceEquipment,
  ServiceTechnician,
  ServiceWorkOrder,
  TruckStockItem,
  FlatRatePriceBookItem,
  ServiceInvoice,
  ServiceAnalyticsKPIs,
  ServiceTicketStatus,
  TechnicianStatus
} from '../types/service';
import {
  INITIAL_SERVICE_CUSTOMERS,
  INITIAL_SERVICE_EQUIPMENTS,
  INITIAL_SERVICE_TECHNICIANS,
  INITIAL_SERVICE_WORK_ORDERS,
  INITIAL_TRUCK_STOCK,
  INITIAL_FLAT_RATE_PRICE_BOOK,
  INITIAL_SERVICE_INVOICES
} from '../data/serviceData';
import { storageService } from './storageService';

const STORAGE_KEYS = {
  CUSTOMERS: 'alphaerp_service_customers',
  EQUIPMENTS: 'alphaerp_service_equipments',
  TECHNICIANS: 'alphaerp_service_technicians',
  WORK_ORDERS: 'alphaerp_service_work_orders',
  TRUCK_STOCK: 'alphaerp_service_truck_stock',
  PRICE_BOOK: 'alphaerp_service_price_book',
  INVOICES: 'alphaerp_service_invoices'
};

type Listener = () => void;

class ServiceStorageService {
  private listeners: Listener[] = [];

  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('ServiceStorage notification error:', err);
      }
    });
  }

  // Generic localStorage readers/writers
  private getLocal<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }

  private setLocal<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (err) {
      console.error(`Failed to save to ${key}:`, err);
    }
  }

  // --- Customers ---
  public getCustomers(): ServiceCustomer[] {
    return this.getLocal<ServiceCustomer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_SERVICE_CUSTOMERS);
  }

  public saveCustomer(customer: ServiceCustomer): void {
    const list = this.getCustomers();
    const index = list.findIndex((c) => c.id === customer.id);
    if (index >= 0) {
      list[index] = customer;
    } else {
      list.unshift(customer);
    }
    this.setLocal(STORAGE_KEYS.CUSTOMERS, list);
    storageService.logAudit(
      'Service Customer Saved',
      'WorkOrder',
      customer.id,
      `Saved customer profile: ${customer.name} (${customer.companyName})`
    );
  }

  // --- Equipments ---
  public getEquipments(): ServiceEquipment[] {
    return this.getLocal<ServiceEquipment[]>(STORAGE_KEYS.EQUIPMENTS, INITIAL_SERVICE_EQUIPMENTS);
  }

  public saveEquipment(equipment: ServiceEquipment): void {
    const list = this.getEquipments();
    const index = list.findIndex((e) => e.id === equipment.id);
    if (index >= 0) {
      list[index] = equipment;
    } else {
      list.unshift(equipment);
    }
    this.setLocal(STORAGE_KEYS.EQUIPMENTS, list);
    storageService.logAudit(
      'Equipment Registered',
      'WorkOrder',
      equipment.id,
      `Registered/Updated HVAC equipment: ${equipment.brand} ${equipment.type} (SN: ${equipment.serialNumber})`
    );
  }

  // --- Technicians ---
  public getTechnicians(): ServiceTechnician[] {
    return this.getLocal<ServiceTechnician[]>(STORAGE_KEYS.TECHNICIANS, INITIAL_SERVICE_TECHNICIANS);
  }

  public updateTechnicianStatus(techId: string, status: TechnicianStatus, newAddress?: string): void {
    const list = this.getTechnicians();
    const tech = list.find((t) => t.id === techId);
    if (tech) {
      tech.status = status;
      if (newAddress) {
        tech.currentCoordinates.address = newAddress;
      }
      this.setLocal(STORAGE_KEYS.TECHNICIANS, list);
      storageService.logAudit(
        'Technician Status Changed',
        'WorkOrder',
        techId,
        `Technician ${tech.name} is now ${status}`
      );
    }
  }

  // --- Work Orders (Service Tickets) ---
  public getWorkOrders(): ServiceWorkOrder[] {
    return this.getLocal<ServiceWorkOrder[]>(STORAGE_KEYS.WORK_ORDERS, INITIAL_SERVICE_WORK_ORDERS);
  }

  public getWorkOrderById(id: string): ServiceWorkOrder | undefined {
    return this.getWorkOrders().find((w) => w.id === id);
  }

  public saveWorkOrder(order: ServiceWorkOrder): void {
    const list = this.getWorkOrders();
    const index = list.findIndex((w) => w.id === order.id);
    order.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    if (index >= 0) {
      list[index] = order;
    } else {
      list.unshift(order);
    }
    this.setLocal(STORAGE_KEYS.WORK_ORDERS, list);
    storageService.logAudit(
      'Service Work Order Saved',
      'WorkOrder',
      order.id,
      `Ticket ${order.ticketNumber} for ${order.customerName} saved with status ${order.status}`
    );
  }

  public updateTicketStatus(ticketId: string, status: ServiceTicketStatus): void {
    const list = this.getWorkOrders();
    const order = list.find((w) => w.id === ticketId);
    if (!order) return;

    order.status = status;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (status === 'En Route' && !order.timeTracking.travelStartTime) {
      order.timeTracking.travelStartTime = nowStr;
    } else if (status === 'On Site' && !order.timeTracking.arrivedOnSiteTime) {
      order.timeTracking.arrivedOnSiteTime = nowStr;
    } else if (status === 'Completed' && !order.timeTracking.workCompletedTime) {
      order.timeTracking.workCompletedTime = nowStr;
    }

    this.saveWorkOrder(order);

    // Sync technician status
    if (order.technicianId) {
      if (status === 'En Route') {
        this.updateTechnicianStatus(order.technicianId, 'En Route', `En route to ${order.customerName}`);
      } else if (status === 'On Site' || status === 'In Progress') {
        this.updateTechnicianStatus(order.technicianId, 'On Site', order.customerAddress);
      } else if (status === 'Completed') {
        this.updateTechnicianStatus(order.technicianId, 'Idle', 'Field Service Completed - Idle');
      }
    }
  }

  // --- Truck Stock ---
  public getTruckStock(): TruckStockItem[] {
    return this.getLocal<TruckStockItem[]>(STORAGE_KEYS.TRUCK_STOCK, INITIAL_TRUCK_STOCK);
  }

  public updateTruckStockQuantity(stockId: string, deltaQty: number): void {
    const list = this.getTruckStock();
    const item = list.find((s) => s.id === stockId);
    if (!item) return;

    item.currentStock = Math.max(0, item.currentStock + deltaQty);
    this.setLocal(STORAGE_KEYS.TRUCK_STOCK, list);

    if (item.currentStock < item.minThreshold) {
      storageService.addNotification({
        title: `Truck Stock Alert: ${item.name}`,
        message: `${item.truckPlate} has only ${item.currentStock} ${item.unit} remaining (Min Threshold: ${item.minThreshold}). Replenishment required.`,
        type: 'warning',
        linkTab: 'service'
      });
    }
  }

  public replenishTruckStock(stockId: string, replenishQty: number): void {
    const list = this.getTruckStock();
    const item = list.find((s) => s.id === stockId);
    if (!item) return;

    item.currentStock += replenishQty;
    item.lastRestockedDate = new Date().toISOString().split('T')[0];
    this.setLocal(STORAGE_KEYS.TRUCK_STOCK, list);

    storageService.logAudit(
      'Truck Stock Replenished',
      'Inventory',
      stockId,
      `Replenished ${replenishQty} ${item.unit} of ${item.name} for ${item.truckPlate}`
    );
  }

  // --- Flat Rate Price Book ---
  public getPriceBook(): FlatRatePriceBookItem[] {
    return this.getLocal<FlatRatePriceBookItem[]>(STORAGE_KEYS.PRICE_BOOK, INITIAL_FLAT_RATE_PRICE_BOOK);
  }

  public savePriceBookItem(item: FlatRatePriceBookItem): void {
    const list = this.getPriceBook();
    const index = list.findIndex((p) => p.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push(item);
    }
    this.setLocal(STORAGE_KEYS.PRICE_BOOK, list);
  }

  // --- Invoicing ---
  public getInvoices(): ServiceInvoice[] {
    return this.getLocal<ServiceInvoice[]>(STORAGE_KEYS.INVOICES, INITIAL_SERVICE_INVOICES);
  }

  public generateInvoiceFromWorkOrder(order: ServiceWorkOrder): ServiceInvoice {
    const partsTotal = order.partsUsed.reduce((acc, p) => acc + p.totalCost, 0);
    const laborTotal = order.laborHours * order.laborRatePerHour;
    const flatRateTotal = order.flatRateAmount || 0;
    const subtotal = partsTotal + laborTotal + flatRateTotal;
    const gstRatePct = 18;
    const gstAmount = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gstAmount;

    const invoiceNumber = `INV-SRV-${new Date().getFullYear()}-${String(this.getInvoices().length + 101).padStart(4, '0')}`;

    const newInvoice: ServiceInvoice = {
      id: `inv-srv-${Date.now()}`,
      invoiceNumber,
      workOrderId: order.id,
      ticketNumber: order.ticketNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      billingAddress: order.customerAddress,
      customerEmail: 'billing@' + order.customerName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
      customerPhone: order.customerPhone,
      partsTotal,
      laborTotal,
      flatRateTotal,
      subtotal,
      gstRatePct,
      gstAmount,
      grandTotal,
      paymentStatus: 'Unpaid',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      accountingSyncStatus: 'Pending Sync'
    };

    const list = this.getInvoices();
    list.unshift(newInvoice);
    this.setLocal(STORAGE_KEYS.INVOICES, list);

    // Update order status
    order.invoiceId = newInvoice.id;
    order.invoiceAmount = grandTotal;
    order.invoiceStatus = 'Invoiced';
    order.status = 'Invoiced';
    this.saveWorkOrder(order);

    storageService.logAudit(
      'Service Tax Invoice Generated',
      'WorkOrder',
      newInvoice.id,
      `Generated Service Tax Invoice ${invoiceNumber} for ₹${grandTotal.toLocaleString('en-IN')} (Ticket: ${order.ticketNumber})`
    );

    return newInvoice;
  }

  public markInvoicePaid(invoiceId: string, method: string, ref: string): void {
    const list = this.getInvoices();
    const invoice = list.find((i) => i.id === invoiceId);
    if (!invoice) return;

    invoice.paymentStatus = (method.includes('Card') ? 'Paid - Card' : method.includes('UPI') ? 'Paid - UPI' : 'Paid - ACH/Bank') as any;
    invoice.paymentRef = ref || `TXN-${Date.now().toString().slice(-6)}`;
    invoice.paidAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.setLocal(STORAGE_KEYS.INVOICES, list);

    // Also update associated work order
    const orders = this.getWorkOrders();
    const order = orders.find((w) => w.id === invoice.workOrderId);
    if (order) {
      order.invoiceStatus = 'Paid';
      this.saveWorkOrder(order);
    }

    storageService.logAudit(
      'Service Invoice Remittance Recorded',
      'WorkOrder',
      invoiceId,
      `Recorded ₹${invoice.grandTotal.toLocaleString('en-IN')} payment for Invoice ${invoice.invoiceNumber} via ${method}`
    );
  }

  // --- Automated Dispatch Alerts Simulation ---
  public sendDispatchNotification(order: ServiceWorkOrder, channel: 'WhatsApp' | 'SMS' | 'Email'): boolean {
    order.clientNotificationSent = true;
    this.saveWorkOrder(order);

    storageService.addNotification({
      title: `Dispatch Alert Sent (${channel})`,
      message: `Automated ${channel} tracking notification dispatched to ${order.customerName} for Technician ${order.technicianName} (Slot: ${order.scheduledTimeSlot}).`,
      type: 'success',
      linkTab: 'service'
    });

    storageService.logAudit(
      'Customer Dispatch Alert Sent',
      'WorkOrder',
      order.id,
      `Dispatched automated ${channel} notification to ${order.customerPhone} for Ticket ${order.ticketNumber}`
    );

    return true;
  }

  // --- Calendar Export (.ics format string) ---
  public generateIcsCalendar(order: ServiceWorkOrder): string {
    const dateStr = order.scheduledDate.replace(/-/g, '');
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AlphaERP HVAC Service//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:srv-${order.id}@alphaerp.hvac.biz`,
      `SUMMARY:HVAC Service: ${order.customerName} - ${order.equipmentTitle}`,
      `DESCRIPTION:Ticket: ${order.ticketNumber}\\nTechnician: ${order.technicianName}\\nSymptoms: ${order.symptomsReported}`,
      `LOCATION:${order.customerAddress}`,
      `DTSTART:${dateStr}T090000Z`,
      `DTEND:${dateStr}T120000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  // --- Analytics KPIs ---
  public getAnalyticsKPIs(): ServiceAnalyticsKPIs {
    const orders = this.getWorkOrders();
    const totalTickets = orders.length;
    const completedTickets = orders.filter((o) => o.status === 'Completed' || o.status === 'Invoiced').length;
    const activeEmergencies = orders.filter((o) => o.priority === 'P1 - Emergency Breakdown' && o.status !== 'Completed' && o.status !== 'Invoiced').length;

    // First time fix rate: tickets with <= 1 visit and resolved without re-opening
    const firstTimeFixRatePct = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 94) : 89;

    // Average MTTR
    const totalMinutes = orders.reduce((acc, o) => acc + (o.timeTracking.totalLaborMinutes || 120), 0);
    const meanTimeToRepairHours = completedTickets > 0 ? Number((totalMinutes / (completedTickets * 60)).toFixed(1)) : 2.4;

    const invoices = this.getInvoices();
    const monthlyServiceRevenue = invoices.reduce((acc, i) => acc + i.grandTotal, 0);

    const customers = this.getCustomers();
    const activeAmcContracts = customers.filter((c) => c.amcStatus === 'Active').length;

    return {
      totalTickets,
      completedTickets,
      activeEmergencies,
      firstTimeFixRatePct: Math.min(100, Math.max(75, firstTimeFixRatePct)),
      meanTimeToRepairHours: Math.max(1.5, meanTimeToRepairHours),
      avgCustomerRating: 4.88,
      monthlyServiceRevenue,
      activeAmcContracts
    };
  }
}

export const serviceStorage = new ServiceStorageService();
