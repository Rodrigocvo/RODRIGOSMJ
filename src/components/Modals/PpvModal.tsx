import { useState, useEffect } from 'react';
import { X, Film, CheckCircle2, ShieldCheck, QrCode, Copy, Check, AlertTriangle, RefreshCw, Landmark } from 'lucide-react';
import { Post, User, AbacatePayTransaction } from '../../types';
import { getTransactionStatus, loadAbacatePayConfig } from '../../utils/abacatePay';
import { generateUnifiedPix, loadEfiBankConfig, getActivePaymentGateway } from '../../utils/efiBank';

interface PpvModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  user?: User | null;
  onUnlockPpv: (postId: string) => void;
  onPaymentCompleted?: (tx: AbacatePayTransaction) => void;
}

export function PpvModal({
  isOpen,
  onClose,
  post,
  user,
  onUnlockPpv,
  onPaymentCompleted,
}: PpvModalProps) {
  const [currentTx, setCurrentTx] = useState<AbacatePayTransaction | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const price = post.ppvPrice || 19.90;

  useEffect(() => {
    if (isOpen && post) {
      const tx = generateUnifiedPix(
        'ppv',
        `Vídeo PPV: ${post.content.slice(0, 30) || 'Conteúdo Exclusivo'}`,
        price,
        user?.name || 'Cliente VIP',
        user?.email || 'cliente@email.com',
        { postId: post.id }
      );
      setCurrentTx(tx);
      setCopiedPix(false);
      setIsDone(false);
      setWarningMsg(null);
      setIsVerifying(false);
    }
  }, [isOpen, post, price, user]);

  if (!isOpen) return null;

  const handleCopyPix = () => {
    if (currentTx?.pixCode) {
      navigator.clipboard.writeText(currentTx.pixCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  const handleVerify = () => {
    if (!currentTx) return;
    setIsVerifying(true);
    setWarningMsg(null);

    setTimeout(() => {
      setIsVerifying(false);
      const statusTx = getTransactionStatus(currentTx.id);

      if (statusTx && statusTx.status === 'PAID') {
        setIsDone(true);
        onUnlockPpv(post.id);
        if (onPaymentCompleted) onPaymentCompleted(statusTx);
        setTimeout(() => {
          setIsDone(false);
          onClose();
        }, 2000);
      } else {
        setWarningMsg(
          `O pagamento de R$ ${price.toFixed(2).replace('.', ',')} ainda não foi compensado pelo banco. Conclua o PIX no app do seu banco e clique em verificar novamente.`
        );
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#131521] border border-[#1e2337] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 my-6 animate-in zoom-in-95">
        <div className="p-5 border-b border-[#1e2337] flex items-center justify-between bg-[#0a0b10]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Film size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white font-['Playfair_Display',serif]">Desbloquear Vídeo PPV</h3>
              <p className="text-xs text-gray-400">Acesso individual vitalício via PIX</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1a1d2e] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isDone ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="font-bold text-xl text-white font-['Playfair_Display',serif]">
                Vídeo Desbloqueado!
              </h4>
              <p className="text-xs text-gray-300 mt-1">
                Pagamento confirmado via PIX. A mídia já está disponível no seu feed.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-[#0a0b10] border border-[#1e2337] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                  Conteúdo Exclusivo
                </span>
                <h4 className="font-bold text-white text-sm line-clamp-1">
                  {post.content.slice(0, 40) || 'Vídeo Exclusivo'}
                </h4>
              </div>
              <div className="text-right">
                <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-[#ff2e74]">
                  R$ {price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[10px] text-gray-400 block">Pagamento Único</span>
              </div>
            </div>

            {/* PIX Container */}
            <div className="p-4 rounded-xl bg-[#090b12] border border-[#f37021]/30 flex flex-col items-center gap-3 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f37021]/20 border border-[#f37021]/50 text-[#f37021] text-xs font-bold">
                <Landmark size={12} />
                <span>PIX Efí Bank &bull; Liberação Segura</span>
              </div>

              <div className="w-36 h-36 bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg border border-[#f37021]/30">
                {currentTx?.qrCodeData ? (
                  <img
                    src={currentTx.qrCodeData}
                    alt="PIX QR Code Efí Bank"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode size={120} className="text-gray-900" />
                )}
              </div>

              <div className="flex flex-col gap-1 w-full text-left">
                <span className="text-[11px] text-gray-400">PIX Copia e Cola:</span>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={currentTx?.pixCode || ''}
                    className="w-full h-9 pl-3 pr-20 rounded-lg bg-[#141724] border border-[#22283e] text-[10px] text-gray-300 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="absolute right-1.5 px-2.5 py-1 rounded-md bg-[#f37021] hover:bg-[#e06115] text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    {copiedPix ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Direct PIX Key Option */}
              {(() => {
                const efiCfg = loadEfiBankConfig();
                const keyToShow = efiCfg.pixKey || 'rodrigotricollo1990@gmail.com';
                return (
                  <div className="p-3 rounded-xl bg-[#101322] border border-[#20263b] w-full flex flex-col gap-1.5 text-left">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Ou use a Chave PIX direta:</span>
                      <span className="text-[#f37021] font-bold uppercase text-[10px]">
                        {efiCfg.pixKeyType || 'E-mail'}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        readOnly
                        value={keyToShow}
                        className="w-full h-8 pl-2.5 pr-24 rounded-lg bg-[#0c0e18] border border-[#1e2337] text-xs text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(keyToShow);
                          setCopiedPix(true);
                          setTimeout(() => setCopiedPix(false), 2000);
                        }}
                        className="absolute right-1 px-2.5 py-1 rounded bg-[#1e2337] hover:bg-[#f37021] text-white text-[10px] font-bold transition-colors"
                      >
                        Copiar Chave
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                      <span>Favorecido: <strong className="text-gray-200">{efiCfg.merchantName || 'RODRIGO TRICOLLO'}</strong></span>
                      <span className="text-emerald-400 font-medium">Conta Efí Verificada</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {warningMsg && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-200 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px]">{warningMsg}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-gray-400 justify-center">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Sem cobrança recorrente &bull; 0% de taxa no PIX</span>
            </div>

            <button
              disabled={isVerifying}
              onClick={handleVerify}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Consultando compensação...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Já Fiz o PIX &bull; Verificar Pagamento</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
