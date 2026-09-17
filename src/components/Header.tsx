import { Lock, Check, Sparkles, Image as ImageIcon, Key } from 'lucide-react';
import { User } from '../types';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  currentNav: string;
  onSelectNav: (nav: string) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  isSubscribed?: boolean;
  onToggleSubscribe?: () => void;
  onOpenCreatePost: () => void;
  onOpenManagePricing?: () => void;
  onOpenEditProfile?: () => void;
  onOpenAuth?: () => void;
  onOpenAbacatePayConfig?: () => void;
  onOpenTipModal?: () => void;
  user: User | null;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
}

export function Header({
  currentNav,
  onSelectNav,
  isAdmin,
  onToggleAdmin,
  isSubscribed,
  onToggleSubscribe,
  onOpenCreatePost,
  onOpenAuth = () => {},
  onOpenAbacatePayConfig = () => {},
  onOpenTipModal = () => {},
  user,
  onLogout,
  onShowToast,
}: HeaderProps) {
  const tabs = [
    { id: 'inicio', label: 'Início' },
    { id: 'lives', label: 'Lives' },
    { id: 'loja', label: 'Loja' },
    { id: 'mensagens', label: 'Mensagens VIP' },
    { id: 'assinatura', label: 'Minha Assinatura' },
    { id: 'perfil', label: 'Perfil' },
    ...(isAdmin ? [{ id: 'admin', label: 'Painel Admin' }] : []),
  ];

  return (
    <header className="w-full bg-[#0a0b10] border-b border-[#181b28] sticky top-0 z-40">
      {/* Main Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo matching Ruivinha VIP */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => onSelectNav('inicio')}
        >
          {/* Circular badge with vibrant pink */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] flex items-center justify-center shadow-[0_0_14px_rgba(255,46,116,0.65)] text-white font-black text-sm">
            <span>R</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-0.5 leading-none">
              <span className="font-extrabold text-lg text-white tracking-tight">Ruivinha</span>
              <span className="font-extrabold text-lg text-[#ff2e74] tracking-tight">vip</span>
            </div>
            <span className="text-[8px] font-bold tracking-widest text-gray-400 uppercase mt-0.5">
              EXCLUSIVO • SEM TAXAS
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Efí Bank PIX Oficial status pill (ONLY VISIBLE TO LOGGED-IN ADMIN) */}
          {isAdmin && (
            <button
              onClick={onOpenAbacatePayConfig}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#072418] hover:bg-[#0c3323] border border-[#135839] text-[#34d399] text-xs font-semibold shadow-inner transition-colors"
              title="Configurar Chave PIX e Credenciais Efí Bank (Acesso Administrador)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Efí Bank PIX</span>
            </button>
          )}

          {/* User Menu / Login Dropdown */}
          <UserMenu
            user={user}
            onOpenAuth={onOpenAuth}
            onLogout={onLogout}
            onOpenSubscribe={onToggleSubscribe || (() => {})}
            onOpenTipModal={onOpenTipModal}
            onOpenAbacatePayConfig={onOpenAbacatePayConfig}
            isAdmin={isAdmin}
            onToggleAdmin={onToggleAdmin}
            onShowToast={onShowToast}
            onSelectNav={onSelectNav}
          />

          {/* Admin badge and Quick Post button (ONLY WHEN LOGGED IN AS ADMIN) */}
          {isAdmin && (
            <>
              <div 
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff2e74]/15 border border-[#ff2e74]/40 text-[#ff4d88] text-xs font-bold shadow-sm"
                title="Conectado com credenciais de Administrador"
              >
                <Lock size={12} className="text-[#ff2e74]" />
                <span>Painel ADM</span>
              </div>

              <button
                onClick={onOpenCreatePost}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff2e74] hover:bg-[#ff1a66] text-white text-xs font-bold shadow-[0_0_12px_rgba(255,46,116,0.4)] transition-all active:scale-95"
                title="Criar nova publicação exclusiva"
              >
                <Sparkles size={12} />
                <span>Postar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar matching the screenshot */}
      <div className="border-t border-[#161826]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = currentNav === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectNav(tab.id)}
                className={`py-3 text-sm transition-all whitespace-nowrap relative ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-gray-400 hover:text-gray-200 font-medium'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff2e74] shadow-[0_0_8px_rgba(255,46,116,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
