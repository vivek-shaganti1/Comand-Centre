import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'stark_command_center.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultData = {
  tasks: [
    {
      id: 'task-1',
      title: 'Review Stark Industries Mark 85 Armor Telemetry',
      description: 'Check arc reactor power distribution and sub-agent latency metrics.',
      priority: 'high',
      status: 'in-progress',
      category: 'System',
      due_date: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
      reminder_time: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      created_at: new Date().toISOString(),
      completed_at: null,
      source: 'JARVIS Voice System',
      is_leftover: true
    },
    {
      id: 'task-2',
      title: 'Deploy Quantum Antigravity Pipeline to Production',
      description: 'Run automated build pipeline and verify all 20 agents reporting nominal.',
      priority: 'urgent',
      status: 'pending',
      category: 'Development',
      due_date: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
      reminder_time: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
      created_at: new Date().toISOString(),
      completed_at: null,
      source: 'Telegram Mobile Voice',
      is_leftover: true
    },
    {
      id: 'task-3',
      title: 'Calibrate Telegram Voice Transcription Node',
      description: 'Ensure OGG voice notes from iPhone/Android are decoded with sub-second latency.',
      priority: 'medium',
      status: 'completed',
      category: 'Telegram',
      due_date: new Date().toISOString(),
      reminder_time: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      completed_at: new Date().toISOString(),
      source: 'Telegram Voice',
      is_leftover: false
    }
  ],
  reminders: [
    {
      id: 'rem-1',
      taskId: 'task-2',
      alertTime: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
      message: 'Sir, reminder: Deploy Quantum Antigravity Pipeline is due soon.',
      triggered: false,
      isEod: false
    }
  ],
  voiceLogs: [],
  projects: [],
  agentLogs: [],
  settings: {
    telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    selectedModel: process.env.OPENAI_MODEL || 'gpt-4o',
    eodReminderTime: '21:00', // 9 PM default
    caffeinateEnabled: true,
    soundEnabled: true,
    lastEodReviewDate: null
  }
};

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...defaultData, ...parsed };
      }
    } catch (e) {
      console.error('[STARK DB] Error loading DB, using defaults:', e.message);
    }
    this.save(defaultData);
    return defaultData;
  }

  save(data = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[STARK DB] Error saving DB:', e.message);
    }
  }

  // Tasks API
  getTasks() {
    return this.data.tasks || [];
  }

  getLeftoverTasks() {
    return (this.data.tasks || []).filter(t => t.status !== 'completed');
  }

  addTask(task) {
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: task.title || 'Untitled Task',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      category: task.category || 'General',
      due_date: task.due_date || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      reminder_time: task.reminder_time || null,
      created_at: new Date().toISOString(),
      completed_at: null,
      source: task.source || 'Command Center',
      is_leftover: true
    };
    this.data.tasks.unshift(newTask);
    this.save();
    return newTask;
  }

  updateTask(id, updates) {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      if (updates.status === 'completed' && this.data.tasks[idx].status !== 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.is_leftover = false;
      } else if (updates.status && updates.status !== 'completed') {
        updates.completed_at = null;
        updates.is_leftover = true;
      }
      this.data.tasks[idx] = { ...this.data.tasks[idx], ...updates };
      this.save();
      return this.data.tasks[idx];
    }
    return null;
  }

  deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.data.reminders = this.data.reminders.filter(r => r.taskId !== id);
    this.save();
    return true;
  }

  // Reminders API
  getReminders() {
    return this.data.reminders || [];
  }

  addReminder(reminder) {
    const newRem = {
      id: `rem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      taskId: reminder.taskId || null,
      alertTime: reminder.alertTime || new Date().toISOString(),
      message: reminder.message || 'Task reminder alert',
      triggered: false,
      isEod: Boolean(reminder.isEod)
    };
    this.data.reminders.push(newRem);
    this.save();
    return newRem;
  }

  markReminderTriggered(id) {
    const rem = this.data.reminders.find(r => r.id === id);
    if (rem) {
      rem.triggered = true;
      this.save();
    }
  }

  // Voice Logs API
  addVoiceLog(log) {
    const newLog = {
      id: `voice-${Date.now()}`,
      audioPath: log.audioPath || '',
      transcript: log.transcript || '',
      parsedIntent: log.parsedIntent || {},
      duration: log.duration || 0,
      createdAt: new Date().toISOString(),
      responseText: log.responseText || ''
    };
    if (!this.data.voiceLogs) this.data.voiceLogs = [];
    this.data.voiceLogs.unshift(newLog);
    if (this.data.voiceLogs.length > 100) this.data.voiceLogs.pop();
    this.save();
    return newLog;
  }

  getVoiceLogs() {
    return this.data.voiceLogs || [];
  }

  // Projects API
  getProjects() {
    return this.data.projects || [];
  }

  addProject(project) {
    const newProject = {
      id: `proj-${Date.now()}`,
      name: project.name,
      slug: project.slug,
      description: project.description || '',
      builderEngine: project.builderEngine || 'antigravity',
      status: project.status || 'building',
      path: project.path,
      filesCount: project.filesCount || 0,
      files: project.files || [],
      buildLogs: project.buildLogs || [],
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    if (!this.data.projects) this.data.projects = [];
    this.data.projects.unshift(newProject);
    this.save();
    return newProject;
  }

  updateProject(id, updates) {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.projects[idx] = { ...this.data.projects[idx], ...updates };
      this.save();
      return this.data.projects[idx];
    }
    return null;
  }

  // Agent Logs API
  addAgentLog(log) {
    const entry = {
      id: `alog-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      agentId: log.agentId,
      agentName: log.agentName,
      action: log.action,
      message: log.message,
      status: log.status || 'info',
      timestamp: new Date().toISOString()
    };
    if (!this.data.agentLogs) this.data.agentLogs = [];
    this.data.agentLogs.unshift(entry);
    if (this.data.agentLogs.length > 200) this.data.agentLogs.pop();
    this.save();
    return entry;
  }

  getAgentLogs(limit = 50) {
    return (this.data.agentLogs || []).slice(0, limit);
  }

  // Settings
  getSettings() {
    return this.data.settings || defaultData.settings;
  }

  updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }
}

export const db = new Database();
