import { ChemicalElements, Status, AnalysisResult } from '../types';

export const calculateCE = (elements: ChemicalElements): number => {
  const C = elements.C || 0;
  const Mn = elements.Mn || 0;
  const Cr = elements.Cr || 0;
  const Mo = elements.Mo || 0;
  const V = elements.V || 0;
  const Cu = elements.Cu || 0;
  const Ni = elements.Ni || 0;
  return C + Mn / 6 + (Cr + Mo + V) / 5 + (Cu + Ni) / 15;
};

export const getElementStatus = (element: keyof ChemicalElements | 'CE', value: number | null): Status => {
  if (value === null) return 'SAFE';
  switch (element) {
    case 'C':
      if (value <= 0.22) return 'SAFE';
      if (value <= 0.25) return 'WARNING';
      return 'CRITICAL';
    case 'Mn':
      return value <= 1.00 ? 'SAFE' : 'CRITICAL';
    case 'P':
      if (value <= 0.030) return 'SAFE';
      if (value <= 0.035) return 'WARNING';
      return 'CRITICAL';
    case 'S':
      if (value <= 0.020) return 'SAFE';
      if (value <= 0.040) return 'WARNING';
      return 'CRITICAL';
    case 'Cr':
      if (value <= 0.10) return 'SAFE';
      if (value <= 0.30) return 'WARNING';
      return 'CRITICAL';
    case 'Mo':
      if (value <= 0.05) return 'SAFE';
      if (value <= 0.15) return 'WARNING';
      return 'CRITICAL';
    case 'CE':
      if (value <= 0.40) return 'SAFE';
      if (value <= 0.44) return 'WARNING';
      return 'CRITICAL';
    default:
      return 'SAFE';
  }
};

export const performTechnicalAnalysis = (
  extracted: {
    heatNumber: string;
    elements: ChemicalElements;
    hbValue: number | null;
    dimensions: string;
    materialGrade: string;
    aiInsights: string;
  }
): AnalysisResult => {
  const ce = calculateCE(extracted.elements);
  let compatibilityIndex = 0;
  let justification = '';
  let applicability = {
    wearResistance: 'Material estrutural padrão.',
    bendingAlert: null as string | null,
    machining: 'Usinagem padrão.'
  };

  if (extracted.hbValue !== null) {
    compatibilityIndex = 0;
    justification = 'Este material possui tratamento térmico de têmpera, tornando-o uma classe superior de resistência ao desgaste, não sendo tecnicamente comparável a um aço estrutural comum como o A36. Apesar da composição química poder parecer favorável, a alta dureza superficial resultará em sérios problemas de usinagem e risco de quebra na dobra se processado como um aço comum.';
    applicability = {
      wearResistance: 'Ideal para revestimentos de calhas, bicas de mineração, caçambas de terraplenagem, equipamentos agrícolas e liners de misturadores.',
      bendingAlert: '⚠️ ALERTA CRÍTICO: Materiais com dureza acima de 250 HB possuem baixíssima ductilidade e alto risco de quebra catastrófica se submetidos a dobras com raios padrão.',
      machining: 'Exigirá ferramentas de metal duro (pastilhas de Wídia) e velocidades de corte reduzidas devido à alta dureza superficial.'
    };
  } else {
    let score = 100;
    const { C, Mn, Mo } = extracted.elements;
    if (C !== null) score -= Math.abs(C - 0.18) * 100;
    if (Mn !== null) score -= Math.abs(Mn - 0.71) * 10;
    if (Mo !== null) score -= Math.abs(Mo - 0.28) * 50;
    compatibilityIndex = Math.max(0, Math.min(100, Math.round(score)));

    const isGoodForWelding = ce < 0.40;
    const isGoodForBending = (extracted.elements.Cr || 0) < 0.10;

    applicability = {
      wearResistance: 'Baixa resistência ao desgaste abrasivo.',
      bendingAlert: isGoodForBending ? '✅ Excelente para Dobra' : '⚠️ Requer atenção na dobra',
      machining: isGoodForWelding ? '✅ Excelente Soldabilidade' : '⚠️ Requer cuidados na soldagem'
    };
  }

  return {
    ...extracted,
    ce,
    compatibilityIndex,
    justification,
    applicability
  };
};
