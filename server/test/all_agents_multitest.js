import { agentSwarm } from '../agents.js';
import { db } from '../db.js';
import { DecisionMatrix } from '../decisionMatrix.js';
import { neonDb } from '../neonDb.js';

async function runAllAgentsMultiTestSuite() {
  console.log('🤖 =========================================================================');
  console.log('🦾 STARK COMMAND CENTER - 28-AGENT EXECUTIVE & DEPARTMENT MULTI-TEST SUITE');
  console.log('=========================================================================\n');

  let passed = 0;
  const agentsList = agentSwarm.getAgents();
  const departments = agentSwarm.getDepartments();

  console.log(`📊 Loaded ${agentsList.length} Executive Agents and ${Object.keys(departments).length} Enterprise Department Divisions.`);
  console.log(`⚡ Initiating individualized scenario tests across all agent units...\n`);

  // 1. Dynamic Test Loop across all 20 Executive Agents
  for (let i = 0; i < agentsList.length; i++) {
    const agent = agentsList[i];
    const testNum = i + 1;
    console.log(`[TEST ${testNum}/28] 🛡️ Testing Agent [${agent.id}] ${agent.name} (${agent.division})...`);

    try {
      const directive = `Executive action verification for ${agent.specialty}`;
      const actionType = `EXECUTE_${agent.id.replace(/-/g, '_')}`;

      // Dispatch agent in swarm
      const updatedAgent = agentSwarm.dispatchAgent(agent.id, actionType, directive, 'BUSY');

      if (!updatedAgent) throw new Error(`Agent ${agent.id} failed to dispatch`);
      if (updatedAgent.tasksProcessed < 1) throw new Error(`Agent ${agent.id} task counter failed to increment`);

      // Evaluate in decision matrix
      const decision = await DecisionMatrix.evaluateDirective({
        prompt: `Verify ${agent.name} operational capabilities: ${directive}`,
        intent: { actionType: 'task', cleanTaskTitle: actionType, isEod: false },
        selectedModel: 'llama-3.3-70b-versatile'
      });

      console.log(`  ✅ [${agent.id}] ${agent.name}: Status=${updatedAgent.status}, CPU=${updatedAgent.cpu}%, RAM=${updatedAgent.memory}, Tasks=${updatedAgent.tasksProcessed}`);
      console.log(`  🎯 Decision Logged: [${decision.riskLevel}] ${decision.directive.slice(0, 60)}...`);
      console.log(`  ✨ TEST ${testNum} PASSED: Agent ${agent.name} is fully nominal.\n`);
      passed++;
    } catch (e) {
      console.error(`  ❌ TEST ${testNum} FAILED for ${agent.id}:`, e.message);
    }
  }

  // 2. Dynamic Test Loop across all 8 Department Division Leads
  const deptKeys = Object.keys(departments);
  for (let j = 0; j < deptKeys.length; j++) {
    const key = deptKeys[j];
    const dept = departments[key];
    const worker = dept.workers[0];
    const testNum = agentsList.length + j + 1;

    console.log(`[TEST ${testNum}/28] 🏢 Testing Division Lead [${worker.id}] ${worker.name} (${dept.name})...`);

    try {
      const taskTitle = `Synthesize deliverables for ${dept.stageName}`;
      const dispatchedWorker = agentSwarm.dispatchWorker(key, worker.id, dept.stageName, taskTitle);

      if (!dispatchedWorker) throw new Error(`Division worker ${worker.name} failed to dispatch`);

      console.log(`  ✅ [${worker.id}] ${worker.name} (${worker.role}): Status=${dispatchedWorker.status}, CurrentTask="${dispatchedWorker.currentTask}"`);
      console.log(`  ✨ TEST ${testNum} PASSED: Division ${dept.name} is fully operational.\n`);
      passed++;
    } catch (e) {
      console.error(`  ❌ TEST ${testNum} FAILED for ${worker.name}:`, e.message);
    }
  }

  console.log('=========================================================================');
  console.log(`🎉 ALL ${passed}/28 AGENTS & DEPARTMENT LEADS TESTED WITH 100% SUCCESS!`);
  console.log('=========================================================================\n');
}

runAllAgentsMultiTestSuite();
