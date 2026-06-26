# Digital Café (کافه دیجیتال) — Architecture Design

## Executive Summary

A Persian-first online menu and smart ordering platform designed for cafés and restaurants with a sophisticated AI assistant. The system supports multi-tenancy, advanced user roles, comprehensive business management, and enterprise-grade security while maintaining a premium user experience.

---

## System Overview

```mermaid
graph TB
    %% Users & Clients
    Customer[Customer / Guest User]
    RestaurantOwner[Restaurant Owner / Manager]
    SystemAdmin[System Admin]
    
    %% Frontend Layers
    subgraph "Frontend Layers"
        WebApp[Web Application]
        MobileApp[Mobile App]
    end
    
    %% API Gateway & Services
    subgraph "API Gateway & Services"
        APIGateway["API Gateway (Next.js)"]
        AuthService["Authentication Service"]
        ChatService["AI Chat Service"]
        OrderService["Order Service"]
        MenuService["Menu Management Service"]
        PaymentService["Payment Service"]
        NotificationService["Notification Service"]
    end
    
    %% Data Layer
    subgraph "Data Layer"
        PostgreSQLClusters["PostgreSQL Clusters (Multi-tenant)"]
        RedisCache["Redis Cache"]
        ObjectStorage["Object Storage"]
        MessageBroker["Message Broker"]
    end
    
    %% External Services
    subgraph "External Integrations"
        GoogleMaps["Google Maps API"]
        PaymentProviders["Payment Gateways"]
        EmailService["Email Service"]
        AnalyticsService["Analytics"]
        VoiceService["Speech-to-Text"]
    end
    
    %% Connections
    Customer --> WebApp
    RestaurantOwner --> WebApp
    SystemAdmin --> WebApp
    WebApp --> APIGateway
    APIGateway --> AuthService
    APIGateway --> ChatService
    APIGateway --> OrderService
    APIGateway --> MenuService
    APIGateway --> PaymentService
    APIGateway --> NotificationService
    AuthService --> PostgreSQLClusters
    OrderService --> PostgreSQLClusters
    OrderService --> RedisCache
    OrderService --> MessageBroker
    MenuService --> PostgreSQLClusters
    PaymentService --> PaymentProviders
    NotificationService --> EmailService
    NotificationService --> RedisCache
    ChatService --> VoiceService
    ChatService --> GoogleMaps
    RedisCache --> MessageBroker
```

---

## Architecture Layers

### 1. Presentation Layer (Frontend)

#### Web Application
- **Framework**: Next.js 14 with App Router
- **Framework Features**:
  - Server-side rendering (SSR) for SEO
  - Client-side rendering (CSR) for interactive parts
  - API routes for server actions
  - Internationalization (i18n) with RTL support

#### Mobile Application
- **Framework**: React Native or Flutter (to be decided)
- **Features**:
  - Native mobile experience
  - Push notifications
  - Offline capabilities
  - Voice input integration

### 2. API Gateway Layer

#### Core Services
- **Authentication Service**: JWT token management, OAuth2 integration
- **Chat Service**: AI conversation engine with tool calling
- **Order Service**: Order lifecycle management, status tracking
- **Menu Service**: Dynamic menu management, pricing, categorization
- **Payment Service**: Payment processing, invoice generation
- **Notification Service**: Multi-channel notifications (email, SMS, push)

#### API Gateway Features
- Request routing and load balancing
- Authentication and authorization
- Rate limiting and throttling
- API versioning
- Monitoring and logging

### 3. Data Layer

#### Primary Database: PostgreSQL (Multi-Tenant)

```sql
-- Restaurants table
CREATE TABLE restaurants (
    id UUID PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name_fa VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_fa TEXT,
    description_en TEXT,
    logo_url TEXT,
    cover_url TEXT,
    theme_config JSONB NOT NULL,
    business_hours JSONB NOT NULL,
    phone VARCHAR(20),
    address JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name_fa VARCHAR(255),
    full_name_en VARCHAR(255),
    avatar_url TEXT,
    role ENUM('owner', 'manager', 'staff', 'customer') NOT NULL,
    permissions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu categories table
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name_fa VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description_fa TEXT,
    description_en TEXT,
    icon VARCHAR(50),
    sort_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    name_fa VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_fa TEXT,
    description_en TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER NOT NULL,
    preparation_time INTEGER,
    ingredients JSONB,
    allergens JSONB,
    modifiers JSONB,
    dietary_tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_phone VARCHAR(20),
    customer_name VARCHAR(255),
    table_number VARCHAR(50),
    seat_number VARCHAR(50),
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled') NOT NULL DEFAULT 'pending',
    order_type ENUM('dine_in', 'takeaway', 'delivery') NOT NULL DEFAULT 'dine_in',
    payment_status ENUM('pending', 'paid', 'refunded') NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    service_charge DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    special_instructions TEXT,
    estimated_ready_time TIMESTAMP WITH TIME ZONE,
    actual_ready_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    name_fa VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    notes TEXT,
    modifiers JSONB,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method ENUM('cash', 'card', 'mobile', 'online') NOT NULL,
    provider VARCHAR(100),
    transaction_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_phone VARCHAR(20),
    customer_name VARCHAR(255),
    rating INTEGER NOT NULL,
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurants cache table
CREATE TABLE restaurant_cache (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_active ON restaurants(is_active);
CREATE INDEX idx_users_restaurant_id ON users(restaurant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_active ON menu_items(is_available);
CREATE INDEX idx_menu_items_featured ON menu_items(is_featured);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

#### Caching Layer: Redis
- **Purpose**: Session caching, API response caching, real-time updates
- **Implementation**: Redis cluster with data persistence
- **Data cached**:
  - User sessions and authentication tokens
  - Restaurant menu items (frequent queries)
  - Order status updates (real-time)
  - Analytics data (hot reports)

#### Message Broker: RabbitMQ / Apache Kafka
- **Purpose**: Asynchronous processing, event-driven architecture
- **Use cases**:
  - Order notifications
  - Inventory updates
  - Payment processing
  - Analytics processing

### 4. External Service Integrations

#### Third-party Services
- **Google Maps API**: Address validation, distance calculation
- **Payment Gateways**: Stripe, PayPal, local payment providers
- **Email Service**: SendGrid, Mailgun for notifications
- **Analytics**: Google Analytics, Mixpanel for user behavior tracking
- **Voice Service**: Google Speech-to-Text, Amazon Transcribe
- **SMS Service**: Twilio, local SMS providers

---

## Security Architecture

### Authentication & Authorization

#### Authentication Flow
```
Client Request → API Gateway → Authentication Service → JWT Token
                                    ↓
                             User Database Validation
                                    ↓
                         Token Generation (JWT)
                                    ↓
                         Role-based Permissions
```

#### Authorization Model
- **Role-based Access Control (RBAC)**
- **Multi-level permissions**:
  - System Admin (all permissions)
  - Restaurant Owner (own restaurant)
  - Staff (limited operations)
  - Customer (self-service only)
- **Resource-level permissions**: Read/write/delete access to specific resources

### Data Protection

#### Encryption
- **At rest**: AES-256 encryption for all sensitive data
- **In transit**: TLS 1.3 for all communications
- **Database encryption**: Transparent Data Encryption (TDE)

#### Access Control
- **Principle of least privilege**: Users get only necessary permissions
- **Session management**: Secure token validation, refresh mechanisms
- **Rate limiting**: Prevents brute force and DDoS attacks

### Compliance
- **GDPR compliance**: User data protection, consent management
- **PCI DSS**: Payment card data security for payment processing
- **Local regulations**: Local data protection laws

---

## Multi-Tenancy Strategy

### Shared Infrastructure
- **Single codebase**: All restaurants use the same application code
- **Shared frontend**: Dynamic theming per restaurant
- **Shared APIs**: Standardized API endpoints for all restaurants

### Per-Restaurant Resources
- **Dedicated database schema**: Each restaurant has its own PostgreSQL schema
- **Isolated authentication**: Separate user databases per restaurant
- **Custom branding**: Unique themes, logos, and configurations per restaurant

### Scaling Considerations
- **Horizontal scaling**: Each restaurant can scale independently
- **Resource allocation**: Separate resource pools per restaurant
- **Performance isolation**: One restaurant issue doesn't affect others

---

## Deployment Architecture

### Environment Configuration

```yaml
# Development Environment
development:
  database: postgresql://dev_user:dev_pass@localhost:5432/dev_db
  redis: redis://localhost:6379
  cache: false
  debug_mode: true
  smtp: smtp://localhost:25

# Staging Environment
staging:
  database: postgresql://staging_user:staging_pass@staging-db.internal:5432/staging_db
  redis: redis://staging-redis.internal:6379
  cache: true
  debug_mode: false
  smtp: smtp://mail-staging.internal:25

# Production Environment
production:
  database: postgresql://prod_user:prod_pass@prod-db.internal:5432/prod_db
  redis: redis://prod-redis.internal:6379
  cache: true
  debug_mode: false
  smtp: smtp://mail.production.internal:25
  payment_providers: [stripe, paypal, local]
```

### Container Orchestration
- **Platform**: Docker Swarm + Traefik
- **Service discovery**: Consul for service registration
- **Load balancing**: Nginx for HTTP traffic
- **Monitoring**: Prometheus + Grafana for metrics
- **Logging**: ELK stack (Elasticsearch, Logstash, Kibana)

### Backup & Disaster Recovery
- **Database backup**: Daily automated backups to object storage
- **Point-in-time recovery**: WAL (Write-Ahead Log) for restore to specific timestamps
- **Geographic redundancy**: Multi-region deployment for business continuity
- **Failover**: Automated failover to backup regions

---

## API Design

### RESTful API Principles

#### Base URL Structure
```
https://api.digitalcafe.com/v1/
├── restaurants/           (Restaurant management)
│   ├── {slug}/           (Restaurant profile)
│   ├── {slug}/menu/      (Menu management)
│   ├── {slug}/orders/    (Orders management)
│   └── {slug}/staff/     (Staff management)
├── orders/                (Customer orders)
│   ├── create/           (Create new order)
│   ├── {id}/status/      (Update order status)
│   └── {id}/cancel/      (Cancel order)
├── chat/                  (AI chat)
│   ├── {restaurant-slug}/ (Restaurant-specific chat)
│   └── session/{id}/     (Chat sessions)
└── auth/                  (Authentication)
    ├── login/            (Restaurant login)
    ├── register/         (Restaurant registration)
    ├── logout/           (Logout)
    └── password/reset/   (Password reset)
```

### Authentication

#### JWT Token Structure
```json
{
  "sub": "user_12345",
  "restaurant_id": "restaurant_abc",
  "role": "owner|manager|staff|customer",
  "permissions": ["menu:read", "menu:write", "orders:read", "orders:write"],
  "exp": 1720156800,
  "iat": 1720123200,
  "iss": "digitalcafe"
}
```

#### API Authentication Methods
1. **Bearer Token**: JWT in Authorization header
2. **API Key**: For service-to-service communication
3. **Session-based**: Cookie-based for web applications

### Rate Limiting

#### Rate Limit Strategy
- **Per endpoint**: Specific limits for sensitive endpoints
- **Per user**: Limits based on user role and activity
- **Per restaurant**: Resource-based limits
- **Global**: Emergency limits during high traffic

```yaml
# Rate limiting configuration
rate_limits:
  restaurants:
    login: 5 per minute
    orders: 100 per hour
    menu: 200 per hour
  customers:
    orders: 10 per hour
    chat: 30 per- minute
    reviews: 5 per hour
```

---

## Monitoring & Observability

### Metrics
- **Application metrics**: Request latency, throughput, error rates
- **Business metrics**: Orders per restaurant, revenue, customer satisfaction
- **Infrastructure metrics**: Database connections, cache hit rate, memory usage

### Logging
- **Structured logging**: JSON format with correlation IDs
- **Structured logging**: User actions, system events, errors
- **Log retention**: 30 days for security, 90 days for operations

### Alerting
- **Critical alerts**: System downtime, payment failures
- **Warning alerts**: High error rates, performance degradation
- **Business alerts**: Unusual order patterns, revenue anomalies

---

## Technology Stack Summary

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v3 with custom design tokens
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios with interceptors
- **UI Components**: Headless UI + custom primitives
- **Animations**: framer-motion + GSAP
- **Internationalization**: Next.js i18n with RTL support

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js for microservices
- **Database**: PostgreSQL (multi-tenant)
- **Cache**: Redis Cluster
- **Message Broker**: RabbitMQ
- **Security**: Passport.js, helmet, cors
- **Logging**: Winston + Morgan

### Infrastructure
- **Container Platform**: Docker + Docker Swarm
- **Load Balancer**: Traefik
- **Service Discovery**: Consul
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack
- **API Gateway**: Kong

### DevOps
- **CI/CD**: GitHub Actions
- **Container Registry**: Docker Hub
- **Secret Management**: HashiCorp Vault
- **Infrastructure as Code**: Terraform

---

## Risk Assessment

### High-Risk Areas
1. **Multi-tenant data isolation**: Risk of cross-restaurant data leakage
2. **Payment integration**: PCI compliance complexity
3. **Scalability**: Handling high traffic during peak times
4. **Authentication**: JWT token security and management

### Mitigation Strategies
1. **Database isolation**: Per-restaurant schemas with strict permissions
2. **Payment security**: PCI compliance, tokenization, secure vault storage
3. **Auto-scaling**: Load balancer with auto-scaling groups
4. **Token security**: Short-lived tokens, refresh mechanisms, secure storage

### Medium-Risk Areas
1. **Third-party integrations**: Dependency on external APIs
2. **Real-time features**: WebSocket implementation
3. **Internationalization**: Cultural and language differences

### Mitigation Strategies
1. **Fallback mechanisms**: Multiple payment providers, API retry logic
2. **Hybrid approach**: WebSocket + SSE for real-time updates
3. **Localization**: Native speakers for content translation

### Low-Risk Areas
1. **Feature rollout**: Gradual feature deployment
2. **User interface**: Standard web technologies
3. **Documentation**: Well-established documentation tools

### Mitigation Strategies
1. **Canary releases**: Feature flags for gradual rollout
2. **Off-the-shelf components**: Use well-tested libraries
3. **Template-based documentation**: Standard templates for quick generation

---

## Conclusion

The Digital Café platform is designed to be:

- **Scalable**: Supports hundreds of restaurants with independent scaling
- **Secure**: Enterprise-grade security with compliance for payment processing
- **Reliable**: Multi-region deployment with automated failover
- **Performant**: Optimized for low latency and high throughput
- **Maintainable**: Clean architecture with clear separation of concerns

This architecture provides a solid foundation for growth while ensuring that each restaurant can operate independently within the unified platform, creating a powerful network of cafés and restaurants working together under a common brand.

---

*Document last updated: June 25, 2026*
*Version: 1.0*
*Author: AI Assistant (OpenCode)*"