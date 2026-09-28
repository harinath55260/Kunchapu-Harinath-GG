export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  country?: string;
  role?: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  thumbnail: string;
  countryId: string;
  countryName: string;
  countryFlag?: string;
  countryImage?: string;
  region?: string;
  categoryId: string;
  categoryName: string;
  topic?: string;
  tags: string[];
  contributorId: string;
  contributorName: string;
  contributorPhoto?: string;
  views: number;
  likesCount: number;
  savesCount: number;
  commentsCount: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CountryItem {
  id: string;
  name: string;
  code: string;
  flag: string;
  region: string;
  description: string;
  bannerImage: string;
  culturalHighlights: {
    title: string;
    description: string;
    category: string;
  }[];
  videoCount?: number;
  greeting?: string;
  civilizationAge?: string;
  unescoSitesCount?: number;
  officialLanguages?: string;
  capital?: string;
  currency?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface CommentItem {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  videoId: string;
  videoTitle?: string;
  reportedBy: string;
  reporterName?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'approval' | 'rejection' | 'like' | 'comment' | 'follow' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FollowItem {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}
