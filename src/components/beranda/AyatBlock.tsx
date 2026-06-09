"use client";

import { motion } from "motion/react";
import { Quote } from "lucide-react";

export function AyatBlock() {
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

          <p className="font-quran text-3xl md:text-4xl lg:text-5xl leading-relaxed md:leading-[1.8] text-white/95 mb-8">
            &ldquo;Sesungguhnya kejujuran itu membawa kepada kebaikan dan kebaikan
            itu membawa ke Surga.&rdquo;
          </p>

          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent via-[#eec055]/50 to-transparent" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#eec055]">
              HR. Muslim
            </span>
            <span className="h-px w-12 bg-gradient-to-r from-transparent via-[#eec055]/50 to-transparent" />
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
