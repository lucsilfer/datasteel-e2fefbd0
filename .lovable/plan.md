

# Melhorias: Parecer IA com contexto HB + Reordenacao de Elementos

## Problema 1: Parecer IA ignora contexto de dureza HB

Atualmente o prompt instrui a IA a falar sobre composicao quimica e aplicabilidade, mas **nao menciona que deve considerar o valor de HB** na analise. Materiais com tratamento termico (HB) mudam completamente o comportamento mecanico -- mesmo com composicao quimica favoravel, a alta dureza invalida conclusoes baseadas apenas nos elementos.

### Solucao

Reescrever o item 5 do prompt em `supabase/functions/extract-certificate/index.ts` para incluir instrucao explicita:

```
5. Um parecer técnico (aiInsights) em português com foco em:
   - Se hbValue for detectado: PRIORIZE o fato de ser um aço tratado termicamente.
     Explique que a alta dureza (HB) altera completamente as propriedades mecânicas,
     tornando o material impróprio para dobra e usinagem convencional, 
     independentemente da composição química aparentemente favorável.
     Indique as aplicações corretas (desgaste, mineração, revestimentos).
   - Se hbValue for null: foque na aplicabilidade prática baseada na composição
     (estrutural, naval, caldeiraria, vasos de pressão, etc)
   - Breve explicação do papel dos elementos químicos que se destacam
   - NÃO repita valores numéricos, percentuais ou status já visíveis nos outros campos
   - Seja conciso (3-4 frases) e focado em informações úteis para tomada de decisão
```

Isso garante que quando o material e HB, a IA destaca o tratamento termico como fator dominante.

---

## Problema 2: Ordem dos elementos quimicos

Atualmente o `Object.keys()` retorna os elementos na ordem da interface `ChemicalElements` (C, Si, Mn, P, S, Cr, Mo, Ni, Cu, V). O usuario quer a ordem por relevancia tecnica:

**C, Mn, S, P, Si, Cr, Mo, Cu, Ni, V**

### Solucao

Em `src/components/AnalysisCard.tsx`, substituir `Object.keys(result.elements)` por um array fixo com a ordem desejada:

```typescript
const ELEMENT_ORDER: Array<keyof ChemicalElements> = ['C', 'Mn', 'S', 'P', 'Si', 'Cr', 'Mo', 'Cu', 'Ni', 'V'];
```

E usar esse array no mapeamento em vez de `Object.keys()`.

---

## Arquivos modificados

1. **`supabase/functions/extract-certificate/index.ts`** (linhas 50-54)
   - Reescrever instrucao do `aiInsights` para considerar HB como fator dominante quando presente

2. **`src/components/AnalysisCard.tsx`** (linhas 132-140)
   - Criar constante `ELEMENT_ORDER` com a sequencia correta
   - Substituir `Object.keys(result.elements)` por `ELEMENT_ORDER`
