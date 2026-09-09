import { insforge } from '../lib/insforge';
import { Lead, Quote, Project, InventoryItem } from '../types';

/**
 * InsForge Database Service
 * Provides type-safe CRUD operations with automatic user-level Row Level Security (RLS) scoping.
 */
export class InsForgeDbService {
  /**
   * LEADS
   */
  async getLeads(): Promise<Lead[]> {
    try {
      const { data, error } = await insforge.database
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('InsForge getLeads error:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        leadNumber: row.lead_number,
        clientName: row.client_name,
        companyName: row.company_name,
        phone: row.phone || '',
        email: row.email || '',
        projectAddress: row.project_address || '',
        city: row.city || 'Bangalore',
        buildingType: row.building_type || 'Commercial Office',
        hvacType: row.hvac_type || 'VRV / VRF System',
        estimatedCapacityTR: Number(row.estimated_capacity_tr || 0),
        estimatedValue: Number(row.estimated_value || 0),
        source: row.source || 'Direct Sales',
        status: row.status || 'New',
        priority: row.priority || 'Medium',
        assignedTo: row.assigned_to || '',
        assignedToName: row.assigned_to_name || 'Unassigned',
        notes: row.notes || '',
        followUps: row.data?.followUps || [],
        communications: row.data?.communications || [],
        quoteIds: row.data?.quoteIds || [],
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString()
      }));
    } catch (err) {
      console.warn('InsForge getLeads exception:', err);
      return [];
    }
  }

  async saveLead(lead: Lead, userId?: string): Promise<boolean> {
    try {
      const payload: any = {
        id: lead.id,
        lead_number: lead.leadNumber,
        client_name: lead.clientName,
        company_name: lead.companyName,
        phone: lead.phone,
        email: lead.email,
        project_address: lead.projectAddress,
        city: lead.city,
        building_type: lead.buildingType,
        hvac_type: lead.hvacType,
        estimated_capacity_tr: lead.estimatedCapacityTR,
        estimated_value: lead.estimatedValue,
        source: lead.source,
        status: lead.status,
        priority: lead.priority,
        assigned_to: lead.assignedTo,
        assigned_to_name: lead.assignedToName,
        notes: lead.notes,
        data: {
          followUps: lead.followUps,
          communications: lead.communications,
          quoteIds: lead.quoteIds
        },
        updated_at: new Date().toISOString()
      };

      if (userId) {
        payload.user_id = userId;
      }

      const { error } = await insforge.database
        .from('leads')
        .insert([payload]);

      if (error) {
        const { error: updateError } = await insforge.database
          .from('leads')
          .update(payload)
          .eq('id', lead.id);

        if (updateError) {
          console.error('Failed to save lead to InsForge:', updateError);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error('Error in saveLead:', err);
      return false;
    }
  }

  async deleteLead(id: string): Promise<boolean> {
    try {
      const { error } = await insforge.database
        .from('leads')
        .delete()
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * INVENTORY
   */
  async getInventory(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await insforge.database
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('InsForge getInventory error:', error);
        return [];
      }

      return (data || []).map((row: any) => {
        const qty = Number(row.quantity || 0);
        return {
          id: row.id,
          sku: row.sku,
          name: row.name,
          category: row.category,
          currentStock: qty,
          allocatedStock: 0,
          availableStock: qty,
          reorderLevel: Number(row.reorder_level || 5),
          unit: row.unit || 'Nos',
          averageUnitCost: Number(row.unit_cost || 0),
          location: row.location || 'Warehouse',
          brand: row.data?.brand || 'Standard',
          description: row.data?.specs || ''
        };
      });
    } catch (err) {
      console.warn('InsForge getInventory exception:', err);
      return [];
    }
  }

  async saveInventoryItem(item: InventoryItem, userId?: string): Promise<boolean> {
    try {
      const payload: any = {
        id: item.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        quantity: item.currentStock || item.availableStock,
        reorder_level: item.reorderLevel,
        unit_cost: item.averageUnitCost,
        unit: item.unit,
        location: item.location || item.warehouseLocation,
        data: {
          brand: item.brand,
          specs: item.specification || item.description
        },
        updated_at: new Date().toISOString()
      };

      if (userId) payload.user_id = userId;

      const { error } = await insforge.database
        .from('inventory')
        .insert([payload]);

      if (error) {
        await insforge.database
          .from('inventory')
          .update(payload)
          .eq('id', item.id);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * PROJECTS
   */
  async getProjects(): Promise<Project[]> {
    try {
      const { data, error } = await insforge.database
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return [];

      return (data || []).map((row: any) => ({
        id: row.id,
        projectNumber: row.project_number,
        projectName: row.title || row.project_number,
        name: row.title,
        clientName: row.client_name,
        leadId: row.data?.leadId || '',
        quoteId: row.data?.quoteId || '',
        status: row.status || 'In Progress',
        startDate: row.start_date || '',
        targetCompletionDate: row.completion_date || '',
        contractValue: Number(row.contract_value || 0),
        totalEstimatedCost: Number(row.total_budget || 0),
        targetMarginPct: row.data?.targetMarginPct || 25,
        progressPct: row.data?.progressPct || 0,
        projectManager: row.data?.projectManager || 'Lead Project Manager',
        boqItems: row.data?.boqItems || [],
        totalShortageItemsCount: row.data?.totalShortageItemsCount || 0,
        prCount: row.data?.prCount || 0,
        poCount: row.data?.poCount || 0,
        invoicesGeneratedAmount: Number(row.invoiced_amount || 0),
        paymentsReceivedAmount: Number(row.collected_amount || 0),
        siteAddress: row.data?.siteAddress || ''
      }));
    } catch {
      return [];
    }
  }

  async saveProject(proj: Project, userId?: string): Promise<boolean> {
    try {
      const payload: any = {
        id: proj.id,
        project_number: proj.projectNumber,
        title: proj.projectName || proj.name,
        client_name: proj.clientName,
        company_name: proj.clientName,
        status: proj.status,
        start_date: proj.startDate,
        completion_date: proj.targetCompletionDate || proj.actualCompletionDate,
        contract_value: proj.contractValue,
        total_budget: proj.totalEstimatedCost,
        invoiced_amount: proj.invoicesGeneratedAmount,
        collected_amount: proj.paymentsReceivedAmount,
        data: proj,
        updated_at: new Date().toISOString()
      };

      if (userId) payload.user_id = userId;

      const { error } = await insforge.database
        .from('projects')
        .insert([payload]);

      if (error) {
        await insforge.database
          .from('projects')
          .update(payload)
          .eq('id', proj.id);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * QUOTES
   */
  async getQuotes(): Promise<Quote[]> {
    try {
      const { data, error } = await insforge.database
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return [];

      return (data || []).map((row: any) => ({
        id: row.id,
        quoteNumber: row.quote_number,
        leadId: row.lead_id || '',
        clientName: row.client_name,
        companyName: row.company_name || '',
        projectTitle: row.project_title,
        siteAddress: row.site_address || '',
        preparedBy: row.prepared_by || '',
        date: row.date || '',
        validUntil: row.valid_until || '',
        subtotal: Number(row.subtotal || 0),
        discountPct: Number(row.discount_pct || 0),
        discountAmount: Number(row.discount_amount || 0),
        taxPct: Number(row.tax_pct || 18),
        taxAmount: Number(row.tax_amount || 0),
        totalAmount: Number(row.total_amount || 0),
        totalCost: Number(row.total_cost || 0),
        grossMarginAmount: Number(row.gross_margin_amount || 0),
        grossMarginPct: Number(row.gross_margin_pct || 0),
        paymentTerms: row.payment_terms || '',
        warrantyTerms: row.warranty_terms || '',
        deliveryTimeline: row.delivery_timeline || '',
        status: row.status || 'Draft',
        items: row.data?.items || [],
        notes: row.data?.notes || ''
      }));
    } catch {
      return [];
    }
  }

  async saveQuote(quote: Quote, userId?: string): Promise<boolean> {
    try {
      const payload: any = {
        id: quote.id,
        quote_number: quote.quoteNumber,
        lead_id: quote.leadId,
        client_name: quote.clientName,
        company_name: quote.companyName,
        project_title: quote.projectTitle,
        site_address: quote.siteAddress,
        prepared_by: quote.preparedBy,
        date: quote.date,
        valid_until: quote.validUntil,
        subtotal: quote.subtotal,
        discount_pct: quote.discountPct,
        discount_amount: quote.discountAmount,
        tax_pct: quote.taxPct,
        tax_amount: quote.taxAmount,
        total_amount: quote.totalAmount,
        total_cost: quote.totalCost,
        gross_margin_amount: quote.grossMarginAmount,
        gross_margin_pct: quote.grossMarginPct,
        payment_terms: quote.paymentTerms,
        warranty_terms: quote.warrantyTerms,
        delivery_timeline: quote.deliveryTimeline,
        status: quote.status,
        data: {
          items: quote.items,
          notes: quote.notes
        },
        updated_at: new Date().toISOString()
      };

      if (userId) payload.user_id = userId;

      const { error } = await insforge.database
        .from('quotes')
        .insert([payload]);

      if (error) {
        await insforge.database
          .from('quotes')
          .update(payload)
          .eq('id', quote.id);
      }
      return true;
    } catch {
      return false;
    }
  }
}

export const insforgeDbService = new InsForgeDbService();
