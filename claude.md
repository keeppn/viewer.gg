# 📋 LLM Task Management System - Enhanced Complete Guide v2.0

## 🎯 Core Principles

This guide ensures consistent task tracking with automated folder structures, incremental file naming, comprehensive task documentation with file history tracking, detailed reasoning chains for every decision, **completion status flags for efficient scanning**, and **centralized knowledge base references**.

## ⚠️ STRICT COMPLIANCE NOTICE

These guidelines MUST be followed exactly for EVERY task. No exceptions.

## 📁 Directory Structure

```
/tasks
├── /101125                      # Format: DDMMYY (10 Nov 2025)
│   ├── 1-implement-auth-system.md
│   ├── 2-fix-database-connection.md
│   └── 3-add-user-dashboard.md
├── /111125
│   └── 1-optimize-api-calls.md
└── /121125
    ├── 1-refactor-components.md
    └── 2-add-testing-suite.md
```

## 📐 MANDATORY Naming Convention

**Date Folder**: DDMMYY format (e.g., 101125 = 10 November 2025)
- ✅ ALWAYS create if doesn't exist
- ✅ ALWAYS use 2-digit format for each component

**Task Files**: [number]-[kebab-case-task-name].md
- ✅ ALWAYS check existing files first
- ✅ ALWAYS use next sequential number
- ✅ ALWAYS use kebab-case (lowercase with hyphens)

## 🚦 COMPLETION STATUS FLAGS

**MANDATORY**: Add status flag at the TOP of EVERY task file

```markdown
---
status: pending
---
```

OR

```markdown
---
status: completed
completed_date: 2025-11-10 14:37:22
completion_percentage: 100
---
```

### Status Flag Rules:
- **pending**: Active tasks with incomplete items
- **completed**: ALL subtasks finished with timestamps
- **partial**: Use `completion_percentage` for partially done tasks (optional)
- Scanners should check flag FIRST to avoid reading completed files
- Update flag IMMEDIATELY when all tasks complete

## 📝 MANDATORY Task File Template

EVERY task file MUST contain ALL sections below. NO EXCEPTIONS.

```markdown
---
status: pending
---

# [Task Title]

## 📊 Description

[Comprehensive overview including:
- The specific problem we're solving
- The technical approach and methodology  
- Expected deliverables and outcomes
- Critical dependencies and constraints
- Success criteria and definition of done]

---

## 🧠 Chain of Thought

### Why This Approach?

[Detailed explanation of the reasoning behind our technical decisions, including:
- Why we chose this specific solution over alternatives
- What trade-offs we're making (performance vs maintainability, etc.)
- How this fits into the larger system architecture
- What assumptions we're making and why they're valid]

### Key Logic & Patterns

[Document the core logic flow:
- Main algorithmic approach or design pattern being used
- State management strategy
- Data flow and transformations
- Error handling philosophy
- Performance considerations and optimizations]

### Critical References

[Essential files/documentation to understand:
- **Core Script**: /src/core/engine.ts — Main processing loop that everything hooks into
- **Config Schema**: /config/schema.json — Defines all valid configuration options
- **API Contract**: /docs/api-spec.yaml — OpenAPI spec that must be maintained
- **Database Schema**: /migrations/001_base.sql — Current database structure
- **Architecture Doc**: /docs/ARCHITECTURE.md — System design decisions]

### Expected Side Effects

[What this task will impact:
- Performance implications (latency, memory, CPU)
- Breaking changes or backwards compatibility issues
- Security considerations
- Database migrations required
- External service dependencies]

### Learning & Insights

[Document important discoveries:
- Gotchas encountered with specific libraries/APIs
- Undocumented behaviors discovered
- Performance bottlenecks identified
- Useful patterns that should be reused elsewhere]

---

## 📚 KNOWLEDGE BASE

### Core System Paths
<!-- MANDATORY: Document ALL relevant script paths and their purposes -->

| Path | Purpose | Dependencies |
|------|---------|--------------|
| `/src/core/engine.ts` | Main application entry point | TypeScript 5.x |
| `/src/services/auth/` | Authentication service modules | JWT, bcrypt |
| `/src/api/routes/` | API endpoint definitions | Express 4.x |
| `/config/database.yml` | Database configuration | PostgreSQL 15 |
| `/tests/integration/` | Integration test suites | Jest, Supertest |
| `/scripts/deploy.sh` | Deployment automation | Docker, K8s |
| `/docs/API.md` | API documentation | OpenAPI 3.0 |

### Environment & Configuration

| File | Purpose | Required Variables |
|------|---------|-------------------|
| `/.env` | Local environment config | DATABASE_URL, JWT_SECRET, REDIS_URL |
| `/config/app.config.ts` | Application settings | Port, timeouts, rate limits |
| `/docker-compose.yml` | Local development stack | Services: app, db, redis, nginx |
| `/kubernetes/` | Production manifests | Deployments, services, configmaps |

### External Integrations

| Service | Config Path | Documentation |
|---------|-------------|---------------|
| Stripe API | `/config/stripe.ts` | https://stripe.com/docs/api |
| SendGrid | `/config/email.ts` | https://docs.sendgrid.com |
| AWS S3 | `/config/aws.ts` | https://docs.aws.amazon.com/s3 |
| Redis | `/config/redis.ts` | https://redis.io/docs |

### Build & Development Tools

| Tool | Config | Command |
|------|--------|---------|
| Webpack | `/webpack.config.js` | `npm run build` |
| ESLint | `/.eslintrc.js` | `npm run lint` |
| Prettier | `/.prettierrc` | `npm run format` |
| Husky | `/.husky/` | Git hooks automation |

---

## 🎯 Task Groups

### [Group 1: Prerequisites & Setup]
- [ ] **Task description** — [Detailed explanation including: what exactly to do, why it's necessary, specific implementation requirements, acceptance criteria]
- [ ] **Environment setup** — [Configure development environment, install dependencies, verify toolchain versions]
- [ ] **Review existing code** — [Understand current implementation, identify integration points, note potential conflicts]

### [Group 2: Core Implementation]
- [ ] **Main feature development** — [Build primary functionality with error handling, logging, and monitoring hooks]
- [ ] **Edge case handling** — [Address boundary conditions, null states, race conditions, timeout scenarios]
- [ ] **Performance optimization** — [Implement caching, lazy loading, query optimization as needed]

### [Group 3: Testing & Validation]
- [ ] **Unit test coverage** — [Minimum 80% coverage, test happy path and error scenarios]
- [ ] **Integration testing** — [Verify component interactions, API contracts, data flow]
- [ ] **Performance testing** — [Load testing, memory profiling, query analysis]

### [Group 4: Documentation & Cleanup]
- [ ] **Code documentation** — [JSDoc/docstrings, inline comments for complex logic]
- [ ] **Update README** — [Installation, configuration, usage examples]
- [ ] **Clean up and refactor** — [Remove debug code, optimize imports, format code]

---

## 📂 FILES CHANGED
<!-- MANDATORY: Update IMMEDIATELY after EVERY file modification -->

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| /src/auth/login.ts | Created | JWT-based authentication with refresh tokens |
| /src/api/users.ts | Modified | Added profile endpoints with validation |
| /config/database.yml | Modified | Connection pool from 10 to 25 |
| /tests/auth.test.ts | Created | 15 test cases covering auth flow |
| /.env.example | Modified | Added new required environment variables |

---

## 🔗 Previously Related Tasks
<!-- MANDATORY: Link all tasks that influenced this one -->

- /tasks/091125/3-design-auth-flow.md — Initial authentication architecture
- /tasks/081125/5-setup-user-model.md — Database schema that we're building upon  
- /tasks/071125/1-project-kickoff.md — Original requirements driving this feature
```

## ✅ STRICT Completion Format

MANDATORY format for completing subtasks:

```markdown
### Before Completion:
- [ ] **Implement user authentication** — Add JWT-based auth with refresh tokens, 24hr expiry

### After Completion (BOTH strikethrough AND checkbox):
- [x] ~~**Implement user authentication** — Add JWT-based auth with refresh tokens, 24hr expiry~~
      **✅ Completed: 10/11/25 14:37:22**
```

## 🏁 FULL TASK COMPLETION PROTOCOL

When ALL subtasks are complete:

1. **Update status flag** at top of file:
```yaml
---
status: completed
completed_date: 2025-11-10 16:45:30
completion_percentage: 100
---
```

2. **Add completion summary** after task groups:
```markdown
## ✨ COMPLETION SUMMARY
**Status**: COMPLETED
**Completed Date**: 10/11/25 16:45:30
**Total Duration**: 8 hours 15 minutes
**Key Achievements**:
- Successfully implemented JWT authentication
- 92% test coverage achieved
- Performance improved by 35%
**Lessons Learned**:
- Redis connection pooling critical for scale
- JWT refresh strategy needs careful planning
```

## 🤖 LLM Execution Algorithm

FOLLOW THIS EXACT SEQUENCE EVERY TIME:

```python
# STEP 1: Check task status flag
def check_task_status(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
        if content.startswith('---\nstatus: completed'):
            return 'SKIP_COMPLETED'
        elif content.startswith('---\nstatus: pending'):
            return 'PROCESS_TASK'
    return 'ADD_STATUS_FLAG'

# STEP 2: Date folder creation
current_date = get_date_DDMMYY()  # e.g., "101125"
folder_path = f"/tasks/{current_date}"
if not exists(folder_path):
    create_directory(folder_path)

# STEP 3: Determine file number
existing_files = list_files(folder_path)
if existing_files.empty():
    next_number = 1
else:
    numbers = extract_prefix_numbers(existing_files)
    next_number = max(numbers) + 1

# STEP 4: Create file with EXACT template
task_name = convert_to_kebab_case(task_description)
file_name = f"{next_number}-{task_name}.md"
file_path = f"{folder_path}/{file_name}"

# STEP 5: Apply COMPLETE template (ALL sections required)
create_file(file_path, MANDATORY_TEMPLATE_WITH_STATUS)

# STEP 6: Update FILES CHANGED after EVERY modification
after_each_file_change():
    update_files_changed_section()
    
# STEP 7: Update KNOWLEDGE BASE with new paths
after_adding_new_scripts():
    update_knowledge_base_section()

# STEP 8: Check completion and update status
if all_tasks_completed():
    update_status_flag('completed')
    add_completion_summary()
```

## 📊 Complete Example Task

```markdown
---
status: completed
completed_date: 2025-11-11 17:30:45
completion_percentage: 100
---

# Implement Real-Time Notification System

## 📊 Description

Building a scalable WebSocket-based notification system for instant updates across all application clients. Users require real-time alerts for messages, collaborative edits, system updates, and workflow triggers. The system must handle 10,000+ concurrent connections, provide guaranteed delivery, and maintain message ordering per user. We're implementing Socket.io with Redis pub/sub for horizontal scaling and PostgreSQL for message persistence.

---

## 🧠 Chain of Thought

### Why This Approach?

We chose WebSockets over polling/SSE because:
- **Bi-directional communication**: Clients can acknowledge receipt, reducing server load
- **Lower latency**: No HTTP overhead for each message (avg 50ms vs 200ms with polling)
- **Resource efficiency**: Single connection per client vs repeated HTTP requests
- **Socket.io specifically**: Automatic fallbacks, reconnection logic, and room management built-in

Redis pub/sub enables horizontal scaling without complex coordination:
- Each server subscribes to Redis channels
- Messages broadcast through Redis reach all server instances
- No direct server-to-server communication needed
- Redis persistence prevents message loss during server restarts

### Key Logic & Patterns

**Event Flow Architecture**:
1. Client action triggers event → Server handler validates
2. Server publishes to Redis channel with metadata
3. All server instances receive via subscription
4. Target clients identified by room/user mapping
5. Messages queued if client offline (TTL: 7 days)
6. Client acknowledges → Message marked delivered

**State Management**:
- Connection state: In-memory Map with Redis backup
- Message queue: PostgreSQL with indexes on user_id, created_at
- Room memberships: Redis Sets for O(1) lookups
- Delivery status: PostgreSQL with enum states

**Resilience Patterns**:
- Exponential backoff for reconnection (2s, 4s, 8s... max 30s)
- Message deduplication via UUID
- Heartbeat every 25s (timeout at 60s)
- Circuit breaker for Redis (threshold: 5 failures/minute)

### Critical References

- **WebSocket Manager**: /src/websocket/manager.ts — Core connection handling, MUST understand lifecycle hooks
- **Redis Config**: /config/redis.ts — Pub/sub channels structure, naming conventions critical
- **Message Schema**: /db/schema/messages.sql — Queue table structure, indices affect performance
- **Event Catalog**: /docs/events.md — All event types and payloads, breaking changes tracked here
- **Load Test Results**: /tests/load/results-2025-10.md — Current bottlenecks and limits

### Expected Side Effects

**Performance Impact**:
- Memory: +50MB base + 5KB per connection
- CPU: 15% increase at 1000 connections (measured on 4-core)
- Database: +1000 writes/minute to message queue
- Redis: 500KB/s throughput at peak

**Breaking Changes**:
- Old polling endpoints deprecated (remove in v3.0)
- Client SDK must be updated to v2.x
- Rate limiting now required on event emissions

**Security Considerations**:
- JWT validation on every connection
- Room-based authorization checks
- Rate limiting: 100 events/minute per user
- Message content sanitization for XSS

### Learning & Insights

- **Discovery**: Socket.io's default settings cause memory leaks with 1000+ connections. Must set perMessageDeflate: false and custom maxHttpBufferSize
- **Gotcha**: Redis pub/sub doesn't persist messages. Had to implement custom queue for offline delivery
- **Pattern**: Using PostgreSQL NOTIFY/LISTEN as fallback when Redis is down works surprisingly well
- **Optimization**: Batching notifications (100ms window) reduces client processing by 60%

---

## 📚 KNOWLEDGE BASE

### Core System Paths

| Path | Purpose | Dependencies |
|------|---------|--------------|
| `/src/websocket/manager.ts` | WebSocket connection manager | socket.io@4.x |
| `/src/websocket/emitter.ts` | Event emission service | @socket.io/redis-adapter |
| `/src/services/notifications.ts` | High-level notification API | - |
| `/src/queues/messageQueue.ts` | Message persistence layer | bull, pg |
| `/src/hooks/useNotifications.ts` | React integration hook | react@18.x |
| `/config/redis.ts` | Redis pub/sub config | ioredis@5.x |
| `/config/socketio.ts` | Socket.io server config | socket.io@4.x |
| `/db/migrations/004_messages.sql` | Message queue schema | PostgreSQL 15 |

### Environment & Configuration

| File | Purpose | Required Variables |
|------|---------|-------------------|
| `/.env` | Environment configuration | REDIS_URL, WS_PORT, JWT_SECRET |
| `/config/app.config.ts` | Application settings | wsPort, maxConnections, heartbeatInterval |
| `/docker-compose.yml` | Development stack | redis, postgres, app services |
| `/kubernetes/websocket-deployment.yaml` | Production deployment | Replicas, resource limits |

### External Integrations

| Service | Config Path | Documentation |
|---------|-------------|---------------|
| Redis Pub/Sub | `/config/redis.ts` | https://redis.io/docs/manual/pubsub |
| Socket.io | `/config/socketio.ts` | https://socket.io/docs/v4 |
| PostgreSQL LISTEN/NOTIFY | `/src/queues/pgNotify.ts` | https://postgresql.org/docs/current/sql-notify |

### Build & Development Tools

| Tool | Config | Command |
|------|--------|---------|
| Socket.io Admin UI | `/admin/socketio-admin.js` | `npm run admin:socketio` |
| Redis Commander | `/config/redis-commander.json` | `npm run admin:redis` |
| Load Testing | `/tests/load/artillery.yml` | `npm run test:load` |
| WebSocket Testing | `/tests/ws-client.js` | `npm run test:ws` |

---

## 🎯 Task Groups

### Infrastructure Setup
- [x] ~~**Install Socket.io dependencies** — socket.io@4.x, socket.io-client@4.x, @socket.io/redis-adapter~~
      **✅ Completed: 10/11/25 09:15:30**
- [x] ~~**Configure Redis pub/sub** — Set up adapter, define channel structure: notify:{userId}, room:{roomId}~~
      **✅ Completed: 10/11/25 10:45:00**
- [x] ~~**Create message queue table** — PostgreSQL table with proper indexes for user_id, status, created_at~~
      **✅ Completed: 10/11/25 11:20:15**
- [x] ~~**Setup monitoring** — Prometheus metrics for connections, message throughput, latency percentiles~~
      **✅ Completed: 10/11/25 12:30:00**

### Core Implementation
- [x] ~~**Build WebSocket manager** — Connection lifecycle, authentication, room management~~
      **✅ Completed: 10/11/25 14:20:15**
- [x] ~~**Implement event emitter service** — Type-safe event definitions, validation, rate limiting~~
      **✅ Completed: 10/11/25 16:45:30**
- [x] ~~**Create offline queue processor** — Background job to retry failed deliveries, clean old messages~~
      **✅ Completed: 11/11/25 10:15:00**
- [x] ~~**Add delivery confirmation** — Client acknowledgment system with timeout/retry logic~~
      **✅ Completed: 11/11/25 11:45:00**
- [x] ~~**Build notification aggregator** — Batch similar notifications within time window~~
      **✅ Completed: 11/11/25 13:20:00**

### Client Integration
- [x] ~~**Create React hooks** — useNotifications, usePresence, useRealtimeData with proper cleanup~~
      **✅ Completed: 11/11/25 14:00:00**
- [x] ~~**Build notification UI components** — Toast, badge, notification center with virtualization~~
      **✅ Completed: 11/11/25 15:30:00**
- [x] ~~**Implement service worker** — Background notification handling for PWA~~
      **✅ Completed: 11/11/25 16:00:00**
- [x] ~~**Add sound/vibration alerts** — Configurable per notification type with user preferences~~
      **✅ Completed: 11/11/25 16:30:00**

### Testing & Optimization
- [x] ~~**Unit tests for manager** — Connection, authentication, room logic (92% coverage)~~
      **✅ Completed: 11/11/25 09:30:00**
- [x] ~~**Integration tests** — Full flow from emit to delivery across multiple servers~~
      **✅ Completed: 11/11/25 10:30:00**
- [x] ~~**Load testing** — Target: 10,000 concurrent, measure latency p50/p95/p99~~
      **✅ Completed: 11/11/25 11:30:00**
- [x] ~~**Chaos testing** — Redis failure, network partition, server crashes~~
      **✅ Completed: 11/11/25 12:30:00**
- [x] ~~**Performance profiling** — Memory leaks, CPU hotspots, query optimization~~
      **✅ Completed: 11/11/25 13:30:00**

### Documentation & Deployment
- [x] ~~**API documentation** — OpenAPI spec for REST triggers, WebSocket event catalog~~
      **✅ Completed: 11/11/25 14:30:00**
- [x] ~~**Client integration guide** — Examples for React, Vue, vanilla JS~~
      **✅ Completed: 11/11/25 15:30:00**
- [x] ~~**Deployment runbook** — Scaling triggers, monitoring alerts, incident response~~
      **✅ Completed: 11/11/25 16:30:00**
- [x] ~~**Migration guide** — Step-by-step for existing users on polling system~~
      **✅ Completed: 11/11/25 17:30:00**

---

## ✨ COMPLETION SUMMARY

**Status**: COMPLETED
**Completed Date**: 11/11/25 17:30:45
**Total Duration**: 1 day, 8 hours, 15 minutes
**Key Achievements**:
- Successfully implemented real-time notification system
- Achieved 10,000+ concurrent connections in load testing
- 92% test coverage with comprehensive chaos testing
- Performance: p95 latency under 100ms, p99 under 250ms
- Zero message loss with offline queue implementation

**Lessons Learned**:
- Socket.io default configurations inadequate for scale - custom tuning essential
- Redis failover strategy critical - PostgreSQL NOTIFY/LISTEN excellent backup
- Message batching dramatically improves client performance
- Proper index strategy on message queue table crucial for performance

**Next Steps**:
- Monitor production metrics for first week
- Implement advanced analytics dashboard
- Consider adding WebRTC for video notifications
- Evaluate migration to native WebSockets for reduced overhead

---

## 📂 FILES CHANGED

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| /src/websocket/manager.ts | Created | Core WebSocket connection manager with auth |
| /src/websocket/emitter.ts | Created | Type-safe event emitter service |
| /src/services/notifications.ts | Created | High-level notification API |
| /src/queues/messageQueue.ts | Created | PostgreSQL-backed message queue |
| /db/migrations/004_messages.sql | Created | Message queue schema with indexes |
| /config/redis.ts | Modified | Added pub/sub configuration |
| /config/socketio.ts | Created | Socket.io server configuration |
| /src/hooks/useNotifications.ts | Created | React hook for consuming notifications |
| /src/components/NotificationToast.tsx | Created | Toast UI component with animations |
| /tests/websocket.test.ts | Created | Unit tests for WebSocket manager |
| /tests/integration/notification-flow.test.ts | Created | End-to-end notification tests |
| /tests/load/artillery.yml | Created | Load testing configuration |
| /tests/chaos/redis-failure.test.ts | Created | Chaos engineering test suite |
| /package.json | Modified | Added 8 new dependencies |
| /docker-compose.yml | Modified | Added Redis service configuration |
| /.env.example | Modified | Added REDIS_URL, WS_PORT variables |
| /docs/websocket-events.md | Created | Complete event reference |
| /monitoring/dashboards/websocket.json | Created | Grafana dashboard config |
| /deployment/k8s/websocket-service.yaml | Created | Kubernetes service definition |
| /deployment/k8s/websocket-deployment.yaml | Created | Kubernetes deployment with HPA |

---

## 🔗 Previously Related Tasks

- /tasks/081125/2-design-notification-system.md — System architecture and technology selection
- /tasks/071125/4-user-feedback-session.md — Requirements gathering showing need for real-time
- /tasks/061125/8-database-optimization.md — Index strategy we're extending for message queue
- /tasks/051125/3-redis-setup.md — Initial Redis configuration we're building upon
```

## 🔴 CRITICAL Compliance Checklist

BEFORE marking ANY task complete, verify:

✅ Status flag present at top of file (pending/completed)
✅ Date folder exists in DDMMYY format
✅ File number is sequential (no gaps)
✅ ALL template sections are present
✅ Chain of Thought thoroughly explains WHY
✅ Knowledge Base section populated with paths
✅ Every subtask has detailed explanation
✅ Completed tasks have BOTH strikethrough AND checkbox
✅ Timestamps in DD/MM/YY HH:MM:SS format
✅ FILES CHANGED updated after EVERY modification
✅ Previously Related Tasks links included
✅ Critical References documented
✅ Completion summary added when all done
✅ Status flag updated to "completed" when finished
✅ File saved with .md extension

## 🚫 Common Violations to Avoid

❌ Missing status flag — ALWAYS include at file top
❌ Missing Knowledge Base section — MUST document all paths
❌ Missing Chain of Thought section — ALWAYS include reasoning
❌ Incomplete task marking — MUST have checkbox, strikethrough, AND timestamp
❌ Not updating FILES CHANGED — Update IMMEDIATELY after each change
❌ Not updating status flag on completion — Change to "completed" when done
❌ Skipping sections — ALL sections are MANDATORY
❌ Wrong date format — MUST be DDMMYY, not any other format
❌ Generic descriptions — Be SPECIFIC about what and why
❌ Missing critical references — Document key files to understand
❌ Not adding completion summary — Required when all tasks done

## 🔍 Quick Scan Protocol for LLMs

When processing multiple task files:

```python
def quick_scan_tasks(task_directory):
    tasks_to_process = []
    completed_tasks = []
    
    for file in list_files(task_directory):
        with open(file, 'r') as f:
            first_lines = f.read(100)  # Read only first 100 chars
            
        if 'status: completed' in first_lines:
            completed_tasks.append(file)
            continue  # Skip reading rest of file
            
        elif 'status: pending' in first_lines:
            tasks_to_process.append(file)
            # Load full file for processing
            
        else:
            # File needs status flag added
            add_status_flag(file, 'pending')
            tasks_to_process.append(file)
    
    return tasks_to_process, completed_tasks
```

## 📌 Final Note

This enhanced structure is NON-NEGOTIABLE. Every task MUST follow this template EXACTLY. The status flags enable efficient scanning, the Knowledge Base section ensures all relevant scripts are documented, and the Chain of Thought section is CRITICAL for knowledge transfer and decision tracking.

The completion protocol ensures clean task closure with proper documentation of achievements and lessons learned.

No exceptions, no shortcuts. Compliance with this guide ensures traceable, understandable, and maintainable task management across all team members and future LLM sessions.

---
**Version**: 2.0
**Last Updated**: November 2025
**Enhancements**: Added completion status flags, Knowledge Base section, completion summary protocol, and quick scan algorithm
