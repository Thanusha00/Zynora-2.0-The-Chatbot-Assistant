# Zynora Day 11 + Day 12 Complete Implementation

Zynora is a RAG-only internal Zyngram chatbot. It does not use OpenAI, Gemini,
Claude, web search, Google Search, external LLM APIs or arbitrary URLs.

## Day 11
- Architecture and project setup
- Knowledge database
- TXT/Markdown/JSON ingestion
- Chunking and metadata
- Approved-content retrieval
- Chat UI and API
- Source attribution
- No-answer behavior
- Admin knowledge lifecycle
- Authentication/RBAC
- 15-question testing

## Day 12
- Production version planning
- Persistent conversations
- Context-aware RAG
- Response quality metrics
- Monitoring dashboard
- Structured logging
- Rate limiting and ownership checks
- Migration and release/rollback documentation

## Setup

### Backend
1. Create PostgreSQL database `zyngram_day11`.
2. Copy `backend/.env.example` to `backend/.env`.
3. Set DATABASE_URL and JWT_SECRET.
4. Run:
   npm install
   npm run migrate
   node seed.js
   npm start

Backend: http://localhost:5000

### Frontend
cd frontend
npm install
npm run dev

Frontend: http://localhost:5173

Admin seed:
Email: admin@zyngram.com
Password: Admin@123

Change the password for any real deployment.

### Monitoring
cd monitoring-dashboard
npm install
npm run dev

## Health
GET http://localhost:5000/api/health

## Important
Only APPROVED documents/chunks are eligible for RAG retrieval.
ARCHIVED and DRAFT content is excluded.
