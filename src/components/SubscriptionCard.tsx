import { CheckCircle2, LockOpen, Zap, ShieldCheck, Sparkles, Edit2, Flame } from 'lucide-react';
import { SubscriptionPlan } from '../types';

interface SubscriptionCardProps {
  plans: SubscriptionPlan[];
  selectedPlanId: 'monthly' | 'quarterly';
  onSelectPlan: (id: 'monthly' | 'quarterly') => void;
  onSubscribe: (plan: SubscriptionPlan) => void;
  isSubscribed: boolean;
  isAdmin?: boolean;
  onOpenManagePricing?: () => void;
}

export function SubscriptionCard({
  plans,
  selectedPlanId,
  onSelectPlan,
  onSubscribe,
  isSubscribed,
  isAdmin = false,
  onOpenManagePricing,
}: SubscriptionCardProps) {
  const monthlyPlan = plans.find((p) => p.id === 'monthly') || plans[0];
  const quarterlyPlan = plans.find((p) => p.id === 'quarterly') || plans[1] || plans[0];
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || monthlyPlan;

  return (
    <div className="bg-[#131521] rounded-3xl p-5 sm:p-6 border border-[#1e2337] shadow-2xl relative overflow-hidden flex flex-col gap-5">
      {/* Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#ff2e74]/15 filter blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-[#ff2e74]" />
          <h2 className="font-['Playfair_Display',serif] font-bold text-lg sm:text-xl text-white">
            Assinatura do Perfil VIP
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && onOpenManagePricing && (
            <button
              onClick={onOpenManagePricing}
              className="p-1.5 px-2.5 rounded-xl bg-[#1c2032] hover:bg-[#252b42] text-gray-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold border border-white/10 transition-colors"
              title="Alterar valores e promoções (Admin)"
            >
              <Edit2 size={12} className="text-[#ff2e74]" />
              <span>Editar Preços</span>
            </button>
          )}
          <span className="px-3 py-1 rounded-full bg-[#ff2e74] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(255,46,116,0.4)]">
            {isSubscribed ? 'Ativa' : 'Acesso Total'}
          </span>
        </div>
      </div>

      {/* Active Promotion Announcement Bar */}
      {monthlyPlan.isPromoActive && monthlyPlan.promoBanner && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#ff1a66]/20 via-[#ff2e74]/20 to-purple-600/20 border border-[#ff2e74]/40 flex items-center gap-2.5 text-xs text-white font-bold shadow-md">
          <Flame size={16} className="text-[#ff2e74] shrink-0 animate-bounce" />
          <span>{monthlyPlan.promoBanner}</span>
        </div>
      )}

      {isSubscribed ? (
        <div className="p-5 rounded-2xl bg-[#0a0b10] border border-emerald-500/40 flex flex-col gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Você é Assinante VIP Ativo!</h3>
            <p className="text-xs text-gray-400 mt-1">
              Todos os posts e ensaios exclusivos do perfil estão 100% liberados para você.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Plan Option 1: Monthly */}
          <div
            onClick={() => onSelectPlan('monthly')}
            className={`p-4 rounded-2xl transition-all cursor-pointer flex flex-col gap-3 border ${
              selectedPlanId === 'monthly'
                ? 'bg-[#181b2b] border-[#ff2e74] ring-1 ring-[#ff2e74] shadow-[0_0_20px_rgba(255,46,116,0.2)]'
                : 'bg-[#0a0b10] border-[#1e2337] hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{monthlyPlan.name}</span>
                  {monthlyPlan.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ff2e74]/20 text-[#ff4d88] text-[9px] font-extrabold border border-[#ff2e74]/30">
                      {monthlyPlan.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  Acesso completo com renovação mensal
                </span>
              </div>
              <div className="flex flex-col items-end">
                {monthlyPlan.isPromoActive && monthlyPlan.originalPrice && (
                  <span className="text-[11px] text-gray-400 line-through">
                    De R$ {monthlyPlan.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="font-['Playfair_Display',serif] font-black text-xl sm:text-2xl text-[#ff2e74]">
                    R$ {monthlyPlan.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">/mês</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSubscribe(monthlyPlan);
              }}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] text-white font-bold text-sm shadow-[0_8px_24px_-4px_rgba(255,46,116,0.45)] hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <LockOpen size={16} />
              <span>Assinar Agora por R$ {monthlyPlan.price.toFixed(2).replace('.', ',')}</span>
            </button>
          </div>

          {/* Plan Option 2: Quarterly */}
          <div
            onClick={() => onSelectPlan('quarterly')}
            className={`p-4 rounded-2xl transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden border ${
              selectedPlanId === 'quarterly'
                ? 'bg-[#181b2b] border-purple-500 ring-1 ring-purple-500 shadow-lg'
                : 'bg-[#0a0b10] border-[#1e2337] hover:border-gray-600'
            }`}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2.5 py-0.5 rounded-bl-xl text-[10px] uppercase font-bold tracking-wider">
              {quarterlyPlan.badge || '25% OFF'}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white">{quarterlyPlan.name}</span>
                <span className="text-xs text-gray-400">
                  Acesso por 3 meses completos
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-['Playfair_Display',serif] font-black text-xl sm:text-2xl text-purple-400">
                  R$ {quarterlyPlan.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[11px] text-gray-400">
                  R$ {(quarterlyPlan.price / 3).toFixed(2).replace('.', ',')}/mês
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSubscribe(quarterlyPlan);
              }}
              className="w-full h-11 rounded-xl bg-[#1c2032] hover:bg-[#252b42] text-white font-bold text-sm border border-[#2d3450] transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Zap size={16} className="text-amber-400" />
              <span>Garantir Oferta Trimestral</span>
            </button>
          </div>
        </>
      )}

      {/* Perks List */}
      <div className="flex flex-col gap-2.5 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Vantagens Inclusas:
        </span>
        {selectedPlan.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-[#e1e2eb]">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* Guarantee Strip */}
      <div className="pt-2 border-t border-[#1e2337] flex items-center justify-center gap-2 text-gray-400 text-xs">
        <ShieldCheck size={16} className="text-emerald-400" />
        <span>Pagamento 100% discreto via AbacatePay PIX Instantâneo</span>
      </div>
    </div>
  );
}
