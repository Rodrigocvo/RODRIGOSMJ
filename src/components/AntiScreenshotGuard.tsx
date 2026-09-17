import { useEffect, useState } from 'react';
import { ShieldAlert, Lock, AlertTriangle, EyeOff } from 'lucide-react';

interface AntiScreenshotGuardProps {
  onShowToast: (msg: string) => void;
  creatorName?: string;
  userName?: string;
}

export function AntiScreenshotGuard({
  onShowToast,
  creatorName = 'Ruivinha VIP',
  userName = 'Assinante Oficial',
}: AntiScreenshotGuardProps) {
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  useEffect(() => {
    // 1. Prevent Right-Click Context Menu on images, videos, and feed media
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'IMG' ||
        target.tagName === 'VIDEO' ||
        target.closest('.protect-content') ||
        target.closest('.media-container')
      ) {
        e.preventDefault();
        onShowToast('🛡️ Conteúdo protegido: O download e cópia de mídias deste perfil são bloqueados.');
      }
    };

    // 2. Prevent Keyboard Capture & DevTools Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('Conteúdo protegido contra cópia • Ruivinha VIP');
          }
        } catch {
          // ignore
        }
        triggerAlert('Captura de tela (PrintScreen) bloqueada! O conteúdo VIP possui proteção de direitos autorais.');
        return;
      }

      // Windows + Shift + S or Command + Shift + 3/4/5
      if (
        (e.key === 'S' || e.key === 's') &&
        (e.shiftKey && (e.metaKey || e.ctrlKey || e.altKey))
      ) {
        e.preventDefault();
        triggerAlert('Atalho de captura de tela bloqueado pela segurança do perfil VIP.');
        return;
      }

      // Ctrl + P or Command + P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        triggerAlert('A impressão desta página é estritamente proibida.');
        return;
      }

      // Ctrl + S or Command + S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        triggerAlert('O salvamento do código e mídias desta página foi desativado.');
        return;
      }

      // F12 or Inspect shortcuts
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
        onShowToast('🛡️ Modo de inspeção restrito para proteção de dados do criador.');
      }
    };

    // 3. Obscure screen when window loses focus (e.g. Snipping tool overlay or alt-tab capture)
    const handleBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleFocus = () => {
      setIsWindowBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowBlurred(true);
      } else {
        setIsWindowBlurred(false);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onShowToast]);

  const triggerAlert = (message: string) => {
    setSecurityAlert(message);
    setTimeout(() => {
      setSecurityAlert(null);
    }, 4000);
  };

  return (
    <>
      {/* Dynamic Anti-Leak Watermark Grid (subtle, translucent) */}
      <div 
        className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden opacity-[0.035] flex flex-wrap gap-24 p-8 items-center justify-around"
        aria-hidden="true"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="transform -rotate-12 text-white font-mono text-xs tracking-wider whitespace-nowrap">
            {creatorName} • {userName} • VIP ID-{Math.abs((i * 987) + 1234)} • CÓPIA PROIBIDA
          </div>
        ))}
      </div>

      {/* Obscure Overlay when window loses focus (anti-snipping tool) */}
      {isWindowBlurred && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-[#ff2e74]/20 border border-[#ff2e74]/40 text-[#ff4d88] flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(255,46,116,0.3)]">
            <EyeOff size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-['Playfair_Display',serif]">
            Conteúdo VIP Protegido
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed">
            A visualização deste perfil foi pausada temporariamente para evitar gravação de tela e prints não autorizados.
          </p>
          <span className="mt-4 text-[11px] text-[#ff4d88] font-bold px-3 py-1 rounded-full bg-[#ff2e74]/15 border border-[#ff2e74]/30">
            Clique na janela para retomar a navegação
          </span>
        </div>
      )}

      {/* Screen capture alert banner */}
      {securityAlert && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-md bg-red-950/95 border-2 border-red-500 rounded-2xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-top duration-200">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0 mt-0.5">
            <ShieldAlert size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Proteção Contra Print Ativa</span>
                <AlertTriangle size={14} className="text-amber-400" />
              </h4>
            </div>
            <p className="text-xs text-red-200 mt-1 leading-relaxed">
              {securityAlert}
            </p>
            <p className="text-[10px] text-gray-300 mt-2">
              ⚠️ Todo o conteúdo é rastreado digitalmente. O vazamento de mídias resulta em cancelamento imediato de conta sem reembolso.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
