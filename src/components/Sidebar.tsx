import { 
  Compass, 
  MessageSquare, 
  Bell, 
  Bookmark, 
  CreditCard, 
  Coins, 
  Settings, 
  Flame,
  X,
  ShieldAlert,
  Sparkles,
  DollarSign,
  ShoppingBag,
  UserCheck,
  Radio
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectNav: (nav: string) => void;
  userTokens: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenImagesModal?: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenCreatePost: () => void;
  onOpenManagePricing: () => void;
  onOpenEditProfile: () => void;
  user?: User | null;
}

export function Sidebar({
  currentTab,
  onSelectNav,
  userTokens,
  isOpenMobile,
  onCloseMobile,
  onOpenImagesModal,
  isAdmin,
  onToggleAdmin,
  onOpenCreatePost,
  onOpenManagePricing,
  onOpenEditProfile,
  user,
}: SidebarProps) {
  const navItems = [
    { id: 'inicio', label: 'Feed do Perfil', icon: Compass },
    { id: 'lives', label: 'Lives Interativas', icon: Radio, badge: 'AO VIVO' },
    { id: 'loja', label: 'Loja de Conteúdos (PPV)', icon: ShoppingBag, badge: 'Vendas' },
    { id: 'mensagens', label: 'Mensagens Privadas', icon: MessageSquare, badge: 'VIP' },
    { id: 'assinatura', label: 'Minha Assinatura', icon: CreditCard },
    { id: 'perfil', label: 'Perfil da Criadora', icon: UserCheck },
    ...(isAdmin ? [{ id: 'admin', label: 'Painel Administrador', icon: ShieldAlert, badge: 'ADM' }] : []),
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-5 sm:p-6 text-[#e1e2eb]">
      {/* Brand & Logo */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 px-1 cursor-pointer" 
            onClick={() => onSelectNav('explorar-criadores')}
          >
            {/* Privacy Emblem */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff4438] via-[#ff5a36] to-[#ff7a59] flex items-center justify-center shadow-[0_0_18px_rgba(255,68,56,0.45)]">
              <span className="font-extrabold text-white text-xl tracking-tighter">P</span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl tracking-tight text-white leading-none">
                privacy<span className="text-[#ff4438]">.</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff7a59]">
                Creator Platform
              </span>
            </div>
          </div>

          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-lg bg-[#191e2b] text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Administrator Quick Switch Banner */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          isAdmin
            ? 'bg-emerald-950/40 border-emerald-500/30'
            : 'bg-[#141721] border-[#242a3a]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {isAdmin ? (
                <UserCheck size={16} className="text-emerald-400" />
              ) : (
                <ShieldAlert size={16} className="text-[#ff4438]" />
              )}
              <span className="text-xs font-bold text-white">
                {isAdmin ? 'Modo Administrador' : 'Acesso Administrador'}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isAdmin ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-gray-400'
            }`}>
              {isAdmin ? 'ATIVO' : 'CLIENTE'}
            </span>
          </div>

          <button
            onClick={onToggleAdmin}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isAdmin
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                : 'bg-gradient-to-r from-[#ff4438] to-[#ff6b4a] text-white hover:opacity-95 shadow-[0_2px_10px_rgba(255,68,56,0.3)]'
            }`}
          >
            <span>{isAdmin ? 'Mudar para Visão de Cliente' : 'Entrar como Administrador'}</span>
          </button>

          {/* Admin Management Shortcuts */}
          {isAdmin && (
            <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-emerald-500/20">
              <button
                onClick={onOpenCreatePost}
                className="py-1.5 px-2 rounded bg-black/40 hover:bg-[#ff4438] text-[11px] font-semibold text-white transition-colors flex items-center justify-center gap-1"
              >
                <Sparkles size={12} />
                <span>+ Postar</span>
              </button>
              <button
                onClick={onOpenManagePricing}
                className="py-1.5 px-2 rounded bg-black/40 hover:bg-[#ff4438] text-[11px] font-semibold text-white transition-colors flex items-center justify-center gap-1"
              >
                <DollarSign size={12} />
                <span>Preços</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectNav(item.id);
                  if (isOpenMobile) onCloseMobile();
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#ff4438] to-[#ff6b4a] text-white font-semibold shadow-[0_4px_16px_rgba(255,68,56,0.35)]'
                    : 'text-[#9ca3af] hover:bg-[#141721] hover:text-[#e1e2eb]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isCurrent ? 'text-white' : 'text-[#9ca3af]'} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-[#ff4438]/20 text-[#ff7a59]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info: User Profile & Balance */}
      <div className="flex flex-col gap-3 pt-4">
        {/* Balance Card */}
        <div className="bg-[#141721] p-3.5 rounded-xl border border-[#242a3a] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#ff7a59]">
              <Coins size={16} />
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Saldo na Carteira
              </span>
            </div>
            <span className="text-sm font-bold text-white">
              R$ {(userTokens / 10).toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* User Strip */}
          <div className="flex items-center justify-between pt-2 border-t border-[#242a3a]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff1a66] to-[#ff4d88] flex items-center justify-center text-white font-bold text-xs">
                {user ? user.name.slice(0, 1).toUpperCase() : (isAdmin ? 'A' : 'V')}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white leading-tight">
                  {user ? user.name : (isAdmin ? 'Administrador' : 'Assinante VIP')}
                </span>
                <span className="text-[11px] text-gray-400">
                  {user ? user.email : (isAdmin ? '@criadora.vip' : 'Conta Ativa')}
                </span>
              </div>
            </div>
            {isAdmin ? (
              <button
                onClick={onOpenEditProfile}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#191e2b] transition-colors"
                title="Editar perfil do criador"
              >
                <Settings size={16} />
              </button>
            ) : (
              <button
                onClick={() => onSelectNav('assinatura')}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#191e2b] transition-colors"
                title="Minha Assinatura"
              >
                <Settings size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-72 bg-[#0e1015] border-r border-[#242a3a] z-50">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#0e1015] h-full shadow-2xl border-r border-[#242a3a] z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
