import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  ShoppingBag, 
  Lock, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Share2
} from 'lucide-react';
import { Post } from '../../types';
import { SafeImage } from '../SafeImage';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  fallbackUrl?: string;
  title: string;
  subtitle?: string;
  isUnlocked?: boolean;
  price?: number;
  postId?: string;
  postRef?: Post;
  duration?: string;
}

interface MediaTheaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaList: MediaItem[];
  currentIndex: number;
  onIndexChange: (newIndex: number) => void;
  onUnlockPpv?: (postId: string) => void;
  onOpenSubscribe?: () => void;
  onShowToast: (msg: string) => void;
}

export function MediaTheaterModal({
  isOpen,
  onClose,
  mediaList,
  currentIndex,
  onIndexChange,
  onUnlockPpv,
  onOpenSubscribe,
  onShowToast,
}: MediaTheaterModalProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120); // default preview seconds

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentMedia: MediaItem | undefined = mediaList[currentIndex];

  // Handle keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          onIndexChange(currentIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < mediaList.length - 1) {
          onIndexChange(currentIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, mediaList.length, onClose, onIndexChange]);

  // Sync fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!isOpen || !currentMedia) return null;

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      onShowToast('Tela cheia não suportada ou bloqueada no navegador.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentMedia.url);
      setCopied(true);
      onShowToast('Link direto da mídia copiado com sucesso!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Erro ao copiar link.');
    }
  };

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < mediaList.length - 1;

  const isLocked = currentMedia.isUnlocked === false;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl text-white select-none overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between px-4 sm:px-6 z-30 pointer-events-auto">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
              {currentMedia.title}
            </h3>
            {currentMedia.subtitle && (
              <span className="text-xs text-gray-400 truncate">
                {currentMedia.subtitle}
              </span>
            )}
          </div>
          {mediaList.length > 1 && (
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-gray-300">
              {currentIndex + 1} / {mediaList.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Link button */}
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
            title="Copiar link direto para tag HTML"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400 hidden sm:inline">Copiado</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span className="hidden sm:inline">Copiar Link</span>
              </>
            )}
          </button>

          {/* Open in new tab */}
          <a
            href={currentMedia.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors border border-white/10"
            title="Abrir em tamanho original"
          >
            <ExternalLink size={16} />
          </a>

          {/* Real Browser Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors border border-white/10"
            title={isFullscreen ? 'Sair da tela cheia' : 'Modo Tela Cheia Real'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#ff4438] hover:bg-[#ff5a36] text-white transition-colors ml-1"
            title="Fechar (ESC)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Media Display Area */}
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12 z-10">
        {/* Navigation Arrows */}
        {hasPrev && (
          <button
            onClick={() => onIndexChange(currentIndex - 1)}
            className="absolute left-3 sm:left-6 z-30 p-3 rounded-full bg-black/60 hover:bg-[#ff4438] text-white border border-white/10 transition-all hover:scale-110 active:scale-95 shadow-xl"
            title="Mídia Anterior (Seta Esquerda)"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {hasNext && (
          <button
            onClick={() => onIndexChange(currentIndex + 1)}
            className="absolute right-3 sm:right-6 z-30 p-3 rounded-full bg-black/60 hover:bg-[#ff4438] text-white border border-white/10 transition-all hover:scale-110 active:scale-95 shadow-xl"
            title="Próxima Mídia (Seta Direita)"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* MEDIA DISPLAY */}
        {currentMedia.type === 'video' ? (
          <div className="relative w-full max-w-5xl max-h-[85vh] aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-2xl border border-white/10">
            {isLocked ? (
              /* Locked Video Preview with purchase banner */
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <SafeImage
                  src={currentMedia.url}
                  fallbackSrc={currentMedia.fallbackUrl}
                  alt={currentMedia.title}
                  className="w-full h-full object-cover filter blur-xl scale-110 opacity-40"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

                <div className="relative z-20 flex flex-col items-center text-center p-6 max-w-lg gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff4438] to-[#ff7a59] flex items-center justify-center shadow-[0_0_30px_rgba(255,68,56,0.6)]">
                    <Lock size={28} className="text-white" />
                  </div>

                  <div>
                    <span className="px-3 py-1 rounded-full bg-[#ff4438]/20 border border-[#ff4438]/40 text-[#ff7a59] text-xs font-bold uppercase tracking-wider">
                      Vídeo Exclusivo Bloqueado
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-2">
                      {currentMedia.title}
                    </h2>
                    <p className="text-sm text-gray-300 mt-1">
                      {currentMedia.duration ? `Duração: ${currentMedia.duration} • ` : ''}Qualidade 4K UHD com áudio original de estúdio.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                    {currentMedia.price && onUnlockPpv && currentMedia.postId ? (
                      <button
                        onClick={() => {
                          onUnlockPpv(currentMedia.postId!);
                          onShowToast(`Conteúdo "${currentMedia.title}" desbloqueado com sucesso!`);
                        }}
                        className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#ff4438] to-[#ff6b4a] text-white font-bold text-sm shadow-[0_4px_20px_rgba(255,68,56,0.5)] hover:scale-102 transition-all flex items-center justify-center gap-2 active:scale-98"
                      >
                        <ShoppingBag size={18} />
                        <span>Desbloquear Vídeo por R$ {currentMedia.price.toFixed(2).replace('.', ',')}</span>
                      </button>
                    ) : onOpenSubscribe ? (
                      <button
                        onClick={onOpenSubscribe}
                        className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#ff4438] to-[#ff6b4a] text-white font-bold text-sm shadow-[0_4px_20px_rgba(255,68,56,0.5)] hover:scale-102 transition-all flex items-center justify-center gap-2 active:scale-98"
                      >
                        <Lock size={18} />
                        <span>Assinar para Desbloquear Todos os Vídeos</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              /* Unlocked Video Player */
              <div className="relative w-full h-full flex items-center justify-center group">
                <SafeImage
                  src={currentMedia.url}
                  fallbackSrc={currentMedia.fallbackUrl}
                  alt={currentMedia.title}
                  className="w-full h-full object-contain"
                />

                {/* Simulated Custom Video Controls Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 z-20">
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                    <div 
                      className="h-full bg-[#ff4438] rounded-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-2 rounded-full bg-white/10 hover:bg-[#ff4438] text-white transition-colors"
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-white" />}
                      </button>

                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>

                      <span>
                        {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {currentMedia.duration || '12:34'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#ff4438]/30 text-[#ff7a59] font-bold text-[10px]">
                        4K UHD
                      </span>
                      <button
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Tela Cheia"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Play badge in center if paused */}
                {!isPlaying && (
                  <div 
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                  >
                    <div className="w-20 h-20 rounded-full bg-[#ff4438]/90 text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,68,56,0.6)] hover:scale-105 transition-transform">
                      <Play size={36} className="fill-white translate-x-1" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* PHOTO / IMAGE DISPLAY */
          <div className="relative max-w-full max-h-[85vh] flex items-center justify-center">
            {isLocked ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-w-3xl max-h-[80vh] flex items-center justify-center">
                <SafeImage
                  src={currentMedia.url}
                  fallbackSrc={currentMedia.fallbackUrl}
                  alt={currentMedia.title}
                  className="max-w-full max-h-[80vh] object-contain filter blur-2xl scale-110 opacity-35"
                />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff4438] to-[#ff7a59] flex items-center justify-center shadow-[0_0_28px_rgba(255,68,56,0.5)]">
                    <Lock size={30} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl sm:text-2xl text-white">
                    Foto Exclusiva para Membros VIP
                  </h3>
                  <p className="text-sm text-gray-300 max-w-md">
                    Assine agora para visualizar esta foto sem censura em altíssima definição 4K.
                  </p>
                  {onOpenSubscribe && (
                    <button
                      onClick={onOpenSubscribe}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-[#ff4438] to-[#ff6b4a] text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                    >
                      Assinar Plano VIP
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative group max-w-full max-h-[85vh] flex items-center justify-center">
                <SafeImage
                  src={currentMedia.url}
                  fallbackSrc={currentMedia.fallbackUrl}
                  alt={currentMedia.title}
                  className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl transition-all"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 z-30 pointer-events-auto border-t border-white/5">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-gray-400 font-medium">Link Direto:</span>
          <code className="text-xs text-[#ff9e87] bg-white/5 px-2.5 py-1 rounded-md truncate max-w-xs sm:max-w-md border border-white/10">
            {currentMedia.url}
          </code>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="hidden sm:inline">Use as setas ← → do teclado para navegar</span>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(currentMedia.url);
                onShowToast('Link da mídia copiado!');
              }
            }}
            className="flex items-center gap-1 text-white hover:text-[#ff4438] transition-colors"
          >
            <Share2 size={14} />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
