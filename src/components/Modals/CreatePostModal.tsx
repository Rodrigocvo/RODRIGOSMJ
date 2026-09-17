import { useState, useRef, ChangeEvent, DragEvent, FormEvent } from 'react';
import { 
  X, 
  Upload, 
  Calendar, 
  Clock, 
  DollarSign, 
  Sparkles,
  Play
} from 'lucide-react';
import { Post } from '../../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  onPostCreated: (newPost: Post) => void;
  onShowToast: (msg: string) => void;
}

export function CreatePostModal({
  isOpen,
  onClose,
  creatorName,
  creatorHandle,
  creatorAvatar,
  onPostCreated,
  onShowToast,
}: CreatePostModalProps) {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState<'public-image' | 'locked-vip' | 'ppv-video'>('locked-vip');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [ppvPrice, setPpvPrice] = useState('19.90');

  // Media state
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaFileName, setMediaFileName] = useState<string>('');
  const [isCustomUrlOpen, setIsCustomUrlOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // File handling
  const handleFileSelect = (file: File) => {
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    setMediaFileName(file.name);

    const objectUrl = URL.createObjectURL(file);
    setMediaPreview(objectUrl);
    onShowToast(`${isVideo ? 'Vídeo' : 'Foto'} "${file.name}" pronto para envio!`);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setMediaPreview(customUrlInput.trim());
    setMediaFileName('Mídia por Link Direto');
    setIsCustomUrlOpen(false);
    onShowToast('Link da mídia aplicado com sucesso!');
  };

  const handleSubmit = (forceSchedule = false) => {
    if (!title.trim()) {
      onShowToast('Por favor, informe o título do post.');
      return;
    }

    const finalMediaUrl =
      mediaPreview ||
      (mediaType === 'video'
        ? 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop');

    const parsedPrice = parseFloat(ppvPrice.replace(',', '.')) || 19.90;
    const isScheduled = forceSchedule || Boolean(scheduledDateTime.trim());

    let formattedScheduleText = '';
    if (scheduledDateTime.trim()) {
      try {
        const d = new Date(scheduledDateTime);
        formattedScheduleText = d.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        formattedScheduleText = scheduledDateTime;
      }
    }

    let badgeLabel = 'VIP Exclusivo';
    let badgeType: 'public' | 'vip' | 'ppv' = 'vip';

    if (audience === 'public-image') {
      badgeLabel = 'Prévia Pública Grátis';
      badgeType = 'public';
    } else if (audience === 'ppv-video') {
      badgeLabel = `Venda Avulsa (R$ ${parsedPrice.toFixed(2).replace('.', ',')})`;
      badgeType = 'ppv';
    }

    const newPost: Post = {
      id: `post-admin-${Date.now()}`,
      creatorName,
      creatorHandle,
      creatorAvatar,
      isVerified: true,
      timestamp: isScheduled
        ? `⏰ Agendado para ${formattedScheduleText || 'data futura'}`
        : 'Agora mesmo • Postado pelo Administrador',
      audienceBadge: {
        label: badgeLabel,
        type: badgeType,
      },
      content: title.trim(),
      type: audience,
      media: {
        type: mediaType,
        url: finalMediaUrl,
        fallbackUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
        duration: mediaType === 'video' ? '08:45' : undefined,
        quality: mediaType === 'video' ? '4K UHD' : undefined,
        aspectRatio: mediaType === 'video' ? 'aspect-video' : 'aspect-[4/3]',
      },
      ppvPrice: audience === 'ppv-video' ? parsedPrice : undefined,
      isUnlocked: audience === 'public-image',
      status: isScheduled ? 'scheduled' : 'published',
      scheduledFor: isScheduled ? (formattedScheduleText || scheduledDateTime) : undefined,
      likes: 0,
      isLiked: false,
      commentsCount: 0,
      comments: [],
    };

    onPostCreated(newPost);
    onShowToast(
      isScheduled
        ? `Post agendado para ${formattedScheduleText || 'a data escolhida'}!`
        : 'Novo post publicado com sucesso no feed!'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#0e1017] rounded-3xl border border-[#1e2337] shadow-2xl overflow-hidden z-10 my-8 p-6 sm:p-8 flex flex-col gap-6">
        {/* Header with Title & Close */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Novo post no feed
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#141722] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: Sua foto ou vídeo */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#ff2e74] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
              1
            </span>
            <span className="font-bold text-sm sm:text-base text-white">
              Sua foto ou vídeo
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleInputChange}
          />

          {!mediaPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`w-full py-8 sm:py-10 px-4 rounded-2xl border border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-[#ff2e74] bg-[#221024]/60 scale-[1.01]'
                  : 'border-[#ff2e74]/50 hover:border-[#ff2e74] bg-[#160d19]/40 hover:bg-[#1f1022]/60'
              }`}
            >
              <Upload size={22} className="text-[#ff4d88] opacity-80" />
              <p className="text-xs sm:text-sm text-gray-300 font-medium select-none">
                Clique para escolher uma foto ou vídeo do seu computador
              </p>
              <span className="text-[11px] text-gray-500">
                Suporta JPG, PNG, MP4, MOV
              </span>
            </div>
          ) : (
            <div className="relative w-full rounded-2xl border border-[#ff2e74]/40 bg-[#160d19]/60 p-4 flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-black shrink-0 relative border border-white/10 shadow-md">
                {mediaType === 'video' ? (
                  <div className="w-full h-full relative flex items-center justify-center bg-zinc-900">
                    <video src={mediaPreview} className="w-full h-full object-cover" />
                    <Play size={18} className="text-white fill-white absolute" />
                  </div>
                ) : (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-1 text-left">
                <span className="text-xs text-[#ff4d88] font-bold uppercase">
                  Mídia Carregada
                </span>
                <p className="text-sm font-semibold text-white truncate max-w-xs">
                  {mediaFileName || 'Arquivo selecionado'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-[#1e2337] text-xs font-semibold text-white hover:bg-[#272e48]"
                  >
                    Trocar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPreview(null);
                      setMediaFileName('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/60 text-xs font-semibold text-rose-300 hover:bg-rose-900"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fallback to custom URL / preset */}
          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <button
              type="button"
              onClick={() => setIsCustomUrlOpen(!isCustomUrlOpen)}
              className="text-[#ff4d88] hover:underline flex items-center gap-1 font-medium"
            >
              <Sparkles size={12} />
              <span>{isCustomUrlOpen ? 'Ocultar opções de link' : 'Ou colar link web / exemplos'}</span>
            </button>
          </div>

          {isCustomUrlOpen && (
            <div className="p-3.5 rounded-xl bg-[#0a0b10] border border-[#1e2337] flex items-center gap-2">
              <input
                type="text"
                placeholder="https://exemplo.com/foto.jpg ou vídeo"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg bg-[#131521] border border-[#1e2337] text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ff2e74]"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="h-9 px-3 rounded-lg bg-[#ff2e74] text-white text-xs font-bold shrink-0"
              >
                Aplicar
              </button>
            </div>
          )}
        </div>

        {/* STEP 2: Título do post */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#ff2e74] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
              2
            </span>
            <span className="font-bold text-sm sm:text-base text-white">
              Título do post
            </span>
          </div>

          <input
            type="text"
            placeholder="Ex.: Ensaio novo — parte 2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-[#090b10] border border-[#1e2337] focus:border-[#ff2e74] text-sm text-white placeholder:text-gray-500 focus:outline-none transition-all"
          />
        </div>

        {/* STEP 3: Quem pode ver */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#ff2e74] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
              3
            </span>
            <span className="font-bold text-sm sm:text-base text-white">
              Quem pode ver
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => setAudience('public-image')}
              className={`p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-center select-none ${
                audience === 'public-image'
                  ? 'bg-[#180e1b] border-2 border-[#ff2e74] shadow-[0_0_16px_rgba(255,46,116,0.25)]'
                  : 'bg-[#090b10] border border-[#1e2337] hover:border-[#ff2e74]/40'
              }`}
            >
              <div className="font-bold text-sm text-white">Grátis</div>
              <div className={`text-xs mt-0.5 ${audience === 'public-image' ? 'text-[#ff4d88] font-semibold' : 'text-gray-400'}`}>
                todos veem
              </div>
            </div>

            <div
              onClick={() => setAudience('locked-vip')}
              className={`p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-center select-none ${
                audience === 'locked-vip'
                  ? 'bg-[#180e1b] border-2 border-[#ff2e74] shadow-[0_0_16px_rgba(255,46,116,0.25)]'
                  : 'bg-[#090b10] border border-[#1e2337] hover:border-[#ff2e74]/40'
              }`}
            >
              <div className="font-bold text-sm text-white">Assinantes</div>
              <div className={`text-xs mt-0.5 ${audience === 'locked-vip' ? 'text-[#ff4d88] font-semibold' : 'text-gray-400'}`}>
                só assinantes
              </div>
            </div>

            <div
              onClick={() => setAudience('ppv-video')}
              className={`p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-center select-none ${
                audience === 'ppv-video'
                  ? 'bg-[#180e1b] border-2 border-[#ff2e74] shadow-[0_0_16px_rgba(255,46,116,0.25)]'
                  : 'bg-[#090b10] border border-[#1e2337] hover:border-[#ff2e74]/40'
              }`}
            >
              <div className="font-bold text-sm text-white">Vender avulso</div>
              <div className={`text-xs mt-0.5 ${audience === 'ppv-video' ? 'text-[#ff4d88] font-semibold' : 'text-gray-400'}`}>
                cada um paga
              </div>
            </div>
          </div>

          {audience === 'ppv-video' && (
            <div className="p-3 rounded-xl bg-[#090b10] border border-[#ff2e74]/50 flex items-center justify-between gap-3 mt-1">
              <span className="text-xs text-gray-300 font-semibold">
                Preço avulso:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 font-bold">R$</span>
                <input
                  type="text"
                  value={ppvPrice}
                  onChange={(e) => setPpvPrice(e.target.value)}
                  className="w-24 h-8 px-2 rounded-lg bg-[#131521] border border-[#ff2e74] text-white text-xs font-bold text-center focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* STEP 4: Quando vai ao ar */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#ff2e74] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
              4
            </span>
            <span className="font-bold text-sm sm:text-base text-white">
              Quando vai ao ar
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              className="h-11 px-4 rounded-xl bg-[#090b10] border border-[#1e2337] focus:border-[#ff2e74] text-xs sm:text-sm text-white font-mono [color-scheme:dark] focus:outline-none"
            />
            <span className="text-xs text-gray-400">
              Deixe vazio para publicar imediatamente
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] hover:brightness-110 text-white font-bold text-sm shadow-[0_0_25px_rgba(255,46,116,0.6)] transition-all active:scale-95"
          >
            Publicar agora
          </button>

          <button
            type="button"
            onClick={() => {
              if (!scheduledDateTime) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(20, 0, 0, 0);
                const isoStr = tomorrow.toISOString().slice(0, 16);
                setScheduledDateTime(isoStr);
                onShowToast('Data sugerida para amanhã às 20h. Clique em Agendar para confirmar!');
                return;
              }
              handleSubmit(true);
            }}
            className="px-8 py-3 rounded-full bg-[#181320] border border-[#2e1d33] hover:border-[#ff2e74] text-gray-300 hover:text-white font-bold text-sm transition-all active:scale-95"
          >
            Agendar
          </button>
        </div>
      </div>
    </div>
  );
}
