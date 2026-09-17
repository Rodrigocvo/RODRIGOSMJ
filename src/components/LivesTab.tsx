import { useState, useRef, useEffect } from 'react';
import { 
  Radio, 
  Calendar, 
  Users, 
  MessageSquare, 
  Send, 
  Bell, 
  Lock, 
  CheckCircle2, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Sparkles, 
  Heart, 
  Flame, 
  DollarSign, 
  Settings, 
  Square, 
  Maximize2,
  RefreshCw,
  ExternalLink,
  Play
} from 'lucide-react';
import { LiveStreamConfig } from '../types';
import { LiveStudioModal } from './Modals/LiveStudioModal';
import { LiveFilterCanvas } from './LiveFilterCanvas';

interface LivesTabProps {
  isSubscribed: boolean;
  isAdmin: boolean;
  onOpenSubscribe: () => void;
  onOpenTipModal?: () => void;
  onShowToast: (msg: string) => void;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isHost?: boolean;
  isTip?: boolean;
  tipAmount?: number;
}

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number; // percentage across screen
}

export function LivesTab({ 
  isSubscribed, 
  isAdmin, 
  onOpenSubscribe, 
  onOpenTipModal, 
  onShowToast 
}: LivesTabProps) {
  // Live broadcast configuration state
  const [liveConfig, setLiveConfig] = useState<LiveStreamConfig>(() => {
    const saved = localStorage.getItem('ruivinha_live_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      id: 'live-main',
      isActive: false,
      title: 'Live Privada da Ruivinha VIP ✨',
      description: 'Transmissão ao vivo interativa e exclusiva para assinantes VIP com bate-papo liberado!',
      sourceType: 'camera',
      isVipOnly: true,
      viewersCount: 243,
      scheduledTime: 'Domingo, às 21h00 (Horário de Brasília)',
    };
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeMediaStream, setActiveMediaStream] = useState<MediaStream | null>(null);
  const [isPreviewFilterActive, setIsPreviewFilterActive] = useState(false);

  // Live video element
  const videoElementRef = useRef<HTMLVideoElement>(null);

  // Live Stream Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Floating live reactions
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  // Live Chat
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'Marcos Silva', text: 'Ansioso pela live! Você está maravilhosa 😍', time: '18:42' },
    { id: '2', user: 'Rodrigo P.', text: 'A última foi sensacional demais! ❤️🔥', time: '19:10' },
    { id: '3', user: 'Ruivinha VIP', text: 'Preparei um momento super especial para vocês meus amores! Comentem aqui!', time: '19:15', isHost: true },
    { id: '4', user: 'Lucas Santos', text: 'Mandando um pix agora para você notar minha mensagem 💋', time: '19:18', isTip: true, tipAmount: 50 },
  ]);

  // Persist live config changes
  useEffect(() => {
    localStorage.setItem('ruivinha_live_config', JSON.stringify(liveConfig));
  }, [liveConfig]);

  // Live duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (liveConfig.isActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [liveConfig.isActive]);

  // Connect active MediaStream to live video tag
  useEffect(() => {
    if (videoElementRef.current && activeMediaStream) {
      videoElementRef.current.srcObject = activeMediaStream;
    }
  }, [activeMediaStream, liveConfig.isActive]);

  // Helper to format elapsed live time 00:00:00
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to extract YouTube embed URL
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/))([\w-]{11})/;
    const match = url.match(regExp);
    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
    }
    if (url.length === 11 && !url.includes('/')) {
      return `https://www.youtube-nocookie.com/embed/${url}?autoplay=1&rel=0&modestbranding=1`;
    }
    return null;
  };

  const handleStartLive = (config: LiveStreamConfig, stream?: MediaStream) => {
    setLiveConfig(config);
    if (stream) {
      setActiveMediaStream(stream);
    }
    setElapsedSeconds(0);
  };

  const handleStopLive = () => {
    if (activeMediaStream) {
      activeMediaStream.getTracks().forEach((track) => track.stop());
      setActiveMediaStream(null);
    }
    setLiveConfig((prev) => ({
      ...prev,
      isActive: false,
    }));
    onShowToast('Transmissão ao vivo encerrada com sucesso!');
  };

  const toggleMic = () => {
    if (activeMediaStream) {
      const audioTrack = activeMediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        onShowToast(audioTrack.enabled ? 'Microfone ativado' : 'Microfone mutado');
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (activeMediaStream) {
      const videoTrack = activeMediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        onShowToast(videoTrack.enabled ? 'Câmera ativada' : 'Câmera desativada');
      }
    } else {
      setIsVideoOff(!isVideoOff);
    }
  };

  // Add floating reaction
  const sendReaction = (emoji: string) => {
    const newReaction: FloatingReaction = {
      id: Date.now() + Math.random(),
      emoji,
      x: 15 + Math.random() * 70, // random x %
    };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2000);
  };

  // Chat message send
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      user: isAdmin ? 'Ruivinha VIP' : isSubscribed ? 'Você (Assinante VIP)' : 'Você (Visitante)',
      text: chatMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHost: isAdmin,
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatMessage('');
    sendReaction('❤️');
  };

  const hasAccess = isAdmin || isSubscribed || !liveConfig.isVipOnly;

  return (
    <div className="flex flex-col gap-6">
      {/* ADMIN TOP BANNER: SEU ESTÚDIO DE LIVE */}
      {isAdmin && (
        <div className="w-full rounded-2xl bg-gradient-to-r from-[#21091a] via-[#14101e] to-[#21091a] border border-[#ff2e74]/40 p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ff1a66] to-[#ff2e74] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,46,116,0.6)] shrink-0">
              <Radio size={22} className={liveConfig.isActive ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {liveConfig.isActive ? 'Você está transmitindo AO VIVO!' : 'Painel de Transmissão da Criadora'}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  liveConfig.isActive 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-[#ff2e74]/20 text-[#ff4d88] border border-[#ff2e74]/30'
                }`}>
                  {liveConfig.isActive ? 'ON AIR' : 'ESTÚDIO PRONTO'}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                {liveConfig.isActive
                  ? `Transmitindo via ${liveConfig.sourceType.toUpperCase()} • ${liveConfig.viewersCount} membros assistindo agora`
                  : 'Abra sua live de verdade com a câmera do celular/PC ou conecte com YouTube e Twitch.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {liveConfig.isActive ? (
              <button
                onClick={handleStopLive}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Square size={14} />
                <span>Encerrar Live</span>
              </button>
            ) : (
              <button
                onClick={() => setIsStudioOpen(true)}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] hover:brightness-110 text-white text-xs font-bold shadow-[0_0_20px_rgba(255,46,116,0.5)] transition-all flex items-center gap-2 active:scale-95"
              >
                <Radio size={15} className="animate-pulse" />
                <span>Abrir Live Agora</span>
              </button>
            )}

            <button
              onClick={() => setIsStudioOpen(true)}
              className="p-2.5 rounded-full bg-[#1e2337] text-gray-300 hover:text-white transition-colors"
              title="Configurações do Estúdio"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      )}

      {/* MAIN STAGE: VIDEO BROADCAST OR SCHEDULED BANNER */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#0d0f17] border border-[#1e2337] shadow-2xl">
        {/* VIEWPORT / VIDEO AREA */}
        <div className="relative aspect-video sm:h-[450px] md:h-[500px] w-full bg-black overflow-hidden flex items-center justify-center">
          {/* FLOATING REACTIONS CONTAINER */}
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {reactions.map((r) => (
              <div
                key={r.id}
                className="absolute bottom-12 text-3xl animate-float-up pointer-events-none"
                style={{ left: `${r.x}%` }}
              >
                {r.emoji}
              </div>
            ))}
          </div>

          {/* SCENARIO 1: LIVE IS ACTIVE AND UNLOCKED */}
          {liveConfig.isActive && hasAccess && (
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              {/* SOURCE 1: CAMERA STREAM WITH REAL-TIME IMAGE PROCESSING */}
              {liveConfig.sourceType === 'camera' && (
                <div className="w-full h-full relative">
                  {/* Keep video element in DOM for canvas stream feed if stream is attached */}
                  {activeMediaStream && (
                    <video
                      ref={videoElementRef}
                      autoPlay
                      playsInline
                      muted={isAdmin} // host is muted to avoid feedback loop
                      className="hidden pointer-events-none"
                    />
                  )}

                  {/* Real-time Image Processing Canvas Layer (Virtual Masks & Beautification/Blush) */}
                  <LiveFilterCanvas
                    videoElement={activeMediaStream ? videoElementRef.current : null}
                    fallbackImageUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1600&auto=format&fit=crop"
                    isHostAdmin={isAdmin}
                    onShowToast={onShowToast}
                  />

                  {/* Host Camera Controls Bar */}
                  {isAdmin && (
                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                      <button
                        onClick={toggleMic}
                        className={`p-2 rounded-full text-white transition-colors ${
                          isMuted ? 'bg-red-600' : 'bg-white/20 hover:bg-white/30'
                        }`}
                        title={isMuted ? 'Desmutar' : 'Mutar Microfone'}
                      >
                        {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                      </button>

                      <button
                        onClick={toggleVideo}
                        className={`p-2 rounded-full text-white transition-colors ${
                          isVideoOff ? 'bg-red-600' : 'bg-white/20 hover:bg-white/30'
                        }`}
                        title={isVideoOff ? 'Ligar Câmera' : 'Desligar Câmera'}
                      >
                        {isVideoOff ? <VideoOff size={14} /> : <Video size={14} />}
                      </button>

                      <button
                        onClick={() => setIsStudioOpen(true)}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title="Configurações de Transmissão"
                      >
                        <Settings size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SOURCE 2: YOUTUBE LIVE PLAYER */}
              {liveConfig.sourceType === 'youtube' && (
                <div className="w-full h-full">
                  {getYouTubeEmbedUrl(liveConfig.youtubeUrl) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(liveConfig.youtubeUrl)!}
                      title="YouTube Live Player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="p-6 text-center text-gray-300">
                      <p className="text-sm">Link do YouTube inválido ou não configurado.</p>
                      {isAdmin && (
                        <button
                          onClick={() => setIsStudioOpen(true)}
                          className="mt-3 px-4 py-2 rounded-xl bg-[#ff2e74] text-white text-xs font-bold"
                        >
                          Configurar Link do YouTube
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SOURCE 3: TWITCH LIVE PLAYER */}
              {liveConfig.sourceType === 'twitch' && (
                <div className="w-full h-full">
                  {liveConfig.twitchChannel ? (
                    <iframe
                      src={`https://player.twitch.tv/?channel=${liveConfig.twitchChannel}&parent=${window.location.hostname || 'localhost'}&muted=false`}
                      title="Twitch Player"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="p-6 text-center text-gray-300">
                      <p className="text-sm">Canal da Twitch não configurado.</p>
                      {isAdmin && (
                        <button
                          onClick={() => setIsStudioOpen(true)}
                          className="mt-3 px-4 py-2 rounded-xl bg-[#ff2e74] text-white text-xs font-bold"
                        >
                          Definir Canal da Twitch
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SOURCE 4: OBS / RTMP STREAM */}
              {liveConfig.sourceType === 'obs' && (
                <div className="w-full h-full relative flex items-center justify-center bg-zinc-950">
                  <img
                    src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1600&auto=format&fit=crop"
                    alt="OBS Broadcast Stream"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col items-center justify-center p-6 text-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold">
                      Transmitindo via OBS Studio RTMP
                    </span>
                    <h4 className="text-lg font-bold text-white">{liveConfig.title}</h4>
                  </div>
                </div>
              )}

              {/* TOP OVERLAY HUD: AO VIVO, TIMER, ESPECTADORES */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>AO VIVO</span>
                </span>

                <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-mono font-bold border border-white/10">
                  {formatTimer(elapsedSeconds)}
                </span>

                <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-gray-200 text-xs font-medium border border-white/10 flex items-center gap-1.5">
                  <Users size={12} className="text-[#ff2e74]" />
                  <span>{liveConfig.viewersCount} assistindo</span>
                </span>
              </div>
            </div>
          )}

          {/* SCENARIO 2: LIVE IS ACTIVE BUT LOCKED (NON-SUBSCRIBERS) */}
          {liveConfig.isActive && !hasAccess && (
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              <img
                src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1600&auto=format&fit=crop"
                alt="Transmissão ao Vivo Bloqueada"
                className="w-full h-full object-cover filter blur-md scale-110 opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 flex flex-col items-center justify-center p-6 text-center gap-4 z-10">
                <div className="w-16 h-16 rounded-full bg-[#ff2e74]/20 border-2 border-[#ff2e74] text-[#ff2e74] flex items-center justify-center shadow-[0_0_30px_rgba(255,46,116,0.6)] animate-pulse">
                  <Lock size={32} />
                </div>

                <div className="flex flex-col items-center gap-1.5 max-w-md">
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-extrabold uppercase">
                    🔴 Live VIP em Andamento Agora
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-['Playfair_Display',serif]">
                    {liveConfig.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300">
                    Essa transmissão é restrita exclusivamente aos assinantes ativos do cantinho da Ruivinha VIP.
                  </p>
                </div>

                <button
                  onClick={onOpenSubscribe}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] hover:brightness-110 text-white font-bold text-sm shadow-[0_0_25px_rgba(255,46,116,0.6)] flex items-center gap-2 transition-all active:scale-95"
                >
                  <Lock size={16} />
                  <span>Assinar VIP para Assistir Agora</span>
                </button>
              </div>
            </div>
          )}

          {/* SCENARIO 3: NO LIVE IS ACTIVE (SCHEDULED / UPCOMING) OR REAL-TIME FILTER PREVIEW */}
          {!liveConfig.isActive && (
            isPreviewFilterActive ? (
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                {/* Live Real-Time Filter Canvas */}
                <LiveFilterCanvas
                  videoElement={null}
                  fallbackImageUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1600&auto=format&fit=crop"
                  isHostAdmin={isAdmin}
                  onShowToast={onShowToast}
                />

                {/* Top Badge & Return Button */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,46,116,0.6)] animate-pulse">
                    <Sparkles size={13} />
                    <span>Estúdio de Filtros & Blush Ativo</span>
                  </span>
                  <button
                    onClick={() => setIsPreviewFilterActive(false)}
                    className="px-3 py-1 rounded-full bg-black/75 hover:bg-black text-gray-200 hover:text-white text-xs font-medium border border-white/15 backdrop-blur-md transition-colors shadow-md"
                  >
                    Voltar ao Cartaz da Live
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative flex items-center justify-center bg-[#07090e]">
                <img
                  src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1600&auto=format&fit=crop"
                  alt="Próxima Live"
                  className="w-full h-full object-cover filter blur-sm scale-105 opacity-40"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017] via-black/50 to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                    <Calendar size={13} />
                    <span>Próxima Transmissão VIP</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-gray-300 text-xs font-medium border border-white/10 flex items-center gap-1">
                    <Users size={12} />
                    <span>184 inscritos aguardando</span>
                  </span>
                </div>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-3.5 z-10">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] flex items-center justify-center text-white shadow-[0_0_35px_rgba(255,46,116,0.6)]">
                    <Radio size={32} />
                  </div>

                  <div className="flex flex-col items-center gap-1 max-w-lg">
                    <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-extrabold text-white">
                      {liveConfig.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {liveConfig.description}
                    </p>
                  </div>

                  {/* Date & Time pill */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 text-white text-xs sm:text-sm font-semibold shadow-inner">
                    <Calendar size={16} className="text-[#ff2e74]" />
                    <span>{liveConfig.scheduledTime || 'Domingo, às 21h00 (Horário de Brasília)'}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap justify-center mt-1">
                    {isAdmin ? (
                      <button
                        onClick={() => setIsStudioOpen(true)}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] hover:brightness-110 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(255,46,116,0.5)] active:scale-95"
                      >
                        <Radio size={16} className="animate-pulse" />
                        <span>Iniciar Transmissão Agora</span>
                      </button>
                    ) : isSubscribed ? (
                      <button
                        onClick={() => onShowToast('Lembrete ativado! Você receberá um aviso assim que a Ruivinha entrar ao vivo.')}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg"
                      >
                        <CheckCircle2 size={16} />
                        <span>Acesso VIP Garantido • Ativar Alarme</span>
                      </button>
                    ) : (
                      <button
                        onClick={onOpenSubscribe}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] hover:brightness-110 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(255,46,116,0.5)] active:scale-95"
                      >
                        <Lock size={16} />
                        <span>Assinar VIP para Participar da Live</span>
                      </button>
                    )}

                    {/* Interactive Virtual Filters & Beautification Preview Button */}
                    <button
                      onClick={() => setIsPreviewFilterActive(true)}
                      className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold flex items-center gap-2 border border-white/20 transition-all shadow-md active:scale-95"
                    >
                      <Sparkles size={15} className="text-[#ff4d88] animate-pulse" />
                      <span>Testar Máscaras & Blush (Canvas)</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* BOTTOM INTERACTION BAR: REACTIONS & LIVE CHAT */}
        <div className="p-4 sm:p-6 border-t border-[#1e2337] flex flex-col gap-4 bg-[#0a0b12]">
          {/* Reaction Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-300">Reações ao Vivo:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { emoji: '❤️', label: 'Coração' },
                  { emoji: '🔥', label: 'Fogo' },
                  { emoji: '💋', label: 'Beijo' },
                  { emoji: '👏', label: 'Palmas' },
                  { emoji: '✨', label: 'Brilho' },
                ].map((item) => (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => sendReaction(item.emoji)}
                    className="w-8 h-8 rounded-full bg-[#161928] hover:bg-[#252b45] active:scale-125 transition-transform flex items-center justify-center text-sm shadow-sm"
                    title={`Enviar ${item.label}`}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Send Tip in Live Button */}
            {onOpenTipModal && (
              <button
                type="button"
                onClick={onOpenTipModal}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <DollarSign size={14} />
                <span>Mandar PIX na Live</span>
              </button>
            )}
          </div>

          {/* Live Chat Title & Stats */}
          <div className="flex items-center justify-between border-t border-[#161826] pt-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#ff2e74]" />
              <h3 className="font-bold text-sm text-white">
                Bate-Papo da Live em Tempo Real
              </h3>
            </div>
            <span className="text-[11px] text-gray-400">
              {messages.length} mensagens enviadas
            </span>
          </div>

          {/* Messages list with smooth scrolling */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-2xl text-xs flex items-start justify-between gap-3 ${
                  m.isTip
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-100'
                    : m.isHost
                    ? 'bg-[#251027] border border-[#ff2e74]/40 text-rose-100'
                    : 'bg-[#12141f] border border-[#1e2337] text-gray-200'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{m.user}</span>
                    {m.isHost && (
                      <span className="px-1.5 py-0.2 rounded bg-[#ff2e74] text-white text-[9px] font-extrabold uppercase">
                        Criadora
                      </span>
                    )}
                    {m.isTip && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-black text-[9px] font-black uppercase">
                        PIX R$ {m.tipAmount}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-xs mt-0.5">{m.text}</p>
                </div>
                <span className="text-[10px] text-gray-500 shrink-0">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Chat Input Field */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Digite sua mensagem para a Ruivinha..."
              className="flex-1 h-11 px-4 rounded-xl bg-[#12141f] border border-[#1e2337] focus:border-[#ff2e74] text-xs sm:text-sm text-white focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="h-11 px-4 rounded-xl bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVE STUDIO MODAL */}
      <LiveStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        currentConfig={liveConfig}
        onStartLive={handleStartLive}
        onShowToast={onShowToast}
      />
    </div>
  );
}
