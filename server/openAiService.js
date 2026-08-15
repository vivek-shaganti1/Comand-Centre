import fs from 'fs';
import OpenAI from 'openai';
import { db } from './db.js';

export class OpenAiService {
  static getClient(customKey) {
    const key = customKey || process.env.OPENAI_API_KEY || db.getSettings().openaiApiKey;
    if (!key) return null;
    return new OpenAI({ apiKey: key });
  }

  // 1. Transcribe Audio via OpenAI Whisper-1
  static async transcribeAudio(filePath, customKey) {
    const openai = OpenAiService.getClient(customKey);
    if (!openai) {
      console.log('[OPENAI] No OpenAI API Key found, using local speech parser.');
      return null;
    }

    try {
      console.log(`[OPENAI WHISPER] Transcribing audio file: ${filePath}`);
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
        language: 'en'
      });

      console.log(`[OPENAI WHISPER SUCCESS] Transcript: "${transcription.text}"`);
      return transcription.text;
    } catch (e) {
      console.warn('[OPENAI WHISPER ERROR]', e.message);
      return null;
    }
  }

  // 2. Intelligent NLP Intent Classifier & Decomposition via GPT-4o / GPT-4o-mini
  static async parseIntent(prompt, customKey, modelOverride) {
    const openai = OpenAiService.getClient(customKey);
    const settings = db.getSettings();
    const model = modelOverride || settings.selectedModel || 'gpt-4o-mini';

    if (!openai) return null;

    try {
      console.log(`[OPENAI INTENT] Analyzing directive with model: ${model}`);
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are J.A.R.V.I.S., the AI executive orchestrator of Stark Command Center.
Analyze the user's voice directive and classify into structured JSON with schema:
{
  "actionType": "project_build" | "reminder" | "review" | "task",
  "projectName": string (if project_build, e.g. "Crypto Tracker"),
  "builderEngine": "antigravity" | "claude" | "openai",
  "cleanTaskTitle": string,
  "priority": "urgent" | "high" | "medium" | "low",
  "isEod": boolean,
  "summary": string
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      console.log(`[OPENAI INTENT SUCCESS] Action: ${parsed.actionType}`, parsed);
      return parsed;
    } catch (e) {
      console.warn('[OPENAI INTENT ERROR]', e.message);
      return null;
    }
  }

  // 3. Dynamic Multi-Stage Code Generation via GPT-4o
  static async generateStageCode({ stageKey, projectName, prompt, customKey, modelOverride }) {
    const openai = OpenAiService.getClient(customKey);
    const settings = db.getSettings();
    const model = modelOverride || settings.selectedModel || 'gpt-4o';

    if (!openai) return null;

    try {
      console.log(`[OPENAI CODE] Synthesizing ${stageKey} for "${projectName}" with ${model}`);
      const systemPrompt = `You are a specialized enterprise AI engineer in the Stark Command Center.
You are generating production-ready code files for project: "${projectName}".
User Directive: "${prompt}"
Stage: "${stageKey}"

Return a JSON array of files to create:
{
  "files": [
    {
      "path": "filename.ext",
      "content": "file contents as string"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate the files for stage ${stageKey}. Output valid JSON only.` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content);
      if (result && Array.isArray(result.files) && result.files.length > 0) {
        return result.files;
      }
      return null;
    } catch (e) {
      console.warn(`[OPENAI CODE ERROR for ${stageKey}]`, e.message);
      return null;
    }
  }
}
