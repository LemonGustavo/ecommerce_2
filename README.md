# E-commerce (SOLID + InversifyJS)

Projeto de e-commerce refatorado para usar InversifyJS como container de IoC, para obtenção de nota na matéria de Arquitetura de Software. Contém dois modos de execução selecionáveis por variável de ambiente (`APP_ENV`), sem mudar regras de negócio do projeto original em https://github.com/LemonGustavo/ecommerce/tree/main.

## Estrutura

```
src/
├── container/     # container.ts (único lugar que importa classes concretas e monta o grafo
│                  # de dependências conforme APP_ENV) e types.ts (Symbols das dependências)
├── domain/        # IProduct, PhysicalProduct, DigitalProduct, ProductFactory
├── repositories/  # IOrderRepository, PrismaOrderRepository e InMemoryOrderRepository
├── providers/     # IMailProvider, EtherealMailProvider e ConsoleMailProvider
├── payment/       # IPaymentMethod, CreditCardPayment, PixPayment e PaymentMethodRegistry
├── services/      # OrderService (regra de negócio do pedido) e NotificationService 
├── controllers/   # OrderController (só HTTP: valida entrada e traduz erros em status code)
├── lib/           # anota o que acontece no sistema, mostrando no terminal
│                  # e salvando no arquivo app.log pra consultar depois.
└── app.ts         # pede o OrderController ao container e registra a rota POST
```

## Pré-requisitos

- Node.js
- npm

## Instalação

```bash
npm install
```

## Como rodar

O modo de execução é definido somente pela variável `APP_ENV` no arquivo `.env`. 
O container (`src/container/container.ts`) lê essa variável e escolhe as implementações. Assim, nenhum service ou controller conhece `Prisma`, `Nodemailer` ou implementações concretas.

Crie o `.env`:

```bash
cp .env.example .env
```

### Modo `dev`

Usa Prisma como repositório e EtherealMailProvider para enviar e-mails de teste.

1. Configure o `.env`:

   ```env
   APP_ENV=dev
   ```

2. Rode as migrações e o seed:

   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

3. Suba o servidor:

   ```bash
   npm run dev
   ```

### Modo `test` (sem banco, sem internet)

Usa **InMemoryOrderRepository** (array em memória) e **ConsoleMailProvider** (imprime o e-mail no console). Não precisa de banco nem de internet.

1. Configure o `.env`:

   ```env
   APP_ENV=test
   ```

2. Suba o servidor:

   ```bash
   npm run dev
   ```

> ! | Ao trocar o `APP_ENV`, reinicie o servidor (`Ctrl+C` e `npm run dev` de novo).

## Testando

Com o servidor rodando, em outro terminal:

```bash
curl -X POST http://127.0.0.1:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "teste@exemplo.com",
    "items": [
      { "productId": 1, "quantity": 1 },
      { "productId": 2, "quantity": 2 }
    ],
    "paymentMethod": "pix",
    "paymentDetails": { "pixKey": "teste@exemplo.com" }
  }'
```

Resposta esperada nos dois modos:

```json
{
  "message": "Pedido processado com sucesso",
  "orderId": 1,
  "total": 210,
  "emailPreview": false
}
```

- No modo dev, `emailPreview` vem com uma URL do Ethereal.
- No modo test, `emailPreview` é `false` e o e-mail aparece no console do servidor.

Também é possível testar com cartão de crédito trocando o final do JSON:

```json
"paymentMethod": "credit_card",
"paymentDetails": { "cardNumber": "4111111111111111", "cvv": "123" }
```

## Arquitetura de injeção

- `src/container/types.ts` — possui um `Symbol` para cada depnedência.
- `src/container/container.ts` — único arquivo que importa classes concretas e decide o que será injetado conforme `APP_ENV`.
- Todas as formas de pagamento estão no mesmo `TYPES.PaymentMethod`, e são consumidas via `@multiInject` no `PaymentMethodRegistry`.
- `MailProvider` e os repositórios usam `inSingletonScope()`, que define que essas dependências terão uma única instância compartilhada por toda a aplicação.