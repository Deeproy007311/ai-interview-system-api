# 🧪 AI Interview System API — Full Postman Test Guide

> **Base URL**: `http://localhost:3000`  
> **Auth**: Bearer JWT — copy `accessToken` from Register/Login and set it in the `Authorization` header as `Bearer <token>`

---

## ⚙️ Setup: Environment Variables

Create a Postman **Environment** with these variables:

| Variable | Initial Value | Description |
|---|---|---|
| `BASE_URL` | `http://localhost:3000` | API base URL |
| `TOKEN` | _(auto-set via test script)_ | JWT access token |
| `INTERVIEW_ID` | _(auto-set)_ | Created interview ID |
| `RESUME_ID` | _(auto-set)_ | Uploaded resume ID |

---

## 📁 FOLDER 1 — Auth / Users

### 1️⃣ Register User

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `{{BASE_URL}}/api/users/register` |
| **Body** | `raw → JSON` |

```json
{
  "name": "Deep Roy",
  "email": "deep@example.com",
  "password": "Test@1234"
}
```

**Expected Response** `201`:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

**Postman Test Script** (auto-saves token):
```javascript
const json = pm.response.json();
pm.environment.set("TOKEN", json.accessToken);
pm.test("Status 201", () => pm.response.to.have.status(201));
pm.test("Has accessToken", () => pm.expect(json.accessToken).to.be.a("string"));
```

---

### 2️⃣ Login User

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `{{BASE_URL}}/api/users/login` |
| **Body** | `raw → JSON` |

```json
{
  "email": "deep@example.com",
  "password": "Test@1234"
}
```

**Expected Response** `200`:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

**Postman Test Script**:
```javascript
const json = pm.response.json();
pm.environment.set("TOKEN", json.accessToken);
pm.test("Status 200", () => pm.response.to.have.status(200));
pm.test("Has accessToken", () => pm.expect(json.accessToken).to.be.a("string"));
```

---

### 3️⃣ Get Current User (Protected)

| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `{{BASE_URL}}/api/users/me` |
| **Headers** | `Authorization: Bearer {{TOKEN}}` |

**Expected Response** `200`:
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Deep Roy",
    "email": "deep@example.com"
  }
}
```

**Error cases to test:**
- No token → `401 Unauthorized`
- Invalid/expired token → `401 Unauthorized`

---

## 📁 FOLDER 2 — Resume

> ⚠️ Uses `form-data` (multipart), NOT JSON. Required for `resume` and `mixed` interview modes.

### 4️⃣ Upload Resume (PDF)

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `{{BASE_URL}}/api/resumes/upload` |
| **Headers** | `Authorization: Bearer {{TOKEN}}` |
| **Body** | `form-data` |

**Body form-data:**
| Key | Type | Value |
|---|---|---|
| `resume` | File | _(select a PDF file from your machine)_ |

**Expected Response** `200/201`:
```json
{
  "success": true,
  "data": {
    "_id": "6876abc...",
    "owner": "6876...",
    "extractedText": "John Doe\nSoftware Engineer...",
    "cloudinaryUrl": "https://res.cloudinary.com/..."
  }
}
```

**Postman Test Script**:
```javascript
const json = pm.response.json();
pm.environment.set("RESUME_ID", json.data._id);
pm.test("Resume uploaded", () => pm.response.to.have.status(200));
pm.test("Has _id", () => pm.expect(json.data._id).to.be.a("string"));
```

---

### 5️⃣ Get My Resume

| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `{{BASE_URL}}/api/resumes/me` |
| **Headers** | `Authorization: Bearer {{TOKEN}}` |

**Expected Response** `200`:
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 📁 FOLDER 3 — Interview (Core)

### 6️⃣ Create Interview — Mode: `skills`

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `{{BASE_URL}}/api/interviews` |
| **Headers** | `Authorization: Bearer {{TOKEN}}` |
| **Body** | `raw → JSON` |

```json
{
  "mode": "skills",
  "skills": ["Node.js", "TypeScript", "MongoDB"],
  "difficulty": "intermediate",
  "duration": 30
}
```

**Expected Response** `201`:
```json
{
  "success": true,
  "message": "Interview created successfully",
  "data": {
    "_id": "6876xyz...",
    "owner": "6876...",
    "mode": "skills",
    "skills": ["Node.js", "TypeScript", "MongoDB"],
    "difficulty": "intermediate",
    "duration": 30,
    "status": "pending",
    "resume": null,
    "experienceLevel": null,
    "interviewPlan": null,
    "welcomeMessage": null,
    "startedAt": null,
    "endedAt": null
  }
}
```

**Postman Test Script**:
```javascript
const json = pm.response.json();
pm.environment.set("INTERVIEW_ID", json.data._id);
pm.test("Status 201", () => pm.response.to.have.status(201));
pm.test("status is pending", () => pm.expect(json.data.status).to.eql("pending"));
```

---

### 7️⃣ Create Interview — Mode: `hr`

```json
{
  "mode": "hr",
  "difficulty": "beginner",
  "duration": 20,
  "experienceLevel": "fresher"
}
```

---

### 8️⃣ Create Interview — Mode: `resume`

> ⚠️ Requires a valid `RESUME_ID` from step 4.

```json
{
  "mode": "resume",
  "difficulty": "advanced",
  "duration": 45,
  "resume": "{{RESUME_ID}}"
}
```

---

### 9️⃣ Create Interview — Mode: `mixed`

```json
{
  "mode": "mixed",
  "difficulty": "intermediate",
  "duration": 40,
  "resume": "{{RESUME_ID}}",
  "skills": ["React", "Node.js"]
}
```

---

### 🔟 Get All My Interviews

| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `{{BASE_URL}}/api/interviews` |
| **Headers** | `Authorization: Bearer {{TOKEN}}` |

**Expected Response** `200`:
```json
{
  "success": true,
  "data": [
    { "_id": "...", "mode": "skills", "status": "pending", ... }
  ]
}
```

---

### 1️⃣1️⃣ Get Interview By ID

| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `{{BASE_URL}}/api/interviews/{{INTERVIEW_ID}}` |
| **Headers** | `Authorization: Bearer {{TOKEN}}` |

**Expected Response** `200`:
```json
{
  "success": true,
  "data": { "_id": "...", "status": "pending", ... }
}
```

---

### 1️⃣2️⃣ ⭐ Start Interview (AI Engine)

> This is the most critical endpoint — calls the AI, generates questions, saves them, and returns the first question.

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `{{BASE_URL}}/api/interviews/{{INTERVIEW_ID}}/start` |
| **Headers** | `Authorization: Bearer {{TOKEN}}` |
| **Body** | _(none — no body required)_ |

**Expected Response** `200`:
```json
{
  "success": true,
  "message": "Interview started successfully",
  "data": {
    "welcomeMessage": "Welcome to your AI-powered technical interview! We'll be covering Node.js, TypeScript, and MongoDB today...",
    "interviewPlan": {
      "estimatedDuration": 30,
      "sections": [
        { "name": "introduction", "questions": 2 },
        { "name": "technical", "questions": 8 },
        { "name": "closing", "questions": 1 }
      ]
    },
    "firstQuestion": {
      "id": "6876abc123...",
      "order": 1,
      "section": "introduction",
      "question": "Can you start by introducing yourself and briefly describing your experience with Node.js?"
    },
    "totalQuestions": 11
  }
}
```

**Postman Test Script**:
```javascript
const json = pm.response.json();
pm.test("Status 200", () => pm.response.to.have.status(200));
pm.test("Has welcomeMessage", () => pm.expect(json.data.welcomeMessage).to.be.a("string"));
pm.test("Has firstQuestion", () => pm.expect(json.data.firstQuestion).to.have.property("id"));
pm.test("Has totalQuestions", () => pm.expect(json.data.totalQuestions).to.be.a("number"));
pm.environment.set("FIRST_QUESTION_ID", json.data.firstQuestion.id);
```

---

## 📁 FOLDER 4 — Error / Edge Cases

### ❌ Validation Errors

| Test | Method | URL | Body | Expected |
|---|---|---|---|---|
| Missing fields on register | POST | `/api/users/register` | `{}` | `400 All fields are required` |
| Wrong password login | POST | `/api/users/login` | wrong password | `401 Password Does Not Match` |
| No auth token | GET | `/api/interviews` | — | `401 Unauthorized` |
| Invalid interview ID format | GET | `/api/interviews/not-valid-id` | — | `400 Invalid interview id.` |
| Start already in_progress interview | POST | `/api/interviews/{{INTERVIEW_ID}}/start` | — | `400 Interview is already in progress.` |
| Create interview while one active | POST | `/api/interviews` | valid body | `409 You already have an active interview.` |
| skills mode without skills | POST | `/api/interviews` | `mode: "skills", skills: []` | `400 Please select at least one skill.` |
| hr mode without experienceLevel | POST | `/api/interviews` | `mode: "hr"` | `400 Experience level is required.` |
| resume mode without resume field | POST | `/api/interviews` | `mode: "resume"` | `400 Resume is required for resume interview.` |
| Access another user's interview | GET | `/api/interviews/:otherId` | — | `403 You are not allowed to access this interview.` |

---

## 🔁 Full Happy Path (Ordered Execution)

Run these in order for a complete end-to-end flow:

```
1. POST /api/users/register      → Get TOKEN
2. POST /api/resumes/upload      → Get RESUME_ID (if using resume mode)
3. POST /api/interviews          → Get INTERVIEW_ID  (mode: skills)
4. GET  /api/interviews          → Verify interview listed
5. GET  /api/interviews/:id      → Verify details
6. POST /api/interviews/:id/start → AI generates questions, get firstQuestion
```

> [!IMPORTANT]  
> Step 6 (`/start`) may take **5–15 seconds** because it calls the Groq AI API. Increase Postman timeout to **30 seconds** under `Settings → General → Request timeout`.

> [!NOTE]  
> The engine has **idempotency** built-in. If `/start` is called a second time after questions are already saved (but status flip failed), it will **reuse existing questions** rather than calling AI again.
