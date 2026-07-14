import PDFDocument from "pdfkit";
import type { DevisRequest, GeneratedQuote } from "@/app/api/devis/route";

const INK = "#12101a";
const ACID = "#6f5ce8";
const TEXT = "#3a3550";
const MUTED = "#6b6580";
const PAGE_WIDTH = 495; // largeur utile (A4 - marges de 50 de chaque côté)

/* Génère le PDF du devis (branding WAVORE), renvoyé en Buffer pour l'attacher au mail */
export function generateDevisPdf(req: DevisRequest, q: GeneratedQuote): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Bandeau d'en-tête
    doc.rect(0, 0, doc.page.width, 100).fill(INK);
    doc
      .fillColor("#f0edfb")
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("WAVORE.", 50, 34);
    doc
      .fillColor("#9d8cff")
      .font("Helvetica")
      .fontSize(9)
      .text("PUBS MUSICALES & VIDÉO GÉNÉRÉES SUR MESURE", 50, 62);

    doc.y = 130;

    doc
      .fillColor(ACID)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("VOTRE DEVIS", 50, doc.y);
    doc
      .fillColor(INK)
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(req.company, 50, doc.y + 4);

    doc.moveDown(1.2);
    doc
      .fillColor(TEXT)
      .font("Helvetica")
      .fontSize(11)
      .text(q.intro, { width: PAGE_WIDTH, lineGap: 4 });

    doc.moveDown(1);
    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(9).text("LE CONCEPT");
    doc.moveDown(0.3);
    doc
      .fillColor(TEXT)
      .font("Helvetica")
      .fontSize(11)
      .text(q.concept, { width: PAGE_WIDTH, lineGap: 4 });

    doc.moveDown(1.2);
    const colY = doc.y;
    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(9).text("FORMULE", 50, colY);
    doc
      .fillColor(INK)
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(q.recommendedTier, 50, colY + 14);
    doc
      .fillColor(ACID)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(q.priceRange, 50, colY + 33);

    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(9).text("DÉLAI", 300, colY);
    doc
      .fillColor(TEXT)
      .font("Helvetica")
      .fontSize(11)
      .text(q.timeline, 300, colY + 14, { width: 245, lineGap: 3 });

    doc.y = Math.max(doc.y, colY + 70);
    doc.moveDown(1);

    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(9).text("LES ÉTAPES", 50, doc.y);
    doc.moveDown(0.5);
    q.steps.forEach((step, i) => {
      const stepY = doc.y;
      doc
        .fillColor(ACID)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(`${i + 1}.`, 50, stepY, { width: 20 });
      doc
        .fillColor(TEXT)
        .font("Helvetica")
        .fontSize(11)
        .text(step, 72, stepY, { width: PAGE_WIDTH - 22, lineGap: 3 });
      doc.moveDown(0.4);
    });

    doc.moveDown(1);
    doc
      .fillColor(MUTED)
      .font("Helvetica-Oblique")
      .fontSize(9)
      .text(
        "Ce devis est une première estimation, sans engagement. Nous revenons vers vous très vite pour affiner ensemble votre projet.",
        50,
        doc.y,
        { width: PAGE_WIDTH, lineGap: 3 }
      );

    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text(
        `contact@wavore.com — © ${new Date().getFullYear()} WAVORE`,
        50,
        doc.page.height - 60,
        { width: PAGE_WIDTH, align: "center" }
      );

    doc.end();
  });
}
