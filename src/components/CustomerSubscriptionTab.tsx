import { useState, useEffect } from 'react';
import { 
  Crown, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  X, 
  ArrowRight,
  RefreshCw,
  Gift,
  Film
} from 'lucide-react';
import { User, AbacatePayTransaction, SubscriptionPlan } from '../types';
import { loadAbacatePayTransactions, getAbacatePayConfig } from '../utils/abacatePay';

interface CustomerSubscriptionTabProps {
  user: User | null;
  isSubscribed: boolean;
  plans: SubscriptionPlan[];
  onOpenSubscribeModal: (planId?: 'monthly' | 'quarterly') => void;
  onShowToast: (msg: string) => void;
}

export function CustomerSubscriptionTab({
  user,
  isSubscribed,
  plans,
  onOpenSubscribeModal,
  onShowToast,
}: CustomerSubscriptionTabProps) {
  const [filter, setFilter] = useState<'all' | 'subscription' | 'ppv' | 'tip'>('all');
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<AbacatePayTransaction | null>(null);
  const [selectedPendingTx, setSelectedPendingTx] = useState<AbacatePayTransaction | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [transactions, setTransactions] = useState<AbacatePayTransaction[]>([]);

  // Real-time countdown calculation
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    totalPercent: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: true,
    totalPercent: 0,
  });

  // Load transactions for this user or session
  useEffect(() => {
    const all = loadAbacatePayTransactions();
    // Match by user email or user name, or show recent transactions
    if (user?.email) {
      const userTxs = all.filter(
        (tx) => tx.customerEmail === user.email || tx.customerName === user.name
      );
      setTransactions(userTxs.length > 0 ? userTxs : all);
    } else {
      setTransactions(all);
    }
  }, [user]);

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      if (!isSubscribed || !user?.vipExpiresAt) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          totalPercent: 0,
        });
        return;
      }

      const expiry = new Date(user.vipExpiresAt).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          totalPercent: 0,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Assuming standard 30 days subscription total for progress bar calculation
      const totalPeriodMs = (user.vipPlan === 'quarterly' ? 90 : 30) * 24 * 60 * 60 * 1000;
      const percent = Math.min(100, Math.max(0, (diff / totalPeriodMs) * 100));

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        totalPercent: percent,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isSubscribed, user?.vipExpiresAt, user?.vipPlan]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const handleCopyPix = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    onShowToast('Código PIX Copia e Cola copiado com sucesso!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const currentPlan = plans.find((p) => p.id === (user?.vipPlan || 'monthly')) || plans[0];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2032]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">💳</span>
            <h1 className="text-2xl font-black text-white font-['Playfair_Display',serif]">
              Minha Assinatura & Histórico de Pagamentos
            </h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Controle o tempo de vigência do seu VIP e consulte seus comprovantes e transações oficiais via PIX.
          </p>
        </div>

        {isSubscribed ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-sm">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Assinatura Ativa &bull; 100% Liberado</span>
          </div>
        ) : (
          <button
            onClick={() => onOpenSubscribeModal('monthly')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff1a66] to-[#ff4d88] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all active:scale-98"
          >
            <Crown size={15} />
            <span>Assinar VIP Agora</span>
          </button>
        )}
      </div>

      {/* SECTION 1: TEMPO DE ASSINATURA RESTANTE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121522] via-[#0f111a] to-[#181020] border border-[#23293f] p-6 sm:p-8 shadow-xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff2e74]/10 rounded-full blur-3xl pointer-events-none" />

        {isSubscribed && !timeRemaining.isExpired ? (
          <div className="flex flex-col gap-6 relative z-10">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <Crown size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">
                      {user?.vipPlan === 'quarterly' ? 'Plano Trimestral VIP' : 'Plano Mensal VIP'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                      Vigente
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Acesso irrestrito a feeds, lives exclusivas e bate-papo privado.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenSubscribeModal(user?.vipPlan || 'monthly')}
                className="self-start sm:self-center px-4 py-2 rounded-xl bg-[#1b2033] hover:bg-[#252b45] border border-[#2b3350] text-xs font-bold text-gray-200 hover:text-white transition-all flex items-center gap-2"
              >
                <RefreshCw size={13} className="text-[#ff4d88]" />
                <span>Antecipar Renovação PIX</span>
              </button>
            </div>

            {/* Countdown Box */}
            <div className="p-5 rounded-2xl bg-[#090b12]/90 border border-[#20253b] flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Clock size={14} className="text-[#ff2e74]" />
                  <span>Tempo de Assinatura Restante:</span>
                </span>
                <span className="text-xs font-mono text-gray-300 flex items-center gap-1">
                  <Calendar size={13} className="text-gray-400" />
                  <span>
                    Expira em:{' '}
                    <strong className="text-white">
                      {user?.vipExpiresAt
                        ? new Date(user.vipExpiresAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '30 dias'}
                    </strong>
                  </span>
                </span>
              </div>

              {/* Countdown Numbers Grid */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                <div className="p-3 sm:p-4 rounded-xl bg-[#141724] border border-[#22283e] flex flex-col">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {timeRemaining.days.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-400 mt-1">
                    Dias
                  </span>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-[#141724] border border-[#22283e] flex flex-col">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {timeRemaining.hours.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-400 mt-1">
                    Horas
                  </span>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-[#141724] border border-[#22283e] flex flex-col">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {timeRemaining.minutes.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-400 mt-1">
                    Minutos
                  </span>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-[#141724] border border-[#22283e] flex flex-col">
                  <span className="text-2xl sm:text-3xl font-black text-[#ff4d88] font-mono animate-pulse">
                    {timeRemaining.seconds.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-400 mt-1">
                    Segundos
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Progresso do período contratado</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {timeRemaining.totalPercent.toFixed(1)}% restante
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#171a28] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[#ff2e74] to-[#ff4d88] transition-all duration-1000"
                    style={{ width: `${timeRemaining.totalPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Non-subscribed state */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col gap-2 text-center sm:text-left max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-gray-300 text-xs font-medium self-center sm:self-start">
                <AlertCircle size={13} />
                <span>Nenhuma assinatura VIP ativa</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Playfair_Display',serif]">
                Você ainda não é um Assinante VIP
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Assine agora a partir de <strong className="text-white">R$ 29,90/mês</strong> via PIX com aprovação imediata para desbloquear mais de 100 fotos e vídeos, transmissões ao vivo com chat e DMs particulares.
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => onOpenSubscribeModal('monthly')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(255,46,116,0.5)] hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Crown size={16} />
                <span>Assinar VIP via PIX</span>
                <ArrowRight size={16} />
              </button>
              <span className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Cobrança 100% segura e discreta</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: HISTÓRICO DE PAGAMENTOS */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Playfair_Display',serif] flex items-center gap-2">
              <FileText size={18} className="text-[#ff4d88]" />
              <span>Histórico de Pagamentos & Recibos</span>
            </h3>
            <p className="text-xs text-gray-400">
              Todas as transações geradas via PIX e gateway AbacatePay registradas em tempo real.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-[#10131e] border border-[#1e2337] rounded-xl overflow-x-auto scrollbar-none self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'all' ? 'bg-[#ff2e74] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Todos ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('subscription')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'subscription' ? 'bg-[#ff2e74] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Assinaturas
            </button>
            <button
              onClick={() => setFilter('ppv')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'ppv' ? 'bg-[#ff2e74] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Vídeos PPV
            </button>
            <button
              onClick={() => setFilter('tip')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'tip' ? 'bg-[#ff2e74] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Mimos
            </button>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0f111a] border border-[#1e2337] text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1b1f30] text-gray-400 flex items-center justify-center">
              <FileText size={22} />
            </div>
            <h4 className="text-sm font-bold text-white">Nenhuma transação encontrada</h4>
            <p className="text-xs text-gray-400 max-w-sm">
              Quando você realizar um pagamento de assinatura, comprar um vídeo PPV ou enviar um mimo via PIX, o comprovante aparecerá listado aqui.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTransactions.map((tx) => {
              const isPaid = tx.status === 'PAID';
              const isPending = tx.status === 'PENDING';

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#121522] border border-[#1e2337] hover:border-[#2a314d] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        tx.type === 'subscription'
                          ? 'bg-[#ff2e74]/20 text-[#ff4d88]'
                          : tx.type === 'ppv'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {tx.type === 'subscription' && <Crown size={20} />}
                      {tx.type === 'ppv' && <Film size={20} />}
                      {tx.type === 'tip' && <Gift size={20} />}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-white">{tx.title}</h4>
                        {isPaid ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            <span>Pago</span>
                          </span>
                        ) : isPending ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                            <Clock size={10} />
                            <span>Aguardando Compensação</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/30 text-red-400 text-[10px] font-bold">
                            Expirado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                        <span>ID: <strong className="font-mono text-gray-300">{tx.id}</strong></span>
                        <span>&bull;</span>
                        <span>
                          {new Date(tx.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>&bull;</span>
                        <span className="text-emerald-400 font-medium">PIX Instantâneo</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1c2032]">
                    <div className="text-left sm:text-right">
                      <span className="text-base font-extrabold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                        R$ {tx.amount.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="block text-[10px] text-gray-500">Taxa 0%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPaid ? (
                        <button
                          onClick={() => setSelectedReceiptTx(tx)}
                          className="px-3 py-1.5 rounded-xl bg-[#1a1f30] hover:bg-[#242b44] text-xs font-bold text-gray-200 hover:text-white transition-colors flex items-center gap-1.5"
                        >
                          <FileText size={13} className="text-[#ff4d88]" />
                          <span>Ver Recibo</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedPendingTx(tx)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <QrCode size={13} />
                          <span>Ver Código PIX</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: COMPROVANTE DIGITAL OFICIAL PIX */}
      {selectedReceiptTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedReceiptTx(null)}
          />

          <div className="relative w-full max-w-md bg-[#121522] border border-[#23293f] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 my-6 animate-in zoom-in-95">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-[#0d0f17] to-[#171a29] border-b border-[#20263b] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Comprovante de Pagamento PIX</h3>
                  <p className="text-xs text-gray-400">Transação liquidada com sucesso</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReceiptTx(null)}
                className="p-1.5 rounded-lg bg-[#1c2032] text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 flex flex-col gap-4 text-xs">
              {/* Value Highlight */}
              <div className="p-4 rounded-2xl bg-[#0a0c13] border border-[#1e2337] flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold">
                  Valor Transferido
                </span>
                <span className="text-3xl font-black text-emerald-400 font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
                  R$ {selectedReceiptTx.amount.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[10px] text-gray-500 mt-1">
                  Sem tarifas &bull; Liquidação instantânea pelo Banco Central
                </span>
              </div>

              {/* Data Table */}
              <div className="flex flex-col gap-2.5 divide-y divide-[#1c2032]">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-400">Beneficiário:</span>
                  <strong className="text-white font-semibold">Ruivinha VIP Oficial</strong>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-400">Item Adquirido:</span>
                  <strong className="text-white font-semibold">{selectedReceiptTx.title}</strong>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-400">Pagador:</span>
                  <span className="text-gray-300">{selectedReceiptTx.customerName}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-400">E-mail:</span>
                  <span className="text-gray-300 font-mono">{selectedReceiptTx.customerEmail}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-400">Data e Hora:</span>
                  <span className="text-gray-300">
                    {new Date(selectedReceiptTx.paidAt || selectedReceiptTx.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-400">ID da Transação:</span>
                  <span className="text-gray-300 font-mono text-[11px]">{selectedReceiptTx.id}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-400">Autenticação:</span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    {selectedReceiptTx.receiptCode || `REC-${selectedReceiptTx.id}-BCB`}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-400">Gateway:</span>
                  <span className="text-gray-300">🥑 AbacatePay Pagamentos PIX</span>
                </div>
              </div>

              <div className="mt-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
                <span>Este comprovante confirma a autenticidade e quitação deste serviço.</span>
              </div>

              <button
                onClick={() => {
                  onShowToast('Comprovante copiado para a área de transferência!');
                  setSelectedReceiptTx(null);
                }}
                className="w-full h-11 rounded-xl bg-[#1c2134] hover:bg-[#252b44] text-white font-bold text-xs transition-colors mt-2"
              >
                Concluir e Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PAGAR PIX PENDENTE */}
      {selectedPendingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedPendingTx(null)}
          />

          <div className="relative w-full max-w-md bg-[#121522] border border-[#23293f] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 my-6 animate-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-[#0d0f17] to-[#171a29] border-b border-[#20263b] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <QrCode size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Concluir Pagamento PIX</h3>
                  <p className="text-xs text-gray-400">{selectedPendingTx.title}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPendingTx(null)}
                className="p-1.5 rounded-lg bg-[#1c2032] text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center gap-4 text-center">
              <span className="text-2xl font-black text-white">
                R$ {selectedPendingTx.amount.toFixed(2).replace('.', ',')}
              </span>

              {/* QR Code */}
              <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
                {selectedPendingTx.qrCodeData ? (
                  <img
                    src={selectedPendingTx.qrCodeData}
                    alt="QR Code PIX"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode size={160} className="text-gray-900" />
                )}
              </div>

              <div className="flex flex-col gap-1 w-full text-left">
                <span className="text-[11px] text-gray-400">Código PIX Copia e Cola:</span>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={selectedPendingTx.pixCode}
                    className="w-full h-10 pl-3 pr-20 rounded-xl bg-[#090b12] border border-[#22283e] text-[10px] text-gray-300 font-mono"
                  />
                  <button
                    onClick={() => handleCopyPix(selectedPendingTx.pixCode)}
                    className="absolute right-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/30 text-amber-300 text-[11px] text-left flex items-start gap-2">
                <Clock size={15} className="shrink-0 mt-0.5 text-amber-400" />
                <span>
                  Abra o aplicativo do seu banco, escolha a opção PIX &gt; Copia e Cola ou escanear QR Code e confirme.
                </span>
              </div>

              <button
                onClick={() => {
                  onShowToast('Aguardando compensação do banco...');
                  setSelectedPendingTx(null);
                }}
                className="w-full h-11 rounded-xl bg-[#1e2337] hover:bg-[#282e49] text-white text-xs font-bold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
