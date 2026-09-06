import { downloadElementAsPDF, triggerDirectPrint, exportToCSV, PDFExportOptions } from './pdfExportHelper';

/**
 * Helper utility for triggering high-fidelity document printing and PDF exports.
 * Isolates the active document to provide a clean, uncluttered print preview.
 */
export const printDocument = (targetOrTitle?: HTMLElement | string | null, documentTitle?: string) => {
  triggerDirectPrint(targetOrTitle, documentTitle);
};

export { downloadElementAsPDF, triggerDirectPrint, exportToCSV };
export type { PDFExportOptions };
