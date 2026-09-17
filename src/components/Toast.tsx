import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className="px-4 py-3 rounded-xl bg-[#191c22] border border-[#ff4f73] text-white text-xs sm:text-sm font-medium shadow-2xl flex items-center gap-2.5 backdrop-blur-xl">
        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}
