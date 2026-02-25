
# Ajuste do Parecer IA com Base no CE (Carbono Equivalente)

## Resumo

Alterar o prompt da edge function `extract-certificate` para que o parecer tecnico (aiInsights) considere a faixa do Carbono Equivalente (CE) ao avaliar o material, complementando as regras ja existentes de HB sem gerar contradicoes.

## Logica atualizada do aiInsights

O prompt sera reestruturado com 3 cenarios claros quando hbValue for null:

| Faixa CE | Orientacao |
|----------|-----------|
| CE <= 0,40 | Enfatizar excelentes caracteristicas para dobra, usinagem e solda. Material de facil processamento. |
| 0,40 < CE <= 0,44 | Alertar que a dureza pode estar um pouco acima do habitual. Recomendar cuidados nos processos de dobra, usinagem e solda. |
| CE > 0,44 | Enfatizar dureza elevada. Processos especiais necessarios: pre-aquecimento na soldagem, ferramentas especificas para usinagem, dobra a quente. |

Quando hbValue for detectado, a regra existente permanece prioritaria (material tratado termicamente, improprio para processos convencionais).

## Prevencao de contradicoes

O prompt incluira uma regra explicita: quando hbValue estiver presente, o parecer sobre CE nao se aplica, pois o tratamento termico ja domina as propriedades mecanicas. Isso evita que a IA diga "excelente para dobra" em um aco com HB 400.

## Detalhes tecnicos

### Arquivo: `supabase/functions/extract-certificate/index.ts`

Substituir o bloco do item 5 do prompt (linhas 87-99) pela nova versao com as 3 faixas de CE. A instrucao pedira que a IA calcule o CE internamente (C + Mn/6 + (Cr+Mo+V)/5 + (Cu+Ni)/15) para determinar a faixa e ajustar o tom do parecer.

Trecho atualizado do prompt:

```
5. Um parecer tecnico (aiInsights) em portugues. Siga estas regras na ordem:

   REGRA 1 - Se hbValue for detectado:
   PRIORIZE o fato de ser um aco tratado termicamente.
   Explique que a alta dureza (HB) altera completamente as propriedades mecanicas,
   tornando o material improprio para dobra e usinagem convencional,
   independentemente da composicao quimica aparentemente favoravel.
   Indique as aplicacoes corretas (desgaste, mineracao, revestimentos).
   NAO mencione recomendacoes de dobra, solda ou usinagem convencional.

   REGRA 2 - Se hbValue for null, calcule o Carbono Equivalente (CE):
   CE = C + Mn/6 + (Cr+Mo+V)/5 + (Cu+Ni)/15
   E aplique a faixa correspondente:

   a) CE <= 0,40: Enfatize que o material possui otimas caracteristicas
      para dobra, usinagem e solda. Destaque a facilidade de processamento
      e as aplicacoes praticas (estrutural, caldeiraria, etc).

   b) CE entre 0,40 e 0,44: Alerte que o material pode apresentar dureza
      um pouco acima do habitual para processos de dobra, usinagem e solda.
      Recomende que alguns cuidados sejam tomados nestes processos.

   c) CE acima de 0,44: Enfatize que o material possui dureza elevada e
      podera ser dobrado, soldado e usinado somente por processos especiais,
      como pre-aquecimento na soldagem, uso de ferramentas especificas
      para usinagem e dobra a quente.

   Em todos os casos da REGRA 2, NAO mencione tratamento termico, tempera
   ou ausencia de HB. Foque na composicao quimica e seus efeitos praticos.

   - Breve explicacao do papel dos elementos quimicos que se destacam
   - NAO repita valores numericos, percentuais ou status ja visiveis nos outros campos
   - Seja conciso (3-4 frases) e focado em informacoes uteis para tomada de decisao
```

Nenhum outro arquivo precisa ser alterado, pois a mudanca e exclusivamente no prompt enviado a IA.
