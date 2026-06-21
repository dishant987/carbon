import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Square,
  Copy,
  Check,
  Car,
  Utensils,
  Zap,
  ShoppingBag,
  Activity,
  Sparkles,
  Bot,
  Trash2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useChatStore } from '../hooks/useChatStore';
import * as api from '../lib/api';
import { Message } from '../types';
import { Badge } from '../components/ui/badge';
import { formatChatError } from '../lib/chatErrors';

interface ParsedActivity {
  type: string;
  desc: string;
  co2_kg: number;
}

const getActivityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'transport':
      return <Car className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case 'food':
      return <Utensils className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case 'energy':
      return <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case 'shopping':
      return <ShoppingBag className="h-4 w-4 text-green-600 dark:text-green-400" />;
    default:
      return <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />;
  }
};

const parseActivities = (content: string): ParsedActivity[] => {
  const match = content.match(/<activities>([\s\S]*?)<\/activities>/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[1].trim());
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

interface ActivityCardProps {
  activity: ParsedActivity;
}

function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="border border-green-500/25 bg-green-500/5 dark:bg-green-500/10 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-green-500/40 transition-all shadow-xs w-full">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 bg-green-500/10 dark:bg-green-500/20 rounded-lg shrink-0">
          {getActivityIcon(activity.type)}
        </div>
        <span className="text-xs text-foreground font-semibold truncate leading-tight">{activity.desc}</span>
      </div>
      <Badge
        variant="outline"
        className="border-green-600/30 text-green-600 dark:text-green-400 bg-green-500/10 font-bold text-[11px] shrink-0 py-1"
      >
        {activity.co2_kg.toFixed(1)} kg CO2
      </Badge>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isStreamingLast: boolean;
}

function MessageBubble({ message, isStreamingLast }: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const cleanText = message.content.replace(/<activities>[\s\S]*?<\/activities>/, '').trim();
      await navigator.clipboard.writeText(cleanText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Silent catch for clipboard access failure
    }
  };

  const isUser = message.role === 'user';
  const displayContent = message.content.replace(/<activities>[\s\S]*?<\/activities>/, '').trim();
  const activities = parseActivities(message.content);

  if (isUser) {
    return (
      <div className="w-full py-3 flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-4xl mx-auto px-4 w-full flex justify-end">
          <div className="bg-[#f4f4f4] dark:bg-[#2f2f2f] text-foreground px-5 py-3 rounded-[24px] max-w-[70%] text-[14.5px] leading-relaxed shadow-xs break-words border border-border/10 dark:border-0">
            {displayContent}
          </div>
        </div>
      </div>
    );
  }

  // LLM Response (Left aligned, no background bubble, with Bot avatar)
  return (
    <div className="w-full py-6 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto px-4 flex items-start gap-4 md:gap-5">
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-xs">
          <Bot className="h-4.5 w-4.5" />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-3 relative group/bubble">
          <div className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap select-text">
            {displayContent}
            {isStreamingLast && <span className="chat-cursor animate-pulse" />}
          </div>

          {activities.length > 0 && (
            <div className="mt-4 flex flex-col gap-2.5 max-w-md w-full">
              {activities.map((act: ParsedActivity, idx: number) => (
                <ActivityCard key={idx} activity={act} />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Copy response"
            >
              {isCopied ? (
                <Check className="h-3.5 w-3.5 text-green-500 animate-scale-up" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="w-full py-6 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto px-4 flex items-start gap-4 md:gap-5">
        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-xs">
          <Bot className="h-4.5 w-4.5" />
        </div>
        <div className="flex items-center gap-1.5 py-3">
          <span className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

interface StreamData {
  chunk?: string;
  error?: string;
  cancelled?: boolean;
}

const SUGGESTIONS = [
  {
    icon: Car,
    title: 'Log Transit Commute',
    desc: 'I commuted 20km by train instead of a diesel car.',
    prompt: 'I commuted 20km by train instead of driving a diesel car',
  },
  {
    icon: Utensils,
    title: 'Plant-Based Choice',
    desc: 'I ate a plant-based vegetarian lunch today.',
    prompt: 'I ate a plant-based vegetarian lunch today',
  },
  {
    icon: Zap,
    title: 'Analyze Flight Carbon',
    desc: 'Estimate the CO2 of a flight from Mumbai to Delhi.',
    prompt: 'Estimate the CO2 footprint of a direct flight from Mumbai to Delhi',
  },
  {
    icon: ShoppingBag,
    title: 'Reduce Utility Emissions',
    desc: 'How can I reduce my home electricity usage?',
    prompt: 'What are the best ways to reduce my home electricity usage and save on carbon?',
  },
];

export function Chat() {
  const { messages, isStreaming, addMessage, appendChunk, setStreaming, setMessages } = useChatStore();

  const [input, setInput] = useState('');
  const [isWaitingForFirstChunk, setIsWaitingForFirstChunk] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await api.fetchChatHistory();
        setMessages(history);
      } catch {
        // Silent catch for history fetch failure
      }
    };
    loadHistory();
  }, [setMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isWaitingForFirstChunk]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsgText = input.trim();
    setInput('');

    const userMsg: Message = { role: 'user', content: userMsgText };
    addMessage(userMsg);

    setIsWaitingForFirstChunk(true);
    setStreaming(true);

    const currentHistory = [...messages, userMsg];

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const token = api.getAccessToken();
      const response = await fetch(`${api.BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMsgText, history: currentHistory }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMsg = 'Failed to connect to server';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errorMsg = errData.error;
          }
        } catch {
          errorMsg = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream reader available');

      const decoder = new TextDecoder();
      let hasAddedBotMessage = false;
      let botResponseText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const textChunk = decoder.decode(value);
        const lines = textChunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            let parsed: StreamData | null = null;
            try {
              parsed = JSON.parse(line.slice(6)) as StreamData;
            } catch {
              continue;
            }

            if (parsed) {
              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.cancelled) {
                return;
              }

              const chunk = parsed.chunk;
              if (chunk) {
                if (!hasAddedBotMessage) {
                  addMessage({ role: 'bot', content: '' });
                  hasAddedBotMessage = true;
                  setIsWaitingForFirstChunk(false);
                }

                botResponseText += chunk;
                appendChunk(chunk);
              }
            }
          }
        }
      }

      const parsedActs = parseActivities(botResponseText);
      if (parsedActs.length > 0) {
        showToast('Activities detected! Check your dashboard.');
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      // Silent catch for streaming connection failure
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addMessage({
        role: 'bot',
        content: formatChatError(errorMessage),
      });
    } finally {
      setIsWaitingForFirstChunk(false);
      setStreaming(false);
      abortControllerRef.current = null;
      textareaRef.current?.focus();
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsWaitingForFirstChunk(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your chat history?')) return;
    try {
      await api.clearChatHistory();
      setMessages([]);
      showToast('Chat history cleared!');
    } catch {
      // Silent catch for history clearing failure
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-96px)] md:h-[calc(100vh-64px)] -mt-4 sm:-mt-6 md:-mt-8 -mb-4 sm:-mb-6 md:-mb-8 -mx-4 sm:-mx-6 md:-mx-8 bg-background relative overflow-hidden animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-20 right-6 z-50 bg-green-600 dark:bg-green-500 text-white text-xs font-semibold px-4.5 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Check className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Top Header Banner */}
      <div className="sticky top-0 z-10 w-full flex items-center justify-between px-6 py-4.5 border-b border-border/50 bg-card/90 dark:bg-background/80 backdrop-blur-md shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              EcoBot Chat
            </h1>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Your AI Carbon Guide</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all"
            aria-label="Clear chat history"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Chat
          </button>
        )}
      </div>

      {/* Message & Suggestions Scrolling Container */}
      <div className="flex-1 overflow-y-auto bg-secondary/15 dark:bg-background/5" aria-live="polite">
        {messages.length === 0 ? (
          <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="inline-flex rounded-3xl bg-primary/10 p-5 text-primary mb-6 shadow-sm border border-primary/5 animate-pulse">
              <Bot className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              How can I help you today?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mt-2 mb-10 leading-relaxed font-semibold">
              Ask me to calculate CO₂ for your commute, food choices, or utilities. You can also get tailored tips to live more sustainably!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => {
                    setInput(s.prompt);
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="flex items-start gap-4.5 p-5 rounded-2xl border border-border bg-card hover:bg-secondary/40 text-left transition-all duration-300 hover:shadow-md hover:border-primary/20 group cursor-pointer"
                >
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-all shrink-0">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-black text-foreground truncate">{s.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full">
            {messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              return (
                <MessageBubble
                  key={index}
                  message={msg}
                  isStreamingLast={isLast && isStreaming && msg.role === 'bot'}
                />
              );
            })}
            {isWaitingForFirstChunk && <TypingIndicator />}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Glassmorphic Input Panel */}
      <div className="sticky bottom-0 z-10 w-full py-6 px-4 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-xs shrink-0">
        <div className="max-w-4xl mx-auto w-full">
          <div className="relative flex items-center bg-card dark:bg-card/70 border border-border/80 rounded-[28px] pl-5 pr-2.5 py-2.5 shadow-xl backdrop-blur-md focus-within:ring-1 focus-within:ring-border/40 focus-within:border-transparent transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-0 focus:outline-none resize-none max-h-24 text-[14.5px] text-foreground placeholder-muted-foreground/50 py-1 w-full"
              rows={1}
              disabled={isStreaming}
              aria-label="Chat input message"
            />
            <div className="flex items-center gap-2 pl-2 shrink-0">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="p-2.5 rounded-full transition-all bg-rose-600 text-white hover:bg-rose-500 shadow-sm hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
                  aria-label="Stop streaming"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className={cn(
                    'p-2.5 rounded-full transition-all flex items-center justify-center shrink-0',
                    input.trim() && !isStreaming
                      ? 'bg-foreground text-background shadow-sm hover:scale-105 active:scale-95'
                      : 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed'
                  )}
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2.5 px-2 text-[10px] font-bold text-muted-foreground/80">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="flex items-center gap-1">
              Powered by Gemini <Sparkles className="h-3.5 w-3.5 text-yellow-500 animate-pulse" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
