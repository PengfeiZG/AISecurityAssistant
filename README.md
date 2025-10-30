# 🧠 AI Security Assistant

AI Security Assistant is a web-based cybersecurity assistant built with **FastAPI** and **React (Vite)**.  
It uses the **OpenAI API** to help users understand and troubleshoot cybersecurity topics — from phishing prevention to network security and configuration advice.

---

## 📦 Features

- Interactive AI chat interface
- User-provided OpenAI API key (stored locally)
- Markdown-formatted responses with code blocks and copy buttons
- FastAPI backend for request handling
- React frontend built with Vite
- Simple plain CSS styling (no Tailwind)

---

## 🧰 Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | React (Vite), React Markdown, Remark GFM |
| Backend | FastAPI, Uvicorn, OpenAI Python SDK |
| Language | Python 3.10+ |
| API | OpenAI Responses API |
| Styling | Plain CSS |

---

## ⚙️ Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/PengfeiZG/AISecurityAssistant.git
cd AISecurityAssistant
```

---

## 🧩 Backend Setup (FastAPI)

### 📁 Folder
```
ai-security-assistant-backend/
```

### 🐍 Install dependencies
Make sure you have Python 3.10+ and pip installed, then run:

```bash
cd ai-security-assistant-backend
pip install -r requirements.txt
```

### 📋 Dependencies
Listed in `requirements.txt`:

```
fastapi
uvicorn
openai>=1.52.0
pydantic>=2
httpx
dnspython
python-dotenv
```

### ▶️ Start the backend server
```bash
uvicorn app.main:app --reload
```

This will start the backend on:
> http://localhost:8000

---

## 💻 Frontend Setup (React + Vite)

### 📁 Folder
```
ai-security-assistant-frontend/
```

### 📦 Install dependencies
Make sure Node.js ≥ 18 and npm ≥ 9 are installed, then run:

```bash
cd ai-security-assistant-frontend
npm install
npm install react-markdown remark-gfm
```

### ▶️ Start the development server
```bash
npm run dev
```

This will start the frontend on:
> http://localhost:5173

---

## 🚀 How to Use

1. Run the backend (FastAPI) with `uvicorn`.
2. Run the frontend (React) with `npm run dev`.
3. Open your browser and go to:
   ```
   http://localhost:5173
   ```
4. Paste your **OpenAI API key** into the input field.
5. Ask a cybersecurity question (e.g., “Explain SQL injection attacks”).

---

## 🧠 Example Questions

- How can I secure my home Wi-Fi network?  
- What is the difference between symmetric and asymmetric encryption?  
- How do I prevent phishing attacks?  
- How can I detect lateral movement in a corporate network?

---

## ⚡ Project Structure

```
ai-security-assistant/
├── ai-security-coach-backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── router.py
│   │   ├── tools.py
│   │   ├── prompts.py
│   │   ├── moderation.py
│   │   └── schemas.py
│   ├── requirements.txt
│
└── ai-security-assistant-frontend/
    ├── src/
    │   ├── AISecurityAssistantApp.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## 🔑 Environment Variables

### (Optional)
If you want moderation to work server-side, set your own OpenAI key in the backend:

```bash
setx OPENAI_API_KEY "sk-yourkey"
```

Otherwise, each user enters their own API key in the frontend.

---

## 🧩 Common Commands

| Action | Command |
|--------|----------|
| Start backend | `uvicorn app.main:app --reload` |
| Start frontend | `npm run dev` |
| Install backend deps | `pip install -r requirements.txt` |
| Install frontend deps | `npm install` |
| Run both (in separate terminals) | Backend → Frontend |


---

## 🧑‍💻 Author

Developed by Pengfei Zhang  
Senior Cybersecurity Student @ Penn State University  
Focused on AI-driven security automation and risk analysis.

