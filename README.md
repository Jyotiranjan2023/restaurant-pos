# Restaurant POS SaaS

Multi-tenant Restaurant Point of Sale system built with Spring Boot and React.

## Features

- Multi-tenant architecture (one system, many restaurants)
- Order management (Dine-in, Takeaway, Delivery)
- Real-time kitchen display via WebSocket
- Menu management with variants and add-ons
- Inventory tracking with auto-deduction
- Customer management with order history
- Coupons and discounts
- Bill generation with GST (CGST/SGST split)
- Customer feedback system
- Notifications (in-app + WebSocket push)
- Forgot password flow with admin approval
- CSV data export (orders, bills, sales, GST)
- Role-based access control (ADMIN / CHEF / WAITER)

## Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.3.x
- Spring Security with JWT
- MySQL 8
- WebSocket (STOMP)
- Maven

**Frontend (Coming Soon):**
- React 18
- Tailwind CSS
- Vite

## Getting Started

### Prerequisites
- Java 17+
- MySQL 8+
- Maven 3.8+

### Setup

1. Clone the repository
2. Create MySQL database: `CREATE DATABASE restaurant_pos;`
3. Copy `.env.example` and set your environment variables
4. Run: `mvn spring-boot:run`

### Environment Variables

See `.env.example` for required environment variables.

## API Documentation

API endpoints are organized under:
- `/api/auth/*` — Authentication
- `/api/orders/*` — Order management
- `/api/products/*` — Menu items
- `/api/bills/*` — Billing
- `/api/admin/*` — Admin-only operations

## License

Proprietary — All rights reserved.