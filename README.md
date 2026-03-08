# SalarySurvive 💰

> **Version 1.0** — Stable release. More features and improvements are planned for future versions.

A full-stack personal finance web application that helps you **track your salary, manage budgets, and monitor expenses** — all in one place.

---

## Screenshots
 ## 1. Register (Dark themed)
 <img width="632" height="871" alt="image" src="https://github.com/user-attachments/assets/bcbfc867-17f2-4609-a9c7-59f0c3457e17" />

 ## 2. Login 
 <img width="1148" height="866" alt="image" src="https://github.com/user-attachments/assets/5df44ae6-c70e-4c18-aa63-1dd1933dff41" />

## 3. User Guide of different color patterns/values
<img width="1900" height="904" alt="image" src="https://github.com/user-attachments/assets/67a639b7-2ce0-4325-ba5d-ab48a894ec50" />

## 4. Financial Dashboard
<img width="1902" height="915" alt="image" src="https://github.com/user-attachments/assets/93afcde5-eea0-428d-9ff1-1499e61a6b1e" />

<img width="1450" height="840" alt="image" src="https://github.com/user-attachments/assets/77d897cd-66f4-437d-ac62-9d0395a109de" />

<img width="1454" height="786" alt="image" src="https://github.com/user-attachments/assets/b8f94968-44a1-4e4d-9e91-2f92e5f600f7" />

<img width="1610" height="808" alt="image" src="https://github.com/user-attachments/assets/58f4ddba-b81e-4de7-bbfb-d8d45d4db012" />

## 5. Salary 
<img width="1892" height="903" alt="image" src="https://github.com/user-attachments/assets/5cc58bc9-9d3b-4161-a794-18e17f2756ea" />

## 6. Expenses
<img width="1900" height="904" alt="image" src="https://github.com/user-attachments/assets/a1201b19-7ffb-4d1b-a961-ac38b9bcf967" />

## 7. Budget Planning
<img width="1888" height="889" alt="image" src="https://github.com/user-attachments/assets/8ae137a4-f5fc-4ca5-a02a-b3bd4b68e3c9" />

## 8. Profile
<img width="1877" height="877" alt="image" src="https://github.com/user-attachments/assets/c37ca3ba-e4be-4960-8660-7839d186af95" />

## 9. Dark Theme - DashBoard
<img width="1893" height="908" alt="image" src="https://github.com/user-attachments/assets/f2d793f9-74ac-477a-95cc-a9aa7e572d58" />

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
