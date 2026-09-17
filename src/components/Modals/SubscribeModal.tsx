import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, LockOpen, QrCode, CreditCard, ShieldCheck, Copy, Check, AlertTriangle, RefreshCw, Landmark } from 'lucide-react';
import { SubscriptionPlan, User, AbacatePayTransaction } from '../../types';
import { getTransactionStatus, loadAbacatePayConfig } from '../../utils/abacatePay';
import { generateUnifiedPix, loadEfiBankConfig, getActivePaymentGateway } from '../../utils/efiBank';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  onConfirmSubscription: (planId: 'monthly' | 'quarterly') => void;
  creatorName: string;
  user?: User | null;
  onPaymentCompleted?: (tx: AbacatePayTransaction) => void;
}

export function SubscribeModal({
  isOpen,
  onClose,
  plan,
  onConfirmSubscription,
  creatorName,
  user,
  onPaymentCompleted,
}: SubscribeModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [currentTx, setCurrentTx] = useState<AbacatePayTransaction | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && plan) {
      // Generate genuine PIX charge via Efí Bank / active gateway
      const tx = generateUnifiedPix(
        'subscription',
        `Assinatura VIP - ${plan.name}`,
        plan.price,
        user?.name || 'Cliente VIP',
        user?.email || 'cliente@email.com',
        { planId: plan.id }
      );
      setCurrentTx(tx);
      setCopiedPix(false);
      setIsSuccess(false);
      setVerificationError(null);
      setIsVerifying(false);
    }
  }, [isOpen, plan, user]);

  // Background polling to automatically detect if payment gets confirmed (via gateway/admin)
  useEffect(() => {
    if (isOpen && currentTx && !isSuccess) {
      pollIntervalRef.current = window.setInterval(() => {
        const latest = getTransactionStatus(currentTx.id);
        if (latest && latest.status === 'PAID') {
          setIsSuccess(true);
          onConfirmSubscription(plan.id);
          if (onPaymentCompleted) onPaymentCompleted(latest);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isOpen, currentTx, isSuccess, plan, onConfirmSubscription, onPaymentCompleted, onClose]);

  if (!isOpen) return null;

  const handleCopyPix = () => {
    if (currentTx?.pixCode) {
      navigator.clipboard.writeText(currentTx.pixCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  /**
   * Genuine payment verification.
   * Checks with transaction ledger / gateway.
   * DOES NOT grant free VIP if payment has not been received!
   */
  const handleVerifyPayment = () => {
    if (!currentTx) return;
    setIsVerifying(true);
    setVerificationError(null);

    setTimeout(() => {
      setIsVerifying(false);
      const statusTx = getTransactionStatus(currentTx.id);

      if (statusTx && statusTx.status === 'PAID') {
        setIsSuccess(true);
        onConfirmSubscription(plan.id);
        if (onPaymentCompleted) onPaymentCompleted(statusTx);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2200);
      } else {
        // Payment has NOT been confirmed yet. Keep paywall strictly locked!
        setVerificationError(
          `Pagamento de R$ ${plan.price.toFixed(2).replace('.', ',')} ainda não foi identificado pelo Banco Central ou AbacatePay. Por favor, conclua o pagamento no aplicativo do seu banco escaneando o QR Code ou utilizando o PIX Copia e Cola e tente novamente.`
        );
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#131521] border border-[#1e2337] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 my-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-[#1e2337] flex items-center justify-between bg-[#0a0b10]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ff2e74]/15 text-[#ff2e74] flex items-center justify-center">
              <LockOpen size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white font-['Playfair_Display',serif]">Assinar {plan.name}</h3>
              <p className="text-xs text-gray-400">Criadora: {creatorName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1a1d2e] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="font-['Playfair_Display',serif] font-bold text-xl text-white">
                Pagamento Confirmado via PIX!
              </h4>
              <p className="text-xs text-gray-300 mt-1">
                Sua assinatura VIP foi ativada com sucesso! O acesso a todos os ensaios, lives e conteúdos está 100% liberado.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-[#0a0b10] border border-[#1e2337] flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Valor da Assinatura
                </span>
                <div className="text-sm font-semibold text-white">{plan.name}</div>
              </div>
              <div className="text-right">
                <span className="font-['Playfair_Display',serif] font-extrabold text-2xl text-[#ff2e74]">
                  {plan.priceFormatted}
                </span>
                <span className="text-xs text-gray-400 block">{plan.periodText}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Forma de Pagamento
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'pix'
                      ? 'bg-[#1a1d2e] border-emerald-500 text-emerald-400 shadow-sm'
                      : 'bg-[#0a0b10] border-[#1e2337] text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🥑</span>
                  <span>PIX (Instantâneo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-[#1a1d2e] border-[#ff2e74] text-white shadow-sm'
                      : 'bg-[#0a0b10] border-[#1e2337] text-gray-400 hover:text-white'
                  }`}
                >
                  <CreditCard size={16} className="text-[#ff4d88]" />
                  <span>Cartão de Crédito</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'pix' ? (
              <div className="p-4 rounded-xl bg-[#090b12] border border-[#f37021]/30 flex flex-col items-center gap-3 text-center">
                {/* Efí Bank Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f37021]/20 border border-[#f37021]/50 text-[#f37021] text-xs font-bold">
                  <Landmark size={14} />
                  <span>PIX Oficial Banco Central &bull; Efí Bank</span>
                </div>

                {/* QR Code Container */}
                <div className="w-40 h-40 bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg border border-[#f37021]/30">
                  {currentTx?.qrCodeData ? (
                    <img
                      src={currentTx.qrCodeData}
                      alt="PIX QR Code Efí Bank"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrCode size={130} className="text-gray-900" />
                  )}
                </div>

                <div className="flex flex-col gap-1 w-full text-left">
                  <span className="text-[11px] text-gray-400">
                    Abra o app do seu banco e escaneie ou cole o código PIX:
                  </span>
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
                        <span className="text-gray-400">Ou transfira para a Chave PIX:</span>
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

                <div className="text-[10px] text-gray-400 flex items-center justify-between w-full px-1">
                  <span>ID: <strong className="font-mono text-gray-300">{currentTx?.id}</strong></span>
                  <span className="text-[#f37021] font-medium">● Expira em 15 min</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#0a0b10] border border-[#1e2337] flex flex-col gap-2.5 text-xs">
                <label className="text-[11px] text-gray-400">Dados do Cartão:</label>
                <input
                  type="text"
                  placeholder="Número do Cartão: 4532 •••• •••• 8921"
                  className="w-full h-9 px-3 rounded-lg bg-[#131521] border border-[#1e2337] text-gray-300 text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="h-9 px-3 rounded-lg bg-[#131521] border border-[#1e2337] text-gray-300 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    className="h-9 px-3 rounded-lg bg-[#131521] border border-[#1e2337] text-gray-300 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Error / Warning Alert if user clicks without actually paying */}
            {verificationError && (
              <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <strong className="font-bold text-amber-300">Pagamento Não Confirmado</strong>
                  <p className="text-[11px] leading-relaxed text-amber-200/90">{verificationError}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-gray-400 justify-center">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Liberação automatizada via PIX &bull; 0% de taxa</span>
            </div>

            {/* Verification Button (No free bypass!) */}
            <button
              disabled={isVerifying}
              onClick={handleVerifyPayment}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(16,185,129,0.45)] hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Consultando compensação no banco...</span>
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
