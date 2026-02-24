# 🔵 Connect Four - Online Multiplayer Game

A real-time multiplayer implementation of the classic "Four-in-row" game, built with a modern stack focusing on scalability and clean architecture.

---

## ⚖️ License & Compliance

This project is licensed under the **[MIT License](LICENSE)**.

### 🔍 Automated License Audit
All third-party dependencies have been verified for compatibility. You can access the full reports here:
* 📄 **Backend Dependency Audit:** [license-backend-report.txt](license-backend-report.txt) (.NET Ecosystem)
* 📄 **Frontend Dependency Audit:** [license-frontend-report.txt](license-frontend-report.txt) (NPM Tree)

### ✍️ Authorship
* **Developer:** Albert Renkas
* **Role:** Software Engineering Student
* **Project:** University Laboratory Works
* **Year:** 2026

---

### ⚠️ Legal Disclaimer
* **Original Game:** This project is a digital implementation of the board game "Connect Four".
* **Trademark:** "Connect Four" is a trademark of **Hasbro, Inc.**
* **Non-Commercial:** This is an educational project created for university purposes only.
* **No Affiliation:** The author is not affiliated with, endorsed by, or sponsored by Hasbro.

---

## ⚙️ Configurations

To ensure the frontend and backend communicate correctly, you need to verify the following configurations in the code:

### 1. Backend (CORS Configuration)
The ASP.NET Core API is configured to accept requests from the Vite development server. 
* **File:** `backend/Four-in-row-api/Program.cs`
* **Configuration:** The `AllowReactApp` policy is set to allow origins from `http://localhost:5173` (default Vite port). If you change your frontend port, you must update this policy.

### 2. Frontend (SignalR Connection)
The React client connects to the backend via WebSockets (SignalR).
* **File:** `src/hooks/api/useSignalR.js`
* **Configuration:** The connection URL is defined as `const HUB_URL = "https://localhost:7170/gameHub";`. Ensure your .NET backend is running on port `7170`.

---
## 📋 Prerequisites

Before running the project, ensure you have the following installed:
* **Backend:** [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
* **Frontend:** [Node.js](https://nodejs.org/) (v22.0 or higher)

---

## 🚀 Basic Commands

Follow these steps to run the project locally. You will need two terminal windows.

### Step 1: Run the Backend (.NET 9.0 API)

```bash
# Navigate to the backend directory
cd backend/Four-in-row-api

# Restore required NuGet packages
dotnet restore

# Build the project
dotnet build

# Run the server
# The API will be available at https://localhost:7170
dotnet run
```

### Step 2: Run the Frontend (React + Vite)


```bash
# Navigate to the root directory of the frontend
# (where package.json is located)

# Install dependencies
npm install

# Start the Vite development server
npm run dev

# To build for production
npm run build

```