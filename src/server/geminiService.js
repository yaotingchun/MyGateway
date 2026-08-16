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
1. ALWAYS identify the exact FORMAL APPLICATIONS that need to be submitted to MALAYSIAN GOVERNMENT AGENCIES.
2. ORCHESTRATE DEPENDENCY-AWARE JOURNEY: When user asks to start a business (e.g. food business), apply for a loan (e.g. PTPTN), apply for housing (e.g. PR1MA), or any multi-step procedure:
   - Generate a "journey" DAG object.
   - CRITICAL REQUIREMENT FOR STEPS: Every item in "steps" MUST BE AN OFFICIAL GOVERNMENT APPLICATION / LICENSE SUBMITTED TO AN AGENCY (e.g., "SSM Business Registration", "Local Council Premise & Signboard License", "LHDN Tax File Registration", "JAKIM Halal Certification", "PTPTN Loan Application").
   - DO NOT create separate roadmap steps for preparation/preliminary tasks (such as opening a bank account, taking a typhoid shot, getting a photo, or attending a course). Instead, place those preparation requirements inside the application's "requires" array and "description" so citizens can see preparation details inside that specific application.
   - In "steps", explicitly define:
     * "id": Unique string identifier (e.g. "step-ssm", "step-pbt", "step-lhdn", "step-jakim", "step-ptptn")
     * "title": Clear application name (e.g. "Local Council (PBT) Premise License")
     * "agency": Government Agency in charge (e.g. "DBKL / Local Council", "SSM", "PTPTN", "LHDN")
     * "description": Brief instruction including preparation requirements
     * "dependencies": Array of prerequisite application step IDs that MUST be completed before this step can start (e.g. ["step-ssm"]).
     * "canRunParallelWith": Array of step IDs that can be done simultaneously.
     * "requires": Preparation items, documents, and output numbers needed from prior steps (e.g. ["SSM Registration Number", "Food Handler SLPM Certificate", "Typhoid TY2 Vaccination"]).
     * "produces": Specific certificates/licenses produced (e.g. ["PBT Premise License Number"]).
     * "isOnline": true if can be done online.
     * "submissionType": "online_form" | "external_portal" | "walk_in"
     * "estimatedDuration": e.g. "24 Hours" or "7 - 14 Days"
     * "fees": e.g. "RM30 - RM60/year"
     * "portalUrl": Official verified Malaysian government portal URL
3. ELIGIBILITY CHECK: Always evaluate and extract the official Malaysian government eligibility requirements for the application into an "eligibility" object so the citizen can check if they qualify.
4. Structure the content cleanly in Markdown with clear section headings (## and ###), numbered steps (1., 2., 3.), bold text for key terms and fees, and bullet points.
5. Provide official, verified Malaysian government portal URLs in the actionCards array.
6. Always return a valid JSON object matching this schema:

{
  "agency": "Exact agency name or comma-separated list of agencies involved (e.g. 'SSM, Local Council (PBT), KKM, JAKIM, LHDN, KWSP & PERKESO')",
  "content": "Comprehensive markdown formatted response with steps, agency breakdowns, fees, and requirements",
  "eligibility": {
    "title": "Eligibility Criteria for [Application Name]",
    "summary": "Quick summary of who is eligible",
    "criteria": [
      {
        "id": "c1",
        "label": "Citizenship",
        "requirement": "Malaysian Citizen with valid MyKad",
        "isMandatory": true
      },
      {
        "id": "c2",
        "label": "Age Requirement",
        "requirement": "Aged 18 years and above (or specified age limit)",
        "isMandatory": true
      },
      {
        "id": "c3",
        "label": "Document / Qualification",
        "requirement": "Specific prerequisite document, income tier, or accreditation",
        "isMandatory": true
      }
    ]
  },
  "journey": {
    "id": "journey-unique-id",
    "title": "Application Journey Title",
    "summary": "High level roadmap summary",
    "phases": [
      { "id": 1, "name": "Phase 1: Foundation & Prerequisites (Parallel)" },
      { "id": 2, "name": "Phase 2: Premise & Compliance" }
    ],
    "steps": [
      {
        "id": "step-1",
        "title": "Step Name",
        "agency": "Agency Name",
        "phase": 1,
        "description": "Brief description",
        "dependencies": [],
        "canRunParallelWith": ["step-2"],
        "requires": ["MyKad"],
        "produces": ["Certificate or Reference Number"],
        "isOnline": true,
        "submissionType": "online_form",
        "estimatedDuration": "24 Hours",
        "fees": "RM30",
        "portalUrl": "https://official.gov.my"
      }
    ]
  },
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
      eligibility: null,
      journey: null,
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
    let finalJourney = parsed.journey && typeof parsed.journey === 'object' ? parsed.journey : null;
    let finalEligibility = parsed.eligibility && typeof parsed.eligibility === 'object' ? parsed.eligibility : null;

    return {
      agency: parsed.agency || 'Malaysian Government Public Service',
      content: parsed.content || cleaned,
      eligibility: finalEligibility,
      journey: finalJourney,
      actionCards: Array.isArray(parsed.actionCards) ? parsed.actionCards : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
    };
  } catch (parseErr) {
    // 2. Fallback regex extraction if JSON was slightly truncated or had unescaped characters
    let agency = 'Malaysian Government Public Service';
    let content = '';
    let eligibility = null;
    let journey = null;
    const actionCards = [];
    const suggestions = [];

    // Extract agency
    const agencyMatch = cleaned.match(/"agency"\s*:\s*"([^"]+)"/);
    if (agencyMatch) {
      agency = agencyMatch[1];
    }

    // Extract eligibility if present
    const eligibilityMatch = cleaned.match(/"eligibility"\s*:\s*(\{[\s\S]*?\})(?=\s*,\s*"(?:journey|actionCards|suggestions|checklist|content|agency)"|\s*\}|\s*$)/);
    if (eligibilityMatch) {
      try {
        eligibility = JSON.parse(eligibilityMatch[1]);
      } catch (_) {
        // Try fixing trailing commas or missing closing brace
        try {
          eligibility = JSON.parse(eligibilityMatch[1] + '}');
        } catch (_) {}
      }
    }

    // Extract journey if present
    const journeyMatch = cleaned.match(/"journey"\s*:\s*(\{[\s\S]*?\})(?=\s*,\s*"(?:eligibility|actionCards|suggestions|checklist|content|agency)"|\s*\}|\s*$)/);
    if (journeyMatch) {
      try {
        journey = JSON.parse(journeyMatch[1]);
      } catch (_) {}
    }

    // Extract content with all keys in lookahead
    const contentMatch = cleaned.match(/"content"\s*:\s*"([\s\S]*?)(?="\s*,\s*"(?:eligibility|journey|actionCards|suggestions|checklist|agency)"|\s*"\}|\s*$)/);
    if (contentMatch) {
      content = contentMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    } else {
      // If content key wasn't matched directly, strip any outer JSON wrappers
      content = cleaned
        .replace(/^\s*\{\s*"agency"[^}]*?"content"\s*:\s*"/i, '')
        .replace(/"\s*,\s*"(?:eligibility|journey|actionCards|suggestions|checklist)"[\s\S]*$/i, '')
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"');
    }

    // Clean any remaining raw JSON leak in content
    if (content) {
      content = content
        .replace(/",\s*"(?:eligibility|journey|actionCards|suggestions|checklist)":\s*[\s\S]*$/i, '')
        .replace(/\s*"(?:eligibility|journey|actionCards|suggestions|checklist)":\s*\{[\s\S]*$/i, '')
        .replace(/\s*"(?:eligibility|journey|actionCards|suggestions|checklist)":\s*\[[\s\S]*$/i, '')
        .trim();
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
      content: content || 'Here is the requested information on Malaysian public services.',
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
        'How to apply for PTPTN loan?',
      ],
      checklist: [],
      eligibility,
      journey,
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

  const parsedResult = parseGeminiResponse(rawText);
  return enrichWithCanonicalJourney(parsedResult, query);
}

/**
 * Ensures a rich dependency-aware journey is always attached for multi-step applications
 */
function enrichWithCanonicalJourney(result, query) {
  if (result.journey && Array.isArray(result.journey.steps) && result.journey.steps.length > 0) {
    return result;
  }

  const q = (query || '').toLowerCase();
  const c = (result.content || '').toLowerCase();

  if (q.includes('food') || q.includes('makan') || q.includes('restaurant') || q.includes('cafe') || c.includes('ssm') && c.includes('fosim') || c.includes('typhoid')) {
    result.journey = {
      id: 'journey-food-biz',
      title: 'Food & Beverage Business Setup Applications',
      summary: 'Official agency applications required to legally operate an F&B business in Malaysia.',
      steps: [
        {
          id: 'step-ssm',
          title: 'SSM Business Registration (EzBiz)',
          agency: 'Suruhanjaya Syarikat Malaysia (SSM)',
          description: 'Register trade name and legal business entity to obtain official SSM Registration No. & Borang D/E.',
          dependencies: [],
          requires: ['MyKad', 'Proposed Business Name'],
          produces: ['SSM Registration Number', 'Borang D/E Certificate'],
          isOnline: true,
          submissionType: 'online_form',
          estimatedDuration: '24 Hours',
          fees: 'RM30 - RM60/year',
          portalUrl: 'https://ezbiz.ssm.com.my',
          status: 'ready',
        },
        {
          id: 'step-pbt',
          title: 'Local Council (PBT) Premise & Signboard License',
          agency: 'Local Council (DBKL / MBPJ / MBSA / MPKJ)',
          description: 'Apply for business operating premise license and Malay billboard signboard permit. (Preparation: Food Handler Training SLPM, Typhoid TY2 Injection, and Tenancy Agreement).',
          dependencies: ['step-ssm'],
          requires: ['SSM Registration Number', 'Food Handler SLPM Training', 'Typhoid TY2 Vaccine Card', 'Tenancy Agreement'],
          produces: ['PBT Premise License Number'],
          isOnline: true,
          submissionType: 'online_form',
          estimatedDuration: '7 - 14 Days',
          fees: 'RM100 - RM500',
          portalUrl: 'https://dbkl.gov.my',
          status: 'locked',
        },
        {
          id: 'step-lhdn',
          title: 'LHDN Tax File & e-Invoicing Registration',
          agency: 'Lembaga Hasil Dalam Negeri (LHDN)',
          description: 'Register business income tax file (Form B) and activate MyInvois e-Invoicing compliance.',
          dependencies: ['step-ssm'],
          requires: ['SSM Registration Number'],
          produces: ['Tax Identification Number (TIN)'],
          isOnline: true,
          submissionType: 'online_form',
          estimatedDuration: '1 - 3 Days',
          fees: 'Free',
          portalUrl: 'https://mytax.hasil.gov.my',
          status: 'locked',
        },
        {
          id: 'step-jakim',
          title: 'JAKIM Halal Certification (MYeHALAL)',
          agency: 'Department of Islamic Development Malaysia (JAKIM)',
          description: 'Apply for official Malaysian Halal Certification via MYeHALAL portal.',
          dependencies: ['step-ssm', 'step-pbt'],
          requires: ['SSM Registration Number', 'PBT Premise License Number', 'Halal Assurance System & Ingredient Lists'],
          produces: ['JAKIM Halal Certificate'],
          isOnline: true,
          submissionType: 'online_form',
          estimatedDuration: '30 - 60 Days',
          fees: 'RM100 - RM400',
          portalUrl: 'https://myehalal.halal.gov.my',
          status: 'locked',
        },
      ],
    };
  } else if (q.includes('ptptn') || q.includes('student loan') || q.includes('study loan')) {
    result.journey = {
      id: 'journey-ptptn',
      title: 'PTPTN Higher Education Financing Applications',
      summary: 'Official agency applications for higher education financing and graduation benefits.',
      steps: [
        {
          id: 'step-ptptn-app',
          title: 'PTPTN Higher Education Loan Application',
          agency: 'Perbadanan Tabung Pendidikan Tinggi Nasional (PTPTN)',
          description: 'Formal online application for tertiary education financing via MyPTPTN portal. (Preparation: Active Simpan SSPN Account, Panel Bank Account, and IPT Offer Letter).',
          dependencies: [],
          requires: ['Simpan SSPN Account', 'Panel Bank Account (Bank Islam / Maybank)', 'IPT Offer Letter', 'Academic Results'],
          produces: ['PTPTN Loan Reference Number', 'PTPTN Loan Agreement'],
          isOnline: true,
          submissionType: 'online_form',
          estimatedDuration: '7 - 14 Days',
          fees: 'RM10 Pin Purchase',
          portalUrl: 'https://myp.ptptn.gov.my',
          status: 'ready',
        },
        {
          id: 'step-ptptn-exemption',
          title: 'PTPTN Loan Repayment Exemption (First Class Degree)',
          agency: 'Perbadanan Tabung Pendidikan Tinggi Nasional (PTPTN)',
          description: 'Apply for 100% full loan repayment exemption upon graduating with First Class Honours Bachelor Degree.',
          dependencies: ['step-ptptn-app'],
          requires: ['PTPTN Loan Reference Number', 'First Class Degree Certificate', 'Official Academic Transcript'],
          produces: ['Repayment Exemption Approval Letter'],
          isOnline: true,
          submissionType: 'online_form',
          estimatedDuration: '14 - 30 Days',
          fees: 'Free',
          portalUrl: 'https://myp.ptptn.gov.my',
          status: 'locked',
        },
      ],
    };
  }

  return result;
}
