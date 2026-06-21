import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Square,
  X,
  Copy,
  Check,
  Car,
  Utensils,
  Zap,
  ShoppingBag,
  Activity,
  CornerDownLeft,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useChatStore } from '../hooks/useChatStore';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { Message } from '../types';
import { Badge } from './ui/badge';
import { formatChatError } from '../lib/chatErrors';

interface ParsedActivity {
  type: string;
  desc: string;
  co2_kg: number;
}

interface StreamData {
  chunk?: string;
  error?: string;
  cancelled?: boolean;
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
    <div className="border border-green-500/35 bg-green-500/5 dark:bg-green-500/10 rounded-lg p-2.5 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
  const { user } = useAuth();

  const handleCopy = async () => {
    try {
      const cleanText = message.content.replace(/<activities>[\s\S]*?<\/activities>/, '').trim();
      await navigator.clipboard.writeText(cleanText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Silent catch for clipboard copy failure
    }
  };

  const isUser = message.role === 'user';
  const displayContent = message.content.replace(/<activities>[\s\S]*?<\/activities>/, '').trim();
  const activities = parseActivities(message.content);

  const getInitials = () => {
    if (isUser) {
      if (user?.name) {
        const parts = user.name.trim().split(/\s+/);
        if (parts.length > 1) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return user.name.slice(0, 2).toUpperCase();
      }
      return user?.email ? user.email.slice(0, 2).toUpperCase() : 'U';
    }
    return 'E';
  };

  return (
    <div
      className={cn(
        'flex gap-3 mb-4 group',
        isUser
          ? 'flex-row-reverse animate-in slide-in-from-right-4 duration-300'
          : 'flex-row animate-in slide-in-from-left-4 duration-300'
      )}
    >
      <div
        className={cn(
          'h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm transition-transform duration-200 hover:scale-105',
          isUser ? 'bg-blue-600 dark:bg-blue-500' : 'bg-green-600 dark:bg-green-500'
        )}
      >
        {getInitials()}
      </div>

      <div className="flex flex-col max-w-[75%] relative">
        <div className="relative group/bubble">
          <div
            className={cn(
              'p-3 rounded-lg border-[0.5px] border-border text-[14px] leading-relaxed shadow-xs relative whitespace-pre-wrap transition-colors duration-200',
              isUser
                ? 'bg-primary text-primary-foreground border-transparent rounded-tr-none'
                : 'bg-secondary text-secondary-foreground rounded-tl-none'
            )}
          >
            {displayContent}
            {isStreamingLast && <span className="chat-cursor" />}
          </div>

          <button
            type="button"
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
          <div className="mt-2 flex flex-col gap-2">
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
    <div className="flex gap-3 mb-4 animate-in fade-in duration-200">
      <div className="h-8 w-8 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
        E
      </div>
      <div className="bg-secondary border-[0.5px] border-border rounded-lg rounded-tl-none p-3 max-w-[75%] flex items-center justify-center">
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

export function ChatWidget() {
  const { isOpen, messages, isStreaming, toggleChat, addMessage, appendChunk, setStreaming, setMessages } =
    useChatStore();

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
        // Silent catch for chat history load failure
      }
    };
    loadHistory();
  }, [setMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isWaitingForFirstChunk, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

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
      // Silent catch for streaming error
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

  return (
    <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end">
      {toastMessage && (
        <div className="absolute -top-2 right-0 z-50 bg-green-600 dark:bg-green-500 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Check className="h-3.5 w-3.5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div
        className={cn(
          'absolute bottom-16 right-0 w-[380px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-140px)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        )}
      >
        <div className="bg-primary text-primary-foreground px-4 py-3.5 flex items-center justify-between border-b shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="h-8.5 w-8.5 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white">
              E
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">EcoBot</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse motion-reduce:animate-none" />
                <span className="text-[10px] text-primary-foreground/75 font-semibold">Online Assistant</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleChat}
            className="p-1 rounded-full hover:bg-white/10 text-primary-foreground/80 hover:text-primary-foreground transition-all"
            aria-label="Close chat window"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto p-4 bg-background/50"
          aria-live="polite"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <div className="rounded-full bg-primary/10 p-3 mb-3 text-primary">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-foreground">Welcome to CarbonTracker Chat!</p>
              <p className="text-[11px] max-w-[200px] mt-1 leading-relaxed">
                Describe your activities (e.g. "I flew 500km" or "I drove a diesel car 30km") to estimate CO2
                emissions and log them instantly.
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t bg-card shrink-0">
          <div className="relative flex items-center bg-secondary/40 border border-border rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask EcoBot or describe an activity..."
              className="flex-1 bg-transparent border-0 focus:outline-none resize-none max-h-20 text-[13px] text-foreground placeholder-muted-foreground/75 py-1.5 leading-snug w-full"
              rows={1}
              disabled={isStreaming}
              aria-label="Chat input message"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="p-1.5 rounded-lg transition-all shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:scale-105 active:scale-95"
                aria-label="Stop streaming"
              >
                <Square className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className={cn(
                  'p-1.5 rounded-lg transition-all shrink-0 hover:scale-105 active:scale-95',
                  input.trim() && !isStreaming
                    ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/95'
                    : 'text-muted-foreground/60 cursor-not-allowed'
                )}
                aria-label="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="flex items-center gap-0.5">
              Powered by Gemini <CornerDownLeft className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleChat}
        className={cn(
          'bg-primary text-primary-foreground p-3.5 rounded-full shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border border-primary z-50',
          isOpen &&
            'rotate-90 bg-destructive border-destructive text-destructive-foreground hover:shadow-destructive/20'
        )}
        aria-label={
          isOpen ? 'Close carbon foot print assistant chat' : 'Open carbon foot print assistant chat'
        }
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
}
