# ProjectSense AI 🎓

**AI-Powered Academic Project Evaluation Platform**

ProjectSense AI helps academic institutions evaluate student capstone/mini projects automatically using AI. Students submit their project report, source code, and presentation; the platform analyzes each artifact with the xAI Grok API and produces rubric-based scores, detailed feedback, plagiarism/clone detection, and auto-generated viva questions — which teachers can then review and finalize.

🔗 **Live App:** [ai-power-academic-project-evaluatio.vercel.app](https://ai-power-academic-project-evaluatio.vercel.app/)
📦 **Repository:** [github.com/ARTHIK22/AI-Powered-Academic-Project-Evaluation-Platform](https://github.com/ARTHIK22/AI-Powered-Academic-Project-Evaluation-Platform)

![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy-red)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Backend%20on-Render-46E3B7?logo=render&logoColor=white)

---

## ✨ Features

- **Role-based access** — separate dashboards and permissions for **Students**, **Teachers**, and **Admins**
- **Multi-artifact submission** — students upload a project report, source code, and PPT/PPTX, plus an optional GitHub link
- **AI-driven evaluation** — reports, code, documentation, innovation, and presentation are each scored out of 100 by the Grok LLM
- **Rubric-based grading** — teachers create custom, weighted grading rubrics; the AI maps its evaluation onto rubric criteria to produce predicted marks
- **Rich AI feedback** — overall summary, strengths, weaknesses, missing sections, and improvement suggestions
- **Code analysis** — automated review for bugs, security issues, naming conventions, complexity, and folder structure
- **Difficulty & originality detection** — classifies project difficulty (Beginner → Industry Level) and flags likely clones/duplicates with a similarity score
- **Auto-generated viva questions** — basic, intermediate, and advanced questions generated from the submitted project
- **Teacher review workflow** — teachers can adjust AI-predicted marks, add comments, and finalize scores
- **PDF export** — download a formatted evaluation report for any project
- **Admin panel** — manage users and view platform-wide analytics

---

## 🖼️ Screenshots
Login Dashboard
<img width="1919" height="914" alt="Screenshot 2026-08-13 223138" src="https://github.com/user-attachments/assets/cd96b5e5-1dba-430e-b3cf-5966effec8c8" />


| Student dashboard | Teacher review | Evaluation results |
|---|---|---|
| <img width="1913" height="914" alt="Screenshot 2026-08-13 221010" src="https://github.com/user-attachments/assets/10801cfc-81cd-4bb7-9378-8fec98b1e1ec" />
|<img width="1919" height="913" alt="Screenshot 2026-08-13 223403 - Copy" src="https://github.com/user-attachments/assets/4f532aa3-78ea-4721-ba79-d7c6ddb6bc91" />
 | <img width="1912" height="912" alt="Screenshot 2026-08-13 223453" src="https://github.com/user-attachments/assets/c41f47b6-a0c6-4e63-81d9-261f4fefa208" />
|

---

## 🏗️ Architecture

<img width="886" height="302" alt="image" src="https://github.com/user-attachments/assets/4e51002a-db12-423e-98c2-dac6bbb23dff" />


Students submit reports, code, and slides through the Next.js frontend. The FastAPI backend stores project metadata in the database and sends each artifact to the xAI Grok API for evaluation, then returns rubric-based scores, feedback, and viva questions.

---

## 🏗️ Tech Stack

### Frontend (`/frontend`)
- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Deployed on **Vercel**

### Backend (`/backend`)
- [FastAPI](https://fastapi.tiangolo.com/) (async, Python)
- SQLAlchemy (async ORM) + SQLite (dev) / PostgreSQL (production)
- JWT authentication (`python-jose`, `passlib` + `bcrypt`)
- xAI **Grok** API (via the OpenAI-compatible SDK) for AI evaluation
- Document parsing: `pymupdf`, `python-docx`, `python-pptx`
- PDF report generation: `reportlab`
- Deployed on **Render**

---

## 📁 Project Structure

```
.
├── backend/
│   ├── api/                # Route handlers: auth, student, teacher, admin
│   ├── core/                # Config, database session, security/JWT
│   ├── models/               # SQLAlchemy models: User, Project, Rubric, Evaluation
│   ├── services/             # AI evaluator, code analyzer, similarity checker,
│   │                          # report analyzer, viva generator, PDF exporter
│   ├── tests/                # Pytest test suite
│   ├── main.py                # FastAPI app entry point
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── student/          # submit, results, dashboard
│   │   ├── teacher/          # projects, review, rubrics, dashboard
│   │   └── admin/            # users, dashboard
│   ├── components/
│   ├── lib/
│   └── package.json
├── render.yaml               # Render deployment config (backend)
├── vercel.json                # Vercel deployment config (frontend)
└── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A Grok (xAI) API key — [console.x.ai](https://console.x.ai/)

### 1. Clone the repository
```bash
git clone https://github.com/ARTHIK22/AI-Powered-Academic-Project-Evaluation-Platform.git
cd AI-Powered-Academic-Project-Evaluation-Platform
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env          # then fill in SECRET_KEY, GROK_API_KEY, etc.

uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### 3. Frontend setup
```bash
cd frontend
npm install

# Create a .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```
The app will be available at `http://localhost:3000`.

### 4. Run backend tests
```bash
cd backend
pytest
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | JWT signing secret (min 32 chars) | — |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `60` |
| `DATABASE_URL` | SQLAlchemy async DB URL | `sqlite+aiosqlite:///./projectsense.db` |
| `GROK_API_KEY` | xAI Grok API key | — |
| `GROK_MODEL` | Grok model name | `grok-3` |
| `UPLOAD_DIR` | Directory for uploaded files | `./uploads` |
| `MAX_FILE_SIZE_MB` | Max upload size | `50` |
| `CORS_ORIGINS` | JSON array of allowed origins | `["http://localhost:3000"]` |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the deployed/running backend API |

---

## 🔌 API Overview

| Area | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| **Student** | `POST /api/student/submit`, `GET /api/student/projects`, `GET /api/student/results/{id}`, `GET /api/student/export/{id}` |
| **Teacher** | `GET /api/teacher/projects`, `GET /api/teacher/projects/{id}`, `PUT /api/teacher/review/{id}`, CRUD `/api/teacher/rubrics`, `GET /api/teacher/export/{id}` |
| **Admin** | `GET /api/admin/users`, `PUT /api/admin/users/{id}`, `DELETE /api/admin/users/{id}`, `GET /api/admin/analytics` |
| **Health** | `GET /`, `GET /api/health` |

Full interactive API documentation is available at `/docs` (Swagger) and `/redoc` on the running backend.

---

## ☁️ Deployment

- **Frontend** — deployed on **Vercel** (see `vercel.json` / `frontend/vercel.json`)
- **Backend** — deployed on **Render** as a Python web service (see `render.yaml`), running `uvicorn main:app`

Make sure `CORS_ORIGINS` on the backend includes your deployed frontend URL, and `NEXT_PUBLIC_API_URL` on the frontend points to your deployed backend URL.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue to discuss any major changes before submitting a pull request.

1. Create a feature branch (`git checkout -b feature/my-feature`)
2. Commit your changes
3. Push and open a Pull Request
