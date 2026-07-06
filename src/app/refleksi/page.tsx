"use client";

import { motion } from "motion/react";
import { Brain } from "lucide-react";
import { RefleksiForm } from "@/components/refleksi/RefleksiForm";
import { RefleksiHistori } from "@/components/refleksi/RefleksiHistori";
import { EASE_CURVE } from "@/lib/constants";

export default function RefleksiPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-20 sm:pt-24 pb-24 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
        className="text-center mb-12 sm:mb-16"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Brain className="w-10 h-10 text-primary" aria-hidden="true" />
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl lg:text-7xl tracking-tighter text-on-surface leading-none mb-6">
          Refleksi{" "}
          <span className="text-primary italic font-semibold">Diri</span>
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant max-w-xl mx-auto">
          Renungkan pembelajaran hari ini, catat akhlak baik, dan niatkan
          perbaikan diri. Muhasabah adalah kunci pertumbuhan.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
        <div>
          <RefleksiForm />
        </div>
        <div>
          <RefleksiHistori />
        </div>
      </div>
    </div>
  );
}
