import { 
  PlusCircle, 
  DollarSign, 
  Edit3, 
  Image as ImageIcon, 
  TrendingUp, 
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
  Key,
  ExternalLink,
  CheckCircle2,
  Landmark
} from 'lucide-react';
import { Post, CreatorProfile, SubscriptionPlan, AbacatePayConfig, AbacatePayTransaction, EfiBankConfig } from '../types';
import { AdminPostCreator } from './AdminPostCreator';
import { markAbacateTransactionPaid } from '../utils/abacatePay';
import { loadEfiBankConfig, getActivePaymentGateway } from '../utils/efiBank';

interface AdminDashboardTabProps {
  profile: CreatorProfile;
  posts: Post[];
  plans: SubscriptionPlan[];
  abacatePayConfig?: AbacatePayConfig;
  efiBankConfig?: EfiBankConfig;
  transactions?: AbacatePayTransaction[];
  onOpenCreatePost: () => void;
  onOpenManagePricing: () => void;
  onOpenEditProfile: () => void;
  onOpenAbacatePayConfig?: () => void;
  onPostCreated: (newPostData: Omit<Post, 'id' | 'likes' | 'commentsCount' | 'isLiked' | 'isSaved' | 'comments' | 'creatorName' | 'creatorAvatar' | 'creatorHandle' | 'isVerified'>) => void;
  onUpdateAudience: (postId: string, newType: 'public-image' | 'locked-vip' | 'ppv-video', price?: number) => void;
  onPublishScheduledNow?: (postId: string) => void;
  onUpdatePostPrice: (postId: string, newPrice: number) => void;
  onDeletePost: (postId: string) => void;
  onShowToast: (msg: string) => void;
}

export function AdminDashboardTab({
  profile,
  posts,
  plans,
  abacatePayConfig,
  efiBankConfig: propEfiConfig,
  transactions = [],
  onOpenCreatePost,
  onOpenManagePricing,
  onOpenEditProfile,
  onOpenAbacatePayConfig,
  onPostCreated,
  onUpdateAudience,
  onPublishScheduledNow,
  onUpdatePostPrice,
  onDeletePost,
  onShowToast,
}: AdminDashboardTabProps) {
  const efiConfig = propEfiConfig || loadEfiBankConfig();
  const activeGateway = getActivePaymentGateway();
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#19101d] via-[#12141e] to-[#1a0f1e] border border-[#1e2337] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,46,116,0.4)] shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-['Playfair_Display',serif]">
                Painel da Administradora
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ff2e74]/20 border border-[#ff2e74]/40 text-[#ff4d88] text-[10px] font-bold">
                Ativo
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Envie fotos ou vídeos, configure agendamentos automáticos e controle o acesso do público.
            </p>
          </div>
        </div>

        {/* Quick buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {onOpenAbacatePayConfig && (
            <button
              onClick={onOpenAbacatePayConfig}
              className="px-3.5 py-2 rounded-xl bg-[#2a170e] hover:bg-[#3d1f11] border border-[#f37021]/50 text-xs font-bold text-[#f37021] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Landmark size={14} />
              <span>Efí Bank (API Pix)</span>
            </button>
          )}
          <button
            onClick={onOpenManagePricing}
            className="px-4 py-2 rounded-xl bg-[#141722] hover:bg-[#1e2337] border border-[#242a3a] text-xs font-bold text-gray-200 transition-colors"
          >
            Alterar Preços
          </button>
          <button
            onClick={onOpenEditProfile}
            className="px-4 py-2 rounded-xl bg-[#141722] hover:bg-[#1e2337] border border-[#242a3a] text-xs font-bold text-gray-200 transition-colors"
          >
            Editar Perfil
          </button>
        </div>
      </div>

      {/* PIX KEY CONFIGURATION ALERT */}
      {(!efiConfig.isRealKeyConfigured || !efiConfig.pixKey) && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-lg animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <span>⚠️</span>
            </div>
            <div>
              <strong className="text-amber-300 font-bold text-sm block">
                Cadastre sua Chave PIX da Efí Bank
              </strong>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Para que o aplicativo de banco dos clientes encontre sua conta e processe o pagamento sem erros, cadastre sua chave da Efí (E-mail, CPF ou Celular).
              </p>
            </div>
          </div>
          {onOpenAbacatePayConfig && (
            <button
              onClick={onOpenAbacatePayConfig}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-md active:scale-98"
            >
              <span>Cadastrar Agora</span>
            </button>
          )}
        </div>
      )}

      {/* SCHEDULED ALERT BANNER (If any posts are scheduled) */}
      {scheduledCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#20101b] to-[#121422] border border-[#ff2e74]/40 flex items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff2e74]/20 text-[#ff4d88] flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <span className="text-sm font-bold text-white">
                Você tem {scheduledCount} {scheduledCount === 1 ? 'publicação agendada' : 'publicações agendadas'}
              </span>
              <p className="text-xs text-gray-400">
                Os posts agendados serão exibidos automaticamente para o público no horário programado.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#ff4d88] px-3 py-1 rounded-lg bg-[#ff2e74]/10 border border-[#ff2e74]/20">
            Fila de Agendamento Ativa
          </span>
        </div>
      )}

      {/* MAIN TOOL: Novo post no feed + Publicados (Exact Screenshot Representation) */}
      <AdminPostCreator
        posts={posts}
        onPostCreated={onPostCreated}
        onDeletePost={onDeletePost}
        onUpdateAudience={onUpdateAudience}
        onPublishScheduledNow={onPublishScheduledNow}
        onShowToast={onShowToast}
      />

      {/* Metrics Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e1017] border border-[#1e2337]">
          <div className="text-xs text-gray-400">Faturamento Mensal</div>
          <div className="text-2xl font-black text-[#34d399] mt-1">R$ 4.890,00</div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>+28% este mês</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1017] border border-[#1e2337]">
          <div className="text-xs text-gray-400">Assinantes VIP</div>
          <div className="text-2xl font-black text-white mt-1">164</div>
          <div className="text-[10px] text-gray-400 mt-1">R$ 29,90/mês</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1017] border border-[#1e2337]">
          <div className="text-xs text-gray-400">Packs & Vídeos Avulsos</div>
          <div className="text-2xl font-black text-white mt-1">87</div>
          <div className="text-[10px] text-gray-400 mt-1">Vendas avulsas</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e1017] border border-[#1e2337]">
          <div className="text-xs text-gray-400">Total de Conteúdos</div>
          <div className="text-2xl font-black text-white mt-1">{posts.length}</div>
          <div className="text-[10px] text-gray-400 mt-1">Fotos e Vídeos</div>
        </div>
      </div>

      {/* EFI BANK (GERENCIANET) PIX API GATEWAY CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1d120c] via-[#10121d] to-[#0d141f] border border-[#f37021]/40 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f37021]/20 border border-[#f37021]/40 text-[#f37021] flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(243,112,33,0.3)] shrink-0">
              <Landmark size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  Gateway Efí Bank (Gerencianet)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#f37021]/20 text-[#f37021] text-[10px] font-bold border border-[#f37021]/50">
                  {activeGateway === 'efi' ? 'GATEWAY OFICIAL ATIVO' : 'DISPONÍVEL'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-700/50">
                  {efiConfig.environment === 'production' ? 'PRODUÇÃO (BACEN)' : 'HOMOLOGAÇÃO'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Recebimento via Efí Bank com liquidação imediata e chave PIX direta na conta bancária.
              </p>
            </div>
          </div>

          {onOpenAbacatePayConfig && (
            <button
              onClick={onOpenAbacatePayConfig}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff8c42] hover:opacity-95 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(243,112,33,0.35)] flex items-center justify-center gap-2"
            >
              <Key size={14} />
              <span>Configurar Efí Bank (API & Pix)</span>
            </button>
          )}
        </div>

        {/* Credentials and Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#2a2228]">
          <div className="p-3 rounded-xl bg-[#070b10] border border-[#2a2228] flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Chave PIX da Efí
            </span>
            <span className="text-xs font-mono text-[#f37021] font-semibold mt-1 truncate">
              {efiConfig.pixKey || 'rodrigotricollo1990@gmail.com'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#070b10] border border-[#2a2228] flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Favorecido / Titular
            </span>
            <span className="text-xs font-bold text-white mt-1 truncate">
              {efiConfig.merchantName || 'RODRIGO TRICOLLO'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#070b10] border border-[#2a2228] flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Status da Conexão Efí
            </span>
            <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Pronto para Recebimentos</span>
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Plans Overview */}
      <div className="p-5 rounded-2xl bg-[#0e1017] border border-[#1e2337] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Planos de Assinatura Atuais</h3>
          <button
            onClick={onOpenManagePricing}
            className="text-xs text-[#ff2e74] hover:underline font-semibold"
          >
            Alterar Valores
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plans.map((p) => (
            <div key={p.id} className="p-3.5 rounded-xl bg-[#08090e] border border-[#1e2337] flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-white">{p.name}</span>
                <span className="text-xs text-gray-400 ml-2">({p.periodText})</span>
              </div>
              <span className="font-extrabold text-base text-[#ff2e74]">
                R$ {p.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PIX Transactions Ledger & Manual Approval (ADMIN CONTROL) */}
      <div className="p-5 rounded-2xl bg-[#0e1017] border border-[#1e2337] flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>🥑</span>
              <span>Transações &amp; Cobranças PIX (AbacatePay)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Acompanhe quem gerou PIX e aprove pagamentos manualmente se necessário.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-[#141824] border border-[#21273c] text-xs font-mono text-gray-300">
            {transactions.length} transações registradas
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#08090e] border border-[#1a1d2e] text-center text-xs text-gray-400">
            Nenhuma transação registrada no momento.
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-[#08090e] border border-[#1c2032] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-white font-medium">{tx.title}</strong>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        tx.status === 'PAID'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {tx.status === 'PAID' ? 'PAGO' : 'PENDENTE'}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    Cliente: {tx.customerName} ({tx.customerEmail}) &bull; ID: {tx.id}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-white font-mono">
                    R$ {tx.amount.toFixed(2).replace('.', ',')}
                  </span>

                  {tx.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        markAbacateTransactionPaid(tx.id);
                        tx.status = 'PAID';
                        onShowToast(`Pagamento #${tx.id} aprovado com sucesso pelo Administrador!`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 size={12} />
                      <span>Aprovar Pagamento</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
