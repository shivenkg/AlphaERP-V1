import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface DeckExportProgress {
  current: number;
  total: number;
  slideTitle: string;
  percent: number;
}

export interface DeckExportOptions {
  mode: 'full' | 'current';
  currentSlideIndex?: number;
  filename?: string;
  onProgress?: (progress: DeckExportProgress) => void;
}

/**
 * High-fidelity PDF exporter for AlphaERP Pitch Deck.
 * Captures each slide cleanly into an exact A4 Landscape (297mm x 210mm) page
 * with zero cutoffs, zero overlap, and preserved colors and typography.
 */
export async function exportPitchDeckToPDF(
  slideElements: HTMLElement[],
  slideTitles: string[],
  options: DeckExportOptions
): Promise<boolean> {
  const isSingle = options.mode === 'current';
  const targetElements = isSingle
    ? [slideElements[options.currentSlideIndex ?? 0]]
    : slideElements;

  const targetTitles = isSingle
    ? [slideTitles[options.currentSlideIndex ?? 0] || 'Slide']
    : slideTitles;

  const total = targetElements.length;
  if (total === 0) return false;

  const baseFilename = options.filename || (
    isSingle
      ? `AlphaERP_Pitch_Deck_Slide_${(options.currentSlideIndex ?? 0) + 1}`
      : `AlphaERP_Investor_Pitch_Deck_Full_Series_A_${new Date().toISOString().split('T')[0]}`
  );
  const cleanFilename = baseFilename.endsWith('.pdf') ? baseFilename : `${baseFilename}.pdf`;

  // Create jsPDF in landscape A4
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 297; // mm
  const pageHeight = 210; // mm
  const maxContentWidth = 285; // mm
  const maxContentHeight = 198; // mm

  for (let i = 0; i < total; i++) {
    const el = targetElements[i];
    const title = targetTitles[i] || `Slide ${i + 1}`;

    if (options.onProgress) {
      options.onProgress({
        current: i + 1,
        total,
        slideTitle: title,
        percent: Math.round(((i + 1) / total) * 100)
      });
    }

    if (!el) continue;

    let canvas: HTMLCanvasElement | null = null;
    try {
      const capturePromise = html2canvas(el, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          if (!element || !(element instanceof Element)) return false;
          return (
            element.classList?.contains('no-print') ||
            element.getAttribute?.('data-no-print') === 'true'
          );
        }
      });

      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Slide capture timed out')), 6000)
      );

      canvas = (await Promise.race([capturePromise, timeoutPromise])) as HTMLCanvasElement | null;
    } catch (captureErr) {
      console.warn(`Slide capture error for ${title}:`, captureErr);
    }

    if (!canvas || canvas.width === 0 || canvas.height === 0) continue;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Calculate optimal dimensions to fit cleanly within A4 Landscape
    let renderWidth = maxContentWidth;
    let renderHeight = (canvas.height * renderWidth) / canvas.width;

    if (renderHeight > maxContentHeight) {
      renderHeight = maxContentHeight;
      renderWidth = (canvas.width * renderHeight) / canvas.height;
    }

    // Center on page
    const posX = (pageWidth - renderWidth) / 2;
    const posY = (pageHeight - renderHeight) / 2;

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
  }

  pdf.save(cleanFilename);
  return true;
}

/**
 * Dedicated high-fidelity print trigger for AlphaERP Pitch Deck.
 * Formats every slide into an exact landscape presentation page with clean page breaks.
 */
export function triggerPitchDeckPrint(
  printableHtml: string,
  documentTitle: string = 'AlphaERP Investor Pitch Deck • HVAC Biz'
): void {
  const originalTitle = document.title;
  document.title = documentTitle;

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
      // Gather active document stylesheets
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((s) => s.outerHTML)
        .join('\n');

      frameDoc.open();
      frameDoc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${documentTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  ${styles}
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    * {
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
      -webkit-font-smoothing: antialiased;
    }
    .deck-print-slide {
      page-break-after: always !important;
      break-after: page !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      width: 297mm !important;
      height: 209mm !important;
      max-height: 209mm !important;
      box-sizing: border-box !important;
      padding: 8mm 12mm !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      background: #ffffff !important;
      color: #0f172a !important;
      overflow: hidden !important;
      border: 1px solid #e2e8f0 !important;
    }
    .deck-print-slide:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
    }
    .no-print, [data-no-print="true"] {
      display: none !important;
    }
  </style>
</head>
<body class="bg-white text-slate-900">
  ${printableHtml}
</body>
</html>`);
      frameDoc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (printErr) {
          console.warn('Iframe print failed, falling back to window.print():', printErr);
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
            document.title = originalTitle;
          }, 1500);
        }
      }, 300);
      return;
    }
  } catch (err) {
    console.warn('Print iframe initialization failed:', err);
    window.print();
  }
}
