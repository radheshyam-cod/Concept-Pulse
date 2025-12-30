import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors({
  origin: ['http://localhost:5175', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// In-memory storage with seeded data
const storage = {
  plans: [{
    id: 'plan-1',
    problemStatement: 'Students struggle with retaining complex concepts.',
    featureList: ['AI Diagnostic Quiz', 'Personalized Revision Schedule', 'Concept Weaving'],
    priorities: { 'AI Diagnostic': 'High', 'Revision': 'Medium' },
    timestamps: { created: new Date().toISOString() },
    tasks: [] // Embedded tasks for simplicity in this MVP
  }],
  workflows: [
    // Workflow history/transitions
  ],
  prototypeSession: {
    active: false, // prototypeMode
    sessionId: null
  },
  documentation: {
    architecture: `# ConceptPulse Architecture\n\n- **Frontend**: React + Vite\n- **Backend**: Supabase + Kiro Server\n- **AI**: Gemini 2.0 Flash`,
    apis: `# API Reference\n\n## Planning\n- GET /kiro/plans\n- POST /kiro/plans`,
    stack: `# Tech Stack\n\n- Node.js\n- Express\n- WebSocket\n- TypeScript`
  },
  execution: {
    status: 'running',
    health: { server: 'running', database: 'connected', services: ['planning', 'workflow', 'docs', 'execution'] }
  }
};

// WebSocket Broadcast
const broadcast = (type, data) => {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type, data, timestamp: new Date().toISOString() }));
    }
  });
};

// --- 🔹 Planning Service ---
app.get('/kiro/plans', (req, res) => res.json(storage.plans));
app.post('/kiro/plans', (req, res) => {
  const { problemStatement, featureList, priorities } = req.body;
  if (!problemStatement) return res.status(400).json({ error: 'problemStatement required' });

  const newPlan = {
    id: uuidv4(),
    problemStatement,
    featureList: featureList || [],
    priorities: priorities || {},
    timestamps: { created: new Date().toISOString() },
    tasks: []
  };
  storage.plans.push(newPlan);
  broadcast('plan:created', newPlan);
  res.status(201).json(newPlan);
});
app.get('/kiro/plans/:id', (req, res) => {
  const plan = storage.plans.find(p => p.id === req.params.id);
  plan ? res.json(plan) : res.status(404).json({ error: 'Plan not found' });
});
app.put('/kiro/plans/:id', (req, res) => {
  const idx = storage.plans.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Plan not found' });
  storage.plans[idx] = { ...storage.plans[idx], ...req.body, timestamps: { ...storage.plans[idx].timestamps, updated: new Date().toISOString() } };
  broadcast('plan:updated', storage.plans[idx]);
  res.json(storage.plans[idx]);
});
app.delete('/kiro/plans/:id', (req, res) => {
  const idx = storage.plans.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Plan not found' });
  const deleted = storage.plans.splice(idx, 1);
  broadcast('plan:deleted', deleted[0]);
  res.json({ success: true });
});

// --- 🔹 Workflow Service ---
app.post('/kiro/workflows', (req, res) => {
  // Initialize a workflow for a plan
  // For simplicity, we assume tasks are created here or moved here
  const { planId, tasks } = req.body;
  const plan = storage.plans.find(p => p.id === planId);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  // Add tasks to plan if provided
  if (Array.isArray(tasks)) {
    plan.tasks = tasks.map(t => ({ ...t, id: t.id || uuidv4(), status: 'planned', history: [] }));
  }
  res.json({ success: true, tasks: plan.tasks });
});

app.get('/kiro/workflows/:planId', (req, res) => {
  const plan = storage.plans.find(p => p.id === req.params.planId);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  res.json(plan.tasks || []);
});

app.put('/kiro/workflows/:taskId/move', (req, res) => {
  const { status } = req.body; // planned → building → testing → deployed
  if (!['planned', 'building', 'testing', 'deployed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Find task across all plans
  let taskFound = null;
  let planId = null;

  for (const plan of storage.plans) {
    const task = plan.tasks.find(t => t.id === req.params.taskId);
    if (task) {
      taskFound = task;
      planId = plan.id;
      break;
    }
  }

  if (!taskFound) return res.status(404).json({ error: 'Task not found' });

  const prevStatus = taskFound.status;
  taskFound.status = status;

  const transition = {
    from: prevStatus,
    to: status,
    timestamp: new Date().toISOString()
  };

  if (!taskFound.history) taskFound.history = [];
  taskFound.history.push(transition);

  storage.workflows.push({ taskId: taskFound.id, ...transition }); // Audit log

  broadcast('workflow:moved', { taskId: taskFound.id, planId, status, history: taskFound.history });
  res.json({ success: true, task: taskFound });
});

// --- 🔹 Prototyping Service ---
app.post('/kiro/prototype/session', (req, res) => {
  const { prototypeMode } = req.body;
  storage.prototypeSession.active = !!prototypeMode;
  storage.prototypeSession.sessionId = prototypeMode ? uuidv4() : null;

  broadcast('prototype:mode_changed', storage.prototypeSession);
  res.json(storage.prototypeSession);
});

app.get('/kiro/prototype/status', (req, res) => {
  res.json(storage.prototypeSession);
});

// --- 🔹 Documentation Service ---
app.get('/kiro/docs/architecture', (req, res) => res.send(storage.documentation.architecture));
app.get('/kiro/docs/apis', (req, res) => res.send(storage.documentation.apis));
app.get('/kiro/docs/stack', (req, res) => res.send(storage.documentation.stack));

// --- 🔹 Execution & Health Service ---
app.get('/kiro/health', (req, res) => {
  res.json({
    server: 'running',
    database: 'connected (in-memory)',
    services: ['planning', 'workflow', 'docs', 'execution']
  });
});

app.get('/kiro/execution/status', (req, res) => {
  res.json(storage.execution);
});

// WebSocket
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to Kiro IDE Server 2.0' }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Kiro IDE Server running on http://localhost:${PORT}`);
  console.log(`Routes active: /kiro/plans, /kiro/workflows, /kiro/prototype, /kiro/docs`);
});