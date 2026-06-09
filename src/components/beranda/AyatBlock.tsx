"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Quote, Sparkles } from "lucide-react";

const HADITS_LIST = [
  {
    teks: "Sesungguhnya kejujuran itu membawa kepada kebaikan dan kebaikan itu membawa ke Surga.",
    sumber: "HR. Muslim",
  },
  {
    teks: "Barang siapa yang beriman kepada Allah dan hari akhir, hendaklah ia berkata baik atau diam.",
    sumber: "HR. Bukhari & Muslim",
  },
  {
    teks: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.",
    sumber: "HR. Ahmad",
  },
  {
    teks: "Tidak sempurna iman seseorang di antara kalian sampai ia mencintai saudaranya seperti ia mencintai dirinya sendiri.",
    sumber: "HR. Bukhari & Muslim",
  },
  {
    teks: "Sesungguhnya Allah tidak melihat kepada rupa dan harta kalian, tetapi Dia melihat kepada hati dan amal kalian.",
    sumber: "HR. Muslim",
  },
  {
    teks: "Mukmin yang kuat lebih baik dan lebih dicintai Allah daripada mukmin yang lemah.",
    sumber: "HR. Muslim",
  },
];

export function AyatBlock() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HADITS_LIST.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const hadits = HADITS_LIST[index];

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative bg-[#0d1b0e] rounded-[80px] py-24 md:py-32 px-8 text-center border border-tertiary-fixed-dim/20 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tertiary-fixed-dim to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tertiary-fixed-dim to-transparent" />

        <div className="relative max-w-4xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-8 rounded-full border border-tertiary-fixed-dim/30 flex items-center justify-center">
            <Quote className="w-7 h-7 text-tertiary-fixed-dim" aria-hidden="true" />
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
              className="font-heading text-2xl md:text-4xl lg:text-5xl leading-relaxed md:leading-[1.8] text-white/95 mb-8"
            >
              &ldquo;{hadits.teks}&rdquo;
            </motion.p>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="h-px w-12 bg-gradient-to-r from-transparent via-[#eec055]/50 to-transparent" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#eec055]">
              {hadits.sumber}
            </span>
            <span className="h-px w-12 bg-gradient-to-r from-transparent via-[#eec055]/50 to-transparent" />
          </div>

          <div className="flex items-center justify-center gap-2">
            {HADITS_LIST.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? "bg-[#eec055] w-6"
                    : "bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: "inset 0 0 100px rgba(238, 192, 85, 0.05)",
          }}
        />
      </motion.div>
    </section>
  );
}
