import { db } from './db.js';
import { agentSwarm } from './agents.js';
import { telegramService } from './telegramService.js';

export class ReminderScheduler {
  constructor() {
    this.interval = null;
    this.onBroadcast = () => {};
  }

  setBroadcaster(fn) {
    this.onBroadcast = fn;
  }

  start() {
    if (this.interval) clearInterval(this.interval);
    console.log('[REMINDER SCHEDULER] Hawkeye-07 Chrono Sentinel is armed and active.');
    
    // Check every 15 seconds
    this.interval = setInterval(() => {
      this.tick();
    }, 15000);

    // Initial check
    this.tick();
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  tick() {
    const now = new Date();
    const reminders = db.getReminders();
    const untriggered = reminders.filter(r => !r.triggered);

    // 1. Process regular reminders
    for (const rem of untriggered) {
      const alertDate = new Date(rem.alertTime);
      if (now >= alertDate) {
        this.triggerReminder(rem);
      }
    }

    // 2. Check End of Day trigger
    const settings = db.getSettings();
    const eodTime = settings.eodReminderTime || '21:00';
    const [eodHour, eodMin] = eodTime.split(':').map(Number);
    const todayStr = now.toISOString().split('T')[0];

    if (
      now.getHours() === eodHour &&
      now.getMinutes() >= eodMin &&
      settings.lastEodReviewDate !== todayStr
    ) {
      db.updateSettings({ lastEodReviewDate: todayStr });
      this.triggerEndOfDayDebrief();
    }
  }

  async triggerReminder(reminder) {
    db.markReminderTriggered(reminder.id);
    agentSwarm.dispatchAgent('HAWKEYE-07', 'TRIGGER_ALARM', `Firing alert: ${reminder.message}`, 'BUSY');

    console.log(`[REMINDER ALARM] ${reminder.message}`);

    // Send Telegram alert
    const tgMsg = `🎯 *[JARVIS CHRONO ALERT]*\n\n${reminder.message}\n\n_Checked by Hawkeye-07 Chrono Sentinel._`;
    await telegramService.sendMessage(null, tgMsg);

    // Broadcast to HUD UI for speech synthesis
    this.onBroadcast({
      type: 'REMINDER_ALERT',
      reminder,
      speechText: reminder.message
    });
  }

  async triggerEndOfDayDebrief() {
    const leftovers = db.getLeftoverTasks();
    const allTasks = db.getTasks();
    const completedToday = allTasks.filter(t => t.status === 'completed').length;
    const pendingCount = leftovers.length;

    agentSwarm.dispatchAgent(
      'NICK-FURY-20',
      'EOD_DEBRIEF',
      `Synthesizing End-of-Day debrief (${pendingCount} leftover tasks)`,
      'BUSY'
    );

    let summaryText = '';
    let speechAudioText = '';

    if (pendingCount === 0) {
      summaryText = `🌟 *[AVENGERS END-OF-DAY EXECUTIVE BRIEFING]*\n\n` +
        `Command cleared. All directives for today have been executed with 100% completion rate.\n` +
        `• Completed Deliverables: ${completedToday}\n` +
        `• Leftover Works: 0\n\n` +
        `_Systems standing down to low-power sentinel mode. Outstanding work today, Sir._`;

      speechAudioText = `Sir, this is your end of day briefing. All directives have been successfully completed. You have zero leftover works. Systems are standing down.`;
    } else {
      const topList = leftovers
        .slice(0, 6)
        .map((t, i) => `  ${i + 1}. [${t.priority.toUpperCase()}] ${t.title}`)
        .join('\n');

      summaryText = `⚠️ *[AVENGERS END-OF-DAY LEFTOVER WORK BRIEFING]*\n\n` +
        `Sir, as the day concludes, you are leftover with *${pendingCount} active works*:\n\n` +
        `${topList}\n\n` +
        `📊 *Daily Progress:* ${completedToday} completed | ${pendingCount} leftover\n` +
        `💡 *Recommendation:* Review priority items and lock schedule for tomorrow.`;

      speechAudioText = `Sir, this is your end of day debrief. You have ${pendingCount} leftover works remaining for today. Please review your task console and make sure high priority items are scheduled.`;
    }

    // Send Telegram EOD
    await telegramService.sendMessage(null, summaryText);

    // Broadcast to HUD for JARVIS speech synthesis
    this.onBroadcast({
      type: 'EOD_DEBRIEF',
      leftovers,
      summaryText,
      speechAudioText
    });

    return { leftovers, summaryText, speechAudioText };
  }
}

export const reminderScheduler = new ReminderScheduler();
