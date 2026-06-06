# 🚀 Como Inicializar o Projeto

## Pré-requisitos

- Node.js v20 instalado (`node --version` deve mostrar `v20.x.x`)
- MySQL instalado e rodando
- Android Studio com emulador configurado (opcional)

---

## 1. MySQL Workbench — Criar o banco

Abra o MySQL Workbench, conecte e execute:

```sql
CREATE DATABASE gestao_financeira CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 2. Backend

```powershell
# Entrar na pasta
cd gestao-financeira-api

# Instalar dependências
npm install

# Criar o .env
copy .env.example .env
```

Edite o `.env` com suas credenciais:

```env
DATABASE_URL="mysql://root:Senha10adaps@localhost:3306/gestao_financeira"
PORT=3000
JWT_SECRET="gestao-financeira-secret-key-2024"
```

```powershell
# Criar as tabelas no banco
npx prisma migrate dev --name init

# Popular o banco com categorias e usuário demo
npm run prisma:seed

# Subir o servidor
npm run dev
```

Confirme que aparece no terminal:

```
API rodando em http://localhost:3000
```

---

## 3. Frontend

Abra um **novo terminal**:

```powershell
# Entrar na pasta
cd gestao-financeira

# Instalar dependências
npm install --legacy-peer-deps

# Criar o .env
copy .env.example .env
```

Edite o `.env` conforme o dispositivo:

```env
# Emulador Android
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000

# Celular físico (troque pelo seu IP — descubra com `ipconfig`)
EXPO_PUBLIC_API_URL=http://192.168.0.8:3000

# Browser
EXPO_PUBLIC_API_URL=http://localhost:3000
```

```powershell
# Subir o app
npx expo start --clear
```

---

## 4. Abrir o app

| Dispositivo | Comando |
|---|---|
| Emulador Android | Pressione `a` no terminal |
| Browser | Pressione `w` no terminal |
| Celular físico | Escaneie o QR code com o Expo Go |

---

## 5. Login demo

| Campo | Valor |
|---|---|
| E-mail | `demo@gestao.com` |
| Senha | `demo123` |

---

## Resumo dos terminais

| Terminal | Pasta | Comando |
|---|---|---|
| 1 | `gestao-financeira-api` | `npm run dev` |
| 2 | `gestao-financeira` | `npx expo start --clear` |

