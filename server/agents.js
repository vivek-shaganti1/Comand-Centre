import { db } from './db.js';

// Executive 20 Avengers Council
export const EXECUTIVE_COUNCIL = [
  { id: 'JARVIS-01', name: 'J.A.R.V.I.S. Prime', division: 'Command', role: 'Supreme Orchestrator & Voice Synthesizer', avatar: '🤖', color: '#00f0ff', specialty: 'Intent Parsing, Executive Command, Speech Output', status: 'ACTIVE', activity: 'Monitoring Neural Voice Bus & Worker Grid', cpu: 12, memory: '1.2 GB', tasksProcessed: 142 },
  { id: 'FRIDAY-02', name: 'F.R.I.D.A.Y.', division: 'Operations', role: 'Task Warden & Productivity Auditor', avatar: '⚡', color: '#38bdf8', specialty: 'Task Lifecycles, Leftover Work Detection, Priority Balancing', status: 'ACTIVE', activity: 'Auditing pending deliverables & stage transitions', cpu: 8, memory: '840 MB', tasksProcessed: 320 },
  { id: 'VISION-03', name: 'Vision Neural', division: 'Intelligence', role: 'Telegram Audio & Voice Decoder', avatar: '👁️', color: '#a855f7', specialty: 'Speech-to-Text, Whisper Inference, Entity Extraction', status: 'ACTIVE', activity: 'Listening for incoming Telegram voice notes', cpu: 18, memory: '1.8 GB', tasksProcessed: 89 },
  { id: 'STARK-04', name: 'Tony Stark AI', division: 'Architecture', role: 'Antigravity Chief Architect', avatar: '🦾', color: '#ef4444', specialty: 'Autonomous System Architecture & Pipeline Orchestration', status: 'ACTIVE', activity: 'Multi-Stage Swarm Engine standby', cpu: 15, memory: '2.1 GB', tasksProcessed: 74 },
  { id: 'BANNER-05', name: 'Dr. Bruce Banner', division: 'Backend', role: 'Claude Deep Reasoner & Scaffolder', avatar: '🧪', color: '#22c55e', specialty: 'Complex Logic Generation, Algorithmic Analysis', status: 'ACTIVE', activity: 'Synthesizing backend schemas & state models', cpu: 9, memory: '1.4 GB', tasksProcessed: 61 },
  { id: 'THOR-06', name: 'Thor Odinson', division: 'DevOps', role: 'Execution & Deployment Hammer', avatar: '⚡', color: '#eab308', specialty: 'Process Execution, Package Installer, Environment Setup', status: 'IDLE', activity: 'Execution pipeline primed', cpu: 4, memory: '620 MB', tasksProcessed: 53 },
  { id: 'HAWKEYE-07', name: 'Hawkeye Sentinel', division: 'Operations', role: 'Reminder & Deadline Sentinel', avatar: '🎯', color: '#f97316', specialty: 'Chrono-tick Alerts, End-of-Day Alarms, Timers', status: 'ACTIVE', activity: 'Tracking active deadlines & scheduled reminders', cpu: 6, memory: '480 MB', tasksProcessed: 215 },
  { id: 'NATASHA-08', name: 'Black Widow', division: 'Security', role: 'Security & Vault Warden', avatar: '🕷️', color: '#f43f5e', specialty: 'API Key Encryption, Auth Handshakes, Input Sanitization', status: 'ACTIVE', activity: 'Zero-trust perimeter nominal', cpu: 5, memory: '510 MB', tasksProcessed: 180 },
  { id: 'STRANGE-09', name: 'Doctor Strange', division: 'Planning', role: 'Timeline & Schedule Forecaster', avatar: '⏳', color: '#8b5cf6', specialty: 'Time Estimation, Stage Pipeline Sequencing', status: 'ACTIVE', activity: 'Forecasting multi-stage completion velocity', cpu: 11, memory: '950 MB', tasksProcessed: 97 },
  { id: 'PETER-10', name: 'Spider-Man', division: 'QA & Testing', role: 'Bug Terminator & Test Runner', avatar: '🕸️', color: '#06b6d4', specialty: 'Unit Tests, Lint Verification, Error Recovery', status: 'ACTIVE', activity: 'Scanning codebases for syntax & logic defects', cpu: 7, memory: '730 MB', tasksProcessed: 112 },
  { id: 'SHURI-11', name: 'Shuri Wakanda', division: 'Innovation', role: 'Innovation & Research Oracle', avatar: '🔮', color: '#ec4899', specialty: 'Modern Tech Stack Recommendations, API Search', status: 'ACTIVE', activity: 'Indexing latest Web Standards & AI models', cpu: 10, memory: '1.1 GB', tasksProcessed: 88 },
  { id: 'WAR-MACHINE-12', name: 'War Machine', division: 'DevOps', role: 'DevOps & Server Armor', avatar: '🛡️', color: '#64748b', specialty: 'macOS Daemon Health, Process Keeper, Caffeinate Watchdog', status: 'ACTIVE', activity: '24/7 background sleep prevention enabled', cpu: 8, memory: '690 MB', tasksProcessed: 430 },
  { id: 'CAPTAIN-13', name: 'Captain America', division: 'Planning', role: 'Project Mission Commander', avatar: '🎖️', color: '#3b82f6', specialty: 'Milestone Tracking, Sprint Roadmap, Deliverable Sign-off', status: 'ACTIVE', activity: 'Aligning project roadmap milestones', cpu: 6, memory: '590 MB', tasksProcessed: 105 },
  { id: 'FALCON-14', name: 'Falcon Telemetry', division: 'Telemetry', role: 'Realtime WebSocket Streamer', avatar: '🦅', color: '#10b981', specialty: 'Low-latency HUD Telemetry, Event Broadcasting', status: 'ACTIVE', activity: 'Streaming live 60fps telemetry to Command HUD', cpu: 14, memory: '880 MB', tasksProcessed: 890 },
  { id: 'WANDA-15', name: 'Scarlet Witch', division: 'Database', role: 'State & Database Enchanter', avatar: '✨', color: '#dc2626', specialty: 'Persistent JSON/SQLite Data Store, Atomic Sync', status: 'ACTIVE', activity: 'State mutations synchronized to disk', cpu: 5, memory: '610 MB', tasksProcessed: 670 },
  { id: 'ANT-MAN-16', name: 'Ant-Man', division: 'Operations', role: 'Micro-Task & Quick Memo Tracker', avatar: '🐜', color: '#e11d48', specialty: 'Sub-task breakdown, Quick check items, Rapid notes', status: 'ACTIVE', activity: 'Parsing micro-checklists from audio notes', cpu: 4, memory: '420 MB', tasksProcessed: 144 },
  { id: 'ROCKET-17', name: 'Rocket Raccoon', division: 'Frontend', role: 'System Utilities & Script Builder', avatar: '🦝', color: '#d97706', specialty: 'Shell automation scripts, File transformation, Build configs', status: 'ACTIVE', activity: 'Readying build toolchains & scaffolding scripts', cpu: 7, memory: '650 MB', tasksProcessed: 92 },
  { id: 'GROOT-18', name: 'Groot File Guardian', division: 'Operations', role: 'Workspace File Tree Guardian', avatar: '🌳', color: '#84cc16', specialty: 'Directory management, Asset storage, Clean hierarchy', status: 'ACTIVE', activity: 'Maintaining clean ./projects hierarchy', cpu: 3, memory: '390 MB', tasksProcessed: 120 },
  { id: 'LOKI-19', name: 'Loki Resilience', division: 'QA & Testing', role: 'Chaos & Auto-Recovery Sentinel', avatar: '🎭', color: '#14b8a6', specialty: 'Edge-case handling, Auto-reconnect, Crash resilience', status: 'ACTIVE', activity: 'Health probes green. Zero unhandled rejections.', cpu: 6, memory: '540 MB', tasksProcessed: 310 },
  { id: 'NICK-FURY-20', name: 'Nick Fury', division: 'Command', role: 'Master Oversight & EOD Briefing', avatar: '🎖️', color: '#1e293b', specialty: 'End-of-Day Executive Summary, Telegram Dispatches', status: 'ACTIVE', activity: 'Synthesizing daily mission debrief', cpu: 9, memory: '920 MB', tasksProcessed: 184 }
];

// Department Divisions & Specialized Multi-Stage Workforce (50+ Workers)
export const DEPARTMENT_DIVISIONS = {
  PLANNING: {
    name: 'Planning & Architecture Division',
    stageName: 'Stage 1: System Architecture & Requirements',
    icon: '📐',
    color: '#8b5cf6',
    workers: [
      { id: 'PLAN-01', name: 'Arch. Ethan Cross', role: 'Chief Technical Architect', specialty: 'System Blueprinting & Module Specs', status: 'ACTIVE' },
      { id: 'PLAN-02', name: 'Elena Rostova', role: 'Requirement Decomposer', specialty: 'Functional User Story Mapping', status: 'ACTIVE' },
      { id: 'PLAN-03', name: 'Marcus Vance', role: 'Tech Stack Strategist', specialty: 'Framework Evaluation & Compatibility', status: 'IDLE' },
      { id: 'PLAN-04', name: 'Dr. Aris Thorne', role: 'Data Flow Modeler', specialty: 'High-Throughput IO Diagrams', status: 'ACTIVE' }
    ]
  },
  UI_UX: {
    name: 'UI/UX & Creative Design Lab',
    stageName: 'Stage 2: UI/UX & Design Tokens',
    icon: '🎨',
    color: '#ec4899',
    workers: [
      { id: 'UI-01', name: 'Sophia Chen', role: 'Lead Design Systems Artist', specialty: 'Cyber Glassmorphism & Visual Tokens', status: 'ACTIVE' },
      { id: 'UI-02', name: 'Julian Hayes', role: 'Interaction & Motion Designer', specialty: 'Micro-animations & CSS Keyframes', status: 'ACTIVE' },
      { id: 'UI-03', name: 'Kaelen Voss', role: 'Typography & Layout Specialist', specialty: 'Responsive HUD Grids & Viewports', status: 'ACTIVE' },
      { id: 'UI-04', name: 'Maya Lin', role: 'Accessibility & Contrast Auditor', specialty: 'WCAG 2.2 AA Compliance', status: 'IDLE' }
    ]
  },
  FRONTEND: {
    name: 'Frontend Web Engineering Squad',
    stageName: 'Stage 3: Frontend Web Development',
    icon: '💻',
    color: '#00f0ff',
    workers: [
      { id: 'FE-01', name: 'Lucas Sterling', role: 'Senior React/SPA Engineer', specialty: 'Component Lifecycle & Virtual DOM', status: 'ACTIVE' },
      { id: 'FE-02', name: 'Amara Okafor', role: 'State Management Specialist', specialty: 'Zustand & Context Pipeline', status: 'ACTIVE' },
      { id: 'FE-03', name: 'Dmitri Volkov', role: 'Vanilla CSS & Layout Master', specialty: 'Hardware-Accelerated Flex & Grid', status: 'ACTIVE' },
      { id: 'FE-04', name: 'Zoe Kincaid', role: 'Client Performance Optimizer', specialty: 'Bundle Splitting & Lazy Rendering', status: 'ACTIVE' }
    ]
  },
  BACKEND: {
    name: 'Backend API & Microservices Division',
    stageName: 'Stage 4: Backend API & Business Logic',
    icon: '⚙️',
    color: '#22c55e',
    workers: [
      { id: 'BE-01', name: 'Devon Mercer', role: 'Principal API Architect', specialty: 'Express & RESTful Routing Pipelines', status: 'ACTIVE' },
      { id: 'BE-02', name: 'Talia Reed', role: 'Async Services Specialist', specialty: 'Event Queues & Background Workers', status: 'ACTIVE' },
      { id: 'BE-03', name: 'Gideon Fox', role: 'WebSocket & Telemetry Engineer', specialty: 'Bi-directional Realtime Sockets', status: 'ACTIVE' },
      { id: 'BE-04', name: 'Nadia Solis', role: 'Middleware & Error Handler', specialty: 'Zero-Crash Fault Isolation', status: 'IDLE' }
    ]
  },
  DATABASE: {
    name: 'Database Architecture & Persistence Core',
    stageName: 'Stage 5: Database & Schema Design',
    icon: '🗄️',
    color: '#f59e0b',
    workers: [
      { id: 'DB-01', name: 'Vikram Patel', role: 'Lead Data Architect', specialty: 'Relational & Document Modeling', status: 'ACTIVE' },
      { id: 'DB-02', name: 'Cora Vance', role: 'Query Optimization Specialist', specialty: 'Indexing & Transaction Isolation', status: 'ACTIVE' },
      { id: 'DB-03', name: 'Silas Drake', role: 'Persistence Guardian', specialty: 'Atomic JSON & SQLite File Locking', status: 'ACTIVE' }
    ]
  },
  SECURITY: {
    name: 'Cyber Security & Vault Directorate',
    stageName: 'Stage 6: Security, Auth & Input Hardening',
    icon: '🛡️',
    color: '#ef4444',
    workers: [
      { id: 'SEC-01', name: 'Valerie Stone', role: 'Chief Security Officer', specialty: 'OWASP Top 10 Mitigation & Audit', status: 'ACTIVE' },
      { id: 'SEC-02', name: 'Dante Rivera', role: 'Auth Protocol Engineer', specialty: 'JWT, OAuth & Token Sanitization', status: 'ACTIVE' },
      { id: 'SEC-03', name: 'Rhea Novak', role: 'Payload Fuzzing Specialist', specialty: 'XSS, CSRF & Injection Defense', status: 'ACTIVE' }
    ]
  },
  QA: {
    name: 'Quality Assurance & Bug Termination Squad',
    stageName: 'Stage 7: QA, Unit Testing & Verification',
    icon: '🕷️',
    color: '#06b6d4',
    workers: [
      { id: 'QA-01', name: 'Miles Warren', role: 'Chief Test Engineer', specialty: 'End-to-End Suite Assertions', status: 'ACTIVE' },
      { id: 'QA-02', name: 'Chloe Briggs', role: 'Syntax & Lint Doctor', specialty: 'Static Analysis & AST Validation', status: 'ACTIVE' },
      { id: 'QA-03', name: 'Jaxson Bennett', role: 'Regression Hunter', specialty: 'Edge Case & Fault Injection', status: 'ACTIVE' }
    ]
  },
  DEVOPS: {
    name: 'DevOps, Packaging & Infrastructure Squad',
    stageName: 'Stage 8: DevOps, Packaging & Delivery',
    icon: '🚀',
    color: '#eab308',
    workers: [
      { id: 'OPS-01', name: 'Harrison Thorne', role: 'Release Commander', specialty: 'Package Manifests & Start Scripts', status: 'ACTIVE' },
      { id: 'OPS-02', name: 'Kyra Jensen', role: 'Process Daemon Keeper', specialty: 'Daemon Orchestration & Uptime Checks', status: 'ACTIVE' },
      { id: 'OPS-03', name: 'Bram Sterling', role: 'Environment Provisioner', specialty: 'Dependency Locking & Port Allocation', status: 'IDLE' }
    ]
  }
};

class AgentSwarm {
  constructor() {
    this.council = JSON.parse(JSON.stringify(EXECUTIVE_COUNCIL));
    this.departments = JSON.parse(JSON.stringify(DEPARTMENT_DIVISIONS));
    this.totalWorkforceCount = this.calculateTotalWorkforce();
    this.startBackgroundCycle();
  }

  calculateTotalWorkforce() {
    let count = this.council.length;
    for (const key of Object.keys(this.departments)) {
      count += this.departments[key].workers.length;
    }
    // Expandable pool representation (over 1,000 workforce capacity)
    return count + 1200;
  }

  getAgents() {
    return this.council;
  }

  getAgent(id) {
    return this.council.find(a => a.id === id);
  }

  getDepartments() {
    return this.departments;
  }

  getAllWorkers() {
    const list = [...this.council];
    for (const key of Object.keys(this.departments)) {
      const dept = this.departments[key];
      for (const w of dept.workers) {
        list.push({
          ...w,
          division: dept.name,
          color: dept.color,
          avatar: dept.icon,
          cpu: Math.floor(Math.random() * 15 + 5),
          memory: `${Math.floor(Math.random() * 300 + 200)} MB`,
          tasksProcessed: Math.floor(Math.random() * 50 + 10)
        });
      }
    }
    return list;
  }

  dispatchAgent(agentId, action, message, status = 'BUSY') {
    const agent = this.getAgent(agentId);
    if (agent) {
      agent.status = status;
      agent.activity = message;
      agent.tasksProcessed += 1;
      agent.cpu = Math.min(95, agent.cpu + Math.floor(Math.random() * 20 + 10));

      db.addAgentLog({
        agentId: agent.id,
        agentName: agent.name,
        action,
        message,
        status: 'info'
      });

      setTimeout(() => {
        if (agent.status === 'BUSY') {
          agent.status = 'ACTIVE';
          agent.activity = 'Standing by for next directive';
          agent.cpu = Math.max(4, Math.floor(agent.cpu / 2));
        }
      }, 8000);

      return agent;
    }
    return null;
  }

  // Dispatch an individual worker from a specific department
  dispatchWorker(deptKey, workerId, stageName, taskTitle) {
    const dept = this.departments[deptKey];
    if (dept) {
      const worker = dept.workers.find(w => w.id === workerId) || dept.workers[0];
      if (worker) {
        worker.status = 'BUSY';
        worker.currentTask = taskTitle;

        db.addAgentLog({
          agentId: worker.id,
          agentName: `${worker.name} (${dept.name})`,
          action: 'STAGE_EXECUTION',
          message: `Executing ${stageName}: "${taskTitle}"`,
          status: 'info'
        });

        setTimeout(() => {
          worker.status = 'ACTIVE';
          worker.currentTask = 'Task completed';
        }, 5000);

        return worker;
      }
    }
    return null;
  }

  startBackgroundCycle() {
    setInterval(() => {
      this.council.forEach(a => {
        if (a.status === 'ACTIVE' || a.status === 'IDLE') {
          const delta = (Math.random() - 0.5) * 4;
          a.cpu = Math.max(3, Math.min(35, Math.round(a.cpu + delta)));
        }
      });
    }, 3000);
  }
}

export const agentSwarm = new AgentSwarm();
