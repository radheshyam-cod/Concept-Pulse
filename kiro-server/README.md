# Kiro IDE Server

Real Kiro IDE API server implementation for ConceptPulse integration.

## 🚀 Features

- **Planning Service**: Project and task management with real-time updates
- **Prototyping Service**: UI/UX design system and component management  
- **Documentation Service**: Auto-generated documentation from code analysis
- **Workflow Service**: Automated pipeline execution and monitoring
- **Execution Service**: Secure code execution in managed environments
- **WebSocket Support**: Real-time updates and live synchronization
- **Authentication**: JWT-based security with project-level access control

## 📦 Installation

```bash
cd kiro-server
npm install
```

## 🏃‍♂️ Running the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## 🔧 API Endpoints

### Health & Status
- `GET /api/health` - Server health check
- `GET /api/status` - Detailed service status
- `POST /api/auth/verify` - Authentication verification

### Planning Service
- `GET /api/planning/projects` - List all projects
- `POST /api/planning/projects` - Create new project
- `PUT /api/planning/projects/:id` - Update project

### Prototyping Service
- `GET /api/prototyping/prototypes` - List prototypes
- `POST /api/prototyping/prototypes` - Create prototype

### Documentation Service
- `GET /api/documentation/documents` - List documents
- `POST /api/documentation/generate` - Generate documentation

### Workflow Service
- `GET /api/workflows/workflows` - List workflows
- `POST /api/workflows/workflows/:id/execute` - Execute workflow

### Execution Service
- `GET /api/execution/environments` - List environments
- `POST /api/execution/run` - Execute code

## 🔌 WebSocket Events

Connect to `ws://localhost:3001` for real-time updates:

- `kiro:connected` - Connection established
- `planning:project_created` - New project created
- `planning:project_updated` - Project updated
- `workflow:execution_progress` - Workflow progress update
- `execution:completed` - Code execution completed

## 🔐 Authentication

All API endpoints (except health checks) require authentication:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/planning/projects
```

## 🧪 Testing

Test the server connection:

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Kiro IDE Server",
  "version": "1.0.0",
  "services": {
    "planning": "operational",
    "prototyping": "operational", 
    "documentation": "operational",
    "workflows": "operational",
    "execution": "operational"
  }
}
```

## 🔗 ConceptPulse Integration

The ConceptPulse application automatically connects to this server when:

1. `VITE_KIRO_ENABLED=true` in `.env`
2. `VITE_KIRO_API_URL=http://localhost:3001/api`
3. Kiro server is running on port 3001

## 📊 Sample Data

The server includes rich sample data:

- **1 Project**: "ConceptPulse Learning Platform" with 6 tasks
- **1 Prototype**: "ConceptPulse Design System" with components
- **1 Document**: Complete API documentation
- **1 Workflow**: "Kiro-Powered Learning Pipeline" with 7 steps
- **1 Environment**: "Kiro Production Environment"

## 🛠️ Development

The server uses in-memory storage for demo purposes. In production, replace with:

- Database integration (PostgreSQL, MongoDB)
- Redis for caching and sessions
- Proper JWT verification
- File upload handling
- Rate limiting and security middleware

## 📝 Logs

Server logs show:
- WebSocket connections
- API requests
- Real-time event broadcasts
- Service status updates

## 🔄 Real-time Updates

When data changes, the server broadcasts WebSocket events to all connected clients, enabling:

- Live project updates
- Real-time workflow progress
- Instant documentation refresh
- Collaborative editing features

## 🎯 Production Deployment

For production deployment:

1. Set environment variables
2. Configure database connections
3. Enable HTTPS/WSS
4. Add monitoring and logging
5. Implement proper authentication
6. Set up load balancing

---

**Status**: ✅ Operational  
**Version**: 1.0.0  
**Last Updated**: December 30, 2024