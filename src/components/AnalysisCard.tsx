import React from 'react';
import { AnalysisResult, Status } from '@/types';
import { getElementStatus } from '@/utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, XCircle, Flame, Wrench, Shapes } from 'lucide-react';

interface AnalysisCardProps {
  result: AnalysisResult;
}

const statusConfig: Record<Status, { label: string; className: string; icon: React.ReactNode }> = {
  SAFE: { label: 'SEGURO', className: 'bg-safe text-safe-foreground', icon: <Shield className="h-3.5 w-3.5" /> },
  WARNING: { label: 'ATENÇÃO', className: 'bg-warning text-warning-foreground', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  CRITICAL: { label: 'CRÍTICO', className: 'bg-critical text-critical-foreground', icon: <XCircle className="h-3.5 w-3.5" /> },
};

const ElementPill: React.FC<{ label: string; value: number | null; status: Status }> = ({ label, value, status }) => {
  const cfg = statusConfig[status];
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
      status === 'CRITICAL' ? 'bg-critical/10' : status === 'WARNING' ? 'bg-warning/10' : 'bg-muted'
    }`}>
      <span className="font-mono font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono tabular-nums">{value !== null ? value.toFixed(4) : '—'}</span>
        <div className={`h-2 w-2 rounded-full ${
          status === 'CRITICAL' ? 'bg-critical' : status === 'WARNING' ? 'bg-warning' : 'bg-safe'
        }`} />
      </div>
    </div>
  );
};

const AnalysisCard: React.FC<AnalysisCardProps> = ({ result }) => {
  const ceStatus = getElementStatus('CE', result.ce);
  const ceCfg = statusConfig[ceStatus];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold tracking-tight">
            Corrida {result.heatNumber}
          </CardTitle>
          <div className="flex items-center gap-2">
            {result.hbValue !== null && (
              <Badge variant="outline" className="border-critical/30 text-critical font-mono text-xs">
                HB {result.hbValue}
              </Badge>
            )}
            <Badge className={`${ceCfg.className} gap-1`}>
              {ceCfg.icon}
              CE: {result.ce.toFixed(3)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 mt-1.5">
          <Badge variant="secondary" className="text-xs">{result.materialGrade}</Badge>
          <Badge variant="secondary" className="text-xs">{result.dimensions}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chemical Composition Grid */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Composição Química</p>
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
        </div>

        {/* Compatibility Index */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Índice de Compatibilidade A36</p>
          <div className="relative h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                result.compatibilityIndex > 70 ? 'bg-safe' : result.compatibilityIndex > 40 ? 'bg-warning' : 'bg-critical'
              }`}
              style={{ width: `${result.compatibilityIndex}%` }}
            />
          </div>
          <p className="text-right text-xs font-mono mt-1 text-muted-foreground">{result.compatibilityIndex}%</p>
        </div>

        {/* Applicability */}
        {result.applicability && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
              <Flame className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">Desgaste</p>
                <p className="text-xs text-muted-foreground mt-0.5">{result.applicability.wearResistance}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
              <Shapes className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">Dobra</p>
                <p className="text-xs text-muted-foreground mt-0.5">{result.applicability.bendingAlert || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
              <Wrench className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">Usinagem / Solda</p>
                <p className="text-xs text-muted-foreground mt-0.5">{result.applicability.machining}</p>
              </div>
            </div>
          </div>
        )}

        {/* Justification */}
        {result.justification && (
          <div className="border border-critical/20 bg-critical/5 rounded-lg p-3">
            <p className="text-xs font-medium text-critical mb-1">⚠️ Alerta Técnico</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{result.justification}</p>
          </div>
        )}

        {/* AI Insights */}
        {result.aiInsights && (
          <div className="border border-primary/20 bg-primary/5 rounded-lg p-3">
            <p className="text-xs font-medium text-primary mb-1">🤖 Parecer IA</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{result.aiInsights}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisCard;
