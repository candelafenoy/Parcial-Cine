import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Movie, CommunityReview, CommentReply, CommunityMember, UserProfile } from '../types';
import { INITIAL_MOVIES } from './movieStorage';

// Key names for storage fallback
const STORAGE_KEY_SUPABASE_CONFIG = 'cinetrack_supabase_config_v1';
const STORAGE_KEY_CURRENT_USER_ID = 'cinetrack_current_user_id_v1';
const STORAGE_KEY_FOLLOWS = 'cinetrack_user_follows_v1';
const STORAGE_KEY_USER_RANKS = 'cinetrack_user_ranks_v1';
const STORAGE_KEY_REPLIES = 'cinetrack_comment_replies_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// 1. Initial Mock / Seed Users Profiles
export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-sofia',
    username: 'sofia_cine',
    displayName: 'Sofía Martínez',
    handle: '@sofia_cine',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    bio: 'Obsesionada con la fotografía de Deakins, el ritmo de Denis Villeneuve y el celuloide puro.',
    role: 'Cinéfilo Pro',
    level: 8,
    followersCount: 142,
    followingCount: 3
  },
  {
    id: 'user-mateo',
    username: 'mateo_critique',
    displayName: 'Mateo Vasconcelos',
    handle: '@mateo_critique',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
    bio: 'Crítico acreditado en festivales de Venecia y San Sebastián. Amante del celuloide 70mm.',
    role: 'Crítico Acreditado',
    level: 9,
    followersCount: 310,
    followingCount: 12
  },
  {
    id: 'user-camila',
    username: 'cami_35mm',
    displayName: 'Camila Rossi',
    handle: '@cami_35mm',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
    bio: 'Curadora cinematográfica y programadora de cine club independiente.',
    role: 'Curadora Festival',
    level: 7,
    followersCount: 205,
    followingCount: 18
  },
  {
    id: 'user-lucas',
    username: 'lucas_filmreel',
    displayName: 'Lucas Benítez',
    handle: '@lucas_filmreel',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    bio: 'Archivero fílmico restaurando bobinas argentinas y latinoamericanas.',
    role: 'Archivero Fílmico',
    level: 6,
    followersCount: 89,
    followingCount: 45
  },
  {
    id: 'user-elena',
    username: 'elena_cinephile',
    displayName: 'Elena Gómez',
    handle: '@elena_cine',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    bio: 'Explorando filmografías de Europa del Este y Sci-Fi retro.',
    role: 'Cinéfilo',
    level: 5,
    followersCount: 52,
    followingCount: 60
  }
];

// Initial follows: Sofia follows Mateo and Camila; Mateo follows Sofia
export const INITIAL_FOLLOWS: Record<string, string[]> = {
  'user-sofia': ['user-mateo', 'user-camila'],
  'user-mateo': ['user-sofia'],
  'user-camila': ['user-sofia', 'user-mateo'],
  'user-lucas': ['user-mateo']
};

// Initial per-user movie rankings
export const INITIAL_USER_RANKS: Record<string, Record<string, { rank: number; status: 'porver' | 'vistas' | 'archivada'; isFavorite: boolean; rating?: number; notes?: string }>> = {
  'user-sofia': {
    'dune-2': { rank: 1, status: 'porver', isFavorite: true, rating: 9.5, notes: 'Ver en IMAX.' },
    'robot-salvaje': { rank: 2, status: 'vistas', isFavorite: true, rating: 9.3, notes: 'Animación artesanal sublime.' },
    'el-jockey': { rank: 3, status: 'vistas', isFavorite: true, rating: 8.8, notes: 'Nahuel Pérez Biscayart brillante.' },
    'blade-runner-2049': { rank: 4, status: 'vistas', isFavorite: true, rating: 9.7, notes: 'Deakins insuperable.' },
    'el-secreto-de-sus-ojos': { rank: 5, status: 'vistas', isFavorite: true, rating: 9.6, notes: 'Plano secuencia en Huracán.' }
  },
  'user-mateo': {
    '2001-odisea': { rank: 1, status: 'vistas', isFavorite: true, rating: 10, notes: 'La cima del cine universal.' },
    'dune-2': { rank: 2, status: 'vistas', isFavorite: true, rating: 9.8, notes: 'Diseño sonoro monumental.' },
    'el-jockey': { rank: 3, status: 'vistas', isFavorite: true, rating: 9.0, notes: 'Estética onírica porteña.' }
  },
  'user-camila': {
    'el-jockey': { rank: 1, status: 'vistas', isFavorite: true, rating: 9.4, notes: 'Premio de dirección en festival.' },
    'poor-things': { rank: 2, status: 'vistas', isFavorite: true, rating: 9.1, notes: 'Vestuario y diseño de producción.' }
  }
};

// Initial replies
export const INITIAL_REPLIES: Record<string, CommentReply[]> = {
  'rev-1': [
    {
      id: 'rep-1',
      commentId: 'rev-1',
      userId: 'user-sofia',
      userName: 'Sofía Martínez',
      userHandle: '@sofia_cine',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      content: '¡Completamente de acuerdo, Mateo! La vi en sala IMAX y el estruendo con el gusano me dejó sin aliento.',
      timeAgo: 'Hace 1 hora',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'rep-2',
      commentId: 'rev-1',
      userId: 'user-camila',
      userName: 'Camila Rossi',
      userHandle: '@cami_35mm',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
      content: 'La fotografía infrarroja de Greig Fraser en Giedi Prime merece estudio aparte.',
      timeAgo: 'Hace 30 min',
      createdAt: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  'rev-2': [
    {
      id: 'rep-3',
      commentId: 'rev-2',
      userId: 'user-mateo',
      userName: 'Mateo Vasconcelos',
      userHandle: '@mateo_critique',
      userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
      content: 'El humor seco y la decadencia recuerdan al cine de Aki Kaurismäki.',
      timeAgo: 'Hace 3 horas',
      createdAt: new Date(Date.now() - 10800000).toISOString()
    }
  ]
};

// State singletons
let cachedClient: SupabaseClient | null = null;

export function getSupabaseCredentials(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUPABASE_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error al leer configuración de Supabase desde LocalStorage:', err);
  }

  return { url: envUrl, anonKey: envKey };
}

export function saveSupabaseCredentials(config: SupabaseConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUPABASE_CONFIG, JSON.stringify(config));
    cachedClient = null; // Invalidate cached client to recreate with new credentials
  } catch (err) {
    console.error('Error al guardar credenciales de Supabase en LocalStorage:', err);
  }
}

export function isSupabaseConfigured(): boolean {
  const creds = getSupabaseCredentials();
  return Boolean(creds.url && creds.anonKey && creds.url.startsWith('https://') && creds.anonKey.length > 20);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const creds = getSupabaseCredentials();
  if (creds.url && creds.anonKey && creds.url.startsWith('https://')) {
    try {
      cachedClient = createClient(creds.url, creds.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      return cachedClient;
    } catch (err) {
      console.error('Error al inicializar cliente de Supabase:', err);
      return null;
    }
  }

  return null;
}

export async function testSupabaseConnection(config?: SupabaseConfig): Promise<{ success: boolean; message: string; details?: any }> {
  const creds = config || getSupabaseCredentials();
  if (!creds.url || !creds.anonKey) {
    return {
      success: false,
      message: 'Falta la URL de Supabase o la anon key pública.'
    };
  }

  try {
    const tempClient = createClient(creds.url, creds.anonKey);
    // Ping public table or health endpoint
    const { data, error } = await tempClient.from('movies').select('id, title').limit(1);

    if (error) {
      if (error.code === '42P01') {
        // Relation does not exist: SQL schema not executed yet!
        return {
          success: false,
          message: 'Conexión a Supabase exitosa, pero la tabla "movies" aún no existe. Por favor ejecuta el script SQL en el SQL Editor de Supabase.',
          details: error
        };
      }
      return {
        success: false,
        message: `Error de Supabase: ${error.message} (Código ${error.code})`,
        details: error
      };
    }

    return {
      success: true,
      message: `¡Conexión establecida con éxito! (${data ? `${data.length} películas encontradas en Supabase` : 'OK'})`,
      details: data
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error al conectar con ${creds.url}: ${err.message || 'Error desconocido'}`
    };
  }
}

// 2. Active User Management (Multi-user Simulation / Real Supabase Auth)
export function getCurrentUserId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER_ID);
    if (raw && INITIAL_PROFILES.some((p) => p.id === raw)) {
      return raw;
    }
  } catch (e) {
    // fallback
  }
  return 'user-sofia';
}

export function setCurrentUserId(userId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, userId);
  } catch (e) {
    // fallback
  }
}

export function getCurrentUserProfile(): UserProfile {
  const uid = getCurrentUserId();
  const found = INITIAL_PROFILES.find((p) => p.id === uid);
  return found || INITIAL_PROFILES[0];
}

// 3. Follows Management
export function getStoredFollows(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLLOWS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }
  saveStoredFollows(INITIAL_FOLLOWS);
  return INITIAL_FOLLOWS;
}

export function saveStoredFollows(follows: Record<string, string[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY_FOLLOWS, JSON.stringify(follows));
  } catch (e) {
    console.error('Error saving follows:', e);
  }
}

export async function toggleFollowUser(targetUserId: string): Promise<boolean> {
  const currentUserId = getCurrentUserId();
  if (currentUserId === targetUserId) return false;

  const follows = getStoredFollows();
  const currentList = follows[currentUserId] || [];
  const isFollowing = currentList.includes(targetUserId);

  let updatedList: string[];
  if (isFollowing) {
    updatedList = currentList.filter((id) => id !== targetUserId);
  } else {
    updatedList = [...currentList, targetUserId];
  }

  follows[currentUserId] = updatedList;
  saveStoredFollows(follows);

  // Sync with Supabase if client is active
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      if (isFollowing) {
        await supabase
          .from('user_follows')
          .delete()
          .match({ follower_id: currentUserId, following_id: targetUserId });
      } else {
        await supabase
          .from('user_follows')
          .insert({ follower_id: currentUserId, following_id: targetUserId });
      }
    } catch (err) {
      console.warn('Sync follow to Supabase failed, kept locally:', err);
    }
  }

  return !isFollowing;
}

export function isUserFollowing(targetUserId: string): boolean {
  const currentUserId = getCurrentUserId();
  const follows = getStoredFollows();
  const currentList = follows[currentUserId] || [];
  return currentList.includes(targetUserId);
}

export function getFollowingUsers(userId: string = getCurrentUserId()): string[] {
  const follows = getStoredFollows();
  return follows[userId] || [];
}

// 4. Per-User Movie Ranking & Collection Management
export function getStoredUserRanks(): Record<string, Record<string, any>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_RANKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  saveStoredUserRanks(INITIAL_USER_RANKS);
  return INITIAL_USER_RANKS;
}

export function saveStoredUserRanks(ranks: Record<string, Record<string, any>>): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER_RANKS, JSON.stringify(ranks));
  } catch (e) {
    console.error('Error saving user ranks:', e);
  }
}

export function getMoviesForUser(userId: string = getCurrentUserId(), baseMovies: Movie[] = INITIAL_MOVIES): Movie[] {
  const userRanks = getStoredUserRanks();
  const userConfig = userRanks[userId] || {};

  return baseMovies.map((movie) => {
    const custom = userConfig[movie.id];
    if (custom) {
      return {
        ...movie,
        rankPosition: custom.rank,
        status: custom.status || movie.status,
        isFavorite: custom.isFavorite !== undefined ? custom.isFavorite : movie.isFavorite,
        userRating: custom.rating !== undefined ? custom.rating : movie.userRating,
        userNotes: custom.notes !== undefined ? custom.notes : movie.userNotes
      };
    }
    return {
      ...movie,
      rankPosition: undefined,
      isFavorite: false
    };
  });
}

export function saveUserMovieRankData(
  userId: string,
  movieId: string,
  data: { rank?: number; status?: 'porver' | 'vistas' | 'archivada'; isFavorite?: boolean; rating?: number; notes?: string }
): void {
  const allRanks = getStoredUserRanks();
  if (!allRanks[userId]) allRanks[userId] = {};

  allRanks[userId][movieId] = {
    ...(allRanks[userId][movieId] || {}),
    ...data
  };

  saveStoredUserRanks(allRanks);

  // Sync to Supabase if connected
  const supabase = getSupabaseClient();
  if (supabase) {
    void Promise.resolve(
      supabase.from('user_movies').upsert({
        user_id: userId,
        movie_id: movieId,
        rank_position: data.rank,
        status: data.status,
        is_favorite: data.isFavorite,
        user_rating: data.rating,
        user_notes: data.notes
      })
    ).catch((err: unknown) => console.warn('Supabase user_movies upsert error:', err));
  }
}

// 5. Replies Management
export function getStoredReplies(): Record<string, CommentReply[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPLIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  saveStoredReplies(INITIAL_REPLIES);
  return INITIAL_REPLIES;
}

export function saveStoredReplies(replies: Record<string, CommentReply[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY_REPLIES, JSON.stringify(replies));
  } catch (e) {
    console.error('Error saving replies:', e);
  }
}

export function addReplyToComment(commentId: string, content: string): CommentReply {
  const user = getCurrentUserProfile();
  const allReplies = getStoredReplies();
  const list = allReplies[commentId] || [];

  const newReply: CommentReply = {
    id: `rep-${Date.now()}`,
    commentId,
    userId: user.id,
    userName: user.displayName,
    userHandle: user.handle,
    userAvatar: user.avatarUrl,
    content: content.trim(),
    timeAgo: 'Justo ahora',
    createdAt: new Date().toISOString()
  };

  list.push(newReply);
  allReplies[commentId] = list;
  saveStoredReplies(allReplies);

  // Sync with Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    void Promise.resolve(
      supabase.from('comment_replies').insert({
        comment_id: commentId,
        user_id: user.id,
        content: content.trim()
      })
    ).catch((err: unknown) => console.warn('Supabase comment_replies insert error:', err));
  }

  return newReply;
}

export function getRepliesForComment(commentId: string): CommentReply[] {
  const allReplies = getStoredReplies();
  return allReplies[commentId] || [];
}

// 6. Community Members with Live Follow Status
export function getCommunityMembersWithFollow(currentUserId: string = getCurrentUserId()): CommunityMember[] {
  const follows = getStoredFollows();
  const currentFollows = follows[currentUserId] || [];

  return INITIAL_PROFILES.filter((p) => p.id !== currentUserId).map((profile) => ({
    id: profile.id,
    name: profile.displayName,
    handle: profile.handle,
    currentMovie: profile.id === 'user-mateo' ? '2001: Odisea' : profile.id === 'user-camila' ? 'El Jockey' : 'Dune: Parte Dos',
    ratingText: profile.role,
    avatarUrl: profile.avatarUrl,
    status: profile.id === 'user-mateo' ? 'online' : profile.id === 'user-camila' ? 'watching' : 'online',
    role: profile.role,
    isFollowing: currentFollows.includes(profile.id),
    followersCount: profile.followersCount
  }));
}
