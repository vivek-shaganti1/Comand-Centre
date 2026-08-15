import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root and local .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import multer from 'multer';
import fs from 'fs';

import { db } from './db.js';
import { agentSwarm } from './agents.js';
import { telegramService } from './telegramService.js';
import { reminderScheduler } from './reminderScheduler.js';
import { ProjectBuilder } from './projectBuilder.js';
import { sleepManager } from './sleepManager.js';
import { OpenAiService } from './openAiService.js';
import { neonDb } from './neonDb.js';
import { DecisionMatrix } from './decisionMatrix.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 4000;
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `voice-${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/projects', express.static(path.join(__dirname, '..', 'projects')));

// WebSocket Broadcasting Helper
const broadcast = (data) => {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

// Connect Telegram & Scheduler to WebSocket broadcaster
telegramService.setBroadcaster(broadcast);
reminderScheduler.setBroadcaster(broadcast);

wss.on('connection', (ws) => {
  console.log('[WEBSOCKET] Command Center HUD connected.');
  
  // Send initial state snapshot
  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    agents: agentSwarm.getAgents(),
    tasks: db.getTasks(),
    projects: db.getProjects(),
    settings: db.getSettings(),
    voiceLogs: db.getVoiceLogs(),
    leftoverCount: db.getLeftoverTasks().length
  }));

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'DISPATCH_COMMAND') {
        const result = await telegramService.processCommandWorkflow(data.prompt, null, 'Commander (HUD)', false);
        ws.send(JSON.stringify({ type: 'COMMAND_RESULT', result }));
      }
    } catch (e) {
      console.error('[WS MESSAGE ERROR]', e.message);
    }
  });
});

// Periodic Telemetry Stream (Falcon-14)
setInterval(() => {
  broadcast({
    type: 'TELEMETRY_PULSE',
    timestamp: new Date().toISOString(),
    agents: agentSwarm.getAgents(),
    leftoverCount: db.getLeftoverTasks().length
  });
}, 2500);

// --- REST API ENDPOINTS ---

// 1. System Health Status & Deep Metrics
app.get('/api/status', (req, res) => {
  const tasks = db.getTasks();
  const leftover = db.getLeftoverTasks();
  res.json({
    status: 'ONLINE',
    system: 'STARK COMMAND CENTER OS v4.2',
    uptime: process.uptime(),
    agentsCount: agentSwarm.getAgents().length,
    activeAgents: agentSwarm.getAgents().filter(a => a.status === 'ACTIVE' || a.status === 'BUSY').length,
    totalTasks: tasks.length,
    leftoverTasks: leftover.length,
    caffeinateActive: sleepManager.activeTasksCount > 0,
    telegramPolling: telegramService.polling
  });
});

app.get('/api/system/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const tasks = db.getTasks();
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status !== 'completed').length;

  res.json({
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
    },
    caffeinateState: sleepManager.activeTasksCount > 0 ? 'ACQUIRED (WAKE LOCKED)' : 'STANDBY',
    activeTasksCount: sleepManager.activeTasksCount,
    taskVelocity: {
      total: tasks.length,
      completed,
      pending,
      completionRate: tasks.length ? `${Math.round((completed / tasks.length) * 100)}%` : '100%'
    },
    agentLogs: db.getAgentLogs(30),
    telegramStatus: {
      connected: telegramService.polling,
      chatId: db.getSettings().telegramChatId || 'Not set'
    }
  });
});

// Project File Content Explorer
app.get('/api/projects/:slug/file', (req, res) => {
  const { slug } = req.params;
  const fileName = req.query.file;
  if (!fileName) return res.status(400).json({ error: 'file param required' });

  const safePath = path.join(__dirname, '..', 'projects', slug, fileName);
  if (!safePath.startsWith(path.join(__dirname, '..', 'projects'))) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (fs.existsSync(safePath)) {
    const content = fs.readFileSync(safePath, 'utf-8');
    res.json({ fileName, content });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// 2. Tasks API
app.get('/api/tasks', (req, res) => {
  res.json({
    tasks: db.getTasks(),
    leftovers: db.getLeftoverTasks()
  });
});

app.post('/api/tasks', (req, res) => {
  const task = db.addTask(req.body);
  agentSwarm.dispatchAgent('FRIDAY-02', 'CREATE_TASK', `Created task: ${task.title}`, 'BUSY');
  broadcast({ type: 'TASK_CREATED', task });
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const updated = db.updateTask(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  broadcast({ type: 'TASK_UPDATED', task: updated });
  res.json(updated);
});

app.delete('/api/tasks/:id', (req, res) => {
  db.deleteTask(req.params.id);
  broadcast({ type: 'TASK_DELETED', id: req.params.id });
  res.json({ success: true });
});

// 3. Autonomous Agents & Enterprise Workforce
app.get('/api/agents', (req, res) => {
  res.json(agentSwarm.getAgents());
});

app.get('/api/departments', (req, res) => {
  res.json(agentSwarm.getDepartments());
});

app.get('/api/workforce', (req, res) => {
  res.json({
    council: agentSwarm.getAgents(),
    departments: agentSwarm.getDepartments(),
    allWorkers: agentSwarm.getAllWorkers(),
    totalCapacity: agentSwarm.totalWorkforceCount
  });
});

app.post('/api/agents/:id/dispatch', (req, res) => {
  const { action, message } = req.body;
  const agent = agentSwarm.dispatchAgent(req.params.id, action || 'MANUAL_DISPATCH', message || 'Directive received', 'BUSY');
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  broadcast({ type: 'AGENT_DISPATCHED', agent });
  res.json(agent);
});

// 4. Autonomous Project Builder API
app.get('/api/projects', (req, res) => {
  res.json(db.getProjects());
});

app.post('/api/projects/build', async (req, res) => {
  const { prompt, projectName, builderEngine } = req.body;
  if (!prompt && !projectName) {
    return res.status(400).json({ error: 'Prompt or projectName is required' });
  }

  try {
    const result = await ProjectBuilder.buildProject({
      prompt: prompt || `Build project ${projectName}`,
      projectName,
      builderEngine: builderEngine || 'antigravity',
      onLog: (log) => {
        broadcast({ type: 'BUILD_LOG', log, projectName });
      },
      onStageUpdate: (stage) => {
        broadcast({ type: 'STAGE_PROGRESS', stage });
      }
    });
    broadcast({ type: 'PROJECT_COMPLETED', project: result.project });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 5. Voice Processing & Telegram Voice Simulator
app.post('/api/voice/process', upload.single('audio'), async (req, res) => {
  try {
    let transcript = req.body.transcript || '';
    const audioPath = req.file ? req.file.path : '';
    const isVoice = Boolean(req.file || req.body.isVoice);

    // If audio file uploaded and no transcript, transcribe with OpenAI Whisper
    if (audioPath && !transcript) {
      const whisperText = await OpenAiService.transcribeAudio(audioPath);
      if (whisperText) transcript = whisperText;
    }

    if (!transcript) {
      transcript = 'Build an enterprise fintech banking system with Antigravity across all 8 stages';
    }

    const result = await telegramService.processCommandWorkflow(
      transcript,
      db.getSettings().telegramChatId,
      'Commander',
      isVoice
    );

    res.json({
      success: true,
      transcript,
      result
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/voice/logs', (req, res) => {
  res.json(db.getVoiceLogs());
});

// 6. End-of-Day Review Trigger
app.get('/api/eod/review', async (req, res) => {
  const result = await reminderScheduler.triggerEndOfDayDebrief();
  res.json(result);
});

// 7. Settings API
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.post('/api/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  if (req.body.telegramToken !== undefined) {
    telegramService.restart();
  }
  broadcast({ type: 'SETTINGS_UPDATED', settings: updated });
  res.json(updated);
});

// 8. Decisions & Executive Reasoning Matrix API
app.get('/api/decisions', async (req, res) => {
  try {
    const decisions = await neonDb.getDecisions();
    res.json(decisions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 9. Neon Database Management API
app.get('/api/neon/status', (req, res) => {
  res.json({
    connected: neonDb.isConnected,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL || db.getSettings().databaseUrl)
  });
});

app.post('/api/neon/init', async (req, res) => {
  if (req.body.databaseUrl) {
    neonDb.initClient(req.body.databaseUrl);
  }
  const success = await neonDb.initSchema();
  res.json({ success });
});

// 10. Telegram Manual Message Test
app.post('/api/telegram/test-send', async (req, res) => {
  const { message } = req.body;
  const sent = await telegramService.sendMessage(null, message || '🤖 Test alert from JARVIS Command Center');
  res.json({ success: sent });
});

// Start Servers & Services
server.listen(PORT, () => {
  console.log(`=====================================================`);
  console.log(`🦾 STARK AVENGERS COMMAND CENTER SERVER ONLINE`);
  console.log(`🌐 REST & WebSocket Port: ${PORT}`);
  console.log(`🤖 20 Autonomous Agents Initialized and Reporting Nominal`);
  console.log(`=====================================================`);
  
  telegramService.start();
  reminderScheduler.start();
});
