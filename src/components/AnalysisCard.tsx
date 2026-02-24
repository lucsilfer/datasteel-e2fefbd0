import React from 'react';
import { AnalysisResult, Status } from '@/types';
import { getElementStatus } from '@/utils/calculations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, AlertTriangle, XCircle, Flame, Wrench, Shapes, Brain, FlaskConical } from 'lucide-react';

interface AnalysisCardProps {
  result: AnalysisResult;
  index: number;
}

const statusConfig: Record<Status, { label: string; className: string; icon: React.ReactNode }> = {
  SAFE: { label: 'SEGURO', className: 'bg-safe text-safe-foreground', icon: <Shield className="h-3.5 w-3.5" /> },
  WARNING: { label: 'ATENÇÃO', className: 'bg-warning text-warning-foreground', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  CRITICAL: { label: 'CRÍTICO', className: 'bg-critical text-critical-foreground', icon: <XCircle className="h-3.5 w-3.5" /> },
};

const ElementPill: React.FC<{ label: string; value: number | null; status: Status }> = ({ label, value, status }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
          status === 'CRITICAL' ? 'bg-critical/10 border border-critical/20' : status === 'WARNING' ? 'bg-warning/10 border border-warning/20' : 'bg-muted/60 border border-border/50'
        }`}>
          <span className="font-mono font-bold text-foreground text-xs">{label}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono tabular-nums text-xs">{value !== null ? value.toFixed(4) : '—'}</span>
            <div className={`h-2.5 w-2.5 rounded-full ${
              status === 'CRITICAL' ? 'bg-critical animate-pulse' : status === 'WARNING' ? 'bg-warning' : 'bg-safe'
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
    <Card
      className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              <TooltipContent>Dureza Brinell detectada</TooltipContent>
            </Tooltip>
          )}
          <Badge className={`${ceCfg.className} gap-1.5 px-3 py-1`}>
            {ceCfg.icon}
            CE: {result.ce.toFixed(3)}
          </Badge>
        </div>
      </div>

      <CardContent className="px-6 pb-5">
        <Tabs defaultValue="composition" className="w-full">
          <TabsList className="w-full bg-muted/50 p-1 h-auto rounded-xl mb-4">
            <TabsTrigger value="composition" className="flex-1 gap-1.5 text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm py-2">
              <FlaskConical className="h-3.5 w-3.5" />
              Composição
            </TabsTrigger>
            <TabsTrigger value="applicability" className="flex-1 gap-1.5 text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm py-2">
              <Wrench className="h-3.5 w-3.5" />
              Aplicabilidade
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex-1 gap-1.5 text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm py-2">
              <Brain className="h-3.5 w-3.5" />
              Parecer IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="composition" className="space-y-4 mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {(Object.keys(result.elements) as Array<keyof typeof result.elements>).map((el) => (
                <ElementPill
                  key={el}
                  label={el}
                  value={result.elements[el]}
                  status={getElementStatus(el, result.elements[el])}
                />
              ))}
            </div>

            {/* Compatibility Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Compatibilidade A36</p>
                <span className="text-sm font-bold font-mono text-foreground">{result.compatibilityIndex}%</span>
              </div>
              <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
                    result.compatibilityIndex > 70
                      ? 'bg-gradient-to-r from-safe/80 to-safe'
                      : result.compatibilityIndex > 40
                        ? 'bg-gradient-to-r from-warning/80 to-warning'
                        : 'bg-gradient-to-r from-critical/80 to-critical'
                  }`}
                  style={{ width: `${result.compatibilityIndex}%` }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="applicability" className="mt-0">
            {result.applicability ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 bg-muted/40 rounded-xl p-4 border border-border/30">
                  <Flame className="h-5 w-5 mt-0.5 text-accent shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Desgaste</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{result.applicability.wearResistance}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-muted/40 rounded-xl p-4 border border-border/30">
                  <Shapes className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Dobra</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{result.applicability.bendingAlert || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-muted/40 rounded-xl p-4 border border-border/30">
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
              <div className="border border-critical/20 bg-critical/5 rounded-xl p-4 mt-3">
                <p className="text-xs font-semibold text-critical mb-1.5">⚠️ Alerta Técnico</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{result.justification}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            {result.aiInsights ? (
              <div className="border border-primary/20 bg-primary/5 rounded-xl p-4">
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
      </CardContent>
    </Card>
  );
};

export default AnalysisCard;
