import { PhoneCall, ShieldCheck, Clock, Video, Sparkles, CheckCircle2 } from 'lucide-react';

interface ChamadasTabProps {
  creatorName: string;
  onBookCall: (title: string, duration: string, price: number) => void;
}

export function ChamadasTab({ creatorName, onBookCall }: ChamadasTabProps) {
  const plans = [
    {
      id: 'call-15',
      title: 'Chamada Rápida VIP',
      duration: '15 Minutos',
      price: 99.00,
      description: 'Conversa descontraída 1 a 1 para nos conhecermos melhor com total privacidade.',
      features: ['Câmera 1080p HD', 'Áudio privado 1 a 1', 'Agendamento no mesmo dia', 'Sem gravação (100% seguro)'],
      badge: null,
      highlight: false,
    },
    {
      id: 'call-30',
      title: 'Chamada Especial Interativa',
      duration: '30 Minutos',
      price: 179.00,
      description: 'Momento exclusivo com mais intimidade, carinho e bate-papo sem pressa.',
      features: ['Mais procurada pelos fãs', 'Total privacidade e discrição', 'Look especial à sua escolha', 'Acesso direto ao WhatsApp VIP'],
      badge: 'Mais Escolhida',
      highlight: true,
    },
    {
      id: 'call-45',
      title: 'Experiência Suprema VIP',
      duration: '45 Minutos',
      price: 249.00,
      description: 'Tempo estendido com total atenção dedicada a você, atendimento premium.',
      features: ['Tempo estendido sem cortes', 'Prioridade máxima na agenda', 'Presente especial pós-chamada', 'Suporte direto no chat'],
      badge: 'Exclusivo',
      highlight: false,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#19131c] via-[#131521] to-[#1a121d] border border-[#1e2337] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,46,116,0.4)]">
            <PhoneCall size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white font-['Playfair_Display',serif]">
                Chamadas de Vídeo Privadas 1 a 1
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                Discreto & Seguro
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              Converse ao vivo e exclusivamente com a {creatorName}. Agendamento imediato via PIX.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ShieldCheck size={16} className="text-[#34d399]" />
          <span>100% Confidencial</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5 transition-all relative overflow-hidden ${
              p.highlight
                ? 'bg-gradient-to-b from-[#1c1424] to-[#131521] border-2 border-[#ff2e74] shadow-[0_8px_30px_rgba(255,46,116,0.25)]'
                : 'bg-[#131521] border border-[#1e2337] hover:border-[#ff2e74]/50 shadow-xl'
            }`}
          >
            {p.badge && (
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                {p.badge}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Clock size={14} className="text-[#ff2e74]" />
                <span>{p.duration}</span>
              </div>

              <div>
                <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-white">
                  {p.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="pt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  R$ {p.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs text-gray-400 ml-1.5">/ sessão</span>
              </div>

              <div className="pt-3 border-t border-[#1e2337] flex flex-col gap-2">
                {p.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                    <CheckCircle2 size={13} className="text-[#34d399] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onBookCall(p.title, p.duration, p.price)}
              className={`w-full h-11 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md ${
                p.highlight
                  ? 'bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] hover:brightness-110 text-white shadow-[0_4px_16px_rgba(255,46,116,0.35)]'
                  : 'bg-[#1e2337] hover:bg-[#ff2e74] text-white'
              }`}
            >
              <Video size={16} />
              <span>Agendar via PIX</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
