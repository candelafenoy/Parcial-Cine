<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Movie } from '../types';
import Buscador from '../components/Buscador.vue';
import CardItem from '../components/CardItem.vue';

const props = defineProps<{
  movies: Movie[];
  isApiLoading: boolean;
  apiError: string | null;
}>();

const emit = defineEmits<{
  (e: 'toggle-favorite', movie: Movie): void;
  (e: 'toggle-status', movie: Movie): void;
  (e: 'fetch-api', query: string): void;
  (e: 'open-suggest'): void;
}>();

// Filter & Search states
const searchQuery = ref('');
const selectedGenre = ref('all');
const sortBy = ref('rating');
const viewMode = ref<'grid' | 'list'>('grid');

// Movie detail modal
const selectedMovieForDetail = ref<Movie | null>(null);

// Billboard Carousel state
const currentSlide = ref(0);
const totalSlides = 4;
let carouselTimer: any = null;

const BILLBOARD_SLIDES = [
  {
    title: 'Dune: Parte Dos',
    badge: 'ESTRENO EN CINES ARGENTINA',
    tech: 'IMAX 70MM & 4DX',
    rating: '★ 9.4 CRÍTICA',
    desc: 'La esperada epopeya de Denis Villeneuve colma las salas argentinas con una experiencia audiovisual inmersiva y escala monumental en Arrakis.',
    rooms: 'Hoy en Hoyts, Cinemark, Showcase & Gaumont',
    bg: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1400&auto=format&fit=crop',
    movieId: 'dune-2'
  },
  {
    title: 'Robot Salvaje (The Wild Robot)',
    badge: 'ESTRENO EN CINES ARGENTINA',
    tech: 'DIGITAL 2D & 3D DOLBY',
    rating: '★ 9.3 OVACIÓN',
    desc: 'La aclamada joya de animación de Chris Sanders conquista al público y a la crítica cinematográfica nacional con una lírica visual asombrosa.',
    rooms: 'Funciones subtituladas y en castellano',
    bg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop',
    movieId: 'robot-salvaje'
  },
  {
    title: 'El Jockey',
    badge: 'CINE ARGENTINO • ESTRENO',
    tech: 'ESPACIO INCAA & 35MM',
    rating: '★ 8.9 VENECIA',
    desc: 'La provocadora película de Luis Ortega con Nahuel Pérez Biscayart y Úrsula Corberó. Hipnótico neo-noir y absurdo en el hipódromo de San Isidro.',
    rooms: 'Cine Gaumont, Atlas & Salas de Arte',
    bg: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1400&auto=format&fit=crop',
    movieId: 'el-jockey'
  },
  {
    title: 'Gladiador II',
    badge: 'ESTRENO EN CINES ARGENTINA',
    tech: 'IMAX & ATMOS SURROUND',
    rating: '★ 8.8 TAQUILLA',
    desc: 'Ridley Scott regresa al Coliseo con Paul Mescal, Pedro Pascal y Denzel Washington en una contundente superproducción de honor y poder imperial.',
    rooms: 'Disponible en todos los complejos del país',
    bg: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1400&auto=format&fit=crop',
    movieId: 'gladiador-2'
  }
];

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % totalSlides;
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + totalSlides) % totalSlides;
}

function setSlide(idx: number) {
  currentSlide.value = idx;
}

function startCarousel() {
  stopCarousel();
  carouselTimer = setInterval(nextSlide, 4500);
}

function stopCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
}

// Genre count dictionary
const genreCounts = computed(() => {
  const counts: Record<string, number> = {
    all: props.movies.length,
    'Clásicas': 0,
    'Estreno': 0,
    'Animación': 0,
    'Sci-Fi': 0,
    'Noir': 0,
    'Drama': 0,
    'Acción': 0
  };

  props.movies.forEach((m) => {
    if (m.genre === 'Clásicas' || m.subgenres?.includes('Clásicas')) counts['Clásicas']++;
    if (m.genre === 'Animación' || m.subgenres?.includes('Animación')) counts['Animación']++;
    if (m.genre === 'Sci-Fi' || m.subgenres?.includes('Sci-Fi')) counts['Sci-Fi']++;
    if (m.genre === 'Noir' || m.subgenres?.includes('Noir')) counts['Noir']++;
    if (m.genre === 'Drama' || m.subgenres?.includes('Drama')) counts['Drama']++;
    if (m.genre === 'Acción' || m.subgenres?.includes('Acción')) counts['Acción']++;
    if (m.subgenres?.includes('Estreno') || m.year >= 2024) counts['Estreno']++;
  });

  return counts;
});

// Filtered and Sorted Movies
const filteredMovies = computed(() => {
  let list = [...props.movies];

  // 1. Text Search Filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.originalTitle && m.originalTitle.toLowerCase().includes(q)) ||
        m.director.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q) ||
        m.year.toString().includes(q) ||
        (m.subgenres && m.subgenres.some((s) => s.toLowerCase().includes(q)))
    );
  }

  // 2. Genre Filter
  if (selectedGenre.value !== 'all') {
    const g = selectedGenre.value;
    list = list.filter((m) => {
      if (g === 'Estreno') return m.subgenres?.includes('Estreno') || m.year >= 2024;
      return m.genre.toLowerCase() === g.toLowerCase() || (m.subgenres && m.subgenres.some((s) => s.toLowerCase() === g.toLowerCase()));
    });
  }

  // 3. Sorting
  if (sortBy.value === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sortBy.value === 'year') {
    list.sort((a, b) => b.year - a.year);
  } else if (sortBy.value === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy.value === 'favorites') {
    list.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
  }

  return list;
});

function openDetail(movie: Movie) {
  selectedMovieForDetail.value = movie;
}

function closeDetail() {
  selectedMovieForDetail.value = null;
}

function openSlideMovie(slideMovieId: string) {
  const found = props.movies.find((m) => m.id === slideMovieId);
  if (found) {
    selectedMovieForDetail.value = found;
  }
}

onMounted(() => {
  startCarousel();
});

onUnmounted(() => {
  stopCarousel();
});
</script>

<template>
  <div class="flex flex-col gap-8 w-full">
    <!-- Featured Billboard Carousel: Estrenos en Cartelera Argentina -->
    <section
      aria-label="Estrenos en Cartelera Argentina"
      class="relative w-full rounded-2xl bg-[#191b22] border border-[#33343b]/60 overflow-hidden shadow-2xl"
      @mouseenter="stopCarousel"
      @mouseleave="startCarousel"
    >
      <!-- Ambient Backlight Blobs -->
      <div class="absolute -right-16 -top-20 w-96 h-96 rounded-full bg-[#ff4f73]/15 blur-[110px] pointer-events-none"></div>
      <div class="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-[#00f1fd]/10 blur-[100px] pointer-events-none"></div>

      <!-- Top Sub-Header Bar -->
      <div class="relative z-20 flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-3.5 border-b border-[#33343b]/40 bg-[#0c0e14]/70 backdrop-blur-md">
        <div class="flex items-center gap-2.5">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff4f73]/20 border border-[#ff4f73]/40 text-[#ff4f73] font-mono-code text-[11px] uppercase tracking-wider font-bold">
            <span class="w-2 h-2 rounded-full bg-[#ff4f73] animate-ping"></span>
            EN CARTELERA HOY
          </span>
          <span class="text-[#e2e2eb] font-display text-sm sm:text-base font-bold flex items-center gap-2">
            CINES DE ARGENTINA
            <span class="text-[#00f1fd] text-xs font-mono-code font-normal hidden sm:inline">• CIRCUITO NACIONAL</span>
          </span>
        </div>

        <div class="flex items-center gap-3">
          <span class="font-mono-code text-[11px] text-[#8b94a8] uppercase hidden md:inline">
            JUEVES DE ESTRENO
          </span>
          <div class="flex items-center gap-1">
            <button
              type="button"
              @click="prevSlide"
              aria-label="Película anterior"
              class="w-8 h-8 rounded-lg bg-[#1e1f26] hover:bg-[#282a30] text-[#e2e2eb] flex items-center justify-center transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              @click="nextSlide"
              aria-label="Siguiente película"
              class="w-8 h-8 rounded-lg bg-[#1e1f26] hover:bg-[#282a30] text-[#e2e2eb] flex items-center justify-center transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Slides Container -->
      <div class="relative min-h-[340px] sm:min-h-[310px] lg:h-[330px] w-full overflow-hidden text-left">
        <div
          v-for="(slide, idx) in BILLBOARD_SLIDES"
          :key="slide.title"
          class="absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col justify-end p-5 sm:p-8"
          :class="currentSlide === idx ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'"
        >
          <!-- Background Banner Image -->
          <img
            :src="slide.bg"
            :alt="slide.title"
            class="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.7]"
            referrerpolicy="no-referrer"
          />
          <!-- Dual Scrims for text legibility -->
          <div class="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-[#0c0e14]/80 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-[#0c0e14]/95 via-[#0c0e14]/60 to-transparent"></div>

          <!-- Slide Content -->
          <div class="relative z-10 max-w-3xl flex flex-col gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-[#ff4f73] text-[#5a001b] font-mono-code text-[11px] uppercase font-bold tracking-wider">
                {{ slide.badge }}
              </span>
              <span class="px-2 py-0.5 rounded bg-[#33343b]/90 text-[#00f1fd] font-mono-code text-[11px] font-bold">
                {{ slide.tech }}
              </span>
              <span class="px-2 py-0.5 rounded bg-[#33343b]/90 text-[#ffd166] font-mono-code text-[11px] font-bold">
                {{ slide.rating }}
              </span>
            </div>

            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-display text-[#e2e2eb] font-bold tracking-tight">
              {{ slide.title }}
            </h2>

            <p class="text-xs sm:text-sm text-[#8b94a8] line-clamp-2 max-w-2xl leading-relaxed">
              {{ slide.desc }}
            </p>

            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                @click="openSlideMovie(slide.movieId)"
                class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff4f73] to-[#ffb2ba] text-[#5a001b] font-display text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg hover:brightness-110 transition-all cursor-pointer"
              >
                <span class="material-symbols-outlined text-[17px]">visibility</span>
                <span>Ver Ficha Técnica</span>
              </button>

              <span class="text-xs font-mono-code text-[#00f1fd] bg-[#00f1fd]/10 px-2.5 py-1.5 rounded-lg">
                {{ slide.rooms }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide Bottom Indicators -->
      <div class="relative z-20 px-5 sm:px-8 py-2.5 bg-[#0c0e14]/80 border-t border-[#33343b]/40 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-1.5" id="carouselIndicators">
          <button
            v-for="(slide, idx) in BILLBOARD_SLIDES"
            :key="idx"
            type="button"
            @click="setSlide(idx)"
            class="px-3 py-1 rounded-full font-mono-code text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
            :class="currentSlide === idx ? 'bg-[#ff4f73] text-[#5a001b] font-bold shadow-md' : 'bg-[#1e1f26] text-[#8b94a8] hover:text-[#e2e2eb]'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="currentSlide === idx ? 'bg-[#5a001b]' : 'bg-[#8b94a8]'"></span>
            <span>{{ slide.title.split(' ')[0] }}</span>
          </button>
        </div>

        <div class="flex items-center gap-2 font-mono-code text-[11px] text-[#00f1fd]">
          <span class="w-2 h-2 rounded-full bg-[#00f1fd] animate-pulse"></span>
          <span>ROTACIÓN EN VIVO • 4s</span>
        </div>
      </div>
    </section>

    <!-- Public API Error / Status Banner (if any) -->
    <div
      v-if="apiError"
      class="p-4 rounded-xl bg-[#93000a]/20 border border-[#ff4f73]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left animate-fadeIn"
    >
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-[#ffb4ab] text-[24px]">cloud_off</span>
        <div>
          <h4 class="text-sm font-bold text-[#ffb4ab]">Aviso de la API pública externa</h4>
          <p class="text-xs text-[#e2e2eb]/80">{{ apiError }}</p>
        </div>
      </div>
      <button
        type="button"
        @click="emit('fetch-api', 'cinema')"
        class="px-3.5 py-1.5 rounded-lg bg-[#ff4f73] text-[#5a001b] text-xs font-bold font-mono-code hover:brightness-110 transition-all cursor-pointer shrink-0"
      >
        Reintentar Fetch
      </button>
    </div>

    <!-- Reusable Buscador Component -->
    <Buscador
      :search-query="searchQuery"
      :selected-genre="selectedGenre"
      :sort-by="sortBy"
      :view-mode="viewMode"
      :total-results="filteredMovies.length"
      :genre-counts="genreCounts"
      :is-api-loading="isApiLoading"
      @update:search-query="(val) => searchQuery = val"
      @update:selected-genre="(val) => selectedGenre = val"
      @update:sort-by="(val) => sortBy = val"
      @update:view-mode="(val) => viewMode = val"
      @fetch-api="(q) => emit('fetch-api', q)"
    />

    <!-- Movies List / Grid with Vue TransitionGroup -->
    <div v-if="filteredMovies.length > 0" class="w-full">
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
        <CardItem
          v-for="movie in filteredMovies"
          :key="movie.id"
          :movie="movie"
          :view-mode="viewMode"
          @toggle-favorite="emit('toggle-favorite', $event)"
          @toggle-status="emit('toggle-status', $event)"
          @view-detail="openDetail"
        />
      </TransitionGroup>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="p-12 rounded-2xl bg-[#191b22] border border-[#33343b]/60 flex flex-col items-center justify-center text-center gap-4 my-6"
    >
      <div class="w-16 h-16 rounded-2xl bg-[#ff4f73]/15 flex items-center justify-center text-[#ff4f73] shadow-lg">
        <span class="material-symbols-outlined text-[36px]">search_off</span>
      </div>
      <div class="max-w-md">
        <h3 class="font-display font-bold text-lg text-[#e2e2eb]">No se encontraron títulos</h3>
        <p class="text-xs text-[#8b94a8] mt-1 leading-relaxed">
          No hay obras que coincidan con "{{ searchQuery }}" en el género seleccionado. Puedes buscar en la API pública abierta o sugerir una nueva obra.
        </p>
      </div>
      <div class="flex items-center gap-3 pt-2">
        <button
          type="button"
          @click="searchQuery = ''; selectedGenre = 'all'"
          class="px-4 py-2 rounded-xl bg-[#1e1f26] hover:bg-[#282a30] text-xs font-semibold text-[#e2e2eb] transition-all cursor-pointer"
        >
          Limpiar filtros
        </button>
        <button
          type="button"
          @click="emit('fetch-api', searchQuery || 'cinema')"
          class="px-4 py-2 rounded-xl bg-[#00f1fd]/20 hover:bg-[#00f1fd]/30 text-[#00f1fd] border border-[#00f1fd]/40 text-xs font-bold font-mono-code transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span class="material-symbols-outlined text-[16px]">cloud_download</span>
          <span>Buscar en API Abierta</span>
        </button>
      </div>
    </div>

    <!-- Movie Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="selectedMovieForDetail"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          @click.self="closeDetail"
        >
          <div class="relative w-full max-w-2xl bg-[#191b22] rounded-2xl border border-[#ff4f73]/30 shadow-2xl overflow-hidden my-auto text-left">
            <!-- Modal Header Banner -->
            <div class="relative h-48 sm:h-64 w-full bg-[#0c0e14] overflow-hidden">
              <img
                :src="selectedMovieForDetail.bannerUrl || selectedMovieForDetail.posterUrl"
                :alt="selectedMovieForDetail.title"
                class="w-full h-full object-cover filter brightness-[0.7]"
                referrerpolicy="no-referrer"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#191b22] via-[#191b22]/50 to-transparent"></div>
              
              <!-- Close Button -->
              <button
                type="button"
                @click="closeDetail"
                aria-label="Cerrar modal"
                class="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0c0e14]/80 text-[#e2e2eb] hover:bg-[#ff4f73] hover:text-[#5a001b] transition-all flex items-center justify-center cursor-pointer shadow-lg"
              >
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>

              <!-- Floating Rating -->
              <div class="absolute bottom-4 left-5 flex items-center gap-2">
                <span class="px-3 py-1 rounded-full bg-[#0c0e14]/90 backdrop-blur-md text-[#ffd166] border border-[#ffd166]/30 font-mono-code text-xs font-bold flex items-center gap-1 shadow-md">
                  <span class="material-symbols-outlined text-[15px]" style="font-variation-settings: 'FILL' 1;">star</span>
                  {{ selectedMovieForDetail.rating.toFixed(1) }} / 10
                </span>
                <span
                  class="px-2.5 py-1 rounded-full font-mono-code text-xs font-bold uppercase tracking-wider"
                  :class="selectedMovieForDetail.status === 'vistas' ? 'bg-[#00f1fd] text-[#00373a]' : 'bg-[#ff4f73] text-[#5a001b]'"
                >
                  {{ selectedMovieForDetail.status === 'vistas' ? 'VISTA ★★★★★' : 'POR VER' }}
                </span>
              </div>
            </div>

            <!-- Modal Content Body -->
            <div class="p-6 flex flex-col gap-5">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-2xl font-bold font-display text-[#e2e2eb]">
                    {{ selectedMovieForDetail.title }}
                  </h3>
                  <span
                    v-if="selectedMovieForDetail.originalTitle && selectedMovieForDetail.originalTitle !== selectedMovieForDetail.title"
                    class="text-xs text-[#8b94a8] italic font-mono-code"
                  >
                    ({{ selectedMovieForDetail.originalTitle }})
                  </span>
                </div>

                <div class="flex items-center gap-2 text-xs text-[#8b94a8] mt-1.5 font-mono-code flex-wrap">
                  <span>{{ selectedMovieForDetail.year }}</span>
                  <span>•</span>
                  <span>{{ selectedMovieForDetail.runtime }}</span>
                  <span>•</span>
                  <span class="text-[#00f1fd] font-semibold">{{ selectedMovieForDetail.director }}</span>
                  <span>•</span>
                  <span class="text-[#ff4f73] font-bold">{{ selectedMovieForDetail.genre }}</span>
                </div>
              </div>

              <!-- Synopsis -->
              <div class="flex flex-col gap-1.5">
                <span class="font-mono-code text-xs uppercase text-[#00f1fd] font-bold">
                  SINOPSIS &amp; CRITERIO ARTÍSTICO
                </span>
                <p class="text-sm text-[#e2e2eb]/90 leading-relaxed">
                  {{ selectedMovieForDetail.synopsis }}
                </p>
              </div>

              <!-- Subgenres -->
              <div v-if="selectedMovieForDetail.subgenres && selectedMovieForDetail.subgenres.length > 0" class="flex items-center gap-2 flex-wrap">
                <span
                  v-for="sub in selectedMovieForDetail.subgenres"
                  :key="sub"
                  class="px-2.5 py-1 rounded-full bg-[#1e1f26] border border-[#33343b] text-xs font-mono-code text-[#8b94a8]"
                >
                  #{{ sub }}
                </span>
              </div>

              <!-- User Notes if any -->
              <div v-if="selectedMovieForDetail.userNotes" class="p-3.5 rounded-xl bg-[#1e1f26] border border-[#33343b] flex items-start gap-2.5">
                <span class="material-symbols-outlined text-[#ffd166] text-[20px] shrink-0 mt-0.5">format_quote</span>
                <div class="text-xs">
                  <span class="text-[#ffd166] font-bold block mb-0.5">Nota de Curaduría Personal</span>
                  <p class="text-[#e2e2eb]/90 leading-relaxed">{{ selectedMovieForDetail.userNotes }}</p>
                </div>
              </div>

              <!-- Modal Footer Controls -->
              <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#33343b]">
                <a
                  v-if="selectedMovieForDetail.referenceUrl"
                  :href="selectedMovieForDetail.referenceUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs font-mono-code text-[#00f1fd] hover:underline flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[15px]">open_in_new</span>
                  <span>Ver Ficha Externa</span>
                </a>
                <span v-else class="text-xs font-mono-code text-[#8b94a8]">ID: {{ selectedMovieForDetail.id }}</span>

                <div class="flex items-center gap-2.5">
                  <button
                    type="button"
                    @click="emit('toggle-favorite', selectedMovieForDetail); selectedMovieForDetail.isFavorite = !selectedMovieForDetail.isFavorite"
                    class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    :class="selectedMovieForDetail.isFavorite ? 'bg-[#ff4f73] text-[#5a001b]' : 'bg-[#1e1f26] text-[#e2e2eb] hover:bg-[#282a30]'"
                  >
                    <span class="material-symbols-outlined text-[16px]">
                      {{ selectedMovieForDetail.isFavorite ? 'favorite' : 'favorite_border' }}
                    </span>
                    <span>{{ selectedMovieForDetail.isFavorite ? 'En Favoritas' : 'Favorita' }}</span>
                  </button>

                  <button
                    type="button"
                    @click="emit('toggle-status', selectedMovieForDetail); selectedMovieForDetail.status = selectedMovieForDetail.status === 'vistas' ? 'porver' : 'vistas'"
                    class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    :class="selectedMovieForDetail.status === 'vistas' ? 'bg-[#00f1fd] text-[#00373a]' : 'bg-[#1e1f26] text-[#e2e2eb] hover:bg-[#282a30]'"
                  >
                    <span class="material-symbols-outlined text-[16px]">
                      {{ selectedMovieForDetail.status === 'vistas' ? 'done_all' : 'bookmark' }}
                    </span>
                    <span>{{ selectedMovieForDetail.status === 'vistas' ? 'Marcar Por Ver' : 'Marcar Vista' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
