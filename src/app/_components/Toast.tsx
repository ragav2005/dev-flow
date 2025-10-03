"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastData {
  id: string;
  message: string;
  variant?: ToastVariant;
  onClose?: (id: string) => void;
  duration?: number;
}

const variantStyles: Record<
  ToastVariant,
  { bg: string; ring: string; icon: React.ReactNode }
> = {
  success: {
    bg: "from-emerald-500/15 to-green-500/15",
    ring: "ring-emerald-500/30",
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  },
  error: {
    bg: "from-rose-500/15 to-red-500/15",
    ring: "ring-rose-500/30",
    icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
  },
  info: {
    bg: "from-sky-500/15 to-blue-500/15",
    ring: "ring-sky-500/30",
    icon: <Info className="w-5 h-5 text-sky-400" />,
  },
};

export function Toast({
  id,
  message,
  variant = "info",
  onClose,
  duration = 3200,
}: ToastData) {
  useEffect(() => {
    const t = setTimeout(() => onClose?.(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, onClose]);

  const styles = variantStyles[variant];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      role="status"
      aria-live="polite"
      className={`relative overflow-hidden pointer-events-auto flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-br ${styles.bg} backdrop-blur-xl ring-1 ${styles.ring} shadow-lg min-w-[260px]`}
    >
      <div className="pt-0">{styles.icon}</div>
      <div className="flex-1 text-sm text-gray-200 pr-4">{message}</div>
      <button
        onClick={() => onClose?.(id)}
        className="text-xs text-gray-400 hover:text-gray-200 transition-colors font-medium cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 text-red-400 hover:text-red-500" />
      </button>
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
    </motion.div>
  );
}

export function ToastViewport({
  toasts,
  onClose,
}: {
  toasts: ToastData[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 items-center w-full">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
