<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Movie, UserProfile } from '../types';
import CardItem from '../components/CardItem.vue';
import ModalConfirmacion from '../components/ModalConfirmacion.vue';

const props = defineProps<{
  movies: Movie[];
  currentUser?: UserProfile;
}>();

const emit = defineEmits<{
  (e: 'toggle-favorite', movie: Movie): void;
  (e: 'toggle-status', movie: Movie): void;
  (e: 'delete-movie', movie: Movie): void;
  (e: 'update-rank', payload: { movie: Movie; direction: 'up' | 'down' }): void;
}>();

const activeTab = ref<'favoritos' | 'ranking'>('favoritos');
const filterStatus = ref<'all' | 'porver' | 'vistas'>('all');
const searchQuery = ref('');
const viewMode = ref<'grid' | 'list'>('grid');

// Delete confirmation modal state
const movieToDelete = ref<Movie | null>(null);
const showDeleteModal = ref(false);

const favoritesList = computed(() => props.movies.filter((m) => m.isFavorite));

const rankingList = computed(() => {
  return [...props.movies]
    .filter((m) => m.rankPosition !== undefined)
    .sort((a, b) => (a.rankPosition || 999) - (b.rankPosition || 999));
});

const currentDisplayList = computed(() => {
  let list = activeTab.value === 'favoritos' ? [...favoritesList.value] : [...rankingList.value];

  // Status Filter
  if (filterStatus.value !== 'all') {
    list = list.filter((m) => m.status === filterStatus.value);
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q) ||
        m.year.toString().includes(q)
    );
  }

  return list;
});

function confirmDelete(movie: Movie) {
  movieToDelete.value = movie;
  showDeleteModal.value = true;
}

function handleConfirmDelete() {
  if (movieToDelete.value) {
    emit('delete-movie', movieToDelete.value);
  }
  showDeleteModal.value = false;
  movieToDelete.value = null;
}
</script>

<template>
  <div class="flex flex-col gap-6 w-full text-left">
    <!-- Top Atmospheric Glow -->
    <div class="relative w-full">
      <div class="absolute -top-10 left-1/4 w-96 h-96 bg-[#ff4f73]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div class="absolute top-20 right-1/4 w-96 h-96 bg-[#00f1fd]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <!-- Collection Header Block -->
      <div class="bg-[#191b22]/90 backdrop-blur-md rounded-2xl p-6 border border-[#33343b]/60 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-[#1e1f26] border border-[#ff4f73]/30 flex items-center justify-center text-[#ff4f73] shadow-[0_0_20px_rgba(255,79,115,0.25)] shrink-0">
            <span class="material-symbols-outlined text-[32px]">bookmarks</span>
          </div>
          <div>
            <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#e2e2eb] tracking-tight flex items-center gap-2.5">
              <span>Colección &amp; Ranking Personal</span>
              <span class="font-mono-code text-[11px] px-2.5 py-0.5 rounded-full bg-[#1e1f26] text-[#00f1fd] border border-[#00f1fd]/30 font-normal">
                {{ currentUser?.displayName || 'Sofía Martínez' }}
              </span>
            </h1>
            <p class="text-sm text-[#8b94a8] flex items-center gap-2 mt-1 flex-wrap">
              <span class="font-semibold text-[#ff4f73]">{{ favoritesList.length }} favoritos</span>
              <span>•</span>
              <span class="font-semibold text-[#ffd166]">{{ rankingList.length }} en ranking propio</span>
              <span>•</span>
              <span class="text-[#00f1fd]">Tabla Supabase public.user_movies</span>
            </p>
          </div>
        </div>

        <!-- Main Section Tabs Switcher: Favoritos vs Mi Ranking -->
        <div class="flex items-center gap-2 p-1.5 bg-[#0c0e14] rounded-full shrink-0 border border-[#33343b]/60">
          <button
            type="button"
            @click="activeTab = 'favoritos'"
            class="flex items-center gap-2 px-5 py-2 rounded-full font-display text-sm transition-all cursor-pointer"
            :class="[
              activeTab === 'favoritos'
                ? 'bg-[#ff4f73] text-[#5a001b] font-bold shadow-[0_2px_14px_rgba(255,79,115,0.4)]'
                : 'text-[#8b94a8] hover:text-[#e2e2eb] hover:bg-[#191b22]'
            ]"
          >
            <span class="material-symbols-outlined text-[18px]">favorite</span>
            <span>Favoritos</span>
            <span class="px-2 py-0.2 rounded-full font-mono-code text-[11px]" :class="activeTab === 'favoritos' ? 'bg-[#5a001b]/20 text-[#5a001b]' : 'bg-[#1e1f26] text-[#8b94a8]'">
              {{ favoritesList.length }}
            </span>
          </button>

          <button
            type="button"
            @click="activeTab = 'ranking'"
            class="flex items-center gap-2 px-5 py-2 rounded-full font-display text-sm transition-all cursor-pointer"
            :class="[
              activeTab === 'ranking'
                ? 'bg-gradient-to-r from-[#ffd166] to-[#edc157] text-[#251a00] font-bold shadow-[0_2px_14px_rgba(255,209,102,0.4)]'
                : 'text-[#8b94a8] hover:text-[#e2e2eb] hover:bg-[#191b22]'
            ]"
          >
            <span class="material-symbols-outlined text-[18px]">military_tech</span>
            <span>Mi Ranking</span>
            <span class="px-2 py-0.2 rounded-full font-mono-code text-[11px]" :class="activeTab === 'ranking' ? 'bg-[#251a00]/20 text-[#251a00]' : 'bg-[#1e1f26] text-[#8b94a8]'">
              {{ rankingList.length }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Controls Bar: Search & Sub-filters -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#191b22] p-3 rounded-2xl border border-[#33343b]/50">
      <div class="relative flex-1 min-w-0">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8b94a8] text-[20px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Filtrar en mi colección por título, director..."
          class="w-full bg-[#1e1f26] pl-10 pr-4 py-2.5 rounded-xl text-sm text-[#e2e2eb] placeholder:text-[#8b94a8]/60 focus:outline-none focus:ring-1 focus:ring-[#00f1fd] transition-all"
        />
      </div>

      <!-- Sub-status Pills: Todas, Por Ver, Ya Vistas -->
      <div class="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
        <button
          type="button"
          @click="filterStatus = 'all'"
          class="px-3 py-1.5 rounded-full font-mono-code text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          :class="filterStatus === 'all' ? 'bg-[#ff4f73] text-[#5a001b] shadow-sm' : 'bg-[#1e1f26] text-[#8b94a8] hover:text-[#e2e2eb]'"
        >
          <span>Todas ({{ activeTab === 'favoritos' ? favoritesList.length : rankingList.length }})</span>
        </button>
        <button
          type="button"
          @click="filterStatus = 'porver'"
          class="px-3 py-1.5 rounded-full font-mono-code text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          :class="filterStatus === 'porver' ? 'bg-[#ff4f73] text-[#5a001b] shadow-sm' : 'bg-[#1e1f26] text-[#8b94a8] hover:text-[#e2e2eb]'"
        >
          <span>Por Ver</span>
        </button>
        <button
          type="button"
          @click="filterStatus = 'vistas'"
          class="px-3 py-1.5 rounded-full font-mono-code text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          :class="filterStatus === 'vistas' ? 'bg-[#00f1fd] text-[#00373a] shadow-sm' : 'bg-[#1e1f26] text-[#8b94a8] hover:text-[#e2e2eb]'"
        >
          <span>Vistas</span>
        </button>

        <!-- View Mode (Grid vs List) -->
        <div class="flex items-center p-1 bg-[#1e1f26] rounded-xl border border-[#33343b]/40 ml-1">
          <button
            type="button"
            @click="viewMode = 'grid'"
            class="w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer"
            :class="viewMode === 'grid' ? 'bg-[#282a30] text-[#ff4f73]' : 'text-[#8b94a8]'"
            title="Cuadrícula"
          >
            <span class="material-symbols-outlined text-[16px]">grid_view</span>
          </button>
          <button
            type="button"
            @click="viewMode = 'list'"
            class="w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer"
            :class="viewMode === 'list' ? 'bg-[#282a30] text-[#ff4f73]' : 'text-[#8b94a8]'"
            title="Lista"
          >
            <span class="material-symbols-outlined text-[16px]">format_list_bulleted</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Collection Items List with Vue TransitionGroup -->
    <div v-if="currentDisplayList.length > 0">
      <TransitionGroup
        name="card-list"
        tag="div"
        :class="[
          'w-full',
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
            : 'flex flex-col gap-3'
        ]"
      >
        <div v-for="(movie, index) in currentDisplayList" :key="movie.id" class="relative">
          <CardItem
            :movie="movie"
            :view-mode="viewMode"
            :rank="activeTab === 'ranking' ? (movie.rankPosition || index + 1) : undefined"
            :show-rank-badge="activeTab === 'ranking'"
            :show-delete-button="true"
            @toggle-favorite="emit('toggle-favorite', $event)"
            @toggle-status="emit('toggle-status', $event)"
            @request-delete="confirmDelete"
          />

          <!-- Quick Rank Reorder Buttons (In ranking mode) -->
          <div
            v-if="activeTab === 'ranking'"
            class="absolute top-2 right-12 z-20 flex items-center gap-1 bg-[#0c0e14]/90 p-1 rounded-full border border-[#33343b]/80 shadow-md"
          >
            <button
              type="button"
              @click.stop="emit('update-rank', { movie, direction: 'up' })"
              :disabled="index === 0"
              title="Subir de puesto en el ranking"
              class="w-6 h-6 rounded-full flex items-center justify-center text-[#e2e2eb] hover:bg-[#282a30] hover:text-[#00f1fd] disabled:opacity-30 disabled:hover:text-[#e2e2eb] transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-[14px]">arrow_upward</span>
            </button>
            <button
              type="button"
              @click.stop="emit('update-rank', { movie, direction: 'down' })"
              :disabled="index === currentDisplayList.length - 1"
              title="Bajar de puesto en el ranking"
              class="w-6 h-6 rounded-full flex items-center justify-center text-[#e2e2eb] hover:bg-[#282a30] hover:text-[#00f1fd] disabled:opacity-30 disabled:hover:text-[#e2e2eb] transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-[14px]">arrow_downward</span>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="p-12 rounded-2xl bg-[#191b22] border border-[#33343b]/60 flex flex-col items-center justify-center text-center gap-4 my-4"
    >
      <div class="w-14 h-14 rounded-2xl bg-[#ff4f73]/15 flex items-center justify-center text-[#ff4f73]">
        <span class="material-symbols-outlined text-[32px]">bookmark_border</span>
      </div>
      <div>
        <h3 class="font-display font-bold text-lg text-[#e2e2eb]">
          {{ activeTab === 'favoritos' ? 'Sin películas favoritas' : 'Sin ranking definido' }}
        </h3>
        <p class="text-xs text-[#8b94a8] mt-1 max-w-sm leading-relaxed">
          {{
            activeTab === 'favoritos'
              ? 'Marca cualquier película del catálogo con el corazón para guardarla en tu selección personal permanente.'
              : 'Ordena tu propio canon cinematográfico y asígnales puestos de honor.'
          }}
        </p>
      </div>
      <button
        type="button"
        @click="filterStatus = 'all'; searchQuery = ''"
        class="px-4 py-2 rounded-xl bg-[#1e1f26] text-xs font-semibold text-[#e2e2eb] hover:bg-[#282a30] cursor-pointer"
      >
        Restablecer filtros
      </button>
    </div>

    <!-- Reusable ModalConfirmacion for deletion -->
    <ModalConfirmacion
      :show="showDeleteModal"
      title="¿Quitar de tu colección?"
      :message="movieToDelete ? `¿Confirmas que deseas retirar '${movieToDelete.title}' de tu selección guardada? Se actualizará tu almacenamiento local.` : ''"
      confirm-text="Quitar Película"
      cancel-text="Conservar"
      type="danger"
      icon="delete"
      @confirm="handleConfirmDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>
