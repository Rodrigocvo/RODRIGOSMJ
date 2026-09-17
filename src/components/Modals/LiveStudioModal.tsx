import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { 
  X, 
  Radio, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  RefreshCw, 
  Play, 
  Check, 
  Copy, 
  ExternalLink, 
  HelpCircle,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react';
import { LiveStreamConfig, LiveSourceType } from '../../types';
import { LiveFilterCanvas } from '../LiveFilterCanvas';

interface LiveStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: LiveStreamConfig;
  onStartLive: (config: LiveStreamConfig, mediaStream?: MediaStream) => void;
  onShowToast: (msg: string) => void;
}

export function LiveStudioModal({
  isOpen,
  onClose,
  currentConfig,
  onStartLive,
  onShowToast,
}: LiveStudioModalProps) {
  const [sourceType, setSourceType] = useState<LiveSourceType>(currentConfig.sourceType || 'camera');
  const [title, setTitle] = useState(currentConfig.title || 'Live Privada da Ruivinha ✨');
  const [description, setDescription] = useState(
    currentConfig.description || 'Transmissão ao vivo interativa e exclusiva para assinantes VIP com bate-papo liberado!'
  );
  const [isVipOnly, setIsVipOnly] = useState<boolean>(currentConfig.isVipOnly ?? true);

  // Platform specific inputs
  const [youtubeUrl, setYoutubeUrl] = useState(currentConfig.youtubeUrl || '');
  const [twitchChannel, setTwitchChannel] = useState(currentConfig.twitchChannel || '');
  const [streamKey, setStreamKey] = useState(currentConfig.streamKey || 'live_vip_' + Math.random().toString(36).substring(2, 10));

  // Camera preview in modal
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [showFiltersPreview, setShowFiltersPreview] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize camera preview when camera mode is selected
  useEffect(() => {
    if (!isOpen) {
      stopCameraPreview();
      return;
    }

    if (sourceType === 'camera') {
      startCameraPreview();
    } else {
      stopCameraPreview();
    }

    return () => {
      stopCameraPreview();
    };
  }, [isOpen, sourceType, cameraFacing]);

  // Connect video element to stream
  useEffect(() => {
    if (videoRef.current && previewStream) {
      videoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  const stopCameraPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
      setPreviewStream(null);
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const startCameraPreview = async () => {
    stopCameraPreview();
    setIsLoadingCamera(true);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador não possui suporte para captura de vídeo direta.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      setPreviewStream(stream);
      setIsLoadingCamera(false);

      // Setup audio analyzer for microphone volume meter
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkAudio = () => {
            if (!analyser) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(checkAudio);
          };
          checkAudio();
        }
      } catch {
        // Audio meter optional
      }
    } catch (err: unknown) {
      setIsLoadingCamera(false);
      const errMsg = err instanceof Error ? err.message : 'Permissão negada';
      setCameraError(
        `Não foi possível acessar a câmera ou microfone (${errMsg}). Verifique as permissões no navegador ou use a transmissão via YouTube/Twitch.`
      );
    }
  };

  const toggleCameraTrack = () => {
    if (previewStream) {
      const videoTrack = previewStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleMicTrack = () => {
    if (previewStream) {
      const audioTrack = previewStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const flipCamera = () => {
    setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      onShowToast(`${label} copiado para a área de transferência!`);
    }
  };

  const handleSubmitStart = () => {
    if (!title.trim()) {
      onShowToast('Informe um título para sua transmissão.');
      return;
    }

    if (sourceType === 'youtube' && !youtubeUrl.trim()) {
      onShowToast('Informe o link ou ID da sua live no YouTube.');
      return;
    }

    if (sourceType === 'twitch' && !twitchChannel.trim()) {
      onShowToast('Informe o nome do seu canal na Twitch.');
      return;
    }

    const updatedConfig: LiveStreamConfig = {
      id: `live-${Date.now()}`,
      isActive: true,
      title: title.trim(),
      description: description.trim(),
      sourceType,
      youtubeUrl: youtubeUrl.trim(),
      twitchChannel: twitchChannel.trim().replace(/^https?:\/\/(www\.)?twitch\.tv\//, ''),
      streamKey,
      isVipOnly,
      viewersCount: Math.floor(Math.random() * 60) + 120, // initial engaged viewers
      startedAt: Date.now(),
    };

    onStartLive(updatedConfig, previewStream || undefined);
    onClose();
    onShowToast('🔴 Você está AO VIVO agora! Seus assinantes já estão assistindo.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#0e1017] rounded-3xl border border-[#1e2337] shadow-2xl overflow-hidden z-10 my-6 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#1e2337] flex items-center justify-between bg-gradient-to-r from-[#1c0f1e] via-[#10121a] to-[#1a0e1c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,46,116,0.6)] shrink-0">
              <Radio size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-['Playfair_Display',serif]">
                  Estúdio de Transmissão ao Vivo
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold uppercase">
                  Ao Vivo
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Transmita diretamente com a câmera do seu celular/PC ou conecte YouTube e Twitch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#141722] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 flex flex-col gap-6 max-h-[78vh] overflow-y-auto">
          {/* STEP 1: Escolha a Plataforma / Fonte */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#ff2e74] text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <span>Como você quer transmitir?</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Option 1: Câmera Direta */}
              <div
                onClick={() => setSourceType('camera')}
                className={`p-3 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center gap-1.5 select-none ${
                  sourceType === 'camera'
                    ? 'bg-[#221025] border-2 border-[#ff2e74] shadow-[0_0_15px_rgba(255,46,116,0.3)]'
                    : 'bg-[#090b10] border border-[#1e2337] hover:border-[#ff2e74]/40'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#ff2e74]/20 text-[#ff4d88] flex items-center justify-center">
                  <Video size={16} />
                </div>
                <div className="font-bold text-xs text-white">Câmera Direta</div>
                <div className="text-[10px] text-gray-400">Celular ou Webcam</div>
              </div>

              {/* Option 2: YouTube Live */}
              <div
                onClick={() => setSourceType('youtube')}
                className={`p-3 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center gap-1.5 select-none ${
                  sourceType === 'youtube'
                    ? 'bg-[#221025] border-2 border-[#ff2e74] shadow-[0_0_15px_rgba(255,46,116,0.3)]'
                    : 'bg-[#090b10] border border-[#1e2337] hover:border-[#ff2e74]/40'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                  <Play size={16} />
                </div>
                <div className="font-bold text-xs text-white">YouTube Live</div>
                <div className="text-[10px] text-gray-400">Link ou ID da Live</div>
              </div>

              {/* Option 3: Twitch */}
              <div
                onClick={() => setSourceType('twitch')}
                className={`p-3 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center gap-1.5 select-none ${
                  sourceType === 'twitch'
                    ? 'bg-[#221025] border-2 border-[#ff2e74] shadow-[0_0_15px_rgba(255,46,116,0.3)]'
                    : 'bg-[#090b10] border border-[#1e2337] hover:border-[#ff2e74]/40'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center">
                  <Radio size={16} />
                </div>
                <div className="font-bold text-xs text-white">Twitch TV</div>
                <div className="text-[10px] text-gray-400">Canal ao vivo</div>
              </div>

              {/* Option 4: OBS Studio / RTMP */}
              <div
                onClick={() => setSourceType('obs')}
                className={`p-3 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center gap-1.5 select-none ${
                  sourceType === 'obs'
                    ? 'bg-[#221025] border-2 border-[#ff2e74] shadow-[0_0_15px_rgba(255,46,116,0.3)]'
                    : 'bg-[#090b10] border border-[#1e2337] hover:border-[#ff2e74]/40'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Monitor size={16} />
                </div>
                <div className="font-bold text-xs text-white">OBS Studio</div>
                <div className="text-[10px] text-gray-400">Chave RTMP</div>
              </div>
            </div>
          </div>

          {/* SOURCE SPECIFIC SETUP */}

          {/* 1. WEBCAM / CELULAR PREVIEW */}
          {sourceType === 'camera' && (
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#090b10] border border-[#1e2337]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Video size={14} className="text-[#ff2e74]" />
                  <span>Prévia da Sua Câmera e Microfone</span>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFiltersPreview(!showFiltersPreview)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
                      showFiltersPreview 
                        ? 'bg-[#ff2e74]/20 border-[#ff2e74] text-[#ff4d88]' 
                        : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                    }`}
                  >
                    <Sparkles size={12} className={showFiltersPreview ? 'animate-pulse' : ''} />
                    <span>{showFiltersPreview ? 'Filtros Ativos' : 'Testar Filtros'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={startCameraPreview}
                    className="text-xs text-[#ff4d88] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw size={12} />
                    <span>Reiniciar Câmera</span>
                  </button>
                </div>
              </div>

              {/* Video Box */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-[#1e2337]">
                {previewStream ? (
                  showFiltersPreview ? (
                    <LiveFilterCanvas
                      videoElement={videoRef.current}
                      fallbackImageUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1600&auto=format&fit=crop"
                      isHostAdmin={true}
                      onShowToast={onShowToast}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                  )
                ) : (
                  <div className="p-6 text-center flex flex-col items-center gap-2">
                    {isLoadingCamera ? (
                      <>
                        <div className="w-8 h-8 rounded-full border-2 border-[#ff2e74] border-t-transparent animate-spin" />
                        <span className="text-xs text-gray-400">Iniciando sua câmera...</span>
                      </>
                    ) : (
                      <>
                        <VideoOff size={32} className="text-gray-600" />
                        <span className="text-xs text-gray-400">
                          {cameraError || 'Clique em Iniciar Câmera para permitir o acesso no navegador.'}
                        </span>
                        <button
                          type="button"
                          onClick={startCameraPreview}
                          className="mt-2 px-4 py-1.5 rounded-xl bg-[#ff2e74] hover:bg-[#ff1a66] text-white text-xs font-bold shadow-md"
                        >
                          Ativar Câmera Agora
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Status Overlays */}
                {previewStream && (
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Câmera Pronta</span>
                    </span>
                  </div>
                )}

                {/* Quick Camera/Mic Controls */}
                {previewStream && (
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleMicTrack}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                          micEnabled ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {micEnabled ? <Mic size={14} /> : <MicOff size={14} />}
                        <span>{micEnabled ? 'Microfone Ativo' : 'Mutado'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={toggleCameraTrack}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                          cameraEnabled ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {cameraEnabled ? <Video size={14} /> : <VideoOff size={14} />}
                        <span>{cameraEnabled ? 'Vídeo Ligado' : 'Vídeo Desligado'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={flipCamera}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1"
                        title="Alternar Câmera frontal / traseira"
                      >
                        <RefreshCw size={13} />
                        <span className="hidden sm:inline">Inverter</span>
                      </button>
                    </div>

                    {/* Audio Volume Bar */}
                    <div className="flex items-center gap-1.5 px-2">
                      <span className="text-[10px] text-gray-400">Som:</span>
                      <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-[#ff2e74] transition-all duration-75"
                          style={{ width: `${audioLevel}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. YOUTUBE LIVE INTEGRATION */}
          {sourceType === 'youtube' && (
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#090b10] border border-[#1e2337]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Play size={14} className="text-red-500" />
                  <span>Configuração da Live no YouTube</span>
                </span>
                <a
                  href="https://studio.youtube.com/channel/live"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-red-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Abrir YouTube Studio</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <p className="text-xs text-gray-400">
                Inicie uma transmissão no YouTube Studio (pode ser Não-Listada ou Pública) e cole aqui o link ou código do vídeo. O player ao vivo será embutido diretamente para seus membros!
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-300">
                  Link ou ID da Live no YouTube:
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="h-11 px-3.5 bg-[#131521] border border-[#1e2337] focus:border-[#ff2e74] rounded-xl text-xs sm:text-sm text-white focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#141722] border border-white/5 text-[11px] text-gray-400 flex items-start gap-2">
                <HelpCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Dica Pro:</strong> Você pode deixar a live como "Não-listada" no YouTube para que somente os assinantes do seu cantinho VIP consigam assistir através do player embutido!
                </span>
              </div>
            </div>
          )}

          {/* 3. TWITCH TV INTEGRATION */}
          {sourceType === 'twitch' && (
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#090b10] border border-[#1e2337]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Radio size={14} className="text-purple-400" />
                  <span>Configuração da Live na Twitch</span>
                </span>
                <a
                  href="https://dashboard.twitch.tv"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Abrir Twitch Dashboard</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <p className="text-xs text-gray-400">
                Transmita do seu PC ou celular para a Twitch. Os assinantes da Ruivinha VIP assistirão em tempo real sincronizado.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-300">
                  Nome do seu Canal na Twitch:
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">twitch.tv/</span>
                  <input
                    type="text"
                    placeholder="ex.: ruivinha_vip"
                    value={twitchChannel}
                    onChange={(e) => setTwitchChannel(e.target.value)}
                    className="flex-1 h-11 px-3.5 bg-[#131521] border border-[#1e2337] focus:border-[#ff2e74] rounded-xl text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. OBS STUDIO / RTMP */}
          {sourceType === 'obs' && (
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#090b10] border border-[#1e2337]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Monitor size={14} className="text-blue-400" />
                  <span>Parâmetros de Conexão com OBS Studio</span>
                </span>
                <span className="text-[11px] text-blue-400 font-semibold">
                  RTMP 1080p 60fps
                </span>
              </div>

              <p className="text-xs text-gray-400">
                No OBS Studio, vá em <strong>Configurações &gt; Transmissão &gt; Personalizado</strong> e insira os dados abaixo:
              </p>

              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-gray-300 font-bold">Servidor RTMP:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="rtmp://live.ruivinhavip.com/app"
                      className="flex-1 h-10 px-3 bg-[#131521] border border-[#1e2337] rounded-xl text-xs font-mono text-gray-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy('rtmp://live.ruivinhavip.com/app', 'Servidor RTMP')}
                      className="h-10 px-3 rounded-xl bg-[#1e2337] hover:bg-[#272e48] text-white text-xs font-semibold flex items-center gap-1 shrink-0"
                    >
                      <Copy size={13} />
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-gray-300 font-bold">Chave de Transmissão (Stream Key):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      readOnly
                      value={streamKey}
                      className="flex-1 h-10 px-3 bg-[#131521] border border-[#1e2337] rounded-xl text-xs font-mono text-gray-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(streamKey, 'Chave de Transmissão')}
                      className="h-10 px-3 rounded-xl bg-[#1e2337] hover:bg-[#272e48] text-white text-xs font-semibold flex items-center gap-1 shrink-0"
                    >
                      <Copy size={13} />
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Título e Descrição */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#ff2e74] text-white text-[11px] font-bold flex items-center justify-center">2</span>
              <span>Título e detalhes da Live</span>
            </label>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-300">
                Título da Transmissão
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Live Privada Especial de Domingo com a Ruivinha"
                className="h-11 px-4 rounded-xl bg-[#090b10] border border-[#1e2337] focus:border-[#ff2e74] text-xs sm:text-sm text-white focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-300">
                Descrição ou Recado para os Fãs
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex.: Hoje vou responder todas as perguntas e abrir pedidos especiais no chat!"
                className="p-3.5 rounded-xl bg-[#090b10] border border-[#1e2337] focus:border-[#ff2e74] text-xs sm:text-sm text-white focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* STEP 3: Tipo de Acesso (VIP vs Público) */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#ff2e74] text-white text-[11px] font-bold flex items-center justify-center">3</span>
              <span>Quem pode assistir</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setIsVipOnly(true)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all flex items-center gap-3 select-none ${
                  isVipOnly
                    ? 'bg-[#221025] border-2 border-[#ff2e74] shadow-[0_0_15px_rgba(255,46,116,0.3)]'
                    : 'bg-[#090b10] border border-[#1e2337]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#ff2e74]/20 text-[#ff4d88] flex items-center justify-center shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-white">Exclusivo VIP</div>
                  <div className="text-[11px] text-gray-400">Apenas assinantes do plano ativo</div>
                </div>
              </div>

              <div
                onClick={() => setIsVipOnly(false)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all flex items-center gap-3 select-none ${
                  !isVipOnly
                    ? 'bg-[#221025] border-2 border-[#ff2e74] shadow-[0_0_15px_rgba(255,46,116,0.3)]'
                    : 'bg-[#090b10] border border-[#1e2337]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Globe size={18} />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-white">Live Pública Grátis</div>
                  <div className="text-[11px] text-gray-400">Aberta para todos os visitantes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Action */}
        <div className="p-5 sm:p-6 border-t border-[#1e2337] flex items-center justify-between gap-3 bg-[#0a0b10]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#141722] text-gray-300 hover:text-white text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmitStart}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-red-600 via-[#ff1a66] to-[#ff2e74] hover:brightness-110 text-white font-bold text-sm shadow-[0_0_25px_rgba(255,46,116,0.6)] flex items-center gap-2 transition-all active:scale-95"
          >
            <Radio size={16} className="animate-ping" />
            <span>INICIAR TRANSMISSÃO AO VIVO</span>
          </button>
        </div>
      </div>
    </div>
  );
}
