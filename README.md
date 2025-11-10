# Demo Shopify Integration

A robust, event-driven integration for Shopify e-commerce operations built with NestJS, leveraging the Strategy Pattern for extensible shop connector implementations.

## 🏗️ Architecture Overview

### Event-Driven Architecture

This application is built on an **event-driven architecture** using Kafka as the message broker. Events flow through the system asynchronously, enabling:

- **Decoupled components** - Services communicate through events rather than direct calls
- **Scalability** - Horizontal scaling through Kafka consumer groups
- **Resilience** - Automatic retry mechanisms and fault tolerance
- **Real-time processing** - Immediate reaction to shop events (orders, inventory, shipments)


### Strategy Pattern Implementation

The connector architecture uses the **Strategy Pattern** to support multiple e-commerce platforms:

```typescript
ShopConnectorsService (Context)
    ↓
ShopConnectorsServiceInterface (Strategy Interface)
    ↓
ShopifyService (Concrete Strategy)
```

**Key Components:**

- **`ShopConnectorsService`** - Context class that delegates operations to concrete shop implementations
- **`ShopConnectorsServiceInterface`** - Strategy interface defining shop operations (orders, inventory, shipments, refunds)
- **`ShopifyService`** - Concrete strategy implementing Shopify-specific business logic

The strategy is selected at runtime based on the `targetSystem` in the connection configuration:

```typescript
switch (connectionAuth.targetSystem) {
  case TargetSystemEnum.SHOPIFY:
    this.concreteShopService = this.shopifyService
    break
  // Future platforms can be added here
}
```

This design allows easy extension to support additional e-commerce platforms (WooCommerce, BigCommerce, etc.) without modifying existing code.

## 🛠️ Tech Stack

### Core Framework
- **NestJS** - Progressive Node.js framework with TypeScript
- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment

### Database & ORM
- **PostgreSQL** - Primary relational database
- **TypeORM** - Object-Relational Mapping with entity management
- **Redis** - Caching and session management

### Event Processing
- **Kafka** (KafkaJS) - Distributed event streaming platform
- **@nestjs/event-emitter** - Internal event handling
- **Bull** - Queue management for background jobs

### API Integration
- **Axios** - HTTP client for REST APIs
- **GraphQL** - Shopify Admin API integration
- **OAuth 1.0a** - Authentication support

### Additional Tools
- **Pino** - High-performance logging
- **Jest** - Testing framework
- **Docker** - Containerization

## 📋 Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 16.x
- Docker & Docker Compose
- Kafka (provided via Docker Compose)
- Redis (provided via Docker Compose)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd demo-shopify-integration
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=demo-shopify-integration
DB_PASSWORD=demo-shopify-integration
DB_NAME=demo-shopify-integration

# Kafka
KAFKA_ENABLED=true
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=demo-shopify-integration
KAFKA_GROUP_ID=demo-shopify-integration-group

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Application
NODE_ENV=development
PORT=3000
```

### 4. Start Infrastructure Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database (port 5432)
- Kafka broker (port 9092)
- Kafka UI (port 8080)
- Redis (port 6379)

### 5. Run Database Migrations

```bash
npm run migration:run
```

### 6. Start the Application

**Development mode:**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

## 📁 Project Structure

```
src/
├── shop-connectors/           # Strategy pattern implementation
│   ├── shop-connectors.service.ts      # Context (Strategy selector)
│   ├── shop-connectors.interface.ts    # Strategy interface
│   └── shopify/                        # Shopify concrete strategy
│       ├── shopify.service.ts          # Main Shopify implementation
│       ├── graphql-shopify.service.ts  # GraphQL API client
│       └── http-shopify.service.ts     # REST API client
├── event-bus/                 # Kafka event streaming
│   ├── event-bus.service.ts   # Event publisher
│   └── consumer.service.ts    # Event consumer
├── event-handlers/            # Event processing logic
│   ├── shop-event.handler.ts  # Shop-related events
│   └── interfaces/
│       └── routed-message.interface.ts
├── orders/                    # Order management
├── inventory-items/           # Inventory management
├── outbound-shipments/        # Shipment processing
├── refund-orders/             # Refund handling
├── connection-auths/          # Shop authentication
├── field-mapper/              # Data transformation
└── core/                      # Shared utilities
    └── entities/              # TypeORM entities
```

## 🔄 Key Features

### 1. Order Management
- Real-time order synchronization from Shopify
- Order fulfillment processing
- Order cancellation handling
- Manual and automated order workflows

### 2. Inventory Management
- Multi-location inventory tracking
- Real-time stock level updates
- Bundle inventory support
- Inventory level synchronization

### 3. Shipment Processing
- Outbound shipment creation
- Tracking number management
- Fulfillment service integration
- Return shipment handling

### 4. Refund Processing
- Refund calculation
- Partial and full refunds
- Automatic restock management

### 5. Event-Driven Workflows
- Webhook processing
- Asynchronous event handling
- Retry mechanisms with exponential backoff
- Dead letter queue support

## 🔌 Shopify Integration

### GraphQL API
The application primarily uses Shopify's GraphQL Admin API for:
- Order queries and mutations
- Inventory level management
- Fulfillment operations
- Product variant queries

### REST API
Legacy REST API support for:
- Webhook subscriptions
- Certain bulk operations

### Webhooks
Supported webhook topics:
- `orders/create`
- `orders/updated`
- `orders/cancelled`
- `inventory_levels/update`
- `fulfillments/create`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e
```

## 📊 Database Schema

Key entities managed by TypeORM:

- **Order** - Customer orders with line items
- **InventoryItem** - Product inventory tracking
- **OutboundShipment** - Shipment records
- **RefundOrder** - Refund transactions
- **ConnectionAuth** - Shop authentication credentials
- **FieldMapper** - Data transformation rules
- **TargetSync** - Synchronization state tracking

## 🔐 Authentication

The application uses:
- **JWT** for internal authentication
- **OAuth 2.0** for Shopify API access
- **Connection pooling** for managing multiple shop credentials

## 📈 Monitoring & Logging

- **Pino** - Structured JSON logging
- **Sentry** - Error tracking and monitoring
- **Elastic APM** - Application performance monitoring
- **Kafka UI** - Message broker monitoring (http://localhost:8080)


### Run with Docker Compose

```bash
docker-compose up
```

## 🔧 Configuration

### TypeORM Configuration
Located in `ormconfig.ts` - configure database connection and entity paths.

### Kafka Configuration
Configure in `src/config/config.ts`:
- Broker addresses
- Consumer groups
- Topic names
- Retry policies

## 🚦 API Endpoints

The application exposes REST endpoints for:
- Order management
- Inventory operations
- Shipment creation
- Refund processing
- Shop configuration

API documentation available via Swagger UI at `/api/docs` when running in development mode.


## 📝 Scripts

```bash
npm run build          # Build the application
npm run start          # Start the application
npm run start:dev      # Start in development mode with watch
npm run start:debug    # Start with debugging enabled
npm run format         # Format code with Prettier
npm run migration:generate  # Generate new migration
npm run migration:run       # Run pending migrations
npm run migration:revert    # Revert last migration
```

## 🐛 Troubleshooting

### Kafka Connection Issues
- Ensure Kafka broker is running: `docker-compose ps`
- Check Kafka logs: `docker-compose logs broker`
- Verify `KAFKA_ENABLED=true` in `.env`

### Database Connection Issues
- Verify PostgreSQL is running: `docker-compose ps db`
- Check credentials in `.env` match `docker-compose.yml`
- Run migrations: `npm run migration:run`

### Shopify API Rate Limits
- The application implements automatic rate limiting
- Retry logic with exponential backoff
- Configure rate limits in `shopify.config.ts`




