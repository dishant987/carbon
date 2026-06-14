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
  CornerDownLeft,
  Sparkles,
  Bot,
  User,
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
      return <Car className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
    case 'food':
      return <Utensils className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
    case 'energy':
      return <Zap className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
    case 'shopping':
      return <ShoppingBag className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
    default:
      return <Activity className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
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
    <div className="border border-green-500/35 bg-green-500/5 dark:bg-green-500/10 rounded-lg p-2.5 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-1.5 bg-green-500/10 dark:bg-green-500/20 rounded-md shrink-0">
          {getActivityIcon(activity.type)}
        </div>
        <span className="text-xs text-foreground font-semibold truncate">{activity.desc}</span>
      </div>
      <Badge
        variant="outline"
        className="border-green-600/30 text-green-600 dark:text-green-400 bg-green-500/10 font-bold text-[10px] shrink-0"
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
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const isUser = message.role === 'user';
  const displayContent = message.content.replace(/<activities>[\s\S]*?<\/activities>/, '').trim();
  const activities = parseActivities(message.content);

  return (
    <div
      className={cn(
        'flex items-start gap-3 mb-6 group w-full',
        isUser
          ? 'flex-row-reverse animate-in slide-in-from-right-4 duration-300'
          : 'flex-row animate-in slide-in-from-left-4 duration-300'
      )}
    >
      <div
        className={cn(
          'h-9 w-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm transition-transform duration-200 hover:scale-105',
          isUser ? 'bg-blue-600 dark:bg-blue-500' : 'bg-green-600 dark:bg-green-500'
        )}
      >
        {isUser ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
      </div>

      <div className={cn('flex flex-col max-w-[75%] relative', isUser ? 'items-end' : 'items-start')}>
        <div className="relative group/bubble w-fit">
          <div
            className={cn(
              'p-3.5 rounded-xl border-[0.5px] border-border text-[14px] leading-relaxed shadow-xs relative whitespace-pre-wrap transition-colors duration-200 w-fit',
              isUser
                ? 'bg-primary text-primary-foreground border-transparent rounded-tr-none'
                : 'bg-card text-card-foreground rounded-tl-none'
            )}
          >
            {displayContent}
            {isStreamingLast && <span className="chat-cursor" />}
          </div>

          <button
            onClick={handleCopy}
            className={cn(
              'absolute -top-3 right-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200 bg-card border border-border shadow-md rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 z-10 hover:bg-accent',
              isUser && 'right-auto -left-3'
            )}
            aria-label="Copy message"
          >
            {isCopied ? (
              <>
                <Check className="h-3 w-3 text-green-500 animate-scale-up" />
                <span className="text-[10px] font-medium">Copied</span>
              </>
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>

        {activities.length > 0 && (
          <div className="mt-2.5 flex flex-col gap-2 w-full max-w-sm">
            {activities.map((act: ParsedActivity, idx: number) => (
              <ActivityCard key={idx} activity={act} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-6 animate-in fade-in duration-200">
      <div className="h-9 w-9 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center text-white shrink-0 shadow-sm">
        <Bot className="h-4.5 w-4.5" />
      </div>
      <div className="bg-card border-[0.5px] border-border rounded-xl rounded-tl-none p-3.5 max-w-[75%] flex items-center justify-center shadow-xs">
        <div className="flex items-center gap-1.5 py-1 px-0.5">
          <div
            className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce motion-reduce:animate-none"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce motion-reduce:animate-none"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-bounce motion-reduce:animate-none"
            style={{ animationDelay: '300ms' }}
          ></div>
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
      } catch (err) {
        console.error('Failed to load chat history:', err);
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
          setStreaming(false);
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
                setStreaming(false);
                setIsWaitingForFirstChunk(false);
                return;
              }

              const chunk = parsed.chunk;
              if (chunk) {
                if (isWaitingForFirstChunk) {
                  setIsWaitingForFirstChunk(false);
                }

                if (!hasAddedBotMessage) {
                  addMessage({ role: 'bot', content: '' });
                  hasAddedBotMessage = true;
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
        setIsWaitingForFirstChunk(false);
        setStreaming(false);
        return;
      }
      console.error('Streaming error:', err);
      setIsWaitingForFirstChunk(false);
      setStreaming(false);

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addMessage({
        role: 'bot',
        content: formatChatError(errorMessage),
      });
    } finally {
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

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-140px)] min-h-[480px]">
      <div className="flex items-start gap-4 shrink-0">
        <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-sm border border-primary/10 shrink-0">
          <MessageSquare className="h-8 w-8" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            EcoBot Chat
          </h1>
          <p className="text-muted-foreground text-sm">
            Discuss your daily habits with our AI assistant to calculate and log carbon footprints instantly.
          </p>
        </div>
      </div>

      <div className="flex-1 border border-border bg-card rounded-2xl shadow-md flex flex-col overflow-hidden relative min-h-0 w-full">
        {toastMessage && (
          <div className="absolute top-4 right-4 z-50 bg-green-600 dark:bg-green-500 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 bg-background/25" aria-live="polite">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground max-w-md mx-auto my-auto min-h-[280px]">
              <div className="rounded-full bg-primary/10 p-4 mb-4 text-primary shadow-xs">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h2 className="text-base font-bold text-foreground">Welcome to CarbonTracker Chat!</h2>
              <p className="text-xs mt-2 leading-relaxed">
                Describe your activities (e.g. <span className="font-semibold">"I flew 500km"</span> or{' '}
                <span className="font-semibold">"I drove a diesel car 30km"</span>) to estimate CO2 emissions
                and log them instantly.
              </p>
              <div className="grid grid-cols-1 gap-2 mt-6 w-full text-[11px] text-left">
                <button
                  onClick={() => {
                    setInput('I ate a beef burger today');
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="p-2.5 rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-all flex items-center gap-2 cursor-pointer text-left w-full"
                >
                  <Sparkles className="h-3 w-3 text-yellow-500 shrink-0 animate-pulse motion-reduce:animate-none" />
                  <span>"I ate a beef burger today"</span>
                </button>
                <button
                  onClick={() => {
                    setInput('I took a train for 120km instead of driving');
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="p-2.5 rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-all flex items-center gap-2 cursor-pointer text-left w-full"
                >
                  <Sparkles className="h-3 w-3 text-yellow-500 shrink-0 animate-pulse motion-reduce:animate-none" />
                  <span>"I took a train for 120km instead of driving"</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full">
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

        <div className="p-4 border-t bg-card shrink-0">
          <div className="max-w-4xl mx-auto w-full">
            <div className="relative flex items-center bg-secondary/35 border border-border rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask EcoBot or describe an activity..."
                className="flex-1 bg-transparent border-0 focus:outline-none resize-none max-h-24 text-[13px] text-foreground placeholder-muted-foreground/75 py-1 leading-snug w-full"
                rows={1}
                disabled={isStreaming}
                aria-label="Chat input message"
              />
              {isStreaming ? (
                <button
                  onClick={handleStop}
                  className="p-2 rounded-lg transition-all shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:scale-105 active:scale-95"
                  aria-label="Stop streaming"
                >
                  <Square className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className={cn(
                    'p-2 rounded-lg transition-all shrink-0 hover:scale-105 active:scale-95',
                    input.trim() && !isStreaming
                      ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/95'
                      : 'text-muted-foreground/60 cursor-not-allowed'
                  )}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-muted-foreground">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span className="flex items-center gap-1 font-medium">
                Powered by Gemini <CornerDownLeft className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
