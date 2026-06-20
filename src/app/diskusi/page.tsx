"use client";

import { motion } from "motion/react";
import { MessageSquare } from "lucide-react";
import { DiskusiForm } from "@/components/diskusi/DiskusiForm";
import { DiskusiList } from "@/components/diskusi/DiskusiList";
import { EASE_CURVE } from "@/lib/constants";

export default function DiskusiPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-20 sm:pt-24 pb-24 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
        className="text-center mb-12 sm:mb-16"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <MessageSquare className="w-10 h-10 text-primary" aria-hidden="true" />
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl lg:text-7xl tracking-tighter text-on-surface leading-none mb-6">
          Ruang{" "}
          <span className="text-primary italic font-semibold">Diskusi</span>
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant max-w-xl mx-auto">
          Tanya jawab, berbagi pengalaman, dan bahas studi kasus
          bersama teman-temanmu. Setiap pertanyaan adalah langkah menuju ilmu.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto mb-10">
        <DiskusiForm />
      </div>

      <div className="max-w-3xl mx-auto">
        <DiskusiList />
      </div>
    </div>
  );
}
