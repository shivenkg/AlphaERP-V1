import React, { useRef } from 'react';
import { PaymentRecord } from '../types';
import {
  PrintableDocumentTemplate,
  PrintableDocumentTemplateRef
} from './common/PrintableDocumentTemplate';

interface InvoiceDetailModalProps {
  invoice: PaymentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment?: (invoice: PaymentRecord) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onRecordPayment
}) => {
  const printDocRef = useRef<PrintableDocumentTemplateRef>(null);

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print-container">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-6 space-y-6 print-document animate-in fade-in zoom-in-95 duration-150">
        <PrintableDocumentTemplate
          ref={printDocRef}
          invoice={invoice}
          onClose={onClose}
          onRecordPayment={onRecordPayment}
          showToolbar={true}
        />
      </div>
    </div>
  );
};
