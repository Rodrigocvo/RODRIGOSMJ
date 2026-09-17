import { useState, MouseEvent } from 'react';
import { 
  CheckCircle2, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Lock, 
  LockOpen, 
  Layers, 
  ShoppingBag, 
  ExternalLink, 
  Gift, 
  Sun, 
  Moon, 
  Play, 
  Share2,
  Maximize2,
  Edit2,
  Trash2
} from 'lucide-react';
import { Post } from '../types';
import { SafeImage } from './SafeImage';

export interface PostCardProps {
  key?: string;
  post: Post;
  isAdmin?: boolean;
  isSubscribed?: boolean;
  onLikeToggle: (postId: string) => void;
  onSaveToggle: (postId: string) => void;
  onOpenComments: (post: Post) => void;
  onOpenSubscribeModal: () => void;
  onOpenPpvModal: (post: Post) => void;
  onOpenTipModal: (post?: Post) => void;
  onOpenMediaTheater: (post: Post) => void;
  onImageClick?: (url: string, title: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onUpdatePrice?: (postId: string, newPrice: number) => void;
  onDeletePost?: (postId: string) => void;
  onShowToast: (msg: string) => void;
}

export function PostCard({
  post,
  isAdmin = false,
  isSubscribed = false,
  onLikeToggle,
  onSaveToggle,
  onOpenComments,
  onOpenSubscribeModal,
  onOpenPpvModal,
  onOpenTipModal,
  onOpenMediaTheater,
  onVotePoll,
  onUpdatePrice,
  onDeletePost,
  onShowToast,
}: PostCardProps) {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(post.ppvPrice ? post.ppvPrice.toString() : '19.90');

  const handleCopyDirectLink = (url: string, e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    onShowToast('Link direto da imagem copiado com sucesso!');
  };

  const handleSavePrice = () => {
    const parsed = parseFloat(priceInput.replace(',', '.')) || 19.90;
    if (onUpdatePrice) {
      onUpdatePrice(post.id, parsed);
      setIsEditingPrice(false);
      onShowToast(`Preço do post atualizado para R$ ${parsed.toFixed(2).replace('.', ',')}!`);
    }
  };

  return (
    <article className="bg-[#131521] rounded-2xl overflow-hidden border border-[#1e2337] shadow-xl transition-all duration-300 hover:border-[#ff2e74]/40">
      {/* Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onOpenMediaTheater(post)}
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer ring-2 ring-[#ff2e74]/40"
          >
            <SafeImage
              src={post.creatorAvatar}
              fallbackSrc="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
              alt={post.creatorName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm sm:text-base text-white">
                {post.creatorName}
              </span>
              {post.isVerified && (
                <CheckCircle2 size={15} className="fill-[#ff2e74] text-[#131521]" />
              )}
            </div>
            <span className="text-xs text-gray-400">{post.timestamp}</span>
          </div>
        </div>

        {/* Right tags & Admin actions */}
        <div className="flex items-center gap-2">
          {post.audienceBadge.type === 'public' && (
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-500/20 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {post.audienceBadge.label}
            </span>
          )}

          {post.audienceBadge.type === 'vip' && (
            <span className="px-3 py-1 rounded-full bg-[#ff2e74]/20 text-[#ff4d88] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#ff2e74]/30 shadow-sm">
              <Lock size={13} className="text-[#ff2e74]" />
              {post.audienceBadge.label}
            </span>
          )}

          {post.audienceBadge.type === 'ppv' && (
            <span className="px-3 py-1 rounded-full bg-[#ff2e74]/20 text-[#ff4d88] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#ff2e74]/30 shadow-sm">
              <ShoppingBag size={13} className="text-[#ff4d88]" />
              {post.audienceBadge.label}
            </span>
          )}

          {post.audienceBadge.type === 'poll' && (
            <span className="px-3 py-1 rounded-full bg-[#1e2337] text-gray-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#2a3048] shadow-sm">
              <Layers size={13} />
              {post.audienceBadge.label}
            </span>
          )}

          {/* Admin Controls on the post */}
          {isAdmin && (
            <div className="flex items-center gap-1 ml-1 pl-2 border-l border-[#1e2337]">
              {post.type === 'ppv-video' && (
                <button
                  onClick={() => setIsEditingPrice(!isEditingPrice)}
                  className="p-1.5 rounded-lg bg-[#191e2b] hover:bg-[#242a3a] text-gray-300 hover:text-white"
                  title="Alterar valor deste post PPV"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {onDeletePost && (
                <button
                  onClick={() => {
                    if (window.confirm('Excluir este post do feed?')) {
                      onDeletePost(post.id);
                      onShowToast('Post excluído com sucesso.');
                    }
                  }}
                  className="p-1.5 rounded-lg bg-[#191e2b] hover:bg-rose-900/40 text-gray-400 hover:text-rose-400"
                  title="Excluir post (Admin)"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Inline Price Editor */}
      {isAdmin && isEditingPrice && post.type === 'ppv-video' && (
        <div className="mx-4 sm:mx-5 mb-3 p-3 rounded-xl bg-[#ff4438]/10 border border-[#ff4438]/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Alterar Valor PPV:</span>
            <span className="text-gray-400">R$</span>
            <input
              type="text"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="w-20 h-8 px-2 bg-[#141721] border border-[#ff4438] rounded text-white font-bold"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePrice}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-sm"
            >
              Salvar Preço
            </button>
            <button
              onClick={() => setIsEditingPrice(false)}
              className="px-2 py-1 bg-[#242a3a] text-gray-300 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Post Text Description */}
      <div className="px-4 sm:px-5 pb-3">
        <p className="text-sm sm:text-base text-[#e1e2eb] leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* MEDIA TYPE 1: Public Image Gallery Teaser */}
      {post.type === 'public-image' && post.media && (
        <div 
          className="relative w-full aspect-[4/3] bg-black overflow-hidden group cursor-pointer"
          onClick={() => onOpenMediaTheater(post)}
          title="Clique para abrir e ver em tela grande"
        >
          <SafeImage
            src={post.media.url}
            fallbackSrc={post.media.fallbackUrl}
            alt="Foto do ensaio"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />

          {/* Dark gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Quick link & counter badges */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
            <button
              onClick={(e) => handleCopyDirectLink(post.media?.url || '', e)}
              className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1 hover:bg-[#ff4438] transition-colors border border-white/10"
              title="Copiar Link Direto da Imagem"
            >
              <ExternalLink size={13} />
              <span>Link Direto</span>
            </button>

            {post.media.previewCount && (
              <div className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10">
                <Layers size={14} className="text-[#ff4438]" />
                {post.media.previewCount}
              </div>
            )}

            <div className="px-3 py-1 rounded-lg bg-[#ff4438] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
              <Maximize2 size={13} />
              <span>Tela Grande</span>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA TYPE 2: Locked VIP Post */}
      {post.type === 'locked-vip' && post.media && (
        <div 
          className="relative w-full aspect-[16/10] bg-black overflow-hidden flex items-center justify-center cursor-pointer group"
          onClick={() => onOpenMediaTheater(post)}
          title="Clique para abrir em tela grande"
        >
          {post.isUnlocked ? (
            <SafeImage
              src={post.media.url}
              fallbackSrc={post.media.fallbackUrl}
              alt="Conteúdo Desbloqueado"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {/* Blurred background image */}
              <SafeImage
                src={post.media.url}
                fallbackSrc={post.media.fallbackUrl}
                alt="Conteúdo Trancado"
                className="w-full h-full object-cover filter blur-2xl scale-110 opacity-35"
              />

              {/* Central Frosted Unlock Glass Shield */}
              <div className="absolute inset-0 bg-black/70 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center gap-4 z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] flex items-center justify-center shadow-[0_0_28px_rgba(255,46,116,0.6)]">
                  <Lock size={30} className="text-white" />
                </div>

                <div className="flex flex-col items-center gap-1 max-w-md">
                  <h3 className="font-['Playfair_Display',serif] font-bold text-xl sm:text-2xl text-white">
                    Conteúdo Exclusivo VIP
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300">
                    Acesse todos os ensaios exclusivos sem limites com 0% de taxa no PIX.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSubscribeModal();
                    }}
                    className="w-full sm:w-auto flex-1 h-11 px-6 rounded-full bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] text-white font-bold text-sm shadow-[0_4px_20px_rgba(255,46,116,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <LockOpen size={17} />
                    <span>Desbloquear VIP via PIX</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTipModal(post);
                    }}
                    className="w-full sm:w-auto h-11 px-4 rounded-full bg-[#242a3a]/90 hover:bg-[#2d3448] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-md border border-white/10"
                    title="Enviar uma gorjeta PIX para este post"
                  >
                    <Gift size={15} className="text-[#ff4d88]" />
                    <span>Dar Gorjeta</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    Clique na foto para abrir em tela grande
                  </span>
                  <span>&bull;</span>
                  <button
                    onClick={(e) => handleCopyDirectLink(post.media?.url || '', e)}
                    className="text-xs text-[#ff4d88] hover:underline flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                    Ver Link Original
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* MEDIA TYPE 3: PPV Video Post */}
      {post.type === 'ppv-video' && post.media && (
        <div 
          className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center cursor-pointer group"
          onClick={() => onOpenMediaTheater(post)}
          title="Clique para abrir player em tela grande"
        >
          {post.isUnlocked ? (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center relative">
              <SafeImage
                src={post.media.url}
                fallbackSrc={post.media.fallbackUrl}
                alt="Vídeo em execução"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#ff2e74] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play size={28} className="fill-white translate-x-0.5" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/10">
                <Maximize2 size={13} />
                <span>Abrir Player em Tela Cheia</span>
              </div>
            </div>
          ) : (
            <>
              {/* Teaser still frame */}
              <SafeImage
                src={post.media.url}
                fallbackSrc={post.media.fallbackUrl}
                alt="PPV Teaser"
                className="w-full h-full object-cover filter blur-md scale-105"
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

              {/* Central Action Box */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center gap-3 sm:gap-4 z-10">
                <div className="px-3.5 py-1 rounded-full bg-[#151724]/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-white/10">
                  <Play size={13} className="text-[#ff2e74] fill-[#ff2e74]" />
                  <span>Vídeo em 4K UHD &bull; {post.media.duration || '12 min'}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <h3 className="font-['Playfair_Display',serif] font-bold text-xl sm:text-2xl text-white">
                    Vídeo Completo em Alta Definição
                  </h3>
                  <span className="text-xs sm:text-sm text-gray-300">
                    Duração: {post.media.duration || '12 min 34s'} &bull; Áudio Original &bull; Clique para tela grande
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPpvModal(post);
                    }}
                    className="h-11 px-6 rounded-full bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] text-white font-bold text-sm shadow-[0_4px_20px_rgba(255,46,116,0.4)] hover:brightness-110 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <ShoppingBag size={17} />
                    <span>Desbloquear por R$ {(post.ppvPrice || 19.90).toFixed(2).replace('.', ',')}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTipModal(post);
                    }}
                    className="h-11 px-5 rounded-full bg-[#242a3a]/90 hover:bg-[#2d3448] text-white font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-md border border-white/10"
                    title="Enviar uma gorjeta PIX para este vídeo"
                  >
                    <Gift size={16} className="text-[#ff4d88]" />
                    <span>Dar Gorjeta</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-white/80 flex items-center gap-1">
                    <Maximize2 size={13} />
                    Clique na tela para abrir em modo grande
                  </span>
                  <span>&bull;</span>
                  <button
                    onClick={(e) => handleCopyDirectLink(post.media?.url || '', e)}
                    className="text-xs text-[#ff9e87] hover:underline flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                    Link Direto da Capa
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* MEDIA TYPE 4: Interactive Poll */}
      {post.type === 'interactive-poll' && post.poll && (
        <div className="px-4 sm:px-5 pb-4 flex flex-col gap-3">
          <div className="flex flex-col gap-2.5">
            {post.poll.options.map((opt) => {
              const percentage = Math.round(
                (opt.votes / (post.poll?.totalVotes || 1)) * 100
              );
              const isVoted = post.poll?.userVotedOptionId === opt.id;
              const Icon = opt.iconName === 'Sun' ? Sun : Moon;

              return (
                <button
                  key={opt.id}
                  onClick={() => onVotePoll(post.id, opt.id)}
                  className={`relative w-full p-4 rounded-xl overflow-hidden transition-all text-left flex items-center justify-between border ${
                    isVoted
                      ? 'border-[#ff4438] bg-[#242a3a]'
                      : 'border-[#242a3a] bg-[#0e1015] hover:bg-[#191e2b]'
                  }`}
                >
                  {/* Progress bar background fill */}
                  <div
                    className="absolute inset-y-0 left-0 opacity-20 pointer-events-none transition-all duration-700"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: opt.color,
                    }}
                  />

                  <div className="relative flex items-center gap-3 z-10">
                    <Icon size={18} style={{ color: opt.color }} />
                    <span className="font-semibold text-sm sm:text-base text-white">
                      {opt.text}
                    </span>
                    {isVoted && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ff4438] text-white px-2 py-0.5 rounded-full">
                        Seu Voto
                      </span>
                    )}
                  </div>

                  <div className="relative flex items-center gap-2 z-10">
                    <span
                      className="font-bold text-base sm:text-lg"
                      style={{ color: opt.color }}
                    >
                      {percentage}%
                    </span>
                    <span className="text-xs text-gray-400">({opt.votes})</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            <span>
              {post.poll.totalVotes.toLocaleString('pt-BR')} votos registrados &bull; {post.poll.endsIn}
            </span>
            <span className="text-[#ff9e87]">Clique para votar e alterar seu voto</span>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="p-4 sm:p-5 pt-3 border-t border-[#1e2337] flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like (Privativo para Assinantes VIP) */}
          <button
            onClick={() => {
              if (!isSubscribed && !isAdmin) {
                onShowToast('🔒 Curtidas e reações são privativas para assinantes VIP! Desbloqueie sua assinatura.');
                onOpenSubscribeModal();
                return;
              }
              onLikeToggle(post.id);
            }}
            title={(!isSubscribed && !isAdmin) ? 'Privativo para Assinantes VIP' : 'Curtir publicação'}
            className={`flex items-center gap-2 transition-all active:scale-90 group relative ${
              post.isLiked ? 'text-[#ff2e74]' : 'text-gray-300 hover:text-[#ff2e74]'
            }`}
          >
            <div className="relative">
              <Heart
                size={22}
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  post.isLiked ? 'fill-[#ff2e74] text-[#ff2e74] drop-shadow-[0_0_8px_rgba(255,46,116,0.6)]' : ''
                }`}
              />
              {!isSubscribed && !isAdmin && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-[#0a0b10] flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-black" />
                </span>
              )}
            </div>
            <span className="font-semibold text-sm">
              {post.likes.toLocaleString('pt-BR')}
            </span>
          </button>

          {/* Comments (Privativo para Assinantes VIP) */}
          <button
            onClick={() => {
              if (!isSubscribed && !isAdmin) {
                onShowToast('🔒 Comentários são exclusivos para assinantes VIP! Faça sua assinatura para interagir.');
                onOpenSubscribeModal();
                return;
              }
              onOpenComments(post);
            }}
            title={(!isSubscribed && !isAdmin) ? 'Comentários privativos para assinantes VIP' : 'Ver e enviar comentários'}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <MessageCircle size={22} />
            <span className="font-semibold text-sm">{post.commentsCount}</span>
          </button>

          {/* Dar Gorjeta no Post (Available to subscribers & fans on every post) */}
          <button
            onClick={() => onOpenTipModal(post)}
            title="Enviar Gorjeta (Mimo PIX Efí Bank) nesta foto/vídeo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff2e74]/15 hover:bg-[#ff2e74]/25 border border-[#ff2e74]/35 text-[#ff4d88] hover:text-[#ff1a66] transition-all font-semibold text-xs active:scale-95 shadow-sm group"
          >
            <Gift size={15} className="group-hover:scale-110 transition-transform text-[#ff4d88]" />
            <span className="inline">Dar Gorjeta</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onSaveToggle(post.id)}
            className={`transition-colors ${
              post.isSaved ? 'text-[#ff2e74]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bookmark
              size={22}
              className={post.isSaved ? 'fill-[#ff2e74] text-[#ff2e74]' : ''}
            />
          </button>

          {/* Share */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              onShowToast('Link do post copiado!');
            }}
            className="text-gray-400 hover:text-white transition-colors"
            title="Compartilhar post"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Right CTA / Tag */}
        {post.type === 'public-image' && (
          <button
            onClick={onOpenSubscribeModal}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] text-white font-semibold text-xs sm:text-sm shadow-[0_4px_16px_rgba(255,46,116,0.35)] hover:brightness-110 transition-opacity flex items-center gap-1.5"
          >
            <LockOpen size={15} />
            <span>Desbloquear VIP</span>
          </button>
        )}

        {post.type === 'locked-vip' && (
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff4d88]">
            Set com Fotos 4K
          </span>
        )}

        {post.type === 'ppv-video' && (
          <span className="text-xs text-gray-400">
            R$ {(post.ppvPrice || 19.90).toFixed(2).replace('.', ',')} &bull; Acesso Vitalício
          </span>
        )}
      </div>
    </article>
  );
}
