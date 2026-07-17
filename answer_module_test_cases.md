# 🧪 Answer Module — Postman Test Cases

> **Base URL**: `http://localhost:3000`  
> **Auth**: `Authorization: Bearer {{TOKEN}}`  
> **Endpoint**: `POST /api/interviews/:id/answer`

---

## ⚙️ Required Environment Variables

| Variable | Set By | Description |
|---|---|---|
| `BASE_URL` | Manual | `http://localhost:3000` |
| `TOKEN` | Login/Register test script | JWT access token |
| `INTERVIEW_ID` | Create interview script | Active interview ID |
| `FIRST_QUESTION_ID` | Start interview script | ID of the first asked question |
| `NEXT_QUESTION_ID` | Submit answer script | ID of the next question |

> **Prerequisites**: Run the full happy-path setup from `postman_test_cases.md` up through step 12 (Start Interview) before running these tests. `FIRST_QUESTION_ID` must be set.

---

## 📁 FOLDER 5 — Submit Answer (Happy Path)

### 1️⃣ Submit Answer — First Question (Gets Next Question)

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `{{BASE_URL}}/api/interviews/{{INTERVIEW_ID}}/answer` |
| **Headers** | `Authorization: Bearer {{TOKEN}}` |
| **Body** | `raw → JSON` |

```json
{
  "questionId": "{{FIRST_QUESTION_ID}}",
  "transcript": "I have been working as a Node.js developer for the past 3 years. I started with basic REST APIs, then moved into microservices. I have hands-on experience with Express, TypeScript, and MongoDB. I've also worked on deploying services on AWS using ECS and Lambda."
}
```

**Expected Response** `200`:
```json
{
  "success": true,
  "message": "Answer submitted successfully",
  "data": {
    "interviewComplete": false,
    "nextQuestion": {
      "id": "6876abc456...",
      "order": 2,
      "section": "technical",
      "question": "Can you explain the event loop in Node.js?"
    },
    "totalQuestions": 11
  }
}
```

**Postman Test Script**:
```javascript
const json = pm.response.json();
pm.test("Status 200", () => pm.response.to.have.status(200));
pm.test("success is true", () => pm.expect(json.success).to.be.true);
pm.test("interviewComplete is false", () => pm.expect(json.data.interviewComplete).to.be.false);
pm.test("nextQuestion has id", () => pm.expect(json.data.nextQuestion).to.have.property("id"));
pm.test("nextQuestion has question text", () => pm.expect(json.data.nextQuestion.question).to.be.a("string"));
pm.test("totalQuestions is a number", () => pm.expect(json.data.totalQuestions).to.be.a("number"));

// Save next question ID for chained tests
if (json.data.nextQuestion) {
  pm.environment.set("NEXT_QUESTION_ID", json.data.nextQuestion.id);
}
```

---

### 2️⃣ Submit Answer — Second Question (Continue Chain)

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `{{BASE_URL}}/api/interviews/{{INTERVIEW_ID}}/answer` |
| **Body** | `raw → JSON` |

```json
{
  "questionId": "{{NEXT_QUESTION_ID}}",
  "transcript": "The Node.js event loop is a mechanism that allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded. It uses libuv under the hood. The loop has phases: timers, pending callbacks, idle/prepare, poll, check, and close callbacks. The poll phase is where it waits for I/O events."
}
```

**Postman Test Script**:
```javascript
const json = pm.response.json();
pm.test("Status 200", () => pm.response.to.have.status(200));
pm.test("Answer submitted", () => pm.expect(json.success).to.be.true);

if (json.data.nextQuestion) {
  pm.environment.set("NEXT_QUESTION_ID", json.data.nextQuestion.id);
  pm.test("Next question provided", () => pm.expect(json.data.nextQuestion.id).to.be.a("string"));
} else {
  pm.test("Interview complete", () => pm.expect(json.data.interviewComplete).to.be.true);
}
```

---

### 3️⃣ Submit Answer — Last Question (Interview Completes)

> ⚠️ Run this after all previous questions are answered. `NEXT_QUESTION_ID` should hold the last question's ID.

```json
{
  "questionId": "{{NEXT_QUESTION_ID}}",
  "transcript": "Thank you for the interview. I am very interested in joining your team. I believe my experience with Node.js and TypeScript aligns well with the role requirements."
}
```

**Expected Response** `200`:
```json
{
  "success": true,
  "message": "Interview completed",
  "data": {
    "interviewComplete": true,
    "nextQuestion": null,
    "totalQuestions": 11
  }
}
```

**Postman Test Script**:
```javascript
const json = pm.response.json();
pm.test("Status 200", () => pm.response.to.have.status(200));
pm.test("Interview is complete", () => pm.expect(json.data.interviewComplete).to.be.true);
pm.test("nextQuestion is null", () => pm.expect(json.data.nextQuestion).to.be.null);
pm.test("message says completed", () => pm.expect(json.message).to.include("completed"));
pm.test("totalQuestions returned", () => pm.expect(json.data.totalQuestions).to.be.a("number"));
```

---

## 📁 FOLDER 6 — Submit Answer (Follow-Up Logic)

> **Context**: The AI may trigger a follow-up question if the candidate's answer is vague or incomplete. This adds a new question to the interview.

### 4️⃣ Submit a Weak / Vague Answer (Triggers Follow-Up)

> Use a deliberately shallow answer to trigger `needsFollowUp: true` from the AI evaluator.

```json
{
  "questionId": "{{FIRST_QUESTION_ID}}",
  "transcript": "Node.js is fast. I use it for APIs."
}
```

**Expected Response** `200` _(if follow-up triggered)_:
```json
{
  "success": true,
  "message": "Answer submitted successfully",
  "data": {
    "interviewComplete": false,
    "nextQuestion": {
      "id": "...",
      "order": 12,
      "section": "technical",
      "question": "Can you elaborate on why Node.js is fast compared to traditional server-side languages?"
    },
    "totalQuestions": 12
  }
}
```

**Postman Test Script**:
```javascript
const json = pm.response.json();
pm.test("Status 200", () => pm.response.to.have.status(200));
pm.test("success is true", () => pm.expect(json.success).to.be.true);

if (json.data.nextQuestion && json.data.totalQuestions > 11) {
  // Follow-up was triggered
  pm.test("Follow-up question created", () =>
    pm.expect(json.data.nextQuestion.id).to.be.a("string")
  );
  pm.test("Total questions increased by 1", () =>
    pm.expect(json.data.totalQuestions).to.be.above(11)
  );
  pm.environment.set("NEXT_QUESTION_ID", json.data.nextQuestion.id);
}
```

---

### 5️⃣ Submit a Follow-Up Answer (Follow-Up Cannot Spawn Another Follow-Up)

> Answer the follow-up question — even with a weak answer. The system must NOT create a second-level follow-up (follow-ups are capped at one level deep).

```json
{
  "questionId": "{{NEXT_QUESTION_ID}}",
  "transcript": "I think it's because of async operations."
}
```

**Expected Response** `200`:
- `nextQuestion` should advance to the **next original question**, never another follow-up for the same topic.
- `totalQuestions` should remain the same as after the follow-up was added.

**Postman Test Script**:
```javascript
const json = pm.response.json();
pm.test("Status 200", () => pm.response.to.have.status(200));
pm.test("No second-level follow-up", () => {
  // totalQuestions should NOT have grown again
  const total = json.data.totalQuestions;
  pm.expect(total).to.be.a("number");
});
```

---

## 📁 FOLDER 7 — Validation & Error Cases

### 6️⃣ Missing `questionId`

```json
{
  "transcript": "My answer here."
}
```

**Expected Response** `400`:
```json
{
  "message": "questionId and transcript are required."
}
```

**Postman Test Script**:
```javascript
pm.test("Status 400", () => pm.response.to.have.status(400));
pm.test("Error message present", () => {
  const json = pm.response.json();
  pm.expect(json.message).to.include("required");
});
```

---

### 7️⃣ Missing `transcript`

```json
{
  "questionId": "{{FIRST_QUESTION_ID}}"
}
```

**Expected Response** `400`:
```json
{
  "message": "questionId and transcript are required."
}
```

**Postman Test Script**:
```javascript
pm.test("Status 400", () => pm.response.to.have.status(400));
pm.test("Requires transcript", () => {
  const json = pm.response.json();
  pm.expect(json.message).to.include("required");
});
```

---

### 8️⃣ Empty / Whitespace-Only `transcript`

```json
{
  "questionId": "{{FIRST_QUESTION_ID}}",
  "transcript": "     "
}
```

**Expected Response** `400`:
```json
{
  "message": "Answer transcript is required."
}
```

**Postman Test Script**:
```javascript
pm.test("Status 400", () => pm.response.to.have.status(400));
pm.test("Empty transcript rejected", () => {
  const json = pm.response.json();
  pm.expect(json.message).to.include("transcript");
});
```

---

### 9️⃣ Invalid `questionId` Format (Non-ObjectId String)

```json
{
  "questionId": "not-a-valid-id",
  "transcript": "Some answer."
}
```

**Expected Response** `400`:
```json
{
  "message": "Invalid question id."
}
```

**Postman Test Script**:
```javascript
pm.test("Status 400", () => pm.response.to.have.status(400));
pm.test("Invalid questionId rejected", () => {
  const json = pm.response.json();
  pm.expect(json.message).to.include("Invalid question id");
});
```

---

### 🔟 Invalid `interviewId` in URL (Non-ObjectId)

| Field | Value |
|---|---|
| **URL** | `{{BASE_URL}}/api/interviews/not-valid/answer` |

```json
{
  "questionId": "{{FIRST_QUESTION_ID}}",
  "transcript": "Some answer."
}
```

**Expected Response** `400`:
```json
{
  "message": "Invalid interview id."
}
```

---

### 1️⃣1️⃣ Submit Answer Without Auth Token

> Remove the `Authorization` header entirely.

```json
{
  "questionId": "{{FIRST_QUESTION_ID}}",
  "transcript": "Some answer."
}
```

**Expected Response** `401`:
```json
{
  "message": "Unauthorized"
}
```

**Postman Test Script**:
```javascript
pm.test("Status 401", () => pm.response.to.have.status(401));
```

---

### 1️⃣2️⃣ Submit Answer to a `pending` Question (Not Yet Asked)

> Use the ID of a question that has NOT been marked `asked` yet (any question other than the current one).

```json
{
  "questionId": "<ID_OF_A_PENDING_QUESTION>",
  "transcript": "Trying to skip ahead."
}
```

**Expected Response** `400`:
```json
{
  "message": "This question has not been asked yet."
}
```

---

### 1️⃣3️⃣ Submit Answer to an Already `evaluated` Question (Duplicate Submission)

> After completing Q1 fully (transcript saved + evaluation done), try submitting for it again.

```json
{
  "questionId": "{{FIRST_QUESTION_ID}}",
  "transcript": "Trying to re-submit my answer."
}
```

**Expected Response** `409`:
```json
{
  "message": "This question has already been answered."
}
```

**Postman Test Script**:
```javascript
pm.test("Status 409", () => pm.response.to.have.status(409));
pm.test("Duplicate submission blocked", () => {
  const json = pm.response.json();
  pm.expect(json.message).to.include("already been answered");
});
```

---

### 1️⃣4️⃣ Submit Answer to a Question Belonging to a Different Interview

> Use a valid `questionId` that belongs to a **different** interview than the one in the URL.

```json
{
  "questionId": "<QUESTION_ID_FROM_OTHER_INTERVIEW>",
  "transcript": "My answer."
}
```

**Expected Response** `400`:
```json
{
  "message": "This question does not belong to this interview."
}
```

**Postman Test Script**:
```javascript
pm.test("Status 400", () => pm.response.to.have.status(400));
pm.test("Cross-interview question rejected", () => {
  const json = pm.response.json();
  pm.expect(json.message).to.include("does not belong");
});
```

---

### 1️⃣5️⃣ Submit Answer When Interview Is Not `in_progress`

> Use an interview that is still in `pending` status (not yet started).

| Field | Value |
|---|---|
| **URL** | `{{BASE_URL}}/api/interviews/<PENDING_INTERVIEW_ID>/answer` |

```json
{
  "questionId": "...",
  "transcript": "Trying to answer before interview starts."
}
```

**Expected Response** `400`:
```json
{
  "message": "You can only submit answers for an interview that is in progress."
}
```

---

### 1️⃣6️⃣ Access Another User's Interview (Authorization Check)

> Login as a different user and try to submit an answer to the first user's interview.

```json
{
  "questionId": "{{FIRST_QUESTION_ID}}",
  "transcript": "Unauthorized access attempt."
}
```

**Expected Response** `403`:
```json
{
  "message": "You are not allowed to access this interview."
}
```

---

## 📁 FOLDER 8 — Idempotency / Retry Scenarios

### 1️⃣7️⃣ Retry After Partial Failure (Transcript Saved, Evaluation Failed)

> **Simulates**: The AI evaluation call failed mid-way after the transcript was saved. On retry, `createOrUpdateAnswer` should reuse the existing record and update the transcript rather than failing on the unique index.

**Scenario**: Submit the same `questionId` a second time (with the question still in `asked` status — meaning evaluation didn't complete on the first attempt).

```json
{
  "questionId": "{{FIRST_QUESTION_ID}}",
  "transcript": "Revised / retried answer after a network failure."
}
```

**Expected Response** `200`:
- The existing answer record is updated with the new transcript.
- Evaluation runs and the question progresses to `evaluated`.
- No `409` duplicate error is thrown.

**Postman Test Script**:
```javascript
const json = pm.response.json();
pm.test("Status 200", () => pm.response.to.have.status(200));
pm.test("Retry succeeds without conflict", () => pm.expect(json.success).to.be.true);
```

---

## 📁 FOLDER 9 — Response Shape Validation

### 1️⃣8️⃣ Validate Full Response Shape on Success

```json
{
  "questionId": "{{FIRST_QUESTION_ID}}",
  "transcript": "The event loop allows Node to handle concurrent I/O without threads via a non-blocking model backed by libuv."
}
```

**Postman Test Script** (comprehensive shape check):
```javascript
const json = pm.response.json();

pm.test("Status 200", () => pm.response.to.have.status(200));
pm.test("success field is boolean true", () => {
  pm.expect(json.success).to.be.a("boolean").and.to.be.true;
});
pm.test("message field is a string", () => {
  pm.expect(json.message).to.be.a("string");
});
pm.test("data object exists", () => {
  pm.expect(json.data).to.be.an("object");
});
pm.test("data.interviewComplete is boolean", () => {
  pm.expect(json.data.interviewComplete).to.be.a("boolean");
});
pm.test("data.totalQuestions is a positive integer", () => {
  pm.expect(json.data.totalQuestions).to.be.a("number").and.to.be.above(0);
});

if (!json.data.interviewComplete) {
  pm.test("nextQuestion has id (string)", () =>
    pm.expect(json.data.nextQuestion.id).to.be.a("string")
  );
  pm.test("nextQuestion has order (number)", () =>
    pm.expect(json.data.nextQuestion.order).to.be.a("number")
  );
  pm.test("nextQuestion has section (string)", () =>
    pm.expect(json.data.nextQuestion.section).to.be.a("string")
  );
  pm.test("nextQuestion has question text (string)", () =>
    pm.expect(json.data.nextQuestion.question).to.be.a("string")
  );
  pm.environment.set("NEXT_QUESTION_ID", json.data.nextQuestion.id);
} else {
  pm.test("nextQuestion is null when complete", () =>
    pm.expect(json.data.nextQuestion).to.be.null
  );
}
```

---

## 🔁 Full Happy Path — Answer Submission Flow

Run these in order for a complete end-to-end test:

```
1.  POST /api/users/register                        → Get TOKEN
2.  POST /api/interviews                            → Get INTERVIEW_ID (mode: skills)
3.  POST /api/interviews/{{INTERVIEW_ID}}/start     → Get FIRST_QUESTION_ID
4.  POST /api/interviews/{{INTERVIEW_ID}}/answer    → Submit Q1, get NEXT_QUESTION_ID
5.  POST /api/interviews/{{INTERVIEW_ID}}/answer    → Submit Q2, chain continues
6.  ...
N.  POST /api/interviews/{{INTERVIEW_ID}}/answer    → Submit last Q, interviewComplete: true
```

> [!IMPORTANT]  
> The `/answer` endpoint calls the **Groq AI API** for each submission (evaluation). Each call may take **5–15 seconds**. Set Postman timeout to **30 seconds** under `Settings → General → Request timeout`.

> [!NOTE]  
> The engine uses **idempotency** on the answer layer. If the AI evaluation fails after the transcript is saved, resubmitting the same `questionId` will **update the existing transcript** rather than creating a duplicate — preventing a `409` unique-index conflict.

> [!TIP]  
> Use Postman **Collection Runner** with a delay of `15000ms` between requests to avoid hitting Groq rate limits during a full end-to-end run.

---

## 📋 Quick Reference — Error Matrix

| Scenario | Status | Message |
|---|---|---|
| Missing `questionId` or `transcript` in body | `400` | `questionId and transcript are required.` |
| Empty / whitespace-only transcript | `400` | `Answer transcript is required.` |
| Invalid `questionId` format | `400` | `Invalid question id.` |
| Invalid `interviewId` in URL | `400` | `Invalid interview id.` |
| No auth token | `401` | `Unauthorized` |
| Access another user's interview | `403` | `You are not allowed to access this interview.` |
| Question not found | `404` | `Question not found.` |
| Question belongs to different interview | `400` | `This question does not belong to this interview.` |
| Question status is `pending` (not asked yet) | `400` | `This question has not been asked yet.` |
| Question status is `evaluated` (already done) | `409` | `This question has already been answered.` |
| Interview not `in_progress` | `400` | `You can only submit answers for an interview that is in progress.` |
