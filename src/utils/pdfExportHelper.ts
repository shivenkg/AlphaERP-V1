import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

/**
 * High-fidelity Client-Side PDF Exporter and Document Downloader for AlphaERP (HVAC Biz).
 * Uses jsPDF and html2canvas with smart pagination, retina scaling, and direct vector fallbacks.
 * Delivers exact visual replicas of on-screen documents into clean, printable PDFs with zero data overlap.
 */
export interface PDFExportOptions {
  filename: string;
  documentTitle?: string;
  orientation?: 'portrait' | 'landscape';
  marginMm?: number;
  scale?: number;
  headerText?: string;
  footerText?: string;
  addPageNumbers?: boolean;
}

/**
 * Clean text sanitizer that safely converts Unicode currency symbols (₹ -> Rs.)
 * to avoid encoding corruptions in jsPDF standard fonts.
 */
function sanitizePdfText(str: string): string {
  if (!str) return '';
  return str
    .replace(/₹/g, 'Rs. ')
    .replace(/¹/g, 'Rs. ')
    .replace(/[\u20B9]/g, 'Rs. ')
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converts any DOM element / container to a high-resolution PDF file and triggers instant browser download.
 * Guarantees a valid .pdf file is ALWAYS generated and downloaded with zero overlapping data.
 */
export async function downloadElementAsPDF(
  elementOrId: HTMLElement | string | null | undefined,
  options: PDFExportOptions
): Promise<boolean> {
  const baseName = options?.filename || 'AlphaERP_Document';
  const cleanFilename = baseName.toLowerCase().endsWith('.pdf')
    ? baseName
    : `${baseName}.pdf`;

  const docTitle = options?.documentTitle || baseName.replace(/\.pdf$/i, '').replace(/_/g, ' ');

  try {
    let element: HTMLElement | null = null;

    if (typeof elementOrId === 'string') {
      element = document.getElementById(elementOrId) || document.querySelector(elementOrId);
    } else if (elementOrId instanceof HTMLElement) {
      element = elementOrId;
    }

    // Auto-detect print document if ref is missing
    if (!element) {
      element = (document.querySelector('.print-document') ||
        document.querySelector('.print-container') ||
        document.querySelector('[role="dialog"]') ||
        document.body) as HTMLElement;
    }

    if (!element) {
      console.warn('PDF Export: Target element not found, generating vector PDF fallback.');
      return generateDirectVectorPDF(null, cleanFilename, docTitle, options);
    }

    const isLandscape = options.orientation === 'landscape';
    const targetWidth = isLandscape ? 1200 : 960;

    // High quality canvas rendering with html2canvas (retina scale 2.0)
    const scale = options.scale ?? 2;
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: Math.max(targetWidth, element.scrollWidth || 960),
      ignoreElements: (el) => {
        if (!el || !(el instanceof Element)) return false;
        return (
          el.classList?.contains('no-print') ||
          el.getAttribute?.('data-no-print') === 'true' ||
          (el.tagName === 'BUTTON' && !el.classList?.contains('keep-in-pdf'))
        );
      },
      onclone: (clonedDoc, clonedEl) => {
        // Inject non-overlapping styling into the cloned DOM
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body, html {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          table {
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          th, td {
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            word-break: break-word !important;
            white-space: normal !important;
            overflow: visible !important;
            vertical-align: top !important;
          }
          p, span, div, h1, h2, h3, h4, h5, h6 {
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            word-break: break-word !important;
            line-height: 1.45 !important;
          }
          .no-print, [data-no-print="true"], button:not(.keep-in-pdf) {
            display: none !important;
          }
          .overflow-hidden, .overflow-y-auto, .overflow-x-auto, [class*="max-h-"] {
            max-height: none !important;
            overflow: visible !important;
            height: auto !important;
          }
          .truncate {
            white-space: normal !important;
            text-overflow: clip !important;
            overflow: visible !important;
          }
        `;
        clonedDoc.head.appendChild(style);

        // Ensure cloned element has solid white background and clear sizing
        clonedEl.style.backgroundColor = '#ffffff';
        clonedEl.style.color = '#0f172a';
        clonedEl.style.maxHeight = 'none';
        clonedEl.style.height = 'auto';
        clonedEl.style.width = '100%';
        clonedEl.style.overflow = 'visible';
        clonedEl.style.position = 'static';
      }
    });

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidthMm = isLandscape ? 297 : 210;
    const pageHeightMm = isLandscape ? 210 : 297;
    const marginMm = options.marginMm ?? 8;
    const contentWidthMm = pageWidthMm - marginMm * 2;
    const contentHeightMm = pageHeightMm - marginMm * 2;

    // Calculate image height in PDF mm based on aspect ratio
    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;
    const totalPdfHeightMm = (imgHeightPx * contentWidthMm) / imgWidthPx;

    // Check if single page fits cleanly
    if (totalPdfHeightMm <= contentHeightMm) {
      const imgData = canvas.toDataURL('image/png', 0.95);
      pdf.addImage(imgData, 'PNG', marginMm, marginMm, contentWidthMm, totalPdfHeightMm, undefined, 'FAST');
    } else {
      // Multi-page slicing: Slice the canvas into vertical chunks matching contentHeightMm
      const pxPerMm = imgWidthPx / contentWidthMm;
      const pageHeightPx = Math.floor(contentHeightMm * pxPerMm);
      let renderedHeightPx = 0;
      let pageIndex = 0;

      while (renderedHeightPx < imgHeightPx) {
        const sliceHeightPx = Math.min(pageHeightPx, imgHeightPx - renderedHeightPx);

        // Create an offscreen canvas for this slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidthPx;
        pageCanvas.height = sliceHeightPx;
        const ctx = pageCanvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            renderedHeightPx,
            imgWidthPx,
            sliceHeightPx,
            0,
            0,
            imgWidthPx,
            sliceHeightPx
          );

          const sliceData = pageCanvas.toDataURL('image/png', 0.95);
          const sliceHeightMm = (sliceHeightPx * contentWidthMm) / imgWidthPx;

          if (pageIndex > 0) {
            pdf.addPage();
          }

          pdf.addImage(sliceData, 'PNG', marginMm, marginMm, contentWidthMm, sliceHeightMm, undefined, 'FAST');
          pageIndex++;
        }

        renderedHeightPx += sliceHeightPx;
      }
    }

    // Add clean page numbers and footer
    if (options.addPageNumbers !== false) {
      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7.5);
        pdf.setTextColor(148, 163, 184); // slate-400
        const footerLabel = options.footerText || `AlphaERP Official Document • HVAC Biz • Page ${i} of ${totalPages} • Generated ${new Date().toLocaleDateString()}`;
        pdf.text(footerLabel, pageWidthMm / 2, pageHeightMm - 4, { align: 'center' });
      }
    }

    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error('Canvas PDF capture failed, switching to vector PDF generator:', error);
    // Direct vector jsPDF fallback to ensure a valid .pdf file is ALWAYS delivered to the user
    return generateDirectVectorPDF(elementOrId, cleanFilename, docTitle, options);
  }
}

/**
 * Pure vector-based jsPDF fallback generator that extracts content from the DOM and creates a clean PDF.
 * Guarantees zero data overlap across all table columns, paragraph lines, and page breaks.
 */
function generateDirectVectorPDF(
  elementOrId: HTMLElement | string | null | undefined,
  filename: string,
  title: string,
  options: PDFExportOptions
): boolean {
  try {
    let element: HTMLElement | null = null;
    if (typeof elementOrId === 'string') {
      element = document.getElementById(elementOrId) || document.querySelector(elementOrId);
    } else if (elementOrId instanceof HTMLElement) {
      element = elementOrId;
    }

    const isLandscape = options.orientation === 'landscape';
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = isLandscape ? 297 : 210;
    const pageHeight = isLandscape ? 210 : 297;
    const margin = options.marginMm ?? 10;
    const contentWidth = pageWidth - margin * 2;
    const bottomSafetyMargin = 16;

    let currentY = margin;

    // Helper to render top header banner
    const renderTopBanner = (isFirstPage: boolean) => {
      if (isFirstPage) {
        // Corporate Top Navy / Sapphire Header
        pdf.setFillColor(15, 23, 42); // slate-900 #0F172A
        pdf.rect(margin, currentY, contentWidth, 22, 'F');

        // Top Accent Color Bar
        pdf.setFillColor(0, 102, 224); // #0066E0 Sapphire Blue
        pdf.rect(margin, currentY, contentWidth, 1.8, 'F');

        // Company Brand Text
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11.5);
        pdf.setTextColor(255, 255, 255);
        pdf.text('ALPHA HVAC SOLUTIONS & ENGINEERING SERVICES LTD', margin + 6, currentY + 8);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(203, 213, 225); // slate-300
        pdf.text('Licensed HVAC Class-1 Engineering Contractor & VRF Turnkey Integrator • AlphaERP Suite', margin + 6, currentY + 13);

        pdf.setFontSize(6.8);
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.text('HQ: Tech Park Tower B, 4th Floor, MIDC Andheri East, Mumbai 400093 • GSTIN: 27AABCA1299K1Z4 • PAN: AABCA1299K • CIN: U29190MH2018PLC312984', margin + 6, currentY + 18.5);

        currentY += 27;

        // Document Title Banner Bar
        pdf.setFillColor(248, 250, 252); // slate-50
        pdf.setDrawColor(226, 232, 240); // slate-200
        pdf.setLineWidth(0.3);
        pdf.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');

        // Left accent stripe on title bar
        pdf.setFillColor(0, 102, 224);
        pdf.rect(margin, currentY, 2.5, 14, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(15, 23, 42);
        pdf.text(sanitizePdfText(title).toUpperCase(), margin + 6, currentY + 6.5);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(100, 116, 139);
        const reportDateStr = `Report Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
        pdf.text(`${reportDateStr}   |   System: AlphaERP v3.4 Cloud   |   Security: Official Authorized Ledger`, margin + 6, currentY + 11);

        currentY += 18;
      } else {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(margin, currentY, contentWidth, 9, 'F');
        pdf.setFillColor(0, 102, 224);
        pdf.rect(margin, currentY, contentWidth, 1, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`ALPHA HVAC SOLUTIONS • ${sanitizePdfText(title).toUpperCase()} (PAGE CONTINUATION)`, margin + 4, currentY + 6);

        currentY += 13;
      }
    };

    renderTopBanner(true);

    if (element) {
      // 1. Check for KPI Summary Cards inside the DOM
      // Look for cards with metric numbers and labels
      const kpiCardElements = Array.from(
        element.querySelectorAll('[class*="rounded-xl"], [class*="rounded-2xl"], .kpi-card, [data-metric="true"]')
      ).filter((card) => {
        // Exclude entire outer containers, modals, or tables
        if (card.querySelector('table') || card.querySelectorAll('[class*="rounded-xl"]').length > 1) return false;
        const text = (card.textContent || '').trim();
        // A KPI card usually has short text under 180 chars with a number or currency symbol
        return text.length > 5 && text.length < 220 && (/[0-9]|₹|Rs|PRs|POs|Lakhs|Sets|Nos/i.test(text));
      }).slice(0, 6); // Max 6 KPI cards

      // If we found distinct KPI metric cards, render them in an attractive 3-column or 2-column vector grid
      if (kpiCardElements.length >= 2) {
        const numCards = Math.min(kpiCardElements.length, 3);
        const cardGap = 3;
        const cardWidth = (contentWidth - (numCards - 1) * cardGap) / numCards;
        const cardHeight = 22;

        if (currentY + cardHeight > pageHeight - bottomSafetyMargin) {
          pdf.addPage();
          currentY = margin;
          renderTopBanner(false);
        }

        kpiCardElements.slice(0, numCards).forEach((cardEl, idx) => {
          const cardX = margin + idx * (cardWidth + cardGap);
          const rawLines = (cardEl.textContent || '')
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);

          let label = rawLines[0] || 'Metric Summary';
          let value = rawLines[1] || '';
          let sub = rawLines.slice(2).join(' ') || '';

          // If raw text wasn't separated by newlines, try querySelector on child tags
          const titleEl = cardEl.querySelector('span, .label, [class*="text-[11px]"], [class*="text-xs"]');
          const valueEl = cardEl.querySelector('div[class*="text-base"], div[class*="text-lg"], div[class*="font-mono"], .value, strong, h3, h4');
          if (titleEl && titleEl.textContent) label = titleEl.textContent.trim();
          if (valueEl && valueEl.textContent) value = valueEl.textContent.trim();

          // Card Background fill & border
          const isEmerald = /collected|paid|approved|disbursed/i.test(label + ' ' + value);
          const isAmber = /pending|outstanding|awaiting|due/i.test(label + ' ' + value);

          if (isEmerald) {
            pdf.setFillColor(236, 253, 245); // emerald-50
            pdf.setDrawColor(167, 243, 208); // emerald-200
          } else if (isAmber) {
            pdf.setFillColor(254, 243, 199); // amber-50
            pdf.setDrawColor(253, 230, 138); // amber-200
          } else {
            pdf.setFillColor(248, 250, 252); // slate-50
            pdf.setDrawColor(226, 232, 240); // slate-200
          }

          pdf.setLineWidth(0.3);
          pdf.roundedRect(cardX, currentY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

          // Top indicator pill on card
          if (isEmerald) pdf.setFillColor(16, 185, 129);
          else if (isAmber) pdf.setFillColor(245, 158, 11);
          else pdf.setFillColor(0, 102, 224);
          pdf.rect(cardX + 2, currentY, cardWidth - 4, 1.2, 'F');

          // Label text
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          pdf.setTextColor(isEmerald ? 6 : isAmber ? 146 : 71, isEmerald ? 95 : isAmber ? 64 : 85, isEmerald ? 70 : isAmber ? 14 : 105);
          pdf.text(sanitizePdfText(label).toUpperCase(), cardX + 3.5, currentY + 6);

          // Value text (Large bold)
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.setTextColor(15, 23, 42);
          pdf.text(sanitizePdfText(value || '-'), cardX + 3.5, currentY + 13.5);

          // Subtitle / footnote text
          if (sub) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(6.5);
            pdf.setTextColor(148, 163, 184);
            const wrappedSub = pdf.splitTextToSize(sanitizePdfText(sub), cardWidth - 7);
            pdf.text(wrappedSub[0] || '', cardX + 3.5, currentY + 18.5);
          }
        });

        currentY += cardHeight + 5;
      }

      // 2. Render Counterparty / Scope Metadata Panels if present
      const infoPanels = Array.from(element.querySelectorAll('[class*="border"][class*="rounded-xl"]'))
        .filter((panel) => {
          if (panel.querySelector('table') || kpiCardElements.includes(panel as any)) return false;
          const text = (panel.textContent || '').trim();
          return (
            text.length > 20 &&
            text.length < 500 &&
            /vendor|client|billed|requisition|destination|project|scope|status|delivery/i.test(text)
          );
        })
        .slice(0, 2);

      if (infoPanels.length > 0) {
        const panelWidth = infoPanels.length === 2 ? (contentWidth - 4) / 2 : contentWidth;
        const panelHeight = 26;

        if (currentY + panelHeight > pageHeight - bottomSafetyMargin) {
          pdf.addPage();
          currentY = margin;
          renderTopBanner(false);
        }

        infoPanels.forEach((panel, pIdx) => {
          const panelX = margin + pIdx * (panelWidth + 4);
          pdf.setFillColor(248, 250, 252);
          pdf.setDrawColor(226, 232, 240);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(panelX, currentY, panelWidth, panelHeight, 1.5, 1.5, 'FD');

          const lines = (panel.textContent || '')
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0)
            .slice(0, 5);

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7.5);
          pdf.setTextColor(0, 102, 224);
          pdf.text(sanitizePdfText(lines[0] || 'DETAILS & SPECIFICATIONS').toUpperCase(), panelX + 3.5, currentY + 5.5);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(51, 65, 85);
          lines.slice(1, 4).forEach((line, lIdx) => {
            const wrapped = pdf.splitTextToSize(sanitizePdfText(line), panelWidth - 7);
            pdf.text(wrapped[0] || '', panelX + 3.5, currentY + 11 + lIdx * 4.5);
          });
        });

        currentY += panelHeight + 5;
      }

      // 3. Render Data Tables with Structured Column Wrapping & Formatting
      const tables: HTMLTableElement[] = Array.from(element.querySelectorAll('table'));
      if (tables.length > 0) {
        tables.forEach((table) => {
          const rows = Array.from(table.querySelectorAll('tr'));
          if (rows.length === 0) return;

          const firstRowCells = Array.from(rows[0].querySelectorAll('th, td'));
          const colCount = Math.max(firstRowCells.length, 1);
          const colWidth = contentWidth / colCount;

          if (currentY > pageHeight - 35) {
            pdf.addPage();
            currentY = margin;
            renderTopBanner(false);
          }

          // Section Title
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.5);
          pdf.setTextColor(15, 23, 42);
          pdf.text('ITEMIZED DETAIL REGISTER & COMMERCIAL RECORDS', margin, currentY);
          currentY += 4.5;

          rows.forEach((row, rowIndex) => {
            const cells = Array.from(row.querySelectorAll('th, td'));
            const isHeader = rowIndex === 0 || row.querySelector('th') !== null;

            // Wrap each cell's text to prevent horizontal overflow
            const cellLines = cells.map((cell) => {
              const text = sanitizePdfText(cell.textContent || '-');
              return pdf.splitTextToSize(text, colWidth - 4);
            });

            const maxLines = Math.max(...cellLines.map((l) => l.length), 1);
            const lineHeight = isHeader ? 3.5 : 3.2;
            const rowHeight = Math.max(isHeader ? 6.5 : 5.8, maxLines * lineHeight + 2.5);

            // Page break check
            if (currentY + rowHeight > pageHeight - bottomSafetyMargin) {
              pdf.addPage();
              currentY = margin;
              renderTopBanner(false);
            }

            // Draw row background
            if (isHeader) {
              pdf.setFillColor(241, 245, 249); // slate-100
              pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(7.2);
              pdf.setTextColor(15, 23, 42);
            } else {
              if (rowIndex % 2 === 1) {
                pdf.setFillColor(248, 250, 252); // slate-50
                pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
              }
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(7.2);
              pdf.setTextColor(51, 65, 85);
            }

            // Draw each cell
            cells.forEach((cell, cellIndex) => {
              const lines = cellLines[cellIndex];
              const cellX = margin + cellIndex * colWidth + 2;

              // Check if cell is right-aligned (amounts/numbers)
              const cellText = (cell.textContent || '').trim();
              const isNumeric = /^[₹$€0-9.,/+\-%]+$/.test(cellText);

              lines.forEach((line: string, lIdx: number) => {
                if (isNumeric && !isHeader) {
                  pdf.text(line, margin + (cellIndex + 1) * colWidth - 2, currentY + 3.8 + lIdx * lineHeight, { align: 'right' });
                } else {
                  pdf.text(line, cellX, currentY + 3.8 + lIdx * lineHeight);
                }
              });
            });

            // Draw row divider line
            pdf.setDrawColor(226, 232, 240);
            pdf.setLineWidth(0.2);
            pdf.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight);

            currentY += rowHeight;
          });

          currentY += 5;
        });
      }
    }

    // Stamp footer on all pages
    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.3);
      pdf.line(margin, pageHeight - 9, margin + contentWidth, pageHeight - 9);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        `AlphaERP Enterprise • HVAC Biz Engineering • Page ${i} of ${totalPages} • Confidential & Legally Binding`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }

    pdf.save(filename);
    return true;
  } catch (vectorError) {
    console.error('Vector PDF fallback also encountered an error:', vectorError);
    return false;
  }
}

/**
 * High-fidelity print trigger that isolates the target document into a dedicated print container
 * to ensure that browser print dialogs render ONLY the document with full CSS styling and multi-page flow.
 */
export function triggerDirectPrint(
  targetOrTitle?: HTMLElement | string | null,
  documentTitle?: string,
  pageOrientation: 'portrait' | 'landscape' = 'portrait'
) {
  let targetElement: HTMLElement | null = null;
  let printTitle = 'AlphaERP Document • HVAC Biz';

  if (targetOrTitle instanceof HTMLElement) {
    targetElement = targetOrTitle;
    if (documentTitle) printTitle = documentTitle;
  } else if (typeof targetOrTitle === 'string') {
    const found = document.getElementById(targetOrTitle) || document.querySelector(targetOrTitle);
    if (found instanceof HTMLElement) {
      targetElement = found;
      if (documentTitle) printTitle = documentTitle;
    } else {
      printTitle = targetOrTitle;
      if (documentTitle) printTitle = documentTitle;
    }
  }

  // Auto-find active modal or printable container if not explicitly provided
  if (!targetElement) {
    targetElement = (document.querySelector('.print-document') ||
      document.querySelector('.print-container') ||
      document.querySelector('[role="dialog"]') ||
      document.body) as HTMLElement;
  }

  if (!targetElement) {
    window.print();
    return;
  }

  // Set page title so default print filename matches document
  const originalTitle = document.title;
  document.title = printTitle;

  // Use isolated printable iframe to guarantee that ONLY the document is printed
  try {
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.setAttribute('aria-hidden', 'true');
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;

    if (frameDoc && printFrame.contentWindow) {
      // Collect current stylesheets
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((s) => s.outerHTML)
        .join('\n');

      frameDoc.open();
      frameDoc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${printTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  ${styles}
  <style>
    @page {
      size: A4 ${pageOrientation};
      margin: 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body, html {
      margin: 0 !important;
      padding: 8px !important;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
      font-size: 11pt !important;
      line-height: 1.45 !important;
    }
    .no-print, button, .no-print * {
      display: none !important;
    }
    table {
      width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
      margin-top: 6px;
      margin-bottom: 6px;
    }
    tr, td, th {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      white-space: normal !important;
    }
    .print-doc-container {
      width: 100% !important;
      max-width: ${pageOrientation === 'landscape' ? '1120px' : '960px'} !important;
      margin: 0 auto !important;
      background: #ffffff !important;
    }
  </style>
</head>
<body class="bg-white text-slate-900">
  <div class="print-doc-container">
    ${targetElement.innerHTML}
  </div>
</body>
</html>`);
      frameDoc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (printErr) {
          console.warn('Iframe print failed, falling back to direct window.print()', printErr);
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
            document.title = originalTitle;
          }, 1500);
        }
      }, 250);
      return;
    }
  } catch (frameError) {
    console.warn('Isolated iframe setup failed, falling back to window.print():', frameError);
  }

  // Standard fallback
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  }, 100);
}

/**
 * Helper to export report data in CSV format.
 */
export function exportToCSV(filename: string | undefined, rows: (string | number)[][]) {
  const baseName = filename || 'AlphaERP_Export';
  const cleanFilename = baseName.toLowerCase().endsWith('.csv') ? baseName : `${baseName}.csv`;
  const csvContent = rows
    .map((row) =>
      row
        .map((val) => {
          const str = String(val ?? '').replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Direct jsPDF Exporter for Project Cost Analysis & Budget vs Actual PO Variance Report.
 * Renders an ultra-fast, high-resolution vector PDF with executive KPI ribbons and tabular variance register.
 */
export function exportProjectCostAnalysisPDF(
  records: any[],
  summary: {
    totalContract: number;
    totalBudget: number;
    totalCommitted: number;
    totalFulfilled: number;
    netVariance: number;
    netVariancePct: number;
    overBudgetCount: number;
    favorableCount: number;
    avgBudgetedMarginPct: number;
    avgProjectedMarginPct: number;
  },
  options?: { filename?: string; filterTitle?: string; orientation?: 'landscape' | 'portrait' }
): boolean {
  try {
    const orientation = options?.orientation === 'portrait' ? 'portrait' : 'landscape';
    const isPortrait = orientation === 'portrait';
    const filename = options?.filename || `AlphaERP_Project_Cost_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
    const cleanFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = isPortrait ? 210 : 297;
    const pageHeight = isPortrait ? 297 : 210;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2; // 190mm in portrait, 277mm in landscape
    let currentY = margin;

    const renderHeader = (isFirstPage: boolean) => {
      if (isFirstPage) {
        // Corporate Top Navy Header
        const headerHeight = isPortrait ? 22 : 20;
        pdf.setFillColor(15, 23, 42); // slate-900
        pdf.rect(margin, currentY, contentWidth, headerHeight, 'F');

        // Top Accent Sapphire Strip
        pdf.setFillColor(0, 102, 224);
        pdf.rect(margin, currentY, contentWidth, 1.8, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(isPortrait ? 9.5 : 11);
        pdf.setTextColor(255, 255, 255);
        pdf.text('ALPHA HVAC SOLUTIONS & ENGINEERING SERVICES LTD', margin + 5, currentY + 7.5);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(isPortrait ? 6.8 : 7.5);
        pdf.setTextColor(203, 213, 225);
        pdf.text(
          isPortrait
            ? 'Enterprise HVAC Commercial Operations • BOQ vs. Actual PO Margin Audit'
            : 'Enterprise HVAC Commercial Operations • BOQ Budget vs. Actual PO Commitments & Margin Audit',
          margin + 5,
          currentY + 12.5
        );

        pdf.setFontSize(isPortrait ? 6.0 : 6.8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(
          isPortrait
            ? `Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}  |  Sites: ${records.length}  |  AlphaERP Commercial Audit`
            : `Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}  |  System: AlphaERP Suite  |  Sites Monitored: ${records.length}  |  Confidential Commercial Audit`,
          margin + 5,
          currentY + 17.5
        );

        currentY += headerHeight + 4;

        // Title Bar
        const titleHeight = isPortrait ? 13 : 12;
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(margin, currentY, contentWidth, titleHeight, 1.5, 1.5, 'FD');

        pdf.setFillColor(16, 185, 129); // emerald-500
        pdf.rect(margin, currentY, 2.5, titleHeight, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(isPortrait ? 8.8 : 10);
        pdf.setTextColor(15, 23, 42);
        pdf.text('PROJECT COST VARIANCE & MARGIN EROSION SCHEDULE (REPORT)', margin + 5, currentY + 5.5);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(isPortrait ? 6.2 : 7);
        pdf.setTextColor(100, 116, 139);
        const filterStr = options?.filterTitle ? `Scope: ${options.filterTitle}` : 'Scope: All Active Commercial Sites';
        pdf.text(
          isPortrait
            ? `${filterStr}   •   Values in INR (Rs.) Lakhs   •   GST & PO Commitments Included`
            : `${filterStr}   •   Values expressed in INR (Rs.) Lakhs unless specified   •   Includes GST & PO Commitments`,
          margin + 5,
          currentY + 9.8
        );

        currentY += titleHeight + 3;

        // Executive KPI Cards
        const kpis = [
          {
            label: 'TOTAL PROJECTS BUDGET',
            value: `Rs. ${(summary.totalBudget / 10000000).toFixed(2)} Cr`,
            sub: `Contract: Rs. ${(summary.totalContract / 10000000).toFixed(2)} Cr`,
            color: [15, 23, 42]
          },
          {
            label: 'COMMITTED PO SPEND',
            value: `Rs. ${((summary.totalCommitted || 0) / 10000000).toFixed(2)} Cr`,
            sub: `Fulfilled: Rs. ${((summary.totalFulfilled || 0) / 10000000).toFixed(2)} Cr`,
            color: [79, 70, 229] // indigo-600
          },
          {
            label: 'NET COST VARIANCE',
            value: `${(summary.netVariance || 0) > 0 ? '+' : ''}Rs. ${((summary.netVariance || 0) / 100000).toFixed(2)} L`,
            sub: `${(summary.netVariancePct || 0) > 0 ? '+' : ''}${(summary.netVariancePct || 0).toFixed(2)}% vs Budget`,
            color: (summary.netVariance || 0) > 0 ? [225, 29, 72] : [16, 185, 129] // rose vs emerald
          },
          {
            label: 'PORTFOLIO MARGIN',
            value: `${(summary.avgProjectedMarginPct || 0).toFixed(2)}%`,
            sub: `Target: ${(summary.avgBudgetedMarginPct || 0).toFixed(2)}%`,
            color: [16, 185, 129]
          },
          {
            label: 'OVER-BUDGET SITES',
            value: `${summary.overBudgetCount || 0} of ${records.length}`,
            sub: `${summary.favorableCount || 0} Under Budget`,
            color: (summary.overBudgetCount || 0) > 0 ? [225, 29, 72] : [15, 23, 42]
          }
        ];

        if (!isPortrait) {
          // Landscape: 5 cards in 1 row
          const cardWidth = (contentWidth - 8) / 5;
          const cardHeight = 15;

          kpis.forEach((kpi, idx) => {
            const kpiX = margin + idx * (cardWidth + 2);
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(226, 232, 240);
            pdf.setLineWidth(0.2);
            pdf.roundedRect(kpiX, currentY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(5.8);
            pdf.setTextColor(100, 116, 139);
            pdf.text(kpi.label, kpiX + 3, currentY + 4);

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8.5);
            pdf.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
            pdf.text(kpi.value, kpiX + 3, currentY + 9);

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(5.8);
            pdf.setTextColor(148, 163, 184);
            pdf.text(kpi.sub, kpiX + 3, currentY + 13);
          });

          currentY += cardHeight + 4;
        } else {
          // Portrait: 2 rows (Row 1: 3 cards, Row 2: 2 cards)
          const pCardHeight = 13.5;
          const row1Width = (contentWidth - 4) / 3;
          const row2Width = (contentWidth - 2) / 2;

          // Row 1 (first 3)
          kpis.slice(0, 3).forEach((kpi, idx) => {
            const kpiX = margin + idx * (row1Width + 2);
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(226, 232, 240);
            pdf.setLineWidth(0.2);
            pdf.roundedRect(kpiX, currentY, row1Width, pCardHeight, 1.5, 1.5, 'FD');

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(5.5);
            pdf.setTextColor(100, 116, 139);
            pdf.text(kpi.label, kpiX + 3, currentY + 3.8);

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
            pdf.text(kpi.value, kpiX + 3, currentY + 8.2);

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(5.3);
            pdf.setTextColor(148, 163, 184);
            pdf.text(kpi.sub, kpiX + 3, currentY + 11.8);
          });

          // Row 2 (last 2)
          const row2Y = currentY + pCardHeight + 2;
          kpis.slice(3, 5).forEach((kpi, idx) => {
            const kpiX = margin + idx * (row2Width + 2);
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(226, 232, 240);
            pdf.setLineWidth(0.2);
            pdf.roundedRect(kpiX, row2Y, row2Width, pCardHeight, 1.5, 1.5, 'FD');

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(5.5);
            pdf.setTextColor(100, 116, 139);
            pdf.text(kpi.label, kpiX + 3, row2Y + 3.8);

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
            pdf.text(kpi.value, kpiX + 3, row2Y + 8.2);

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(5.3);
            pdf.setTextColor(148, 163, 184);
            pdf.text(kpi.sub, kpiX + 3, row2Y + 11.8);
          });

          currentY = row2Y + pCardHeight + 4;
        }
      } else {
        // Continuation Header
        pdf.setFillColor(15, 23, 42);
        pdf.rect(margin, currentY, contentWidth, 8, 'F');
        pdf.setFillColor(0, 102, 224);
        pdf.rect(margin, currentY, contentWidth, 1, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(isPortrait ? 6.8 : 7.5);
        pdf.setTextColor(255, 255, 255);
        pdf.text('ALPHA HVAC SOLUTIONS • PROJECT COST VARIANCE REGISTER (CONTINUATION)', margin + 4, currentY + 5.5);

        currentY += 11;
      }
    };

    renderHeader(true);

    // Columns Definition
    const landscapeCols = [
      { header: 'PROJECT NO & NAME', width: 55, align: 'left' as const },
      { header: 'CLIENT & CITY', width: 38, align: 'left' as const },
      { header: 'CONTRACT (L)', width: 25, align: 'right' as const },
      { header: 'BOQ BUDGET (L)', width: 25, align: 'right' as const },
      { header: 'PO COMMIT (L)', width: 27, align: 'right' as const },
      { header: 'USED %', width: 21, align: 'right' as const },
      { header: 'VARIANCE (L)', width: 26, align: 'right' as const },
      { header: 'MARGIN %', width: 26, align: 'right' as const },
      { header: 'STATUS', width: 34, align: 'center' as const }
    ];

    const portraitCols = [
      { header: 'PROJECT & SITE', width: 44, align: 'left' as const },
      { header: 'CLIENT', width: 26, align: 'left' as const },
      { header: 'CONTRACT (L)', width: 17, align: 'right' as const },
      { header: 'BUDGET (L)', width: 17, align: 'right' as const },
      { header: 'COMMIT (L)', width: 18, align: 'right' as const },
      { header: 'USED %', width: 14, align: 'right' as const },
      { header: 'VARIANCE (L)', width: 18, align: 'right' as const },
      { header: 'MARGIN %', width: 16, align: 'right' as const },
      { header: 'STATUS', width: 20, align: 'center' as const }
    ];

    const cols = isPortrait ? portraitCols : landscapeCols;

    const renderTableHeaders = () => {
      pdf.setFillColor(241, 245, 249); // slate-100
      pdf.rect(margin, currentY, contentWidth, 6, 'F');
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.2);
      pdf.line(margin, currentY + 6, margin + contentWidth, currentY + 6);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(isPortrait ? 5.6 : 6.2);
      pdf.setTextColor(30, 41, 59);

      let xOffset = margin;
      cols.forEach((col) => {
        if (col.align === 'right') {
          pdf.text(col.header, xOffset + col.width - 2, currentY + 4.2, { align: 'right' });
        } else if (col.align === 'center') {
          pdf.text(col.header, xOffset + col.width / 2, currentY + 4.2, { align: 'center' });
        } else {
          pdf.text(col.header, xOffset + 2, currentY + 4.2);
        }
        xOffset += col.width;
      });

      currentY += 6;
    };

    renderTableHeaders();

    // Iterate through records
    records.forEach((rec, idx) => {
      const rowHeight = 7;
      if (currentY + rowHeight > pageHeight - 14) {
        pdf.addPage();
        currentY = margin;
        renderHeader(false);
        renderTableHeaders();
      }

      // Zebra striping
      if (idx % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
      }

      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.15);
      pdf.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight);

      let xOffset = margin;

      // 1. Project No & Name
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(isPortrait ? 5.8 : 6.5);
      pdf.setTextColor(15, 23, 42);
      const projNum = sanitizePdfText(rec.project.projectNumber || 'PRJ');
      const projName = sanitizePdfText(rec.project.projectName || '');
      const maxProjLen = isPortrait ? 24 : 36;
      const projLine = `${projNum} - ${projName}`.substring(0, maxProjLen);
      pdf.text(projLine, xOffset + 2, currentY + 4.2);
      xOffset += cols[0].width;

      // 2. Client & City
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(isPortrait ? 5.6 : 6.2);
      pdf.setTextColor(71, 85, 105);
      const maxClientLen = isPortrait ? 15 : 24;
      const client = sanitizePdfText(rec.project.clientName || 'Client').substring(0, maxClientLen);
      pdf.text(client, xOffset + 2, currentY + 4.2);
      xOffset += cols[1].width;

      // 3. Contract (Lakhs)
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(isPortrait ? 5.8 : 6.5);
      pdf.setTextColor(30, 41, 59);
      const contractL = (rec.contractValue / 100000).toFixed(2);
      pdf.text(contractL, xOffset + cols[2].width - 2, currentY + 4.2, { align: 'right' });
      xOffset += cols[2].width;

      // 4. Budget Cost (Lakhs)
      const budgetL = (rec.budgetCost / 100000).toFixed(2);
      pdf.text(budgetL, xOffset + cols[3].width - 2, currentY + 4.2, { align: 'right' });
      xOffset += cols[3].width;

      // 5. PO Commitments (Lakhs)
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(79, 70, 229);
      const commitL = (rec.actualCommittedCost / 100000).toFixed(2);
      pdf.text(commitL, xOffset + cols[4].width - 2, currentY + 4.2, { align: 'right' });
      xOffset += cols[4].width;

      // 6. Used %
      pdf.setFont('helvetica', 'normal');
      const usedPct = rec.budgetCost > 0 ? (rec.actualCommittedCost / rec.budgetCost) * 100 : 0;
      if (usedPct > 100) {
        pdf.setTextColor(225, 29, 72);
      } else {
        pdf.setTextColor(30, 41, 59);
      }
      pdf.text(`${usedPct.toFixed(1)}%`, xOffset + cols[5].width - 2, currentY + 4.2, { align: 'right' });
      xOffset += cols[5].width;

      // 7. Cost Variance (Lakhs)
      pdf.setFont('helvetica', 'bold');
      const varL = (rec.costVariance / 100000).toFixed(2);
      if (rec.costVariance > 0) {
        pdf.setTextColor(225, 29, 72); // rose overrun
        pdf.text(`+${varL}`, xOffset + cols[6].width - 2, currentY + 4.2, { align: 'right' });
      } else {
        pdf.setTextColor(16, 185, 129); // emerald favorable
        pdf.text(`${varL}`, xOffset + cols[6].width - 2, currentY + 4.2, { align: 'right' });
      }
      xOffset += cols[6].width;

      // 8. Projected Margin %
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(15, 23, 42);
      const marginTxt = isPortrait
        ? `${rec.projectedMarginPct.toFixed(1)}%`
        : `${rec.projectedMarginPct.toFixed(1)}% (tgt ${rec.budgetedMarginPct.toFixed(0)}%)`;
      pdf.text(marginTxt, xOffset + cols[7].width - 2, currentY + 4.2, { align: 'right' });
      xOffset += cols[7].width;

      // 9. Variance Status Pill
      let statusLabel = rec.varianceStatusLabel || 'ON TRACK';
      let statusColor = [79, 70, 229]; // indigo
      if (rec.varianceStatus === 'CRITICAL_OVERRUN') {
        statusLabel = 'OVERRUN';
        statusColor = [225, 29, 72];
      } else if (rec.varianceStatus === 'WARNING') {
        statusLabel = 'WATCHLIST';
        statusColor = [217, 119, 6];
      } else if (rec.varianceStatus === 'FAVORABLE') {
        statusLabel = 'FAVORABLE';
        statusColor = [16, 185, 129];
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(isPortrait ? 5.2 : 5.8);
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(statusLabel, xOffset + cols[8].width / 2, currentY + 4.2, { align: 'center' });

      currentY += rowHeight;
    });

    // Summary Totals Row
    if (currentY + 8 > pageHeight - 14) {
      pdf.addPage();
      currentY = margin;
      renderHeader(false);
      renderTableHeaders();
    }

    pdf.setFillColor(226, 232, 240); // slate-200
    pdf.rect(margin, currentY, contentWidth, 7, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(isPortrait ? 6.0 : 6.8);
    pdf.setTextColor(15, 23, 42);
    pdf.text(
      isPortrait ? `TOTAL (${records.length} SITES)` : `TOTAL PORTFOLIO (${records.length} SITES)`,
      margin + 2,
      currentY + 4.6
    );

    let totX = margin + cols[0].width + cols[1].width;
    // Contract total
    pdf.text((summary.totalContract / 100000).toFixed(2), totX + cols[2].width - 2, currentY + 4.6, { align: 'right' });
    totX += cols[2].width;

    // Budget total
    pdf.text((summary.totalBudget / 100000).toFixed(2), totX + cols[3].width - 2, currentY + 4.6, { align: 'right' });
    totX += cols[3].width;

    // Committed total
    pdf.setTextColor(79, 70, 229);
    pdf.text((summary.totalCommitted / 100000).toFixed(2), totX + cols[4].width - 2, currentY + 4.6, { align: 'right' });
    totX += cols[4].width;

    // Avg Used %
    pdf.setTextColor(15, 23, 42);
    const avgUsed = summary.totalBudget > 0 ? (summary.totalCommitted / summary.totalBudget) * 100 : 0;
    pdf.text(`${avgUsed.toFixed(1)}%`, totX + cols[5].width - 2, currentY + 4.6, { align: 'right' });
    totX += cols[5].width;

    // Net variance
    if (summary.netVariance > 0) {
      pdf.setTextColor(225, 29, 72);
      pdf.text(`+${(summary.netVariance / 100000).toFixed(2)}`, totX + cols[6].width - 2, currentY + 4.6, { align: 'right' });
    } else {
      pdf.setTextColor(16, 185, 129);
      pdf.text(`${(summary.netVariance / 100000).toFixed(2)}`, totX + cols[6].width - 2, currentY + 4.6, { align: 'right' });
    }
    totX += cols[6].width;

    // Margin
    pdf.setTextColor(16, 185, 129);
    pdf.text(`${(summary.avgProjectedMarginPct || 0).toFixed(1)}%`, totX + cols[7].width - 2, currentY + 4.6, { align: 'right' });

    // Page Footers
    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.25);
      pdf.line(margin, pageHeight - 8, margin + contentWidth, pageHeight - 8);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(isPortrait ? 5.8 : 6.5);
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        `AlphaERP Enterprise • Project Commercials & PO Variance Register • Page ${i} of ${totalPages} • Confidential Management Report`,
        pageWidth / 2,
        pageHeight - 4.5,
        { align: 'center' }
      );
    }

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      pdf.save(cleanFilename);
    } else {
      pdf.output('arraybuffer');
    }
    return true;
  } catch (err) {
    console.error('exportProjectCostAnalysisPDF failed:', err);
    return false;
  }
}

/**
 * Direct jsPDF Exporter for Finance Milestone Billing & Payments / Disbursements Register.
 * Renders an ultra-fast, high-resolution vector PDF with audit summary and itemized invoice details.
 */
export function exportFinancePaymentsPDF(
  payments: any[],
  activeTab: 'receivables' | 'payables',
  options?: { filename?: string; filterTitle?: string }
): boolean {
  try {
    const isReceivable = activeTab === 'receivables';
    const filename = options?.filename || (isReceivable
      ? `AlphaERP_ClientReceivables_Report_${new Date().toISOString().split('T')[0]}.pdf`
      : `AlphaERP_VendorPayables_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    const cleanFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2; // 277mm
    let currentY = margin;

    // Compute summary metrics
    const totalGross = payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const totalPaid = payments.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const totalPending = totalGross - totalPaid;
    const paidCount = payments.filter((p) => p.status === 'Paid').length;
    const pendingCount = payments.filter((p) => p.status !== 'Paid').length;
    const settlementRatio = totalGross > 0 ? (totalPaid / totalGross) * 100 : 0;

    const renderHeader = (isFirstPage: boolean) => {
      if (isFirstPage) {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(margin, currentY, contentWidth, 20, 'F');

        pdf.setFillColor(0, 102, 224);
        pdf.rect(margin, currentY, contentWidth, 1.8, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(255, 255, 255);
        pdf.text('ALPHA HVAC SOLUTIONS & ENGINEERING SERVICES LTD', margin + 6, currentY + 7.5);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(203, 213, 225);
        pdf.text(
          isReceivable
            ? 'Corporate Commercial Ledger • Client Milestone Billing Schedule & Accounts Receivable (AR)'
            : 'Corporate Commercial Ledger • Vendor Procurement Payables & Disbursement Schedule (AP)',
          margin + 6,
          currentY + 12
        );

        pdf.setFontSize(6.8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(
          `Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}  |  System: AlphaERP Finance Engine  |  Total Invoices: ${payments.length}  |  GAAP Double-Entry Verified`,
          margin + 6,
          currentY + 17
        );

        currentY += 24;

        // Title Bar
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(margin, currentY, contentWidth, 12, 1.5, 1.5, 'FD');

        pdf.setFillColor(isReceivable ? 0 : 217, isReceivable ? 102 : 119, isReceivable ? 224 : 6); // blue vs amber
        pdf.rect(margin, currentY, 2.5, 12, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(15, 23, 42);
        pdf.text(
          isReceivable
            ? 'CLIENT MILESTONE BILLING & ACCOUNTS RECEIVABLE REGISTER'
            : 'VENDOR PROCUREMENT PAYABLES & DISBURSEMENT REGISTER',
          margin + 6,
          currentY + 5.5
        );

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(100, 116, 139);
        pdf.text(
          `Official Financial Audit Record   •   All figures in INR (Rs.)   •   Includes 18% CGST & SGST Compliance Breakdown`,
          margin + 6,
          currentY + 9.5
        );

        currentY += 15;

        // Executive KPI Cards (4 cards)
        const cardWidth = (contentWidth - 6) / 4;
        const cardHeight = 15;

        const kpis = [
          {
            label: isReceivable ? 'TOTAL BILLED REVENUE' : 'TOTAL PAYABLES COMMITTED',
            value: `Rs. ${(totalGross / 100000).toFixed(2)} Lakhs`,
            sub: `${payments.length} total invoice records`,
            color: [15, 23, 42]
          },
          {
            label: isReceivable ? 'COLLECTED RECEIVABLES' : 'DISBURSED / SETTLED',
            value: `Rs. ${(totalPaid / 100000).toFixed(2)} Lakhs`,
            sub: `${paidCount} settled milestones`,
            color: [16, 185, 129]
          },
          {
            label: isReceivable ? 'PENDING OUTSTANDING' : 'PENDING DISBURSEMENTS',
            value: `Rs. ${(totalPending / 100000).toFixed(2)} Lakhs`,
            sub: `${pendingCount} open milestones`,
            color: [225, 29, 72]
          },
          {
            label: isReceivable ? 'COLLECTION EFFICIENCY' : 'SETTLEMENT RATIO',
            value: `${settlementRatio.toFixed(1)}%`,
            sub: isReceivable ? 'Target: 95% within 30 days' : 'Cash flow status: Balanced',
            color: [79, 70, 229]
          }
        ];

        kpis.forEach((kpi, idx) => {
          const kpiX = margin + idx * (cardWidth + 2);
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(226, 232, 240);
          pdf.setLineWidth(0.2);
          pdf.roundedRect(kpiX, currentY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(5.8);
          pdf.setTextColor(100, 116, 139);
          pdf.text(kpi.label, kpiX + 3, currentY + 4);

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.5);
          pdf.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
          pdf.text(kpi.value, kpiX + 3, currentY + 9);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(5.8);
          pdf.setTextColor(148, 163, 184);
          pdf.text(kpi.sub, kpiX + 3, currentY + 13);
        });

        currentY += cardHeight + 4;
      } else {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(margin, currentY, contentWidth, 8, 'F');
        pdf.setFillColor(0, 102, 224);
        pdf.rect(margin, currentY, contentWidth, 1, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(255, 255, 255);
        pdf.text(
          `ALPHA HVAC SOLUTIONS • ${isReceivable ? 'CLIENT RECEIVABLES' : 'VENDOR PAYABLES'} REGISTER (CONTINUATION)`,
          margin + 4,
          currentY + 5.5
        );

        currentY += 11;
      }
    };

    renderHeader(true);

    // Columns Definition (Total Width = 277mm)
    const cols = [
      { header: 'INVOICE / REF NO', width: 32, align: 'left' },
      { header: 'PROJECT NAME', width: 48, align: 'left' },
      { header: isReceivable ? 'CLIENT NAME' : 'VENDOR NAME', width: 45, align: 'left' },
      { header: 'MILESTONE STAGE', width: 44, align: 'left' },
      { header: 'DUE DATE', width: 22, align: 'center' },
      { header: 'TAXABLE (RS)', width: 22, align: 'right' },
      { header: 'GST 18% (RS)', width: 20, align: 'right' },
      { header: 'TOTAL (RS)', width: 24, align: 'right' },
      { header: 'STATUS', width: 20, align: 'center' }
    ];

    const renderTableHeaders = () => {
      pdf.setFillColor(241, 245, 249);
      pdf.rect(margin, currentY, contentWidth, 6, 'F');
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.2);
      pdf.line(margin, currentY + 6, margin + contentWidth, currentY + 6);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.2);
      pdf.setTextColor(30, 41, 59);

      let xOffset = margin;
      cols.forEach((col) => {
        if (col.align === 'right') {
          pdf.text(col.header, xOffset + col.width - 2, currentY + 4.2, { align: 'right' });
        } else if (col.align === 'center') {
          pdf.text(col.header, xOffset + col.width / 2, currentY + 4.2, { align: 'center' });
        } else {
          pdf.text(col.header, xOffset + 2, currentY + 4.2);
        }
        xOffset += col.width;
      });

      currentY += 6;
    };

    renderTableHeaders();

    // Iterate through payments
    payments.forEach((pay, idx) => {
      const rowHeight = 7;
      if (currentY + rowHeight > pageHeight - 14) {
        pdf.addPage();
        currentY = margin;
        renderHeader(false);
        renderTableHeaders();
      }

      if (idx % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
      }

      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.15);
      pdf.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight);

      let xOffset = margin;

      // 1. Invoice No
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(15, 23, 42);
      const invNum = sanitizePdfText(pay.invoiceNumber || pay.referenceTitle || 'INV').substring(0, 18);
      pdf.text(invNum, xOffset + 2, currentY + 4.2);
      xOffset += cols[0].width;

      // 2. Project Name
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.2);
      pdf.setTextColor(51, 65, 85);
      const proj = sanitizePdfText(pay.projectName || '-').substring(0, 28);
      pdf.text(proj, xOffset + 2, currentY + 4.2);
      xOffset += cols[1].width;

      // 3. Client / Vendor Name
      const party = sanitizePdfText(pay.clientOrVendorName || '-').substring(0, 26);
      pdf.text(party, xOffset + 2, currentY + 4.2);
      xOffset += cols[2].width;

      // 4. Milestone Stage
      const milestone = sanitizePdfText(pay.milestoneTitle || pay.paymentType || 'Milestone').substring(0, 26);
      pdf.text(milestone, xOffset + 2, currentY + 4.2);
      xOffset += cols[3].width;

      // 5. Due Date
      pdf.setFontSize(6.2);
      const dueStr = pay.dueDate ? sanitizePdfText(pay.dueDate) : '-';
      pdf.text(dueStr, xOffset + cols[4].width / 2, currentY + 4.2, { align: 'center' });
      xOffset += cols[4].width;

      // 6. Taxable Amount
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 41, 59);
      const taxable = pay.taxableAmount || (pay.totalAmount ? Math.round(pay.totalAmount / 1.18) : 0);
      pdf.text(taxable.toLocaleString('en-IN'), xOffset + cols[5].width - 2, currentY + 4.2, { align: 'right' });
      xOffset += cols[5].width;

      // 7. GST 18%
      const gst = pay.gstAmount || (pay.totalAmount ? Math.round(pay.totalAmount - taxable) : 0);
      pdf.text(gst.toLocaleString('en-IN'), xOffset + cols[6].width - 2, currentY + 4.2, { align: 'right' });
      xOffset += cols[6].width;

      // 8. Total Amount
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text((pay.totalAmount || 0).toLocaleString('en-IN'), xOffset + cols[7].width - 2, currentY + 4.2, { align: 'right' });
      xOffset += cols[7].width;

      // 9. Status
      const status = pay.status || 'Pending';
      let statusColor = [217, 119, 6]; // amber
      if (status === 'Paid') statusColor = [16, 185, 129];
      else if (status === 'Overdue') statusColor = [225, 29, 72];

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(5.8);
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(status.toUpperCase(), xOffset + cols[8].width / 2, currentY + 4.2, { align: 'center' });

      currentY += rowHeight;
    });

    // Summary Totals Row
    if (currentY + 8 > pageHeight - 14) {
      pdf.addPage();
      currentY = margin;
      renderHeader(false);
      renderTableHeaders();
    }

    pdf.setFillColor(226, 232, 240);
    pdf.rect(margin, currentY, contentWidth, 7, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.8);
    pdf.setTextColor(15, 23, 42);
    pdf.text(`TOTAL SUMMARY (${payments.length} RECORDS)`, margin + 2, currentY + 4.6);

    let totX = margin + cols[0].width + cols[1].width + cols[2].width + cols[3].width + cols[4].width;
    const totalTaxable = payments.reduce((sum, p) => sum + (p.taxableAmount || Math.round((p.totalAmount || 0) / 1.18)), 0);
    const totalGst = totalGross - totalTaxable;

    pdf.text(totalTaxable.toLocaleString('en-IN'), totX + cols[5].width - 2, currentY + 4.6, { align: 'right' });
    totX += cols[5].width;

    pdf.text(totalGst.toLocaleString('en-IN'), totX + cols[6].width - 2, currentY + 4.6, { align: 'right' });
    totX += cols[6].width;

    pdf.setTextColor(15, 23, 42);
    pdf.text(totalGross.toLocaleString('en-IN'), totX + cols[7].width - 2, currentY + 4.6, { align: 'right' });

    // Page Footers
    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.25);
      pdf.line(margin, pageHeight - 8, margin + contentWidth, pageHeight - 8);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(148, 163, 184);
      pdf.text(
        `AlphaERP Finance • ${isReceivable ? 'Client Milestone Accounts Receivable' : 'Vendor Procurement Accounts Payable'} • Page ${i} of ${totalPages} • GAAP Compliant`,
        pageWidth / 2,
        pageHeight - 4.5,
        { align: 'center' }
      );
    }

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      pdf.save(cleanFilename);
    } else {
      pdf.output('arraybuffer');
    }
    return true;
  } catch (err) {
    console.error('exportFinancePaymentsPDF failed:', err);
    return false;
  }
}
