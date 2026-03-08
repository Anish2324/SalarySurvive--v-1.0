# SalarySurvive 💰

> **Version 1.0** — Stable release. More features and improvements are planned for future versions.

A full-stack personal finance web application that helps you **track your salary, manage budgets, and monitor expenses** — all in one place.

---

## Screenshots

<!-- TODO: Add screenshots here -->
<!-- Example usage:
![Dashboard](screenshots/dashboard.png)
![Expenses](screenshots/expenses.png)
![Budget](screenshots/budget.png)
-->

> Screenshots coming soon.

---

## Tech Stack

### Backend
| Technology | Version |
|---|---|
| Java | 21 |
| Spring Boot | 4.0.2 |
| Spring Security + JWT | — |
| Spring Data JPA / Hibernate | — |
| PostgreSQL | — |
| Lombok | — |

### Frontend
| Technology | Version |
|---|---|
| React | 19 |
| Vite | 5 |
| Tailwind CSS | 4 |
| React Router | 7 |
| Zustand (state management) | 5 |
| Axios | — |
| Chart.js + Recharts | — |
| React Toastify | — |

---

## Features

- **Authentication** — Register, Login, JWT access + refresh token flow
- **Salary Tracking** — Log and view salary history
- **Budget Management** — Set category-wise budgets and track limits
- **Expense Tracking** — Add, view, and categorize expenses
- **Dashboard** — Monthly summaries, spending trends, top categories
- **Dark / Light Theme** — Persisted via Zustand store
- **Protected Routes** — All pages secured behind auth

---

## Project Structure

```
King/
├── Backend/          # Spring Boot REST API
│   └── src/main/java/com/salarysurvive/
│       ├── controller/   # REST controllers
│       ├── service/      # Business logic
│       ├── repository/   # JPA repositories
│       ├── model/        # JPA entities
│       ├── dto/          # Request/Response DTOs
│       ├── security/     # JWT filters & config
│       └── config/       # Security beans
└── Frontend/         # React + Vite SPA
    └── src/
        ├── pages/        # Dashboard, Expenses, Budget, Salary, Profile
        ├── components/   # Navbar, Sidebar, ProtectedRoute
        ├── api/          # Axios instance config
        ├── store/        # Zustand auth & theme stores
        └── utils/        # Currency helpers
```

---

## Prerequisites

- Java 21+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 14+

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/salary-survive.git
cd salary-survive
```

### 2. Set up the Database

Create a PostgreSQL database:

```sql
CREATE DATABASE salary_survival;
```

### 3. Configure Backend

```bash
cd Backend/src/main/resources
cp application.properties.example application.properties
```

Edit `application.properties` and fill in your values:

```properties
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
jwt.secret=YOUR_JWT_SECRET_KEY_AT_LEAST_32_CHARS_LONG
```

### 4. Run the Backend

```bash
cd Backend
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 5. Run the Frontend

```bash
cd Frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET/POST | `/api/salary` | Get / add salary entries |
| GET/POST | `/api/expenses` | Get / add expenses |
| GET/POST/PUT | `/api/budget` | Get / set / update budgets |
| GET | `/api/dashboard/summary` | Monthly summary |
| GET | `/api/dashboard/trends` | Monthly spending trends |
| GET | `/api/dashboard/top-categories` | Top spending categories |

---

## Environment Variables

> **Never commit `application.properties`** — it contains secrets. Use `application.properties.example` as your template.

| Property | Description |
|---|---|
| `spring.datasource.url` | PostgreSQL connection URL |
| `spring.datasource.username` | DB username |
| `spring.datasource.password` | DB password |
| `jwt.secret` | HS256 signing key (min 32 chars) |
| `jwt.expiration` | Access token TTL in ms (default: 15 min) |
| `jwt.refresh-expiration` | Refresh token TTL in ms (default: 7 days) |

---

## Versioning

| Version | Status | Notes |
|---------|--------|-------|
| 1.0 | ✅ Current | Initial stable release — core auth, salary, budget & expense tracking |
| 1.x+ | 🔜 Planned | Future updates with new features and improvements |

---

## License

This project is open-source and available under the [MIT License](LICENSE).
