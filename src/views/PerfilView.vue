<script setup lang="ts">
import { computed } from 'vue';
import type { Movie, UserProfile } from '../types';
import { getCurrentUserProfile, getFollowingUsers } from '../services/supabaseService';

const props = defineProps<{
  movies: Movie[];
  currentUser?: UserProfile;
}>();

const emit = defineEmits<{
  (e: 'navigate', view: string): void;
}>();

const user = computed(() => props.currentUser || getCurrentUserProfile());
const followingCount = computed(() => getFollowingUsers(user.value.id).length);

const GENRE_STATS = [
  { name: 'Ciencia Ficción', percent: 42, color: 'from-[#ff4f73] to-[#ffb2ba]', barColor: 'bg-[#ff4f73]' },
  { name: 'Drama & Autor', percent: 28, color: 'from-[#00f1fd] to-[#6ff6ff]', barColor: 'bg-[#00f1fd]' },
  { name: 'Film Noir & Crimen', percent: 16, color: 'from-[#ffd166] to-[#edc157]', barColor: 'bg-[#ffd166]' },
  { name: 'Animación Tradicional', percent: 14, color: 'from-[#ffb2ba] to-[#e5bdc0]', barColor: 'bg-[#ffb2ba]' }
];

const DIRECTORS = [
  { name: 'Denis Villeneuve', works: 'Dune 1 & 2, Blade Runner 2049, Sicario', rating: 9.6 },
  { name: 'Christopher Nolan', works: 'Oppenheimer, Interstellar, Memento', rating: 9.4 },
  { name: 'Stanley Kubrick', works: '2001, El Resplandor, Barry Lyndon', rating: 9.8 },
  { name: 'Luis Ortega', works: 'El Jockey, El Ángel, Historia de un Clan', rating: 9.1 }
];
</script>

<template>
  <div class="flex flex-col gap-8 w-full text-left">
    <!-- Top Level Profile Hero & Metric Telemetry Banner -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      <!-- User ID Card (Bento Left: 7 cols) -->
      <div class="lg:col-span-7 bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xl">
        <div class="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-[#ff4f73]/10 blur-3xl pointer-events-none"></div>
        <div class="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-[#00f1fd]/10 blur-2xl pointer-events-none"></div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10">
          <!-- Avatar with Verified Badge -->
          <div class="relative group shrink-0">
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#0c0e14] border-2 border-[#ff4f73]/50 shadow-[0_0_24px_rgba(255,79,115,0.3)]">
              <img
                :src="user.avatarUrl"
                :alt="user.displayName"
                class="w-full h-full object-cover"
                referrerpolicy="no-referrer"
              />
            </div>
            <div class="absolute -bottom-1 -right-1 bg-[#0c0e14] p-0.5 rounded-full">
              <span class="material-symbols-outlined text-[#ff4f73] text-[20px] bg-[#ff4f73]/20 rounded-full p-1" style="font-variation-settings: 'FILL' 1;">
                verified
              </span>
            </div>
          </div>

          <!-- Profile Details -->
          <div class="flex flex-col flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff4f73]/15 text-[#ff4f73] font-mono-code text-[11px] uppercase tracking-wider font-bold">
                <span class="w-1.5 h-1.5 rounded-full bg-[#ff4f73] animate-pulse"></span>
                {{ user.role }}
              </span>
              <span class="px-2.5 py-0.5 rounded-full bg-[#1e1f26] text-[#ffd166] font-mono-code text-[11px] uppercase tracking-wider">
                Estudio 35mm
              </span>
            </div>

            <div class="flex items-center justify-between gap-3">
              <h1 class="font-display text-2xl sm:text-3xl text-[#e2e2eb] font-bold tracking-tight truncate">
                {{ user.displayName }}
              </h1>
              <span class="font-mono-code text-xs text-[#00f1fd] bg-[#00f1fd]/10 px-2 py-0.5 rounded">
                #CINE-8942
              </span>
            </div>
            <p class="font-mono-code text-xs text-[#8b94a8]">{{ user.handle }} • Buenos Aires</p>

            <div class="mt-3 flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1e1f26] border border-[#33343b]/40">
              <span class="material-symbols-outlined text-[#ff4f73] text-[18px] shrink-0">format_quote</span>
              <p class="text-xs text-[#e2e2eb]/90 italic truncate flex-1">
                {{ user.bio }}
              </p>
              <div class="px-2 py-0.5 rounded bg-[#ff4f73] text-[#5a001b] font-mono-code text-[10px] font-bold shrink-0">
                Nivel {{ user.level }}
              </div>
            </div>
          </div>
        </div>

        <!-- Social Metrics (Followers, Following, Ranking) -->
        <div class="mt-5 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8b94a8] font-mono-code border-t border-[#33343b]/40 z-10">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1.5 text-[#00f1fd]">
              <span class="material-symbols-outlined text-[16px]">group</span>
              <strong class="text-[#e2e2eb]">{{ user.followersCount }}</strong> seguidores
            </span>
            <span class="flex items-center gap-1.5 text-[#ffd166]">
              <span class="material-symbols-outlined text-[16px]">person_add</span>
              <strong class="text-[#e2e2eb]">{{ followingCount }}</strong> seguidos
            </span>
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">database</span> Supabase public.profiles
            </span>
          </div>
          <button
            type="button"
            @click="emit('navigate', 'mi-coleccion')"
            class="text-[#ff4f73] hover:underline flex items-center gap-1 cursor-pointer font-bold"
          >
            <span>Ver mi ranking propio</span>
            <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Telemetry (Bento Right: 5 cols) -->
      <div class="lg:col-span-5 grid grid-cols-3 gap-3.5">
        <!-- Metric 1: Vistas -->
        <div class="bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-md">
          <div class="w-10 h-10 rounded-xl bg-[#1e1f26] flex items-center justify-center text-[#00f1fd]">
            <span class="material-symbols-outlined text-[20px]">visibility</span>
          </div>
          <div class="my-2 flex flex-col items-center">
            <span class="font-display text-2xl font-bold text-[#e2e2eb]">
              {{ movies.filter(m => m.status === 'vistas').length }}
            </span>
            <span class="font-mono-code text-[10px] uppercase text-[#8b94a8]">Vistas</span>
          </div>
          <div class="w-full bg-[#1e1f26] h-1.5 rounded-full overflow-hidden">
            <div class="bg-[#00f1fd] h-full rounded-full" style="width: 74%;"></div>
          </div>
        </div>

        <!-- Metric 2: Ranking (Hero) -->
        <div class="bg-[#1e1f26] border border-[#ff4f73]/40 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-[0_0_20px_rgba(255,79,115,0.2)]">
          <div class="w-10 h-10 rounded-xl bg-[#ff4f73]/20 flex items-center justify-center text-[#ff4f73]">
            <span class="material-symbols-outlined text-[20px]">leaderboard</span>
          </div>
          <div class="my-2 flex flex-col items-center">
            <span class="font-display text-2xl font-bold text-[#ff4f73]">
              {{ movies.filter(m => m.rankPosition !== undefined).length }}
            </span>
            <span class="font-mono-code text-[10px] uppercase text-[#e2e2eb]">En Ranking</span>
          </div>
          <span class="font-mono-code text-[10px] text-[#00f1fd]">Top Personal</span>
        </div>

        <!-- Metric 3: Promedio -->
        <div class="bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-md">
          <div class="w-10 h-10 rounded-xl bg-[#1e1f26] flex items-center justify-center text-[#ffd166]">
            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">star</span>
          </div>
          <div class="my-2 flex flex-col items-center">
            <span class="font-display text-2xl font-bold text-[#e2e2eb]">9.2</span>
            <span class="font-mono-code text-[10px] uppercase text-[#8b94a8]">Promedio</span>
          </div>
          <div class="flex items-center gap-0.5 text-[#ffd166]">
            <span class="text-xs">★★★★½</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2-Column Analytics: Géneros Favoritos & Directores Esenciales -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Géneros Favoritos Analytics -->
      <div class="lg:col-span-6 bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
        <div class="flex items-center justify-between pb-3 border-b border-[#33343b]/40">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-[#ff4f73]/20 flex items-center justify-center text-[#ff4f73]">
              <span class="material-symbols-outlined text-[18px]">pie_chart</span>
            </div>
            <h2 class="font-display text-lg font-bold text-[#e2e2eb]">Géneros Favoritos</h2>
          </div>
          <span class="font-mono-code text-xs text-[#00f1fd] bg-[#00f1fd]/10 px-2.5 py-0.5 rounded-full">
            Estadísticas de Usuario
          </span>
        </div>

        <div class="flex flex-col gap-4">
          <div v-for="g in GENRE_STATS" :key="g.name" class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :class="g.barColor"></span>
                <span class="font-display font-semibold text-[#e2e2eb]">{{ g.name }}</span>
              </div>
              <span class="font-mono-code font-bold text-[#e2e2eb]">{{ g.percent }}%</span>
            </div>
            <div class="w-full bg-[#1e1f26] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#33343b]/40">
              <div
                class="h-full rounded-full bg-gradient-to-r shadow-sm transition-all duration-700"
                :class="g.color"
                :style="{ width: `${g.percent}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Directores Esenciales & Afinidad -->
      <div class="lg:col-span-6 bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
        <div class="flex items-center justify-between pb-3 border-b border-[#33343b]/40">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-[#00f1fd]/20 flex items-center justify-center text-[#00f1fd]">
              <span class="material-symbols-outlined text-[18px]">movie_edit</span>
            </div>
            <h2 class="font-display text-lg font-bold text-[#e2e2eb]">Directores Esenciales</h2>
          </div>
          <span class="font-mono-code text-xs text-[#ffd166]">Afinidad Crítica</span>
        </div>

        <div class="flex flex-col gap-3">
          <div
            v-for="d in DIRECTORS"
            :key="d.name"
            class="p-3.5 rounded-xl bg-[#1e1f26] border border-[#33343b]/40 flex items-center justify-between gap-3 hover:border-[#00f1fd]/40 transition-colors"
          >
            <div>
              <h4 class="font-display font-bold text-sm text-[#e2e2eb]">{{ d.name }}</h4>
              <p class="text-xs text-[#8b94a8] mt-0.5 line-clamp-1">{{ d.works }}</p>
            </div>
            <div class="flex items-center gap-1 bg-[#0c0e14] px-2.5 py-1 rounded-lg border border-[#ffd166]/20 shrink-0">
              <span class="material-symbols-outlined text-[#ffd166] text-[13px]" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="font-mono-code text-xs font-bold text-[#ffd166]">{{ d.rating.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
