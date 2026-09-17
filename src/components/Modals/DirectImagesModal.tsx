import { useState, FormEvent } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Plus, 
  Image as ImageIcon, 
  Code2, 
  Sparkles,
  Info
} from 'lucide-react';
import { DirectImageItem } from '../../types';
import { SafeImage } from '../SafeImage';

interface DirectImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: DirectImageItem[];
  onUpdateImage: (id: string, newUrl: string) => void;
  onShowToast: (msg: string) => void;
}

export function DirectImagesModal({
  isOpen,
  onClose,
  images,
  onUpdateImage,
  onShowToast,
}: DirectImagesModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'code'>('list');
  const [editingTargetId, setEditingTargetId] = useState<string>('banner');
  const [customUrl, setCustomUrl] = useState<string>('');

  if (!isOpen) return null;

  const handleCopy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      onShowToast('Link direto copiado para a área de transferência!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onShowToast('Erro ao copiar link');
    }
  };

  const handleApplyCustomUrl = (e: FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onUpdateImage(editingTargetId, customUrl.trim());
    onShowToast('Imagem atualizada com sucesso pelo link direto!');
    setCustomUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-[#191c22] border border-[#272a31] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Header */}
        <div className="p-5 border-b border-[#272a31] flex items-center justify-between bg-[#10131a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff4f73]/10 text-[#ff4f73] flex items-center justify-center">
              <ImageIcon size={22} />
            </div>
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-white flex items-center gap-2">
                Links Diretos das Imagens
                <span className="text-xs bg-[#ff4f73]/20 text-[#ffb2ba] px-2 py-0.5 rounded-full font-normal">
                  HTML 100% Suportado
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Sim! É totalmente possível usar links diretos para qualquer imagem no HTML.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#272a31] text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-[#272a31] flex items-center gap-4 bg-[#10131a]/60">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'list'
                ? 'border-[#ff4f73] text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon size={16} />
            <span>Galeria de Links do HTML ({images.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'code'
                ? 'border-[#ff4f73] text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Code2 size={16} />
            <span>Como Usar no HTML &amp; Exemplo</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
          {activeTab === 'list' && (
            <>
              {/* Informative explanation */}
              <div className="p-4 rounded-xl bg-[#0b0e14] border border-[#ff4f73]/30 flex items-start gap-3">
                <Info size={20} className="text-[#ff4f73] shrink-0 mt-0.5" />
                <div className="text-xs text-gray-300 leading-relaxed">
                  <span className="font-bold text-white block mb-0.5">
                    Como funcionam os links diretos:
                  </span>
                  No HTML e no React, você pode apontar o atributo <code className="text-[#ffb2ba] bg-[#272a31] px-1 py-0.5 rounded">src</code> diretamente para qualquer URL pública (como Google CDN, Cloudflare, Imgur ou Unsplash). Abaixo estão todos os links diretos extraídos do seu código HTML:
                </div>
              </div>

              {/* Replace/Add live preview URL input */}
              <form onSubmit={handleApplyCustomUrl} className="p-4 rounded-xl bg-[#272a31]/50 border border-[#32353c] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#ff4f73]" />
                    Trocar Imagem em Tempo Real por Link Direto
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <select
                    value={editingTargetId}
                    onChange={(e) => setEditingTargetId(e.target.value)}
                    className="w-full sm:w-48 h-10 px-3 rounded-lg bg-[#0b0e14] border border-[#32353c] text-xs text-white focus:outline-none focus:border-[#ff4f73]"
                  >
                    {images.map((img) => (
                      <option key={img.id} value={img.id}>
                        {img.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="Cole aqui o link direto (ex: https://...)"
                    className="flex-1 w-full h-10 px-3.5 rounded-lg bg-[#0b0e14] border border-[#32353c] text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ff4f73]"
                  />

                  <button
                    type="submit"
                    className="w-full sm:w-auto h-10 px-4 rounded-lg bg-[#ff4f73] hover:bg-[#ff4f73]/90 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all"
                  >
                    <Plus size={16} />
                    <span>Aplicar</span>
                  </button>
                </div>
              </form>

              {/* Items List */}
              <div className="flex flex-col gap-3">
                {images.map((item) => {
                  const isCopied = copiedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-[#0b0e14] border border-[#272a31] hover:border-[#32353c] transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[#191c22] border border-[#272a31]">
                        <SafeImage
                          src={item.url}
                          fallbackSrc={item.fallbackUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white truncate">
                            {item.name}
                          </span>
                          {item.resolution && (
                            <span className="text-[10px] bg-[#272a31] text-gray-300 px-2 py-0.5 rounded">
                              {item.resolution}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-400 line-clamp-1">
                          {item.description}
                        </p>

                        {/* Raw URL Display */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <code className="text-[11px] text-[#ffb2ba] bg-[#191c22] px-2 py-1 rounded truncate max-w-[280px] sm:max-w-md block">
                            {item.url}
                          </code>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleCopy(item.id, item.url)}
                          className="px-3 py-1.5 rounded-lg bg-[#272a31] hover:bg-[#32353c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/5 active:scale-95"
                          title="Copiar link direto"
                        >
                          {isCopied ? (
                            <>
                              <Check size={14} className="text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[#272a31] hover:bg-[#32353c] text-gray-300 hover:text-white transition-colors border border-white/5"
                          title="Abrir imagem original em nova aba"
                        >
                          <ExternalLink size={15} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'code' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[#0b0e14] border border-[#272a31] flex flex-col gap-3">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <Code2 size={18} className="text-[#ff4f73]" />
                  Como usar links diretos no seu HTML:
                </span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Para carregar qualquer imagem via link direto no HTML padrão, basta usar a tag padrão <code className="text-[#ffb2ba]">&lt;img&gt;</code> passando o endereço web completo no parâmetro <code className="text-[#ffb2ba]">src</code>:
                </p>

                <div className="p-3 bg-[#191c22] rounded-lg border border-[#272a31] font-mono text-xs text-gray-300 overflow-x-auto">
                  <pre>{`<!-- Exemplo 1: Imagem de avatar com link direto -->
<img 
  src="https://sua-url-aqui.com/foto-larissa.jpg" 
  alt="Larissa Albuquerque" 
  referrerpolicy="no-referrer"
  class="rounded-full w-28 h-28 object-cover" 
/>

<!-- Exemplo 2: Banner de fundo com CSS inline ou Tailwind -->
<div 
  style="background-image: url('https://sua-url-aqui.com/banner.jpg');"
  class="w-full h-80 bg-cover bg-center"
>
</div>`}</pre>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b0e14] border border-[#272a31] flex flex-col gap-2">
                <span className="font-bold text-sm text-white">
                  Dica Pro: Atributo <code className="text-[#ff4f73]">referrerpolicy="no-referrer"</code>
                </span>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Ao usar links de imagens hospedadas em serviços como Google CDN ou servidores externos com proteção contra hotlinking, sempre adicione o atributo <code className="text-gray-200">referrerpolicy="no-referrer"</code> para garantir que o navegador consiga exibir a imagem em qualquer domínio sem bloqueio de segurança.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#272a31] bg-[#10131a] flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Todas as imagens estão vinculadas e prontas para uso.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#272a31] hover:bg-[#32353c] text-white text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
