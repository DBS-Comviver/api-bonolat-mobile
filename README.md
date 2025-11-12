# Mobile Backend Base

Backend base escalável e modular para aplicações mobile, construído com Node.js, TypeScript, Express, Prisma e PostgreSQL.

## 🚀 Características

- ✅ Arquitetura modular e escalável
- ✅ Autenticação JWT com sessões
- ✅ Validação de dados com Zod
- ✅ Banco de dados com Prisma ORM
- ✅ Testes automatizados com Jest
- ✅ Tratamento de erros robusto
- ✅ TypeScript para type safety
- ✅ Variáveis de ambiente configuráveis

## 📋 Pré-requisitos

- Node.js 22+ 
- PostgreSQL 12+
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd mobile-backend-base
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações. Você pode usar `DATABASE_URL` diretamente ou variáveis individuais:

5. Gere o cliente Prisma:
```bash
npm run prisma:generate
```

6. Execute as migrações:
```bash
npm run prisma:migrate
```

## 🎯 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o código TypeScript
- `npm run start` - Inicia o servidor em produção
- `npm test` - Executa os testes
- `npm run test:watch` - Executa os testes em modo watch
- `npm run test:coverage` - Gera relatório de cobertura de testes
- `npm run prisma:generate` - Gera o cliente Prisma
- `npm run prisma:migrate` - Executa as migrações do banco de dados
- `npm run prisma:studio` - Abre o Prisma Studio
- `npm run lint` - Executa o linter

## 📁 Estrutura do Projeto

```
mobile-backend-base/
├── src/
│   ├── config/          # Configurações (database, env, logger)
│   ├── middlewares/     # Middlewares (auth, error, validation)
│   ├── modules/         # Módulos da aplicação
│   │   ├── auth/        # Módulo de autenticação
│   │   └── user/        # Módulo de usuários
│   ├── routes/          # Rotas principais
│   ├── utils/           # Utilitários (JWT, errors)
│   ├── app.ts           # Configuração do Express
│   └── server.ts        # Inicialização do servidor
├── prisma/
│   └── schema.prisma    # Schema do Prisma
├── tests/               # Testes
└── package.json
```

## 🔐 Autenticação

### Endpoints de Autenticação

- `POST /api/auth/login` - Login do usuário (usa **username** e senha)
- `POST /api/auth/logout` - Logout do usuário
- `POST /api/auth/logout-all` - Logout de todos os dispositivos
- `POST /api/auth/refresh` - Renovar token

### Exemplo de Login

O login é feito utilizando **username** e senha (não email):

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }'
```

**Resposta:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Nota:** O `id` agora é um número inteiro (1, 2, 3, ...) ao invés de uma string criptográfica.

### Usando o Token

Inclua o token no header `Authorization`:

```
Authorization: Bearer <token>
```

## 👤 Endpoints de Usuários

- `POST /api/users` - Criar usuário (público)
- `GET /api/users` - Listar usuários (protegido)
- `GET /api/users/:id` - Buscar usuário por ID (protegido)
- `PUT /api/users/:id` - Atualizar usuário (protegido)
- `DELETE /api/users/:id` - Deletar usuário (protegido)

### Exemplo de Criação de Usuário

```bash
curl -X POST http://localhost:3333/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Validações:**
- `name`: obrigatório, mínimo 1 caractere
- `username`: obrigatório, mínimo 3 caracteres, apenas letras, números e underscore (`a-zA-Z0-9_`)
- `email`: obrigatório, deve ser um email válido
- `password`: obrigatório, mínimo 6 caracteres

**Resposta:**
```json
{
  "id": 1,
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Nota:** O `id` agora é um número inteiro (1, 2, 3, ...) ao invés de uma string criptográfica.

## 🧪 Testes

Execute os testes:

```bash
npm test
```

Com cobertura:

```bash
npm run test:coverage
```

## 📦 Adicionando Novos Módulos

Para adicionar um novo módulo:

1. Crie a estrutura de pastas em `src/modules/`:
```
modules/
└── new-module/
    ├── controllers/
    ├── services/
    ├── repositories/
    ├── routes/
    ├── dtos/
    ├── schemas/
    └── index.ts
```

2. Registre as rotas em `src/modules/index.ts`

3. Crie os testes em `tests/modules/new-module/`

## 🔒 Segurança

- **Autenticação por username**: Login realizado com username e senha (mais seguro que apenas email)
- **Senhas hasheadas**: Senhas são hasheadas com bcrypt antes de serem armazenadas
- **Tokens JWT**: Tokens JWT com expiração configurável e refresh tokens
- **Sessões no banco**: Sessões armazenadas no banco de dados para controle de acesso
- **Validação de dados**: Validação rigorosa com Zod em todos os endpoints
- **Usernames únicos**: Validação de unicidade para username e email
- **Tratamento de erros**: Tratamento centralizado de erros com mensagens apropriadas
- **CORS configurável**: Proteção contra requisições não autorizadas

## 🌐 Variáveis de Ambiente

### Configuração do Banco de Dados

Você pode configurar o banco de dados de duas formas:

**Opção 1: Usando DATABASE_URL (recomendado para produção)**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/mobile_backend?schema=public
```

**Opção 2: Usando variáveis individuais (recomendado para desenvolvimento)**
```env
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=mobile_backend_dev
DB_SCHEMA=public
```

A aplicação construirá automaticamente a `DATABASE_URL` a partir das variáveis individuais se `DATABASE_URL` não estiver definida.

### Exemplo de Arquivo .env (Development)

```env
PORT=3333
NODE_ENV=development

# Configuração do banco de dados (usando variáveis individuais)
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=mobile_backend_dev
DB_SCHEMA=public

# JWT Configuration
JWT_SECRET=development-secret-key-change-in-production-min-32-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Application
APP_NAME=mobile-backend-base
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000
```

### Exemplo de Arquivo .env (Production)

```env
PORT=3333
NODE_ENV=production

# Configuração do banco de dados (usando DATABASE_URL)
DATABASE_URL=postgresql://production_user:strong_secure_password@db.example.com:5432/mobile_backend?schema=public

# JWT Configuration
JWT_SECRET=super-secure-random-generated-secret-key-minimum-32-characters
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Application
APP_NAME=mobile-backend-base
APP_URL=https://api.example.com
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://app.example.com
```

### Tabela de Variáveis de Ambiente

| Variável | Descrição | Padrão | Obrigatório |
|----------|-----------|--------|-------------|
| `PORT` | Porta do servidor | `3333` | Não |
| `NODE_ENV` | Ambiente (development/production/test) | `development` | Não |
| `DATABASE_URL` | URL de conexão do PostgreSQL | - | Sim* |
| `DB_TYPE` | Tipo de banco de dados | `postgresql` | Não* |
| `DB_HOST` | Host do banco de dados | `localhost` | Não* |
| `DB_PORT` | Porta do banco de dados | `5432` | Não* |
| `DB_USER` | Usuário do banco de dados | - | Sim* |
| `DB_PASSWORD` | Senha do banco de dados | - | Sim* |
| `DB_NAME` | Nome do banco de dados | `mobile_backend` | Não* |
| `DB_SCHEMA` | Schema do banco de dados | `public` | Não* |
| `JWT_SECRET` | Chave secreta para JWT (mínimo 32 caracteres) | - | Sim |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `7d` | Não |
| `JWT_REFRESH_EXPIRES_IN` | Tempo de expiração do refresh token | `30d` | Não |
| `APP_NAME` | Nome da aplicação | `mobile-backend-base` | Não |
| `APP_URL` | URL da aplicação (produção) | - | Não |
| `BCRYPT_ROUNDS` | Rounds do bcrypt para hash de senha | `10` | Não |
| `CORS_ORIGIN` | Origem permitida pelo CORS | `http://localhost:3000` | Não |

\* É necessário fornecer `DATABASE_URL` OU todas as variáveis individuais (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`).

## 📝 Licença

ISC

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento.

## 📞 Suporte

Para suporte, abra uma issue no repositório.

