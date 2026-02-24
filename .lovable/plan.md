

# Corrigir Deteccao de HB em Nomes de Grau do Material

## Problema

O certificado USIMINAS "NTU HB.pdf" tem o grau de material **NRU-CG-QC-HB-320**, onde o valor de dureza Brinell (320 HB) esta embutido no nome do grau. O prompt atual instrui a IA a procurar SOMENTE campos dedicados/rotulados de dureza, ignorando completamente esse padrao comum em acos de dureza especificada.

O resultado atual retorna `hbValue: null` e `hbSource: null` -- o valor HB nao foi reconhecido.

## Solucao

Expandir a instrucao de deteccao de HB no prompt da edge function para incluir **3 fontes validas**:

1. Campo ou coluna dedicada de dureza (ja coberto)
2. Valor HB embutido no nome/grau do material (ex: "HB-320", "HB 400" no campo Qualidade/Steel Grade)
3. Tabela de ensaios mecanicos com coluna "HB" ou "Dureza Brinell"

## Detalhes Tecnicos

### Arquivo modificado: `supabase/functions/extract-certificate/index.ts`

Reescrever a instrucao 3 (Dureza Brinell) no prompt para:

```
3. Dureza Brinell (HB): Procure o valor de HB nas seguintes fontes, em ordem de prioridade:
   a) Campo, coluna ou secao dedicada a "Dureza", "Hardness", "HB" ou "Brinell" 
      (ex: "Dureza: 280 HB", coluna "HB" com valor 400).
   b) Valor HB embutido no nome/grau do material (Qualidade/Steel Grade). 
      Exemplo: "NRU-CG-QC-HB-320" contem HB 320.
      Se o grau contem "HB" seguido de um numero (ex: HB-320, HB320, HB 400), 
      extraia esse numero como hbValue.
   c) Tabela de ensaios mecanicos com coluna especifica de dureza.
   
   REGRAS:
   - NAO confunda LE/YS, LR/TS, Alongamento ou outros ensaios com dureza HB.
   - Se encontrar, informe em hbSource a localizacao exata 
     (ex: "Grau do material 'NRU-CG-QC-HB-320'" ou "Coluna 'Dureza Brinell'").
   - Se NAO encontrar em nenhuma das fontes acima, retorne hbValue e hbSource como null.
   - NA DUVIDA, retorne null.
```

Nenhum outro arquivo precisa ser modificado -- o frontend ja exibe hbValue e hbSource corretamente quando presentes.

