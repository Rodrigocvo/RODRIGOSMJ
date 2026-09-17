import { useState, FormEvent } from 'react';
import { 
  X, 
  DollarSign, 
  Check, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  Tag, 
  ShoppingBag,
  ArrowRight,
  Edit3
} from 'lucide-react';
import { SubscriptionPlan, Post } from '../../types';

interface ManagePricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  posts?: Post[];
  onUpdatePlans: (updatedPlans: SubscriptionPlan[]) => void;
  onUpdatePostPrice?: (postId: string, newPrice: number) => void;
  onShowToast: (msg: string) => void;
}

export function ManagePricingModal({
  isOpen,
  onClose,
  plans,
  posts = [],
  onUpdatePlans,
  onUpdatePostPrice,
  onShowToast,
}: ManagePricingModalProps) {
  const [activeTab, setActiveTab] = useState<'plans' | 'avulsos'>('plans');

  const monthlyPlan = plans.find((p) => p.id === 'monthly') || plans[0];
  const quarterlyPlan = plans.find((p) => p.id === 'quarterly') || plans[1];

  // Plan state
  const [monthlyPrice, setMonthlyPrice] = useState(monthlyPlan.price.toFixed(2));
  const [quarterlyPrice, setQuarterlyPrice] = useState(quarterlyPlan.price.toFixed(2));
  const [quarterlyDiscount, setQuarterlyDiscount] = useState(quarterlyPlan.badge || '25% OFF');

  // Promotion state
  const [isPromoActive, setIsPromoActive] = useState(monthlyPlan.isPromoActive || false);
  const [originalPrice, setOriginalPrice] = useState(
    monthlyPlan.originalPrice ? monthlyPlan.originalPrice.toFixed(2) : '49.90'
  );
  const [promoBanner, setPromoBanner] = useState(
    monthlyPlan.promoBanner || '🔥 PROMOÇÃO ESPECIAL: Assine hoje com 40% OFF!'
  );

  // Avulso items prices state (keyed by postId)
  const ppvPosts = posts.filter(
    (p) => p.type === 'ppv-video' || (p.ppvPrice !== undefined && p.ppvPrice > 0)
  );

  const [avulsoPrices, setAvulsoPrices] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    ppvPosts.forEach((p) => {
      initial[p.id] = (p.ppvPrice || 19.90).toFixed(2);
    });
    return initial;
  });

  if (!isOpen) return null;

  const handleSavePlans = (e: FormEvent) => {
    e.preventDefault();

    const newMonthly = parseFloat(monthlyPrice.replace(',', '.')) || 29.90;
    const newQuarterly = parseFloat(quarterlyPrice.replace(',', '.')) || 69.90;
    const newOrig = parseFloat(originalPrice.replace(',', '.')) || 49.90;

    const updatedPlans: SubscriptionPlan[] = plans.map((plan) => {
      if (plan.id === 'monthly') {
        return {
          ...plan,
          price: newMonthly,
          priceFormatted: `R$ ${newMonthly.toFixed(2).replace('.', ',')}`,
          isPromoActive,
          originalPrice: isPromoActive ? newOrig : undefined,
          originalPriceFormatted: isPromoActive
            ? `R$ ${newOrig.toFixed(2).replace('.', ',')}`
            : undefined,
          promoBanner: isPromoActive ? promoBanner : undefined,
          badge: isPromoActive ? 'PROMOÇÃO ATIVA' : undefined,
        };
      }
      if (plan.id === 'quarterly') {
        const perMonth = (newQuarterly / 3).toFixed(2).replace('.', ',');
        return {
          ...plan,
          price: newQuarterly,
          priceFormatted: `R$ ${newQuarterly.toFixed(2).replace('.', ',')}`,
          periodText: `R$ ${perMonth}/mês`,
          badge: quarterlyDiscount.trim() || undefined,
        };
      }
      return plan;
    });

    onUpdatePlans(updatedPlans);
    onShowToast(
      isPromoActive
        ? 'Promoção e valores de assinatura salvos com sucesso!'
        : 'Valores de assinatura atualizados com sucesso!'
    );
    onClose();
  };

  const handleSaveSingleAvulso = (postId: string) => {
    const val = parseFloat(avulsoPrices[postId]?.replace(',', '.')) || 19.90;
    if (onUpdatePostPrice) {
      onUpdatePostPrice(postId, val);
      onShowToast(`Valor do conteúdo atualizado para R$ ${val.toFixed(2).replace('.', ',')}!`);
    }
  };

  const handleApplyGlobalDiscount = (discountPercent: number) => {
    const nextPrices: Record<string, string> = {};
    ppvPosts.forEach((p) => {
      const current = parseFloat(avulsoPrices[p.id]?.replace(',', '.')) || p.ppvPrice || 19.90;
      const discounted = Math.max(5, current * (1 - discountPercent / 100));
      nextPrices[p.id] = discounted.toFixed(2);
      if (onUpdatePostPrice) {
        onUpdatePostPrice(p.id, parseFloat(discounted.toFixed(2)));
      }
    });
    setAvulsoPrices(nextPrices);
    onShowToast(`Desconto promocional de ${discountPercent}% aplicado em todos os conteúdos avulsos!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#121420] rounded-3xl border border-[#1e2337] shadow-2xl overflow-hidden z-10 my-6">
        {/* Header */}
        <div className="p-5 border-b border-[#1e2337] flex items-center justify-between bg-[#0a0b10]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#ff2e74]/20 border border-[#ff2e74]/40 flex items-center justify-center text-[#ff2e74]">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Playfair_Display',serif]">
                Gestão de Preços & Promoções
              </h2>
              <p className="text-xs text-gray-400">
                Painel da Criadora &bull; Configuração em Tempo Real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1c2032] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#1e2337] bg-[#0d0f18] px-5 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'plans'
                ? 'border-[#ff2e74] text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles size={14} className={activeTab === 'plans' ? 'text-[#ff2e74]' : ''} />
            <span>Assinaturas & Promoções</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('avulsos')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'avulsos'
                ? 'border-[#ff2e74] text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShoppingBag size={14} className={activeTab === 'avulsos' ? 'text-[#ff2e74]' : ''} />
            <span>Conteúdos Avulsos ({ppvPosts.length})</span>
          </button>
        </div>

        {/* TAB 1: SUBSCRIPTION PLANS & PROMOTIONS */}
        {activeTab === 'plans' && (
          <form onSubmit={handleSavePlans} className="p-5 sm:p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
            {/* Promoção Switch */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#211119] via-[#161220] to-[#111624] border border-[#ff2e74]/40 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#ff2e74]/20 text-[#ff4d88] flex items-center justify-center">
                    <Flame size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Ativar Promoção Especial</h3>
                    <p className="text-[11px] text-gray-400">
                      Exibe valor promocional riscado ("De R$ 49,90 por R$ 29,90")
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => setIsPromoActive(!isPromoActive)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    isPromoActive ? 'bg-[#ff2e74]' : 'bg-[#22283d]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      isPromoActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isPromoActive && (
                <div className="flex flex-col gap-3 pt-2 border-t border-[#ff2e74]/20 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-300 font-medium block mb-1">
                        Preço Original Riscado (De R$)
                      </label>
                      <input
                        type="text"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="49.90"
                        className="w-full h-10 px-3 rounded-xl bg-[#0a0b10] border border-[#22283d] text-sm text-white focus:outline-none focus:border-[#ff2e74]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-emerald-400 font-bold block mb-1">
                        Preço Promocional (Por R$)
                      </label>
                      <input
                        type="text"
                        value={monthlyPrice}
                        onChange={(e) => setMonthlyPrice(e.target.value)}
                        placeholder="29.90"
                        className="w-full h-10 px-3 rounded-xl bg-[#0a0b10] border border-emerald-500/50 text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 font-medium block mb-1">
                      Aviso Promocional no Topo dos Planos
                    </label>
                    <input
                      type="text"
                      value={promoBanner}
                      onChange={(e) => setPromoBanner(e.target.value)}
                      placeholder="Ex: 🔥 PROMOÇÃO: 40% OFF por tempo limitado!"
                      className="w-full h-10 px-3 rounded-xl bg-[#0a0b10] border border-[#22283d] text-xs text-white focus:outline-none focus:border-[#ff2e74]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Monthly Plan Configuration */}
            <div className="p-4 rounded-2xl bg-[#151724] border border-[#22283d] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Plano Mensal VIP</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ff2e74]/20 text-[#ff4d88] text-[10px] font-bold">
                    Acesso Imediato
                  </span>
                </div>
                <span className="text-xs text-gray-400">Cobrado a cada 30 dias</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-400">R$</span>
                <input
                  type="text"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                  placeholder="29.90"
                  className="w-full h-11 px-4 bg-[#0a0b10] border border-[#22283d] rounded-xl text-base font-bold text-white focus:outline-none focus:border-[#ff2e74]"
                  required
                />
              </div>
            </div>

            {/* Quarterly Plan Configuration */}
            <div className="p-4 rounded-2xl bg-[#151724] border border-[#22283d] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Plano Trimestral (3 Meses)</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                    Pacote Fidelidade
                  </span>
                </div>
                <span className="text-xs text-gray-400">Cobrado a cada 90 dias</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 font-medium block mb-1">
                    Valor Total (R$)
                  </label>
                  <input
                    type="text"
                    value={quarterlyPrice}
                    onChange={(e) => setQuarterlyPrice(e.target.value)}
                    placeholder="69.90"
                    className="w-full h-11 px-3 bg-[#0a0b10] border border-[#22283d] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 font-medium block mb-1">
                    Selo de Desconto
                  </label>
                  <input
                    type="text"
                    value={quarterlyDiscount}
                    onChange={(e) => setQuarterlyDiscount(e.target.value)}
                    placeholder="Ex: 25% OFF"
                    className="w-full h-11 px-3 bg-[#0a0b10] border border-[#22283d] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] hover:from-[#ff2e74] hover:to-[#ff4d88] text-white font-bold text-sm shadow-[0_4px_16px_rgba(255,46,116,0.4)] transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Check size={18} />
              <span>Salvar Alterações dos Planos</span>
            </button>
          </form>
        )}

        {/* TAB 2: AVULSO CONTENT PRICING */}
        {activeTab === 'avulsos' && (
          <div className="p-5 sm:p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
            {/* Quick Global Promo Actions */}
            <div className="p-4 rounded-2xl bg-[#151724] border border-[#22283d] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Tag size={14} className="text-[#ff2e74]" />
                  Ações Rápidas de Promoção nos Avulsos
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Aplique um desconto percentual em lote em todos os vídeos e packs avulsos:
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleApplyGlobalDiscount(15)}
                  className="px-3 py-1.5 rounded-lg bg-[#22283d] hover:bg-[#ff2e74] text-xs font-bold text-white transition-colors"
                >
                  -15% em Todos
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyGlobalDiscount(25)}
                  className="px-3 py-1.5 rounded-lg bg-[#22283d] hover:bg-[#ff2e74] text-xs font-bold text-white transition-colors"
                >
                  -25% em Todos
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyGlobalDiscount(40)}
                  className="px-3 py-1.5 rounded-lg bg-[#22283d] hover:bg-[#ff2e74] text-xs font-bold text-white transition-colors"
                >
                  -40% Promoção Relâmpago
                </button>
              </div>
            </div>

            {/* List of avulso posts */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Editar valor individual por conteúdo:
              </span>

              {ppvPosts.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400 bg-[#0a0b10] rounded-2xl border border-[#1e2337]">
                  Nenhum conteúdo avulso cadastrado no momento. Ao publicar uma foto ou vídeo como "Venda Avulsa (PPV)", ele aparecerá aqui para você gerenciar o valor.
                </div>
              ) : (
                ppvPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 rounded-2xl bg-[#0a0b10] border border-[#1e2337] flex items-center justify-between gap-3"
                  >
                    {/* Thumbnail + Title */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#1c2032] overflow-hidden shrink-0">
                        {post.media?.url ? (
                          <img
                            src={post.media.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <ShoppingBag size={18} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {post.content.slice(0, 45) || 'Conteúdo Avulso'}
                        </h4>
                        <span className="text-[10px] text-gray-400 block truncate">
                          {post.type === 'ppv-video' ? 'Vídeo Avulso PPV' : 'Pack Exclusivo'}
                        </span>
                      </div>
                    </div>

                    {/* Price Input + Save */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 bg-[#131521] border border-[#22283d] rounded-xl px-2.5 h-9">
                        <span className="text-xs text-gray-400 font-bold">R$</span>
                        <input
                          type="text"
                          value={avulsoPrices[post.id] || '19.90'}
                          onChange={(e) =>
                            setAvulsoPrices((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          className="w-16 bg-transparent text-xs font-bold text-white focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSaveSingleAvulso(post.id)}
                        className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                        title="Salvar novo preço deste item"
                      >
                        <Check size={13} />
                        <span>Salvar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#151724] hover:bg-[#1c2032] text-white text-xs font-bold transition-colors mt-2"
            >
              Concluir e Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
