<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    searchQuery: string;
    selectedGenre: string;
    sortBy: string;
    viewMode: 'grid' | 'list';
    totalResults: number;
    genreCounts?: Record<string, number>;
    isApiLoading?: boolean;
    showApiSearch?: boolean;
  }>(),
  {
    searchQuery: '',
    selectedGenre: 'all',
    sortBy: 'rating',
    viewMode: 'grid',
    totalResults: 0,
    isApiLoading: false,
    showApiSearch: true
  }
);

const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void;
  (e: 'update:selectedGenre', val: string): void;
  (e: 'update:sortBy', val: string): void;
  (e: 'update:viewMode', val: 'grid' | 'list'): void;
  (e: 'fetch-api', query: string): void;
  (e: 'clear-filters'): void;
}>();

const GENRES = [
  { id: 'all', label: 'Todas', color: '#ff4f73' },
  { id: 'Clásicas', label: 'Clásicas', color: '#ac888b' },
  { id: 'Estreno', label: 'Estrenos', color: '#00f1fd' },
  { id: 'Animación', label: 'Animación', color: '#ffd166' },
  { id: 'Sci-Fi', label: 'Sci-Fi', color: '#6ff6ff' },
  { id: 'Noir', label: 'Noir', color: '#ffb2ba' },
  { id: 'Drama', label: 'Drama', color: '#e5bdc0' },
  { id: 'Acción', label: 'Acción', color: '#ff4f73' }
];

function onSearchInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit('update:searchQuery', target.value);
}

function clearSearch() {
  emit('update:searchQuery', '');
}
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <!-- Category & Genre Filter Chips -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" id="categoryFilterContainer">
      <button
        v-for="g in GENRES"
        :key="g.id"
        type="button"
        @click="emit('update:selectedGenre', g.id)"
        class="group px-3.5 py-1.5 rounded-full font-display text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0"
        :class="[
          selectedGenre === g.id
            ? 'bg-[#ff4f73] text-[#5a001b] font-bold shadow-[0_0_16px_rgba(255,79,115,0.4)]'
            : 'bg-[#191b22] text-[#8b94a8] hover:text-[#e2e2eb] hover:bg-[#1e1f26]'
        ]"
      >
        <span
          class="w-2 h-2 rounded-full transition-all"
          :class="selectedGenre === g.id ? 'bg-[#5a001b]' : 'bg-[#33343b] group-hover:bg-[#ff4f73]'"
        ></span>
        <span>{{ g.label }}</span>
        <span
          v-if="genreCounts && genreCounts[g.id] !== undefined"
          class="px-1.5 py-0.2 rounded-full text-[11px] font-mono-code"
          :class="selectedGenre === g.id ? 'bg-[#5a001b]/20 text-[#5a001b]' : 'text-[#8b94a8]'"
        >
          {{ genreCounts[g.id] }}
        </span>
      </button>
    </div>

    <!-- Controls Row: Search Input + Metrics Info + View Switcher + Sorting Dropdown -->
    <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#191b22] p-3 rounded-2xl border border-[#33343b]/50">
      <!-- Search Field -->
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div class="relative flex-1">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8b94a8] text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            :value="searchQuery"
            @input="onSearchInput"
            @keydown.enter="showApiSearch && searchQuery.trim() ? emit('fetch-api', searchQuery) : null"
            placeholder="Buscar título, director, género..."
            class="w-full bg-[#1e1f26] pl-10 pr-20 py-2.5 rounded-xl text-sm text-[#e2e2eb] placeholder:text-[#8b94a8]/60 focus:outline-none focus:ring-1 focus:ring-[#00f1fd] transition-all"
          />
          <!-- Clear Button or ⌘K label -->
          <div class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <button
              v-if="searchQuery"
              type="button"
              @click="clearSearch"
              class="w-6 h-6 rounded-full bg-[#282a30] hover:bg-[#33343b] text-[#8b94a8] hover:text-[#e2e2eb] flex items-center justify-center transition-all cursor-pointer"
              title="Limpiar búsqueda"
            >
              <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
            <span
              v-else
              class="hidden sm:inline font-mono-code text-[11px] text-[#8b94a8] bg-[#282a30] px-1.5 py-0.5 rounded"
            >
              ⌘K
            </span>
          </div>
        </div>

        <!-- Optional Live API Fetch Button -->
        <button
          v-if="showApiSearch && searchQuery.trim().length > 1"
          type="button"
          @click="emit('fetch-api', searchQuery)"
          :disabled="isApiLoading"
          class="shrink-0 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f1fd]/20 to-[#6ff6ff]/20 hover:from-[#00f1fd]/30 hover:to-[#6ff6ff]/30 text-[#00f1fd] border border-[#00f1fd]/40 text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          title="Buscar películas en la API pública abierta de cine vía Fetch"
        >
          <span
            class="material-symbols-outlined text-[16px]"
            :class="{ 'animate-spin': isApiLoading }"
          >
            {{ isApiLoading ? 'sync' : 'cloud_download' }}
          </span>
          <span class="hidden sm:inline">{{ isApiLoading ? 'Consultando API...' : 'Fetch API' }}</span>
        </button>

        <!-- Total Results indicator -->
        <div class="hidden xl:flex items-center gap-1.5 font-mono-code text-xs text-[#8b94a8] shrink-0">
          <span class="w-2 h-2 rounded-full bg-[#ff4f73]"></span>
          <span><strong class="text-[#e2e2eb]">{{ totalResults }}</strong> en catálogo</span>
        </div>
      </div>

      <!-- Right Controls: Sort & Grid/List View Toggles -->
      <div class="flex items-center gap-2 self-end lg:self-auto shrink-0">
        <!-- Sort Selector -->
        <div class="relative flex items-center bg-[#1e1f26] px-3 py-2 rounded-xl text-xs text-[#e2e2eb] border border-[#33343b]/40">
          <span class="material-symbols-outlined text-[#ff4f73] text-[18px] mr-1.5">swap_vert</span>
          <span class="text-[#8b94a8] font-mono-code mr-1.5 hidden sm:inline">ORDEN:</span>
          <select
            :value="sortBy"
            @change="(e) => emit('update:sortBy', (e.target as HTMLSelectElement).value)"
            class="bg-transparent text-[#e2e2eb] font-display font-semibold focus:outline-none cursor-pointer pr-3 appearance-none"
          >
            <option class="bg-[#191b22] text-[#e2e2eb]" value="rating">Calificación (Descendente)</option>
            <option class="bg-[#191b22] text-[#e2e2eb]" value="year">Año de Estreno (Reciente)</option>
            <option class="bg-[#191b22] text-[#e2e2eb]" value="title">Nombre Alfabético</option>
            <option class="bg-[#191b22] text-[#e2e2eb]" value="favorites">Favoritas primero</option>
          </select>
          <span class="material-symbols-outlined text-[16px] text-[#8b94a8] pointer-events-none -ml-2">expand_more</span>
        </div>

        <!-- View Mode (Grid vs List) -->
        <div class="flex items-center p-1 bg-[#1e1f26] rounded-xl border border-[#33343b]/40">
          <button
            type="button"
            @click="emit('update:viewMode', 'grid')"
            aria-label="Vista cuadrícula"
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer"
            :class="viewMode === 'grid' ? 'bg-[#282a30] text-[#ff4f73] shadow-sm' : 'text-[#8b94a8] hover:text-[#e2e2eb]'"
          >
            <span class="material-symbols-outlined text-[18px]">grid_view</span>
          </button>
          <button
            type="button"
            @click="emit('update:viewMode', 'list')"
            aria-label="Vista lista"
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer"
            :class="viewMode === 'list' ? 'bg-[#282a30] text-[#ff4f73] shadow-sm' : 'text-[#8b94a8] hover:text-[#e2e2eb]'"
          >
            <span class="material-symbols-outlined text-[18px]">format_list_bulleted</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
