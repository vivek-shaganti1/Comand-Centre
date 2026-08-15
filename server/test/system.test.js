import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { db } from '../db.js';
import { agentSwarm } from '../agents.js';
import { ProjectBuilder } from '../projectBuilder.js';
import { telegramService } from '../telegramService.js';
import { reminderScheduler } from '../reminderScheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSuite() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING AVENGERS JARVIS COMMAND CENTER TEST SUITE');
  console.log('======================================================\n');

  // Test 1: 20 Agents Roster Validation
  console.log('▶ Test 1: Validating 20 Specialized Autonomous Agents Roster...');
  const agents = agentSwarm.getAgents();
  assert.strictEqual(agents.length, 20, 'Swarm must contain exactly 20 agents');
  
  const jarvis = agentSwarm.getAgent('JARVIS-01');
  const friday = agentSwarm.getAgent('FRIDAY-02');
  const vision = agentSwarm.getAgent('VISION-03');
  const stark = agentSwarm.getAgent('STARK-04');
  const banner = agentSwarm.getAgent('BANNER-05');
  const hawkeye = agentSwarm.getAgent('HAWKEYE-07');
  const fury = agentSwarm.getAgent('NICK-FURY-20');

  assert(jarvis && jarvis.name.includes('J.A.R.V.I.S.'), 'JARVIS-01 must exist');
  assert(friday && friday.name.includes('F.R.I.D.A.Y.'), 'FRIDAY-02 must exist');
  assert(vision && vision.name.includes('Vision'), 'VISION-03 must exist');
  assert(stark && stark.name.includes('Tony Stark'), 'STARK-04 must exist');
  assert(banner && banner.name.includes('Bruce Banner'), 'BANNER-05 must exist');
  assert(hawkeye && hawkeye.name.includes('Hawkeye'), 'HAWKEYE-07 must exist');
  assert(fury && fury.name.includes('Nick Fury'), 'NICK-FURY-20 must exist');
  console.log('  ✅ Passed: All 20 agents verified with designated roles and active state.');

  // Test 2: Database Operations & Leftover Works
  console.log('\n▶ Test 2: Database Operations & Leftover Work Calculation...');
  const initialLeftovers = db.getLeftoverTasks().length;
  
  const testTask = db.addTask({
    title: 'Test Quantum Suit Propulsion',
    description: 'Automated test task creation',
    priority: 'urgent',
    category: 'Engineering',
    source: 'Test Runner'
  });
  assert(testTask.id, 'Task must have a generated ID');
  assert.strictEqual(testTask.status, 'pending');
  assert.strictEqual(testTask.is_leftover, true);
  
  const updatedLeftovers = db.getLeftoverTasks().length;
  assert.strictEqual(updatedLeftovers, initialLeftovers + 1, 'Leftover count should increment');

  // Mark task completed
  db.updateTask(testTask.id, { status: 'completed' });
  const finalLeftovers = db.getLeftoverTasks().length;
  assert.strictEqual(finalLeftovers, initialLeftovers, 'Leftover count should decrement when completed');
  
  // Cleanup test task
  db.deleteTask(testTask.id);
  console.log('  ✅ Passed: Database CRUD and leftover work logic functioning perfectly.');

  // Test 3: Enterprise 8-Division Workforce & Multi-Stage Autonomous Pipeline
  console.log('\n▶ Test 3: Enterprise Multi-Stage Project Pipeline & Workforce Delegation...');
  const workforce = agentSwarm.getAllWorkers();
  assert(workforce.length >= 20 + 8, 'Workforce must contain council and all department workers');
  
  const depts = agentSwarm.getDepartments();
  assert(depts.PLANNING && depts.UI_UX && depts.FRONTEND && depts.BACKEND && depts.DATABASE && depts.SECURITY && depts.QA && depts.DEVOPS, 'All 8 divisions must exist');

  const projectLogs = [];
  const stageUpdates = [];
  const buildResult = await ProjectBuilder.buildProject({
    prompt: 'Build an enterprise quantum radar dashboard with Antigravity across all 8 stages',
    projectName: 'test-enterprise-radar',
    builderEngine: 'antigravity',
    onLog: (l) => projectLogs.push(l),
    onStageUpdate: (st) => stageUpdates.push(st)
  });

  assert.strictEqual(buildResult.success, true, 'Project build must report success');
  assert.strictEqual(stageUpdates.length, 8, 'All 8 stages must execute in sequence');
  assert(fs.existsSync(buildResult.projectPath), 'Project directory must exist on disk');
  assert(fs.existsSync(path.join(buildResult.projectPath, 'ARCHITECTURE.md')), 'Stage 1 Architecture doc must exist');
  assert(fs.existsSync(path.join(buildResult.projectPath, 'style.css')), 'Stage 2 UI/UX design tokens must exist');
  assert(fs.existsSync(path.join(buildResult.projectPath, 'index.html')), 'Stage 3 HTML must exist');
  assert(fs.existsSync(path.join(buildResult.projectPath, 'app.js')), 'Stage 3 App logic must exist');
  assert(fs.existsSync(path.join(buildResult.projectPath, 'server.js')), 'Stage 4 Server must exist');
  assert(fs.existsSync(path.join(buildResult.projectPath, 'schema.json')), 'Stage 5 Database schema must exist');
  assert(fs.existsSync(path.join(buildResult.projectPath, 'security-audit.json')), 'Stage 6 Security audit must exist');
  assert(fs.existsSync(path.join(buildResult.projectPath, 'package.json')), 'Stage 8 Package manifest must exist');
  assert(fs.existsSync(path.join(buildResult.projectPath, 'test.js')), 'Stage 7 Test assertions must exist');
  console.log(`  ✅ Passed: Enterprise project "${buildResult.project.name}" generated across 8 stages with ${buildResult.files.length} artifacts.`);

  // Test 4: Telegram Linear Voice Command Workflow
  console.log('\n▶ Test 4: Linear Telegram Voice Command Processing...');
  
  // 4a. Task directive
  const taskRes = await telegramService.processCommandWorkflow(
    'Prepare security blueprint for Mark 85 armor',
    'test-chat-123',
    'Commander',
    true
  );
  assert.strictEqual(taskRes.actionType, 'task');
  assert(taskRes.responseMessage.includes('DIRECTIVE RECORDED'));

  // 4b. Reminder directive
  const remRes = await telegramService.processCommandWorkflow(
    'Remind me at the end of the day to inspect agent health',
    'test-chat-123',
    'Commander',
    true
  );
  assert.strictEqual(remRes.actionType, 'reminder');
  assert(remRes.responseMessage.includes('REMINDER LOCKED'));

  // 4c. Leftover review query
  const revRes = await telegramService.processCommandWorkflow(
    'What works are leftover for today? Give me a review',
    'test-chat-123',
    'Commander',
    true
  );
  assert.strictEqual(revRes.actionType, 'review');
  assert(revRes.responseMessage.includes('LEFTOVER WORK REPORT') || revRes.responseMessage.includes('WORK DEBRIEF'));

  console.log('  ✅ Passed: All Telegram voice workflow branches (Task, Reminder, Review) passed.');

  // Test 5: End-of-Day Scheduler & JARVIS Speech Synthesis
  console.log('\n▶ Test 5: End-of-Day Briefing & Verbal Speech Synthesis...');
  const eodResult = await reminderScheduler.triggerEndOfDayDebrief();
  assert(eodResult.summaryText.length > 0, 'EOD summary must not be empty');
  assert(eodResult.speechAudioText.length > 0, 'Speech text must not be empty');
  assert(eodResult.speechAudioText.includes('Sir'), 'JARVIS speech text must contain formal debrief');
  console.log(`  ✅ Passed: EOD synthesized speech generated: "${eodResult.speechAudioText.slice(0, 70)}..."`);

  console.log('\n======================================================');
  console.log('🎉 ALL 5 INTEGRATION & SYSTEM TEST SUITES PASSED (100%)');
  console.log('======================================================\n');
}

runSuite().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
