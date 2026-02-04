# EatWise - Simple Calorie Tracking Application

A full-stack mobile application for tracking daily food and calorie intake, featuring user and admin roles, reporting, and food search integration.

## 📱 Project Overview

EatWise is built to help users manage their diet by tracking food entries. It includes features for setting daily limits, monitoring progress, and an admin dashboard for usage reporting.

[Watch the Demo Video](./Demo.mp4)
<video src="./Demo.mp4" controls width="600"></video>

### Key Features
- **Food Tracking**: Log meals with date, time, food name, and calorie count.
- **Daily Limit Warning**: Visual indicator when the daily caloric intake exceeds 2,100 kcal.
- **Admin Dashboard**: 
  - Manage all user entries.
  - View weekly comparison reports (entries last 7 days vs prior week).
  - View average calories per user stats.
- **Food Search**: Autocomplete functionality powered by the USDA FoodData Central API.
- **User Management**: Simple token-based authentication with pre-configured users.
- **Invite System**: Built-in widget to invite friends.

## 🛠 Tech Stack

### Frontend
- **Framework**: React Native with Expo (Managed Workflow)
- **Language**: TypeScript
- **Navigation**: Expo Router (File-based routing)
- **State Management**: React Context & Hooks
- **Data Fetching**: Custom HTTP client with Axios-like interface

### Backend
- **Framework**: Spring Boot 4.0.2
- **Language**: Kotlin (JVM 21)
- **Database**: PostgreSQL
- **Key Libraries**: Spring WebFlux, Spring Data JPA, Spring Security
- **API Gateway**: Spring Cloud Gateway (proxies USDA API requests)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- JDK 21
- Docker (optional, for PostgreSQL)
- Android Studio / Xcode (for simulators) or Expo Go app

### 1. Backend Setup

The backend handles API requests, database persistence, and proxies calls to the USDA food API.

1. **Database Configuration**:
   Ensure you have a PostgreSQL database running on port `5432`.
   ```bash
   # Example using Docker
   docker run --name eatwise-db -e POSTGRES_DB=eatwise -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
   ```

2. **Run the Application**:
   Navigate to the `backend` directory and run:
   ```bash
   cd backend
   ./gradlew bootRun
   ```
   The server will start on `http://localhost:8080`.

3. **Data Seeding**:
   The application initializes with seed data defined in `backend/src/main/resources/users.csv`. This file acts as the source of truth for user accounts and tokens during the **initial database setup**.
   *Note: If you modify this file, you must reset the database (drop schemas or delete Docker container) for changes to take effect.*

### 2. Frontend Setup

The mobile application acts as the client.

1. **Install Dependencies**:
   ```bash
   cd app
   npm install
   ```

2. **Configure API Endpoint**:
   Open `app/lib/http/index.ts` and update the `API_BASE_URL` to point to your machine's local IP address (required for physical devices/emulators to reach the backend).
   ```typescript
   // app/lib/http/index.ts
   const API_BASE_URL = (typeof __DEV__ !== 'undefined' && __DEV__)
     ? 'http://YOUR_LOCAL_IP:8080' 
     : 'https://api.eatwise.com';
   ```

3. **Run the App**:
   ```bash
   npx expo start
   ```
   - Press `i` for iOS simulator.
   - Press `a` for Android emulator.
   - Scan QR code with Expo Go.

---

## 🔐 Configuration & Usage

### Authentication
The app uses a simplified token-based authentication system. Users are pre-configured in `backend/src/main/resources/users.csv`.

| Name | Role | Access Token (Snippet) |
|------|------|------------------------|
| Kyle Reese | User | `ElCDiuba...` |
| Administrator | Admin | `PZGZPXaj...` |

**Switching Users (Debug Mode):**
In development builds, a 🐛 **Debug Button** appears on the screen. Tap it to open the **Debug Modal**, which allows you to instantly switch between pre-configured User and Admin accounts without manually entering tokens.

### ⚙️ Administrative Features

#### Daily Calorie Limit
The daily limit is set to **2,100 kcal** by default.
  *(Requires database reset as this runs only on fresh install)*.
- **To change it**: Update the `kcal` column for a specific user in `backend/src/main/resources/users.csv` and restart the backend.

#### Admin Reports
Log in as the Administrator account to access the Admin Panel.
- **Recent Activity**: Compare entry volume between the current week and the previous week.
- **User Averages**: View the average daily calorie intake for each user over the last 7 days.

### 🥗 API Integration
The app uses the **USDA FoodData Central API** for food search.
- **Proxy**: Requests to `/usda/**` on the backend are forwarded to `https://api.nal.usda.gov`.
- **Key**: A generic API key is configured in `application.yaml`.

---

## 🧪 Testing

### Backend
Run unit and integration tests using Gradle:
```bash
cd backend
./gradlew test
```

### Frontend
Run Jest tests:
```bash
cd app
npm test
```
