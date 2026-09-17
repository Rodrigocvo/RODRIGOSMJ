export interface DirectImageItem {
  id: string;
  name: string;
  category: 'banner' | 'avatar' | 'post' | 'gallery' | 'logo';
  url: string;
  fallbackUrl: string;
  description: string;
  resolution?: string;
}

export interface CreatorStats {
  postsCount: number;
  videosCount: number;
  likesCount: number;
  subscribersCount: number;
}

export interface CreatorProfile {
  name: string;
  handle: string;
  isVerified: boolean;
  rankingBadge: string;
  location: string;
  isOnline: boolean;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  stats: CreatorStats;
}

export interface Comment {
  id: string;
  author: string;
  avatarUrl: string;
  handle: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  iconName: string;
  votes: number;
  color: string;
}

export interface Post {
  id: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  isVerified: boolean;
  timestamp: string;
  audienceBadge: {
    label: string;
    type: 'public' | 'vip' | 'ppv' | 'poll';
    iconName?: string;
  };
  content: string;
  type: 'public-image' | 'locked-vip' | 'ppv-video' | 'interactive-poll';
  media?: {
    type: 'image' | 'video' | 'gallery';
    url: string;
    fallbackUrl?: string;
    previewCount?: string;
    aspectRatio?: string;
    duration?: string;
    quality?: string;
    audioQuality?: string;
    blurImage?: string;
    galleryUrls?: string[];
  };
  ppvPrice?: number;
  isUnlocked?: boolean;
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  isSaved?: boolean;
  comments: Comment[];
  poll?: {
    totalVotes: number;
    userVotedOptionId?: string;
    endsIn: string;
    options: PollOption[];
  };
  scheduledFor?: string;
  status?: 'published' | 'scheduled';
}

export interface SubscriptionPlan {
  id: 'monthly' | 'quarterly';
  name: string;
  description: string;
  price: number;
  priceFormatted: string;
  periodText: string;
  badge?: string;
  isPopular?: boolean;
  features: string[];
  originalPrice?: number;
  originalPriceFormatted?: string;
  isPromoActive?: boolean;
  promoBanner?: string;
}

export type LiveSourceType = 'camera' | 'youtube' | 'twitch' | 'obs';

export interface LiveStreamConfig {
  id: string;
  isActive: boolean;
  title: string;
  description: string;
  sourceType: LiveSourceType;
  youtubeUrl?: string;
  twitchChannel?: string;
  streamKey?: string;
  isVipOnly: boolean;
  viewersCount: number;
  startedAt?: number;
  scheduledTime?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  phone?: string;
  isVip: boolean;
  vipPlan?: 'monthly' | 'quarterly';
  vipExpiresAt?: string;
  tokens?: number;
  role: 'user' | 'admin';
  unlockedPostIds: string[];
  tipsSentTotal: number;
  createdAt: string;
}

export type PaymentGatewayType = 'efi' | 'abacatepay' | 'pix_direct';

export interface EfiBankConfig {
  clientId: string;
  clientSecret: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  environment: 'production' | 'sandbox';
  certificateName?: string;
  certificateContent?: string;
  merchantName: string;
  merchantCity: string;
  pixExpirationMinutes: number;
  isConfigured: boolean;
  lastTestedAt?: string;
  simulatedBalance?: number;
  isRealKeyConfigured?: boolean;
}

export interface AbacatePayConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  webhookSecret?: string;
  pixExpirationMinutes: number;
  isConfigured: boolean;
  lastTestedAt?: string;
  simulatedBalance?: number;
  pixKey?: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  merchantName?: string;
  merchantCity?: string;
  isRealKeyConfigured?: boolean;
}

export interface AbacatePayTransaction {
  id: string;
  type: 'subscription' | 'ppv' | 'tip' | 'call';
  title: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  pixCode: string;
  qrCodeData?: string;
  createdAt: string;
  paidAt?: string;
  customerName: string;
  customerEmail: string;
  planId?: 'monthly' | 'quarterly';
  postId?: string;
  receiptCode?: string;
  pixKey?: string;
  pixKeyType?: string;
  merchantName?: string;
  gateway?: PaymentGatewayType;
}

export type PaymentTransaction = AbacatePayTransaction;
