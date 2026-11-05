<script setup lang="ts">
import { ref, computed } from 'vue';
import type { CommunityReview, CommunityMember, Movie, UserProfile } from '../types';
import FormularioItem from '../components/FormularioItem.vue';
import {
  getCurrentUserProfile,
  isUserFollowing,
  toggleFollowUser,
  getFollowingUsers,
  getRepliesForComment,
  addReplyToComment
} from '../services/supabaseService';

const props = defineProps<{
  reviews: CommunityReview[];
  members: CommunityMember[];
  movies: Movie[];
  currentUser?: UserProfile;
}>();

const emit = defineEmits<{
  (e: 'add-review', review: Omit<CommunityReview, 'id' | 'likes' | 'commentsCount' | 'timeAgo'>): void;
  (e: 'toggle-like', reviewId: string): void;
  (e: 'follow-changed'): void;
}>();

const activeFilter = ref<'all' | 'following'>('all');
const copiedId = ref(false);
const showAddModal = ref(false);
const searchQuery = ref('');

// Replies state: which reviews have replies expanded and input texts
const expandedReplies = ref<Record<string, boolean>>({});
const replyInputs = ref<Record<string, string>>({});
const localReplies = ref<Record<string, any[]>>({});

// New Review Form State
const selectedMovieTitle = ref(props.movies[0]?.title || 'Dune: Parte Dos');
const newReviewText = ref('');
const newReviewRating = ref(9.0);
const formErrors = ref<Record<string, string>>({});

const currentUserProfile = computed(() => props.currentUser || getCurrentUserProfile());
const followingIds = computed(() => getFollowingUsers(currentUserProfile.value.id));

const filteredReviews = computed(() => {
  let list = [...props.reviews];

  // Feed Filter: All vs Siguiendo
  if (activeFilter.value === 'following') {
    list = list.filter((r) => {
      // Show if it's the current user or someone they follow
      const authorId = r.userId || (r.userHandle === '@mateo_critique' ? 'user-mateo' : r.userHandle === '@cami_35mm' ? 'user-camila' : 'user-lucas');
      return followingIds.value.includes(authorId) || authorId === currentUserProfile.value.id;
    });
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (r) =>
        r.movieTitle.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.userHandle.toLowerCase().includes(q) ||
        r.reviewText.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return list;
});

function copyCineId() {
  navigator.clipboard.writeText('#CINE-8942');
  copiedId.value = true;
  setTimeout(() => {
    copiedId.value = false;
  }, 2500);
}

async function handleToggleFollow(memberId: string) {
  await toggleFollowUser(memberId);
  emit('follow-changed');
}

function checkIsFollowing(memberId: string): boolean {
  return isUserFollowing(memberId);
}

function toggleRepliesView(reviewId: string) {
  expandedReplies.value[reviewId] = !expandedReplies.value[reviewId];
  if (!localReplies.value[reviewId]) {
    localReplies.value[reviewId] = getRepliesForComment(reviewId);
  }
}

function getRepliesCount(review: CommunityReview): number {
  const dynamic = localReplies.value[review.id] || getRepliesForComment(review.id);
  return dynamic.length > 0 ? dynamic.length : review.commentsCount;
}

function handleAddReply(reviewId: string) {
  const text = (replyInputs.value[reviewId] || '').trim();
  if (!text) return;

  const newReply = addReplyToComment(reviewId, text);
  if (!localReplies.value[reviewId]) {
    localReplies.value[reviewId] = getRepliesForComment(reviewId);
  } else {
    localReplies.value[reviewId].push(newReply);
  }

  replyInputs.value[reviewId] = '';
  expandedReplies.value[reviewId] = true;
}

function validateAndSubmit() {
  formErrors.value = {};

  if (!selectedMovieTitle.value) {
    formErrors.value.movie = 'Debes seleccionar una película.';
  }
  if (!newReviewText.value.trim() || newReviewText.value.trim().length < 15) {
    formErrors.value.text = 'La reseña debe contener al menos 15 caracteres.';
  }

  if (Object.keys(formErrors.value).length > 0) return;

  const foundMovie = props.movies.find((m) => m.title === selectedMovieTitle.value);
  const user = currentUserProfile.value;

  emit('add-review', {
    userId: user.id,
    movieId: foundMovie?.id,
    userName: user.displayName,
    userHandle: user.handle,
    userAvatar: user.avatarUrl,
    userRole: user.role,
    movieTitle: selectedMovieTitle.value,
    moviePoster: foundMovie?.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop',
    rating: Number(newReviewRating.value),
    reviewText: newReviewText.value.trim(),
    tags: [foundMovie?.genre || 'Cine', 'Supabase Feed', 'CineTrack 35mm']
  });

  newReviewText.value = '';
  showAddModal.value = false;
}
</script>

<template>
  <div class="flex flex-col gap-8 w-full text-left">
    <!-- Top Discovery & Personal Cine-ID Banner -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
      <!-- Search & Segment Filters -->
      <div class="xl:col-span-8 flex flex-col justify-between gap-4 p-5 rounded-2xl bg-[#191b22] border border-[#33343b]/50 shadow-md">
        <div class="flex flex-col md:flex-row items-center gap-3 w-full">
          <div class="relative flex-1 w-full">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b94a8] text-[20px] pointer-events-none">
              person_search
            </span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Buscar por @usuario, película, temática o crítica..."
              class="w-full bg-[#0c0e14] pl-11 pr-4 py-2.5 rounded-xl text-sm text-[#e2e2eb] placeholder:text-[#8b94a8]/60 focus:outline-none focus:ring-1 focus:ring-[#00f1fd] transition-all"
            />
          </div>
          <button
            type="button"
            @click="showAddModal = true"
            class="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff4f73] to-[#ffb2ba] text-[#5a001b] font-display text-sm font-bold flex items-center gap-2 shadow-[0_4px_16px_rgba(255,79,115,0.35)] hover:brightness-110 transition-transform cursor-pointer"
          >
            <span class="material-symbols-outlined text-[18px]">rate_review</span>
            <span>Comentar Película</span>
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Feed Filter Tabs: Todos vs Siguiendo -->
            <div class="flex items-center p-1 bg-[#0c0e14] rounded-xl border border-[#33343b]/50">
              <button
                type="button"
                @click="activeFilter = 'all'"
                class="px-3 py-1.5 rounded-lg font-mono-code text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                :class="activeFilter === 'all' ? 'bg-[#ff4f73] text-[#5a001b] shadow-sm' : 'text-[#8b94a8] hover:text-[#e2e2eb]'"
              >
                <span class="material-symbols-outlined text-[15px]">public</span>
                <span>Todos los Cinéfilos</span>
              </button>
              <button
                type="button"
                @click="activeFilter = 'following'"
                class="px-3 py-1.5 rounded-lg font-mono-code text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                :class="activeFilter === 'following' ? 'bg-[#00f1fd] text-[#00373a] shadow-sm' : 'text-[#8b94a8] hover:text-[#e2e2eb]'"
              >
                <span class="material-symbols-outlined text-[15px]">group</span>
                <span>Siguiendo ({{ followingIds.length }})</span>
              </button>
            </div>

            <span class="px-3 py-1 rounded-full bg-[#1e1f26] text-[#ffd166] font-mono-code text-xs flex items-center gap-1.5 border border-[#ffd166]/20">
              <span class="material-symbols-outlined text-[15px]">database</span>
              <span>Supabase Social RLS</span>
            </span>
          </div>

          <span class="text-xs text-[#8b94a8] font-mono-code hidden sm:inline-block">
            Sesión: <strong class="text-[#e2e2eb]">{{ currentUserProfile.displayName }}</strong>
          </span>
        </div>
      </div>

      <!-- User Cinephile Pass -->
      <div class="xl:col-span-4 p-5 rounded-2xl bg-[#1e1f26] border border-[#ff4f73]/25 flex items-center justify-between gap-4 shadow-lg relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#ff4f73]/10 blur-2xl pointer-events-none"></div>
        <div class="flex items-center gap-3.5 min-w-0 z-10">
          <div class="w-12 h-12 rounded-xl bg-[#0c0e14] border border-[#ff4f73]/30 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[#ff4f73] text-[28px]">qr_code_2</span>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-mono-code text-[10px] text-[#8b94a8] uppercase tracking-wider">Tu Carnet 35mm</span>
            <span class="font-display text-lg text-[#ff4f73] font-bold tracking-tight">{{ currentUserProfile.handle }}</span>
            <span class="text-xs text-[#8b94a8] truncate">Sigues a {{ followingIds.length }} cinéfilos</span>
          </div>
        </div>
        <button
          type="button"
          @click="copyCineId"
          class="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#282a30] hover:bg-[#33343b] text-[#e2e2eb] font-mono-code text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer z-10 border border-[#33343b]"
        >
          <span class="material-symbols-outlined text-[15px] text-[#00f1fd]">{{ copiedId ? 'check' : 'content_copy' }}</span>
          <span>{{ copiedId ? '¡Copiado!' : 'Compartir' }}</span>
        </button>
      </div>
    </div>

    <!-- Live Stream Rail: Cinéfilos de la Comunidad con Botón Seguir -->
    <section class="flex flex-col gap-3.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[#ff4f73] animate-pulse shadow-[0_0_8px_#ff4f73]"></span>
          <h2 class="font-display text-xl font-bold text-[#e2e2eb]">Cinéfilos en Comunidad</h2>
          <span class="px-2 py-0.5 rounded-full bg-[#1e1f26] border border-[#00f1fd]/30 font-mono-code text-[11px] text-[#00f1fd] font-bold">
            {{ members.length }} Activos
          </span>
        </div>
        <span class="font-mono-code text-xs text-[#8b94a8] hidden sm:inline-block">
          SISTEMA USER_FOLLOWS SUPABASE
        </span>
      </div>

      <!-- Members Rail Grid with Follow / Unfollow -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
        <div
          v-for="member in members"
          :key="member.id"
          class="bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-3.5 flex flex-col items-center justify-between text-center relative group hover:border-[#ff4f73]/50 transition-all shadow-md"
        >
          <!-- Status dot -->
          <div
            class="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
            :class="member.status === 'online' ? 'bg-[#00f1fd] shadow-[0_0_6px_#00f1fd]' : 'bg-[#ff4f73] shadow-[0_0_6px_#ff4f73]'"
          ></div>

          <!-- Avatar -->
          <div class="relative mt-1">
            <div class="w-13 h-13 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-[#ff4f73] to-[#00f1fd]">
              <img
                :src="member.avatarUrl"
                :alt="member.name"
                class="w-full h-full object-cover rounded-full"
                referrerpolicy="no-referrer"
              />
            </div>
            <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0c0e14] text-[#ffd166] flex items-center justify-center text-[11px]">
              ★
            </span>
          </div>

          <div class="flex flex-col items-center w-full my-2">
            <span class="font-display text-sm text-[#e2e2eb] font-semibold truncate w-full">{{ member.name }}</span>
            <span class="text-xs text-[#8b94a8] truncate w-full">{{ member.currentMovie }}</span>
          </div>

          <!-- Follow / Unfollow Button -->
          <button
            type="button"
            @click="handleToggleFollow(member.id)"
            class="w-full py-1 px-2 rounded-lg font-mono-code text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
            :class="[
              checkIsFollowing(member.id)
                ? 'bg-[#1e1f26] text-[#00f1fd] border border-[#00f1fd]/40 hover:bg-[#ff4f73]/15 hover:text-[#ff4f73]'
                : 'bg-[#ff4f73] text-[#5a001b] hover:brightness-110 shadow-sm'
            ]"
          >
            <span class="material-symbols-outlined text-[14px]">
              {{ checkIsFollowing(member.id) ? 'done' : 'person_add' }}
            </span>
            <span>{{ checkIsFollowing(member.id) ? 'Siguiendo' : 'Seguir' }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Community Discussions & Critical Reviews Feed -->
    <section class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h2 class="font-display text-xl font-bold text-[#e2e2eb] flex items-center gap-2">
            <span>{{ activeFilter === 'following' ? 'Feed de tus Seguidos' : 'Hilos Críticos & Reseñas' }}</span>
          </h2>
          <span class="font-mono-code text-xs text-[#00f1fd] bg-[#00f1fd]/10 px-2 py-0.5 rounded-full font-normal">
            {{ filteredReviews.length }} publicaciones
          </span>
        </div>

        <span v-if="activeFilter === 'following'" class="text-xs text-[#8b94a8] font-mono-code">
          Mostrando solo comentarios de usuarios a quienes sigues
        </span>
      </div>

      <!-- Empty State for Following Feed -->
      <div
        v-if="filteredReviews.length === 0 && activeFilter === 'following'"
        class="bg-[#191b22] border border-[#33343b]/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3"
      >
        <div class="w-12 h-12 rounded-xl bg-[#00f1fd]/10 text-[#00f1fd] flex items-center justify-center">
          <span class="material-symbols-outlined text-[28px]">group_add</span>
        </div>
        <h3 class="font-display font-bold text-base text-[#e2e2eb]">Aún no ves publicaciones de tus seguidos</h3>
        <p class="text-xs text-[#8b94a8] max-w-md">
          Sigue a los cinéfilos de la comunidad en la barra superior o cambia a la pestaña "Todos los Cinéfilos" para descubrir nuevas críticas.
        </p>
        <button
          type="button"
          @click="activeFilter = 'all'"
          class="mt-2 px-4 py-2 rounded-xl bg-[#1e1f26] hover:bg-[#282a30] text-xs font-semibold text-[#00f1fd] cursor-pointer"
        >
          Ver todas las publicaciones
        </button>
      </div>

      <!-- Reviews Feed List -->
      <div v-else class="flex flex-col gap-4">
        <article
          v-for="review in filteredReviews"
          :key="review.id"
          class="p-5 sm:p-6 rounded-2xl bg-[#191b22] border border-[#33343b]/60 hover:border-[#ff4f73]/40 shadow-lg transition-all flex flex-col gap-4"
        >
          <!-- Review Author & Header -->
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-full overflow-hidden bg-[#282a30] shrink-0 border border-[#ff4f73]/30">
                <img :src="review.userAvatar" :alt="review.userName" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-display font-bold text-sm text-[#e2e2eb]">{{ review.userName }}</span>
                  <span class="px-2 py-0.2 rounded-full bg-[#ff4f73]/15 text-[#ff4f73] font-mono-code text-[10px] font-bold">
                    {{ review.userRole }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-xs text-[#8b94a8] font-mono-code mt-0.5">
                  <span>{{ review.userHandle }}</span>
                  <span>•</span>
                  <span>{{ review.timeAgo }}</span>
                </div>
              </div>
            </div>

            <!-- Movie Tag & Rating -->
            <div class="flex items-center gap-2.5 bg-[#0c0e14] px-3 py-1.5 rounded-xl border border-[#33343b]/40">
              <span class="font-display font-bold text-xs text-[#e2e2eb]">{{ review.movieTitle }}</span>
              <span class="px-2 py-0.5 rounded bg-[#ffd166]/15 text-[#ffd166] font-mono-code text-xs font-bold flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[13px]" style="font-variation-settings: 'FILL' 1;">star</span>
                {{ review.rating.toFixed(1) }}
              </span>
            </div>
          </div>

          <!-- Review Prose -->
          <p class="text-sm text-[#e2e2eb]/90 leading-relaxed pl-1">
            {{ review.reviewText }}
          </p>

          <!-- Tags -->
          <div class="flex items-center gap-2 flex-wrap pl-1">
            <span
              v-for="tag in review.tags"
              :key="tag"
              class="px-2 py-0.5 rounded bg-[#1e1f26] text-[#8b94a8] text-[11px] font-mono-code"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Interaction Footer: Like, Comment, Share -->
          <div class="flex items-center justify-between pt-3 border-t border-[#33343b]/50 text-xs text-[#8b94a8]">
            <div class="flex items-center gap-4">
              <!-- Me Gusta Button -->
              <button
                type="button"
                @click="emit('toggle-like', review.id)"
                class="flex items-center gap-1.5 transition-colors cursor-pointer"
                :class="review.hasLiked ? 'text-[#ff4f73] font-bold' : 'hover:text-[#ff4f73]'"
                title="Dejar me gusta a esta crítica"
              >
                <span
                  class="material-symbols-outlined text-[18px]"
                  :style="review.hasLiked ? 'font-variation-settings: \'FILL\' 1;' : ''"
                >
                  favorite
                </span>
                <span>{{ review.likes }}</span>
              </button>

              <!-- Comentarios / Respuestas Button -->
              <button
                type="button"
                @click="toggleRepliesView(review.id)"
                class="flex items-center gap-1.5 hover:text-[#00f1fd] transition-colors cursor-pointer"
                :class="expandedReplies[review.id] ? 'text-[#00f1fd] font-bold' : ''"
                title="Ver o agregar comentarios en esta película"
              >
                <span class="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                <span>{{ getRepliesCount(review) }} respuestas</span>
              </button>
            </div>

            <button
              type="button"
              class="hover:text-[#00f1fd] transition-colors flex items-center gap-1 cursor-pointer"
              @click="navigator.clipboard?.writeText(review.reviewText)"
            >
              <span class="material-symbols-outlined text-[15px]">share</span>
              <span>Compartir</span>
            </button>
          </div>

          <!-- Nested Replies Thread (Para que los seguidos debatan y comenten) -->
          <div
            v-if="expandedReplies[review.id]"
            class="mt-2 pt-3 border-t border-[#33343b]/30 flex flex-col gap-3 bg-[#14151b] p-4 rounded-xl"
          >
            <span class="font-display font-semibold text-xs text-[#e2e2eb] flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[15px] text-[#00f1fd]">forum</span>
              <span>Respuestas del Hilo ({{ (localReplies[review.id] || getRepliesForComment(review.id)).length }})</span>
            </span>

            <!-- Existing Replies -->
            <div
              v-for="reply in (localReplies[review.id] || getRepliesForComment(review.id))"
              :key="reply.id"
              class="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#191b22] border border-[#33343b]/40"
            >
              <img :src="reply.userAvatar" :alt="reply.userName" class="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-display font-bold text-xs text-[#e2e2eb]">{{ reply.userName }}</span>
                  <span class="font-mono-code text-[10px] text-[#8b94a8]">{{ reply.timeAgo }}</span>
                </div>
                <p class="text-xs text-[#e2e2eb]/90 mt-0.5">{{ reply.content }}</p>
              </div>
            </div>

            <!-- Add Reply Input Box -->
            <div class="flex items-center gap-2 mt-1">
              <img :src="currentUserProfile.avatarUrl" :alt="currentUserProfile.displayName" class="w-7 h-7 rounded-full object-cover shrink-0" />
              <input
                type="text"
                v-model="replyInputs[review.id]"
                @keyup.enter="handleAddReply(review.id)"
                placeholder="Escribe una respuesta para debatir con tus seguidos..."
                class="flex-1 bg-[#0c0e14] px-3 py-1.5 rounded-lg text-xs text-[#e2e2eb] placeholder:text-[#8b94a8]/50 border border-[#33343b]/50 focus:outline-none focus:border-[#00f1fd]"
              />
              <button
                type="button"
                @click="handleAddReply(review.id)"
                class="px-3 py-1.5 rounded-lg bg-[#00f1fd] text-[#00373a] font-display text-xs font-bold hover:brightness-110 cursor-pointer shrink-0"
              >
                Responder
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Create Review Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          @click.self="showAddModal = false"
        >
          <div class="w-full max-w-lg bg-[#191b22] border border-[#ff4f73]/30 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-left">
            <div class="flex items-center justify-between pb-3 border-b border-[#33343b]">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#ff4f73] text-[22px]">rate_review</span>
                <h3 class="font-display font-bold text-lg text-[#e2e2eb]">Publicar Comentario en Película</h3>
              </div>
              <button
                type="button"
                @click="showAddModal = false"
                class="w-7 h-7 rounded-full bg-[#1e1f26] hover:bg-[#ff4f73] hover:text-[#5a001b] text-[#8b94a8] flex items-center justify-center cursor-pointer"
              >
                <span class="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <!-- Current User Badge -->
            <div class="flex items-center gap-2.5 p-2 rounded-xl bg-[#0c0e14] border border-[#33343b]/40">
              <img :src="currentUserProfile.avatarUrl" :alt="currentUserProfile.displayName" class="w-8 h-8 rounded-full object-cover" />
              <div class="flex flex-col">
                <span class="font-display font-bold text-xs text-[#e2e2eb]">{{ currentUserProfile.displayName }} ({{ currentUserProfile.handle }})</span>
                <span class="text-[10px] text-[#8b94a8]">Publicarás visible para tus seguidos y la comunidad</span>
              </div>
            </div>

            <!-- Form Item: Movie select -->
            <FormularioItem
              id="review-movie-select"
              label="Película a comentar"
              type="select"
              v-model="selectedMovieTitle"
              :required="true"
              :options="movies.map(m => ({ value: m.title, label: `${m.title} (${m.year}) - ${m.director}` }))"
              :error-message="formErrors.movie"
            />

            <!-- Form Item: Rating slider -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label class="font-display text-sm font-semibold text-[#e2e2eb]">Calificación</label>
                <span class="font-mono-code text-sm font-bold text-[#ffd166] flex items-center gap-1">
                  ★ {{ newReviewRating }} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                v-model="newReviewRating"
                class="w-full accent-[#ff4f73] h-2 bg-[#0c0e14] rounded-lg cursor-pointer"
              />
            </div>

            <!-- Form Item: Textarea -->
            <FormularioItem
              id="review-text-content"
              label="Tu comentario o crítica"
              type="textarea"
              v-model="newReviewText"
              placeholder="Escribe tu análisis: fotografía, ritmo, actuaciones o reflexiones para que tus seguidos debatan..."
              :required="true"
              :rows="4"
              :error-message="formErrors.text"
              helper-text="Mínimo 15 caracteres para garantizar valor crítico."
            />

            <!-- Submit buttons -->
            <div class="flex items-center justify-end gap-3 pt-2 border-t border-[#33343b]">
              <button
                type="button"
                @click="showAddModal = false"
                class="px-4 py-2 rounded-xl bg-[#1e1f26] text-xs font-semibold text-[#e2e2eb] hover:bg-[#282a30] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                @click="validateAndSubmit"
                class="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff4f73] to-[#ffb2ba] text-[#5a001b] font-display text-xs font-bold hover:brightness-110 shadow-md cursor-pointer"
              >
                Publicar para Seguidos
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
