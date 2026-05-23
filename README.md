# Controle Financeiro Pessoal

Aplicativo web estatico para controle financeiro pessoal manual, com login local, receitas, despesas, cartoes, metas, planejamento mensal, relatorios, blog e area de dados pessoais.

## Recursos

- Login, cadastro e recuperacao de senha por frase de seguranca.
- Dados separados por usuario no armazenamento local do navegador.
- Cadastro manual de receitas, despesas, cartoes, compras parceladas, metas e orcamentos.
- Area de dados pessoais com foto e informacoes basicas.
- Relatorios visuais em canvas.
- Exportacao manual em CSV.
- Layout responsivo para desktop, tablet e celular.

## Como usar

Abra o arquivo `index.html` em um navegador moderno. O app nao solicita CPF, dados bancarios, senhas de banco, Open Finance ou conexao automatica com instituicoes financeiras.

## Publicacao

Versao publicada no Google Sites:

https://sites.google.com/view/cfp-login-230526

## Arquivos principais

- `index.html`: estrutura do app.
- `styles.css`: identidade visual e responsividade.
- `app.js`: regras de negocio, persistencia local e graficos.
- `controle-financeiro-pessoal.html`: versao embutida para Google Sites.
- `build-embed.mjs`: gera a versao embutida.
