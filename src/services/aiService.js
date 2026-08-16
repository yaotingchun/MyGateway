/**
 * AI Service for MyGateway
 * Connects frontend to the Gemini-powered Malaysian Government Assistant
 */

import { generateGovAiResponse } from '../components/govAiData';

export async function askGovAi(query, history = []) {
  try {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query.trim(),
        history: history.map((msg) => ({
          sender: msg.sender,
          text: msg.text || '',
          content: typeof msg.content === 'string' ? msg.content : '',
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      agency: data.agency || 'Malaysian Government Public Service',
      content: data.content,
      eligibility: data.eligibility || null,
      journey: data.journey || null,
      actionCards: Array.isArray(data.actionCards) ? data.actionCards : [],
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      checklist: Array.isArray(data.checklist) ? data.checklist : [],
    };
  } catch (err) {
    console.warn('[GovAI Service] Live Gemini API error, using knowledge base fallback:', err);
    
    // Use local comprehensive knowledge fallback if live network is unreachable
    const fallback = generateGovAiResponse(query);
    return {
      success: true,
      isFallback: true,
      agency: fallback.agency || 'MyGateway Public Service AI',
      content: fallback.content,
      eligibility: fallback.eligibility || null,
      journey: fallback.journey || null,
      actionCards: fallback.actionCards || [],
      suggestions: fallback.suggestions || [],
      checklist: fallback.checklist || [],
    };
  }
}

export async function checkAiHealth() {
  try {
    const res = await fetch('/api/gemini/health');
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}
