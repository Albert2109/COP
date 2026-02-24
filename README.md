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

### Step2: Run the Frontend (React + Vite)


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