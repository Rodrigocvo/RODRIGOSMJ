import { useState, FormEvent, useEffect } from 'react';
import { X, Gift, Heart, Copy, Check, CheckCircle2, QrCode, ShieldCheck, Sparkles, RefreshCw, AlertCircle, Landmark } from 'lucide-react';
import { User, AbacatePayTransaction } from '../../types';
import { markAbacateTransactionPaid, getTransactionStatus } from '../../utils/abacatePay';
import { generateUnifiedPix, loadEfiBankConfig, getActivePaymentGateway } from '../../utils/efiBank';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  userTokens?: number;
  user?: User | null;
  onCompleteTip: (amount: number, message: string, tx?: AbacatePayTransaction) => void;
}

export function TipModal({
  isOpen,
  onClose,
  creatorName,
  user,
  onCompleteTip,
}: TipModalProps) {
  const [amount, setAmount] = useState<number>(30);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('Parabéns pelo conteúdo maravilhoso! Você arrasa muito ❤️');
  const [step, setStep] = useState<'form' | 'pix' | 'success'>('form');
  const [currentTx, setCurrentTx] = useState<AbacatePayTransaction | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setCopiedPix(false);
      setIsProcessing(false);
      setCurrentTx(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const presets = [15, 30, 50, 100];
  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleGeneratePix = (e: FormEvent) => {
    e.preventDefault();
    if (effectiveAmount <= 0) return;

    // Generate real PIX transaction via Efí Bank / active gateway
    const tx = generateUnifiedPix(
      'tip',
      `Mimo Especial para ${creatorName}`,
      effectiveAmount,
      user?.name || 'Fã VIP',
      user?.email || 'fa.vip@email.com'
    );

    setCurrentTx(tx);
    setStep('pix');
  };

  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const handleCopyPix = () => {
    if (currentTx?.pixCode) {
      navigator.clipboard.writeText(currentTx.pixCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  const handleConfirmPaid = () => {
    if (!currentTx) return;
    setIsProcessing(true);
    setWarningMsg(null);
    setTimeout(() => {
      setIsProcessing(false);
      const statusTx = getTransactionStatus(currentTx.id);
      if (statusTx && statusTx.status === 'PAID') {
        setStep('success');
        onCompleteTip(effectiveAmount, message, statusTx);
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setWarningMsg(
          `Pagamento de R$ ${effectiveAmount.toFixed(2).replace('.', ',')} ainda não foi identificado. Conclua a transferência no app do seu banco e clique em verificar novamente.`
        );
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#131521] border border-[#1e2337] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 my-6">
        {/* Header */}
        <div className="p-5 border-b border-[#1e2337] flex items-center justify-between bg-[#0a0b10]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] text-white flex items-center justify-center shadow-[0_0_15px_rgba(255,46,116,0.35)]">
              <Gift size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base text-white font-['Playfair_Display',serif]">Enviar Mimo</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#f37021]/20 border border-[#f37021]/50 text-[9px] font-bold text-[#f37021] flex items-center gap-1">
                  <Landmark size={10} />
                  <span>Efí Bank PIX</span>
                </span>
              </div>
              <p className="text-xs text-gray-400">Para {creatorName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1c2032] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: Choose Amount & Message */}
        {step === 'form' && (
          <form onSubmit={handleGeneratePix} className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Selecione o valor do mimo:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {presets.map((val) => {
                  const isSelected = !customAmount && amount === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setCustomAmount('');
                        setAmount(val);
                      }}
                      className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                        isSelected
                          ? 'bg-[#ff2e74] text-white border-[#ff2e74] shadow-[0_0_12px_rgba(255,46,116,0.4)]'
                          : 'bg-[#0b0e14] text-gray-300 border-[#22283d] hover:bg-[#1a1e30]'
                      }`}
                    >
                      R$ {val}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1">
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="Ou digite outro valor (R$)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0b0e14] border border-[#22283d] text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ff2e74]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Mensagem carinhosa para {creatorName}:
              </span>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva sua mensagem..."
                className="w-full p-3 rounded-xl bg-[#0b0e14] border border-[#22283d] text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ff2e74] resize-none"
              />
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">🥑</span>
                <div>
                  <span className="font-bold text-emerald-300 block">AbacatePay PIX Integrado</span>
                  <span className="text-[10px] text-gray-400">0% de taxas • Envio instantâneo</span>
                </div>
              </div>
              <span className="font-extrabold text-sm text-white">
                R$ {effectiveAmount.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <button
              type="submit"
              disabled={effectiveAmount <= 0}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] text-white font-bold text-sm shadow-[0_8px_24px_-4px_rgba(255,46,116,0.45)] hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <Heart size={18} className="fill-white" />
              <span>Gerar PIX de R$ {effectiveAmount.toFixed(2).replace('.', ',')}</span>
            </button>
          </form>
        )}

        {/* STEP 2: Efí Bank PIX Payment */}
        {step === 'pix' && currentTx && (
          <div className="p-5 flex flex-col gap-4">
            <div className="p-3 rounded-2xl bg-[#0a0b10] border border-[#2a2228] flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">Total do Mimo</span>
                <span className="text-lg font-black text-[#f37021]">
                  R$ {currentTx.amount.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a170e] border border-[#f37021]/50 text-[#f37021] text-xs font-semibold">
                <Landmark size={12} />
                <span>Efí Bank PIX Oficial</span>
              </div>
            </div>

            {/* QR Code container */}
            <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl shadow-inner mx-auto border border-[#f37021]/30">
              <img
                src={currentTx.qrCodeData || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentTx.pixCode)}`}
                alt="QR Code PIX Efí Bank"
                className="w-44 h-44 rounded-lg object-contain"
              />
              <span className="text-[10px] text-gray-600 font-mono mt-2 font-bold tracking-wider">
                PIX OFICIAL EFÍ BANK
              </span>
            </div>

            {/* Copy button */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-400">
                Ou copie o código Pix copia e cola:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentTx.pixCode}
                  className="flex-1 h-10 px-3 rounded-xl bg-[#0a0b10] border border-[#1e2337] text-xs text-gray-300 font-mono truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                    copiedPix
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#f37021] hover:bg-[#e06115] text-white shadow-sm'
                  }`}
                >
                  {copiedPix ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {warningMsg && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-200 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px]">{warningMsg}</p>
              </div>
            )}

            {/* Confirm Paid Action */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmPaid}
                disabled={isProcessing}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff8c42] hover:opacity-95 text-white font-bold text-sm shadow-[0_8px_24px_-4px_rgba(243,112,33,0.4)] transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Verificando no Efí Bank...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Já Paguei no Meu Banco</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full py-2 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Voltar e alterar valor
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 'success' && (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
              <Heart size={36} className="fill-emerald-400 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-['Playfair_Display',serif] font-bold text-xl text-white">
                Mimo Enviado com Sucesso!
              </h4>
              <p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto leading-relaxed">
                Seu pagamento de R$ {effectiveAmount.toFixed(2).replace('.', ',')} foi aprovado instantaneamente pelo AbacatePay. {creatorName} foi notificada no chat!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
