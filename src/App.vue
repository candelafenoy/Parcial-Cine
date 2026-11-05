<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ViewType, Movie, CommunityReview, CommunityMember, UserProfile } from './types';
import {
  getStoredMovies,
  saveStoredMovies,
  getStoredReviews,
  saveStoredReviews,
  resetToInitialStorage,
  fetchPublicAPIShows
} from './services/movieStorage';
import {
  getCurrentUserProfile,
  getMoviesForUser,
  saveUserMovieRankData,
  getCommunityMembersWithFollow,
  setCurrentUserId
} from './services/supabaseService';

// Core Reusable Components
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';

// Views
import CatalogoView from './views/CatalogoView.vue';
import ColeccionView from './views/ColeccionView.vue';
import ComunidadView from './views/ComunidadView.vue';
import SugerirPeliculaView from './views/SugerirPeliculaView.vue';
import PerfilView from './views/PerfilView.vue';
import SupabaseSqlView from './views/SupabaseSqlView.vue';

// App State
const currentView = ref<ViewType>('catalogo');
const currentUser = ref<UserProfile>(getCurrentUserProfile());
const movies = ref<Movie[]>([]);
const reviews = ref<CommunityReview[]>([]);
const members = ref<CommunityMember[]>([]);

const isApiLoading = ref(false);
const apiError = ref<string | null>(null);

function loadAllData() {
  currentUser.value = getCurrentUserProfile();
  const rawBase = getStoredMovies();
  // Personalize movies with user ranking & status
  movies.value = getMoviesForUser(currentUser.value.id, rawBase);
  reviews.value = getStoredReviews();
  members.value = getCommunityMembersWithFollow(currentUser.value.id);
}

function handleUserSwitched(newUserId: string) {
  setCurrentUserId(newUserId);
  currentUser.value = getCurrentUserProfile();
  const rawBase = getStoredMovies();
  movies.value = getMoviesForUser(newUserId, rawBase);
  members.value = getCommunityMembersWithFollow(newUserId);
}

function handleFollowChanged() {
  members.value = getCommunityMembersWithFollow(currentUser.value.id);
  currentUser.value = getCurrentUserProfile();
}

function handleToggleFavorite(movie: Movie) {
  const idx = movies.value.findIndex((m) => m.id === movie.id);
  if (idx !== -1) {
    const nextFav = !movies.value[idx].isFavorite;
    movies.value[idx].isFavorite = nextFav;
    saveStoredMovies(movies.value);
    saveUserMovieRankData(currentUser.value.id, movie.id, {
      isFavorite: nextFav,
      status: movies.value[idx].status,
      rank: movies.value[idx].rankPosition
    });
  }
}

function handleToggleStatus(movie: Movie) {
  const idx = movies.value.findIndex((m) => m.id === movie.id);
  if (idx !== -1) {
    const nextStatus = movies.value[idx].status === 'vistas' ? 'porver' : 'vistas';
    movies.value[idx].status = nextStatus;
    saveStoredMovies(movies.value);
    saveUserMovieRankData(currentUser.value.id, movie.id, {
      status: nextStatus,
      isFavorite: movies.value[idx].isFavorite,
      rank: movies.value[idx].rankPosition
    });
  }
}

function handleDeleteMovie(movie: Movie) {
  movies.value = movies.value.filter((m) => m.id !== movie.id);
  saveStoredMovies(movies.value);
}

function handleUpdateRank({ movie, direction }: { movie: Movie; direction: 'up' | 'down' }) {
  // Find movies that have ranking
  const ranked = movies.value
    .filter((m) => m.rankPosition !== undefined)
    .sort((a, b) => (a.rankPosition || 0) - (b.rankPosition || 0));

  const currentIndex = ranked.findIndex((m) => m.id === movie.id);
  if (currentIndex === -1) return;

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= ranked.length) return;

  // Swap rank positions
  const currentRank = ranked[currentIndex].rankPosition || currentIndex + 1;
  const targetRank = ranked[targetIndex].rankPosition || targetIndex + 1;

  ranked[currentIndex].rankPosition = targetRank;
  ranked[targetIndex].rankPosition = currentRank;

  saveStoredMovies(movies.value);
  saveUserMovieRankData(currentUser.value.id, ranked[currentIndex].id, {
    rank: targetRank,
    status: ranked[currentIndex].status,
    isFavorite: ranked[currentIndex].isFavorite
  });
  saveUserMovieRankData(currentUser.value.id, ranked[targetIndex].id, {
    rank: currentRank,
    status: ranked[targetIndex].status,
    isFavorite: ranked[targetIndex].isFavorite
  });
}

function handleSuggestedMovie(movieData: Omit<Movie, 'id' | 'createdAt'>) {
  const newMovie: Movie = {
    ...movieData,
    id: `custom-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  movies.value.unshift(newMovie);
  saveStoredMovies(movies.value);
}

async function handleFetchAPI(query: string = 'cinema') {
  isApiLoading.value = true;
  apiError.value = null;

  try {
    const fetched = await fetchPublicAPIShows(query);
    if (fetched.length === 0) {
      apiError.value = `No se encontraron resultados en la API pública para "${query}".`;
      return;
    }

    // Merge without duplicates by title
    const existingTitles = new Set(movies.value.map((m) => m.title.toLowerCase().trim()));
    const newItems = fetched.filter((m) => !existingTitles.has(m.title.toLowerCase().trim()));

    if (newItems.length === 0) {
      apiError.value = `Los títulos obtenidos para "${query}" ya se encuentran indexados en tu catálogo.`;
      return;
    }

    movies.value.unshift(...newItems.slice(0, 6)); // Add top 6 fresh results
    saveStoredMovies(movies.value);
  } catch (err: any) {
    console.error('Error al consumir API pública:', err);
    apiError.value = err.message || 'Error de conexión con la API pública abierta de cine.';
  } finally {
    isApiLoading.value = false;
  }
}

function handleAddReview(newReview: Omit<CommunityReview, 'id' | 'likes' | 'commentsCount' | 'timeAgo'>) {
  const review: CommunityReview = {
    ...newReview,
    id: `rev-${Date.now()}`,
    likes: 1,
    hasLiked: true,
    commentsCount: 0,
    timeAgo: 'Justo ahora'
  };

  reviews.value.unshift(review);
  saveStoredReviews(reviews.value);
}

function handleToggleLike(reviewId: string) {
  const rev = reviews.value.find((r) => r.id === reviewId);
  if (rev) {
    if (rev.hasLiked) {
      rev.likes--;
      rev.hasLiked = false;
    } else {
      rev.likes++;
      rev.hasLiked = true;
    }
    saveStoredReviews(reviews.value);
  }
}

function handleResetStorage() {
  resetToInitialStorage();
  loadAllData();
  currentView.value = 'catalogo';
}

onMounted(() => {
  loadAllData();
});
</script>

<template>
  <div class="min-h-screen bg-[#0c0e14] text-[#e2e2eb] flex flex-col justify-between selection:bg-[#ff4f73] selection:text-[#5a001b]">
    <!-- Navbar Component -->
    <Navbar
      :current-view="currentView"
      :favorites-count="movies.filter(m => m.isFavorite).length"
      :ranking-count="movies.filter(m => m.rankPosition !== undefined).length"
      :current-user="currentUser"
      @navigate="(v) => currentView = v"
      @focus-search="currentView = 'catalogo'"
    />

    <!-- Main Content Area with Vue View Transition -->
    <main class="w-full flex-1 pt-24 pb-12">
      <div class="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-12">
        <Transition name="view" mode="out-in">
          <!-- View 1: Catálogo Curado -->
          <div v-if="currentView === 'catalogo'" key="catalogo">
            <CatalogoView
              :movies="movies"
              :is-api-loading="isApiLoading"
              :api-error="apiError"
              @toggle-favorite="handleToggleFavorite"
              @toggle-status="handleToggleStatus"
              @fetch-api="handleFetchAPI"
              @open-suggest="currentView = 'sugerir-pelicula'"
            />
          </div>

          <!-- View 2: Mi Colección & Ranking Propio -->
          <div v-else-if="currentView === 'mi-coleccion'" key="mi-coleccion">
            <ColeccionView
              :movies="movies"
              :current-user="currentUser"
              @toggle-favorite="handleToggleFavorite"
              @toggle-status="handleToggleStatus"
              @delete-movie="handleDeleteMovie"
              @update-rank="handleUpdateRank"
            />
          </div>

          <!-- View 3: Comunidad Cinéfila & Red Social -->
          <div v-else-if="currentView === 'comunidad'" key="comunidad">
            <ComunidadView
              :reviews="reviews"
              :members="members"
              :movies="movies"
              :current-user="currentUser"
              @add-review="handleAddReview"
              @toggle-like="handleToggleLike"
              @follow-changed="handleFollowChanged"
            />
          </div>

          <!-- View 4: Sugerir Película (Formulario Expediente 35mm) -->
          <div v-else-if="currentView === 'sugerir-pelicula'" key="sugerir-pelicula">
            <SugerirPeliculaView
              @submit-movie="handleSuggestedMovie"
              @navigate="(v: string) => currentView = v as ViewType"
            />
          </div>

          <!-- View 5: Supabase & Persistencia SQL -->
          <div v-else-if="currentView === 'supabase-sql'" key="supabase-sql">
            <SupabaseSqlView
              @user-switched="handleUserSwitched"
              @navigate="(v: string) => currentView = v as ViewType"
            />
          </div>

          <!-- View 6: Perfil de Cinéfilo -->
          <div v-else-if="currentView === 'perfil'" key="perfil">
            <PerfilView
              :movies="movies"
              :current-user="currentUser"
              @navigate="(v: string) => currentView = v as ViewType"
            />
          </div>
        </Transition>
      </div>
    </main>

    <!-- Footer Component -->
    <Footer
      @navigate="(v) => currentView = v"
      @reset-storage="handleResetStorage"
    />
  </div>
</template>
