
# Correcao: Drawer de Comprar Creditos cortado no mobile

## Problema

O Drawer no mobile esta com o conteudo transbordando horizontalmente -- os precos e cartoes de pacote sao cortados na lateral direita. Isso acontece porque:

1. Os itens de pacote usam `justify-between` com conteudo que nao quebra linha, forçando o layout alem da largura da tela
2. O `DrawerContent` tem `px-4` mas os elementos internos nao tem `overflow-hidden` nem restricao de largura

## Solucao

Modificar `src/components/BuyCreditsDialog.tsx`:

1. Adicionar `overflow-hidden` ao `DrawerContent` para evitar transbordamento
2. Nos itens de pacote (`PackageList`), adicionar `min-w-0` e `overflow-hidden` para que o conteudo flexivel respeite os limites do container
3. Reduzir padding e gap nos itens para mobile, usando classes responsivas
4. Adicionar `truncate` ou `text-sm` nos precos para garantir que caibam na tela

## Detalhes tecnicos

### `src/components/BuyCreditsDialog.tsx`

**PackageList** -- ajustar os botoes de pacote para respeitar a largura do container:

- No `button` de cada pacote: adicionar `w-full min-w-0 overflow-hidden`
- No `div` que contem icone + texto (`flex items-center gap-3`): adicionar `min-w-0 flex-1`
- No `div` que contem preco + icone de cartao: adicionar `shrink-0` para nao encolher, mas usar `text-sm` no preco para caber
- Reduzir padding do botao de `p-4` para `p-3`

**DrawerContent** -- adicionar `overflow-hidden` para conter todo o conteudo:

```
<DrawerContent className="px-4 pb-6 overflow-hidden">
```

Essas mudancas garantem que o conteudo do Drawer fique dentro dos limites da tela em qualquer dispositivo mobile.
