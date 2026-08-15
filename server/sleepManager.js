import { spawn, exec } from 'child_process';

class SleepManager {
  constructor() {
    this.caffeinateProcess = null;
    this.activeTasksCount = 0;
    this.isMac = process.platform === 'darwin';
  }

  // Prevent sleep while agent is building or executing
  acquireWakeLock(reason = 'Command Center Task Execution') {
    this.activeTasksCount++;
    if (this.caffeinateProcess) return;

    if (this.isMac) {
      try {
        console.log(`[STARK WAKE LOCK] Activating macOS caffeinate: ${reason}`);
        // -d: prevent display sleep
        // -i: prevent idle sleep
        // -m: prevent disk idle sleep
        // -s: prevent system sleep on AC
        // -u: declare user is active
        this.caffeinateProcess = spawn('caffeinate', ['-dimsu'], {
          detached: false,
          stdio: 'ignore'
        });

        this.caffeinateProcess.on('error', (err) => {
          console.warn('[STARK WAKE LOCK] caffeinate spawn notice:', err.message);
          this.caffeinateProcess = null;
        });

        this.caffeinateProcess.on('exit', () => {
          this.caffeinateProcess = null;
        });
      } catch (e) {
        console.warn('[STARK WAKE LOCK] Caffeinate not available:', e.message);
      }
    }
  }

  releaseWakeLock() {
    this.activeTasksCount = Math.max(0, this.activeTasksCount - 1);
    if (this.activeTasksCount === 0 && this.caffeinateProcess) {
      console.log('[STARK WAKE LOCK] All tasks complete. Releasing caffeinate sleep lock.');
      try {
        this.caffeinateProcess.kill('SIGTERM');
      } catch (e) {}
      this.caffeinateProcess = null;
    }
  }

  // Run a critical command wrapped in caffeinate
  async runWithWakeLock(taskFn, reason = 'Critical Build') {
    this.acquireWakeLock(reason);
    try {
      return await taskFn();
    } finally {
      this.releaseWakeLock();
    }
  }
}

export const sleepManager = new SleepManager();
