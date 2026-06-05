# Documentação da API — Gestão Financeira

## Configuração

| Item | Valor |
|---|---|
| Base URL | `http://localhost:3000` |
| Variável de ambiente | `baseUrl = http://localhost:3000` |
| Autenticação | JWT Bearer Token |
| Variável do token | `{{token}}` (salva automaticamente após login) |

---

## Autenticação

### Como obter o token

1. Execute a requisição **Auth Login**
2. O token é salvo automaticamente na variável `{{token}}` via script do Postman
3. Use o token no header `Authorization: Bearer {{token}}` nas rotas protegidas

> **Rotas protegidas:** todas as rotas de `/transactions` exigem token.
> **Rotas públicas:** `/auth/register`, `/auth/login`, `/categories`.

---

## Usuário demo (inserido pelo seed)

| Campo | Valor |
|---|---|
| E-mail | `demo@gestao.com` |
| Senha | `demo123` |

---

## Rotas

### Health-check

| Campo | Valor |
|---|---|
| Método | `GET` |
| URL | `{{baseUrl}}/` |
| Autenticação | Não |

**Resposta esperada — 200 OK:**
```json
{
  "ok": true,
  "name": "gestao-financeira-api"
}
```

---

### Auth Register

| Campo | Valor |
|---|---|
| Método | `POST` |
| URL | `{{baseUrl}}/auth/register` |
| Autenticação | Não |
| Content-Type | `application/json` |

**Body:**
```json
{
  "name": "Meu Nome",
  "email": "meu@email.com",
  "password": "minhasenha"
}
```

**Resposta esperada — 201 Created:**
```json
{
  "id": "cuid_gerado",
  "name": "Meu Nome",
  "email": "meu@email.com",
  "createdAt": "2026-06-05T00:00:00.000Z"
}
```

---

### Auth Login

| Campo | Valor |
|---|---|
| Método | `POST` |
| URL | `{{baseUrl}}/auth/login` |
| Autenticação | Não |
| Content-Type | `application/json` |

**Body:**
```json
{
  "email": "demo@gestao.com",
  "password": "demo123"
}
```

**Resposta esperada — 200 OK:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cuid_gerado",
    "name": "Usuário Demo",
    "email": "demo@gestao.com"
  }
}
```

> O script de teste do Postman salva o token automaticamente em `{{token}}`.

**Resposta de erro — 401 Unauthorized:**
```json
{
  "error": "Credenciais inválidas"
}
```

---

### Categorias / Listar

| Campo | Valor |
|---|---|
| Método | `GET` |
| URL | `{{baseUrl}}/categories` |
| Autenticação | Não |

**Resposta esperada — 200 OK:**
```json
[
  {
    "id": "cuid_gerado",
    "name": "food",
    "displayName": "Alimentação",
    "icon": "fastfood",
    "background": "#DEA17B",
    "isIncome": false,
    "isDefault": true,
    "createdAt": "2026-06-05T00:00:00.000Z"
  },
]
```

> O script de teste salva automaticamente o `id` da categoria `income` em `{{categoryId}}`.

---

### Categorias / Criar

| Campo | Valor |
|---|---|
| Método | `POST` |
| URL | `{{baseUrl}}/categories` |
| Autenticação | Não |
| Content-Type | `application/json` |

**Body:**
```json
{
  "name": "health",
  "displayName": "Saúde",
  "icon": "favorite",
  "background": "#FFB6B6",
  "isIncome": false
}
```

**Resposta esperada — 201 Created:**
```json
{
  "id": "cuid_gerado",
  "name": "health",
  "displayName": "Saúde",
  "icon": "favorite",
  "background": "#FFB6B6",
  "isIncome": false,
  "isDefault": false,
  "createdAt": "2026-06-05T00:00:00.000Z"
}
```

**Resposta de erro — 409 Conflict (categoria já existe):**
```json
{
  "error": "Registro duplicado"
}
```

---

### Categorias / Atualizar

| Campo | Valor |
|---|---|
| Método | `PUT` |
| URL | `{{baseUrl}}/categories/:id` |
| Autenticação | Não |
| Content-Type | `application/json` |

**Body (parcial):**
```json
{
  "displayName": "Saúde e Bem-estar"
}
```

**Resposta esperada — 200 OK:**
```json
{
  "id": "cuid_gerado",
  "name": "health",
  "displayName": "Saúde e Bem-estar",
}
```


### Categorias / Excluir (personalizada)

| Campo | Valor |
|---|---|
| Método | `DELETE` |
| URL | `{{baseUrl}}/categories/:id` |
| Autenticação | Não |

**Resposta esperada — 204 No Content**

---

### Categorias / Excluir (padrão — deve falhar)

| Campo | Valor |
|---|---|
| Método | `DELETE` |
| URL | `{{baseUrl}}/categories/{{categoryId}}` |
| Autenticação | Não |

**Resposta esperada — 400 Bad Request:**
```json
{
  "error": "Categorias padrão não podem ser excluídas"
}
```

---

### Transações / Criar

| Campo | Valor |
|---|---|
| Método | `POST` |
| URL | `{{baseUrl}}/transactions` |
| Autenticação | ✅ `Bearer {{token}}` |
| Content-Type | `application/json` |

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "description": "Salário de outubro",
  "value": 3500.50,
  "date": "2026-04-29",
  "categoryId": "{{categoryId}}"
}
```

**Resposta esperada — 201 Created:**
```json
{
  "id": "cuid_gerado",
  "description": "Salário de outubro",
  "value": "3500.50",
  "date": "2026-04-29T00:00:00.000Z",
  "categoryId": "cuid_categoria",
  "userId": "cuid_usuario",
  "createdAt": "2026-06-05T00:00:00.000Z",
  "updatedAt": "2026-06-05T00:00:00.000Z",
  "category": {
    "id": "cuid_categoria",
    "name": "income",
    "displayName": "Renda",
    ...
  }
}
```

> O script de teste salva o `id` da transação em `{{transactionId}}`.

**Resposta de erro — 401 Unauthorized (sem token):**
```json
{
  "error": "Token não fornecido"
}
```

---

### Transações / Listar

| Campo | Valor |
|---|---|
| Método | `GET` |
| URL | `{{baseUrl}}/transactions?month=4&year=2026` |
| Autenticação | ✅ `Bearer {{token}}` |
| Query params | `month` (1–12), `year` (opcional) |

**Headers:**
```
Authorization: Bearer {{token}}
```

**Resposta esperada — 200 OK:**
```json
[
  {
    "id": "cuid_gerado",
    "description": "Salário de outubro",
    "value": "3500.50",
    "date": "2026-04-29T00:00:00.000Z",
    "category": { ... }
  }
]
```

---

### Transações / Atualizar

| Campo | Valor |
|---|---|
| Método | `PUT` |
| URL | `{{baseUrl}}/transactions/{{transactionId}}` |
| Autenticação | ✅ `Bearer {{token}}` |
| Content-Type | `application/json` |

**Body (parcial):**
```json
{
  "description": "Salário de outubro (corrigido)",
  "value": 3800.00
}
```

**Resposta esperada — 200 OK:** transação atualizada com categoria aninhada.

---

### Transações / Excluir

| Campo | Valor |
|---|---|
| Método | `DELETE` |
| URL | `{{baseUrl}}/transactions/{{transactionId}}` |
| Autenticação | ✅ `Bearer {{token}}` |

**Resposta esperada — 204 No Content**

---

### Validação de erros

| Campo | Valor |
|---|---|
| Método | `POST` |
| URL | `{{baseUrl}}/transactions` |
| Autenticação | ✅ `Bearer {{token}}` |

**Body inválido:**
```json
{ "description": "" }
```

**Resposta esperada — 400 Bad Request:**
```json
{
  "error": "Dados inválidos",
  "details": [
    { "code": "too_small", "path": ["description"], "message": "..." },
    { "code": "invalid_type", "path": ["value"], "message": "..." },
    ...
  ]
}
```

---

### Credenciais inválidas

| Campo | Valor |
|---|---|
| Método | `POST` |
| URL | `{{baseUrl}}/auth/login` |
| Autenticação | Não |

**Body:**
```json
{
  "email": "demo@gestao.com",
  "password": "senhaerrada"
}
```

**Resposta esperada — 401 Unauthorized:**
```json
{
  "error": "Credenciais inválidas"
}
```

---

## Fluxo recomendado de testes

1.  Health-check — confirma que o servidor está no ar
2.  Login — obtém e salva o token automaticamente
3.  Listar categorias — salva o `categoryId` automaticamente
4.  Criar categoria — testa criação
5.  Atualizar categoria — testa edição
6.  Excluir padrão — confirma bloqueio (400)
7.  Excluir personalizada — testa exclusão (204)
8.  Criar transação — usa `{{categoryId}}` e `{{token}}`
9.  Listar transações — com filtro de mês/ano
10. Atualizar transação
11. Excluir transação
12. Validação de erros — confirma Zod (400)
13. Credenciais inválidas — confirma autenticação (401)
