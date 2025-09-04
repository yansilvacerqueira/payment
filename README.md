# Payments API - Node.js/TypeScript

API de processamento de pagamentos com filas assíncronas, seleção de gateway e persistência em PostgreSQL.

## Descrição

O sistema processa pagamentos de forma assíncrona, permitindo escalar consumidores em paralelo. Os resultados são persistidos em PostgreSQL e podem ser sumarizados por período. O componente de seleção de gateway está desacoplado e pode ser evoluído (ex.: latência, taxa de erro).

## Recursos (docker-compose)

| Serviço  | CPUs | Memória |
| -------- | ---- | ------- |
| nginx    | 0.2  | 48MB    |
| api-1    | 0.6  | 108MB   |
| api-2    | 0.6  | 108MB   |
| redis    | 0.1  | 86MB    |
| postgres | 0.25 | 128MB   |

## Como rodar o projeto

1. **Clone o repositório:**

   ```bash
   git clone <url-do-repositorio>
   cd backend-para-rinha-2025/node
   ```

2. **Instale as dependências (desenvolvimento local):**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   - As variáveis são configuradas no `docker-compose.yml`.

4. **Suba os containers:**

   ```bash
   docker-compose up --build
   ```

5. **Acesse a aplicação:**
   - Endpoints na porta 9999.

## Scripts Disponíveis

- `npm run build` — Compila o TypeScript
- `npm start` — Inicia a aplicação compilada
- `npm run dev` — Executa em modo desenvolvimento
- `npm run dev:watch` — Executa em modo desenvolvimento com auto-reload

## Principais Funcionalidades

- Processamento assíncrono de pagamentos (fila + workers)
- Persistência em PostgreSQL
- Sumário por período
- Estrutura modular (domain, controllers, services, repository, infra)

## Tecnologias Utilizadas

- Node.js 18+
- TypeScript
- Express (servidor HTTP)
- PostgreSQL (persistência)
- Redis (infra pronta para futuras extensões)
- Docker & Docker Compose

## Endpoints da API

### POST /payments
Adiciona um pagamento na fila para processamento.

**Request Body:**
```json
{
  "correlationId": "string",
  "amount": number
}
```

**Response:** Status 202 (Accepted)

### GET /payments-summary
Retorna resumo de pagamentos processados.

**Query Parameters:**
- `from` (opcional): Data de início (ISO 8601)
- `to` (opcional): Data de fim (ISO 8601)

**Response:**
```json
{
  "default": { "totalRequests": number, "totalAmountCents": number },
  "fallback": { "totalRequests": number, "totalAmountCents": number }
}
```

### POST /purge-payments
Remove todos os pagamentos armazenados.

**Response:**
```json
{ "status": "payments purged" }
```

