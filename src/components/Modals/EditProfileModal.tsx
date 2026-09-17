import { useState, useRef, ChangeEvent, DragEvent, FormEvent } from 'react';
import { X, User, Check, Camera, Image as ImageIcon, Upload, Sparkles, RefreshCw } from 'lucide-react';
import { CreatorProfile } from '../../types';
import { SafeImage } from '../SafeImage';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CreatorProfile;
  onUpdateProfile: (updatedProfile: CreatorProfile) => void;
  onShowToast: (msg: string) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onShowToast,
}: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl);

  // Drag states
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);

  // URL toggle states
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);
  const [showBannerUrlInput, setShowBannerUrlInput] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process file upload helper
  const processImageFile = (file: File, callback: (resultUrl: string) => void, label: string) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Por favor, selecione um arquivo de imagem (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
        onShowToast(`${label} carregada com sucesso!`);
      }
    };
    reader.onerror = () => {
      onShowToast('Erro ao ler a imagem. Tente outro arquivo.');
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0], setAvatarUrl, 'Foto de perfil');
    }
  };

  const handleBannerFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0], setBannerUrl, 'Foto de capa');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const updated: CreatorProfile = {
      ...profile,
      name: name.trim() || profile.name,
      handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`,
      bio: bio.trim(),
      location: location.trim(),
      avatarUrl: avatarUrl.trim() || profile.avatarUrl,
      bannerUrl: bannerUrl.trim() || profile.bannerUrl,
    };

    onUpdateProfile(updated);
    onShowToast('Perfil e fotos atualizados com sucesso!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#0e1017] rounded-3xl border border-[#1e2337] shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#1e2337] flex items-center justify-between bg-gradient-to-r from-[#170e1a] via-[#10121a] to-[#170e1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff1a66] to-[#ff2e74] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,46,116,0.5)] shrink-0">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-['Playfair_Display',serif]">
                Editar Perfil e Imagens
              </h2>
              <p className="text-xs text-gray-400">
                Altere sua foto de perfil, plano de fundo/capa, nome e biografia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#151825] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarFileChange}
        />
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerFileChange}
        />

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
          {/* SECTION 1: PLANO DE FUNDO (BANNER DE CAPA) */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5">
                <ImageIcon size={15} className="text-[#ff2e74]" />
                <span>Plano de Fundo (Banner de Capa)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowBannerUrlInput(!showBannerUrlInput)}
                className="text-[11px] text-[#ff4d88] hover:underline flex items-center gap-1 font-semibold"
              >
                <Sparkles size={11} />
                <span>{showBannerUrlInput ? 'Ocultar Link' : 'Colar link URL'}</span>
              </button>
            </div>

            {/* Banner Preview & Upload Area */}
            <div 
              onDragOver={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setIsDraggingBanner(true);
              }}
              onDragLeave={() => setIsDraggingBanner(false)}
              onDrop={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setIsDraggingBanner(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  processImageFile(e.dataTransfer.files[0], setBannerUrl, 'Foto de capa');
                }
              }}
              className={`relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border-2 transition-all group ${
                isDraggingBanner
                  ? 'border-[#ff2e74] scale-[1.01] shadow-[0_0_20px_rgba(255,46,116,0.3)]'
                  : 'border-[#1e2337] hover:border-[#ff2e74]/60'
              }`}
            >
              <SafeImage
                src={bannerUrl}
                fallbackSrc="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1600&auto=format&fit=crop"
                alt="Banner de Capa"
                className="w-full h-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white block drop-shadow-md">
                      Pré-visualização da Capa
                    </span>
                    <span className="text-[10px] text-gray-300">
                      Recomendado: formato horizontal (16:9 ou 3:1)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-[#ff2e74] hover:bg-[#ff1a66] text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Upload size={14} />
                    <span>Trocar Capa do Computador</span>
                  </button>
                </div>
              </div>
            </div>

            {showBannerUrlInput && (
              <div className="p-3 rounded-xl bg-[#08090e] border border-[#1e2337] flex items-center gap-2">
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://exemplo.com/minha-capa.jpg"
                  className="flex-1 h-9 px-3 bg-[#131521] border border-[#1e2337] rounded-lg text-xs text-white focus:outline-none focus:border-[#ff2e74]"
                />
                <button
                  type="button"
                  onClick={() => onShowToast('Link da capa aplicado!')}
                  className="px-3 h-9 rounded-lg bg-[#1e2337] text-gray-200 text-xs font-bold hover:bg-[#272e48]"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: FOTO DE PERFIL (AVATAR) */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5">
                <Camera size={15} className="text-[#ff2e74]" />
                <span>Foto de Perfil (Avatar)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAvatarUrlInput(!showAvatarUrlInput)}
                className="text-[11px] text-[#ff4d88] hover:underline flex items-center gap-1 font-semibold"
              >
                <Sparkles size={11} />
                <span>{showAvatarUrlInput ? 'Ocultar Link' : 'Colar link URL'}</span>
              </button>
            </div>

            {/* Avatar Preview & Upload Area */}
            <div 
              onDragOver={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setIsDraggingAvatar(true);
              }}
              onDragLeave={() => setIsDraggingAvatar(false)}
              onDrop={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setIsDraggingAvatar(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  processImageFile(e.dataTransfer.files[0], setAvatarUrl, 'Foto de perfil');
                }
              }}
              className={`p-4 rounded-2xl bg-[#090b10] border-2 transition-all flex flex-col sm:flex-row items-center gap-4 ${
                isDraggingAvatar
                  ? 'border-[#ff2e74] bg-[#1a0e1c]/40'
                  : 'border-[#1e2337]'
              }`}
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#ff2e74] ring-4 ring-[#ff2e74]/20 shadow-xl bg-black shrink-0">
                <SafeImage
                  src={avatarUrl}
                  fallbackSrc="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop"
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-2 min-w-0">
                <span className="text-xs font-bold text-white">
                  Sua imagem de exibição
                </span>
                <p className="text-xs text-gray-400">
                  Formatos aceitos: JPG, PNG, WEBP ou GIF. Foto quadrada ou retrato fica perfeita!
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] hover:brightness-110 text-white text-xs font-bold shadow-[0_0_15px_rgba(255,46,116,0.4)] transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Upload size={14} />
                    <span>Trocar Foto do Perfil</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop');
                      onShowToast('Foto restaurada para padrão!');
                    }}
                    className="p-2 rounded-xl bg-[#141722] hover:bg-[#1e2337] text-gray-400 hover:text-white transition-colors"
                    title="Restaurar padrão"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {showAvatarUrlInput && (
              <div className="p-3 rounded-xl bg-[#08090e] border border-[#1e2337] flex items-center gap-2">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://exemplo.com/minha-foto.jpg"
                  className="flex-1 h-9 px-3 bg-[#131521] border border-[#1e2337] rounded-lg text-xs text-white focus:outline-none focus:border-[#ff2e74]"
                />
                <button
                  type="button"
                  onClick={() => onShowToast('Link do avatar aplicado!')}
                  className="px-3 h-9 rounded-lg bg-[#1e2337] text-gray-200 text-xs font-bold hover:bg-[#272e48]"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          {/* SECTION 3: INFORMAÇÕES DE TEXTO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#1e2337]">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Nome de Exibição
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#090b10] border border-[#1e2337] rounded-xl text-sm text-white focus:outline-none focus:border-[#ff2e74]"
                required
              />
            </div>

            {/* Handle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                @Handle / Nome de Usuário
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#090b10] border border-[#1e2337] rounded-xl text-sm text-white focus:outline-none focus:border-[#ff2e74]"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Cidade / Localização
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#090b10] border border-[#1e2337] rounded-xl text-sm text-white focus:outline-none focus:border-[#ff2e74]"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Biografia & Apresentação
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3.5 bg-[#090b10] border border-[#1e2337] rounded-xl text-sm text-white focus:outline-none focus:border-[#ff2e74] resize-none"
              required
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-[#1e2337] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#141722] text-gray-300 hover:text-white font-semibold text-sm transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] hover:brightness-110 text-white font-bold text-sm shadow-[0_0_25px_rgba(255,46,116,0.5)] transition-all flex items-center gap-2 active:scale-95"
            >
              <Check size={16} />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
