# Scanner de Documentos

Aplicacao web simples para cadastro e acompanhamento de documentos digitalizados. O projeto foi desenvolvido para apoiar um trabalho academico de Engenharia de Software III, com foco em plano e execucao de testes de uma aplicacao.

## Objetivo

Permitir que usuarios cadastrem documentos, acompanhem o status de digitalizacao, pesquisem registros, filtrem por status e removam itens. A aplicacao tambem possui validacoes basicas para possibilitar cenarios de testes funcionais, entradas invalidas, evidencias com prints e verificacao de responsividade.

## Tecnologias usadas

- React
- TypeScript
- Vite
- CSS
- localStorage

## Como rodar o projeto

Instale as dependencias:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Gere a versao de producao:

```bash
npm run build
```

Visualize a build localmente:

```bash
npm run preview
```

## Principais funcionalidades

- Cadastro de documento com nome, tipo, data, status e arquivo.
- Validacao de campos obrigatorios.
- Validacao de upload para arquivos PDF, PNG, JPG ou JPEG.
- Listagem de documentos cadastrados.
- Pesquisa por nome do documento.
- Filtro por status: todos, digitalizado ou pendente.
- Exclusao de documentos.
- Cards de resumo com total, digitalizados e pendentes.
- Dados iniciais de exemplo.
- Persistencia no localStorage para manter os registros apos atualizar a pagina.
- Layout responsivo para telas menores.
