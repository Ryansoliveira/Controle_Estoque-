# Sistema de Controle de Estoque

Aplicação web acadêmica de CRUD de produtos e fornecedores, API REST, arquivos JSON e consulta de CNPJ na BrasilAPI. Feita com Node.js nativo, NPM, HTML, CSS e JavaScript, sem frameworks ou dependências externas.

## Executar
Requisitos: Node.js 18+ e NPM.
```bash
npm start
```
Abra http://localhost:3333. Para desenvolvimento use `npm run dev`.

## Funcionalidades
- CRUD de produtos e fornecedores com UUID.
- Produto vinculado a fornecedor existente.
- CNPJ e código de produto únicos.
- Bloqueio da exclusão de fornecedor que tenha produtos vinculados.
- Busca por nome, filtro por categoria, alerta para quantidade abaixo de cinco e cálculo do valor total do estoque.
- Consulta de CNPJ pela BrasilAPI, preenchimento automático e cadastro manual se falhar.
- Validação de obrigatórios, preço e quantidade não negativos, registros inexistentes e rotas inválidas.
- Confirmação antes de excluir.
- Persistência em `data/produtos.json` e `data/fornecedores.json`.

## Endpoints
| Método | Rota | Uso |
|---|---|---|
| GET | `/api/produtos` | Lista; aceita `?nome=` e `?categoria=` |
| GET | `/api/produtos/:id` | Consulta produto |
| POST | `/api/produtos` | Cadastra produto |
| PUT | `/api/produtos/:id` | Atualiza produto |
| DELETE | `/api/produtos/:id` | Exclui produto |
| GET | `/api/fornecedores` | Lista fornecedores |
| GET | `/api/fornecedores/:id` | Consulta fornecedor |
| POST | `/api/fornecedores` | Cadastra fornecedor |
| PUT | `/api/fornecedores/:id` | Atualiza fornecedor |
| DELETE | `/api/fornecedores/:id` | Exclui fornecedor sem vínculo |
| GET | `/api/brasilapi/cnpj?cnpj=...` | Consulta CNPJ externo |

Os endpoints retornam JSON e utilizam status HTTP 200, 201, 400, 404, 409, 502 e 504 conforme o resultado.

## Demonstração sugerida
1. Cadastre um fornecedor.
2. Cadastre produtos associados.
3. Teste pesquisa, filtro, edição e exclusão.
4. Cadastre um item com quatro unidades para ver o alerta de estoque baixo.
5. Confira o valor total.
6. Tente excluir um fornecedor que possua produto associado.
7. Consulte um CNPJ válido na BrasilAPI. Se indisponível, preencha o fornecedor manualmente.

Os arquivos JSON preservam os dados ao reiniciar o servidor. Faça backup deles antes de apagar ou substituir os dados.
