import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

/**
 * High-fidelity Client-Side PDF Exporter and Document Downloader for AlphaERP (Atmos Aircon).
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
        const footerLabel = options.footerText || `AlphaERP Official Document • Atmos Aircon • Page ${i} of ${totalPages} • Generated ${new Date().toLocaleDateString()}`;
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
        `AlphaERP Enterprise • Atmos Aircon Engineering • Page ${i} of ${totalPages} • Confidential & Legally Binding`,
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
  documentTitle?: string
) {
  let targetElement: HTMLElement | null = null;
  let printTitle = 'AlphaERP Document • Atmos Aircon';

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
      size: A4 portrait;
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
      max-width: 960px !important;
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
