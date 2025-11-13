# AI Security Assistant

AI Security Assistant is a web-based cybersecurity assistant built with **FastAPI** and **React (Vite)**.  
It uses the **OpenAI API** to help users understand and troubleshoot cybersecurity topics — from phishing prevention to network security and configuration advice.

---

## Features

- Interactive AI chat interface
- User-provided OpenAI API key (stored locally)
- FastAPI backend for request handling
- React frontend built with Vite
- Simple plain CSS styling (no Tailwind)

---

## Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | React (Vite), React Markdown, Node.js |
| Backend | FastAPI, Uvicorn, OpenAI Python SDK |
| Language | Python 3.10+ |
| API | OpenAI Responses API |
| Styling | Plain CSS |

---

## Installation

### 1️⃣ Clone the repository or Download ZIP File

```bash
git clone https://github.com/PengfeiZG/AISecurityAssistant.git
```

---

## Backend Setup (FastAPI)

### Folder
```
ai-security-assistant-backend/
```

### Install dependencies
Make sure you have Python 3.10+ and pip installed, then run:

```bash
cd ai-security-assistant-backend
pip install -r requirements.txt
```

### Dependencies
Listed in `requirements.txt`:
pip install -r requirements.txt
```
fastapi
uvicorn
openai>=1.52.0
pydantic>=2
httpx
dnspython
python-dotenv
```

### Start the backend server
```bash
uvicorn app.main:app --reload
```

This will start the backend on:
> http://localhost:8000

---

## Frontend Setup (React + Vite)

### Folder
```
ai-security-assistant-frontend/
```

### Install dependencies
Make sure Node.js ≥ 18 and npm ≥ 9 are installed(https://nodejs.org/en/download), 
If you see _"'npm' is not recognized as an internal or external command, operable program or file_". Put C:/Users/Program Files/nodejs/ in enviornment variables. Enter in windows search bar "Edit the system enviornment variables" > Enviornment Variables > New > Variable name: nodejs | Variable value: C:/Users/Program Files/nodejs/. Reopen CMD.
then run:


```bash
cd ai-security-assistant-frontend
npm install
npm install react-markdown remark-gfm
```

### Start the development server
```bash
npm run dev
```

This will start the frontend on:
> http://localhost:5173

---

## How to Use

1. Run the backend (FastAPI) with `uvicorn`.
2. Run the frontend (React) with `npm run dev`.
3. Open your browser and go to:
   ```
   http://localhost:5173
   ```
4. Paste your **OpenAI API key** into the input field.
5. Ask a cybersecurity question (e.g., “Explain SQL injection attacks”).

---

## Example Questions

- How can I secure my home Wi-Fi network?  
- What is the difference between symmetric and asymmetric encryption?  
- How do I prevent phishing attacks?  
- How can I detect lateral movement in a corporate network?

---

## Project Structure

```
ai-security-assistant/
├── ai-security-coach-backend/
│   ├── app/
|   |   ├── __pycache__
|   |   ├── __init__.py
|   |   ├── db.py
|   |   ├── knowledge.py
│   │   ├── main.py
│   │   ├── router.py
│   │   ├── tools.py
│   │   ├── prompts.py
│   │   ├── moderation.py
│   │   └── schemas.py
│   ├── chroma_store/
│   |   ├── chroma.sqlite3
│   ├── security_docs/
│   |   ├── example.pdf
│   ├── .env.example
│   ├── chat_history.db
│   ├── package-lock.json
│   ├── requirements.txt
│
└── ai-security-assistant-frontend/
    ├── node_modules/
    ├── public/
    |   ├── vite.svg
    ├── src/
    |   ├── assets/
    |   |   ├── react.svg
    │   ├── AISecurityAssistantApp.tsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── tsconfig.json
    └── vite.config.js
```

---

## Environment Variables

### (Optional)
If you want moderation to work server-side, set your own OpenAI key in the backend:

```bash
setx OPENAI_API_KEY "sk-yourkey"
```

Otherwise, each user enters their own API key in the frontend.

---

## Common Commands

| Action | Command |
|--------|----------|
| Start backend | `uvicorn app.main:app --reload` |
| Start frontend | `npm run dev` |
| Install backend deps | `pip install -r requirements.txt` |
| Install frontend deps | `npm install` |
| Run both (in separate terminals) | Backend → Frontend |


---
## Basic Error Handling
| Condition                      | User Message                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| No API key                     | ⚠️ Please enter your OpenAI API key first.                                                                                                 |
| Offline (before sending)       | 🚫 You appear to be offline. Please reconnect and try again.                                                                               |
| Invalid API key (from backend) | ⚠️ Invalid API key. Please check your key at [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys). |
| Network or backend unreachable | 🚫 Network error: Unable to reach backend or internet connection lost.                                                                     |
| Other backend issues           | ⚠️ OpenAI API error. Please try again later.                                                                                               |

---

## Author

Developed by Pengfei Zhang  
Senior Cybersecurity Student @ Penn State University  
Focused on AI-driven security automation and risk analysis.

