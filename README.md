# ReflectAI — Private Journal & Gemini Reflections

ReflectAI is a secure, user-authenticated personal reflection and journaling application powered by Google Cloud Run, Gemini 3.6 Flash, and Cloud Firestore with strict per-user data isolation.

---

## 1. Architecture Overview

- **Frontend**: React 19, Tailwind CSS, Lucide Icons, React-Markdown.
- **Backend API Server**: Node.js Express server mounting Vite in development and serving optimized static assets in production.
- **AI Processing Engine**: Gemini 3.6 Flash with automated fallback ladder (`gemini-3.6-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest` &rarr; `gemini-3.7-flash`).
- **User Authentication**: Firebase Authentication via Google Sign-In (federated identity; no credentials stored in custom code).
- **Backend Database**: Cloud Firestore with user-isolated collections (`/users/{userId}/interactions/{interactionId}`).
- **Secret Management**: Google Cloud Secret Manager & environment variable injection.

---

## 2. Agentic Threat Model (The 5 Threat Zones)

| Threat Zone | Identified Risk | Severity | Countermeasure Implemented |
| :--- | :--- | :--- | :--- |
| **1. Input Surfaces** | Prompt injection, oversized payloads, NoSQL injection. | **High** | Express body parser limits (10MB), defensive string sanitization (30,000 char cap), and recursive undefined stripping prior to database writes. |
| **2. Planning & Reasoning** | System instruction bypass, jailbreaks, prompt leakage. | **Medium** | Rigid system instruction anchoring in `@google/genai` calls; user journal entries are tagged strictly as user data, never executed as instructions. |
| **3. Tool Execution & APIs** | API key extraction, SSRF, unauthorized model invocation. | **Critical** | Server-side proxy (`/api/reflect`) keeps `GEMINI_API_KEY` hidden from browser clients; zero client exposure of AI secrets. |
| **4. Memory & State** | Cross-user journal leaks, unauthorized reads/writes. | **Critical** | Deployed Firestore security rules enforce `request.auth.uid == userId` on path `/users/{userId}/interactions/{interactionId}`. |
| **5. Inter-System Communication** | Token interception, session hijacking. | **High** | Firebase Auth Google Sign-In with TLS transport; credentials retrieved dynamically from Google Cloud Secret Manager. |

---

## 3. Database Security Configuration (Cloud Firestore)

Deploy the following `firestore.rules` file to Cloud Firestore to isolate each user's reflection history:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Secret Management Setup (Google Cloud Secret Manager)

Store the Gemini API Key in Secret Manager and bind permissions to Cloud Run:

```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 5. Cloud Run Deployment Flow

### Prerequisites
Enable required Google Cloud APIs:
```bash
gcloud services enable run.googleapis.com secretmanager.googleapis.com firestore.googleapis.com
```

### Build & Deploy
Deploy directly from source with the injected secret:
```bash
gcloud run deploy reflect-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

### Required Campaign Verification Labeling
To register the service for automated challenge verification:
```bash
gcloud run services update <SERVICE_NAME> \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=<REGION>
```

---

## 6. Functional Walkthrough & Test Guide

Every process and user interaction has a corresponding verification scenario:

### Test Case 1: Landing Page & Unauthenticated State
- **Action**: Open the application URL without an active session.
- **Expected Outcome**:
  - Landing hero renders with value propositions ("Private Mindful Journaling", "Gemini 3.6 Flash", "Isolated Cloud Firestore").
  - "Continue with Google Sign-In" button is prominent.
  - "Security Architecture" button opens the Threat Model Modal.
  - Private journal sidebar and editor remain hidden.

### Test Case 2: Google Authentication
- **Action**: Click "Continue with Google Sign-In".
- **Expected Outcome**:
  - Google Identity popup prompts user account selection.
  - Upon authentication, user lands on the private dashboard.
  - User's avatar and name appear in the top-right navbar.
  - Firestore query executes for `/users/{userId}/interactions`.

### Test Case 3: Create New Reflection with Deep Reflection Mode
- **Action**:
  - Select "Deep Reflection" mode.
  - Pick a mood (e.g., "Peaceful" or "Thoughtful").
  - Enter text in the reflection textarea.
  - Click "Reflect with Gemini".
- **Expected Outcome**:
  - Button switches to loading state ("Reflecting with Gemini...").
  - Server proxies request to Gemini API (`gemini-3.6-flash`).
  - Response is generated and validated.
  - New entry is written to Firestore under `/users/{currentUser.uid}/interactions/{entryId}`.
  - UI transitions to the active `ConversationView` showing the user prompt and markdown-formatted Gemini reflection.
  - The entry immediately appears at the top of the history sidebar.

### Test Case 4: Multi-Turn Conversation & Follow-Up Inquiries
- **Action**:
  - In `ConversationView`, type a follow-up question or observation into the bottom input box.
  - Click "Send Follow-Up".
- **Expected Outcome**:
  - User follow-up is appended to the thread.
  - Gemini processes conversation history and responds in context.
  - Firestore document is updated with the new messages array.
  - Message counter in the sidebar increments.

### Test Case 5: Summary & Brainstorming Quick Prompts
- **Action**:
  - Click "Summarize thread" or "Brainstorm next steps" quick prompt chips.
- **Expected Outcome**:
  - Gemini provides a targeted summary or actionable brainstorming list.
  - Changes are persisted to Firestore in real-time.

### Test Case 6: Copy and Markdown Export
- **Action**:
  - Click "Copy" button &rarr; Text is copied to clipboard with "Copied!" confirmation.
  - Click "Export" button &rarr; Browser downloads a formatted `.md` file with the entire reflection dialogue.

### Test Case 7: Search and Filter Past History
- **Action**:
  - Type keywords into the history search bar.
  - Click different mood filter chips (e.g., "Thoughtful", "Grateful").
- **Expected Outcome**:
  - List filters dynamically in real-time.
  - Clicking any filtered entry loads its full conversation immediately.

### Test Case 8: Delete Reflection from Firestore
- **Action**: Click "Delete" button and confirm prompt.
- **Expected Outcome**:
  - Entry is removed from Cloud Firestore via `deleteDoc`.
  - Item vanishes from the sidebar list.
  - UI returns cleanly to the New Reflection editor.

### Test Case 9: Sign Out & Session Teardown
- **Action**: Click the sign-out icon in the top navbar.
- **Expected Outcome**:
  - `signOut(auth)` terminates the Firebase session.
  - In-memory state (entries, active entry) is cleared.
  - UI seamlessly returns to the unauthenticated Landing Page.
