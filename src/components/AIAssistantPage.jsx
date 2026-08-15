import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowUp,
  Send,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Building,
  Car,
  Wallet,
  Briefcase,
  BadgeCheck,
  FileText,
  Home,
  ChevronRight,
  CheckCircle2,
  Layers,
  ShieldCheck,
  UserCheck,
  CheckSquare
} from 'lucide-react';
import { marked } from 'marked';
import Navbar from './Navbar';
import { STARTER_PROMPTS } from './govAiData';
import { askGovAi } from '../services/aiService';
import './AIAssistantPage.css';

// Configure marked with GitHub-flavored markdown and line breaks
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Custom renderer for opening links safely in a new tab
const renderer = new marked.Renderer();
const originalLinkRenderer = renderer.link.bind(renderer);
renderer.link = (href, title, text) => {
  let linkHref = typeof href === 'object' ? href.href : href;
  let linkTitle = typeof href === 'object' ? href.title : title;
  let linkText = typeof href === 'object' ? href.text : text;
  return `<a href="${linkHref}" target="_blank" rel="noopener noreferrer" ${linkTitle ? `title="${linkTitle}"` : ''}>${linkText}</a>`;
};
marked.use({ renderer });

const renderMarkdown = (content) => {
  if (!content) return '';
  try {
    return marked.parse(content);
  } catch (err) {
    console.error('Error rendering markdown:', err);
    return content;
  }
};

const AIAssistantPage = ({ username = 'Jason', onLogout, onNavigate, initialQuery = '' }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [checkedCriteria, setCheckedCriteria] = useState({});

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Toggle interactive criteria checkbox
  const handleToggleCriterion = (msgId, criterionId) => {
    const key = `${msgId}-${criterionId}`;
    setCheckedCriteria((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // If initialQuery is passed from HomePage search
  useEffect(() => {
    if (initialQuery && initialQuery.trim() !== '') {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Start new conversation
  const handleStartNewChat = () => {
    setMessages([]);
    setInputText('');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  };

  // Send Message Logic with Live Gemini API
  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend !== null ? textToSend : inputText).trim();
    if (!query || isTyping) return;

    const userMsgId = 'usr-' + Date.now();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: nowTime,
    };

    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);
    setInputText('');
    setIsTyping(true);

    try {
      // Call live Gemini service with Malaysian government knowledge base
      const responseData = await askGovAi(query, messages);
      const aiMsgId = 'ai-' + Date.now();
      const aiMessage = {
        id: aiMsgId,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agency: responseData.agency,
        content: responseData.content,
        eligibility: responseData.eligibility,
        actionCards: responseData.actionCards,
        suggestions: responseData.suggestions,
        checklist: responseData.checklist,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error handling AI response:', err);
      const errorMsgId = 'ai-err-' + Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: errorMsgId,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agency: 'MyGateway AI Helpdesk',
          content: `We encountered an issue processing your request. Please try again or rephrase your question.`,
          actionCards: [],
          suggestions: ['I want to start a food business', 'How to apply PTPTN loan?'],
          checklist: [],
          eligibility: null,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Keyboard Enter handler
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message to clipboard
  const handleCopyMessage = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Text to speech simulation
  const handleToggleSpeak = (msgId, text) => {
    if (speakingMessageId === msgId) {
      window.speechSynthesis?.cancel();
      setSpeakingMessageId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#>`|]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingMessageId(msgId);
    } else {
      alert('Speech synthesis is not supported on this browser.');
    }
  };

  // Thumbs up / down feedback
  const handleFeedback = (msgId, type) => {
    setFeedbackGiven((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type,
    }));
  };

  // Starter card icon mapper
  const renderStarterIcon = (icon) => {
    switch (icon) {
      case 'car': return <Car size={22} />;
      case 'wallet': return <Wallet size={22} />;
      case 'briefcase': return <Briefcase size={22} />;
      case 'badge-check': return <BadgeCheck size={22} />;
      case 'file-text': return <FileText size={22} />;
      case 'home': return <Home size={22} />;
      default: return <Sparkles size={22} />;
    }
  };

  return (
    <div className="gov-ai-root">
      {/* Universal Top Navigation Bar */}
      <Navbar
        username={username}
        onLogout={onLogout}
        activePage="ai"
        onNavigate={onNavigate}
      />

      {/* Main Full-Width AI Workspace */}
      <div className="gov-ai-workspace-simple">

        {/* Scrollable Conversation / Landing Container */}
        <div className="simple-chat-canvas">
          {messages.length === 0 ? (
            /* ── Landing View (Simple, Modern, Reference-Inspired) ── */
            <div className="simple-landing-view">

              {/* Personalized Greeting */}
              <div className="simple-greeting">
                <h1 className="greeting-main">
                  {greeting}, {username.charAt(0).toUpperCase() + username.slice(1)}
                </h1>
                <h2 className="greeting-sub">
                  How can <span className="highlight-brand-text">MyGateway</span> assist you?
                </h2>
                <p className="greeting-description">
                  Ask about starting a business, government applications, required agencies, license renewals, and public welfare.
                </p>
              </div>

              {/* Clean Floating Prompt Box */}
              <div className="simple-prompt-card">
                <div className="prompt-input-row">
                  <Sparkles size={20} className="prompt-sparkle-icon" />
                  <textarea
                    ref={textareaRef}
                    className="prompt-textarea"
                    placeholder="Ask AI a question (e.g. 'How to apply PTPTN')..."
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </div>

                <div className="prompt-controls-bottom-simple">
                  <span className="prompt-hint-text">Press Enter to ask</span>
                  <button
                    id="landing-submit-btn"
                    className={`prompt-send-btn ${inputText.trim() && !isTyping ? 'btn-active' : ''}`}
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isTyping}
                    title="Send Question"
                  >
                    <ArrowUp size={20} />
                  </button>
                </div>
              </div>

              {/* Section: GET STARTED WITH AN EXAMPLE BELOW */}
              <div className="simple-examples-section">
                <div className="examples-header-label">
                  <span>GET STARTED WITH AN EXAMPLE BELOW</span>
                </div>

                <div className="simple-starter-grid">
                  {STARTER_PROMPTS.map((starter) => (
                    <button
                      key={starter.id}
                      className="simple-starter-card"
                      onClick={() => handleSendMessage(starter.sampleQuery)}
                    >
                      <div className="starter-card-top">
                        <div className="starter-card-icon">
                          {renderStarterIcon(starter.icon)}
                        </div>
                        <span className="starter-card-category">{starter.category}</span>
                      </div>
                      <h4 className="starter-title">{starter.title}</h4>
                      <p className="starter-desc">{starter.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Common Topics Quick Chips */}
              <div className="simple-quick-topics">
                <span className="quick-topics-title">Popular:</span>
                {[
                  'I want to start a food business',
                  'Renew Driving Licence',
                  'STR Cash Aid Status',
                  'SSM Business Registration',
                  'Replace Broken MyKad',
                  'PR1MA Housing',
                ].map((topic) => (
                  <button
                    key={topic}
                    className="simple-topic-chip"
                    onClick={() => handleSendMessage(topic.startsWith('I want') ? topic : `How do I apply for ${topic}?`)}
                  >
                    {topic}
                  </button>
                ))}
              </div>

            </div>
          ) : (
            /* ── Active Conversation Thread ── */
            <div className="simple-conversation-thread">
              {messages.map((msg, index) => {
                if (msg.sender === 'user') {
                  return (
                    <div key={msg.id || index} className="message-row message-user">
                      <div className="user-message-container">
                        <div className="user-bubble">
                          <p>{msg.text}</p>
                        </div>
                        <span className="message-timestamp">{msg.timestamp}</span>
                      </div>
                      <div className="user-avatar-bubble">
                        {username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  );
                }

                // AI Assistant Message
                return (
                  <div key={msg.id || index} className="message-row message-ai">
                    <div className="ai-avatar-bubble">
                      <Sparkles size={18} />
                    </div>

                    <div className="ai-message-container">
                      {/* Clean Structured Message Content rendered via marked */}
                      <div 
                        className="ai-bubble-content markdown-body"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(msg.content)
                        }}
                      />

                      {/* Interactive Eligibility Check Card if present */}
                      {msg.eligibility && msg.eligibility.criteria && msg.eligibility.criteria.length > 0 && (
                        <div className="ai-eligibility-card">
                          <div className="eligibility-card-header">
                            <div className="eligibility-title-wrap">
                              <div className="eligibility-icon-badge">
                                <ShieldCheck size={18} />
                              </div>
                              <div>
                                <h4 className="eligibility-title">
                                  {msg.eligibility.title || 'Eligibility & Qualification Check'}
                                </h4>
                                {msg.eligibility.summary && (
                                  <p className="eligibility-summary">{msg.eligibility.summary}</p>
                                )}
                              </div>
                            </div>
                            <span className="eligibility-badge-pill">
                              <UserCheck size={13} />
                              <span>Pre-Check</span>
                            </span>
                          </div>

                          <div className="eligibility-criteria-list">
                            {msg.eligibility.criteria.map((c, cIdx) => {
                              const cId = c.id || `c-${cIdx}`;
                              const isChecked = !!checkedCriteria[`${msg.id}-${cId}`];
                              return (
                                <div
                                  key={cId}
                                  className={`eligibility-criterion-item ${isChecked ? 'item-checked' : ''}`}
                                  onClick={() => handleToggleCriterion(msg.id, cId)}
                                >
                                  <div className="criterion-checkbox">
                                    {isChecked ? (
                                      <CheckCircle2 size={18} className="check-icon-active" />
                                    ) : (
                                      <div className="check-box-empty" />
                                    )}
                                  </div>
                                  <div className="criterion-body">
                                    <span className="criterion-label">{c.label}:</span>{' '}
                                    <span className="criterion-req">{c.requirement}</span>
                                  </div>
                                  {c.isMandatory && (
                                    <span className="criterion-tag-mandatory">Required</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Live Status Calculation */}
                          {(() => {
                            const total = msg.eligibility.criteria.length;
                            const checkedCount = msg.eligibility.criteria.filter((c, i) => checkedCriteria[`${msg.id}-${c.id || `c-${i}`}`]).length;
                            const allDone = checkedCount === total && total > 0;
                            return (
                              <div className={`eligibility-status-footer ${allDone ? 'status-all-pass' : ''}`}>
                                <div className="status-progress-info">
                                  <span className="status-count-text">
                                    {allDone
                                      ? '🎉 Excellent! You meet all listed eligibility requirements for this application.'
                                      : `${checkedCount} of ${total} criteria confirmed. Click to check off items you meet.`}
                                  </span>
                                </div>
                                <div className="eligibility-progress-bar">
                                  <div
                                    className="eligibility-progress-fill"
                                    style={{ width: `${(checkedCount / total) * 100}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Checklist Box if available */}
                      {msg.checklist && msg.checklist.length > 0 && (
                        <div className="ai-checklist-box">
                          <div className="ai-checklist-header">
                            <CheckCircle2 size={16} className="checklist-icon" />
                            <span>Application Steps Overview</span>
                          </div>
                          <div className="ai-checklist-grid">
                            {msg.checklist.map((step, sIdx) => (
                              <div key={sIdx} className="checklist-step-item">
                                <span className="step-number">{step.step || sIdx + 1}</span>
                                <div className="step-details">
                                  <span className="step-title">{step.title}</span>
                                  {step.agency && <span className="step-agency">{step.agency}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Action Cards */}
                      {msg.actionCards && msg.actionCards.length > 0 && (
                        <div className="ai-action-cards-grid">
                          {msg.actionCards.map((act) => (
                            <a
                              key={act.id}
                              href={act.url || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="ai-action-card"
                            >
                              <div className="act-card-left">
                                <div className="act-icon-box">
                                  <ExternalLink size={18} />
                                </div>
                                <div className="act-card-texts">
                                  <h5 className="act-title">{act.title}</h5>
                                  <p className="act-sub">{act.subtitle}</p>
                                </div>
                              </div>
                              <span className="act-btn-pill">{act.btnText || 'Open Portal'}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Follow-up Suggestion Chips */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="ai-suggestions-row">
                          <span className="suggestions-label">Related questions:</span>
                          <div className="suggestions-chips-wrap">
                            {msg.suggestions.map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                className="suggestion-chip"
                                onClick={() => handleSendMessage(sug)}
                              >
                                <span>{sug}</span>
                                <ChevronRight size={13} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Response Action Controls */}
                      <div className="ai-response-toolbar">
                        <button
                          className="toolbar-btn"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          title="Copy text"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check size={14} className="text-green" />
                              <span className="text-green">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          className={`toolbar-btn ${speakingMessageId === msg.id ? 'toolbar-btn-active' : ''}`}
                          onClick={() => handleToggleSpeak(msg.id, msg.content)}
                          title={speakingMessageId === msg.id ? 'Stop audio' : 'Read aloud'}
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <VolumeX size={14} />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={14} />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        <div className="feedback-buttons">
                          <button
                            className={`toolbar-btn icon-only ${feedbackGiven[msg.id] === 'like' ? 'feedback-liked' : ''}`}
                            onClick={() => handleFeedback(msg.id, 'like')}
                            title="Helpful"
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            className={`toolbar-btn icon-only ${feedbackGiven[msg.id] === 'dislike' ? 'feedback-disliked' : ''}`}
                            onClick={() => handleFeedback(msg.id, 'dislike')}
                            title="Not helpful"
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </div>

                        <button
                          className="toolbar-btn"
                          onClick={() => handleSendMessage('Can you explain this with more details?')}
                          title="Ask for more details"
                        >
                          <RotateCcw size={14} />
                          <span>More details</span>
                        </button>

                        {msg.timestamp && (
                          <span className="ai-toolbar-timestamp">{msg.timestamp}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="message-row message-ai">
                  <div className="ai-avatar-bubble pulse-animation">
                    <Sparkles size={18} />
                  </div>
                  <div className="ai-message-container">
                    <div className="ai-typing-indicator">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-status-text">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Sticky Bottom Input Bar in Conversation Mode */}
        {messages.length > 0 && (
          <div className="simple-bottom-input-wrap">
            <div className="simple-bottom-input-container">
              <textarea
                className="simple-bottom-textarea"
                placeholder="Ask a follow-up question..."
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button
                className={`simple-bottom-send-btn ${inputText.trim() ? 'send-active' : ''}`}
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                title="Send"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AIAssistantPage;
