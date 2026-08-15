# 🦾 Avengers / Iron Man JARVIS Autonomous Command Center

> An ultra-modern, high-tech Iron Man holographic Command Center powered by **20 specialized 24/7 autonomous agents**, real-time Telegram voice note processing & speech transcription, persistent task & leftover work tracking, intelligent end-of-day reminder engine, and autonomous project building (Antigravity & Claude engines) with macOS sleep prevention (`caffeinate`).

---

## ⚡ Key Highlights

1. **20 Specialized 24/7 Autonomous Agents**:
   - `JARVIS-01 (Supreme Orchestrator & Voice Synthesizer)`
   - `FRIDAY-02 (Task Warden & Productivity Auditor)`
   - `VISION-03 (Telegram Audio & Neural Decoder)`
   - `STARK-04 (Antigravity Code Architect)`
   - `BANNER-05 (Claude Deep Reasoner & Scaffolder)`
   - `THOR-06 (Execution & Deployment Hammer)`
   - `HAWKEYE-07 (Reminder & Deadline Sentinel)`
   - `NATASHA-08 (Security & Vault Warden)`
   - `STRANGE-09 (Timeline & Schedule Forecaster)`
   - `PETER-10 (Bug Terminator & Test Runner)`
   - `SHURI-11 (Innovation & Research Oracle)`
   - `WAR-MACHINE-12 (DevOps & Server Armor)`
   - `CAPTAIN-13 (Project Mission Commander)`
   - `FALCON-14 (Realtime Telemetry & WebSockets)`
   - `WANDA-15 (State & Database Enchanter)`
   - `ANT-MAN-16 (Micro-Task & Quick Memo Tracker)`
   - `ROCKET-17 (System Utilities & Script Builder)`
   - `GROOT-18 (Workspace File Tree Guardian)`
   - `LOKI-19 (Chaos & Auto-Recovery Sentinel)`
   - `NICK-FURY-20 (Master Oversight & EOD Briefing)`

2. **Linear Telegram Voice Workflow**:
   - Send a voice note from your phone via Telegram.
   - Vision-03 decodes audio & classifies intent:
     - **Project Build**: Automatically prevents Mac sleep via `caffeinate`, creates `./projects/<project-name>`, generates complete codebase, runs tests with Peter-10, and notifies your Telegram with the files and path.
     - **Task Tracking**: Stores task in database, audits leftover works, and responds with current count.
     - **Reminders / End-of-Day**: Schedules precision chrono-alerts and alerts you at the designated time.
     - **Work Review**: Summarizes all pending and leftover tasks.

3. **24/7 macOS Background Daemon & Wake/Sleep Management**:
   - Runs silently in the background on your Mac using `launchd` (`com.stark.commandcenter.plist`).
   - Automatically invokes `caffeinate -dimsu` whenever work is requested so your laptop stays awake and executes uninterrupted.

4. **Holographic Stark OS Command Center HUD**:
   - Live Arc Reactor pulse, audio visualizer waveforms, 60fps WebSockets telemetry, verbal JARVIS speech synthesis in your browser, and interactive agent dispatch matrix.

---

## 🚀 Quick Start

### 1. Launch Command Center (Frontend + Backend)
```bash
./start.sh
```
- **HUD Interface:** [http://localhost:5173](http://localhost:5173)
- **Backend API & WebSockets:** [http://localhost:4000](http://localhost:4000)

### 2. Install 24/7 macOS Background Daemon
To keep the Telegram listener running continuously even when the browser is closed:
```bash
npm run daemon:install
# or
bash scripts/setup-stark-daemon.sh
```

---

## 📱 Telegram Mobile Setup

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`, choose a name and username (e.g. `MyStarkJarvisBot`).
3. Copy your **Bot Token**.
4. Open the Command Center HUD at [http://localhost:5173](http://localhost:5173), click the **Settings (⚙️)** icon in the top right, and paste your Bot Token.
5. Send `/start` or any voice message from your mobile to your bot.
6. JARVIS is now linked to your phone!

---

## 🎙️ Example Voice Directives

- **Build with Antigravity:**
  > *"Build a real-time crypto portfolio tracker with Antigravity and verify all tests"*
- **Build with Claude:**
  > *"Build a quantum AI weather station with Claude"*
- **Daily Reminders:**
  > *"Remind me at the end of the day to review server telemetry and client deliverables"*
- **Leftover Work Check:**
  > *"What works are leftover for today? Give me a full debrief"*
- **Quick Task:**
  > *"Record task: Calibrate Mark 85 armor battery telemetry"*

---

## 🧪 Running Automated Tests

Run the complete 5-layer integration test suite:
```bash
npm test
```
Verifies all 20 agents, database CRUD, autonomous project generation, linear Telegram workflows, and speech debrief generation with 100% assertions.
