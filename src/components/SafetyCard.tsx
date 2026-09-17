import { Shield } from 'lucide-react';

export function SafetyCard() {
  return (
    <div className="p-5 rounded-2xl bg-[#0b0e14]/60 border border-[#272a31] flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
        <Shield size={14} className="text-emerald-400" />
        <span>Segurança e Discrição</span>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">
        Cobrança sem descrição explícita na fatura bancária. Conteúdo protegido por direitos autorais nos termos da legislação vigente.
      </p>
    </div>
  );
}
