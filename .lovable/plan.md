

# O resultado exibido e de uma analise anterior (cache)

## Diagnostico

Os logs da edge function mostram que ela foi reimplantada com sucesso (boots recentes), mas **nenhuma chamada foi feita** apos o deploy. Isso significa que o resultado exibido na tela (com "Carbono Equivalente de 0.59") foi gerado pela versao anterior do prompt, que ainda continha a formula de CE.

O codigo atual do prompt ja esta correto — nao contem formula de CE nem instrucao para calcular.

## Acao necessaria

**Nenhuma alteracao de codigo e necessaria.** Basta reprocessar o certificado:

1. Faca upload novamente do certificado Usiminas (corrida 717721)
2. A nova analise usara o prompt atualizado, que proibe qualquer mencao a CE
3. O parecer da IA deve focar apenas na composicao quimica de forma qualitativa

## Por que o valor antigo ainda aparece

Os resultados da analise sao gerados em tempo real a cada upload — nao ha persistencia. Porem, se voce nao fez um novo upload apos a correcao, o resultado exibido e o da ultima analise (feita com o prompt antigo).

