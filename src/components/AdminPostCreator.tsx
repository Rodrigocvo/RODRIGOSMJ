import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { 
  Upload, 
  Calendar, 
  Clock, 
  Trash2, 
  ChevronDown, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  Lock, 
  DollarSign, 
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Play
} from 'lucide-react';
import { Post } from '../types';
import { SafeImage } from './SafeImage';

interface AdminPostCreatorProps {
  posts: Post[];
  onPostCreated: (newPostData: Omit<Post, 'id' | 'likes' | 'commentsCount' | 'isLiked' | 'isSaved' | 'comments' | 'creatorName' | 'creatorAvatar' | 'creatorHandle' | 'isVerified'>) => void;
  onDeletePost: (postId: string) => void;
  onUpdateAudience: (postId: string, newType: 'public-image' | 'locked-vip' | 'ppv-video', price?: number) => void;
  onPublishScheduledNow?: (postId: string) => void;
  onShowToast: (msg: string) => void;
}

export function AdminPostCreator({
  posts,
  onPostCreated,
  onDeletePost,
  onUpdateAudience,
  onPublishScheduledNow,
  onShowToast,
}: AdminPostCreatorProps) {
  // Form State
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState<'public-image' | 'locked-vip' | 'ppv-video'>('locked-vip');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [ppvPrice, setPpvPrice] = useState('19.90');

  // Media upload / selection state
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaFileName, setMediaFileName] = useState<string>('');
  const [isCustomUrlOpen, setIsCustomUrlOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Active list filter
  const [listFilter, setListFilter] = useState<'all' | 'published' | 'scheduled'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file selection
  const handleFileSelect = (file: File) => {
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    setMediaFileName(file.name);

    if (file.size < 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setMediaPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      const objectUrl = URL.createObjectURL(file);
      setMediaPreview(objectUrl);
    }
    onShowToast(`${isVideo ? 'Vídeo' : 'Foto'} "${file.name}" carregado com sucesso!`);
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

  const handleSelectSample = (url: string, type: 'image' | 'video', name: string) => {
    setMediaPreview(url);
    setMediaType(type);
    setMediaFileName(name);
    setIsCustomUrlOpen(false);
    onShowToast(`"${name}" selecionado com sucesso!`);
  };

  // Submit / Publish handler
  const handlePublish = (forceSchedule = false) => {
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

    // Format display date
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

    onPostCreated({
      timestamp: isScheduled
        ? `⏰ Agendado para ${formattedScheduleText || 'horário futuro'}`
        : 'Agora mesmo • Publicado pelo Administrador',
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
        quality: mediaType === 'video' ? '4K Ultra HD' : undefined,
        aspectRatio: mediaType === 'video' ? 'aspect-video' : 'aspect-[4/3]',
      },
      ppvPrice: audience === 'ppv-video' ? parsedPrice : undefined,
      isUnlocked: audience === 'public-image',
      status: isScheduled ? 'scheduled' : 'published',
      scheduledFor: isScheduled ? (formattedScheduleText || scheduledDateTime) : undefined,
    });

    onShowToast(
      isScheduled
        ? `Post agendado com sucesso para ${formattedScheduleText || 'a data selecionada'}!`
        : 'Post publicado com sucesso no feed!'
    );

    // Reset Form
    setTitle('');
    setMediaPreview(null);
    setMediaFileName('');
    setScheduledDateTime('');
  };

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (listFilter === 'scheduled') return p.status === 'scheduled';
    if (listFilter === 'published') return p.status !== 'scheduled';
    return true;
  });

  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const publishedCount = posts.filter((p) => p.status !== 'scheduled').length;

  return (
    <div className="w-full flex flex-col gap-8">
      {/* CARD: Novo post no feed (Matching exact print) */}
      <div className="w-full bg-[#0e1017] border border-[#1e2337] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Novo post no feed
        </h2>

        {/* STEP 1: Sua foto ou vídeo */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#ff2e74] text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-sm">
              1
            </span>
            <span className="font-bold text-sm sm:text-base text-white">
              Sua foto ou vídeo
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleInputChange}
          />

          {/* Upload Area with Dashed Pink Border */}
          {!mediaPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`w-full py-8 sm:py-10 px-4 rounded-2xl border border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
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
                Suporta JPG, PNG, MP4, MOV ou arraste e solte o arquivo aqui
              </span>
            </div>
          ) : (
            /* Media Preview Container */
            <div className="relative w-full rounded-2xl border border-[#ff2e74]/40 bg-[#160d19]/60 p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-black shrink-0 relative border border-white/10 shadow-md">
                {mediaType === 'video' ? (
                  <div className="w-full h-full relative flex items-center justify-center bg-zinc-900">
                    <video src={mediaPreview} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Play size={24} className="text-white fill-white" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white uppercase">
                  {mediaType === 'video' ? 'Vídeo' : 'Foto'}
                </span>
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-1 text-left">
                <span className="text-xs text-[#ff4d88] font-bold uppercase tracking-wider">
                  Arquivo Carregado
                </span>
                <p className="text-sm font-semibold text-white truncate max-w-sm">
                  {mediaFileName || 'Arquivo selecionado'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 rounded-lg bg-[#1e2337] hover:bg-[#282f49] text-xs font-semibold text-white transition-colors"
                  >
                    Trocar arquivo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPreview(null);
                      setMediaFileName('');
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-xs font-semibold text-rose-300 transition-colors flex items-center gap-1"
                  >
                    <X size={13} />
                    <span>Remover</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick link to paste URL or select sample */}
          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <button
              type="button"
              onClick={() => setIsCustomUrlOpen(!isCustomUrlOpen)}
              className="text-[#ff4d88] hover:underline flex items-center gap-1 font-medium"
            >
              <Sparkles size={12} />
              <span>{isCustomUrlOpen ? 'Ocultar opções de link' : 'Ou colar link web direto'}</span>
            </button>
          </div>

          {isCustomUrlOpen && (
            <div className="p-4 rounded-xl bg-[#0a0b10] border border-[#1e2337] flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://exemplo.com/minha-foto.jpg ou .mp4"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg bg-[#131521] border border-[#1e2337] text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ff2e74]"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="h-9 px-3.5 rounded-lg bg-[#ff2e74] text-white text-xs font-bold hover:brightness-110 shrink-0"
                >
                  Usar Link
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1e2337]">
                <span className="text-[11px] text-gray-400">Modelos rápidos:</span>
                <button
                  type="button"
                  onClick={() => handleSelectSample('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop', 'image', 'Ensaio Glamour')}
                  className="px-2.5 py-1 rounded-md bg-[#131521] hover:bg-[#ff2e74]/20 text-[11px] text-gray-300 hover:text-white border border-[#1e2337]"
                >
                  📸 Foto Ensaio Glamour
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop', 'video', 'Vídeo VIP Lounge')}
                  className="px-2.5 py-1 rounded-md bg-[#131521] hover:bg-[#ff2e74]/20 text-[11px] text-gray-300 hover:text-white border border-[#1e2337]"
                >
                  🎥 Vídeo VIP Lounge
                </button>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: Título do post */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#ff2e74] text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-sm">
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
            className="w-full h-12 px-4 rounded-xl bg-[#090b10] border border-[#1e2337] focus:border-[#ff2e74] text-sm text-white placeholder:text-gray-500 focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* STEP 3: Quem pode ver */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#ff2e74] text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-sm">
              3
            </span>
            <span className="font-bold text-sm sm:text-base text-white">
              Quem pode ver
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Grátis */}
            <div
              onClick={() => setAudience('public-image')}
              className={`p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-center select-none ${
                audience === 'public-image'
                  ? 'bg-[#180e1b] border-2 border-[#ff2e74] shadow-[0_0_16px_rgba(255,46,116,0.25)]'
                  : 'bg-[#090b10] border border-[#1e2337] hover:border-[#ff2e74]/40'
              }`}
            >
              <div className="font-bold text-sm sm:text-base text-white">
                Grátis
              </div>
              <div className={`text-xs mt-0.5 ${audience === 'public-image' ? 'text-[#ff4d88] font-semibold' : 'text-gray-400'}`}>
                todos veem
              </div>
            </div>

            {/* Assinantes */}
            <div
              onClick={() => setAudience('locked-vip')}
              className={`p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-center select-none ${
                audience === 'locked-vip'
                  ? 'bg-[#180e1b] border-2 border-[#ff2e74] shadow-[0_0_16px_rgba(255,46,116,0.25)]'
                  : 'bg-[#090b10] border border-[#1e2337] hover:border-[#ff2e74]/40'
              }`}
            >
              <div className="font-bold text-sm sm:text-base text-white">
                Assinantes
              </div>
              <div className={`text-xs mt-0.5 ${audience === 'locked-vip' ? 'text-[#ff4d88] font-semibold' : 'text-gray-400'}`}>
                só assinantes
              </div>
            </div>

            {/* Vender avulso */}
            <div
              onClick={() => setAudience('ppv-video')}
              className={`p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-center select-none ${
                audience === 'ppv-video'
                  ? 'bg-[#180e1b] border-2 border-[#ff2e74] shadow-[0_0_16px_rgba(255,46,116,0.25)]'
                  : 'bg-[#090b10] border border-[#1e2337] hover:border-[#ff2e74]/40'
              }`}
            >
              <div className="font-bold text-sm sm:text-base text-white">
                Vender avulso
              </div>
              <div className={`text-xs mt-0.5 ${audience === 'ppv-video' ? 'text-[#ff4d88] font-semibold' : 'text-gray-400'}`}>
                cada um paga
              </div>
            </div>
          </div>

          {/* If Vender Avulso is chosen, show price input */}
          {audience === 'ppv-video' && (
            <div className="p-3.5 rounded-xl bg-[#090b10] border border-[#ff2e74]/50 flex items-center justify-between gap-3 mt-1 animate-fadeIn">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-[#ff4d88]" />
                <span className="text-xs text-gray-300 font-semibold">
                  Defina o valor deste conteúdo avulso:
                </span>
              </div>
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
            <span className="w-5 h-5 rounded-full bg-[#ff2e74] text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-sm">
              4
            </span>
            <span className="font-bold text-sm sm:text-base text-white">
              Quando vai ao ar
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative">
              <input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                className="h-11 px-4 rounded-xl bg-[#090b10] border border-[#1e2337] focus:border-[#ff2e74] text-xs sm:text-sm text-white font-mono [color-scheme:dark] focus:outline-none"
              />
            </div>
            <span className="text-xs text-gray-400">
              Deixe vazio para publicar imediatamente
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          {/* Publicar agora button with glowing pink */}
          <button
            type="button"
            onClick={() => handlePublish(false)}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] hover:brightness-110 text-white font-bold text-sm shadow-[0_0_25px_rgba(255,46,116,0.6)] transition-all active:scale-95"
          >
            Publicar agora
          </button>

          {/* Agendar button */}
          <button
            type="button"
            onClick={() => {
              if (!scheduledDateTime) {
                // If user clicks agendar but hasn't set date, set default to next day 20:00
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(20, 0, 0, 0);
                const isoStr = tomorrow.toISOString().slice(0, 16);
                setScheduledDateTime(isoStr);
                onShowToast('Data sugerida definida (amanhã às 20h). Clique em Agendar para confirmar!');
                return;
              }
              handlePublish(true);
            }}
            className="px-8 py-3 rounded-full bg-[#181320] border border-[#2e1d33] hover:border-[#ff2e74] text-gray-300 hover:text-white font-bold text-sm transition-all active:scale-95"
          >
            Agendar
          </button>
        </div>
      </div>

      {/* SECTION: Publicados & Agendados */}
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white">
              Publicados
            </h3>
            <span className="text-xs text-gray-400">
              ({publishedCount} no ar &bull; {scheduledCount} agendados)
            </span>
          </div>

          {/* Tab Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0e1017] rounded-xl border border-[#1e2337]">
            <button
              onClick={() => setListFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                listFilter === 'all'
                  ? 'bg-[#ff2e74] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Todos ({posts.length})
            </button>
            <button
              onClick={() => setListFilter('published')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                listFilter === 'published'
                  ? 'bg-[#ff2e74] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              No Ar ({publishedCount})
            </button>
            <button
              onClick={() => setListFilter('scheduled')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                listFilter === 'scheduled'
                  ? 'bg-[#ff2e74] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Agendados ({scheduledCount})
            </button>
          </div>
        </div>

        {/* List of Posts matching screenshot */}
        <div className="flex flex-col gap-2.5">
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center bg-[#0e1017] rounded-2xl border border-[#1e2337] text-gray-400 text-xs sm:text-sm">
              Nenhum post encontrado nesta categoria.
            </div>
          ) : (
            filteredPosts.map((p) => {
              const isScheduled = p.status === 'scheduled';
              const currentAudience =
                p.type === 'public-image'
                  ? 'Grátis'
                  : p.type === 'ppv-video'
                  ? 'Vender avulso'
                  : 'Assinantes';

              return (
                <div
                  key={p.id}
                  className="p-3 sm:p-4 rounded-2xl bg-[#0e1017] border border-[#1e2337] hover:border-[#ff2e74]/40 transition-all flex items-center justify-between gap-4"
                >
                  {/* Left: Thumbnail & Title */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-tr from-[#ff1a66] to-[#5b156b] border border-white/10 shrink-0 relative">
                      <SafeImage
                        src={p.media?.url || ''}
                        fallbackSrc={p.media?.fallbackUrl}
                        alt={p.content}
                        className="w-full h-full object-cover"
                      />
                      {p.media?.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play size={14} className="text-white fill-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-white truncate max-w-xs sm:max-w-md">
                        {p.content}
                      </div>

                      {isScheduled ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#ff4d88] font-bold mt-0.5">
                          <Clock size={12} />
                          <span>Agendado para: {p.scheduledFor || 'Data futura'}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {p.timestamp}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Controls (Audience Dropdown + Apagar) */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* If scheduled, option to publish right now */}
                    {isScheduled && onPublishScheduledNow && (
                      <button
                        type="button"
                        onClick={() => onPublishScheduledNow(p.id)}
                        className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-[#ff2e74]/20 hover:bg-[#ff2e74] text-[#ff4d88] hover:text-white text-xs font-bold transition-all"
                        title="Publicar este conteúdo imediatamente no feed"
                      >
                        Publicar agora
                      </button>
                    )}

                    {/* Audience Dropdown Button */}
                    <div className="relative group">
                      <select
                        value={p.type}
                        onChange={(e) => {
                          const val = e.target.value as 'public-image' | 'locked-vip' | 'ppv-video';
                          onUpdateAudience(p.id, val, p.ppvPrice || 19.9);
                          onShowToast(`Visibilidade do post atualizada para "${val === 'public-image' ? 'Grátis' : val === 'locked-vip' ? 'Assinantes' : 'Vender avulso'}"!`);
                        }}
                        className="appearance-none h-9 pl-3.5 pr-8 rounded-xl bg-[#141722] border border-[#242a3a] text-xs font-semibold text-white hover:border-[#ff2e74] cursor-pointer focus:outline-none transition-colors"
                      >
                        <option value="locked-vip" className="bg-[#131521] text-white">Assinantes</option>
                        <option value="public-image" className="bg-[#131521] text-white">Grátis</option>
                        <option value="ppv-video" className="bg-[#131521] text-white">Vender avulso</option>
                      </select>
                      <ChevronDown size={14} className="text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Apagar Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja apagar o post "${p.content.slice(0, 30)}..."?`)) {
                          onDeletePost(p.id);
                          onShowToast('Post apagado com sucesso.');
                        }
                      }}
                      className="h-9 px-4 rounded-xl bg-[#141722] hover:bg-rose-950 border border-[#242a3a] hover:border-rose-600 text-xs font-semibold text-gray-300 hover:text-rose-300 transition-colors"
                    >
                      Apagar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
