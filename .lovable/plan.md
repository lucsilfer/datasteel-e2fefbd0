
# Eliminar calculo de CE do prompt da IA

## Problema confirmado

O certificado Usiminas (corrida 717721) tem:
- C=0,06 | Mn=1,64 | Cr=0,18 | Mo=0,00 | V=0,005 | Cu=0,25 | Ni=0,27
- CE correto (frontend): **0,405**
- CE errado (IA): **0,59** — a IA usa formula diferente ou inclui elementos extras

A causa raiz: o prompt pede explicitamente "calcule o Carbono Equivalente (CE): CE = C + Mn/6 + ..." (linha 97-98). Isso incentiva a IA a calcular e citar o valor, mesmo com proibicoes.

## Solucao

Remover completamente a formula de CE e qualquer referencia a "Carbono Equivalente" do prompt. Substituir por instrucoes qualitativas baseadas nos elementos quimicos.

## Alteracao

### Arquivo: `supabase/functions/extract-certificate/index.ts`

Substituir linhas 97-128 (REGRA 2 inteira) por:

```text
REGRA 2 - Se hbValue for null:
Avalie a composicao quimica de forma qualitativa.
NAO calcule nem mencione Carbono Equivalente, CE ou qualquer indice numerico.
O CE ja e calculado e exibido separadamente pela interface.

Defina o tom do parecer com base na composicao:
a) Se C <= 0,22 e Mn <= 1,00 e sem elementos de liga significativos:
   Enfatize que o material possui otimas caracteristicas para dobra, usinagem e solda.
   Destaque a facilidade de processamento e as aplicacoes praticas.

b) Se C entre 0,22 e 0,25 ou Mn entre 1,00 e 1,40:
   Alerte que o material pode requerer alguns cuidados nos processos
   de dobra, usinagem e soldagem.

c) Se C > 0,25 ou Mn > 1,40 ou presenca significativa de Cr/Mo:
   Enfatize que processos especiais serao necessarios
   (pre-aquecimento na soldagem, ferramentas especificas, dobra a quente).

Em todos os casos:
- Foque na composicao quimica e seus efeitos praticos
- Breve explicacao do papel dos elementos que se destacam
- NAO mencione tratamento termico, tempera ou ausencia de HB
- NAO repita valores numericos, percentuais ou status ja visiveis nos outros campos
- NAO calcule nem mencione CE, Carbono Equivalente ou qualquer indice
- Seja conciso (3-4 frases) e focado em informacoes uteis para tomada de decisao
```

Nenhum outro arquivo precisa ser alterado. A edge function sera reimplantada automaticamente.
