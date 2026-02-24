

# Corrigir Falsos Positivos de HB + Rastreabilidade

## Problema

O modelo de IA esta retornando valores de HB (Dureza Brinell) em certificados que nao possuem essa informacao. Isso acontece porque o prompt atual "incentiva" a deteccao de HB com frases como "MONITORE RIGOROSAMENTE" e "Priorize a varredura", fazendo o modelo alucinar valores. Alem disso, quando HB e detectado (corretamente ou nao), nao ha rastreabilidade mostrando de onde no certificado o valor foi extraido.

## Solucao

Duas mudancas principais:

### 1. Refinar o prompt da edge function para reduzir falsos positivos

Reformular as instrucoes sobre HB para serem mais restritivas:
- Remover linguagem que incentiva a deteccao ("MONITORE RIGOROSAMENTE", "Priorize")
- Adicionar instrucoes explicitas de que HB so deve ser extraido se houver uma coluna/campo dedicado de dureza no certificado com a unidade "HB" ou "Brinell" claramente rotulada
- Instruir o modelo a retornar `null` na duvida
- Adicionar um campo `hbSource` para o modelo informar de onde extraiu o valor (ex: "Campo 'Dureza Brinell' na tabela de propriedades mecanicas" ou null se nao encontrou)

### 2. Adicionar campo de rastreabilidade `hbSource`

- Adicionar `hbSource: string | null` ao schema da tool call na edge function
- Adicionar `hbSource` ao tipo `AnalysisResult` em `src/types/index.ts`
- Propagar o campo pelo `performTechnicalAnalysis`
- Exibir no `AnalysisCard` junto ao badge de HB: mostrar de onde o valor foi extraido

## Detalhes Tecnicos

### Arquivos modificados:

1. **`supabase/functions/extract-certificate/index.ts`**
   - Reescrever a secao do prompt sobre HB para ser mais conservadora
   - Adicionar `hbSource` ao schema da tool call (string, nullable)
   - Adicionar `hbSource` aos campos required

2. **`src/types/index.ts`**
   - Adicionar `hbSource?: string | null` a `AnalysisResult`

3. **`src/utils/calculations.ts`**
   - Propagar `hbSource` do input para o output em `performTechnicalAnalysis`

4. **`src/components/AnalysisCard.tsx`**
   - No tooltip do badge HB, mostrar `result.hbSource` como origem do dado
   - Se `hbSource` estiver presente, exibir no alerta tecnico da aba Aplicabilidade

### Prompt revisado (trecho HB):

```
3. Dureza Brinell (HB): Procure EXCLUSIVAMENTE por um campo, coluna ou secao 
   dedicada a "Dureza", "Hardness", "HB" ou "Brinell" no certificado. 
   - SOMENTE extraia o valor numerico se existir um campo ROTULADO explicitamente 
     com a unidade HB ou Brinell (ex: "Dureza: 280 HB", coluna "HB" com valor 400).
   - NAO confunda valores de Limite de Escoamento (LE/YS), Limite de Resistencia 
     (LR/TS), Alongamento ou outros ensaios mecanicos com dureza HB.
   - Se nao houver um campo especifico de dureza HB no certificado, retorne 
     hbValue como null e hbSource como null.
   - Se encontrar, informe em hbSource a localizacao exata (ex: "Coluna 'Dureza 
     Brinell' na tabela de propriedades mecanicas").
```

