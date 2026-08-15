import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MALAYSIAN_GOV_KNOWLEDGE_BASE } from '../services/govKnowledgeBase.js';

let cachedToken = null;
let tokenExpiryTime = 0;

/**
 * Load Google Service Account credentials from credentials/google.json
 */
function getGoogleCredentials() {
  const possiblePaths = [
    path.resolve(process.cwd(), 'credentials/google.json'),
    path.resolve(process.cwd(), '../credentials/google.json'),
    path.resolve('credentials/google.json'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        return JSON.parse(raw);
      } catch (e) {
        console.error(`[GeminiService] Error reading credentials at ${p}:`, e);
      }
    }
  }

  throw new Error('Google credentials file not found at credentials/google.json');
}

/**
 * Obtain a Google Cloud OAuth2 access token using the Service Account JWT
 */
export async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  
  // Return cached token if valid for at least 5 more minutes
  if (cachedToken && tokenExpiryTime > now + 300) {
    return cachedToken;
  }

  const creds = getGoogleCredentials();
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  
  const claim = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  
  const payload = Buffer.from(JSON.stringify(claim)).toString('base64url');
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  const signature = signer.sign(creds.private_key, 'base64url');
  const jwt = `${header}.${payload}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await tokenRes.json();
  if (!data.access_token) {
    throw new Error(`Failed to obtain Google access token: ${JSON.stringify(data)}`);
  }

  cachedToken = data.access_token;
  tokenExpiryTime = now + (data.expires_in || 3600);
  return cachedToken;
}

/**
 * System prompt combining Malaysian Government official context with strict instructions
 */
function buildSystemInstruction() {
  return `You are MyGateway AI, the official intelligent digital assistant for the Malaysian Government Public Services portal (MyGateway).
Your mission is to provide accurate, up-to-date, step-by-step guidance for Malaysian citizens, residents, and entrepreneurs on all government applications and public services.

CRITICAL INSTRUCTIONS:
1. ALWAYS identify the exact APPLICATIONS that need to be completed and the specific MALAYSIAN GOVERNMENT AGENCIES involved for each step.
2. For business inquiries (such as "I want to start a food business" or other enterprises):
   - Step 1: Business Registration with SSM (Suruhanjaya Syarikat Malaysia - EzBiz Form A/B or MyCoID for Sdn Bhd)
   - Step 2: Premise & Signboard Licensing with Local Council (PBT - DBKL, MBPJ, MBSA, MBJB, MPKJ, etc.)
   - Step 3: Food Handler Certification & Typhoid Vaccination with Ministry of Health (KKM - SLPM training + TY2 injection)
   - Step 4: Halal Certification with JAKIM / JAIN (MYeHALAL portal) - if applicable
   - Step 5: Tax Registration & e-Invoicing with LHDN (e-Daftar / MyTax)
   - Step 6: Employer Statutory Contributions (KWSP/EPF, PERKESO/SOCSO, EIS/SIP) - if hiring employees
3. For other inquiries (Licence renewal, STR cash assistance, PR1MA housing, Passport, MyKad, Tax reliefs, etc.):
   - Detail the primary agency, step-by-step procedure, required documents, official portal link, fees, and processing times.
4. Structure the content cleanly in Markdown with clear section headings (## and ###), numbered steps (1., 2., 3.), bold text for key terms and fees, and bullet points.
5. Provide official, verified Malaysian government portal URLs in the actionCards array.
6. Always return a valid JSON object matching this schema:

{
  "agency": "Exact agency name or comma-separated list of agencies involved (e.g. 'SSM, Local Council (PBT), KKM, JAKIM, LHDN, KWSP & PERKESO')",
  "content": "Comprehensive markdown formatted response with steps, agency breakdowns, fees, and requirements",
  "actionCards": [
    {
      "id": "act-1",
      "title": "Official Portal Name",
      "subtitle": "Short descriptive subtitle",
      "url": "https://official.gov.my.url",
      "btnText": "Open Portal",
      "icon": "external"
    }
  ],
  "suggestions": [
    "Contextual follow-up question 1",
    "Contextual follow-up question 2",
    "Contextual follow-up question 3"
  ],
  "checklist": [
    {
      "step": 1,
      "title": "Business Registration",
      "agency": "SSM",
      "status": "Required"
    }
  ]
}

OFFICIAL MALAYSIAN GOVERNMENT KNOWLEDGE BASE:
${MALAYSIAN_GOV_KNOWLEDGE_BASE}`;
}

/**
 * Robust JSON extraction helper for LLM responses
 */
function parseGeminiResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      agency: 'Malaysian Government Public Service',
      content: 'No response received.',
      actionCards: [],
      suggestions: [],
      checklist: [],
    };
  }

  let cleaned = rawText.trim();
  // Strip Markdown code fences if wrapped in ```json ... ```
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // 1. Try standard JSON.parse
  try {
    const parsed = JSON.parse(cleaned);
    return {
      agency: parsed.agency || 'Malaysian Government Public Service',
      content: parsed.content || cleaned,
      actionCards: Array.isArray(parsed.actionCards) ? parsed.actionCards : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
    };
  } catch (parseErr) {
    // 2. Fallback regex extraction if JSON was slightly truncated or had unescaped characters
    let agency = 'Malaysian Government Public Service';
    let content = '';
    const actionCards = [];
    const suggestions = [];

    // Extract agency
    const agencyMatch = cleaned.match(/"agency"\s*:\s*"([^"]+)"/);
    if (agencyMatch) {
      agency = agencyMatch[1];
    }

    // Extract content
    const contentMatch = cleaned.match(/"content"\s*:\s*"([\s\S]*?)(?="\s*,\s*"(?:actionCards|suggestions|checklist)|\s*"\}|$)/);
    if (contentMatch) {
      content = contentMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    } else {
      // If content key wasn't matched, check if rawText is straight markdown
      content = cleaned;
    }

    // Extract action cards if present
    const actionCardsMatch = cleaned.match(/"actionCards"\s*:\s*(\[[^\]]*\])/);
    if (actionCardsMatch) {
      try {
        const cards = JSON.parse(actionCardsMatch[1]);
        if (Array.isArray(cards)) actionCards.push(...cards);
      } catch (_) {}
    }

    // Extract suggestions if present
    const suggestionsMatch = cleaned.match(/"suggestions"\s*:\s*(\[[^\]]*\])/);
    if (suggestionsMatch) {
      try {
        const sugs = JSON.parse(suggestionsMatch[1]);
        if (Array.isArray(sugs)) suggestions.push(...sugs);
      } catch (_) {}
    }

    return {
      agency,
      content: content || cleaned,
      actionCards: actionCards.length > 0 ? actionCards : [
        {
          id: 'act-malaysia-gov',
          title: 'Malaysia.gov.my',
          subtitle: 'Official Public Services Directory',
          url: 'https://www.malaysia.gov.my',
          btnText: 'Open Portal',
        },
      ],
      suggestions: suggestions.length > 0 ? suggestions : [
        'How do I register a business with SSM?',
        'What licenses are needed from local council?',
        'How to apply for Halal certification?',
      ],
      checklist: [],
    };
  }
}

/**
 * Call Gemini 2.5 Flash on Google Vertex AI using the Service Account credentials
 */
export async function askGeminiGovernmentAi(query, history = []) {
  const creds = getGoogleCredentials();
  const accessToken = await getAccessToken();

  const project = creds.project_id;
  const location = 'us-central1';
  const model = 'gemini-2.5-flash';
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`;

  // Build conversational contents
  const contents = [];

  // Add conversation history if provided
  if (Array.isArray(history) && history.length > 0) {
    for (const msg of history.slice(-6)) { // keep last 6 messages for context
      if (msg.sender === 'user' && msg.text) {
        contents.push({
          role: 'user',
          parts: [{ text: msg.text }],
        });
      } else if (msg.sender === 'ai' && msg.content) {
        contents.push({
          role: 'model',
          parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }],
        });
      }
    }
  }

  // Append current user query
  contents.push({
    role: 'user',
    parts: [{ text: query }],
  });

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: buildSystemInstruction() }],
    },
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Gemini API Error (${data.error.code}): ${data.error.message}`);
  }

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Empty response received from Gemini API');
  }

  return parseGeminiResponse(rawText);
}
