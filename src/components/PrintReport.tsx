import { AnalysisResult, ChemicalElements } from '@/types';
import { getElementStatus } from '@/utils/calculations';

const ELEMENT_ORDER: Array<keyof ChemicalElements> = ['C', 'Mn', 'S', 'P', 'Si', 'Cr', 'Mo', 'Cu', 'Ni', 'V'];

const statusColors = {
  SAFE: '#16a34a',
  WARNING: '#eab308',
  CRITICAL: '#ef4444',
};

const statusLabels = {
  SAFE: 'SEGURO',
  WARNING: 'ATENÇÃO',
  CRITICAL: 'CRÍTICO',
};

function getDsColor(value: number) {
  if (value > 800) return statusColors.SAFE;
  if (value > 700) return statusColors.WARNING;
  return statusColors.CRITICAL;
}

function getCeStatusColor(ce: number) {
  const status = getElementStatus('CE', ce);
  return statusColors[status];
}

export function printReport(results: AnalysisResult[]) {
  const now = new Date().toLocaleString('pt-BR');

  const heatsHtml = results.map((r, i) => {
    const ceColor = getCeStatusColor(r.ce);
    const ceStatus = getElementStatus('CE', r.ce);
    const dsColor = getDsColor(r.compatibilityIndex);
    const dsPercent = Math.min((r.compatibilityIndex / 1000) * 100, 100);

    const elementsHtml = ELEMENT_ORDER.map(el => {
      const val = r.elements[el];
      const status = getElementStatus(el, val);
      const dotColor = statusColors[status];
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;">
          <span style="font-weight:700;font-family:monospace;">${el}</span>
          <span style="display:flex;align-items:center;gap:6px;">
            <span style="font-family:monospace;color:#6b7280;">${val !== null ? val.toFixed(4) : '—'}</span>
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${dotColor};"></span>
          </span>
        </div>`;
    }).join('');

    const applicabilityHtml = r.applicability ? `
      <div style="margin-top:16px;">
        <h4 style="font-size:13px;font-weight:700;margin-bottom:8px;color:#1e3a5f;">Aplicabilidade</h4>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;">
            <p style="font-size:11px;font-weight:700;color:#1e3a5f;margin:0 0 4px;">🔥 Desgaste</p>
            <p style="font-size:11px;color:#6b7280;margin:0;line-height:1.5;">${r.applicability.wearResistance}</p>
          </div>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;">
            <p style="font-size:11px;font-weight:700;color:#1e3a5f;margin:0 0 4px;">🔷 Dobra</p>
            <p style="font-size:11px;color:#6b7280;margin:0;line-height:1.5;">${r.applicability.bendingAlert || 'N/A'}</p>
          </div>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;">
            <p style="font-size:11px;font-weight:700;color:#1e3a5f;margin:0 0 4px;">🔧 Usinagem / Solda</p>
            <p style="font-size:11px;color:#6b7280;margin:0;line-height:1.5;">${r.applicability.machining}</p>
          </div>
        </div>
      </div>` : '';

    const justificationHtml = r.justification ? `
      <div style="margin-top:12px;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.05);border-radius:6px;padding:12px;">
        <p style="font-size:11px;font-weight:700;color:#ef4444;margin:0 0 4px;">⚠️ Alerta Técnico</p>
        <p style="font-size:11px;color:#6b7280;margin:0;line-height:1.5;">${r.justification}</p>
        ${r.hbSource ? `<p style="font-size:11px;color:#6b7280;margin:6px 0 0;font-style:italic;">📍 Origem HB: ${r.hbSource}</p>` : ''}
      </div>` : '';

    const insightsHtml = r.aiInsights ? `
      <div style="margin-top:12px;border:1px solid rgba(59,130,246,0.3);background:rgba(59,130,246,0.05);border-radius:6px;padding:12px;">
        <p style="font-size:11px;font-weight:700;color:#3b82f6;margin:0 0 4px;">🧠 Parecer da IA</p>
        <p style="font-size:12px;color:#6b7280;margin:0;line-height:1.6;">${r.aiInsights}</p>
      </div>` : '';

    return `
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;margin-bottom:20px;page-break-inside:avoid;">
        <!-- Card Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #e5e7eb;">
          <div>
            <h3 style="font-size:16px;font-weight:700;margin:0;color:#1e293b;">Corrida ${r.heatNumber}</h3>
            <div style="display:flex;gap:6px;margin-top:6px;">
              <span style="background:#f1f5f9;color:#475569;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;">${r.materialGrade}</span>
              <span style="background:#f1f5f9;color:#475569;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;">${r.dimensions}</span>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            ${r.hbValue !== null ? `<span style="border:1px solid rgba(239,68,68,0.4);color:#ef4444;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;font-family:monospace;">HB ${r.hbValue}</span>` : ''}
            <span style="background:${ceColor};color:#fff;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;">CE: ${r.ce.toFixed(3)} — ${statusLabels[ceStatus]}</span>
          </div>
        </div>

        <!-- DS Bar -->
        <div style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Data Score (DS)</span>
            <span style="font-size:18px;font-weight:800;font-family:monospace;color:${dsColor};">${r.compatibilityIndex}</span>
          </div>
          <div style="background:#f1f5f9;border-radius:6px;height:12px;overflow:hidden;">
            <div style="background:${dsColor};height:100%;width:${dsPercent}%;border-radius:6px;transition:width 0.3s;"></div>
          </div>
        </div>

        <!-- Elements Grid -->
        <h4 style="font-size:13px;font-weight:700;margin:0 0 8px;color:#1e3a5f;">Composição Química</h4>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
          ${elementsHtml}
        </div>

        ${applicabilityHtml}
        ${justificationHtml}
        ${insightsHtml}
      </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório DataSteel</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f8fafc; color:#1e293b; padding:0; }
    .header { background:hsl(215,50%,23%); color:#fff; padding:24px 32px; display:flex; align-items:center; gap:16px; }
    .header svg { width:28px; height:28px; }
    .header h1 { font-size:22px; font-weight:800; }
    .header p { font-size:12px; opacity:0.7; }
    .header .date { margin-left:auto; font-size:11px; opacity:0.6; }
    .content { padding:24px 32px; }
    .footer { text-align:center; padding:24px 32px; border-top:1px solid #e5e7eb; margin-top:20px; }
    .footer a { color:#3b82f6; font-weight:700; text-decoration:none; }
    .footer p { font-size:12px; color:#6b7280; margin-top:6px; line-height:1.6; }
    @media print {
      body { background:#fff; }
      .no-print { display:none !important; }
      .header { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      [style*="background"] { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>
    <div>
      <h1>DataSteel</h1>
      <p>Análise Inteligente de Certificados</p>
    </div>
    <span class="date">${now}</span>
  </div>
  <div class="content">
    ${heatsHtml}
  </div>
  <div class="footer">
    <a href="https://datasteel.com.br" target="_blank">datasteel.com.br</a>
    <p>Analise seus certificados de aço com inteligência artificial.<br/>Acesse <strong>datasteel.com.br</strong> e experimente gratuitamente.</p>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
