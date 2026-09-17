import { useState, FormEvent, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  CheckCheck, 
  Lock, 
  Heart, 
  Flame, 
  Crown, 
  Volume2, 
  Play, 
  Pause, 
  ShieldCheck, 
  Paperclip,
  Smile
} from 'lucide-react';
import { CreatorProfile } from '../../types';

interface DmModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: CreatorProfile;
  isSubscribed?: boolean;
  isAdmin?: boolean;
  onOpenSubscribe?: () => void;
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

const STORAGE_KEY = 'ruivinha_vip_chat_messages_v1';

export function DmModal({ 
  isOpen, 
  onClose, 
  creator,
  isSubscribed = false,
  isAdmin = false,
  onOpenSubscribe = () => {}
}: DmModalProps) {
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
        text: 'Oiee amor! Seja muito bem-vindo ao meu chat privativo exclusivo ✨ Aqui você pode falar diretamente comigo!',
        time: '14:20',
        reactions: ['❤️'],
      },
      {
        id: '2',
        sender: 'creator',
        text: 'Te mandei esse áudio de boas-vindas especial:',
        time: '14:21',
        audio: true,
        audioDuration: '0:18',
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages]);

  // Audio player simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 6;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  if (!isOpen) return null;

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Creator response simulation in real-time
    setTimeout(() => {
      const responses = [
        'Adorei sua mensagem! Muito obrigada pelo apoio no VIP, você faz toda a diferença aqui ❤️',
        'Que carinho maravilhoso! Já estou preparando fotos e ensaios novinhos que você vai amar 🔥',
        'Recebi seu recado! Estou online organizando a próxima Live VIP. Não perde hein! 💋',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const creatorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'creator',
        text: randomResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: ['❤️'],
      };
      setMessages((prev) => [...prev, creatorMsg]);
    }, 1200);
  };

  const handleReact = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const current = msg.reactions || [];
          const next = current.includes(emoji)
            ? current.filter((r) => r !== emoji)
            : [...current, emoji];
          return { ...msg, reactions: next };
        }
        return msg;
      })
    );
  };

  const isVipUser = isSubscribed || isAdmin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#121420] border border-[#1e2337] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[580px] max-h-[90vh] z-10">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-[#1e2337] flex items-center justify-between bg-[#0a0b10]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={creator.avatarUrl}
                alt={creator.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#ff2e74]"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0a0b10] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base text-white font-['Playfair_Display',serif]">
                  {creator.name}
                </h3>
                <Sparkles size={14} className="text-[#ff2e74]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-400 font-medium">Online agora</span>
                <span className="text-gray-500 text-[10px]">•</span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  Chat Criptografado VIP
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1c2032] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT: GATED VIP WALL OR CHAT */}
        {!isVipUser ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0d0f18] gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#ff1a66]/20 via-[#ff2e74]/20 to-[#ff4d88]/20 border border-[#ff2e74]/40 flex items-center justify-center text-[#ff2e74] shadow-[0_0_35px_rgba(255,46,116,0.3)]">
              <Lock size={36} />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#ff2e74]/15 border border-[#ff2e74]/30 text-[#ff4d88] text-xs font-bold uppercase tracking-wider">
                Área Privativa & Restrita
              </span>
              <h4 className="font-['Playfair_Display',serif] text-2xl font-black text-white mt-3">
                Chat Privado com {creator.name}
              </h4>
              <p className="text-sm text-gray-300 max-w-sm mt-2 leading-relaxed">
                O chat direto é 100% exclusivo para assinantes VIP ativos. Converse em particular, envie mensagens, receba fotos e áudios personalizados.
              </p>
            </div>

            <div className="w-full max-w-xs flex flex-col gap-2.5">
              <button
                onClick={() => {
                  onClose();
                  onOpenSubscribe();
                }}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] text-white font-bold text-sm shadow-[0_8px_24px_-4px_rgba(255,46,116,0.5)] hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Crown size={18} />
                <span>Assinar VIP para Liberar Chat</span>
              </button>

              <span className="text-[11px] text-gray-400">
                Acesso imediato com PIX 0% taxa pelo AbacatePay
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* VIP Status Banner */}
            <div className="px-4 py-2 bg-gradient-to-r from-[#19101d] to-[#0e1017] border-b border-[#1e2337] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-300">
                <Crown size={14} className="text-[#fbbf24]" />
                <span className="font-semibold text-white">Canal Privativo VIP</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40">
                {isAdmin ? 'ADMINISTRADOR' : 'ASSINANTE VIP ATIVO'}
              </span>
            </div>

            {/* Message list */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4 bg-[#0a0b10] protect-content">
              {messages.map((m) => {
                const isMe = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
                      isMe ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                        isMe
                          ? 'bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] text-white rounded-br-none shadow-[0_4px_16px_rgba(255,46,116,0.3)]'
                          : 'bg-[#151724] text-[#e1e2eb] rounded-bl-none border border-[#22283d]'
                      }`}
                    >
                      {/* Audio message block if present */}
                      {m.audio ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-gray-200">{m.text}</p>
                          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/10">
                            <button
                              type="button"
                              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                              className="w-9 h-9 rounded-full bg-[#ff2e74] text-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                            >
                              {isPlayingAudio ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                            </button>
                            <div className="flex-1 flex flex-col gap-1">
                              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#ff2e74] transition-all duration-300"
                                  style={{ width: `${audioProgress}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[10px] text-gray-400">
                                <span>{isPlayingAudio ? 'Reproduzindo...' : 'Áudio da Ruivinha'}</span>
                                <span>{m.audioDuration || '0:18'}</span>
                              </div>
                            </div>
                            <Volume2 size={16} className="text-[#ff2e74] shrink-0" />
                          </div>
                        </div>
                      ) : (
                        <span>{m.text}</span>
                      )}

                      {/* Reactions Pills */}
                      {m.reactions && m.reactions.length > 0 && (
                        <div className="absolute -bottom-3 right-2 flex items-center gap-1 bg-[#1c2032] border border-[#272d45] rounded-full px-2 py-0.5 shadow-md">
                          {m.reactions.map((r, i) => (
                            <span key={i} className="text-xs">{r}</span>
                          ))}
                        </div>
                      )}

                      {/* Quick React Bar on hover */}
                      <div className="absolute -top-7 right-0 hidden group-hover:flex items-center gap-1 bg-[#1c2032] border border-[#272d45] rounded-full px-2 py-1 shadow-lg z-10">
                        {['❤️', '🔥', '💋', '😍'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleReact(m.id, emoji)}
                            className="hover:scale-125 transition-transform text-xs"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1 px-1">
                      <span>{m.time}</span>
                      {isMe && <CheckCheck size={13} className="text-[#34d399]" />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Send input */}
            <form
              onSubmit={handleSend}
              className="p-3 sm:p-4 border-t border-[#1e2337] bg-[#0a0b10] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escreva sua mensagem no chat VIP..."
                className="flex-1 h-11 px-4 rounded-2xl bg-[#131521] border border-[#22283d] text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ff2e74]"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] text-white flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all shadow-[0_4px_16px_rgba(255,46,116,0.4)] disabled:opacity-40 disabled:hover:scale-100"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
