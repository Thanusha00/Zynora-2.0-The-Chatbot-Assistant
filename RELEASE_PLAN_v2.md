# Zynora Production Release Plan v1.0 → v2.0

## Current
Zynora Day 11 base RAG release.

## New Release
Zynora 2.0.

## Features
- Persistent conversations
- Conversation history
- Context-aware RAG
- Source attribution
- Response quality metrics
- Monitoring dashboard
- Structured production logs
- Rate limiting
- Authorization and conversation ownership checks
- Database migration

## Database
Add:
- conversations
- messages
- system_logs
- knowledge_chunks if not already present

## API
- POST /api/zynora/chat
- POST /api/zynora/conversations
- GET /api/zynora/conversations
- GET /api/zynora/conversations/:id/messages
- PUT /api/zynora/conversations/:id
- DELETE /api/zynora/conversations/:id
- GET /api/admin/metrics
- GET /api/admin/logs

## Rollback
1. Stop new release.
2. Restore previous backend/frontend build.
3. Restore database backup if a migration rollback is required.
4. Verify health endpoint.
5. Run smoke tests.
6. Keep v2 migration backup before production release.
