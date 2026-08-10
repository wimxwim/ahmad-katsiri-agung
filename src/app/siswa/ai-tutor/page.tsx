"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
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

const EXAMPLE_PROMPTS = [
  "Apa itu rukun iman?",
  "Jelaskan salat mencegah perbuatan keji",
  "Bagaimana cara bertawakal?",
];

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 40;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function AiTutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
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

      setInput("");
      appendMessage({ id: crypto.randomUUID(), role: "user", content: text });
      setThinking(true);

      try {
        const res = await apiFetch<{ chatId: string; status: string }>(
          "/api/v1/ai/tutor",
          {
            method: "POST",
            body: JSON.stringify({ message: text }),
          },
        );

        if (!res.ok) {
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
            `/api/v1/ai/tutor/${chatId}`,
          );

          if (!pollRes.ok) {
            toast("error", pollRes.error || "Gagal memeriksa jawaban AI");
            return;
          }

          const data = pollRes.data;
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
            toast("error", "Jawaban AI gagal dibuat. Coba lagi.");
            appendMessage({
              id: crypto.randomUUID(),
              role: "error",
              content: errMsg,
            });
            return;
          }
        }

        toast("error", "Waktu tunggu jawaban habis. Coba lagi.");
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Gagal mengirim pertanyaan";
        toast("error", msg);
      } finally {
        setThinking(false);
      }
    },
    [input, thinking, toast, appendMessage],
  );

  return (
    <div className="flex flex-col h-[calc(100dvh-12rem)] lg:h-[calc(100dvh-10rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE }}
        className="flex items-center gap-3 mb-4 shrink-0"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg text-on-surface">
            AI Tutor
          </h1>
          <p className="text-xs text-on-surface-variant">Tanya materi Akidah Akhlak</p>
        </div>
      </motion.div>

      <div className="flex-1 min-h-0 bg-glass border border-border-precision rounded-2xl overflow-hidden flex flex-col">
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3"
        >
          {messages.length === 0 && !thinking ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <p className="font-heading font-bold text-on-surface mb-2 text-base">
                Tanya apa saja tentang materi Akidah Akhlak
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    disabled={thinking}
                    className="inline-flex items-center bg-white border border-border-precision text-on-surface-variant px-3.5 py-2 rounded-full text-xs font-semibold hover:border-primary/40 hover:text-primary active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {prompt}
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
                      <div className="max-w-[85%] bg-primary text-on-primary rounded-2xl rounded-br-md px-4 py-2.5 text-sm whitespace-pre-wrap break-words">
                        {m.content}
                      </div>
                    </div>
                  );
                }
                if (m.role === "error") {
                  return (
                    <div key={m.id} className="flex">
                      <div className="max-w-[85%] bg-red-50 border border-red-200 text-red-700 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm whitespace-pre-wrap break-words">
                        {m.content}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={m.id} className="flex">
                    <div className="max-w-[85%] bg-white border border-border-precision text-on-surface rounded-2xl rounded-bl-md px-4 py-2.5 text-sm whitespace-pre-wrap break-words">
                      {m.content}
                    </div>
                  </div>
                );
              })}
              {thinking && (
                <div className="flex">
                  <div className="flex items-center gap-2 bg-white border border-border-precision rounded-2xl rounded-bl-md px-4 py-3">
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full bg-on-surface-variant/40 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-on-surface-variant/40 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-on-surface-variant/40 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
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

      <div className="pt-2.5 shrink-0 flex items-center gap-2">
        <input
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
          className="flex-1 min-w-0 px-4 py-3 rounded-full border border-border-precision bg-white text-sm text-on-surface placeholder:text-on-surface-variant/70 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={() => handleSend()}
          disabled={thinking || !input.trim()}
          aria-label="Kirim pertanyaan"
          className="shrink-0 w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}