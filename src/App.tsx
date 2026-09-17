import { useState, useMemo, useEffect } from 'react';
import { 
  INITIAL_CREATOR, 
  INITIAL_POSTS, 
  INITIAL_SUBSCRIPTION_PLANS, 
  INITIAL_DIRECT_IMAGES 
} from './data/mockData';
import { Post, SubscriptionPlan, DirectImageItem, CreatorProfile, User, AbacatePayConfig, AbacatePayTransaction } from './types';
import { Header } from './components/Header';
import { ProfileBanner } from './components/ProfileBanner';
import { FeedTabs, SubTabType } from './components/FeedTabs';
import { PostCard } from './components/PostCard';
import { SubscriptionCard } from './components/SubscriptionCard';
import { TipCard } from './components/TipCard';
import { SafetyCard } from './components/SafetyCard';
import { SalesShopTab } from './components/SalesShopTab';
import { LivesTab } from './components/LivesTab';
import { VipMessagesTab } from './components/VipMessagesTab';
import { AdminDashboardTab } from './components/AdminDashboardTab';
import { CustomerSubscriptionTab } from './components/CustomerSubscriptionTab';
import { AntiScreenshotGuard } from './components/AntiScreenshotGuard';

// Modals
import { ImageLightboxModal } from './components/Modals/ImageLightboxModal';
import { SubscribeModal } from './components/Modals/SubscribeModal';
import { TipModal } from './components/Modals/TipModal';
import { PpvModal } from './components/Modals/PpvModal';
import { CommentsModal } from './components/Modals/CommentsModal';
import { DmModal } from './components/Modals/DmModal';
import { CreatePostModal } from './components/Modals/CreatePostModal';
import { ManagePricingModal } from './components/Modals/ManagePricingModal';
import { EditProfileModal } from './components/Modals/EditProfileModal';
import { MediaTheaterModal, MediaItem } from './components/Modals/MediaTheaterModal';
import { AuthModal } from './components/Modals/AuthModal';
import { AbacatePayConfigModal } from './components/Modals/AbacatePayConfigModal';
import { Toast } from './components/Toast';
import { Eye, PlusCircle } from 'lucide-react';
import { getCurrentUser, saveCurrentUser, logoutUser } from './utils/auth';
import { getAbacatePayConfig, saveAbacatePayConfig, getAbacateTransactions } from './utils/abacatePay';

export default function App() {
  // Navigation & View state
  const [currentNav, setCurrentNav] = useState('inicio');
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('previas');
  const [searchQuery, setSearchQuery] = useState('');

  // Administrator Mode State
  const [isAdmin, setIsAdmin] = useState(true); // Default to Admin on so user immediately has admin controls

  // User Authentication State
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // AbacatePay Gateway Configuration & Transactions
  const [abacateConfig, setAbacateConfig] = useState<AbacatePayConfig>(() => getAbacatePayConfig());
  const [abacateTransactions, setAbacateTransactions] = useState<AbacatePayTransaction[]>(() => getAbacateTransactions());
  const [isAbacateModalOpen, setIsAbacateModalOpen] = useState(false);

  // User and Creator state - PERSISTED IN REAL TIME
  const [profile, setProfile] = useState<CreatorProfile>(() => {
    try {
      const saved = localStorage.getItem('ruivinha_creator_profile_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CREATOR;
  });

  useEffect(() => {
    try {
      localStorage.setItem('ruivinha_creator_profile_v2', JSON.stringify(profile));
    } catch {}
  }, [profile]);

  // Posts State - PERSISTED IN REAL TIME (clean of example posts)
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem('ruivinha_posts_v3');
      if (saved) return JSON.parse(saved);
      const oldSaved = localStorage.getItem('ruivinha_posts_v2');
      if (oldSaved) {
        const parsed = JSON.parse(oldSaved);
        const filtered = parsed.filter(
          (p: Post) =>
            !['post-1', 'post-2', 'post-3', 'post-4'].includes(p.id) &&
            !p.content?.includes('gostinho do ensaio') &&
            !p.content?.includes('Midnight Lounge') &&
            !p.content?.includes('Night In Soho')
        );
        localStorage.setItem('ruivinha_posts_v3', JSON.stringify(filtered));
        return filtered;
      }
    } catch {}
    return INITIAL_POSTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('ruivinha_posts_v3', JSON.stringify(posts));
    } catch {}
  }, [posts]);

  // Plans State - PERSISTED IN REAL TIME
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    try {
      const saved = localStorage.getItem('ruivinha_plans_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SUBSCRIPTION_PLANS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('ruivinha_plans_v2', JSON.stringify(plans));
    } catch {}
  }, [plans]);

  const [directImages, setDirectImages] = useState<DirectImageItem[]>(INITIAL_DIRECT_IMAGES);
  const [userTokens, setUserTokens] = useState<number>(1450);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<'monthly' | 'quarterly'>('monthly');

  // Modals state
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; imageUrl: string; title: string }>({
    isOpen: false,
    imageUrl: '',
    title: '',
  });
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [activePpvPost, setActivePpvPost] = useState<Post | null>(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState<Post | null>(null);
  const [isDmModalOpen, setIsDmModalOpen] = useState(false);

  // Admin Modals state
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isManagePricingModalOpen, setIsManagePricingModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Full Screen Media Theater Modal state
  const [theaterIndex, setTheaterIndex] = useState<number | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Toggle Admin Mode
  const handleToggleAdmin = () => {
    const next = !isAdmin;
    setIsAdmin(next);
    showToast(next ? 'Modo Administrador ativado! Você pode postar e alterar valores.' : 'Modo Cliente ativado (visualização do público).');
  };

  // Like toggle handler
  const handleLikeToggle = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newLiked = !post.isLiked;
          return {
            ...post,
            isLiked: newLiked,
            likes: newLiked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );
  };

  // Save toggle handler
  const handleSaveToggle = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newSaved = !post.isSaved;
          showToast(newSaved ? 'Post salvo nos favoritos!' : 'Removido dos favoritos');
          return { ...post, isSaved: newSaved };
        }
        return post;
      })
    );
  };

  // Vote on poll
  const handleVotePoll = (postId: string, optionId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId && post.poll) {
          const prevVoted = post.poll.userVotedOptionId;
          const updatedOptions = post.poll.options.map((opt) => {
            if (opt.id === optionId) {
              return { ...opt, votes: opt.votes + (prevVoted === optionId ? 0 : 1) };
            }
            if (prevVoted && opt.id === prevVoted && prevVoted !== optionId) {
              return { ...opt, votes: Math.max(0, opt.votes - 1) };
            }
            return opt;
          });

          const totalVotes = updatedOptions.reduce((acc, curr) => acc + curr.votes, 0);
          showToast('Voto registrado com sucesso!');

          return {
            ...post,
            poll: {
              ...post.poll,
              options: updatedOptions,
              totalVotes,
              userVotedOptionId: optionId,
            },
          };
        }
        return post;
      })
    );
  };

  // User authentication sync
  useEffect(() => {
    if (user) {
      setIsSubscribed(user.isVip);
      setUserTokens(user.tokens);
    }
  }, [user]);

  const handleUserLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    saveCurrentUser(loggedInUser);
    setIsSubscribed(loggedInUser.isVip);
    setUserTokens(loggedInUser.tokens);
    showToast(`Bem-vindo(a), ${loggedInUser.name}!`);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setIsSubscribed(false);
    showToast('Você saiu da sua conta.');
  };

  // VIP Subscription confirmed: unlock all VIP posts and set expiration!
  const handleConfirmSubscription = (planId: 'monthly' | 'quarterly' = 'monthly') => {
    setIsSubscribed(true);
    const durationDays = planId === 'quarterly' ? 90 : 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    if (user) {
      const updatedUser: User = { 
        ...user, 
        isVip: true,
        vipPlan: planId,
        vipExpiresAt: expiresAt,
      };
      setUser(updatedUser);
      saveCurrentUser(updatedUser);
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.type === 'locked-vip' ? { ...post, isUnlocked: true } : post
      )
    );
    showToast('Parabéns! Sua assinatura VIP foi ativada com sucesso!');
  };

  // PPV purchase confirmed: unlock this specific video post
  const handleUnlockPpv = (postId: string) => {
    if (user) {
      if (!user.unlockedPostIds.includes(postId)) {
        const updatedUser = {
          ...user,
          unlockedPostIds: [...user.unlockedPostIds, postId],
        };
        setUser(updatedUser);
        saveCurrentUser(updatedUser);
      }
    }
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, isUnlocked: true } : post))
    );
    showToast('Conteúdo avulso desbloqueado com sucesso!');
  };

  // Tip / Mimo sent handler with AbacatePay transaction support
  const handleCompleteTip = (amount: number, message?: string, tx?: AbacatePayTransaction) => {
    if (tx) {
      setAbacateTransactions((prev) => [tx, ...prev]);
    }
    showToast(`Mimo de R$ ${amount.toFixed(2).replace('.', ',')} enviado com sucesso via AbacatePay PIX!`);
    
    setProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        likesCount: prev.stats.likesCount + 1,
      },
    }));
  };

  // Add comment
  const handleAddComment = (postId: string, content: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      author: user?.name || 'Membro VIP',
      handle: user?.email ? `@${user.email.split('@')[0]}` : '@membro',
      avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      content,
      createdAt: 'Agora mesmo',
      likes: 0,
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const updatedComments = [newComment, ...post.comments];
          const updated = {
            ...post,
            comments: updatedComments,
            commentsCount: post.commentsCount + 1,
          };
          if (activeCommentsPost?.id === postId) {
            setActiveCommentsPost(updated);
          }
          return updated;
        }
        return post;
      })
    );

    showToast('Comentário publicado com sucesso!');
  };

  // Open Lightbox
  const handleOpenLightbox = (imageUrl: string, title: string) => {
    setLightbox({
      isOpen: true,
      imageUrl,
      title,
    });
  };

  // Media List for Full-Screen Cinema Theater
  const mediaList: MediaItem[] = useMemo(() => {
    return posts
      .filter((p) => p.media && p.media.url)
      .map((p) => ({
        type: (p.type === 'ppv-video' || p.media?.type === 'video') ? 'video' : 'image',
        url: p.media!.url,
        fallbackUrl: p.media?.fallbackUrl,
        title: p.content.slice(0, 70),
        subtitle: `${p.creatorName} • ${p.timestamp}`,
        isUnlocked: p.isUnlocked,
        price: p.ppvPrice,
        postId: p.id,
        postRef: p,
        duration: p.media?.duration,
      }));
  }, [posts]);

  // Open Full-Screen Media Theater
  const handleOpenMediaTheater = (post: Post) => {
    const idx = mediaList.findIndex((m) => m.postId === post.id);
    if (idx !== -1) {
      setTheaterIndex(idx);
    } else {
      setTheaterIndex(0);
    }
  };

  // Admin: Create Post
  const handleCreatePost = (newPostData: Omit<Post, 'id' | 'likes' | 'commentsCount' | 'isLiked' | 'isSaved' | 'comments' | 'creatorName' | 'creatorAvatar' | 'creatorHandle' | 'isVerified'>) => {
    const newPost: Post = {
      ...newPostData,
      id: `post-${Date.now()}`,
      creatorName: profile.name,
      creatorAvatar: profile.avatarUrl,
      creatorHandle: profile.handle,
      isVerified: true,
      likes: 0,
      commentsCount: 0,
      isLiked: false,
      isSaved: false,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);

    // Also update creator profile stats
    setProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        postsCount: prev.stats.postsCount + 1,
        videosCount: newPost.type === 'ppv-video' ? prev.stats.videosCount + 1 : prev.stats.videosCount,
      },
    }));

    showToast('Novo conteúdo publicado e salvo em tempo real!');
  };

  // Admin: Update Post Price
  const handleUpdatePostPrice = (postId: string, newPrice: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            ppvPrice: newPrice,
            audienceBadge: {
              label: `Venda Avulsa (R$ ${newPrice.toFixed(2).replace('.', ',')})`,
              type: 'ppv' as const,
            },
          };
        }
        return p;
      })
    );
    showToast(`Valor do conteúdo atualizado para R$ ${newPrice.toFixed(2).replace('.', ',')}!`);
  };

  // Admin: Delete Post
  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast('Post removido com sucesso!');
  };

  // Admin: Update Post Audience / Visibility
  const handleUpdateAudience = (postId: string, newType: 'public-image' | 'locked-vip' | 'ppv-video', price?: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        let badgeLabel = 'VIP Exclusivo';
        let badgeType: 'public' | 'vip' | 'ppv' = 'vip';
        if (newType === 'public-image') {
          badgeLabel = 'Prévia Pública Grátis';
          badgeType = 'public';
        } else if (newType === 'ppv-video') {
          badgeLabel = `Venda Avulsa (R$ ${(price || p.ppvPrice || 19.9).toFixed(2).replace('.', ',')})`;
          badgeType = 'ppv';
        }
        return {
          ...p,
          type: newType,
          ppvPrice: newType === 'ppv-video' ? (price || p.ppvPrice || 19.9) : undefined,
          isUnlocked: newType === 'public-image',
          audienceBadge: {
            label: badgeLabel,
            type: badgeType,
          },
        };
      })
    );
  };

  // Admin: Publish scheduled post now
  const handlePublishScheduledNow = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            status: 'published' as const,
            scheduledFor: undefined,
            timestamp: 'Agora mesmo • Publicado do agendamento',
          };
        }
        return p;
      })
    );
    showToast('Post publicado com sucesso no feed!');
  };

  // Admin: Update Subscription Plans
  const handleUpdatePlans = (updatedPlans: SubscriptionPlan[]) => {
    setPlans(updatedPlans);
    try {
      localStorage.setItem('ruivinha_plans_v2', JSON.stringify(updatedPlans));
    } catch {}
    showToast('Valores dos planos e promoções salvos em tempo real!');
  };

  // Admin: Update Profile
  const handleUpdateProfile = (updatedProfile: CreatorProfile) => {
    setProfile(updatedProfile);
    try {
      localStorage.setItem('ruivinha_creator_profile_v2', JSON.stringify(updatedProfile));
    } catch {}
    // Also update all existing posts creator name and avatar
    setPosts((prev) =>
      prev.map((p) => ({
        ...p,
        creatorName: updatedProfile.name,
        creatorAvatar: updatedProfile.avatarUrl,
        creatorHandle: updatedProfile.handle,
      }))
    );
  };

  const handleUpdateAvatar = (newAvatarUrl: string) => {
    setProfile((prev) => {
      const updated = { ...prev, avatarUrl: newAvatarUrl };
      try {
        localStorage.setItem('ruivinha_creator_profile_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setPosts((prev) =>
      prev.map((p) => ({
        ...p,
        creatorAvatar: newAvatarUrl,
      }))
    );
  };

  const handleUpdateBanner = (newBannerUrl: string) => {
    setProfile((prev) => {
      const updated = { ...prev, bannerUrl: newBannerUrl };
      try {
        localStorage.setItem('ruivinha_creator_profile_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const counts = {
    previas: posts.filter((p) => p.status !== 'scheduled' && p.type === 'public-image').length,
    vip: posts.filter((p) => p.status !== 'scheduled' && p.type === 'locked-vip').length,
    lives: 1,
    loja: posts.filter((p) => p.status !== 'scheduled' && (p.type === 'ppv-video' || p.ppvPrice)).length,
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  return (
    <div className="min-h-screen bg-[#0a0b10] text-[#e1e2eb] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col selection:bg-[#ff2e74]/30 selection:text-white">
      {/* Clean Top Navigation Bar */}
      <Header
        currentNav={currentNav}
        onSelectNav={setCurrentNav}
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
        isSubscribed={isSubscribed}
        onToggleSubscribe={() => setIsSubscribeModalOpen(true)}
        onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
        onOpenManagePricing={() => setIsManagePricingModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAbacatePayConfig={() => setIsAbacateModalOpen(true)}
        onOpenTipModal={() => setIsTipModalOpen(true)}
        user={user}
        onLogout={handleLogout}
        onShowToast={showToast}
      />

      {/* Main Single-Column Clean Layout */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        {/* VIEW 1: Início (Profile + Sub-tabs Feed) */}
        {currentNav === 'inicio' && (
          <>
            {/* Creator Profile Hero Section */}
            <ProfileBanner
              profile={profile}
              isAdmin={isAdmin}
              onOpenTipModal={() => setIsTipModalOpen(true)}
              onOpenDmModal={() => setIsDmModalOpen(true)}
              onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
              onUpdateBanner={handleUpdateBanner}
              onUpdateAvatar={handleUpdateAvatar}
              onImageClick={handleOpenLightbox}
              onShowToast={showToast}
            />

            {/* Sub-tabs: Prévias, Exclusivo VIP, Lives, Loja & Packs */}
            <FeedTabs
              activeTab={activeSubTab}
              onTabChange={setActiveSubTab}
              counts={counts}
            />

            {/* Sub-Tab 1: Prévias (Public Posts) */}
            {activeSubTab === 'previas' && (
              <div className="flex flex-col gap-5">
                {posts.filter((p) => p.status !== 'scheduled' && p.type === 'public-image').length === 0 ? (
                  <div className="p-12 text-center bg-[#131521] rounded-2xl border border-[#1e2337] text-gray-400 flex flex-col items-center gap-3">
                    <Eye size={36} className="text-gray-600" />
                    <p className="text-sm font-medium">Nenhuma prévia pública publicada ainda.</p>
                    {isAdmin && (
                      <button
                        onClick={() => setIsCreatePostModalOpen(true)}
                        className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff1a66] to-[#ff2e74] text-white text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-2"
                      >
                        <PlusCircle size={15} />
                        <span>+ Publicar Nova Prévia</span>
                      </button>
                    )}
                  </div>
                ) : (
                  posts
                    .filter((p) => p.status !== 'scheduled' && p.type === 'public-image')
                    .map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        isAdmin={isAdmin}
                        isSubscribed={isSubscribed}
                        onLikeToggle={handleLikeToggle}
                        onSaveToggle={handleSaveToggle}
                        onOpenComments={(p) => setActiveCommentsPost(p)}
                        onOpenSubscribeModal={() => setIsSubscribeModalOpen(true)}
                        onOpenPpvModal={(p) => setActivePpvPost(p)}
                        onOpenTipModal={() => setIsTipModalOpen(true)}
                        onOpenMediaTheater={handleOpenMediaTheater}
                        onImageClick={handleOpenLightbox}
                        onVotePoll={handleVotePoll}
                        onUpdatePrice={handleUpdatePostPrice}
                        onDeletePost={handleDeletePost}
                        onShowToast={showToast}
                      />
                    ))
                )}
              </div>
            )}

            {/* Sub-Tab 2: Exclusivo VIP */}
            {activeSubTab === 'vip' && (
              <div className="flex flex-col gap-6">
                {!isSubscribed && (
                  <SubscriptionCard
                    plans={plans}
                    selectedPlanId={selectedPlanId}
                    onSelectPlan={setSelectedPlanId}
                    onSubscribe={(plan) => {
                      setSelectedPlanId(plan.id);
                      setIsSubscribeModalOpen(true);
                    }}
                    isSubscribed={isSubscribed}
                    isAdmin={isAdmin}
                    onOpenManagePricing={() => setIsManagePricingModalOpen(true)}
                  />
                )}

                <div className="flex flex-col gap-5">
                  {posts
                    .filter((p) => p.status !== 'scheduled' && p.type === 'locked-vip')
                    .map((post) => (
                      <PostCard
                        key={post.id}
                        post={{
                          ...post,
                          isUnlocked: isSubscribed || isAdmin ? true : post.isUnlocked,
                        }}
                        isAdmin={isAdmin}
                        isSubscribed={isSubscribed}
                        onLikeToggle={handleLikeToggle}
                        onSaveToggle={handleSaveToggle}
                        onOpenComments={(p) => setActiveCommentsPost(p)}
                        onOpenSubscribeModal={() => setIsSubscribeModalOpen(true)}
                        onOpenPpvModal={(p) => setActivePpvPost(p)}
                        onOpenTipModal={() => setIsTipModalOpen(true)}
                        onOpenMediaTheater={handleOpenMediaTheater}
                        onImageClick={handleOpenLightbox}
                        onVotePoll={handleVotePoll}
                        onUpdatePrice={handleUpdatePostPrice}
                        onDeletePost={handleDeletePost}
                        onShowToast={showToast}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Lives Interativas */}
            {activeSubTab === 'lives' && (
              <LivesTab
                isSubscribed={isSubscribed}
                isAdmin={isAdmin}
                onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
                onOpenTipModal={() => setIsTipModalOpen(true)}
                onShowToast={showToast}
              />
            )}

            {/* Sub-Tab 4: Loja & Packs */}
            {activeSubTab === 'loja' && (
              <SalesShopTab
                posts={posts}
                isAdmin={isAdmin}
                onOpenPpvModal={(p) => setActivePpvPost(p)}
                onOpenMediaTheater={handleOpenMediaTheater}
                onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
                onUpdatePostPrice={handleUpdatePostPrice}
                onDeletePost={handleDeletePost}
                onShowToast={showToast}
              />
            )}
          </>
        )}

        {/* VIEW 2: Lives */}
        {currentNav === 'lives' && (
          <LivesTab
            isSubscribed={isSubscribed}
            isAdmin={isAdmin}
            onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
            onOpenTipModal={() => setIsTipModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 3: Loja */}
        {currentNav === 'loja' && (
          <SalesShopTab
            posts={posts}
            isAdmin={isAdmin}
            onOpenPpvModal={(p) => setActivePpvPost(p)}
            onOpenMediaTheater={handleOpenMediaTheater}
            onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
            onUpdatePostPrice={handleUpdatePostPrice}
            onDeletePost={handleDeletePost}
            onShowToast={showToast}
          />
        )}

        {/* VIEW: Mensagens Privadas VIP (100% Exclusivo para Assinantes) */}
        {currentNav === 'mensagens' && (
          <VipMessagesTab
            creator={profile}
            user={user}
            isSubscribed={isSubscribed}
            isAdmin={isAdmin}
            onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 4: Perfil */}
        {currentNav === 'perfil' && (
          <div className="flex flex-col gap-6">
            <ProfileBanner
              profile={profile}
              isAdmin={isAdmin}
              onOpenTipModal={() => setIsTipModalOpen(true)}
              onOpenDmModal={() => setIsDmModalOpen(true)}
              onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
              onUpdateBanner={handleUpdateBanner}
              onUpdateAvatar={handleUpdateAvatar}
              onImageClick={handleOpenLightbox}
              onShowToast={showToast}
            />
            <SubscriptionCard
              plans={plans}
              selectedPlanId={selectedPlanId}
              onSelectPlan={setSelectedPlanId}
              onSubscribe={(plan) => {
                setSelectedPlanId(plan.id);
                setIsSubscribeModalOpen(true);
              }}
              isSubscribed={isSubscribed}
              isAdmin={isAdmin}
              onOpenManagePricing={() => setIsManagePricingModalOpen(true)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TipCard
                creatorName={profile.name}
                onSendTip={() => setIsTipModalOpen(true)}
              />
              <SafetyCard />
            </div>
          </div>
        )}

        {/* VIEW 5: Minha Assinatura & Histórico de Pagamentos */}
        {currentNav === 'assinatura' && (
          <CustomerSubscriptionTab
            user={user}
            isSubscribed={isSubscribed}
            plans={plans}
            onOpenSubscribeModal={(planId) => {
              if (planId) setSelectedPlanId(planId);
              setIsSubscribeModalOpen(true);
            }}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 6: Painel Administrador */}
        {currentNav === 'admin' && (
          <AdminDashboardTab
            profile={profile}
            posts={posts}
            plans={plans}
            abacatePayConfig={abacateConfig}
            transactions={abacateTransactions}
            onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
            onOpenManagePricing={() => setIsManagePricingModalOpen(true)}
            onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
            onOpenAbacatePayConfig={() => setIsAbacateModalOpen(true)}
            onPostCreated={handleCreatePost}
            onUpdateAudience={handleUpdateAudience}
            onPublishScheduledNow={handlePublishScheduledNow}
            onUpdatePostPrice={handleUpdatePostPrice}
            onDeletePost={handleDeletePost}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* ================= MODALS ================= */}

      {/* 1. Full Screen Media Theater */}
      {theaterIndex !== null && (
        <MediaTheaterModal
          isOpen={theaterIndex !== null}
          onClose={() => setTheaterIndex(null)}
          mediaList={mediaList}
          currentIndex={theaterIndex}
          onIndexChange={setTheaterIndex}
          onUnlockPpv={handleUnlockPpv}
          onOpenSubscribe={() => {
            setTheaterIndex(null);
            setIsSubscribeModalOpen(true);
          }}
          onShowToast={showToast}
        />
      )}

      {/* 2. Admin: Create Post / Sell Content Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        creatorName={profile.name}
        creatorHandle={profile.handle}
        creatorAvatar={profile.avatarUrl}
        onPostCreated={(newPost) => {
          setPosts((prev) => [newPost, ...prev]);
          setProfile((prev) => ({
            ...prev,
            stats: {
              ...prev.stats,
              postsCount: prev.stats.postsCount + 1,
              videosCount: newPost.type === 'ppv-video' ? prev.stats.videosCount + 1 : prev.stats.videosCount,
            },
          }));
          showToast('Novo post publicado e salvo em tempo real!');
        }}
        onShowToast={showToast}
      />

      {/* 3. Admin: Manage Pricing Modal */}
      <ManagePricingModal
        isOpen={isManagePricingModalOpen}
        onClose={() => setIsManagePricingModalOpen(false)}
        plans={plans}
        posts={posts}
        onUpdatePlans={handleUpdatePlans}
        onUpdatePostPrice={handleUpdatePostPrice}
        onShowToast={showToast}
      />

      {/* 4. Admin: Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onShowToast={showToast}
      />

      {/* 5. Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightbox.isOpen}
        onClose={() => setLightbox({ isOpen: false, imageUrl: '', title: '' })}
        imageUrl={lightbox.imageUrl}
        title={lightbox.title}
        onShowToast={showToast}
      />

      {/* 6. VIP Subscription Checkout (Processed via AbacatePay PIX) */}
      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        plan={selectedPlan}
        creatorName={profile.name}
        user={user}
        onConfirmSubscription={handleConfirmSubscription}
        onPaymentCompleted={(tx) => {
          setAbacateTransactions((prev) => [tx, ...prev]);
        }}
      />

      {/* 7. Tip / Mimo Modal - integrated with AbacatePay PIX */}
      <TipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        creatorName={profile.name}
        user={user}
        onCompleteTip={handleCompleteTip}
      />

      {/* 8. PPV Video Purchase Modal */}
      {activePpvPost && (
        <PpvModal
          isOpen={!!activePpvPost}
          onClose={() => setActivePpvPost(null)}
          post={activePpvPost}
          user={user}
          onUnlockPpv={handleUnlockPpv}
          onPaymentCompleted={(tx) => {
            setAbacateTransactions((prev) => [tx, ...prev]);
          }}
        />
      )}

      {/* 9. Comments Thread Modal */}
      {activeCommentsPost && (
        <CommentsModal
          isOpen={!!activeCommentsPost}
          onClose={() => setActiveCommentsPost(null)}
          post={activeCommentsPost}
          onAddComment={handleAddComment}
        />
      )}

      {/* 10. Direct Message Modal - Modern, Private, Subscriber-Gated */}
      <DmModal
        isOpen={isDmModalOpen}
        onClose={() => setIsDmModalOpen(false)}
        creator={profile}
        isSubscribed={isSubscribed}
        isAdmin={isAdmin}
        onOpenSubscribe={() => setIsSubscribeModalOpen(true)}
      />

      {/* 11. User Auth Modal (Login / Cadastro / Recuperação de Senha) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleUserLogin}
      />

      {/* 12. AbacatePay API Key & Gateway Configuration Modal (Admin Only) */}
      <AbacatePayConfigModal
        isOpen={isAbacateModalOpen}
        onClose={() => setIsAbacateModalOpen(false)}
        config={abacateConfig}
        transactions={abacateTransactions}
        onSaveConfig={(cfg) => {
          saveAbacatePayConfig(cfg);
          setAbacateConfig(cfg);
        }}
        onShowToast={showToast}
      />

      {/* Anti-Screenshot & Content Protection Layer */}
      <AntiScreenshotGuard
        onShowToast={showToast}
        creatorName={profile.name}
        userName={user?.name || 'Membro VIP'}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
