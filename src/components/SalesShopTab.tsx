import { useState } from 'react';
import { 
  ShoppingBag, 
  Play, 
  Lock, 
  LockOpen, 
  Maximize2, 
  Sparkles, 
  CheckCircle2, 
  Film, 
  Image as ImageIcon,
  DollarSign,
  Trash2,
  Edit2
} from 'lucide-react';
import { Post } from '../types';
import { SafeImage } from './SafeImage';

interface SalesShopTabProps {
  posts: Post[];
  isAdmin: boolean;
  onOpenPpvModal: (post: Post) => void;
  onOpenMediaTheater: (post: Post) => void;
  onOpenCreatePost: () => void;
  onUpdatePostPrice: (postId: string, newPrice: number) => void;
  onDeletePost: (postId: string) => void;
  onShowToast: (msg: string) => void;
}

export function SalesShopTab({
  posts,
  isAdmin,
  onOpenPpvModal,
  onOpenMediaTheater,
  onOpenCreatePost,
  onUpdatePostPrice,
  onDeletePost,
  onShowToast,
}: SalesShopTabProps) {
  const [filter, setFilter] = useState<'all' | 'videos' | 'photos'>('all');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>('');

  // Get items that are for sale (ppv or locked vip)
  const salesItems = posts.filter((p) => {
    if (p.type === 'ppv-video') return true;
    if (p.type === 'locked-vip') return true;
    return false;
  });

  const filteredItems = salesItems.filter((item) => {
    if (filter === 'videos') return item.type === 'ppv-video';
    if (filter === 'photos') return item.type === 'locked-vip';
    return true;
  });

  const handleStartEditPrice = (post: Post) => {
    setEditingPostId(post.id);
    setEditPriceValue(post.ppvPrice ? post.ppvPrice.toString() : '19.90');
  };

  const handleSavePrice = (postId: string) => {
    const parsed = parseFloat(editPriceValue.replace(',', '.')) || 19.90;
    onUpdatePostPrice(postId, parsed);
    setEditingPostId(null);
    onShowToast(`Valor atualizado para R$ ${parsed.toFixed(2).replace('.', ',')}!`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Privacy Style Shop Showcase */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#19131c] via-[#131521] to-[#1a121d] border border-[#1e2337] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#ff1a66] via-[#ff2e74] to-[#ff4d88] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,46,116,0.4)]">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white font-['Playfair_Display',serif]">
                Loja de Conteúdos & Mídias Avulsas
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ff2e74]/20 text-[#ff4d88] text-[10px] font-bold uppercase tracking-wider border border-[#ff2e74]/30">
                PIX 0% Taxa
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              Compre vídeos e ensaios individuais com acesso vitalício imediato via PIX.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenCreatePost}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] text-white font-bold text-xs sm:text-sm shadow-md hover:brightness-110 transition-transform flex items-center gap-2"
          >
            <Sparkles size={16} />
            <span>➕ Novo Conteúdo para Venda</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-[#131521] p-1 rounded-xl border border-[#1e2337]">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-[#ff2e74] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Todos ({salesItems.length})
          </button>
          <button
            onClick={() => setFilter('videos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === 'videos'
                ? 'bg-[#ff2e74] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Film size={14} />
            <span>Vídeos ({salesItems.filter((i) => i.type === 'ppv-video').length})</span>
          </button>
          <button
            onClick={() => setFilter('photos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === 'photos'
                ? 'bg-[#ff2e74] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon size={14} />
            <span>Ensaios Exclusivos ({salesItems.filter((i) => i.type === 'locked-vip').length})</span>
          </button>
        </div>

        <span className="text-xs text-gray-400">
          Clique na capa para abrir em <strong>Modo Tela Grande</strong>
        </span>
      </div>

      {/* Grid of Sales Items */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-[#131521] rounded-2xl border border-[#1e2337] text-gray-400 flex flex-col items-center gap-3">
          <ShoppingBag size={32} className="text-gray-600" />
          <p>Nenhum conteúdo disponível nesta categoria de venda no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => {
            const isUnlocked = item.isUnlocked;
            const price = item.ppvPrice || 19.90;
            const isEditing = editingPostId === item.id;

            return (
              <div
                key={item.id}
                className="bg-[#131521] rounded-2xl border border-[#1e2337] overflow-hidden shadow-lg hover:border-[#ff2e74]/50 transition-all flex flex-col group"
              >
                {/* Media Thumbnail with Click-to-Fullscreen */}
                <div 
                  className="relative aspect-video w-full bg-black overflow-hidden cursor-pointer"
                  onClick={() => onOpenMediaTheater(item)}
                  title="Clique para abrir e assistir em tela grande"
                >
                  <SafeImage
                    src={item.media?.url || ''}
                    fallbackSrc={item.media?.fallbackUrl}
                    alt={item.content}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      !isUnlocked ? 'filter blur-sm scale-105 opacity-80' : ''
                    }`}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-white border border-white/10 flex items-center gap-1.5">
                      {item.type === 'ppv-video' ? (
                        <>
                          <Film size={12} className="text-[#ff2e74]" />
                          <span>Vídeo PPV</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={12} className="text-[#ff4d88]" />
                          <span>Ensaio VIP</span>
                        </>
                      )}
                    </span>

                    {item.media?.duration && (
                      <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-semibold text-gray-300 border border-white/10">
                        {item.media.duration}
                      </span>
                    )}
                  </div>

                  {/* Center Action Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center group-hover:bg-[#ff2e74] transition-colors shadow-2xl group-hover:scale-110">
                      {isUnlocked ? (
                        <Play size={24} className="fill-white translate-x-0.5" />
                      ) : (
                        <Lock size={22} className="text-white" />
                      )}
                    </div>
                  </div>

                  {/* Bottom fullscreen hint */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[11px] text-white/90 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                    <Maximize2 size={12} />
                    <span>Abrir Tela Grande</span>
                  </div>
                </div>

                {/* Card Info & Pricing */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{item.timestamp}</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400 font-medium">Liberação Imediata</span>
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-3 border-t border-[#1e2337] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Price section */}
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-400">R$</span>
                          <input
                            type="text"
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(e.target.value)}
                            className="w-20 h-8 px-2 bg-[#191e2b] border border-[#ff2e74] rounded text-sm text-white font-bold"
                          />
                          <button
                            onClick={() => handleSavePrice(item.id)}
                            className="px-2 py-1 bg-emerald-600 text-white text-xs font-bold rounded"
                          >
                            Salvar
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Valor do Conteúdo
                          </span>
                          <span className="text-xl font-bold text-[#ff4d88]">
                            R$ {price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      )}

                      {isAdmin && !isEditing && (
                        <button
                          onClick={() => handleStartEditPrice(item)}
                          className="p-1.5 rounded bg-[#191e2b] hover:bg-[#242a3a] text-gray-400 hover:text-white"
                          title="Alterar valor deste conteúdo"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* Button CTA */}
                    <div className="flex items-center gap-2">
                      {isUnlocked ? (
                        <button
                          onClick={() => onOpenMediaTheater(item)}
                          className="flex-1 sm:flex-initial h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                        >
                          <LockOpen size={16} />
                          <span>Assistir em Tela Cheia</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenPpvModal(item)}
                          className="flex-1 sm:flex-initial h-10 px-5 rounded-full bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] hover:brightness-110 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,46,116,0.4)] transition-all active:scale-95"
                        >
                          <ShoppingBag size={16} />
                          <span>Comprar por R$ {price.toFixed(2).replace('.', ',')}</span>
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (window.confirm('Deseja realmente excluir este conteúdo?')) {
                              onDeletePost(item.id);
                              onShowToast('Conteúdo excluído com sucesso.');
                            }
                          }}
                          className="p-2.5 rounded-full bg-[#191e2b] hover:bg-rose-900/50 text-gray-400 hover:text-rose-400 transition-colors"
                          title="Excluir post (Admin)"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
