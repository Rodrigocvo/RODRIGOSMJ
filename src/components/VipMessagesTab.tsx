import { useState, FormEvent, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  CheckCheck, 
  Lock, 
  Heart, 
  Crown, 
  Volume2, 
  Play, 
  Pause, 
  ShieldCheck, 
  Smile,
  Flame,
  LockOpen,
  ArrowRight
} from 'lucide-react';
import { CreatorProfile, User } from '../types';

interface VipMessagesTabProps {
  creator: CreatorProfile;
  user: User | null;
  isSubscribed: boolean;
  isAdmin: boolean;
  onOpenSubscribe: () => void;
  onShowToast: (msg: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'creator';
  text: string;
  time: string;
  audio?: boolean;
  audioDuration?: string;
  reactions?: string[];
}

const STORAGE_KEY = 'ruivinha_vip_messages_tab_v2';

export function VipMessagesTab({
  creator,
  user,
  isSubscribed,
  isAdmin,
  onOpenSubscribe,
  onShowToast,
}: VipMessagesTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: '1',
        sender: 'creator',
        text: 'Oiee amor! Seja muito bem-vindo ao meu chat privado exclusivo ✨ Aqui você fala diretamente comigo!',
        time: '14:20',
        reactions: ['❤️'],
      },
      {
        id: '2',
        sender: 'creator',
        text: 'Gravei um áudio especial para os meus assinantes hoje! Dá o play para ouvir 🎙️',
        time: '14:22',
        audio: true,
        audioDuration: '0:38',
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canAccess = isSubscribed || isAdmin;

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (canAccess) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, canAccess]);

  const handleSendMessage = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputMessage.trim();
    if (!clean) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: clean,
      time: timeStr,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    // Creator typing response simulation
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replies = [
        'Oii amor! Acabei de ver sua mensagem 🥰 Amei você por aqui!',
        'Que carinho gostoso! Fica de olho que hoje à noite tem novidade quentinha no feed 🔥',
        'Você é um amor! Qualquer pedido especial é só me falar por aqui que eu adoro atender meus VIPs ❤️',
        'Obrigada pela mensagem lindo! Estou preparando um ensaio inédito só pra vocês!',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const creatorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'creator',
        text: randomReply,
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        reactions: ['🔥'],
      };
      setMessages((prev) => [...prev, creatorMsg]);
      onShowToast('Nova resposta recebida no chat VIP!');
    }, 2000);
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const current = msg.reactions || [];
          const exists = current.includes(emoji);
          return {
            ...msg,
            reactions: exists ? current.filter((e) => e !== emoji) : [...current, emoji],
          };
        }
        return msg;
      })
    );
  };

  const handleToggleAudio = (msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      setTimeout(() => {
        setPlayingAudioId((curr) => (curr === msgId ? null : curr));
      }, 6000);
    }
  };

  // LOCKED STATE (For Non-Subscribers)
  if (!canAccess) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
        {/* Hero Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#131726] to-[#0a0c14] border border-[#22283e] p-6 sm:p-10 flex flex-col items-center text-center shadow-2xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 w-72 h-72 bg-[#ff2e74]/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

          {/* Lock Emblem */}
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#ff1a66] to-[#ff4d88] flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,46,116,0.5)]">
              <Lock size={36} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#0a0c14] border-2 border-[#22283e] flex items-center justify-center text-amber-400 text-sm font-bold shadow-md">
              <Crown size={16} />
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-[#ff2e74]/15 border border-[#ff2e74]/30 text-[#ff4d88] text-xs font-bold uppercase tracking-wider mb-3">
            Área Privativa &bull; 100% Exclusiva para Assinantes
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Playfair_Display',serif] max-w-lg mb-3 leading-tight">
            Chat Privado 1 a 1 com {creator.name}
          </h2>

          <p className="text-sm text-gray-300 max-w-md mb-8 leading-relaxed">
            Converse diretamente no privado, receba áudios íntimos, solicite conteúdos personalizados e tenha acesso direto e prioritário.
          </p>

          {/* Features Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mb-8 text-left">
            <div className="p-3.5 rounded-2xl bg-[#121524] border border-[#20273d] flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#ff2e74]/15 text-[#ff2e74] flex items-center justify-center shrink-0">
                💬
              </div>
              <div>
                <strong className="text-white text-xs block font-bold">Chat 1 a 1 Direto</strong>
                <span className="text-[11px] text-gray-400">Sem robôs ou intermediários</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#121524] border border-[#20273d] flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                🎙️
              </div>
              <div>
                <strong className="text-white text-xs block font-bold">Áudios Exclusivos</strong>
                <span className="text-[11px] text-gray-400">Gravados só para você</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#121524] border border-[#20273d] flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                ⚡
              </div>
              <div>
                <strong className="text-white text-xs block font-bold">Acesso Imediato</strong>
                <span className="text-[11px] text-gray-400">Liberação via PIX 0% taxa</span>
              </div>
            </div>
          </div>

          {/* Blurred preview of recent chats */}
          <div className="w-full max-w-md bg-[#0a0c16]/80 rounded-2xl border border-[#1e2337] p-4 mb-8 filter blur-sm pointer-events-none opacity-50 space-y-2">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-500 shrink-0" />
              <div className="bg-[#181c2e] p-2.5 rounded-2xl text-xs text-white max-w-[80%]">
                Oii amor! Mandei um áudio lindo pra você ouvir agora...
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <div className="bg-[#ff2e74] p-2.5 rounded-2xl text-xs text-white">
                Adorei muito! Você é perfeita demais ❤️
              </div>
            </div>
          </div>

          {/* Unlock Button */}
          <button
            onClick={onOpenSubscribe}
            className="w-full max-w-md h-14 rounded-2xl bg-gradient-to-r from-[#ff1a66] via-[#ff2e74] to-[#ff5a36] text-white font-extrabold text-base shadow-[0_8px_30px_rgba(255,46,116,0.5)] hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-98"
          >
            <LockOpen size={20} />
            <span>Assinar VIP para Liberar Mensagens</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // UNLOCKED STATE (For Subscribers & Admin)
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[75vh] bg-[#0c0e18] border border-[#1e2337] rounded-3xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 bg-[#080a12] border-b border-[#1c2033] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={creator.avatarUrl}
              alt={creator.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#ff2e74] shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#080a12] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-base font-['Playfair_Display',serif]">
                {creator.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#ff2e74]/20 border border-[#ff2e74]/40 text-[#ff4d88] text-[10px] font-extrabold">
                VIP CHAT
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Online agora &bull; Responde em minutos</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141727] border border-[#22283e] text-xs text-gray-300">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Criptografado ponta a ponta</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-[#0c0e18] to-[#07080f]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isPlaying = playingAudioId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <img
                  src={creator.avatarUrl}
                  alt={creator.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#ff2e74]/50 shrink-0 mb-1"
                />
              )}

              <div
                className={`relative max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] text-white rounded-br-none shadow-[0_4px_15px_rgba(255,46,116,0.3)]'
                    : 'bg-[#151829] border border-[#232942] text-gray-200 rounded-bl-none shadow-md'
                }`}
              >
                {/* Audio Message Display */}
                {msg.audio ? (
                  <div className="flex items-center gap-3 py-1">
                    <button
                      onClick={() => handleToggleAudio(msg.id)}
                      className="w-10 h-10 rounded-full bg-[#ff2e74] hover:bg-[#ff1a66] text-white flex items-center justify-center shrink-0 shadow-lg transition-transform active:scale-95"
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
                    </button>
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-1 h-5">
                        {/* Audio Waveform visualizer bars */}
                        {[40, 70, 90, 45, 80, 100, 60, 85, 30, 75, 95, 50, 80].map((h, i) => (
                          <span
                            key={i}
                            className={`w-1 rounded-full transition-all duration-200 ${
                              isPlaying ? 'bg-[#ff4d88] animate-pulse' : 'bg-gray-500'
                            }`}
                            style={{ height: `${isPlaying ? Math.max(20, (h * (i % 3 + 1)) % 100) : h}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>{isPlaying ? 'Reproduzindo áudio íntimo...' : 'Mensagem de voz exclusiva'}</span>
                        <span className="font-mono">{msg.audioDuration || '0:38'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}

                {/* Footer Time & Status */}
                <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                  isUser ? 'text-white/80' : 'text-gray-400'
                }`}>
                  <span>{msg.time}</span>
                  {isUser && <CheckCheck size={12} className="text-white" />}
                </div>

                {/* Reaction pill */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="absolute -bottom-2.5 right-2 px-1.5 py-0.5 rounded-full bg-[#1b1f33] border border-[#2c3454] text-[10px] flex items-center gap-0.5 shadow-sm">
                    {msg.reactions.map((r, i) => (
                      <span key={i}>{r}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick heart button */}
              <button
                onClick={() => handleToggleReaction(msg.id, '❤️')}
                className="opacity-0 hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-[#ff2e74]"
              >
                <Heart size={14} />
              </button>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <img
              src={creator.avatarUrl}
              alt={creator.name}
              className="w-6 h-6 rounded-full object-cover border border-[#ff2e74]"
            />
            <div className="px-3 py-2 rounded-2xl bg-[#151829] border border-[#232942] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2e74] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2e74] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2e74] animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-gray-300 ml-1">{creator.name} está digitando...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Icebreakers */}
      <div className="px-4 py-2 bg-[#090b14] border-t border-[#171a2b] flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider shrink-0">
          Sugestões:
        </span>
        {[
          'Oii amor, posta mais fotos hoje? 😍',
          'Grava um áudio lindo pra mim? 🎙️',
          'Adorei seu último ensaio VIP 🔥',
          'Você é maravilhosa! ❤️',
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setInputMessage(s);
            }}
            className="px-2.5 py-1 rounded-full bg-[#141727] hover:bg-[#ff2e74]/20 border border-[#22283e] hover:border-[#ff2e74]/40 text-[11px] text-gray-300 hover:text-white shrink-0 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-[#080a12] border-t border-[#1c2033] flex items-center gap-2.5">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Digite sua mensagem privativa para ${creator.name}...`}
          className="flex-1 h-12 px-4 rounded-2xl bg-[#121524] border border-[#20273d] text-sm text-white focus:outline-none focus:border-[#ff2e74] placeholder:text-gray-500"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="h-12 px-5 rounded-2xl bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] disabled:opacity-40 hover:brightness-110 text-white font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(255,46,116,0.4)] transition-all active:scale-95 shrink-0"
        >
          <Send size={16} />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>
    </div>
  );
}
