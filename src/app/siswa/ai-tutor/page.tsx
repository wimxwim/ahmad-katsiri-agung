"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, RotateCcw, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-helpers";
import { useToast } from "@/components/ui/Toast";

interface TutorPollResult {
  chatId: string;
  status: "processing" | "done" | "failed";
  response?: string | null;
  errorMessage?: string | null;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
}

const SUGGESTION_CHIPS = [
  { label: "Rukun Iman", prompt: "Jelaskan Rukun Iman" },
  { label: "Akhlak Terpuji", prompt: "Apa itu Akhlak Terpuji?" },
  { label: "Kisah Nabi", prompt: "Ceritakan Kisah Nabi yang inspiratif" },
] as const;

const POLL_INTERVAL_MS = 1500;
const MAX_POLLS = 20;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function getErrorCode(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const err = r.error as Record<string, unknown> | undefined;
  if (err && typeof err.code === "string") return err.code;
  if (typeof r.code === "string") return r.code;
  return null;
}

export default function AiTutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking, scrollToBottom]);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleSend = useCallback(
    async (rawText?: string) => {
      const text = (rawText ?? input).trim();
      if (!text || thinking) return;

      // inline validation mirrors server PROMPT_TOO_SHORT (10 chars)
      if (text.length < 10) {
        appendMessage({
          id: crypto.randomUUID(),
          role: "error",
          content: "Tulis minimal 10 karakter",
        });
        return;
      }

      setInput("");
      setLastUserPrompt(text);
      appendMessage({ id: crypto.randomUUID(), role: "user", content: text });
      setThinking(true);

      try {
        const res = await apiFetch<{ chatId: string; status: string }>(
          "/api/v1/ai/tutor",
          {
            method: "POST",
            body: JSON.stringify({ message: text }),
          }
        );

        if (!res.ok) {
          const code = getErrorCode(res.raw);
          // PROMPT_TOO_SHORT must be handled inline, no toast, no polling
          if (res.status === 400 && code === "PROMPT_TOO_SHORT") {
            appendMessage({
              id: crypto.randomUUID(),
              role: "error",
              content: "Tulis minimal 10 karakter",
            });
            return;
          }
          if (res.status === 429) {
            toast("error", "Terlalu banyak pertanyaan, tunggu sebentar");
          } else if (res.status === 503) {
            toast("error", "Fitur AI Tutor belum aktif");
          } else {
            toast("error", res.error || "Gagal mengirim pertanyaan");
          }
          return;
        }

        const chatId = res.data?.chatId;
        if (!chatId) {
          toast("error", "Gagal mengirim pertanyaan");
          return;
        }

        for (let i = 0; i < MAX_POLLS; i++) {
          await sleep(POLL_INTERVAL_MS);
          const pollRes = await apiFetch<TutorPollResult>(
            `/api/v1/ai/tutor/${chatId}`
          );

          if (!pollRes.ok) {
            toast("error", pollRes.error || "Gagal memeriksa jawaban AI");
            return;
          }

          const data = pollRes.data;
          // early stop: handle completed / failed immediately, stop polling
          if (data?.status === "done") {
            appendMessage({
              id: crypto.randomUUID(),
              role: "assistant",
              content: data.response || "Maaf, AI tidak memberikan jawaban.",
            });
            return;
          }

          if (data?.status === "failed") {
            const errMsg = data.errorMessage || "Jawaban AI gagal dibuat";
            appendMessage({
              id: crypto.randomUUID(),
              role: "error",
              content: errMsg,
            });
            return;
          }
          // if still processing, continue loop
        }

        toast("error", "Waktu tunggu jawaban habis. Coba lagi.");
        appendMessage({
          id: crypto.randomUUID(),
          role: "error",
          content: "Waktu tunggu habis. Coba kirim ulang pertanyaanmu.",
        });
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Gagal mengirim pertanyaan";
        toast("error", msg);
        appendMessage({
          id: crypto.randomUUID(),
          role: "error",
          content: msg,
        });
      } finally {
        setThinking(false);
      }
    },
    [input, thinking, toast, appendMessage]
  );

  const handleRetry = useCallback(() => {
    if (lastUserPrompt) handleSend(lastUserPrompt);
  }, [lastUserPrompt, handleSend]);

  return (
    <div className="flex flex-col h-[calc(100dvh-12rem)] lg:h-[calc(100dvh-10rem)] max-w-3xl mx-auto w-full px-3 sm:px-5 lg:px-8">
      {/* Header - plain div with CSS transition, no motion/react */}
      <div className="flex items-center gap-3 mb-4 shrink-0 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="w-10 h-10 rounded-xl bg-[#005231] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg text-on-surface">
            AI Tutor
          </h1>
          <p className="text-xs text-on-surface-variant">
            Tanya materi Akidah Akhlak
          </p>
        </div>
      </div>

      {/* Chat card - glass rounded-[32px] */}
      <div className="flex-1 min-h-0 bg-white/60 backdrop-blur-2xl border border-[rgba(27,107,69,0.15)] rounded-[32px] shadow-glass overflow-hidden flex flex-col">
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-busy={thinking}
          aria-label="Riwayat percakapan AI Tutor"
          className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3"
        >
          {messages.length === 0 && !thinking ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8">
              <div className="w-14 h-14 rounded-2xl bg-[#005231]/10 text-[#005231] grid place-items-center mb-4 border border-[rgba(27,107,69,0.15)]">
                <Sparkles className="w-7 h-7" />
              </div>
              <p className="font-heading font-bold text-on-surface mb-1 text-base sm:text-lg">
                Halo! Tanya apa saja tentang Akidah Akhlak
              </p>
              <p className="text-xs sm:text-sm text-on-surface-variant mb-4 max-w-sm">
                Aku siap bantu kamu memahami materi dengan bahasa yang mudah
                dipahami.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleSend(chip.prompt)}
                    disabled={thinking}
                    className="inline-flex items-center bg-white border border-[rgba(27,107,69,0.15)] text-on-surface-variant px-3.5 py-2 rounded-full text-xs font-semibold hover:border-[#005231]/40 hover:text-[#005231] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) => {
                if (m.role === "user") {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[85%] bg-[#005231] text-white rounded-[20px] rounded-br-md px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {m.content}
                      </div>
                    </div>
                  );
                }
                if (m.role === "error") {
                  const isShortPromptError =
                    m.content === "Tulis minimal 10 karakter";
                  return (
                    <div key={m.id} className="flex">
                      <div className="max-w-[85%] bg-red-50 border border-red-200 text-red-700 rounded-[20px] rounded-bl-md px-4 py-2.5 text-sm whitespace-pre-wrap break-words flex flex-col gap-2">
                        <span className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{m.content}</span>
                        </span>
                        {!isShortPromptError && lastUserPrompt && (
                          <button
                            onClick={handleRetry}
                            disabled={thinking}
                            className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-800 border border-red-200 bg-white px-3 py-1.5 rounded-full active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Coba lagi
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={m.id} className="flex">
                    <div className="max-w-[85%] bg-white/60 backdrop-blur-xl border border-[rgba(27,107,69,0.15)] text-on-surface rounded-[20px] rounded-bl-md px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {m.content}
                    </div>
                  </div>
                );
              })}
              {thinking && (
                <div className="flex" aria-live="polite" aria-busy="true">
                  <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-[rgba(27,107,69,0.15)] rounded-[20px] rounded-bl-md px-4 py-3">
                    <span
                      className="flex items-center gap-1"
                      aria-hidden="true"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#005231]/40 tutor-dot" />
                      <span className="w-2 h-2 rounded-full bg-[#005231]/40 tutor-dot tutor-dot-2" />
                      <span className="w-2 h-2 rounded-full bg-[#005231]/40 tutor-dot tutor-dot-3" />
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      AI sedang mengetik...
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Input - sticky bottom with safe-area, mobile-first h-11 / lg:h-12 */}
      <div className="shrink-0 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sticky bottom-0 bg-[#f2fcf7]/80 backdrop-blur-xl -mx-3 sm:-mx-5 lg:-mx-8 px-3 sm:px-5 lg:px-8">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tulis pertanyaanmu..."
            disabled={thinking}
            aria-label="Tulis pertanyaan untuk AI Tutor"
            className={cn(
              "flex-1 min-w-0 px-4 rounded-full border border-[rgba(27,107,69,0.15)] bg-white text-sm text-on-surface",
              "placeholder:text-on-surface-variant/70 outline-hidden",
              "focus:border-[#005231]/40 focus:ring-3 focus:ring-[#005231]/10",
              "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              "h-11 lg:h-12"
            )}
          />
          <button
            onClick={() => handleSend()}
            disabled={thinking || !input.trim()}
            aria-label="Kirim pertanyaan"
            className="shrink-0 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-[#005231] text-white flex items-center justify-center hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-on-surface-variant/60 text-center mt-2">
          AI Tutor hanya membantu materi Akidah Akhlak
        </p>
      </div>

      <style>{`@keyframes tutorPulse{0%,80%,100%{opacity:0.35;transform:scale(0.9)}40%{opacity:1;transform:scale(1)}}.tutor-dot{animation:tutorPulse 1.2s ease-in-out infinite}.tutor-dot-2{animation-delay:0.2s}.tutor-dot-3{animation-delay:0.4s}`}</style>
    </div>
  );
}
