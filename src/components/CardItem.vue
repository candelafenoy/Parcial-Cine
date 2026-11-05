<script setup lang="ts">
import { ref } from 'vue';
import type { Movie } from '../types';

const props = withDefaults(
  defineProps<{
    movie: Movie;
    viewMode?: 'grid' | 'list';
    rank?: number;
    showRankBadge?: boolean;
    showDeleteButton?: boolean;
  }>(),
  {
    viewMode: 'grid',
    showRankBadge: false,
    showDeleteButton: false
  }
);

const emit = defineEmits<{
  (e: 'toggle-favorite', movie: Movie): void;
  (e: 'toggle-status', movie: Movie): void;
  (e: 'view-detail', movie: Movie): void;
  (e: 'request-delete', movie: Movie): void;
}>();

const imageError = ref(false);

function handleImageError() {
  imageError.value = true;
}
</script>

<template>
  <!-- GRID VIEW CARD -->
  <article
    v-if="viewMode === 'grid'"
    class="movie-card group bg-[#191b22] rounded-2xl overflow-hidden border border-[#33343b]/60 hover:border-[#ff4f73]/50 shadow-lg hover:shadow-[0_8px_30px_rgba(255,79,115,0.25)] transition-all duration-300 flex flex-col justify-between"
    :data-id="movie.id"
  >
    <!-- Poster with Floating Badges & Action Buttons -->
    <div class="relative w-full aspect-[2/3] overflow-hidden bg-[#0c0e14] cursor-pointer" @click="emit('view-detail', movie)">
      <img
        v-if="!imageError && movie.posterUrl"
        :src="movie.posterUrl"
        :alt="movie.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
        referrerpolicy="no-referrer"
        @error="handleImageError"
      />
      <!-- Fallback container if image fails -->
      <div
        v-else
        class="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#1e1f26] to-[#0c0e14] text-center"
      >
        <span class="material-symbols-outlined text-[44px] text-[#ff4f73] mb-2 opacity-80">movie</span>
        <span class="font-display font-bold text-sm text-[#e2e2eb] line-clamp-2">{{ movie.title }}</span>
        <span class="font-mono-code text-[11px] text-[#00f1fd] mt-1">{{ movie.year }} • {{ movie.genre }}</span>
      </div>

      <!-- Scrim overlay for legibility -->
      <div class="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-transparent to-[#0c0e14]/60 pointer-events-none"></div>

      <!-- Floating Rank Badge (if ranking view) -->
      <div
        v-if="showRankBadge && rank"
        class="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full font-mono-code text-xs font-bold shadow-lg flex items-center gap-1"
        :class="rank <= 3 ? 'bg-gradient-to-r from-[#ffd166] to-[#edc157] text-[#251a00] shadow-[0_0_12px_rgba(255,209,102,0.5)]' : 'bg-[#0c0e14]/85 text-[#00f1fd] border border-[#00f1fd]/30'"
      >
        <span>#{{ rank < 10 ? '0' + rank : rank }}</span>
      </div>

      <!-- Rating Badge (top-left if no rank, or below rank) -->
      <div
        v-else
        class="absolute top-2.5 left-2.5 z-10 bg-[#0c0e14]/85 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#ffd166]/20 shadow-md"
      >
        <span class="material-symbols-outlined text-[#ffd166] text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
        <span class="font-mono-code text-xs text-[#ffd166] font-bold">{{ movie.rating.toFixed(1) }}</span>
      </div>

      <!-- Heart Favorite Trigger Button -->
      <button
        type="button"
        @click.stop="emit('toggle-favorite', movie)"
        :aria-label="movie.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'"
        class="absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full bg-[#0c0e14]/85 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-md border"
        :class="movie.isFavorite ? 'text-[#ff4f73] border-[#ff4f73]/50 shadow-[0_0_14px_rgba(255,79,115,0.4)]' : 'text-[#8b94a8] border-[#33343b] hover:text-[#ff4f73]'"
      >
        <span
          class="material-symbols-outlined text-[19px]"
          :style="movie.isFavorite ? 'font-variation-settings: \'FILL\' 1;' : ''"
        >
          favorite
        </span>
      </button>

      <!-- Status Tag Pill (Bottom Left of Poster) -->
      <div class="absolute bottom-2.5 left-2.5 z-10">
        <span
          v-if="movie.status === 'vistas'"
          class="px-2.5 py-0.5 rounded-full font-mono-code text-[10px] font-bold uppercase tracking-wider bg-[#00f1fd] text-[#00373a] shadow-md flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-[12px]">check_circle</span>
          VISTA
        </span>
        <span
          v-else
          class="px-2.5 py-0.5 rounded-full font-mono-code text-[10px] font-bold uppercase tracking-wider bg-[#ff4f73] text-[#5a001b] shadow-md flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-[12px]">bookmark</span>
          POR VER
        </span>
      </div>
    </div>

    <!-- Metadata Content Block -->
    <div class="p-4 flex flex-col justify-between flex-1 text-left">
      <div>
        <h3
          class="font-display text-base font-bold text-[#e2e2eb] leading-snug group-hover:text-[#ff4f73] transition-colors line-clamp-1 cursor-pointer"
          @click="emit('view-detail', movie)"
          :title="movie.title"
        >
          {{ movie.title }}
        </h3>
        
        <div class="flex items-center gap-1.5 text-xs text-[#8b94a8] mt-1 font-mono-code">
          <span>{{ movie.year }}</span>
          <span>•</span>
          <span>{{ movie.runtime }}</span>
          <span>•</span>
          <span class="text-[#00f1fd] truncate max-w-[110px]" :title="movie.director">{{ movie.director }}</span>
        </div>

        <p class="text-xs text-[#8b94a8]/80 mt-2 line-clamp-2 leading-relaxed">
          {{ movie.synopsis }}
        </p>
      </div>

      <!-- Quick Action Controls -->
      <div class="flex items-center gap-2 mt-4 pt-3 border-t border-[#33343b]/40">
        <button
          type="button"
          @click="emit('view-detail', movie)"
          class="flex-1 py-1.5 px-3 rounded-lg bg-[#1e1f26] hover:bg-[#282a30] text-[#e2e2eb] text-xs font-semibold text-center transition-all hover:text-[#ff4f73] cursor-pointer flex items-center justify-center gap-1"
        >
          <span class="material-symbols-outlined text-[16px]">visibility</span>
          <span>Detalle</span>
        </button>

        <button
          type="button"
          @click="emit('toggle-status', movie)"
          :title="movie.status === 'vistas' ? 'Marcar como Por Ver' : 'Marcar como Vista'"
          class="p-1.5 rounded-lg bg-[#1e1f26] hover:bg-[#282a30] text-[#8b94a8] hover:text-[#00f1fd] transition-all cursor-pointer flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-[18px]">
            {{ movie.status === 'vistas' ? 'bookmark_border' : 'done_all' }}
          </span>
        </button>

        <button
          v-if="showDeleteButton"
          type="button"
          @click="emit('request-delete', movie)"
          title="Eliminar de mi lista"
          class="p-1.5 rounded-lg bg-[#1e1f26] hover:bg-[#93000a]/30 text-[#8b94a8] hover:text-[#ffb4ab] transition-all cursor-pointer flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  </article>

  <!-- LIST VIEW CARD -->
  <article
    v-else
    class="movie-card group bg-[#191b22] rounded-2xl p-3.5 sm:p-4 border border-[#33343b]/60 hover:border-[#ff4f73]/50 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full text-left"
    :data-id="movie.id"
  >
    <div class="flex items-start sm:items-center gap-3.5 flex-1 min-w-0 w-full sm:w-auto">
      <!-- Rank position in list -->
      <div
        v-if="rank"
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-mono-code font-bold text-sm shadow-md"
        :class="rank <= 3 ? 'bg-gradient-to-br from-[#ffd166] to-[#edc157] text-[#251a00] shadow-[0_0_12px_rgba(255,209,102,0.4)]' : 'bg-[#1e1f26] text-[#ff4f73] border border-[#ff4f73]/20'"
      >
        #{{ rank < 10 ? '0' + rank : rank }}
      </div>

      <!-- Thumbnail -->
      <div
        class="w-16 h-22 sm:w-16 sm:h-24 rounded-lg overflow-hidden bg-[#0c0e14] shrink-0 cursor-pointer relative group/thumb shadow-sm"
        @click="emit('view-detail', movie)"
      >
        <img
          v-if="!imageError && movie.posterUrl"
          :src="movie.posterUrl"
          :alt="movie.title"
          class="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
          loading="lazy"
          referrerpolicy="no-referrer"
          @error="handleImageError"
        />
        <div v-else class="w-full h-full flex items-center justify-center bg-[#1e1f26] text-[#ff4f73]">
          <span class="material-symbols-outlined text-[20px]">movie</span>
        </div>
      </div>

      <!-- Title, metadata & tags -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <h3
            class="font-display text-base font-bold text-[#e2e2eb] group-hover:text-[#ff4f73] transition-colors truncate cursor-pointer"
            @click="emit('view-detail', movie)"
          >
            {{ movie.title }}
          </h3>
          <span
            v-if="movie.isSuggested"
            class="px-2 py-0.5 rounded-full bg-[#ff4f73]/20 border border-[#ff4f73]/40 text-[#ff4f73] font-mono-code text-[10px] font-bold uppercase"
          >
            Sugerida
          </span>
        </div>

        <div class="flex items-center gap-2 text-xs text-[#8b94a8] mt-1 font-mono-code flex-wrap">
          <span>{{ movie.year }}</span>
          <span>•</span>
          <span>{{ movie.runtime }}</span>
          <span>•</span>
          <span class="text-[#00f1fd]">{{ movie.director }}</span>
          <span>•</span>
          <span class="text-[#ffd166] font-bold flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[13px]" style="font-variation-settings: 'FILL' 1;">star</span>
            {{ movie.rating.toFixed(1) }}
          </span>
        </div>

        <p class="text-xs text-[#8b94a8]/70 mt-1 line-clamp-1 max-w-xl hidden md:block">
          {{ movie.userNotes || movie.synopsis }}
        </p>
      </div>
    </div>

    <!-- Actions block in list view -->
    <div class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#33343b]/40">
      <!-- Status pill -->
      <button
        type="button"
        @click="emit('toggle-status', movie)"
        class="px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
        :class="movie.status === 'vistas' ? 'bg-[#00f1fd]/15 text-[#00f1fd] border border-[#00f1fd]/30 hover:bg-[#00f1fd]/25' : 'bg-[#ff4f73]/15 text-[#ff4f73] border border-[#ff4f73]/30 hover:bg-[#ff4f73]/25'"
      >
        <span class="material-symbols-outlined text-[14px]">
          {{ movie.status === 'vistas' ? 'check_circle' : 'bookmark' }}
        </span>
        <span>{{ movie.status === 'vistas' ? 'Vista' : 'Por Ver' }}</span>
      </button>

      <!-- Favorite Trigger -->
      <button
        type="button"
        @click="emit('toggle-favorite', movie)"
        :aria-label="movie.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'"
        class="w-9 h-9 rounded-lg bg-[#1e1f26] hover:bg-[#282a30] flex items-center justify-center transition-all cursor-pointer"
        :class="movie.isFavorite ? 'text-[#ff4f73]' : 'text-[#8b94a8] hover:text-[#ff4f73]'"
      >
        <span
          class="material-symbols-outlined text-[18px]"
          :style="movie.isFavorite ? 'font-variation-settings: \'FILL\' 1;' : ''"
        >
          favorite
        </span>
      </button>

      <!-- View Detail -->
      <button
        type="button"
        @click="emit('view-detail', movie)"
        class="py-1.5 px-3 rounded-lg bg-[#1e1f26] hover:bg-[#282a30] text-[#e2e2eb] text-xs font-semibold transition-all hover:text-[#00f1fd] flex items-center gap-1 cursor-pointer"
      >
        <span class="material-symbols-outlined text-[16px]">visibility</span>
        <span class="hidden md:inline">Ficha</span>
      </button>

      <!-- Delete button -->
      <button
        v-if="showDeleteButton"
        type="button"
        @click="emit('request-delete', movie)"
        title="Eliminar de mi lista"
        class="w-9 h-9 rounded-lg bg-[#1e1f26] hover:bg-[#93000a]/30 text-[#8b94a8] hover:text-[#ffb4ab] transition-all cursor-pointer flex items-center justify-center"
      >
        <span class="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>
  </article>
</template>
