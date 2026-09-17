import { useState } from 'react';
import { X, ExternalLink, Copy, Check, ZoomIn } from 'lucide-react';
import { SafeImage } from '../SafeImage';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  onShowToast: (msg: string) => void;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  onShowToast,
}: ImageLightboxModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !imageUrl) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      onShowToast('Link direto da imagem copiado com sucesso!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Erro ao copiar link');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Dark blur backdrop */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-lg"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl max-h-[95vh] flex flex-col bg-[#10131a] rounded-2xl border border-[#272a31] shadow-2xl overflow-hidden z-10">
        {/* Top bar */}
        <div className="p-4 border-b border-[#272a31] flex items-center justify-between bg-[#191c22]">
          <div className="flex items-center gap-2">
            <ZoomIn size={18} className="text-[#ff4f73]" />
            <h3 className="text-sm font-bold text-white truncate max-w-sm">
              {title || 'Visualização da Imagem'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-[#272a31] hover:bg-[#32353c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/5 active:scale-95"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Link Copiado</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copiar Link</span>
                </>
              )}
            </button>

            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#272a31] hover:bg-[#32353c] text-gray-300 hover:text-white transition-colors border border-white/5"
              title="Abrir em tamanho real em nova aba"
            >
              <ExternalLink size={16} />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#272a31] hover:bg-[#32353c] text-gray-400 hover:text-white transition-colors ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#0b0e14] min-h-[300px] max-h-[75vh]">
          <SafeImage
            src={imageUrl}
            fallbackSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop"
            alt={title}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Footer URL inspector */}
        <div className="p-3 bg-[#191c22] border-t border-[#272a31] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-hidden">
            <span className="text-gray-400 shrink-0 font-medium">Link Direto:</span>
            <code className="text-[#ffb2ba] bg-[#0b0e14] px-2 py-1 rounded truncate max-w-lg border border-[#272a31]">
              {imageUrl}
            </code>
          </div>
          <span className="text-[11px] text-gray-400 shrink-0">
            Você pode copiar e colar este link em qualquer tag &lt;img&gt; HTML.
          </span>
        </div>
      </div>
    </div>
  );
}
