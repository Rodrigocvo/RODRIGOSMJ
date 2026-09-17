import { useState } from 'react';
import { Gift, Heart } from 'lucide-react';

interface TipCardProps {
  onSendTip: (amount: number) => void;
  creatorName: string;
}

export function TipCard({ onSendTip, creatorName }: TipCardProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(50);

  const presets = [10, 25, 50, 100];

  return (
    <div className="bg-[#191c22] rounded-2xl p-5 border border-[#272a31] shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift size={20} className="text-[#dcb8ff]" />
          <h3 className="font-bold text-sm text-white">Enviar Gorjeta (Mimo)</h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40">
          🥑 AbacatePay PIX
        </span>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed">
        Envie um mimo direto via PIX com 0% de taxa para que {creatorName} receba na hora e responda no seu chat privado.
      </p>

      {/* Chips */}
      <div className="grid grid-cols-4 gap-2">
        {presets.map((amount) => {
          const isSelected = selectedAmount === amount;
          return (
            <button
              key={amount}
              onClick={() => setSelectedAmount(amount)}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-center border ${
                isSelected
                  ? 'bg-[#ff4f73] text-white border-[#ff4f73] shadow-md'
                  : 'bg-[#0b0e14] text-gray-300 border-[#272a31] hover:bg-[#272a31]'
              }`}
            >
              R$ {amount}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onSendTip(selectedAmount)}
        className="w-full h-11 rounded-xl bg-[#272a31] hover:bg-[#32353c] border border-[#32353c] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm"
      >
        <Heart size={17} className="text-[#ff4f73] fill-[#ff4f73]" />
        <span>Enviar Mimo Agora (R$ {selectedAmount})</span>
      </button>
    </div>
  );
}
