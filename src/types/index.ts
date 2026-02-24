export interface ChemicalElements {
  C: number | null;
  Si: number | null;
  Mn: number | null;
  P: number | null;
  S: number | null;
  Cr: number | null;
  Mo: number | null;
  Ni: number | null;
  Cu: number | null;
  V: number | null;
}

export interface AnalysisResult {
  heatNumber: string;
  elements: ChemicalElements;
  hbValue: number | null;
  hbSource?: string | null;
  ce: number;
  compatibilityIndex: number;
  dimensions: string;
  materialGrade: string;
  aiInsights?: string;
  justification?: string;
  applicability?: {
    wearResistance: string;
    bendingAlert: string | null;
    machining: string;
  };
}

export type Status = 'SAFE' | 'WARNING' | 'CRITICAL';

export interface ElementStatus {
  value: number;
  status: Status;
  label: string;
  unit: string;
}
