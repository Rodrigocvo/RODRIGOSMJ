import { useState, useRef, useEffect, FormEvent } from 'react';
import { 
  User as UserIcon, 
  Crown, 
  Coins, 
  ShoppingBag, 
  LogOut, 
  ChevronDown, 
  CheckCircle2, 
  CreditCard, 
  Settings, 
  Sparkles,
  ShieldCheck,
  Zap,
  Gift
} from 'lucide-react';
import { User } from '../types';

interface UserMenuProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSubscribe: () => void;
  onOpenTipModal: () => void;
  onOpenAbacatePayConfig?: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onShowToast: (msg: string) => void;
  onSelectNav?: (nav: string) => void;
}

export function UserMenu({
  user,
  onOpenAuth,
  onLogout,
  onOpenSubscribe,
  onOpenTipModal,
  onOpenAbacatePayConfig,
  isAdmin,
  onToggleAdmin,
  onShowToast,
  onSelectNav,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatarUrl || '');

  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] hover:opacity-90 text-white text-xs font-bold shadow-[0_0_12px_rgba(255,46,116,0.35)] transition-all flex items-center gap-1.5"
      >
        <UserIcon size={14} />
        <span>Entrar</span>
      </button>
    );
  }

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    if (user) {
      user.name = editName;
      if (editAvatar) user.avatarUrl = editAvatar;
      onShowToast('Seus dados foram atualizados com sucesso!');
      setIsEditingProfile(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-[#141724] border border-[#23283c] hover:border-[#ff2e74]/50 transition-all text-left group"
      >
        <div className="relative">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={user.name}
            className="w-7 h-7 rounded-full object-cover border border-[#ff2e74]/40"
          />
          {user.isVip && (
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ff2e74] text-white flex items-center justify-center text-[8px] font-black shadow-sm">
              ★
            </span>
          )}
        </div>

        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-xs font-bold text-white group-hover:text-[#ff4d88] transition-colors truncate max-w-[100px]">
            {user.name.split(' ')[0]}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            {user.isVip ? 'VIP Ativo' : 'Membro'}
          </span>
        </div>

        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-white' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-84 bg-[#121522] border border-[#22283e] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
          {/* Header Card */}
          <div className="p-4 bg-gradient-to-br from-[#1b1e2f] to-[#0f111a] border-b border-[#22283e]">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#ff2e74] shadow-[0_0_12px_rgba(255,46,116,0.4)]"
              />
              <div className="overflow-hidden flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-white truncate">{user.name}</h4>
                  {user.isVip ? (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#ff2e74]/20 border border-[#ff2e74]/40 text-[#ff4d88] text-[9px] font-extrabold tracking-wider uppercase">
                      VIP
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-300 text-[9px] font-bold tracking-wider uppercase">
                      Grátis
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                {user.phone && (
                  <p className="text-[11px] text-gray-500 truncate">{user.phone}</p>
                )}
              </div>
            </div>

            {/* VIP Status or Quick Tip Card */}
            <div className="mt-3 p-2.5 rounded-xl bg-[#090b12] border border-[#22283e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#ff2e74]/20 text-[#ff4d88] flex items-center justify-center">
                  <Heart size={14} className="fill-[#ff2e74]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                    Mimos &amp; Gorjetas
                  </span>
                  <span className="text-xs font-bold text-gray-200">
                    Efí Bank PIX Direto
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenTipModal();
                }}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#ff1a66] to-[#ff4d88] hover:opacity-90 text-[11px] font-bold text-white transition-opacity flex items-center gap-1 shadow-sm"
              >
                <Gift size={12} />
                <span>Enviar Gorjeta</span>
              </button>
            </div>
          </div>

          {/* Edit Profile inline drawer */}
          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="p-4 flex flex-col gap-3 bg-[#0e101a]">
              <span className="text-xs font-bold text-white">Editar Meus Dados</span>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Nome:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-8 px-2.5 rounded-lg bg-[#141724] border border-[#24293c] text-xs text-white"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Foto Avatar (URL):</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://..."
                  className="h-8 px-2.5 rounded-lg bg-[#141724] border border-[#24293c] text-xs text-white"
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg bg-[#ff2e74] text-white text-xs font-bold"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="py-1.5 px-3 rounded-lg bg-[#1f2335] text-gray-300 text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            /* Menu Item List */
            <div className="p-2 flex flex-col gap-0.5">
              {/* VIP Subscription Info / Action */}
              <div className="p-2 rounded-xl hover:bg-[#181b2a] transition-colors flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user.isVip ? 'bg-[#ff2e74]/20 text-[#ff4d88]' : 'bg-gray-800 text-gray-400'}`}>
                    <Crown size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {user.isVip ? 'Assinatura VIP Ativa' : 'Plano Gratuito'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {user.isVip ? 'Acesso total liberado' : 'Assine para ver 100%'}
                    </span>
                  </div>
                </div>

                {!user.isVip ? (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenSubscribe();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#ff1a66] to-[#ff4d88] text-white text-[11px] font-bold shadow-sm"
                  >
                    Virar VIP
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Ativo</span>
                  </span>
                )}
              </div>

              {/* Minhas Mídias / Conteúdos Desbloqueados */}
              <div className="p-2 rounded-xl hover:bg-[#181b2a] transition-colors flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Mídias Desbloqueadas
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {user.unlockedPostIds.length} vídeos e packs liberados
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#1b1f30] text-gray-300 text-[10px] font-bold">
                  {user.unlockedPostIds.length}
                </span>
              </div>

              {/* Minha Assinatura e Recibos */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onSelectNav) onSelectNav('assinatura');
                }}
                className="w-full p-2 rounded-xl hover:bg-[#181b2a] transition-colors flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-[#ff4d88] flex items-center justify-center">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-[#ff4d88] transition-colors">
                      Minha Assinatura &amp; Recibos
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Tempo restante e comprovantes PIX
                    </span>
                  </div>
                </div>
              </button>

              {/* Efí Bank Payment Gateway Status (ADMIN ONLY) */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onOpenAbacatePayConfig) onOpenAbacatePayConfig();
                  }}
                  className="w-full p-2 rounded-xl hover:bg-[#181b2a] transition-colors flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                      Efí
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-emerald-400 transition-colors">
                        Gateway Efí Bank PIX
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Chave e credenciais oficiais
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                    Ativo
                  </span>
                </button>
              )}

              {/* Admin Panel Quick Link (ADMIN ONLY) */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onSelectNav) onSelectNav('admin');
                  }}
                  className="w-full p-2 rounded-xl hover:bg-[#181b2a] transition-colors flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#ff2e74]/20 text-[#ff4d88] flex items-center justify-center">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-[#ff4d88] transition-colors">
                        Painel do Administrador
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Gerenciar assinantes e receitas
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#ff4d88] font-semibold px-2 py-0.5 rounded bg-[#ff2e74]/15 border border-[#ff2e74]/30">
                    ADM
                  </span>
                </button>
              )}

              {/* Edit Profile Button */}
              <button
                onClick={() => setIsEditingProfile(true)}
                className="w-full p-2 rounded-xl hover:bg-[#181b2a] transition-colors flex items-center gap-2.5 text-left text-gray-300 hover:text-white"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Settings size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold block">Editar Meus Dados</span>
                  <span className="text-[10px] text-gray-400">Nome e foto de exibição</span>
                </div>
              </button>
            </div>
          )}

          {/* Footer with Logout and Role actions */}
          <div className="p-2.5 bg-[#090a10] border-t border-[#1e2337] flex items-center justify-between">
            {isAdmin ? (
              <span className="text-[11px] text-[#ff4d88] font-bold flex items-center gap-1">
                <ShieldCheck size={12} />
                <span>Rodrigo (Admin Conectado)</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAuth();
                }}
                className="text-[11px] text-gray-400 hover:text-[#ff4d88] transition-colors font-medium flex items-center gap-1"
                title="Acessar com login e senha de Administrador"
              >
                <ShieldCheck size={12} className="text-gray-400" />
                <span>Área Restrita (ADM)</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut size={13} />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
