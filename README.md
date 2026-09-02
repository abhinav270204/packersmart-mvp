# 📦 PackersMart Platform MVP

**1-Day Full-Stack Developer Assessment Submission**

A full-stack MVP implementing the complete **PackersMart Lead-to-Booking workflow**, featuring customer lead registration, 6-digit OTP verification, automated lead quality scoring, rule-based logistics company matching, and an interactive real-time Admin Lead Management Dashboard.

---

## 🚀 Core Assessment Flow

$$\text{Customer Lead Form} \longrightarrow \text{OTP Verification} \longrightarrow \text{Verified Lead} \longrightarrow \text{Lead Quality Engine} \longrightarrow \text{Logistics Matching} \longrightarrow \text{Admin Dashboard}$$

---

## 🛠️ Technology Stack

| Layer | Technologies Selected | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, React Router v7, Axios | Lightning-fast rendering, modular component architecture, and responsive UX. |
| **Styling** | Vanilla CSS3 (Custom Design System) | Clean logistics aesthetic, CSS variables, glassmorphism, responsive data table, and status badges. |
| **Backend** | Node.js, Express.js, CORS, Dotenv | Lightweight RESTful API server with structured MVC layering (controllers, services, routes, middleware). |
| **Database** | PostgreSQL | Robust relational database ensuring ACID guarantees, foreign keys, and indexes. |
| **ORM** | Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`) | Type-safe queries, clean data modeling, migrations, and automated seeding. |

---

## 📋 Features Implemented

### 1. Customer Lead Registration
- **Responsive Form**: Capture Customer Name, Mobile Number, Email, Pickup City, Destination City, Service Type, Moving Date, and Additional Requirements.
- **Validation**:
  - Client-side validation (10-digit mobile, RFC-compliant email, future date verification, required fields).
  - Centralized server-side validation with informative error messages.
- **Duplicate Detection**: Identifies recent leads with matching phone and route created within the last 24 hours and flags them appropriately (`DUPLICATE`).
- **Quick Demo Autofill**: 1-click preset buttons for instant evaluator testing.

### 2. 6-Digit OTP Verification
- **OTP Generation & Expiry**: Generates a secure 6-digit numeric OTP stored with a 10-minute expiry window in the database.
- **Backend Terminal Dispatch Simulation**: Cleanly formats and logs the OTP in the backend server console with customer details and expiry timestamp for easy evaluator testing.
- **Countdown Timer & Resend**: Dynamic 10-minute countdown with a Resend OTP capability.
- **Status Progression**: Correct OTP transitions lead status from `PENDING` $\rightarrow$ `VERIFIED`, immediately triggering the Lead Quality Engine and Logistics Matching Algorithm.
- **Audit Logging**: Every OTP generation and verification timestamp is logged in the `OtpVerification` table.

### 3. Lead Quality Scoring Engine
- Calculates a quantitative **Lead Score (0–100 Points)** and classifies verified leads into **HOT**, **WARM**, or **COLD**:
  - **HOT Lead (80–100 pts)**: High conversion intent, near-term moving date (within 30 days), verified contact details, complete specifications.
  - **WARM Lead (50–79 pts)**: Standard moving timeline (31–60 days), valid contact details.
  - **COLD Lead (0–49 pts)**: Far-off moving timeline (> 60 days) or minimal scope.

### 4. Rule-Based Logistics Company Matching
- **8 Pre-Seeded Logistics Partners** covering major Indian transport corridors (Delhi, Mumbai, Bangalore, Pune, Hyderabad, Chennai, Noida, Gurgaon, Jaipur, etc.).
- **Matching Algorithm (Max 100 pts)**:
  - **Pickup City in Coverage**: $+40$ pts
  - **Destination City in Coverage**: $+40$ pts
  - **Service Type Match**: $+20$ pts
- Qualified active partners with $\text{score} \ge 60$ are matched and stored in the `LeadCompanyMatch` table with match explanations.

### 5. Admin Lead Management Dashboard & Analytics
- **Real-Time KPI Cards**: Total Leads, Verified Leads, Pending OTP, Hot Leads, Warm Leads, Cold Leads, Fake Leads, Duplicate Leads, and Matched Movers Count.
- **Dynamic Database Aggregation**: All statistics are computed directly from PostgreSQL via `GET /api/dashboard` (zero hardcoded values).
- **Interactive Lead Queue Table**:
  - Search by customer name, mobile, email, or city.
  - Filter by Lead Status (`ALL`, `PENDING`, `VERIFIED`, `FAKE`, `DUPLICATE`, `RE_ATTEMPT`).
  - Filter by Lead Quality (`ALL`, `HOT`, `WARM`, `COLD`).
  - **Inline Status Switcher**: Update any lead's status instantly with optimistic UI feedback.
- **Detailed Lead Inspector (`/admin/leads/:id`)**:
  - Full customer and relocation itinerary breakdown.
  - Lead Quality Score gauge and itemized scoring breakdown.
  - OTP verification history and timestamps.
  - Matched logistics partners with ratings, service areas, and match percentages.

---

## 🧮 Business Logic & Scoring Rules

### A. Lead Quality Scoring Formula (Total: 100 Points)

$$\text{Total Score} = \text{OTP Verified} + \text{Urgency} + \text{Contacts} + \text{Route Scope} + \text{Requirements} + \text{Service Type}$$

| Criteria | Points | Condition |
| :--- | :--- | :--- |
| **1. OTP Verification** | $+20$ pts | Lead mobile OTP successfully verified |
| **2. Moving Timeline Urgency** | $+25$ pts | Moving within 1–7 days |
| | $+20$ pts | Moving within 8–30 days |
| | $+15$ pts | Moving within 31–60 days |
| | $+10$ pts | Moving after 60+ days |
| **3. Contact Completeness** | $+10$ pts | Valid 10-digit Indian phone number |
| | $+10$ pts | Valid email address format |
| **4. Route Complexity** | $+15$ pts | Inter-city move (Pickup City $\ne$ Destination City) |
| | $+10$ pts | Intra-city / Local shifting |
| **5. Requirements Detail** | $+10$ pts | Scope notes provided ($> 10$ characters) |
| | $+5$ pts | Brief notes ($1-9$ characters) |
| **6. High-Demand Service** | $+10$ pts | Household, Office, or Vehicle transportation |

**Quality Thresholds**:
- 🔥 **HOT**: Score $\ge 80$
- ⚡ **WARM**: Score $50 - 79$
- ❄️ **COLD**: Score $< 50$

---

### B. Logistics Company Matching Algorithm

Evaluates all `ACTIVE` logistics partners in the database:
1. **Pickup Coverage**: $+40$ pts if company operates in the customer's pickup city.
2. **Destination Coverage**: $+40$ pts if company operates in the destination city.
3. **Service Type Match**: $+20$ pts if company supports the requested service type (e.g. Household, Office, Vehicle).
4. **Qualification Threshold**: Companies with $\text{score} \ge 60$ are selected.
5. **Ranking**: Matches are sorted primarily by `matchScore` (descending) and secondarily by company `rating` (descending).
6. **Persistence**: Matches are stored in the relational `LeadCompanyMatch` table.

---

## 🔌 API Documentation

Base URL: `http://localhost:5000/api`

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Verifies backend server health.
- **Response**:
```json
{
  "success": true,
  "message": "PackersMart API is running smoothly",
  "timestamp": "2026-09-02T10:00:00.000Z"
}
```

### 2. Create Lead
- **Endpoint**: `POST /api/leads`
- **Description**: Registers a customer moving quote lead and generates a 6-digit OTP.
- **Request Body**:
```json
{
  "customerName": "Rahul Sharma",
  "mobile": "9876543210",
  "email": "rahul.sharma@example.com",
  "pickupCity": "Delhi",
  "destinationCity": "Mumbai",
  "serviceType": "Household",
  "movingDate": "2026-09-15T00:00:00.000Z",
  "additionalRequirements": "2BHK relocation with fragile glassware handling."
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Lead registered successfully. Please verify the OTP.",
  "lead": {
    "id": 1,
    "customerName": "Rahul Sharma",
    "mobile": "9876543210",
    "email": "rahul.sharma@example.com",
    "pickupCity": "Delhi",
    "destinationCity": "Mumbai",
    "serviceType": "Household",
    "status": "PENDING"
  },
  "otp": "725721",
  "expiresAt": "2026-09-02T10:10:00.000Z"
}
```

### 3. Verify OTP
- **Endpoint**: `POST /api/leads/:id/verify-otp`
- **Description**: Verifies the 6-digit OTP, updates status to `VERIFIED`, triggers lead scoring and company matching.
- **Request Body**:
```json
{
  "otp": "725721"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "OTP verified successfully. Lead quality scored and logistics partners matched.",
  "lead": {
    "id": 1,
    "status": "VERIFIED",
    "leadScore": 100,
    "leadQuality": "HOT"
  },
  "scoringBreakdown": {
    "otpVerified": 20,
    "movingUrgency": 25,
    "contactValidity": 20,
    "routeScope": 15,
    "requirementsDetail": 10,
    "serviceType": 10
  },
  "matchedCompanies": [
    {
      "companyId": 1,
      "companyName": "Delhi Movers",
      "rating": 4.5,
      "matchScore": 100,
      "matchReasons": [
        "Pickup city (Delhi) in service area",
        "Destination city (Mumbai) in service area",
        "Offers Household moving services"
      ]
    }
  ]
}
```

### 4. Get Leads Queue
- **Endpoint**: `GET /api/leads?status=ALL&quality=ALL&search=delhi`
- **Description**: Lists all leads with optional filtering and search.
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 1,
  "leads": [...]
}
```

### 5. Get Lead Details
- **Endpoint**: `GET /api/leads/:id`
- **Description**: Fetches single lead with OTP history and matched companies.

### 6. Update Lead Status
- **Endpoint**: `PATCH /api/leads/:id/status`
- **Request Body**:
```json
{
  "status": "RE_ATTEMPT"
}
```
- **Supported Statuses**: `PENDING`, `VERIFIED`, `FAKE`, `DUPLICATE`, `RE_ATTEMPT`

### 7. Get Matching Companies
- **Endpoint**: `GET /api/leads/:id/matching-companies`
- **Description**: Returns all qualified logistics matches for a lead.

### 8. Get Dashboard Statistics
- **Endpoint**: `GET /api/dashboard`
- **Description**: Returns real-time database-backed KPI statistics.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalLeads": 12,
      "verifiedLeads": 9,
      "pendingLeads": 2,
      "fakeLeads": 1,
      "duplicateLeads": 0,
      "reattemptLeads": 0
    },
    "qualityDistribution": {
      "hot": 6,
      "warm": 3,
      "cold": 0
    },
    "matchingStats": {
      "totalCompanies": 8,
      "activeCompanies": 8,
      "totalMatchesCreated": 42,
      "leadsWithMatches": 9
    }
  }
}
```

---

## 🗄️ Database Schema

PostgreSQL schema managed via Prisma ORM (and exported in [database.sql](file:///c:/Users/Asus/Downloads/packersmart-mvp/database.sql)):

```mermaid
erDiagram
    LEAD ||--o{ OTP_VERIFICATION : "has"
    LEAD ||--o{ LEAD_COMPANY_MATCH : "matches"
    COMPANY ||--o{ LEAD_COMPANY_MATCH : "matched_in"

    LEAD {
        int id PK
        string customerName
        string mobile
        string email
        string pickupCity
        string destinationCity
        string serviceType
        datetime movingDate
        string additionalRequirements
        LeadStatus status "PENDING | VERIFIED | FAKE | DUPLICATE | RE_ATTEMPT"
        int leadScore
        LeadQuality leadQuality "HOT | WARM | COLD"
        datetime createdAt
    }

    OTP_VERIFICATION {
        int id PK
        int leadId FK
        string otp
        datetime expiresAt
        datetime verifiedAt
        datetime createdAt
    }

    COMPANY {
        int id PK
        string companyName
        string[] coverage
        string[] serviceTypes
        float rating
        CompanyStatus status "ACTIVE | INACTIVE"
        datetime createdAt
    }

    LEAD_COMPANY_MATCH {
        int id PK
        int leadId FK
        int companyId FK
        int matchScore
        string notificationStatus
        datetime createdAt
    }
```

---

## 💻 Local Setup & Execution Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **PostgreSQL**: Local running instance on `localhost:5432`

### 2. Backend Setup
```bash
cd server
npm install
```

Ensure `.env` contains your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:Admin@localhost:5432/packersmart"
PORT=5000
```

Run migrations, generate client, seed sample companies, and start backend:
```bash
# Push schema & generate client
npx prisma db push
npx prisma generate

# Seed 8 sample logistics companies
node prisma/seed.js

# Start Express server
npm run dev
```
Backend will be live at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173`.

### 4. Running Automated API Test Suite
```bash
cd server
node test-apis.js
```

---

## 🧪 Verification Walkthrough

1. Open `http://localhost:5173/` in your browser.
2. Click **"⚡ Quick Demo Autofill"** to populate sample data.
3. Click **"Get Free Moving Quotes ➔"** to submit the lead.
4. On the OTP screen, click **"⚡ 1-Click Auto-Fill"** to fill the simulated test OTP.
5. Click **"Verify & Find Best Movers ➔"**.
6. View the verified status, **HOT** quality badge, score progress bar, and matched logistics companies.
7. Click **"View in Admin Dashboard ➔"** to inspect KPI metric cards and test the inline status switcher.
