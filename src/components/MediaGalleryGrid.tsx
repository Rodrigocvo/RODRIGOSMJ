import { 
  Play, 
  Lock, 
  Maximize2, 
  Film, 
  Image as ImageIcon,
  Heart,
  ShoppingBag
} from 'lucide-react';
import { Post } from '../types';
import { SafeImage } from './SafeImage';

interface MediaGalleryGridProps {
  type: 'photos' | 'videos';
  posts: Post[];
  onSelectMedia: (post: Post) => void;
  onOpenSubscribe: () => void;
  onOpenPpv: (post: Post) => void;
}

export function MediaGalleryGrid({
  type,
  posts,
  onSelectMedia,
  onOpenSubscribe,
  onOpenPpv,
}: MediaGalleryGridProps) {
  const mediaPosts = posts.filter((p) => {
    if (!p.media) return false;
    if (type === 'videos') {
      return p.type === 'ppv-video' || p.media.type === 'video';
    }
    return p.type === 'public-image' || p.type === 'locked-vip' || p.media.type === 'image';
  });

  if (mediaPosts.length === 0) {
    return (
      <div className="p-12 text-center bg-[#141721] rounded-2xl border border-[#242a3a] text-gray-400 flex flex-col items-center gap-3">
        {type === 'videos' ? <Film size={36} className="text-gray-600" /> : <ImageIcon size={36} className="text-gray-600" />}
        <p>Nenhuma mídia encontrada nesta galeria.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {type === 'videos' ? 'Galeria de Vídeos' : 'Galeria de Fotos'} ({mediaPosts.length})
          </span>
          <span className="text-xs text-[#ff7a59] font-medium">
            &bull; Clique em qualquer item para abrir em tela grande
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4">
        {mediaPosts.map((post) => {
          const isUnlocked = post.isUnlocked;
          const isVideo = post.type === 'ppv-video' || post.media?.type === 'video';

          return (
            <div
              key={post.id}
              onClick={() => onSelectMedia(post)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-black cursor-pointer border border-[#242a3a] hover:border-[#ff4438] transition-all shadow-md hover:shadow-xl"
              title="Clique para abrir em Modo Tela Grande"
            >
              <SafeImage
                src={post.media?.url || ''}
                fallbackSrc={post.media?.fallbackUrl}
                alt={post.content}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  !isUnlocked && post.type !== 'public-image' ? 'filter blur-sm scale-105 opacity-70' : ''
                }`}
              />

              {/* Hover Dark Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3" />

              {/* Badges */}
              <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                {isVideo && (
                  <span className="p-1 rounded-md bg-black/70 backdrop-blur-md text-white">
                    <Film size={13} className="text-[#ff4438]" />
                  </span>
                )}
                {!isUnlocked && post.type !== 'public-image' && (
                  <span className="p-1 rounded-md bg-black/70 backdrop-blur-md text-[#ff7a59]">
                    <Lock size={13} />
                  </span>
                )}
              </div>

              {/* Center Action Icon on Hover */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-[#ff4438] transition-all shadow-xl opacity-80 group-hover:opacity-100">
                  {isVideo ? (
                    <Play size={20} className="fill-white translate-x-0.5" />
                  ) : (
                    <Maximize2 size={18} />
                  )}
                </div>
              </div>

              {/* Bottom Details on Hover */}
              <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-xs text-white z-10 pointer-events-none">
                <div className="flex items-center gap-1 text-xs">
                  <Heart size={13} className="fill-[#ff4438] text-[#ff4438]" />
                  <span>{post.likes}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#ff9e87] bg-black/70 px-2 py-0.5 rounded backdrop-blur-md">
                  Tela Grande
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
