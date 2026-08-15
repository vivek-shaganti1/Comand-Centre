import { neon, neonConfig } from '@neondatabase/serverless';

export class NeonDatabase {
  constructor() {
    this.sql = null;
    this.isConnected = false;
    this.initClient();
  }

  initClient(customUrl) {
    const url = customUrl || process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (url && url.startsWith('postgres')) {
      try {
        this.sql = neon(url);
        this.isConnected = true;
        console.log('[NEON DB] Initialized Neon Serverless PostgreSQL connection.');
      } catch (e) {
        console.warn('[NEON DB INIT ERROR]', e.message);
        this.sql = null;
        this.isConnected = false;
      }
    } else {
      this.sql = null;
      this.isConnected = false;
    }
  }

  // 1. Initialize Tables & Migrations in Neon PostgreSQL
  async initSchema() {
    if (!this.sql) return false;

    try {
      console.log('[NEON DB] Running PostgreSQL table schemas and index migrations...');

      // 1. Tasks Table
      await this.sql`
        CREATE TABLE IF NOT EXISTS stark_tasks (
          id VARCHAR(100) PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          priority VARCHAR(20) DEFAULT 'medium',
          status VARCHAR(20) DEFAULT 'pending',
          category VARCHAR(50) DEFAULT 'General',
          due_date TIMESTAMPTZ,
          reminder_time TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          completed_at TIMESTAMPTZ,
          source VARCHAR(50) DEFAULT 'System',
          is_leftover BOOLEAN DEFAULT TRUE
        );
      `;

      // 2. Projects Table
      await this.sql`
        CREATE TABLE IF NOT EXISTS stark_projects (
          id VARCHAR(100) PRIMARY KEY,
          name TEXT NOT NULL,
          slug VARCHAR(255) UNIQUE,
          description TEXT,
          builder_engine VARCHAR(50),
          status VARCHAR(50) DEFAULT 'completed',
          path TEXT,
          files_count INT DEFAULT 0,
          files JSONB DEFAULT '[]'::jsonb,
          stages JSONB DEFAULT '[]'::jsonb,
          build_logs JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      // 3. Voice & Telegram Vault Table
      await this.sql`
        CREATE TABLE IF NOT EXISTS stark_voice_logs (
          id VARCHAR(100) PRIMARY KEY,
          transcript TEXT NOT NULL,
          audio_path TEXT,
          sender VARCHAR(100) DEFAULT 'Commander',
          response_text TEXT,
          parsed_intent JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      // 4. Autonomous Agent Logs Table
      await this.sql`
        CREATE TABLE IF NOT EXISTS stark_agent_logs (
          id VARCHAR(100) PRIMARY KEY,
          agent_id VARCHAR(50) NOT NULL,
          agent_name VARCHAR(100),
          action VARCHAR(100),
          message TEXT,
          status VARCHAR(20) DEFAULT 'info',
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      // 5. Decision Matrix & Executive Reasoning Logs Table
      await this.sql`
        CREATE TABLE IF NOT EXISTS stark_decision_logs (
          id VARCHAR(100) PRIMARY KEY,
          directive TEXT NOT NULL,
          action_type VARCHAR(50),
          agent_lead VARCHAR(100),
          division VARCHAR(100),
          model_used VARCHAR(50),
          decision_rationale TEXT,
          risk_level VARCHAR(20) DEFAULT 'LOW',
          stages_planned INT DEFAULT 8,
          actions_taken JSONB DEFAULT '[]'::jsonb,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      // 6. Reminders Table
      await this.sql`
        CREATE TABLE IF NOT EXISTS stark_reminders (
          id VARCHAR(100) PRIMARY KEY,
          task_id VARCHAR(100),
          alert_time TIMESTAMPTZ NOT NULL,
          message TEXT,
          triggered BOOLEAN DEFAULT FALSE,
          is_eod BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      // 7. System Settings Table
      await this.sql`
        CREATE TABLE IF NOT EXISTS stark_settings (
          key VARCHAR(50) PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      // Create Indexes
      await this.sql`CREATE INDEX IF NOT EXISTS idx_tasks_status ON stark_tasks(status);`;
      await this.sql`CREATE INDEX IF NOT EXISTS idx_projects_slug ON stark_projects(slug);`;
      await this.sql`CREATE INDEX IF NOT EXISTS idx_decision_time ON stark_decision_logs(timestamp DESC);`;

      console.log('✅ [NEON DB] All 7 PostgreSQL tables & indexes created successfully in Neon Serverless.');
      return true;
    } catch (e) {
      console.error('[NEON DB MIGRATION ERROR]', e.message);
      return false;
    }
  }

  // Record an Autonomous Decision in Neon
  async recordDecision({ directive, actionType, agentLead, division, modelUsed, rationale, riskLevel = 'LOW', stagesPlanned = 8, actionsTaken = [] }) {
    const id = `dec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    if (!this.sql) return { id, directive, rationale, timestamp: new Date().toISOString() };

    try {
      await this.sql`
        INSERT INTO stark_decision_logs (
          id, directive, action_type, agent_lead, division, model_used, decision_rationale, risk_level, stages_planned, actions_taken, timestamp
        ) VALUES (
          ${id}, ${directive}, ${actionType}, ${agentLead}, ${division}, ${modelUsed}, ${rationale}, ${riskLevel}, ${stagesPlanned}, ${JSON.stringify(actionsTaken)}::jsonb, NOW()
        )
      `;
      return { id, directive, rationale, riskLevel };
    } catch (e) {
      console.warn('[NEON DECISION LOG ERROR]', e.message);
      return { id, directive, rationale };
    }
  }

  // Fetch Decisions
  async getDecisions(limit = 30) {
    if (!this.sql) return [];
    try {
      const rows = await this.sql`
        SELECT * FROM stark_decision_logs ORDER BY timestamp DESC LIMIT ${limit}
      `;
      return rows;
    } catch (e) {
      console.warn('[NEON GET DECISIONS ERROR]', e.message);
      return [];
    }
  }

  // Synchronize Tasks to Neon
  async syncTask(task) {
    if (!this.sql) return task;
    try {
      await this.sql`
        INSERT INTO stark_tasks (
          id, title, description, priority, status, category, due_date, reminder_time, created_at, completed_at, source, is_leftover
        ) VALUES (
          ${task.id}, ${task.title}, ${task.description || ''}, ${task.priority || 'medium'},
          ${task.status || 'pending'}, ${task.category || 'General'},
          ${task.due_date ? new Date(task.due_date) : null},
          ${task.reminder_time ? new Date(task.reminder_time) : null},
          ${new Date(task.created_at || Date.now())},
          ${task.completed_at ? new Date(task.completed_at) : null},
          ${task.source || 'HUD'},
          ${task.is_leftover !== false}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          priority = EXCLUDED.priority,
          status = EXCLUDED.status,
          category = EXCLUDED.category,
          completed_at = EXCLUDED.completed_at,
          is_leftover = EXCLUDED.is_leftover;
      `;
      return task;
    } catch (e) {
      console.warn('[NEON TASK SYNC ERROR]', e.message);
      return task;
    }
  }

  // Synchronize Project to Neon
  async syncProject(proj) {
    if (!this.sql) return proj;
    try {
      await this.sql`
        INSERT INTO stark_projects (
          id, name, slug, description, builder_engine, status, path, files_count, files, stages, build_logs, created_at
        ) VALUES (
          ${proj.id}, ${proj.name}, ${proj.slug}, ${proj.description || ''},
          ${proj.builderEngine || 'antigravity'}, ${proj.status || 'completed'},
          ${proj.path || ''}, ${proj.filesCount || 0},
          ${JSON.stringify(proj.files || [])}::jsonb,
          ${JSON.stringify(proj.stages || [])}::jsonb,
          ${JSON.stringify(proj.buildLogs || [])}::jsonb,
          ${new Date(proj.created_at || Date.now())}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
      return proj;
    } catch (e) {
      console.warn('[NEON PROJECT SYNC ERROR]', e.message);
      return proj;
    }
  }
}

export const neonDb = new NeonDatabase();
