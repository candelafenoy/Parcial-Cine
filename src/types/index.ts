export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  director: string;
  year: number;
  runtime: string; // e.g. "166 min" or "2h 46m"
  genre: string; // primary genre
  subgenres: string[];
  rating: number; // 0-10
  synopsis: string;
  posterUrl: string;
  bannerUrl?: string;
  isFavorite: boolean;
  status: 'porver' | 'vistas' | 'archivada';
  rankPosition?: number;
  userRating?: number;
  userNotes?: string;
  referenceUrl?: string;
  isSuggested?: boolean;
  curatorName?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  role: string;
  level: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  content: string;
  timeAgo: string;
  createdAt: string;
}

export interface CommunityReview {
  id: string;
  userId?: string;
  movieId?: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  userRole: string;
  movieTitle: string;
  moviePoster: string;
  rating: number;
  reviewText: string;
  likes: number;
  hasLiked?: boolean;
  commentsCount: number;
  timeAgo: string;
  tags: string[];
  replies?: CommentReply[];
}

export interface CommunityMember {
  id: string;
  name: string;
  handle?: string;
  currentMovie: string;
  ratingText: string;
  avatarUrl: string;
  status: 'online' | 'watching' | 'reviewing';
  role: string;
  isFollowing?: boolean;
  followersCount?: number;
}

export interface UserMovieRankRecord {
  userId: string;
  movieId: string;
  rankPosition?: number;
  status: 'porver' | 'vistas' | 'archivada';
  isFavorite: boolean;
  userRating?: number;
  userNotes?: string;
}

export type ViewType = 'catalogo' | 'mi-coleccion' | 'comunidad' | 'sugerir-pelicula' | 'perfil' | 'supabase-sql';
