
# Botao Imprimir Relatorio de Analise

## Resumo

Adicionar um botao "Imprimir Relatorio" ao lado do botao "Nova Analise" no Dashboard. Ao clicar, uma nova janela sera aberta com um relatorio formatado para impressao contendo todas as informacoes da analise, com cabecalho, rodape e o mesmo padrao visual dos cards.

## Arquivos a criar/modificar

### 1. Criar `src/components/PrintReport.tsx`

Componente que recebe o array de `AnalysisResult` e gera o HTML do relatorio para impressao. Usara `window.open()` + `document.write()` para criar uma pagina de impressao dedicada.

**Conteudo do relatorio:**
- **Cabecalho**: Icone FlaskConical (como SVG inline) + "DataSteel" + subtitulo "Analise Inteligente de Certificados" + data/hora da consulta
- **Para cada corrida**, um bloco visual replicando o card:
  - Numero da corrida, material grade, dimensoes
  - Badge CE com cor conforme status
  - Badge HB (se existir)
  - Gauge DS como barra horizontal (mais adequado para impressao que o circular)
  - Grid com todos os elementos quimicos e seus status (com bolinhas coloridas)
  - Secao Aplicabilidade (desgaste, dobra, usinagem/solda)
  - Alerta tecnico (se existir)
  - Parecer IA (se existir)
- **Rodape**: "datasteel.com.br" + texto convite: "Analise seus certificados de aco com inteligencia artificial. Acesse datasteel.com.br e experimente gratuitamente."

**Estilo**: CSS inline embutido na pagina de impressao, replicando as cores do sistema:
- Verde (safe): `#16a34a`
- Amarelo (warning): `#eab308`
- Vermelho (critical): `#ef4444`
- Azul primario: `#3b82f6`
- Azul escuro (secondary/header): `hsl(215, 50%, 23%)`
- Fundo cinza claro, cards brancos com borda

### 2. Modificar `src/pages/Dashboard.tsx`

- Importar o componente/funcao de impressao
- Adicionar botao "Imprimir Relatorio" (icone `Printer`) ao lado de "Nova Analise" na barra de acoes dos resultados

## Detalhes tecnicos

A abordagem usara `window.open()` para criar uma janela separada com HTML/CSS dedicado a impressao. Isso garante:
- Controle total do layout de impressao sem afetar a tela
- CSS `@media print` para ocultar botoes e ajustar margens
- Chamada automatica de `window.print()` apos carregar
- Todas as abas (composicao, aplicabilidade, parecer IA) aparecerao expandidas no relatorio, sem tabs
