<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  isSupabaseConfigured,
  INITIAL_PROFILES,
  getCurrentUserId,
  setCurrentUserId,
  type SupabaseConfig
} from '../services/supabaseService';

const emit = defineEmits<{
  (e: 'user-switched', userId: string): void;
  (e: 'navigate', view: string): void;
}>();

const config = ref<SupabaseConfig>({
  url: '',
  anonKey: ''
});

const isConnected = ref(false);
const isTesting = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);
const copiedSql = ref(false);
const currentUserId = ref(getCurrentUserId());
const activeTab = ref<'sql' | 'tables' | 'connection'>('sql');

const SQL_CONTENT = `-- ==============================================================================
-- CINETRACK NOIR - SUPABASE POSTGRESQL SCHEMA
-- Manejo de usuarios, persistencia de películas, rankings personales,
-- sistema de seguidos (follows) e interacciones sociales (comentarios, me gusta y respuestas).
-- ==============================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA: PROFILES (Perfiles de usuario vinculados a auth.users de Supabase)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT DEFAULT 'Amante del celuloide y el cine de autor.',
    role TEXT DEFAULT 'Cinéfilo',
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 3. TABLA: MOVIES (Catálogo maestro de películas persistido en Supabase)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.movies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    original_title TEXT,
    director TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1888),
    runtime TEXT NOT NULL,
    genre TEXT NOT NULL,
    subgenres TEXT[] DEFAULT '{}',
    rating NUMERIC(3, 1) DEFAULT 8.0,
    synopsis TEXT NOT NULL,
    poster_url TEXT NOT NULL,
    banner_url TEXT,
    reference_url TEXT,
    is_suggested BOOLEAN DEFAULT FALSE,
    curator_name TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 4. TABLA: USER_MOVIES (Ranking propio y colección individual de cada usuario)
-- Permite que cada usuario tenga su propio ranking (1, 2, 3...), status y notas.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    movie_id TEXT NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    rank_position INTEGER CHECK (rank_position > 0),
    status TEXT NOT NULL DEFAULT 'porver' CHECK (status IN ('porver', 'vistas', 'archivada')),
    is_favorite BOOLEAN DEFAULT FALSE,
    user_rating NUMERIC(3, 1) CHECK (user_rating IS NULL OR (user_rating >= 0 AND user_rating <= 10)),
    user_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_movie UNIQUE (user_id, movie_id)
);

-- ==============================================================================
-- 5. TABLA: USER_FOLLOWS (Sistema social para seguir a otros usuarios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_follower_following UNIQUE (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

-- ==============================================================================
-- 6. TABLA: MOVIE_COMMENTS (Comentarios y reseñas en películas para que sus seguidos vean)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.movie_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id TEXT NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) >= 3),
    rating NUMERIC(3, 1) CHECK (rating IS NULL OR (rating >= 1 AND rating <= 10)),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 7. TABLA: COMMENT_LIKES (Me gusta en comentarios / reseñas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.movie_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_comment_user_like UNIQUE (comment_id, user_id)
);

-- ==============================================================================
-- 8. TABLA: COMMENT_REPLIES (Respuestas a comentarios para debate entre seguidos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.comment_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.movie_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) >= 1),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 9. VISTA OPTIMIZADA: FEED SOCIAL DE SEGUIDOS
-- ==============================================================================
CREATE OR REPLACE VIEW public.v_followed_feed AS
SELECT
    c.id AS comment_id,
    c.content,
    c.rating,
    c.tags,
    c.created_at,
    m.id AS movie_id,
    m.title AS movie_title,
    m.poster_url AS movie_poster,
    p.id AS author_id,
    p.display_name AS author_name,
    p.handle AS author_handle,
    p.avatar_url AS author_avatar,
    f.follower_id AS viewer_id,
    (SELECT COUNT(*) FROM public.comment_likes l WHERE l.comment_id = c.id) AS likes_count,
    (SELECT COUNT(*) FROM public.comment_replies r WHERE r.comment_id = c.id) AS replies_count
FROM public.movie_comments c
JOIN public.movies m ON m.id = c.movie_id
JOIN public.profiles p ON p.id = c.user_id
JOIN public.user_follows f ON f.following_id = c.user_id;

-- 10. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público para todos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Público para todos" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Público para todos" ON public.user_movies FOR SELECT USING (true);
CREATE POLICY "Público para todos" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Público para todos" ON public.movie_comments FOR SELECT USING (true);
CREATE POLICY "Público para todos" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Público para todos" ON public.comment_replies FOR SELECT USING (true);`;

function copySql() {
  navigator.clipboard.writeText(SQL_CONTENT);
  copiedSql.value = true;
  setTimeout(() => {
    copiedSql.value = false;
  }, 2500);
}

function downloadSql() {
  const blob = new Blob([SQL_CONTENT], { type: 'text/sql' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cinetrack_supabase_schema.sql';
  a.click();
  URL.revokeObjectURL(url);
}

async function handleTest() {
  isTesting.value = true;
  testResult.value = null;

  saveSupabaseCredentials(config.value);
  const res = await testSupabaseConnection(config.value);
  testResult.value = res;
  isConnected.value = res.success;
  isTesting.value = false;
}

function switchUser(userId: string) {
  currentUserId.value = userId;
  setCurrentUserId(userId);
  emit('user-switched', userId);
}

onMounted(() => {
  config.value = getSupabaseCredentials();
  isConnected.value = isSupabaseConfigured();
});
</script>

<template>
  <div class="flex flex-col gap-8 w-full text-left">
    <!-- Header Hero -->
    <div class="bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      <div class="absolute -right-16 -bottom-16 w-64 h-64 bg-[#3ecf8e]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex items-center gap-4 z-10">
        <div class="w-14 h-14 rounded-2xl bg-[#0c0e14] border border-[#3ecf8e]/40 flex items-center justify-center text-[#3ecf8e] shadow-[0_0_24px_rgba(62,207,142,0.25)] shrink-0">
          <span class="material-symbols-outlined text-[32px]">database</span>
        </div>
        <div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#e2e2eb]">
              Supabase &amp; Persistencia SQL
            </h1>
            <span
              class="px-2.5 py-0.5 rounded-full font-mono-code text-xs font-bold flex items-center gap-1.5"
              :class="isConnected ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] border border-[#3ecf8e]/40' : 'bg-[#ffd166]/15 text-[#ffd166] border border-[#ffd166]/30'"
            >
              <span class="w-2 h-2 rounded-full" :class="isConnected ? 'bg-[#3ecf8e] animate-pulse' : 'bg-[#ffd166]'"></span>
              <span>{{ isConnected ? 'Supabase Conectado' : 'Modo Almacenamiento Local Activo' }}</span>
            </span>
          </div>
          <p class="text-xs sm:text-sm text-[#8b94a8] mt-1">
            Gestión relacional PostgreSQL: Usuarios, persistencia de películas, ranking individual, seguidos y comentarios con me gusta.
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 shrink-0 z-10">
        <button
          type="button"
          @click="copySql"
          class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3ecf8e] to-[#2ecc71] text-[#072718] font-display text-xs font-bold flex items-center gap-2 shadow-[0_4px_16px_rgba(62,207,142,0.3)] hover:brightness-110 transition-all cursor-pointer"
        >
          <span class="material-symbols-outlined text-[16px]">{{ copiedSql ? 'check' : 'content_copy' }}</span>
          <span>{{ copiedSql ? '¡SQL Copiado!' : 'Copiar SQL Completo' }}</span>
        </button>
        <button
          type="button"
          @click="downloadSql"
          class="px-3.5 py-2.5 rounded-xl bg-[#1e1f26] border border-[#33343b] text-[#e2e2eb] font-mono-code text-xs hover:bg-[#282a30] transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Descargar archivo .sql"
        >
          <span class="material-symbols-outlined text-[16px] text-[#00f1fd]">download</span>
          <span>.sql</span>
        </button>
      </div>
    </div>

    <!-- Active User Switcher Bar (Simulation of Multi-user) -->
    <div class="bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-[#ff4f73] text-[22px]">switch_account</span>
        <div>
          <span class="font-display font-bold text-sm text-[#e2e2eb] block">Simulador de Usuario Activo</span>
          <span class="text-xs text-[#8b94a8]">Cambia de usuario para comprobar que cada cinéfilo tiene su propio ranking y sigue a distintos creadores:</span>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="profile in INITIAL_PROFILES"
          :key="profile.id"
          type="button"
          @click="switchUser(profile.id)"
          class="px-3 py-1.5 rounded-xl font-mono-code text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          :class="[
            currentUserId === profile.id
              ? 'bg-[#ff4f73] text-[#5a001b] font-bold shadow-[0_0_12px_rgba(255,79,115,0.4)]'
              : 'bg-[#1e1f26] text-[#8b94a8] hover:text-[#e2e2eb] border border-[#33343b]/40'
          ]"
        >
          <img :src="profile.avatarUrl" :alt="profile.displayName" class="w-5 h-5 rounded-full object-cover" />
          <span>{{ profile.displayName }}</span>
        </button>
      </div>
    </div>

    <!-- Section Tabs -->
    <div class="flex items-center gap-2 border-b border-[#33343b]/60 pb-1">
      <button
        type="button"
        @click="activeTab = 'sql'"
        class="px-4 py-2 font-display text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative"
        :class="activeTab === 'sql' ? 'text-[#3ecf8e]' : 'text-[#8b94a8] hover:text-[#e2e2eb]'"
      >
        <span class="material-symbols-outlined text-[18px]">terminal</span>
        <span>Script SQL para Supabase</span>
        <span v-if="activeTab === 'sql'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3ecf8e]"></span>
      </button>

      <button
        type="button"
        @click="activeTab = 'tables'"
        class="px-4 py-2 font-display text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative"
        :class="activeTab === 'tables' ? 'text-[#00f1fd]' : 'text-[#8b94a8] hover:text-[#e2e2eb]'"
      >
        <span class="material-symbols-outlined text-[18px]">account_tree</span>
        <span>Diagrama de Tablas &amp; Relaciones</span>
        <span v-if="activeTab === 'tables'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00f1fd]"></span>
      </button>

      <button
        type="button"
        @click="activeTab = 'connection'"
        class="px-4 py-2 font-display text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative"
        :class="activeTab === 'connection' ? 'text-[#ffd166]' : 'text-[#8b94a8] hover:text-[#e2e2eb]'"
      >
        <span class="material-symbols-outlined text-[18px]">settings_input_component</span>
        <span>Credenciales &amp; Test en Vivo</span>
        <span v-if="activeTab === 'connection'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffd166]"></span>
      </button>
    </div>

    <!-- TAB 1: SQL Code Viewer -->
    <div v-if="activeTab === 'sql'" class="flex flex-col gap-4">
      <div class="bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#8b94a8]">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[#3ecf8e] text-[18px]">lightbulb</span>
          <span>Pega este código en el <strong>SQL Editor</strong> de tu proyecto Supabase y presiona <strong>RUN</strong>.</span>
        </div>
        <button
          type="button"
          @click="copySql"
          class="px-3 py-1.5 rounded-lg bg-[#282a30] hover:bg-[#33343b] text-[#e2e2eb] font-mono-code flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span class="material-symbols-outlined text-[15px] text-[#3ecf8e]">{{ copiedSql ? 'check' : 'content_copy' }}</span>
          <span>{{ copiedSql ? 'Copiado al portapapeles' : 'Copiar todo el código' }}</span>
        </button>
      </div>

      <div class="relative bg-[#0c0e14] border border-[#33343b] rounded-2xl p-5 overflow-x-auto shadow-inner max-h-[600px]">
        <pre class="font-mono text-xs text-[#d1d5db] leading-relaxed select-all">{{ SQL_CONTENT }}</pre>
      </div>
    </div>

    <!-- TAB 2: Tables Diagram & Explanations -->
    <div v-else-if="activeTab === 'tables'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <!-- Card 1: Profiles -->
      <div class="bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-5 flex flex-col gap-3 shadow-md hover:border-[#3ecf8e]/50 transition-colors">
        <div class="flex items-center justify-between">
          <span class="font-mono-code text-xs text-[#3ecf8e] font-bold">1. public.profiles</span>
          <span class="px-2 py-0.5 rounded bg-[#3ecf8e]/10 text-[#3ecf8e] text-[10px] font-mono-code">auth.users</span>
        </div>
        <h3 class="font-display font-bold text-base text-[#e2e2eb]">Manejo de Usuarios</h3>
        <p class="text-xs text-[#8b94a8] leading-relaxed">
          Sincronizado automáticamente con <code>auth.users</code> mediante un trigger PostgreSQL. Almacena display_name, handle, avatar_url, bio, nivel y rol cinéfilo.
        </p>
        <ul class="text-[11px] font-mono-code text-[#8b94a8] space-y-1 bg-[#0c0e14] p-3 rounded-xl border border-[#33343b]/40">
          <li class="text-[#3ecf8e]">🔑 id: UUID (FK auth.users)</li>
          <li>• username: TEXT (UNIQUE)</li>
          <li>• display_name: TEXT</li>
          <li>• handle: TEXT (UNIQUE)</li>
          <li>• avatar_url: TEXT</li>
          <li>• role: TEXT</li>
        </ul>
      </div>

      <!-- Card 2: Movies -->
      <div class="bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-5 flex flex-col gap-3 shadow-md hover:border-[#ff4f73]/50 transition-colors">
        <div class="flex items-center justify-between">
          <span class="font-mono-code text-xs text-[#ff4f73] font-bold">2. public.movies</span>
          <span class="px-2 py-0.5 rounded bg-[#ff4f73]/10 text-[#ff4f73] text-[10px] font-mono-code">Catálogo</span>
        </div>
        <h3 class="font-display font-bold text-base text-[#e2e2eb]">Persistencia de Películas</h3>
        <p class="text-xs text-[#8b94a8] leading-relaxed">
          Catálogo global de películas en Supabase con títulos originales, director, año, metraje, género, subgéneros (ARRAY), póster y sinopsis.
        </p>
        <ul class="text-[11px] font-mono-code text-[#8b94a8] space-y-1 bg-[#0c0e14] p-3 rounded-xl border border-[#33343b]/40">
          <li class="text-[#ff4f73]">🔑 id: TEXT (PK slug)</li>
          <li>• title: TEXT</li>
          <li>• director: TEXT</li>
          <li>• year: INTEGER</li>
          <li>• genre: TEXT</li>
          <li>• rating: NUMERIC(3,1)</li>
        </ul>
      </div>

      <!-- Card 3: User Movies (Personal Ranking) -->
      <div class="bg-[#191b22] border border-[#ffd166]/40 rounded-2xl p-5 flex flex-col gap-3 shadow-[0_0_16px_rgba(255,209,102,0.1)] hover:border-[#ffd166] transition-colors">
        <div class="flex items-center justify-between">
          <span class="font-mono-code text-xs text-[#ffd166] font-bold">3. public.user_movies</span>
          <span class="px-2 py-0.5 rounded bg-[#ffd166]/10 text-[#ffd166] text-[10px] font-mono-code">Rankings</span>
        </div>
        <h3 class="font-display font-bold text-base text-[#e2e2eb]">Ranking Propio por Usuario</h3>
        <p class="text-xs text-[#8b94a8] leading-relaxed">
          Cada cinéfilo tiene su propio canon jerárquico (rank_position 1, 2, 3...), estado (vistas / por ver), favoritos, puntaje personal y notas privadas.
        </p>
        <ul class="text-[11px] font-mono-code text-[#8b94a8] space-y-1 bg-[#0c0e14] p-3 rounded-xl border border-[#33343b]/40">
          <li class="text-[#ffd166]">🔑 id: UUID (PK)</li>
          <li>• user_id: UUID (FK profiles)</li>
          <li>• movie_id: TEXT (FK movies)</li>
          <li class="text-[#ffd166]">• rank_position: INTEGER</li>
          <li>• status: 'porver' | 'vistas'</li>
          <li>• user_notes: TEXT</li>
        </ul>
      </div>

      <!-- Card 4: User Follows -->
      <div class="bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-5 flex flex-col gap-3 shadow-md hover:border-[#00f1fd]/50 transition-colors">
        <div class="flex items-center justify-between">
          <span class="font-mono-code text-xs text-[#00f1fd] font-bold">4. public.user_follows</span>
          <span class="px-2 py-0.5 rounded bg-[#00f1fd]/10 text-[#00f1fd] text-[10px] font-mono-code">Social</span>
        </div>
        <h3 class="font-display font-bold text-base text-[#e2e2eb]">Sistema de Seguidos</h3>
        <p class="text-xs text-[#8b94a8] leading-relaxed">
          Relación N:M que permite a un usuario seguir a otros cinéfilos. Los comentarios y rankings de los usuarios seguidos aparecen en su feed personalizado.
        </p>
        <ul class="text-[11px] font-mono-code text-[#8b94a8] space-y-1 bg-[#0c0e14] p-3 rounded-xl border border-[#33343b]/40">
          <li class="text-[#00f1fd]">🔑 id: UUID (PK)</li>
          <li>• follower_id: UUID (FK profiles)</li>
          <li>• following_id: UUID (FK profiles)</li>
          <li>• created_at: TIMESTAMPTZ</li>
          <li>• UNIQUE (follower_id, following_id)</li>
        </ul>
      </div>

      <!-- Card 5: Movie Comments -->
      <div class="bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-5 flex flex-col gap-3 shadow-md hover:border-[#ff4f73]/50 transition-colors">
        <div class="flex items-center justify-between">
          <span class="font-mono-code text-xs text-[#ff4f73] font-bold">5. public.movie_comments</span>
          <span class="px-2 py-0.5 rounded bg-[#ff4f73]/10 text-[#ff4f73] text-[10px] font-mono-code">Críticas</span>
        </div>
        <h3 class="font-display font-bold text-base text-[#e2e2eb]">Comentarios en Películas</h3>
        <p class="text-xs text-[#8b94a8] leading-relaxed">
          Reseñas y comentarios cinematográficos que publican los usuarios en las películas para que sus seguidores y la comunidad los lean y analicen.
        </p>
        <ul class="text-[11px] font-mono-code text-[#8b94a8] space-y-1 bg-[#0c0e14] p-3 rounded-xl border border-[#33343b]/40">
          <li class="text-[#ff4f73]">🔑 id: UUID (PK)</li>
          <li>• movie_id: TEXT (FK movies)</li>
          <li>• user_id: UUID (FK profiles)</li>
          <li>• content: TEXT</li>
          <li>• rating: NUMERIC(3,1)</li>
          <li>• tags: TEXT[]</li>
        </ul>
      </div>

      <!-- Card 6: Likes & Replies -->
      <div class="bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-5 flex flex-col gap-3 shadow-md hover:border-[#00f1fd]/50 transition-colors">
        <div class="flex items-center justify-between">
          <span class="font-mono-code text-xs text-[#00f1fd] font-bold">6. Likes &amp; Respuestas</span>
          <span class="px-2 py-0.5 rounded bg-[#00f1fd]/10 text-[#00f1fd] text-[10px] font-mono-code">Interacción</span>
        </div>
        <h3 class="font-display font-bold text-base text-[#e2e2eb]">Me Gusta &amp; Respuestas</h3>
        <p class="text-xs text-[#8b94a8] leading-relaxed">
          <code>comment_likes</code> permite a los seguidos dar me gusta a los comentarios, y <code>comment_replies</code> habilita debates directos respondiendo a cada crítica.
        </p>
        <ul class="text-[11px] font-mono-code text-[#8b94a8] space-y-1 bg-[#0c0e14] p-3 rounded-xl border border-[#33343b]/40">
          <li>• comment_likes (comment_id, user_id)</li>
          <li>• comment_replies (comment_id, user_id, content)</li>
          <li class="text-[#00f1fd]">• Vista SQL v_followed_feed</li>
        </ul>
      </div>
    </div>

    <!-- TAB 3: Connection Credentials -->
    <div v-else-if="activeTab === 'connection'" class="bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
      <div class="flex items-center justify-between pb-3 border-b border-[#33343b]/60">
        <div>
          <h3 class="font-display font-bold text-lg text-[#e2e2eb]">Credenciales de tu Proyecto Supabase</h3>
          <p class="text-xs text-[#8b94a8] mt-0.5">
            Puedes obtenerlas en el panel de Supabase: <strong>Project Settings > API</strong>.
          </p>
        </div>
        <span class="material-symbols-outlined text-[#3ecf8e] text-[28px]">key</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="font-display text-xs font-semibold text-[#e2e2eb]">Project URL</label>
          <input
            type="text"
            v-model="config.url"
            placeholder="https://xyzcompany.supabase.co"
            class="w-full bg-[#0c0e14] px-4 py-2.5 rounded-xl font-mono-code text-xs text-[#e2e2eb] placeholder:text-[#8b94a8]/50 border border-[#33343b]/60 focus:border-[#3ecf8e] focus:outline-none"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-display text-xs font-semibold text-[#e2e2eb]">Public Anon Key</label>
          <input
            type="password"
            v-model="config.anonKey"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
            class="w-full bg-[#0c0e14] px-4 py-2.5 rounded-xl font-mono-code text-xs text-[#e2e2eb] placeholder:text-[#8b94a8]/50 border border-[#33343b]/60 focus:border-[#3ecf8e] focus:outline-none"
          />
        </div>
      </div>

      <div class="flex items-center justify-between flex-wrap gap-3 pt-2">
        <span class="text-xs text-[#8b94a8]">
          Si dejas estos campos vacíos, la aplicación continuará funcionando con el motor de almacenamiento local de CineTrack Noir con total soporte para perfiles, rankings y follows.
        </span>

        <button
          type="button"
          @click="handleTest"
          :disabled="isTesting"
          class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3ecf8e] to-[#2ecc71] text-[#072718] font-display text-xs font-bold hover:brightness-110 shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-[16px]">sync</span>
          <span>{{ isTesting ? 'Probando...' : 'Guardar y Probar Conexión' }}</span>
        </button>
      </div>

      <!-- Test Output Result Box -->
      <div
        v-if="testResult"
        class="p-4 rounded-xl border flex items-start gap-3 transition-all"
        :class="testResult.success ? 'bg-[#3ecf8e]/10 border-[#3ecf8e]/40 text-[#3ecf8e]' : 'bg-[#ff4f73]/10 border-[#ff4f73]/40 text-[#ff4f73]'"
      >
        <span class="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
          {{ testResult.success ? 'check_circle' : 'error' }}
        </span>
        <div class="text-xs leading-relaxed">
          <p class="font-bold">{{ testResult.success ? '¡Conexión Existosa con Supabase!' : 'Fallo en la prueba de conexión' }}</p>
          <p class="mt-0.5 opacity-90">{{ testResult.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
