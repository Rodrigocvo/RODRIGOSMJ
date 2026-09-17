import { useState, FormEvent, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  ShieldCheck, 
  Crown, 
  LogIn, 
  UserPlus, 
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User } from '../../types';
import { 
  ADMIN_USER, 
  getRegisteredUsers, 
  saveRegisteredUsers, 
  verifyAdminCredentials,
  saveUserPassword,
  getUserPassword
} from '../../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'admin';
  onSuccess?: (user: User) => void;
  onLoginSuccess?: (user: User) => void;
  onShowToast?: (msg: string) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialTab = 'login',
  onSuccess,
  onLoginSuccess,
  onShowToast = () => {},
}: AuthModalProps) {
  const handleSuccess = (user: User) => {
    if (onSuccess) onSuccess(user);
    if (onLoginSuccess) onLoginSuccess(user);
  };

  const [tab, setTab] = useState<'login' | 'register' | 'admin' | 'forgot'>(initialTab);
  
  // Admin fields
  const [adminLogin, setAdminLogin] = useState('rodrigotricollo1990@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  // Forgot password field
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
      setAdminPassword('');
      setLoginPassword('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Submit Admin Login
  const handleAdminSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const isValid = verifyAdminCredentials(adminLogin, adminPassword);

      if (isValid) {
        handleSuccess(ADMIN_USER);
        onShowToast('Autenticado como Administrador com sucesso! Bem-vindo, Rodrigo.');
        onClose();
      } else {
        setError('Login ou senha de Administrador inválidos. Digite sua senha correta (padrão: adm123456).');
      }
    }, 450);
  };

  // Submit Subscriber Login
  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // If user typed the admin email here, check admin credentials
    if (verifyAdminCredentials(loginEmail, loginPassword)) {
      handleSuccess(ADMIN_USER);
      onShowToast('Bem-vindo de volta, Administrador Rodrigo!');
      onClose();
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const allUsers = getRegisteredUsers();
      const found = allUsers.find(
        (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
      );

      if (found) {
        handleSuccess(found);
        onShowToast(`Bem-vindo de volta, ${found.name}!`);
        onClose();
      } else {
        // Create new subscriber user
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: loginEmail.split('@')[0] || 'Novo Membro',
          email: loginEmail.trim(),
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          isVip: false,
          role: 'user',
          unlockedPostIds: [],
          tipsSentTotal: 0,
          createdAt: new Date().toISOString(),
        };
        const updated = [...allUsers, newUser];
        saveRegisteredUsers(updated);
        saveUserPassword(loginEmail, loginPassword);
        handleSuccess(newUser);
        onShowToast(`Conta criada com sucesso! Bem-vindo, ${newUser.name}.`);
        onClose();
      }
    }, 450);
  };

  // Submit Subscriber Registration
  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setError('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const allUsers = getRegisteredUsers();
      const existing = allUsers.find(
        (u) => u.email.toLowerCase() === registerEmail.trim().toLowerCase()
      );

      if (existing) {
        setError('Este e-mail já está cadastrado. Tente fazer login.');
        return;
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: registerName.trim(),
        email: registerEmail.trim(),
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(registerName)}`,
        phone: registerPhone.trim() || undefined,
        isVip: false,
        role: 'user',
        unlockedPostIds: [],
        tipsSentTotal: 0,
        createdAt: new Date().toISOString(),
      };

      saveRegisteredUsers([...allUsers, newUser]);
      saveUserPassword(registerEmail, registerPassword);
      handleSuccess(newUser);
      onShowToast(`Conta criada com sucesso! Bem-vindo(a), ${newUser.name}.`);
      onClose();
    }, 500);
  };

  const handleForgotSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotSent(true);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-md bg-[#12141e] border border-[#22273d] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1e2337] flex items-center justify-between bg-[#0a0c14]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${
              tab === 'admin' 
                ? 'bg-gradient-to-tr from-[#ff4d88] to-[#ff2e74] shadow-[0_0_15px_rgba(255,46,116,0.4)]' 
                : 'bg-gradient-to-tr from-[#ff1a66] to-[#ff4d88]'
            }`}>
              {tab === 'admin' ? <KeyRound size={20} /> : <Crown size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white font-['Playfair_Display',serif]">
                {tab === 'admin' ? 'Acesso Restrito do Administrador' : 'Acesse o Ruivinha VIP'}
              </h3>
              <p className="text-xs text-gray-400">
                {tab === 'admin' 
                  ? 'Painel de controle exclusivo do criador' 
                  : 'Entre para assinar e desfrutar do conteúdo'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1a1d2e] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher - 3 distinct options */}
        <div className="grid grid-cols-3 p-1.5 bg-[#090b12] border-b border-[#1e2337] gap-1">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              tab === 'login'
                ? 'bg-[#181b2a] text-[#ff4d88] shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <LogIn size={13} />
            <span>Assinante</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              tab === 'register'
                ? 'bg-[#181b2a] text-[#ff4d88] shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <UserPlus size={13} />
            <span>Cadastrar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('admin');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              tab === 'admin'
                ? 'bg-[#ff2e74]/20 text-[#ff2e74] border border-[#ff2e74]/40 shadow-sm'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <KeyRound size={13} />
            <span>Sou ADM</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center gap-2 text-red-300 text-xs">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* TAB 1: ADMIN LOGIN */}
          {tab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="flex flex-col gap-3.5">
              {/* Security info box */}
              <div className="p-3.5 rounded-2xl bg-[#1b1720] border border-[#ff2e74]/30 text-xs flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[#ff4d88] font-bold">
                  <ShieldCheck size={16} />
                  <span>Área Exclusiva de Administração</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  Digite seu usuário e senha de ADM para gerenciar publicações, valores dos planos e pagamentos Efí Bank.
                </p>
                <div className="mt-1 pt-1.5 border-t border-[#ff2e74]/20 text-[11px] text-gray-400 flex flex-col gap-0.5 font-mono">
                  <span>Login: <strong className="text-white">rodrigotricollo1990@gmail.com</strong> (ou <strong className="text-white">admin</strong>)</span>
                  <span>Senha: <strong className="text-white">adm123456</strong></span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Mail size={13} className="text-[#ff4d88]" />
                  <span>Login / E-mail do Administrador</span>
                </label>
                <input
                  type="text"
                  value={adminLogin}
                  onChange={(e) => setAdminLogin(e.target.value)}
                  placeholder="rodrigotricollo1990@gmail.com ou admin"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#090b12] border border-[#22273d] text-sm text-white focus:outline-none focus:border-[#ff4d88]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Lock size={13} className="text-[#ff4d88]" />
                  <span>Senha de Administrador</span>
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Digite sua senha de adm"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#090b12] border border-[#22273d] text-sm text-white focus:outline-none focus:border-[#ff4d88]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-1 rounded-xl bg-gradient-to-r from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] text-white font-bold text-sm shadow-[0_0_16px_rgba(255,46,116,0.4)] hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verificando credenciais...</span>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Entrar no Painel ADM</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: SUBSCRIBER LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Mail size={13} className="text-[#ff4d88]" />
                  <span>E-mail do Assinante</span>
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ex: seuemail@gmail.com"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#090b12] border border-[#22273d] text-sm text-white focus:outline-none focus:border-[#ff4d88]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Lock size={13} className="text-[#ff4d88]" />
                    <span>Senha de Acesso</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] text-[#ff4d88] hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#090b12] border border-[#22273d] text-sm text-white focus:outline-none focus:border-[#ff4d88]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-1 rounded-xl bg-gradient-to-r from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] text-white font-bold text-sm shadow-[0_0_15px_rgba(255,46,116,0.35)] hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Entrando na plataforma...</span>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Entrar no Cantinho VIP</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <UserIcon size={13} className="text-[#ff4d88]" />
                  <span>Nome ou Apelido</span>
                </label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Como quer ser chamado(a)?"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#090b12] border border-[#22273d] text-sm text-white focus:outline-none focus:border-[#ff4d88]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Mail size={13} className="text-[#ff4d88]" />
                  <span>Seu E-mail</span>
                </label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="seuemail@gmail.com"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#090b12] border border-[#22273d] text-sm text-white focus:outline-none focus:border-[#ff4d88]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Lock size={13} className="text-[#ff4d88]" />
                    <span>Criar Senha</span>
                  </label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full h-10 px-3 rounded-xl bg-[#090b12] border border-[#22273d] text-sm text-white focus:outline-none focus:border-[#ff4d88]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Phone size={13} className="text-[#ff4d88]" />
                    <span>WhatsApp (Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full h-10 px-3 rounded-xl bg-[#090b12] border border-[#22273d] text-sm text-white focus:outline-none focus:border-[#ff4d88]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-1 rounded-xl bg-gradient-to-r from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] text-white font-bold text-sm shadow-[0_0_15px_rgba(255,46,116,0.35)] hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Criando sua conta...</span>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Criar Conta de Assinante</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 4: FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <div className="flex flex-col gap-3">
              {forgotSent ? (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-center flex flex-col items-center gap-2">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                  <span className="text-sm font-bold text-white">Instruções enviadas!</span>
                  <p className="text-xs text-gray-300">
                    Enviamos um link para redefinição de senha para o e-mail informado.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setForgotSent(false);
                    }}
                    className="mt-2 text-xs text-[#ff4d88] hover:underline font-bold"
                  >
                    Voltar ao login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="flex flex-col gap-3">
                  <p className="text-xs text-gray-400">
                    Digite seu e-mail cadastrado para receber um código de recuperação imediato.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-300">E-mail Cadastrado</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="seuemail@gmail.com"
                      className="w-full h-10 px-3.5 rounded-xl bg-[#090b12] border border-[#22273d] text-sm text-white focus:outline-none focus:border-[#ff4d88]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 rounded-xl bg-[#ff2e74] text-white font-bold text-xs hover:bg-[#ff1a66] transition-colors"
                  >
                    {isLoading ? 'Enviando...' : 'Recuperar Senha'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="text-xs text-gray-400 hover:text-white text-center mt-1"
                  >
                    Voltar ao Login
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="p-3 bg-[#08090f] border-t border-[#181b28] flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Acesso seguro com autenticação protegida e pagamentos Efí Bank PIX</span>
        </div>
      </div>
    </div>
  );
}

