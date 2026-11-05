<script setup lang="ts">
import { ref } from 'vue';
import type { ViewType, UserProfile } from '../types';

const props = withDefaults(
  defineProps<{
    currentView: ViewType;
    favoritesCount?: number;
    rankingCount?: number;
    currentUser?: UserProfile;
  }>(),
  {
    favoritesCount: 0,
    rankingCount: 0
  }
);

const emit = defineEmits<{
  (e: 'navigate', view: ViewType): void;
  (e: 'focus-search'): void;
}>();

const mobileMenuOpen = ref(false);
const notificationsOpen = ref(false);

const NAV_ITEMS: Array<{ id: ViewType; label: string; icon: string; badge?: number; isSpecial?: boolean }> = [
  { id: 'catalogo', label: 'Catálogo', icon: 'movie' },
  { id: 'mi-coleccion', label: 'Mi Colección', icon: 'bookmarks', badge: props.favoritesCount },
  { id: 'comunidad', label: 'Comunidad', icon: 'forum' },
  { id: 'sugerir-pelicula', label: 'Sugerir Película', icon: 'rate_review' },
  { id: 'supabase-sql', label: 'Supabase SQL', icon: 'database', isSpecial: true },
  { id: 'perfil', label: 'Perfil', icon: 'person' }
];

function setView(view: ViewType) {
  emit('navigate', view);
  mobileMenuOpen.value = false;
  notificationsOpen.value = false;
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-40 bg-[#0c0e14]/90 backdrop-blur-xl border-b border-[#33343b]/60 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
    <div class="h-20 w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
      <!-- Brand Logo Zone -->
      <div class="flex items-center gap-3 shrink-0">
        <button
          type="button"
          @click="setView('catalogo')"
          class="flex items-center group text-left cursor-pointer"
        >
          <span class="font-display font-extrabold text-xl sm:text-2xl text-[#e2e2eb] tracking-tight leading-none group-hover:text-[#ff4f73] transition-colors whitespace-nowrap">
            CineTrack<span class="text-[#ff4f73]">.</span>
          </span>
        </button>
      </div>

      <!-- Desktop Navigation Links (Pill Container) -->
      <nav class="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[#191b22] border border-[#33343b]/40">
        <button
          v-for="item in NAV_ITEMS"
          :key="item.id"
          type="button"
          @click="setView(item.id)"
          class="px-3.5 py-1.5 rounded-full font-display text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
          :class="[
            currentView === item.id
              ? item.isSpecial
                ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] font-bold shadow-[0_0_12px_rgba(62,207,142,0.3)] border border-[#3ecf8e]/40'
                : 'bg-[#1e1f26] text-[#ff4f73] font-bold shadow-[0_0_12px_rgba(255,178,186,0.2)] border border-[#ff4f73]/30'
              : item.isSpecial
                ? 'text-[#3ecf8e] hover:bg-[#3ecf8e]/10'
                : 'text-[#8b94a8] hover:text-[#e2e2eb] hover:bg-[#1e1f26]/60'
          ]"
        >
          <span class="material-symbols-outlined text-[17px]">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <!-- Search input shortcut (Desktop) -->
      <div class="flex-1 max-w-xs relative hidden xl:block">
        <button
          type="button"
          @click="emit('focus-search'); setView('catalogo')"
          class="w-full bg-[#191b22] hover:bg-[#1e1f26] px-3.5 py-2 rounded-full text-xs font-mono-code text-[#8b94a8] flex items-center justify-between border border-[#33343b]/40 transition-all cursor-pointer"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[17px] text-[#00f1fd]">search</span>
            <span>Buscar catálogo...</span>
          </div>
          <span class="bg-[#282a30] text-[#e2e2eb] px-1.5 py-0.5 rounded text-[10px]">⌘K</span>
        </button>
      </div>

      <!-- Right Header Actions (Notifications + Profile + Mobile Toggle) -->
      <div class="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <!-- Supabase Status Quick Link -->
        <button
          type="button"
          @click="setView('supabase-sql')"
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#191b22] hover:bg-[#1e1f26] border border-[#3ecf8e]/30 font-mono-code text-xs text-[#3ecf8e] transition-colors cursor-pointer"
          title="Ver Esquema SQL y Persistencia Supabase"
        >
          <span class="w-2 h-2 rounded-full bg-[#3ecf8e] animate-pulse"></span>
          <span>Supabase SQL</span>
        </button>

        <!-- Notification Bell Dropdown Button -->
        <div class="relative">
          <button
            type="button"
            @click="notificationsOpen = !notificationsOpen"
            aria-label="Notificaciones"
            class="relative w-10 h-10 rounded-full bg-[#191b22] hover:bg-[#1e1f26] border border-[#33343b]/40 flex items-center justify-center text-[#e2e2eb] transition-all cursor-pointer"
          >
            <span class="material-symbols-outlined text-[20px]">notifications</span>
            <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ff4f73] shadow-[0_0_8px_#ff4f73] animate-pulse"></span>
          </button>

          <!-- Notifications Popup Drawer -->
          <div
            v-if="notificationsOpen"
            class="absolute right-0 top-12 z-50 w-80 p-3.5 rounded-2xl bg-[#191b22] border border-[#33343b] shadow-2xl flex flex-col gap-2.5 animate-fadeIn text-left"
          >
            <div class="flex items-center justify-between pb-2 border-b border-[#33343b]">
              <span class="font-display font-bold text-xs text-[#e2e2eb]">NOTIFICACIONES CINETRACK</span>
              <span class="font-mono-code text-[10px] text-[#00f1fd] bg-[#00f1fd]/10 px-1.5 py-0.5 rounded">2 NUEVAS</span>
            </div>
            <div class="flex items-start gap-2.5 p-2 rounded-xl bg-[#1e1f26]">
              <span class="material-symbols-outlined text-[#3ecf8e] text-[18px] shrink-0 mt-0.5">database</span>
              <div class="text-xs">
                <p class="text-[#e2e2eb] font-semibold">Esquema Supabase Listo</p>
                <p class="text-[#8b94a8] text-[11px] mt-0.5">Manejo de usuarios, rankings y seguidos generado.</p>
              </div>
            </div>
            <div class="flex items-start gap-2.5 p-2 rounded-xl bg-[#1e1f26]">
              <span class="material-symbols-outlined text-[#ff4f73] text-[18px] shrink-0 mt-0.5">favorite</span>
              <div class="text-xs">
                <p class="text-[#e2e2eb] font-semibold">Mateo V. dio like a tu reseña</p>
                <p class="text-[#8b94a8] text-[11px] mt-0.5">En el hilo de Dune: Parte Dos.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Chip -->
        <button
          type="button"
          @click="setView('perfil')"
          class="flex items-center gap-2 pl-1 py-1 pr-3 rounded-full bg-[#191b22] hover:bg-[#1e1f26] border border-[#33343b]/40 transition-all cursor-pointer text-left"
          title="Ver mi perfil cinéfilo"
        >
          <div class="w-8 h-8 rounded-full overflow-hidden bg-[#ff4f73]/20 border border-[#ff4f73]/40 flex items-center justify-center text-[#ff4f73] shrink-0">
            <img v-if="currentUser?.avatarUrl" :src="currentUser.avatarUrl" :alt="currentUser.displayName" class="w-full h-full object-cover" />
            <span v-else class="material-symbols-outlined text-[18px]">person</span>
          </div>
          <div class="hidden md:flex flex-col">
            <span class="font-display font-bold text-xs text-[#e2e2eb] leading-tight truncate max-w-[110px]">
              {{ currentUser?.displayName || 'Sofía M.' }}
            </span>
            <span class="font-mono-code text-[10px] text-[#ffd166] leading-none">
              {{ currentUser?.role || 'Cinéfilo Pro' }}
            </span>
          </div>
        </button>

        <!-- Mobile / Tablet Hamburger Menu Toggle -->
        <button
          type="button"
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="lg:hidden w-10 h-10 rounded-xl bg-[#191b22] hover:bg-[#1e1f26] border border-[#33343b]/40 flex items-center justify-center text-[#e2e2eb] transition-all cursor-pointer"
          :aria-expanded="mobileMenuOpen"
          aria-label="Abrir menú"
        >
          <span class="material-symbols-outlined text-[22px]">
            {{ mobileMenuOpen ? 'close' : 'menu' }}
          </span>
        </button>
      </div>
    </div>

    <!-- Responsive Mobile / Tablet Drawer Menu -->
    <Transition name="modal">
      <div
        v-if="mobileMenuOpen"
        class="lg:hidden border-t border-[#33343b] bg-[#0c0e14]/95 backdrop-blur-2xl px-4 py-5 flex flex-col gap-3 shadow-2xl"
      >
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="item in NAV_ITEMS"
            :key="item.id"
            type="button"
            @click="setView(item.id)"
            class="flex items-center gap-2.5 p-3 rounded-xl font-display text-sm font-semibold transition-all cursor-pointer"
            :class="[
              currentView === item.id
                ? 'bg-[#ff4f73]/15 text-[#ff4f73] border border-[#ff4f73]/40 font-bold'
                : 'bg-[#191b22] text-[#8b94a8] hover:text-[#e2e2eb]'
            ]"
          >
            <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </header>
</template>
