import { Eye, Lock, Radio, ShoppingBag } from 'lucide-react';

export type SubTabType = 'previas' | 'vip' | 'lives' | 'loja';

interface FeedTabsProps {
  activeTab: SubTabType;
  onTabChange: (tab: SubTabType) => void;
  counts?: {
    previas?: number;
    vip?: number;
    lives?: number;
    loja?: number;
  };
}

export function FeedTabs({ activeTab, onTabChange, counts }: FeedTabsProps) {
  const tabs = [
    { 
      id: 'previas' as SubTabType, 
      label: 'Prévias', 
      icon: Eye,
      count: counts?.previas,
    },
    { 
      id: 'vip' as SubTabType, 
      label: 'Exclusivo VIP', 
      icon: Lock,
      count: counts?.vip,
    },
    { 
      id: 'lives' as SubTabType, 
      label: 'Lives VIP', 
      icon: Radio,
      count: counts?.lives,
    },
    { 
      id: 'loja' as SubTabType, 
      label: 'Loja & Packs', 
      icon: ShoppingBag,
      count: counts?.loja,
    },
  ];

  const subtitles: Record<SubTabType, string> = {
    previas: '👁 Todos podem ver as prévias abaixo — gratuitas.',
    vip: '🔒 Conteúdos exclusivos e ensaios reservados para assinantes VIP ativos.',
    lives: '🔴 Transmissões ao vivo exclusivas, chat em tempo real e filtros interativos.',
    loja: '🛍 Conteúdos e ensaios exclusivos liberados instantaneamente via PIX.',
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Horizontal pill navigation bar */}
      <div className="bg-[#131521] p-1.5 rounded-2xl flex items-center justify-center gap-2 border border-[#1e2337] shadow-xl overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-w-[120px] sm:min-w-[140px] py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] text-white shadow-[0_4px_16px_rgba(255,46,116,0.35)] font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1d2e]'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span 
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#1e2337] text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Subtitle matching print */}
      <div className="text-center sm:text-left text-xs sm:text-sm text-gray-400 px-1 flex items-center justify-center gap-1.5">
        <span>{subtitles[activeTab]}</span>
      </div>
    </div>
  );
}
