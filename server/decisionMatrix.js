import { db } from './db.js';
import { neonDb } from './neonDb.js';

export class DecisionMatrix {
  // Evaluates a directive and generates a comprehensive architectural decision audit
  static async evaluateDirective({ prompt, intent, selectedModel, departmentWorkers }) {
    const isBuild = intent.actionType === 'project_build';
    const isEod = intent.isEod || prompt.toLowerCase().includes('end of day') || prompt.toLowerCase().includes('review');
    const isReminder = intent.actionType === 'reminder';

    let division = 'Executive Command Council';
    let agentLead = 'Tony Stark AI (STARK-04)';
    let riskLevel = 'LOW';
    let rationale = '';
    let actionsTaken = [];

    if (isBuild) {
      division = 'Multi-Department 8-Division Workforce';
      agentLead = 'Arch. Ethan Cross & Tony Stark';
      riskLevel = prompt.toLowerCase().includes('fintech') || prompt.toLowerCase().includes('banking') || prompt.toLowerCase().includes('security') ? 'HIGH_INTEGRITY' : 'MEDIUM_PROTOTYPE';
      rationale = `Directive involves autonomous multi-stage asset generation for "${intent.projectName || 'Project'}". Orchestrator selected ${selectedModel.toUpperCase()} for sub-second code synthesis. Task decomposed into 8 sequential department gates with automated QA assertion checkpoints.`;
      actionsTaken = [
        'Decompose system into 8 department divisions (Planning -> DevOps)',
        'Allocate compute and acquire macOS Caffeinate wake lock',
        'Dispatch lead architects and trigger AST syntax checks',
        'Stream compilation telemetry live to Command Center HUD via WebSocket',
        'Persist project metadata and artifacts to Neon PostgreSQL'
      ];
    } else if (isEod) {
      division = 'Master Oversight Directorate';
      agentLead = 'Nick Fury (NICK-FURY-20)';
      riskLevel = 'LOW';
      rationale = `Commander requested end-of-day workload audit. Decision engine triaged pending directives vs completed deliverables, generated executive summary, and queued Telegram audio debrief.`;
      actionsTaken = [
        'Query active database for non-completed leftover tasks',
        'Calculate daily task completion velocity percentage',
        'Synthesize natural speech script for British JARVIS voice engine',
        'Transmit markdown briefing to Telegram mobile chat'
      ];
    } else if (isReminder) {
      division = 'Chrono & Hawkeye Sentinel';
      agentLead = 'Hawkeye (HAWKEYE-07)';
      riskLevel = 'LOW';
      rationale = `Chrono alert scheduled for future delivery. Engine armed 15-second tick loop to monitor timestamp threshold and trigger push notifications.`;
      actionsTaken = [
        'Calculate target timestamp threshold',
        'Store alert in persistent schedule store',
        'Arm Hawkeye-07 sentinel probe'
      ];
    } else {
      division = 'Task Warden Core';
      agentLead = 'F.R.I.D.A.Y. (FRIDAY-02)';
      riskLevel = 'LOW';
      rationale = `General directive categorized and logged to Task Warden with priority triage.`;
      actionsTaken = [
        'Sanitize directive title and assign category',
        'Append to active leftover task pool',
        'Broadcast task creation event to connected HUD clients'
      ];
    }

    const decisionRecord = {
      id: `dec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      directive: prompt,
      actionType: intent.actionType,
      agentLead,
      division,
      modelUsed: selectedModel,
      decisionRationale: rationale,
      riskLevel,
      stagesPlanned: isBuild ? 8 : 1,
      actionsTaken,
      timestamp: new Date().toISOString()
    };

    // Record in memory and persist in Neon PostgreSQL
    db.addAgentLog('JARVIS-01', 'J.A.R.V.I.S.', 'DECISION_EVALUATED', `Executed decision logic for: "${prompt.slice(0, 45)}..." [${riskLevel}]`);
    await neonDb.recordDecision(decisionRecord);

    return decisionRecord;
  }
}
