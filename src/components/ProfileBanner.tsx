import { useState, useRef, ChangeEvent } from 'react';
import { 
  Check, 
  Users, 
  Image as ImageIcon, 
  Edit2, 
  Share2, 
  Maximize2,
  Camera,
  Upload
} from 'lucide-react';
import { CreatorProfile } from '../types';
import { SafeImage } from './SafeImage';

interface ProfileBannerProps {
  profile: CreatorProfile;
  isAdmin?: boolean;
  onOpenTipModal?: () => void;
  onOpenDmModal?: () => void;
  onOpenEditProfile?: () => void;
  onUpdateBanner?: (newUrl: string) => void;
  onUpdateAvatar?: (newUrl: string) => void;
  onImageClick: (url: string, title: string) => void;
  onShowToast: (msg: string) => void;
}

export function ProfileBanner({
  profile,
  isAdmin = false,
  onOpenEditProfile,
  onUpdateBanner,
  onUpdateAvatar,
  onImageClick,
  onShowToast,
}: ProfileBannerProps) {
  const [copied, setCopied] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopied(true);
      onShowToast('Link do cantinho copiado com sucesso!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('Link do perfil: ' + window.location.href);
    }
  };

  const handleBannerFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        onShowToast('Selecione uma imagem válida (JPG, PNG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string' && onUpdateBanner) {
          onUpdateBanner(reader.result);
          onShowToast('Plano de fundo (Capa) atualizado com sucesso!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        onShowToast('Selecione uma imagem válida (JPG, PNG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string' && onUpdateAvatar) {
          onUpdateAvatar(reader.result);
          onShowToast('Foto de perfil atualizada com sucesso!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#131521] border border-[#1e2337] shadow-2xl">
      {/* Hidden file pickers for direct upload */}
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBannerFileSelect}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileSelect}
      />

      {/* Cover Banner with rounded top matching print */}
      <div 
        className="w-full h-52 sm:h-64 md:h-72 relative overflow-hidden group cursor-pointer"
        onClick={() => onImageClick(profile.bannerUrl, 'Banner de Capa')}
        title="Clique para ver o banner em tela grande"
      >
        <SafeImage
          src={profile.bannerUrl}
          fallbackSrc="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1600&auto=format&fit=crop"
          alt="Banner de Capa"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
        />

        {/* Subtle dark gradient overlay at top & bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131521] via-transparent to-black/30 pointer-events-none" />

        {/* Top Floating Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10 flex-wrap justify-end">
          {/* Direct Banner Change Button for Admin */}
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                bannerInputRef.current?.click();
              }}
              className="px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black text-white text-xs font-bold border border-white/20 shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
              title="Trocar imagem de plano de fundo do computador ou celular"
            >
              <Camera size={13} className="text-[#ff2e74]" />
              <span>Trocar Capa</span>
            </button>
          )}

          {isAdmin && onOpenEditProfile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenEditProfile();
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#ff2e74] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,46,116,0.5)] hover:bg-[#ff1a66] transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Edit2 size={12} />
              <span>Editar Perfil</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onImageClick(profile.bannerUrl, 'Banner Oficial');
            }}
            className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs text-gray-300 hover:text-white transition-colors border border-white/10"
            title="Ver banner em tela cheia"
          >
            <Maximize2 size={13} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs text-gray-300 hover:text-white transition-colors border border-white/10"
            title="Compartilhar"
          >
            <Share2 size={13} />
          </button>
        </div>
      </div>

      {/* Creator Info Area below banner */}
      <div className="px-5 sm:px-8 pb-6 pt-0 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
          {/* Avatar with Pink Border & 'online agora' Pill */}
          <div className="flex flex-col items-start -mt-14 sm:-mt-16 flex-shrink-0">
            <div 
              onClick={() => onImageClick(profile.avatarUrl, 'Foto de Perfil')}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#ff2e74] ring-4 ring-[#131521] shadow-2xl bg-[#0e1017] cursor-pointer group relative"
              title="Clique para abrir a foto de perfil"
            >
              <SafeImage
                src={profile.avatarUrl}
                fallbackSrc="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop"
                alt={profile.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Direct Camera Button for Admin over Avatar */}
              {isAdmin && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    avatarInputRef.current?.click();
                  }}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-[10px] font-bold"
                  title="Trocar foto de perfil"
                >
                  <Camera size={18} className="text-[#ff2e74]" />
                  <span>Trocar</span>
                </div>
              )}
            </div>

            {/* Admin Floating Camera Badge on Avatar for mobile or quick tap */}
            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  avatarInputRef.current?.click();
                }}
                className="mt-1.5 -ml-0.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ff2e74] hover:bg-[#ff1a66] text-white text-[10px] font-bold shadow-[0_0_12px_rgba(255,46,116,0.4)] transition-all active:scale-95"
                title="Trocar Foto de Perfil"
              >
                <Camera size={11} />
                <span>Trocar Foto</span>
              </button>
            )}

            {/* 'online agora' badge matching screenshot */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0a0b12]/95 border border-[#24283d] text-white text-[11px] font-medium shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2e74] animate-pulse" />
              <span>online agora</span>
            </div>
          </div>

          {/* Profile Identity Details */}
          <div className="flex-1 flex flex-col pt-1 sm:pt-2">
            {/* Top row with Name, verified badge and PIX badge */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
                  {profile.name}
                </h1>

                {/* 'verificada' badge pill */}
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c1912] border border-[#f59e0b]/50 text-[#fbbf24] text-[11px] font-semibold">
                  <Check size={12} strokeWidth={3} className="text-[#fbbf24]" />
                  <span>verificada</span>
                </div>
              </div>

              {/* PIX instantâneo badge on the right */}
              <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-[#09261a] border border-[#165a3d] text-[#34d399] text-xs font-semibold shadow-inner">
                <span>PIX instantâneo • 0% de taxa</span>
              </div>
            </div>

            {/* Handle */}
            <div className="text-gray-400 text-sm font-normal mt-1">
              {profile.handle}
            </div>

            {/* Bio */}
            <p className="text-gray-200 text-sm mt-2.5 max-w-2xl leading-relaxed">
              {profile.bio}
            </p>

            {/* Counters matching screenshot */}
            <div className="flex items-center gap-4 text-sm text-gray-400 mt-3 font-medium">
              <div className="flex items-center gap-1.5">
                <Users size={15} className="text-gray-400" />
                <span>{profile.stats.subscribersCount} assinantes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ImageIcon size={15} className="text-gray-400" />
                <span>{profile.stats.postsCount} posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
