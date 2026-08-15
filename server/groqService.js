import fs from 'fs';
import OpenAI from 'openai';
import { db } from './db.js';

export class GroqService {
  static getClient(customKey) {
    const key = customKey || process.env.GROQ_API_KEY || db.getSettings().groqApiKey;
    if (!key) return null;
    return new OpenAI({
      apiKey: key,
      baseURL: 'https://api.groq.com/openai/v1'
    });
  }

  // 1. Ultra-fast Audio Transcription via Groq Whisper-Large-v3
  static async transcribeAudio(filePath, customKey) {
    const client = GroqService.getClient(customKey);
    if (!client) {
      console.log('[GROQ] No Groq API Key found.');
      return null;
    }

    try {
      console.log(`[GROQ WHISPER] Transcribing audio with whisper-large-v3: ${filePath}`);
      const transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-large-v3',
        language: 'en'
      });

      console.log(`[GROQ WHISPER SUCCESS] Transcript: "${transcription.text}"`);
      return transcription.text;
    } catch (e) {
      console.warn('[GROQ WHISPER ERROR]', e.message);
      return null;
    }
  }

  // 2. High-speed Llama 3.3 70B NLP Intent Parsing & Decomposition
  static async parseIntent(prompt, customKey, model = 'llama-3.3-70b-versatile') {
    const client = GroqService.getClient(customKey);
    if (!client) return null;

    try {
      console.log(`[GROQ INTENT] Analyzing directive with Groq ${model}`);
      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are J.A.R.V.I.S., the AI executive orchestrator of Stark Command Center.
Analyze the user's voice directive and classify into structured JSON with schema:
{
  "actionType": "project_build" | "reminder" | "review" | "task",
  "projectName": string (if project_build, e.g. "Crypto Tracker"),
  "builderEngine": "antigravity" | "claude" | "openai" | "groq",
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
      console.log(`[GROQ INTENT SUCCESS] Action: ${parsed.actionType}`, parsed);
      return parsed;
    } catch (e) {
      console.warn('[GROQ INTENT ERROR]', e.message);
      return null;
    }
  }

  // 3. Ultra-fast Stage Code Generation via Groq Llama 3.3 70B
  static async generateStageCode({ stageKey, projectName, prompt, customKey, model = 'llama-3.3-70b-versatile' }) {
    const client = GroqService.getClient(customKey);
    if (!client) return null;

    try {
      console.log(`[GROQ CODE] Synthesizing ${stageKey} for "${projectName}" with ${model}`);
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

      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate the files for stage ${stageKey}. Output valid JSON only.` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      });

      const result = JSON.parse(response.choices[0].message.content);
      if (result && Array.isArray(result.files) && result.files.length > 0) {
        return result.files;
      }
      return null;
    } catch (e) {
      console.warn(`[GROQ CODE ERROR for ${stageKey}]`, e.message);
      return null;
    }
  }
}
