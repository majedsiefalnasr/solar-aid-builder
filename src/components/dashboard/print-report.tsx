import { reportTypeLabel, type FieldReportDoc, type ProjectDoc } from "@/lib/workflow-store";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatArabicDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function statusBadge(status: FieldReportDoc["status"]): { label: string; color: string } {
  switch (status) {
    case "approved":
      return { label: "معتمد", color: "#16a34a" };
    case "rejected":
      return { label: "مرفوض", color: "#e11d48" };
    default:
      return { label: "بانتظار المراجعة", color: "#d97706" };
  }
}

/**
 * Opens a new browser window with a print-friendly version of the report,
 * then triggers the system print dialog automatically.
 */
export function openPrintableReport(report: FieldReportDoc, project?: ProjectDoc) {
  const win = window.open("", "_blank", "width=900,height=1200");
  if (!win) return;

  const status = statusBadge(report.status);
  const photosHtml = report.photos
    .map(
      (src) =>
        `<div class="photo"><img src="${escapeHtml(src)}" alt="" /></div>`,
    )
    .join("");

  const projectMeta = project
    ? `
        <div class="meta-row"><span class="meta-key">المشروع</span><span class="meta-val">${escapeHtml(project.name)} — #${escapeHtml(project.id)}</span></div>
        <div class="meta-row"><span class="meta-key">المدينة</span><span class="meta-val">${escapeHtml(project.city)}</span></div>
        ${project.contractorName ? `<div class="meta-row"><span class="meta-key">المقاول</span><span class="meta-val">${escapeHtml(project.contractorName)}</span></div>` : ""}
        ${project.supervisorName ? `<div class="meta-row"><span class="meta-key">المهندس المشرف</span><span class="meta-val">${escapeHtml(project.supervisorName)}</span></div>` : ""}
      `
    : "";

  const reviewHtml =
    report.status === "approved" && report.reviewedBy
      ? `<div class="review approved">
           <div class="review-title">✓ اعتُمد التقرير</div>
           <div class="review-meta">بواسطة: ${escapeHtml(report.reviewedBy)}${
             report.reviewedAt ? ` — ${formatArabicDate(report.reviewedAt)}` : ""
           }</div>
         </div>`
      : report.status === "rejected" && report.rejectionReason
        ? `<div class="review rejected">
             <div class="review-title">✗ تم رفض التقرير</div>
             <div class="review-meta">${escapeHtml(report.rejectionReason)}</div>
             ${report.reviewedBy ? `<div class="review-meta">بواسطة: ${escapeHtml(report.reviewedBy)}</div>` : ""}
           </div>`
        : "";

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <title>تقرير ${escapeHtml(report.id)} — ${escapeHtml(report.title)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Tajawal", "Cairo", sans-serif;
      margin: 0;
      padding: 32px;
      color: #1a1f2c;
      background: #fff;
      line-height: 1.6;
    }
    .doc { max-width: 780px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e5e7eb;
      margin-bottom: 20px;
    }
    .brand { font-weight: 800; font-size: 18px; color: #0d9488; }
    .doc-id { font-size: 12px; color: #6b7280; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      color: #fff;
    }
    h1 { font-size: 22px; margin: 0 0 8px; }
    .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
    .section { margin-bottom: 24px; page-break-inside: avoid; }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      color: #0d9488;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e7eb;
    }
    .meta-row {
      display: flex;
      gap: 12px;
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px dashed #f1f5f9;
    }
    .meta-key { font-weight: 700; color: #475569; min-width: 120px; }
    .meta-val { color: #1a1f2c; }
    .note {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      font-size: 14px;
      white-space: pre-wrap;
      border-right: 3px solid #0d9488;
    }
    .photos {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .photo {
      aspect-ratio: 4/3;
      overflow: hidden;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .photo img { width: 100%; height: 100%; object-fit: cover; }
    .review {
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 12px;
    }
    .review.approved { background: #f0fdf4; border: 1px solid #86efac; }
    .review.rejected { background: #fef2f2; border: 1px solid #fecaca; }
    .review-title { font-weight: 800; font-size: 13px; margin-bottom: 4px; }
    .review.approved .review-title { color: #15803d; }
    .review.rejected .review-title { color: #b91c1c; }
    .review-meta { font-size: 12px; color: #475569; }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-top: 48px;
    }
    .sig {
      border-top: 1.5px solid #1a1f2c;
      padding-top: 6px;
      text-align: center;
      font-size: 12px;
      font-weight: 700;
    }
    .sig-sub { font-size: 11px; color: #6b7280; font-weight: 400; margin-top: 2px; }
    @media print {
      body { padding: 0; }
      .photo { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="doc">
    <div class="header">
      <div>
        <div class="brand">منصة تم — تقارير المشاريع</div>
        <div class="doc-id">رقم التقرير: ${escapeHtml(report.id)}</div>
      </div>
      <div class="badge" style="background: ${status.color}">${status.label}</div>
    </div>

    <h1>${escapeHtml(report.title)}</h1>
    <div class="subtitle">${reportTypeLabel(report.type)} • ${formatArabicDate(report.date)}</div>

    <div class="section">
      <div class="section-title">معلومات التقرير</div>
      ${projectMeta}
      ${report.phaseName ? `<div class="meta-row"><span class="meta-key">المرحلة</span><span class="meta-val">${escapeHtml(report.phaseName)}</span></div>` : ""}
      <div class="meta-row"><span class="meta-key">المهندس الميداني</span><span class="meta-val">${escapeHtml(report.engineer)}</span></div>
      <div class="meta-row"><span class="meta-key">تاريخ الرفع</span><span class="meta-val">${formatArabicDate(report.date)}</span></div>
      ${report.dueDate ? `<div class="meta-row"><span class="meta-key">الموعد المستحق</span><span class="meta-val">${formatArabicDate(report.dueDate)}</span></div>` : ""}
    </div>

    <div class="section">
      <div class="section-title">التفاصيل والملاحظات</div>
      <div class="note">${escapeHtml(report.note)}</div>
    </div>

    ${
      report.photos.length > 0
        ? `<div class="section">
             <div class="section-title">الصور المرفقة (${report.photos.length})</div>
             <div class="photos">${photosHtml}</div>
           </div>`
        : ""
    }

    ${reviewHtml}

    <div class="signatures">
      <div>
        <div class="sig">المهندس الميداني</div>
        <div class="sig-sub">${escapeHtml(report.engineer)}</div>
      </div>
      <div>
        <div class="sig">المهندس المشرف</div>
        <div class="sig-sub">${escapeHtml(report.reviewedBy ?? "—")}</div>
      </div>
    </div>

    <div class="footer">
      تم توليد هذا التقرير من منصة تم • ${new Date().toLocaleDateString("ar-EG")}
    </div>
  </div>
  <script>
    window.addEventListener("load", function () {
      // Wait briefly for images to load before printing
      setTimeout(function () { window.print(); }, 400);
    });
  </script>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}
