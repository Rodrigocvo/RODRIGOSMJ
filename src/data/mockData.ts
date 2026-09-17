import { CreatorProfile, Post, SubscriptionPlan, DirectImageItem } from '../types';

export const INITIAL_DIRECT_IMAGES: DirectImageItem[] = [
  {
    id: 'banner',
    name: 'Banner de Capa Oficial',
    category: 'banner',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1600&auto=format&fit=crop',
    fallbackUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    description: 'Banner de capa do perfil oficial.',
    resolution: '1920x640',
  },
  {
    id: 'avatar',
    name: 'Foto de Perfil Oficial',
    category: 'avatar',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
    fallbackUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    description: 'Foto de perfil oficial.',
    resolution: '800x800',
  }
];

export const INITIAL_CREATOR: CreatorProfile = {
  name: 'Ruivinha',
  handle: '@ruivinhavip',
  isVerified: true,
  rankingBadge: 'Verificada',
  location: 'Brasil',
  isOnline: true,
  avatarUrl: INITIAL_DIRECT_IMAGES[1].url,
  bannerUrl: INITIAL_DIRECT_IMAGES[0].url,
  bio: 'Bem-vindo ao meu cantinho VIP 💖 Conteúdo exclusivo, prévias e vidas ao vivo.',
  stats: {
    postsCount: 0,
    videosCount: 0,
    likesCount: 0,
    subscribersCount: 0,
  }
};

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Plano Mensal',
    description: 'Acesso completo com renovação mensal',
    price: 29.90,
    priceFormatted: 'R$ 29,90',
    periodText: '/mês',
    isPopular: true,
    features: [
      'Acesso a todas as fotos e vídeos em altíssima resolução',
      'Bate-papo direto na DM com prioridade de resposta',
      'Acesso a lives exclusivas com chat interativo',
      'Descontos em pedidos personalizados e mimos'
    ]
  },
  {
    id: 'quarterly',
    name: 'Plano Trimestral',
    description: 'Acesso por 3 meses completos',
    price: 69.90,
    priceFormatted: 'R$ 69,90',
    periodText: 'R$ 23,30/mês',
    badge: '25% OFF',
    features: [
      'Economize 25% em relação ao plano mensal',
      'Acesso prioritário a todos os lançamentos',
      'Selo VIP Ouro exclusivo em comentários e lives',
      'Acesso total por 90 dias ininterruptos'
    ]
  }
];

// No example/fake posts or demo videos - feed starts clean for the creator's real content
export const INITIAL_POSTS: Post[] = [];
