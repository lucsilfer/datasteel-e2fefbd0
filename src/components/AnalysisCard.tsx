import React from 'react';
import { AnalysisResult, Status } from '@/types';
import { getElementStatus } from '@/utils/calculations';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, AlertTriangle, XCircle, Flame, Wrench, Shapes, Brain, FlaskConical } from 'lucide-react';
import { ChemicalElements } from '@/types';

const ELEMENT_ORDER: Array<keyof ChemicalElements> = ['C', 'Mn', 'S', 'P', 'Si', 'Cr', 'Mo', 'Cu', 'Ni', 'V'];

interface AnalysisCardProps {
  result: AnalysisResult;
  index: number;
}

const statusConfig: Record<Status, { label: string; className: string; icon: React.ReactNode }> = {
  SAFE: { label: 'SEGURO', className: 'bg-safe text-safe-foreground', icon: <Shield className="h-3.5 w-3.5" /> },
  WARNING: { label: 'ATENÇÃO', className: 'bg-warning text-warning-foreground', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  CRITICAL: { label: 'CRÍTICO', className: 'bg-critical text-critical-foreground', icon: <XCircle className="h-3.5 w-3.5" /> },
};

const CircularGauge: React.FC<{ value: number }> = ({ value }) => {
  const radius = 40;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value > 70 ? 'hsl(var(--safe))' : value > 40 ? 'hsl(var(--warning))' : 'hsl(var(--critical))';

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold font-mono tabular-nums text-foreground">{value}%</span>
      </div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">A36</p>
    </div>
  );
};

const ElementPill: React.FC<{ label: string; value: number | null; status: Status }> = ({ label, value, status }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors border ${
          status === 'CRITICAL' ? 'bg-critical/5 border-critical/20' : status === 'WARNING' ? 'bg-warning/5 border-warning/20' : 'bg-muted/50 border-border'
        }`}>
          <span className="font-mono font-bold text-foreground text-xs">{label}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono tabular-nums text-xs text-muted-foreground">{value !== null ? value.toFixed(4) : '—'}</span>
            <div className={`h-2.5 w-2.5 rounded-full ${
              status === 'CRITICAL' ? 'bg-critical' : status === 'WARNING' ? 'bg-warning' : 'bg-safe'
            }`} />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{statusConfig[status].label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const AnalysisCard: React.FC<AnalysisCardProps> = ({ result, index }) => {
  const ceStatus = getElementStatus('CE', result.ce);
  const ceCfg = statusConfig[ceStatus];

  return (
    <div
      className="corporate-card overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Corrida {result.heatNumber}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge variant="secondary" className="text-xs font-medium">{result.materialGrade}</Badge>
            <Badge variant="secondary" className="text-xs font-medium">{result.dimensions}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {result.hbValue !== null && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="border-critical/40 text-critical font-mono text-xs font-bold px-3 py-1">
                  HB {result.hbValue}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Dureza Brinell detectada</p>
                {result.hbSource && <p className="text-xs mt-1 opacity-80">Fonte: {result.hbSource}</p>}
              </TooltipContent>
            </Tooltip>
          )}
          <Badge className={`${ceCfg.className} gap-1.5 px-3 py-1`}>
            {ceCfg.icon}
            CE: {result.ce.toFixed(3)}
          </Badge>
        </div>
      </div>

      <div className="px-6 pb-5 pt-4">
        <Tabs defaultValue="composition" className="w-full">
          <TabsList className="w-full bg-muted p-1 h-auto rounded-md mb-4">
            <TabsTrigger value="composition" className="flex-1 gap-1.5 text-xs rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm py-2">
              <FlaskConical className="h-3.5 w-3.5" />
              Composição
            </TabsTrigger>
            <TabsTrigger value="applicability" className="flex-1 gap-1.5 text-xs rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm py-2">
              <Wrench className="h-3.5 w-3.5" />
              Aplicabilidade
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex-1 gap-1.5 text-xs rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm py-2">
              <Brain className="h-3.5 w-3.5" />
              Parecer IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="composition" className="space-y-4 mt-0">
            <div className="flex gap-5 items-center">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 flex-1">
                {ELEMENT_ORDER.map((el) => (
                  <ElementPill
                    key={el}
                    label={el}
                    value={result.elements[el]}
                    status={getElementStatus(el, result.elements[el])}
                  />
                ))}
              </div>
              <div className="relative flex items-center justify-center shrink-0">
                <CircularGauge value={result.compatibilityIndex} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="applicability" className="mt-0">
            {result.applicability ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 bg-muted/50 rounded-md p-4 border border-border">
                  <Flame className="h-5 w-5 mt-0.5 text-warning shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Desgaste</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{result.applicability.wearResistance}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-muted/50 rounded-md p-4 border border-border">
                  <Shapes className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Dobra</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{result.applicability.bendingAlert || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-muted/50 rounded-md p-4 border border-border">
                  <Wrench className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Usinagem / Solda</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{result.applicability.machining}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Sem dados de aplicabilidade</p>
            )}

            {result.justification && (
              <div className="border border-critical/20 bg-critical/5 rounded-md p-4 mt-3">
                <p className="text-xs font-semibold text-critical mb-1.5">⚠️ Alerta Técnico</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{result.justification}</p>
                {result.hbSource && (
                  <p className="text-xs text-muted-foreground mt-2 italic">📍 Origem HB: {result.hbSource}</p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            {result.aiInsights ? (
              <div className="border border-primary/20 bg-primary/5 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold text-primary">Parecer da IA</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.aiInsights}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Sem parecer disponível</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalysisCard;
