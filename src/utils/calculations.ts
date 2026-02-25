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
    hbSource?: string | null;
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
    justification = 'Este material possui tratamento térmico de têmpera, tornando-o uma classe superior de resistência ao desgaste. Apesar da composição química poder parecer favorável, a alta dureza superficial resultará em sérios problemas de usinagem e risco de quebra na dobra se processado como um aço comum.';
    applicability = {
      wearResistance: 'Ideal para revestimentos de calhas, bicas de mineração, caçambas de terraplenagem, equipamentos agrícolas e liners de misturadores.',
      bendingAlert: '⚠️ ALERTA CRÍTICO: Materiais com dureza acima de 250 HB possuem baixíssima ductilidade e alto risco de quebra catastrófica se submetidos a dobras com raios padrão.',
      machining: 'Exigirá ferramentas de metal duro (pastilhas de Wídia) e velocidades de corte reduzidas devido à alta dureza superficial.'
    };
  } else {
    const scoreElement = (val: number | null, maxSafe: number, maxRange: number): number => {
      if (val === null) return 1;
      if (val <= maxSafe) return 1;
      if (val >= maxRange) return 0;
      return 1 - (val - maxSafe) / (maxRange - maxSafe);
    };

    const scoreCE = scoreElement(ce, 0.40, 0.60);
    const scoreC  = scoreElement(extracted.elements.C, 0.22, 0.35);
    const scoreMn = scoreElement(extracted.elements.Mn, 1.00, 1.60);
    const scoreP  = scoreElement(extracted.elements.P, 0.030, 0.050);
    const scoreS  = scoreElement(extracted.elements.S, 0.020, 0.050);

    const weightedScore = (scoreCE * 5) + (scoreC * 2) + (scoreMn * 2) + (scoreP * 0.5) + (scoreS * 0.5);
    compatibilityIndex = Math.round((weightedScore / 10) * 1000);

    let bendingAlert: string;
    let machining: string;

    if (ce <= 0.40) {
      bendingAlert = '✅ Excelente para Dobra';
      machining = '✅ Excelente Soldabilidade';
    } else if (ce <= 0.44) {
      bendingAlert = '⚠️ Requer cuidados na dobra';
      machining = '⚠️ Requer cuidados na soldagem';
    } else {
      bendingAlert = '🔴 Dobra somente a quente com processos especiais';
      machining = '🔴 Soldagem somente com pré-aquecimento e processos especiais';
    }

    applicability = {
      wearResistance: 'Baixa resistência ao desgaste abrasivo.',
      bendingAlert,
      machining
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
