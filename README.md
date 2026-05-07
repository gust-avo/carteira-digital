# Carteira Digital Senaibank

Aplicacao full-stack de carteira digital com API REST em Node.js/Express, SQLite/Knex, bcrypt, JWT e frontend em Next.js + React MUI v5.

## Estrutura

```text
backend/
  src/controllers
  src/services
  src/models
  src/middlewares
  src/routes
  src/utils
  src/tests
frontend/
  src/pages
  src/components
  src/services
  src/contexts
  src/utils
  src/theme
```

## Backend

```bash
cd backend
npm install
copy .env.example .env
npm run migrate
npm start
```

Variaveis principais:

```env
PORT=4000
JWT_SECRET=troque-este-segredo
DATABASE_URL=./data/carteira.sqlite
CORS_ORIGIN=http://localhost:3000
```

Testes:

```bash
cd backend
npm test
```

Endpoints:

```http
POST /api/auth/register
POST /api/auth/login
GET /api/contas
POST /api/contas
PUT /api/contas/:id/usuario
DELETE /api/contas/:id
POST /api/contas/:id/deposito
POST /api/contas/:id/saque
POST /api/transferencia
GET /api/contas/:id/saldo
GET /api/contas/:id/extrato
```

## Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Variavel principal:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Acesse `http://localhost:3000`.

## Regras Implementadas

- Cadastro e login com senha criptografada por bcrypt e token JWT valido por 1 dia.
- Rotas protegidas por middleware de autenticacao.
- CPF com formato aceito `000.000.000-00` ou apenas numeros, validado por digitos verificadores.
- Email e campos de texto validados.
- Valores monetarios tratados em centavos, entre R$ 0,01 e R$ 1.000.000,00 nas operacoes.
- Deposito, saque, transferencia, saldo e extrato.
- Exclusao de conta bloqueada quando ha saldo positivo ou movimentacoes.
- Frontend protegido por token salvo no `localStorage`, com dashboard, cards de conta, modais e notificacoes.
