# BisaQuest: English Learning Adventure

BisaQuest is an educational gamified learning platform designed to help students practice **synonyms and antonyms** through interactive quests and engaging challenges. The system provides real-time scoring, user progress tracking, and a fun learning narrative featuring the Forest Guide NPC.

---

## Getting Started (Setup Guide)

Follow these instructions to run the project locally.

---

### 1. Create the **.env** file in the Backend Folder

📌 Location: **`/Backend`**

**Step 1:** Right-click inside the Backend folder  
**Step 2:** Create a file named `.env`  
**Step 3:** Paste and fill in the values:

PORT=5000

Backend

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

JWT_SECRET=your_generated_secret_key
JWT_EXPIRES_IN=7d

---

### 2. Create the **.env** file in the Frontend Folder

📌 Location: **`/Frontend/bisa-quest`**

**Step 1:** Right-click inside the folder  
**Step 2:** Create a file named `.env`  
**Step 3:** Paste:

VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

---

### 3. Install Dependencies & Run the Project

#### Backend Setup
Make sure you are inside the **Backend** folder:

npm install
npm run dev

The backend will run at: **http://localhost:5000**

#### Frontend Setup
Make sure you are inside: **Frontend/bisa-quest**

npm install
npm run dev

The frontend will run on the port shown in the terminal (usually **http://localhost:5173**)

---

## Project Developers

| Name | Role |
|------|------|
| Kyle Sepulveda | Team Lead |
| Bernadeth Claire Ahito | Project Manager |
| Alyssa Blanche Alivio | Front-end Developer |
| Estelle Felicity Carao | Back-end Developer |
| Juvie Coca | Front-End / QA |

---
