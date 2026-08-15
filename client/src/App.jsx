import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Send, Radio, Terminal, CheckCircle2, Circle, AlertCircle,
  Play, Volume2, VolumeX, Settings, Cpu, HardDrive, ShieldCheck, Zap,
  FolderGit2, ListTodo, Clock, Sparkles, Plus, Trash2, Bot, Layers, ArrowUpRight,
  Activity, BarChart3, FileCode, Check, Eye, RefreshCw, X, Users, GitMerge,
  Workflow, Code2, Database, ShieldAlert, CheckCheck, Rocket, Palette, Layout,
  Sliders, Search, ArrowRight, Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [agents, setAgents] = useState([]);
  const [departments, setDepartments] = useState({});
  const [allWorkers, setAllWorkers] = useState([]);
  const [totalCapacity, setTotalCapacity] = useState(1248);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [voiceLogs, setVoiceLogs] = useState([]);
  const [settings, setSettings] = useState({});
  const [leftoverCount, setLeftoverCount] = useState(0);
  const [metrics, setMetrics] = useState(null);

  // Tab navigation
  const [currentTab, setCurrentTab] = useState('hub'); // 'hub', 'pipeline', 'workforce', 'metrics', 'tasks', 'projects', 'telegram'

  // Live Multi-Stage Build state
  const [activeStageProgress, setActiveStageProgress] = useState(null);

  const [commandInput, setCommandInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchAgent, setSearchAgent] = useState('');
  const [searchWorker, setSearchWorker] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [filterTask, setFilterTask] = useState('leftover'); // 'all', 'leftover', 'completed'
  const [showSettings, setShowSettings] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(null);
  const [inspectProject, setInspectProject] = useState(null);
  const [activeFileContent, setActiveFileContent] = useState(null);
  const [buildLogs, setBuildLogs] = useState([]);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('high');
  const [newTaskCategory, setNewTaskCategory] = useState('Engineering');

  // Dispatch agent form state
  const [dispatchDirective, setDispatchDirective] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    telegramToken: '',
    telegramChatId: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    eodReminderTime: '21:00'
  });

  const wsRef = useRef(null);
  const terminalEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Voice speech synthesis
  const speakText = (text) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice = voices.find(v => v.lang.includes('en-GB') || v.name.includes('Daniel') || v.name.includes('George')) || voices[0];
    if (jarvisVoice) utterance.voice = jarvisVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const connectWs = () => {
      const ws = new WebSocket(`ws://${window.location.hostname}:4000`);
      wsRef.current = ws;

      ws.onopen = () => console.log('[HUD] Connected to Stark Core WebSocket');

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'INITIAL_STATE') {
            setAgents(data.agents || []);
            setTasks(data.tasks || []);
            setProjects(data.projects || []);
            setSettings(data.settings || {});
            setSettingsForm(data.settings || {});
            setVoiceLogs(data.voiceLogs || []);
            setLeftoverCount(data.leftoverCount || 0);
          } else if (data.type === 'TELEMETRY_PULSE') {
            setAgents(data.agents || []);
            setLeftoverCount(data.leftoverCount || 0);
          } else if (data.type === 'BUILD_LOG') {
            setBuildLogs(prev => [...prev.slice(-100), data.log]);
          } else if (data.type === 'STAGE_PROGRESS') {
            setActiveStageProgress(data.stage);
          } else if (data.type === 'TASK_CREATED' || data.type === 'TASK_UPDATED') {
            fetchTasks();
          } else if (data.type === 'TASK_DELETED') {
            setTasks(prev => prev.filter(t => t.id !== data.id));
          } else if (data.type === 'PROJECT_COMPLETED') {
            fetchProjects();
            confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
            setTimeout(() => setActiveStageProgress(null), 6000);
          } else if (data.type === 'EOD_DEBRIEF') {
            if (data.speechAudioText) speakText(data.speechAudioText);
          } else if (data.type === 'REMINDER_ALERT') {
            if (data.speechText) speakText(`Alert: ${data.speechText}`);
          }
        } catch (e) {
          console.error('[WS ERROR]', e);
        }
      };

      ws.onclose = () => setTimeout(connectWs, 2500);
    };

    connectWs();
    fetchInitialData();
    fetchMetrics();
    fetchWorkforce();

    const metricsInterval = setInterval(fetchMetrics, 3000);

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCommandInput(transcript);
        handleExecuteCommand(transcript);
      };

      rec.onend = () => setIsRecording(false);
      rec.onerror = () => setIsRecording(false);
      recognitionRef.current = rec;
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
      clearInterval(metricsInterval);
    };
  }, [soundEnabled]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [buildLogs]);

  const fetchInitialData = async () => {
    try {
      const [tasksRes, projectsRes, agentsRes, voiceRes, setRes] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/agents').then(r => r.json()),
        fetch('/api/voice/logs').then(r => r.json()),
        fetch('/api/settings').then(r => r.json())
      ]);

      setAgents(agentsRes);
      setTasks(tasksRes.tasks || []);
      setLeftoverCount(tasksRes.leftovers?.length || 0);
      setProjects(projectsRes);
      setVoiceLogs(voiceRes);
      setSettings(setRes);
      setSettingsForm(setRes);
    } catch (e) {
      console.warn('Backend connecting...', e.message);
    }
  };

  const fetchWorkforce = async () => {
    try {
      const res = await fetch('/api/workforce').then(r => r.json());
      setDepartments(res.departments || {});
      setAllWorkers(res.allWorkers || []);
      setTotalCapacity(res.totalCapacity || 1248);
    } catch (e) {}
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/system/metrics').then(r => r.json());
      setMetrics(res);
    } catch (e) {}
  };

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks').then(r => r.json());
    setTasks(res.tasks || []);
    setLeftoverCount(res.leftovers?.length || 0);
  };

  const fetchProjects = async () => {
    const res = await fetch('/api/projects').then(r => r.json());
    setProjects(res);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is supported in modern browsers (Chrome, Edge, Safari).');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleExecuteCommand = async (inputOverride) => {
    const text = inputOverride || commandInput;
    if (!text.trim()) return;

    setBuildLogs(prev => [...prev, `> [JARVIS DIRECTIVE] "${text}"`]);

    try {
      const res = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, isVoice: isRecording })
      }).then(r => r.json());

      if (res.result?.responseMessage) {
        speakText(res.result.responseMessage);
      }

      fetchTasks();
      fetchProjects();
      fetchMetrics();
      fetchWorkforce();
    } catch (e) {
      console.error(e);
    }

    setCommandInput('');
  };

  const handleTriggerEOD = async () => {
    const res = await fetch('/api/eod/review').then(r => r.json());
    if (res.speechAudioText) {
      speakText(res.speechAudioText);
    }
    fetchTasks();
    fetchMetrics();
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchTasks();
    fetchMetrics();
  };

  const deleteTask = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
    fetchMetrics();
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTaskTitle,
        priority: newTaskPriority,
        category: newTaskCategory,
        source: 'Command Center HUD'
      })
    });

    setNewTaskTitle('');
    setShowAddTask(false);
    fetchTasks();
    fetchMetrics();
  };

  const handleDispatchAgent = async () => {
    if (!showDispatchModal || !dispatchDirective.trim()) return;
    await fetch(`/api/agents/${showDispatchModal.id}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CUSTOM_DIRECTIVE',
        message: dispatchDirective
      })
    });
    setShowDispatchModal(null);
    setDispatchDirective('');
    fetchMetrics();
  };

  const viewProjectFile = async (slug, file) => {
    try {
      const res = await fetch(`/api/projects/${slug}/file?file=${encodeURIComponent(file)}`).then(r => r.json());
      setActiveFileContent(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsForm)
    }).then(r => r.json());
    setSettings(res);
    setShowSettings(false);
    alert('Environment settings synchronized with Stark Core.');
  };

  const filteredAgents = agents.filter(a =>
    a.name.toLowerCase().includes(searchAgent.toLowerCase()) ||
    a.role.toLowerCase().includes(searchAgent.toLowerCase()) ||
    a.specialty.toLowerCase().includes(searchAgent.toLowerCase())
  );

  const filteredWorkers = allWorkers.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchWorker.toLowerCase()) ||
      w.role.toLowerCase().includes(searchWorker.toLowerCase()) ||
      w.specialty.toLowerCase().includes(searchWorker.toLowerCase());
    const matchesDiv = selectedDivision === 'ALL' || w.division.toLowerCase().includes(selectedDivision.toLowerCase());
    return matchesSearch && matchesDiv;
  });

  const filteredTasks = tasks.filter(t => {
    if (filterTask === 'leftover') return t.status !== 'completed';
    if (filterTask === 'completed') return t.status === 'completed';
    return true;
  });

  const stageIcons = [
    { num: 1, name: 'Planning', icon: Workflow, color: '#8b5cf6' },
    { num: 2, name: 'UI/UX', icon: Palette, color: '#ec4899' },
    { num: 3, name: 'Frontend', icon: Layout, color: '#00f0ff' },
    { num: 4, name: 'Backend', icon: Code2, color: '#22c55e' },
    { num: 5, name: 'Database', icon: Database, color: '#f59e0b' },
    { num: 6, name: 'Security', icon: ShieldAlert, color: '#ef4444' },
    { num: 7, name: 'QA Tests', icon: CheckCheck, color: '#06b6d4' },
    { num: 8, name: 'DevOps', icon: Rocket, color: '#eab308' }
  ];

  return (
    <div className="app-container">
      {/* Top HUD Navigation Bar */}
      <header className="top-hud-bar">
        <div className="brand-section">
          <div className="reactor-wrapper" onClick={handleTriggerEOD} title="Arc Reactor Core // Click for End-of-Day Debrief">
            <div className="reactor-orbit" />
            <div className="arc-reactor" />
          </div>
          <div>
            <div className="brand-title">
              <span>STARK</span>
              <span className="accent">// COMMAND CENTER</span>
            </div>
            <div className="brand-subtitle">
              ENTERPRISE NEURAL HUD // {totalCapacity.toLocaleString()} ACTIVE WORKERS
            </div>
          </div>
        </div>

        {/* Segmented Control Navigation Tabs */}
        <div className="nav-tabs-group">
          {[
            { id: 'hub', label: 'SWARM HUB', icon: Bot },
            { id: 'pipeline', label: 'STAGE PIPELINE', icon: GitMerge },
            { id: 'workforce', label: `WORKFORCE (${totalCapacity})`, icon: Users },
            { id: 'metrics', label: 'METRICS', icon: Activity },
            { id: 'tasks', label: `TASKS (${leftoverCount})`, icon: ListTodo },
            { id: 'projects', label: `PROJECTS (${projects.length})`, icon: FolderGit2 },
            { id: 'telegram', label: 'TELEGRAM', icon: Radio }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentTab(tab.id)}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* System Status Indicators & AI Model Selector */}
        <div className="hud-status-badges">
          {/* AI Model Selector */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0, 240, 255, 0.08)', border: '1px solid var(--border-cyan)', borderRadius: 'var(--radius-sm)', padding: '2px 8px' }}>
            <Sparkles size={12} color="#00f0ff" style={{ marginRight: '6px' }} />
            <select
              style={{
                background: 'transparent',
                border: 'none',
                color: '#00f0ff',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
              value={settings.selectedModel || 'gpt-4o'}
              onChange={async (e) => {
                const newModel = e.target.value;
                const updated = await fetch('/api/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ selectedModel: newModel })
                }).then(r => r.json());
                setSettings(updated);
                setSettingsForm(prev => ({ ...prev, selectedModel: newModel }));
              }}
            >
              <option value="gpt-4o" style={{ background: '#0a1020', color: '#fff' }}>OpenAI GPT-4o (Default)</option>
              <option value="gpt-4o-mini" style={{ background: '#0a1020', color: '#fff' }}>OpenAI GPT-4o-mini</option>
              <option value="o3-mini" style={{ background: '#0a1020', color: '#fff' }}>OpenAI o3-mini (Reasoning)</option>
              <option value="claude-3-5-sonnet" style={{ background: '#0a1020', color: '#fff' }}>Claude 3.5 Sonnet</option>
              <option value="antigravity-stark" style={{ background: '#0a1020', color: '#fff' }}>Antigravity Stark Core</option>
            </select>
          </div>

          <div className="badge badge-cyan">
            <Radio size={13} className="animate-pulse" />
            <span>24/7 DAEMON</span>
          </div>

          <div className="badge badge-green">
            <ShieldCheck size={13} />
            <span>CAFFEINATE</span>
          </div>

          <button
            className={`hud-btn hud-btn-outline ${!soundEnabled ? 'opacity-50' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title="Toggle Voice Speech Output"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          <button
            className="hud-btn hud-btn-outline"
            onClick={() => setShowSettings(true)}
            title="Configure .env & Telegram"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* Active Multi-Stage Pipeline Banner */}
      {activeStageProgress && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.12), rgba(168, 85, 247, 0.12))',
          border: '1px solid var(--border-cyan)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 4px 24px rgba(0, 240, 255, 0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <GitMerge size={18} color="#00f0ff" className="animate-pulse" />
              <div>
                <span style={{ fontFamily: 'var(--font-display)', color: '#00f0ff', fontWeight: 'bold', fontSize: '13.5px' }}>
                  ACTIVE PIPELINE: STAGE {activeStageProgress.stageNum}/8 [{activeStageProgress.dept.toUpperCase()}]
                </span>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                  Worker Assigned: <strong style={{ color: '#f59e0b' }}>{activeStageProgress.workerName}</strong> — "{activeStageProgress.stageName}"
                </div>
              </div>
            </div>

            <span style={{ fontFamily: 'var(--font-mono)', color: '#10b981', fontWeight: 'bold', fontSize: '13px' }}>
              {activeStageProgress.progress}% COMPLETE
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
            {stageIcons.map(st => {
              const isCompleted = activeStageProgress.stageNum > st.num;
              const isCurrent = activeStageProgress.stageNum === st.num;
              return (
                <div key={st.num} style={{
                  background: isCompleted ? 'rgba(16, 185, 129, 0.25)' : isCurrent ? 'rgba(0, 240, 255, 0.35)' : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${isCurrent ? '#00f0ff' : isCompleted ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '5px 8px',
                  textAlign: 'center',
                  fontSize: '11px',
                  color: isCurrent ? '#00f0ff' : isCompleted ? '#10b981' : '#64748b'
                }}>
                  <div style={{ fontWeight: 'bold' }}>S{st.num}</div>
                  <div style={{ fontSize: '9.5px', marginTop: '1px' }}>{st.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leftover Work Banner */}
      {leftoverCount > 0 && (
        <div className="leftover-banner">
          <div className="leftover-info">
            <AlertCircle size={22} color="#f59e0b" />
            <div>
              <div className="leftover-title">
                ATTENTION REQUIRED: {leftoverCount} LEFTOVER {leftoverCount === 1 ? 'TASK' : 'TASKS'} DETECTED
              </div>
              <div style={{ fontSize: '12.5px', color: '#cbd5e1' }}>
                F.R.I.D.A.Y. & Hawkeye-07 are monitoring deliverables across all departments. Complete priority directives today.
              </div>
            </div>
          </div>

          <button className="hud-btn hud-btn-amber" onClick={handleTriggerEOD}>
            <Sparkles size={14} />
            <span>DAILY WORK REVIEW</span>
          </button>
        </div>
      )}

      {/* TAB 1: SWARM HUB */}
      {currentTab === 'hub' && (
        <div className="main-layout">
          {/* Left: Voice & Task Quick Console */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="hud-panel">
              <div className="hud-panel-header">
                <span className="panel-title">
                  <Mic size={15} className="icon-accent" />
                  <span>VOICE DIRECTIVE HUB</span>
                </span>
                {isSpeaking && <span className="badge badge-cyan">JARVIS SPEAKING...</span>}
              </div>

              <div className="voice-console">
                <div className="mic-action-row">
                  <button
                    className={`mic-btn ${isRecording ? 'recording' : ''}`}
                    onClick={toggleRecording}
                    title="Click to speak directive"
                  >
                    {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>

                  <div className="waveform-box">
                    {[40, 70, 30, 90, 60, 80, 45, 95, 30, 70, 50, 85].map((h, i) => (
                      <div
                        key={i}
                        className={`wave-bar ${isRecording || isSpeaking ? 'active' : ''}`}
                        style={{
                          animationDelay: `${i * 0.08}s`,
                          height: isRecording || isSpeaking ? `${h}%` : '4px'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="command-input-row">
                  <input
                    type="text"
                    className="hud-input"
                    placeholder="Speak or type directive for multi-stage workforce..."
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand()}
                  />
                  <button className="hud-btn" onClick={() => handleExecuteCommand()}>
                    <Send size={13} />
                  </button>
                </div>
              </div>

              <div className="quick-chips">
                <div
                  className="chip"
                  onClick={() => handleExecuteCommand('Build an enterprise fintech banking system with Antigravity across all 8 stages')}
                >
                  🏢 Build Enterprise Fintech (8 Stages)
                </div>
                <div
                  className="chip"
                  onClick={() => handleExecuteCommand('Build a real-time crypto analytics dashboard with Antigravity')}
                >
                  🦾 Build Crypto App (Antigravity)
                </div>
                <div
                  className="chip"
                  onClick={() => handleExecuteCommand('Build a quantum AI weather terminal with Claude')}
                >
                  🧪 Build AI App (Claude)
                </div>
                <div
                  className="chip"
                  onClick={() => handleExecuteCommand('What works are leftover for today?')}
                >
                  📋 Check Leftovers
                </div>
              </div>
            </div>

            {/* Tasks Summary */}
            <div className="hud-panel" style={{ flex: 1 }}>
              <div className="hud-panel-header">
                <span className="panel-title">
                  <ListTodo size={15} className="icon-accent" />
                  <span>TASK WARDEN (FRIDAY-02)</span>
                </span>
                <button
                  className="hud-btn hud-btn-outline"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => setShowAddTask(true)}
                >
                  <Plus size={12} />
                  <span>ADD</span>
                </button>
              </div>

              <div className="task-list">
                {tasks.slice(0, 5).map(t => (
                  <div key={t.id} className={`task-item ${t.status === 'completed' ? 'completed' : ''}`}>
                    <input
                      type="checkbox"
                      className="task-checkbox"
                      checked={t.status === 'completed'}
                      onChange={() => toggleTaskStatus(t)}
                    />
                    <div className="task-body">
                      <div className="task-title">{t.title}</div>
                      <div className="task-meta">
                        <span className={`badge ${
                          t.priority === 'urgent' ? 'badge-red' :
                          t.priority === 'high' ? 'badge-amber' : 'badge-cyan'
                        }`} style={{ padding: '1px 5px', fontSize: '9.5px' }}>
                          {t.priority.toUpperCase()}
                        </span>
                        <span style={{ color: '#64748b' }}>{t.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center: 20 Executive Agents Council */}
          <div className="hud-panel">
            <div className="hud-panel-header">
              <span className="panel-title">
                <Bot size={16} className="icon-accent" />
                <span>EXECUTIVE 20-AGENT COUNCIL</span>
              </span>

              <div style={{ position: 'relative', width: '180px' }}>
                <input
                  type="text"
                  className="hud-input"
                  style={{ width: '100%', padding: '5px 10px 5px 26px', fontSize: '11.5px' }}
                  placeholder="Filter council..."
                  value={searchAgent}
                  onChange={(e) => setSearchAgent(e.target.value)}
                />
                <Search size={12} style={{ position: 'absolute', left: '8px', top: '8px', color: '#64748b' }} />
              </div>
            </div>

            <div className="agents-grid">
              {filteredAgents.map(agent => (
                <div key={agent.id} className="agent-card">
                  <div className="agent-header">
                    <div className="agent-avatar">{agent.avatar}</div>
                    <div>
                      <div className="agent-name" style={{ color: agent.color }}>{agent.name}</div>
                      <div className="agent-role">{agent.role}</div>
                    </div>

                    <div className={`agent-status-pill ${
                      agent.status === 'BUSY' ? 'status-busy' :
                      agent.status === 'ACTIVE' ? 'status-active' : 'status-idle'
                    }`}>
                      {agent.status}
                    </div>
                  </div>

                  <div className="agent-activity" title={agent.activity}>
                    {agent.activity}
                  </div>

                  <div className="agent-telemetry">
                    <span>CPU: {agent.cpu}%</span>
                    <span>RAM: {agent.memory}</span>
                    <span>TASKS: {agent.tasksProcessed}</span>
                  </div>

                  <button
                    className="hud-btn hud-btn-outline"
                    style={{ width: '100%', padding: '5px', fontSize: '11px', justifyContent: 'center' }}
                    onClick={() => setShowDispatchModal(agent)}
                  >
                    <span>DISPATCH DIRECTIVE</span>
                    <ArrowUpRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Build Terminal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="hud-panel">
              <div className="hud-panel-header">
                <span className="panel-title">
                  <Terminal size={15} className="icon-accent" />
                  <span>AUTONOMOUS BUILD TERMINAL</span>
                </span>
                <span className="badge badge-cyan">{projects.length} DELIVERED</span>
              </div>

              <div className="build-terminal">
                {buildLogs.length === 0 ? (
                  <p style={{ color: '#64748b' }}>&gt; Build Engine Standby. Speak or type project directive...</p>
                ) : (
                  buildLogs.map((l, i) => (
                    <p key={i} className="log-line">{l}</p>
                  ))
                )}
                <div ref={terminalEndRef} />
              </div>

              {/* Projects List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '190px', overflowY: 'auto' }}>
                {projects.map(p => (
                  <div key={p.id} style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: '#00f0ff', fontWeight: 'bold' }}>{p.name}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{p.filesCount} files • {p.stages?.length || 8} stages</div>
                    </div>

                    <button
                      className="hud-btn hud-btn-outline"
                      style={{ padding: '3px 8px', fontSize: '10px' }}
                      onClick={() => setInspectProject(p)}
                    >
                      <Eye size={11} />
                      <span>INSPECT</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Telegram Activity */}
            <div className="hud-panel" style={{ flex: 1 }}>
              <div className="hud-panel-header">
                <span className="panel-title">
                  <Radio size={15} className="icon-accent" />
                  <span>TELEGRAM SENTINEL</span>
                </span>
                <span className="badge badge-amber">{voiceLogs.length} LOGS</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                {voiceLogs.slice(0, 4).map(vl => (
                  <div key={vl.id} style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11.5px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ color: '#f1f5f9' }}>"{vl.transcript}"</div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                      {new Date(vl.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAGE PIPELINE TRACKER */}
      {currentTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="hud-panel">
            <div className="hud-panel-header">
              <span className="panel-title">
                <GitMerge size={16} className="icon-accent" />
                <span>8-STAGE AUTONOMOUS MULTI-WORKER PIPELINE ARCHITECTURE</span>
              </span>
              <span className="badge badge-green">8 SPECIALIZED SQUADS ENGAGED</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              {[
                { stage: 1, title: 'Planning & Architecture', worker: 'Arch. Ethan Cross', dept: 'Planning Division', icon: Workflow, desc: 'Generates system specifications, data flows & module boundaries in ARCHITECTURE.md' },
                { stage: 2, title: 'UI/UX & Design Tokens', worker: 'Sophia Chen', dept: 'UI/UX Lab', icon: Palette, desc: 'Designs Stark glassmorphic color variables, responsive typography & CSS tokens' },
                { stage: 3, title: 'Frontend Web Engineering', worker: 'Lucas Sterling', dept: 'Frontend Squad', icon: Layout, desc: 'Builds interactive HTML5 DOM, client Javascript & live terminal views' },
                { stage: 4, title: 'Backend API & Microservices', worker: 'Devon Mercer', dept: 'Backend Division', icon: Code2, desc: 'Scaffolds Express RESTful routes, command execution handlers & CORS' },
                { stage: 5, title: 'Database & Persistence', worker: 'Vikram Patel', dept: 'Database Core', icon: Database, desc: 'Defines entity schemas, relational tables & atomic document JSON stores' },
                { stage: 6, title: 'Cyber Security & Vault', worker: 'Valerie Stone', dept: 'Security Directorate', icon: ShieldAlert, desc: 'Runs OWASP Top 10 mitigation, XSS filters & signs security-audit.json' },
                { stage: 7, title: 'QA & Bug Termination', worker: 'Miles Warren', dept: 'QA Squad', icon: CheckCheck, desc: 'Executes automated assertions across all generated artifacts with 100% pass' },
                { stage: 8, title: 'DevOps & Deployment', worker: 'Harrison Thorne', dept: 'DevOps Squad', icon: Rocket, desc: 'Creates npm package manifest, dev/start scripts & production launch configs' }
              ].map(st => {
                const Icon = st.icon;
                return (
                  <div key={st.stage} className="hud-panel" style={{ background: 'var(--bg-card)', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '10px' }}>STAGE {st.stage}</span>
                      <Icon size={18} color="#00f0ff" />
                    </div>

                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: '#fff', fontWeight: 'bold', margin: '8px 0 4px' }}>
                      {st.title}
                    </div>

                    <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                      👤 {st.worker}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      🏢 {st.dept}
                    </div>

                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px', lineHeight: 1.45 }}>
                      {st.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WORKFORCE DIRECTORY */}
      {currentTab === 'workforce' && (
        <div className="hud-panel">
          <div className="hud-panel-header">
            <span className="panel-title">
              <Users size={16} className="icon-accent" />
              <span>STARK ENTERPRISE WORKFORCE DIRECTORY ({totalCapacity.toLocaleString()} EMPLOYEES)</span>
            </span>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                className="hud-input"
                style={{ maxWidth: '160px', padding: '5px 10px', fontSize: '12px' }}
                value={selectedDivision}
                onChange={e => setSelectedDivision(e.target.value)}
              >
                <option value="ALL">All Divisions</option>
                <option value="Planning">Planning</option>
                <option value="UI/UX">UI/UX Design</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="Security">Security</option>
                <option value="QA">QA & Testing</option>
                <option value="DevOps">DevOps</option>
              </select>

              <div style={{ position: 'relative', width: '200px' }}>
                <input
                  type="text"
                  className="hud-input"
                  style={{ width: '100%', padding: '5px 10px 5px 26px', fontSize: '12px' }}
                  placeholder="Search employees..."
                  value={searchWorker}
                  onChange={e => setSearchWorker(e.target.value)}
                />
                <Search size={12} style={{ position: 'absolute', left: '8px', top: '8px', color: '#64748b' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '12px', maxHeight: '580px', overflowY: 'auto' }}>
            {filteredWorkers.map(w => (
              <div key={w.id} className="agent-card" style={{ background: 'var(--bg-card)' }}>
                <div className="agent-header">
                  <div className="agent-avatar">{w.avatar || '👤'}</div>
                  <div>
                    <div className="agent-name" style={{ color: w.color || '#00f0ff' }}>{w.name}</div>
                    <div className="agent-role">{w.role}</div>
                  </div>

                  <div className={`agent-status-pill ${w.status === 'BUSY' ? 'status-busy' : 'status-active'}`}>
                    {w.status || 'ACTIVE'}
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                  🏢 {w.division}
                </div>

                <div className="agent-activity" title={w.specialty}>
                  🎯 {w.specialty}
                </div>

                <div className="agent-telemetry">
                  <span>LOAD: {w.cpu || 8}%</span>
                  <span>TASKS: {w.tasksProcessed || 24}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: METRICS */}
      {currentTab === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <div className="hud-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00f0ff' }}>
                <Cpu size={18} />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>SYSTEM RAM</span>
              </div>
              <div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: '#fff' }}>
                {metrics?.memory?.rss || '64 MB'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Heap Used: {metrics?.memory?.heapUsed || '32 MB'}</div>
            </div>

            <div className="hud-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                <Activity size={18} />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>TASK VELOCITY</span>
              </div>
              <div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: '#10b981' }}>
                {metrics?.taskVelocity?.completionRate || '100%'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {metrics?.taskVelocity?.completed || 0} completed / {metrics?.taskVelocity?.total || 0} total
              </div>
            </div>

            <div className="hud-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                <Users size={18} />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>WORKFORCE POOL</span>
              </div>
              <div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: '#f59e0b' }}>
                {totalCapacity.toLocaleString()} ACTIVE
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>8 Specialized Divisions</div>
            </div>

            <div className="hud-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a855f7' }}>
                <Clock size={18} />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>UPTIME</span>
              </div>
              <div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: '#fff' }}>
                {metrics ? `${Math.floor(metrics.uptimeSeconds / 60)}m ${metrics.uptimeSeconds % 60}s` : 'Active'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Background Sentinel Healthy</div>
            </div>
          </div>

          <div className="hud-panel">
            <div className="hud-panel-header">
              <span className="panel-title">
                <Activity size={15} className="icon-accent" />
                <span>REAL-TIME AGENT & WORKER EXECUTION TIMELINE</span>
              </span>
              <button className="hud-btn hud-btn-outline" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={fetchMetrics}>
                <RefreshCw size={12} />
                <span>REFRESH</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
              {(!metrics?.agentLogs || metrics.agentLogs.length === 0) ? (
                <div style={{ color: '#64748b', padding: '20px', textAlign: 'center' }}>No historical events recorded yet.</div>
              ) : (
                metrics.agentLogs.map((log) => (
                  <div key={log.id} style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '9px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '9.5px' }}>{log.agentId}</span>
                      <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '12.5px' }}>{log.agentName}</span>
                      <span style={{ color: '#94a3b8', fontSize: '12.5px' }}>{log.message}</span>
                    </div>

                    <span style={{ color: '#64748b', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TASKS */}
      {currentTab === 'tasks' && (
        <div className="hud-panel">
          <div className="hud-panel-header">
            <span className="panel-title">
              <ListTodo size={16} className="icon-accent" />
              <span>STARK TASK WARDEN // ALL DIRECTIVES & DELIVERABLES</span>
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="hud-btn hud-btn-outline" onClick={() => setFilterTask('all')}>ALL ({tasks.length})</button>
              <button className="hud-btn hud-btn-amber" onClick={() => setFilterTask('leftover')}>LEFTOVERS ({leftoverCount})</button>
              <button className="hud-btn hud-btn-outline" onClick={() => setFilterTask('completed')}>COMPLETED</button>
              <button className="hud-btn" onClick={() => setShowAddTask(true)}>
                <Plus size={13} />
                <span>NEW DIRECTIVE</span>
              </button>
            </div>
          </div>

          <div className="task-list" style={{ maxHeight: '600px' }}>
            {filteredTasks.map(t => (
              <div key={t.id} className={`task-item ${t.status === 'completed' ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={t.status === 'completed'}
                  onChange={() => toggleTaskStatus(t)}
                />
                <div className="task-body">
                  <div className="task-title" style={{ fontSize: '15px' }}>{t.title}</div>
                  {t.description && <div className="task-desc">{t.description}</div>}
                  <div className="task-meta">
                    <span className={`badge ${
                      t.priority === 'urgent' ? 'badge-red' :
                      t.priority === 'high' ? 'badge-amber' : 'badge-cyan'
                    }`}>{t.priority.toUpperCase()}</span>
                    <span style={{ color: '#64748b' }}>{t.category}</span>
                    <span style={{ color: '#64748b' }}>• Source: {t.source}</span>
                    <span style={{ color: '#64748b' }}>• Created: {new Date(t.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(t.id)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PROJECTS */}
      {currentTab === 'projects' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div className="hud-panel">
            <div className="hud-panel-header">
              <span className="panel-title">
                <FolderGit2 size={16} className="icon-accent" />
                <span>AUTONOMOUS WORKSPACE PROJECTS</span>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
              {projects.map(p => (
                <div key={p.id} className="hud-panel" style={{ padding: '14px', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: '#00f0ff', fontWeight: 'bold' }}>{p.name}</span>
                    <span className="badge badge-green">{p.builderEngine?.toUpperCase()}</span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '5px 0' }}>"{p.description}"</p>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>📁 {p.path}</div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{p.filesCount} files generated ({p.stages?.length || 8} stages)</span>
                    <button className="hud-btn hud-btn-outline" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => setInspectProject(p)}>
                      <Eye size={12} />
                      <span>INSPECT CODE</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hud-panel">
            <div className="hud-panel-header">
              <span className="panel-title">
                <Terminal size={16} className="icon-accent" />
                <span>LIVE COMPILATION FEED</span>
              </span>
            </div>

            <div className="build-terminal" style={{ height: '480px' }}>
              {buildLogs.map((l, i) => (
                <p key={i} className="log-line">{l}</p>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TELEGRAM VAULT */}
      {currentTab === 'telegram' && (
        <div className="hud-panel">
          <div className="hud-panel-header">
            <span className="panel-title">
              <Radio size={16} className="icon-accent" />
              <span>TELEGRAM MOBILE VOICE VAULT & AUDIO INTELLIGENCE</span>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '550px', overflowY: 'auto' }}>
            {voiceLogs.map(vl => (
              <div key={vl.id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px'
              }}>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>
                  "{vl.transcript}"
                </div>

                <div style={{ margin: '6px 0', fontSize: '12.5px', color: '#38bdf8', background: 'rgba(0,240,255,0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                  {vl.responseText}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748b' }}>
                  <span>INTENT: {vl.parsedIntent?.actionType?.toUpperCase()}</span>
                  <span>TIME: {new Date(vl.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspect Project File Modal */}
      {inspectProject && (
        <div className="modal-overlay" onClick={() => setInspectProject(null)}>
          <div className="modal-card" style={{ maxWidth: '820px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="hud-panel-header">
              <span className="panel-title">
                <FileCode size={16} className="icon-accent" />
                <span>WORKSPACE ARTIFACTS: {inspectProject.name.toUpperCase()}</span>
              </span>
              <button
                onClick={() => setInspectProject(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ margin: '12px 0', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {inspectProject.files?.map(file => (
                <button
                  key={file}
                  className={`chip ${activeFileContent?.fileName === file ? 'badge-cyan' : ''}`}
                  onClick={() => viewProjectFile(inspectProject.slug, file)}
                >
                  📄 {file}
                </button>
              ))}
            </div>

            {activeFileContent ? (
              <div style={{ background: '#020611', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-cyan)', maxHeight: '340px', overflowY: 'auto' }}>
                <div style={{ fontSize: '11px', color: '#00f0ff', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                  // File: {activeFileContent.fileName}
                </div>
                <pre style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: '11.5px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {activeFileContent.content}
                </pre>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '28px', color: '#64748b', fontSize: '13px' }}>
                Click on any generated artifact above to preview its code in real-time.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="modal-overlay" onClick={() => setShowAddTask(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="hud-panel-header">
              <span className="panel-title">ADD DIRECTIVE TO TASK WARDEN</span>
            </div>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: '#94a3b8' }}>Task Directive Title</label>
                <input
                  type="text"
                  className="hud-input"
                  style={{ width: '100%', marginTop: '5px' }}
                  placeholder="e.g. Calibrate Mark 85 repulsor sensors"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#94a3b8' }}>Priority</label>
                  <select
                    className="hud-input"
                    style={{ width: '100%', marginTop: '5px' }}
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value)}
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', color: '#94a3b8' }}>Category</label>
                  <input
                    type="text"
                    className="hud-input"
                    style={{ width: '100%', marginTop: '5px' }}
                    value={newTaskCategory}
                    onChange={e => setNewTaskCategory(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" className="hud-btn hud-btn-outline" onClick={() => setShowAddTask(false)}>
                  CANCEL
                </button>
                <button type="submit" className="hud-btn">
                  CREATE TASK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Agent Modal */}
      {showDispatchModal && (
        <div className="modal-overlay" onClick={() => setShowDispatchModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="hud-panel-header">
              <span className="panel-title">
                DISPATCH DIRECTIVE TO {showDispatchModal.name.toUpperCase()}
              </span>
            </div>
            <div style={{ margin: '12px 0', fontSize: '13px', color: '#94a3b8' }}>
              Specialty: <strong style={{ color: '#00f0ff' }}>{showDispatchModal.specialty}</strong>
            </div>

            <textarea
              className="hud-input"
              style={{ width: '100%', height: '90px', resize: 'none' }}
              placeholder={`Enter specific instruction for ${showDispatchModal.name}...`}
              value={dispatchDirective}
              onChange={e => setDispatchDirective(e.target.value)}
              autoFocus
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
              <button className="hud-btn hud-btn-outline" onClick={() => setShowDispatchModal(null)}>
                CANCEL
              </button>
              <button className="hud-btn" onClick={handleDispatchAgent}>
                TRANSMIT DIRECTIVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="hud-panel-header">
              <span className="panel-title">STARK COMMAND & ENVIRONMENT CONFIGURATION</span>
            </div>
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: '#94a3b8' }}>TELEGRAM_BOT_TOKEN</label>
                <input
                  type="password"
                  className="hud-input"
                  style={{ width: '100%', marginTop: '5px' }}
                  placeholder="e.g. 712345678:AAH..."
                  value={settingsForm.telegramToken || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, telegramToken: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: '#94a3b8' }}>TELEGRAM_CHAT_ID</label>
                <input
                  type="text"
                  className="hud-input"
                  style={{ width: '100%', marginTop: '5px' }}
                  placeholder="e.g. 987654321"
                  value={settingsForm.telegramChatId || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, telegramChatId: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: '#94a3b8' }}>OPENAI_API_KEY (For Whisper Audio & GPT-4o Code Engine)</label>
                <input
                  type="password"
                  className="hud-input"
                  style={{ width: '100%', marginTop: '5px' }}
                  placeholder="sk-..."
                  value={settingsForm.openaiApiKey || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, openaiApiKey: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: '#94a3b8' }}>PRIMARY_AI_MODEL</label>
                <select
                  className="hud-input"
                  style={{ width: '100%', marginTop: '5px' }}
                  value={settingsForm.selectedModel || 'gpt-4o'}
                  onChange={e => setSettingsForm({ ...settingsForm, selectedModel: e.target.value })}
                >
                  <option value="gpt-4o">OpenAI GPT-4o (High Performance Flagship)</option>
                  <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Fast & Efficient)</option>
                  <option value="o3-mini">OpenAI o3-mini (High-Level Reasoning)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                  <option value="antigravity-stark">Antigravity Stark Core Engine</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: '#94a3b8' }}>EOD_REMINDER_TIME (24-hour format HH:MM)</label>
                <input
                  type="time"
                  className="hud-input"
                  style={{ width: '100%', marginTop: '5px' }}
                  value={settingsForm.eodReminderTime || '21:00'}
                  onChange={e => setSettingsForm({ ...settingsForm, eodReminderTime: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" className="hud-btn hud-btn-outline" onClick={() => setShowSettings(false)}>
                  CANCEL
                </button>
                <button type="submit" className="hud-btn">
                  SAVE & SYNC TO .ENV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
