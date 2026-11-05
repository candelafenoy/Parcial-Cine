<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Movie } from '../types';
import FormularioItem from '../components/FormularioItem.vue';
import ModalConfirmacion from '../components/ModalConfirmacion.vue';

const emit = defineEmits<{
  (e: 'submit-movie', movie: Omit<Movie, 'id' | 'createdAt'>): void;
  (e: 'navigate', view: string): void;
}>();

// Form Fields
const title = ref('');
const director = ref('');
const selectedGenre = ref('Sci-Fi');
const year = ref<number>(2024);
const runtime = ref('120 min');
const rating = ref(8.5);
const synopsis = ref('');
const referenceUrl = ref('');

// Validation Errors
const errors = ref<Record<string, string>>({});
const touched = ref<Record<string, boolean>>({});

// Confirmation modal and toast
const showConfirmModal = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

const GENRE_CHIPS = [
  'Sci-Fi', 'Drama', 'Acción', 'Crimen', 'Animación', 'Suspenso', 'Terror', 'Comedia', 'Noir', 'Clásicas'
];

const critiqueLabel = computed(() => {
  const r = rating.value;
  if (r >= 9) return `${r.toFixed(1)}/10 — Imprescindible. Obra maestra para la cinemateca.`;
  if (r >= 8) return `${r.toFixed(1)}/10 — Recomendación destacada para la comunidad cinéfila.`;
  if (r >= 7) return `${r.toFixed(1)}/10 — Notable ejercicio de estilo y dirección.`;
  if (r >= 5) return `${r.toFixed(1)}/10 — Interesante propuesta formal o histórica.`;
  return `${r.toFixed(1)}/10 — Regular / Valoración baja.`;
});

function markTouched(field: string) {
  touched.value[field] = true;
  validateField(field);
}

function validateField(field: string): boolean {
  let valid = true;

  if (field === 'title') {
    if (!title.value.trim()) {
      errors.value.title = 'El título de la película es obligatorio.';
      valid = false;
    } else {
      delete errors.value.title;
    }
  }

  if (field === 'director') {
    if (!director.value.trim()) {
      errors.value.director = 'El nombre del director/a es obligatorio.';
      valid = false;
    } else {
      delete errors.value.director;
    }
  }

  if (field === 'year') {
    const y = Number(year.value);
    if (!y || isNaN(y) || y < 1895 || y > 2030) {
      errors.value.year = 'El año de estreno debe ser entre 1895 y 2030.';
      valid = false;
    } else {
      delete errors.value.year;
    }
  }

  if (field === 'runtime') {
    if (!runtime.value.trim()) {
      errors.value.runtime = 'Indica la duración aproximada (ej. 120 min).';
      valid = false;
    } else {
      delete errors.value.runtime;
    }
  }

  if (field === 'synopsis') {
    if (!synopsis.value.trim() || synopsis.value.trim().length < 20) {
      errors.value.synopsis = 'La sinopsis y justificación debe tener al menos 20 caracteres.';
      valid = false;
    } else {
      delete errors.value.synopsis;
    }
  }

  if (field === 'referenceUrl') {
    if (referenceUrl.value.trim()) {
      try {
        new URL(referenceUrl.value.trim());
        delete errors.value.referenceUrl;
      } catch {
        errors.value.referenceUrl = 'Ingresa una URL válida (ej. https://www.imdb.com/title/...).';
        valid = false;
      }
    } else {
      delete errors.value.referenceUrl;
    }
  }

  return valid;
}

function validateAll(): boolean {
  markTouched('title');
  markTouched('director');
  markTouched('year');
  markTouched('runtime');
  markTouched('synopsis');
  markTouched('referenceUrl');

  return Object.keys(errors.value).length === 0;
}

function handleSubmit() {
  if (!validateAll()) {
    // Scroll to form error
    return;
  }
  showConfirmModal.value = true;
}

function confirmSubmission() {
  showConfirmModal.value = false;

  emit('submit-movie', {
    title: title.value.trim(),
    originalTitle: title.value.trim(),
    director: director.value.trim(),
    year: Number(year.value),
    runtime: runtime.value.trim(),
    genre: selectedGenre.value,
    subgenres: [selectedGenre.value, 'Propuesta Comunitaria'],
    rating: Number(rating.value),
    synopsis: synopsis.value.trim(),
    posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop',
    isFavorite: true,
    status: 'porver',
    userNotes: 'Sugerida por mí para evaluación editorial en CineTrack.',
    referenceUrl: referenceUrl.value.trim() || undefined,
    isSuggested: true,
    curatorName: 'Sofía Martínez'
  });

  toastMessage.value = `¡"${title.value}" fue enviada y añadida exitosamente a tu catálogo y colección!`;
  showToast.value = true;

  // Reset form
  title.value = '';
  director.value = '';
  synopsis.value = '';
  referenceUrl.value = '';
  errors.value = {};
  touched.value = {};

  setTimeout(() => {
    showToast.value = false;
  }, 4500);
}
</script>

<template>
  <div class="flex flex-col gap-8 w-full text-left">
    <!-- Breadcrumb & Banner Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="emit('navigate', 'catalogo')"
          class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#191b22] hover:bg-[#1e1f26] text-[#8b94a8] hover:text-[#e2e2eb] transition-all cursor-pointer border border-[#33343b]/40 text-xs font-semibold"
        >
          <span class="material-symbols-outlined text-[16px] text-[#ff4f73]">arrow_back</span>
          <span>Volver al catálogo</span>
        </button>
        <span class="text-[#33343b]">•</span>
        <span class="font-mono-code text-[11px] text-[#00f1fd] uppercase tracking-widest font-semibold">
          EXPEDIENTE 35MM • CINETRACK ARCHIVE
        </span>
      </div>

      <div class="flex items-center gap-2 self-start md:self-auto">
        <div class="px-3.5 py-1.5 rounded-full bg-[#1e1f26] border border-[#00f1fd]/30 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#00f1fd] animate-pulse"></span>
          <span class="font-mono-code text-xs text-[#00f1fd] font-bold">REVISIÓN EDITORIAL ABIERTA</span>
        </div>
      </div>
    </div>

    <!-- Success Toast Alert -->
    <div
      v-if="showToast"
      class="p-4 rounded-xl bg-gradient-to-r from-[#00f1fd]/20 to-[#6ff6ff]/10 border border-[#00f1fd]/50 flex items-center justify-between gap-3 shadow-xl animate-fadeIn"
    >
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-[#00f1fd] text-[#00373a] flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[20px]">task_alt</span>
        </div>
        <div>
          <h4 class="text-sm font-bold text-[#e2e2eb]">Sugerencia Registrada</h4>
          <p class="text-xs text-[#00f1fd]">{{ toastMessage }}</p>
        </div>
      </div>
      <button
        type="button"
        @click="emit('navigate', 'catalogo')"
        class="px-3 py-1.5 rounded-lg bg-[#00f1fd] text-[#00373a] text-xs font-bold font-mono-code hover:brightness-110 transition-all cursor-pointer"
      >
        Ver en Catálogo
      </button>
    </div>

    <!-- Main Content Layout: Two-Column Bento Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Editorial Guidelines & Inspiration -->
      <div class="lg:col-span-4 flex flex-col gap-6">
        <!-- Welcome Alert Card -->
        <div class="bg-[#191b22] border border-[#33343b]/60 p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff4f73] via-[#00f1fd] to-transparent"></div>
          <div class="flex items-start gap-3.5">
            <div class="w-12 h-12 rounded-xl bg-[#ff4f73]/20 flex items-center justify-center shrink-0 text-[#ff4f73] shadow-md border border-[#ff4f73]/30">
              <span class="material-symbols-outlined text-[26px]">rate_review</span>
            </div>
            <div class="flex flex-col gap-1 flex-1">
              <h3 class="font-display text-lg font-bold text-[#e2e2eb] leading-snug">¿Falta una obra esencial?</h3>
              <p class="text-xs text-[#8b94a8] leading-relaxed">
                Completa esta ficha técnica con tus impresiones para que nuestro equipo editorial evalúe su inclusión en el catálogo oficial de CineTrack.
              </p>
            </div>
          </div>
          <div class="mt-4 pt-3 flex items-center gap-2 bg-[#1e1f26] p-2.5 rounded-xl border border-[#33343b]/40">
            <span class="material-symbols-outlined text-[#ff4f73] text-[18px]">schedule</span>
            <span class="font-mono-code text-xs text-[#e2e2eb]">
              Revisión promedio: <strong class="text-[#ff4f73]">48 a 72 hs hábiles</strong>
            </span>
          </div>
        </div>

        <!-- Cinema Key Art / Arthouse Inspiration Visual -->
        <div class="bg-[#191b22] border border-[#33343b]/60 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div class="relative w-full h-52 rounded-xl overflow-hidden group bg-[#0c0e14]">
            <img
              src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop"
              alt="Sala de cine de autor"
              class="w-full h-full object-cover brightness-[0.75] group-hover:scale-105 transition-transform duration-700"
              referrerpolicy="no-referrer"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-[#0c0e14]/40 to-transparent"></div>
            <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div>
                <span class="font-mono-code text-[10px] uppercase px-2 py-0.5 rounded bg-[#ff4f73] text-[#5a001b] font-bold">
                  PRESERVACIÓN 35MM
                </span>
                <p class="font-display font-bold text-sm text-[#e2e2eb] mt-1">Criterio de Curaduría</p>
                <p class="text-xs text-[#8b94a8]">Relevancia formal, autoría y valor histórico.</p>
              </div>
              <div class="w-8 h-8 rounded-full bg-[#0c0e14]/80 flex items-center justify-center text-[#00f1fd]">
                <span class="material-symbols-outlined text-[18px]">camera_roll</span>
              </div>
            </div>
          </div>

          <!-- Editorial Criteria Checklist -->
          <div class="mt-4 flex flex-col gap-2 text-xs text-[#8b94a8]">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#ffd166] text-[17px]">verified</span>
              <span>Priorizamos filmes independientes, cine nacional y clásicos.</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#00f1fd] text-[17px]">check_circle</span>
              <span>Revisión técnica de aspecto, año y director contra el archivo.</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#ff4f73] text-[17px]">stars</span>
              <span>Tu crédito de curador aparecerá en la cabecera de la ficha.</span>
            </div>
          </div>
        </div>

        <!-- Telemetry Stats Panel -->
        <div class="bg-[#191b22] border border-[#33343b]/60 p-5 rounded-2xl shadow-lg flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="font-mono-code text-[11px] text-[#8b94a8] uppercase font-bold">BALANCE DEL CONSEJO</span>
            <span class="font-mono-code text-[11px] text-[#00f1fd]">TEMPORADA 2025</span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-[#1e1f26] p-3 rounded-xl flex flex-col">
              <span class="font-mono-code text-[10px] text-[#8b94a8] uppercase">Aceptadas este mes</span>
              <span class="font-display text-2xl font-bold text-[#ff4f73] mt-0.5">142</span>
              <span class="font-mono-code text-[10px] text-[#00f1fd] mt-0.5">+18% vs mes previo</span>
            </div>
            <div class="bg-[#1e1f26] p-3 rounded-xl flex flex-col">
              <span class="font-mono-code text-[10px] text-[#8b94a8] uppercase">Tasa de Admisión</span>
              <span class="font-display text-2xl font-bold text-[#ffd166] mt-0.5">64.8%</span>
              <span class="font-mono-code text-[10px] text-[#8b94a8] mt-0.5">Rigor cinéfilo</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Curatorial Submission Form -->
      <div class="lg:col-span-8 flex flex-col gap-6">
        <form
          @submit.prevent="handleSubmit"
          class="bg-[#191b22]/95 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-[#33343b]/60 shadow-2xl flex flex-col gap-6"
        >
          <!-- Section 1: Identification -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between pb-2 border-b border-[#33343b]/40">
              <span class="font-mono-code text-xs text-[#ff4f73] uppercase font-bold flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-[#ff4f73]"></span>
                01. IDENTIFICACIÓN DE LA OBRA
              </span>
              <span class="font-mono-code text-xs text-[#8b94a8]">* Campos requeridos</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- Movie Title -->
              <FormularioItem
                id="film-title-input"
                label="Título de la Película"
                v-model="title"
                :required="true"
                placeholder="Ej: Blade Runner 2049, Se7en, Drive..."
                icon="movie"
                :error-message="touched.title ? errors.title : undefined"
                helper-text="Escribe el título original o en español oficial."
                @blur="markTouched('title')"
              />

              <!-- Director -->
              <FormularioItem
                id="film-director-input"
                label="Director / Creador"
                v-model="director"
                :required="true"
                placeholder="Ej: Denis Villeneuve, David Fincher..."
                icon="person_pin"
                :error-message="touched.director ? errors.director : undefined"
                helper-text="Si son múltiples directores, sepáralos con coma."
                @blur="markTouched('director')"
              />
            </div>
          </div>

          <!-- Section 2: Genre Selection (Chips) -->
          <div class="flex flex-col gap-3 bg-[#1e1f26] p-4 sm:p-5 rounded-2xl border border-[#33343b]/40">
            <div class="flex items-center justify-between">
              <label class="font-display text-sm font-semibold text-[#e2e2eb] flex items-center gap-1.5">
                <span>Género Primario</span>
                <span class="text-[#ff4f73] font-bold">*</span>
              </label>
              <span class="font-mono-code text-[11px] text-[#ff4f73] bg-[#ff4f73]/15 px-2.5 py-0.5 rounded-full font-bold">
                {{ selectedGenre }}
              </span>
            </div>
            <p class="text-xs text-[#8b94a8]">
              Selecciona el género que mejor define la obra para indexarla en los filtros del catálogo:
            </p>
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                v-for="chip in GENRE_CHIPS"
                :key="chip"
                type="button"
                @click="selectedGenre = chip"
                class="px-3.5 py-1.5 rounded-full font-display text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                :class="[
                  selectedGenre === chip
                    ? 'bg-[#ff4f73] text-[#5a001b] font-bold shadow-[0_0_12px_rgba(255,79,115,0.4)]'
                    : 'bg-[#282a30] text-[#8b94a8] hover:text-[#e2e2eb] hover:bg-[#33343b]'
                ]"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="selectedGenre === chip ? 'bg-[#5a001b]' : 'bg-[#8b94a8]'"></span>
                <span>{{ chip }}</span>
              </button>
            </div>
          </div>

          <!-- Section 3: Year & Runtime -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormularioItem
              id="film-year-input"
              label="Año de Estreno"
              type="number"
              v-model="year"
              :required="true"
              :min="1895"
              :max="2030"
              placeholder="2024"
              icon="calendar_today"
              :error-message="touched.year ? errors.year : undefined"
              helper-text="Rango histórico admitido: 1895 - 2030."
              @blur="markTouched('year')"
            />

            <FormularioItem
              id="film-runtime-input"
              label="Duración Estimada"
              type="text"
              v-model="runtime"
              :required="true"
              placeholder="Ej: 148 min o 2h 28m"
              icon="timer"
              :error-message="touched.runtime ? errors.runtime : undefined"
              helper-text="Indica minutos o formato horas."
              @blur="markTouched('runtime')"
            />
          </div>

          <!-- Section 4: Rating Star & Slider -->
          <div class="bg-[#1e1f26] p-4 sm:p-5 rounded-2xl border border-[#33343b]/40 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#ff4f73] text-[22px]">stars</span>
                <span class="font-display font-bold text-sm text-[#e2e2eb]">Tu Valoración Inicial</span>
              </div>
              <div class="flex items-center gap-1 bg-[#0c0e14] px-3 py-1 rounded-full border border-[#ffd166]/20">
                <span class="font-display text-base font-bold text-[#ffd166]">{{ Number(rating).toFixed(1) }}</span>
                <span class="font-mono-code text-xs text-[#8b94a8]">/ 10</span>
              </div>
            </div>

            <p class="text-xs text-[#ff4f73] font-semibold italic">
              {{ critiqueLabel }}
            </p>

            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              v-model="rating"
              class="w-full accent-[#ff4f73] h-2 bg-[#0c0e14] rounded-lg cursor-pointer"
            />
            <div class="flex items-center justify-between font-mono-code text-[11px] text-[#8b94a8]">
              <span>1.0 (Baja)</span>
              <span>5.0 (Interesante)</span>
              <span class="text-[#ffd166]">10.0 (Imprescindible)</span>
            </div>
          </div>

          <!-- Section 5: Synopsis -->
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <label for="film-synopsis" class="font-display text-sm font-semibold text-[#e2e2eb] flex items-center gap-1.5">
                <span>Sinopsis &amp; ¿Por qué debería estar en CineTrack?</span>
                <span class="text-[#ff4f73] font-bold">*</span>
              </label>
              <span class="font-mono-code text-[11px] text-[#00f1fd] bg-[#00f1fd]/10 px-2 py-0.5 rounded-full">
                {{ synopsis.length }} / 1200
              </span>
            </div>
            <FormularioItem
              id="film-synopsis"
              label=""
              type="textarea"
              v-model="synopsis"
              :rows="5"
              :maxlength="1200"
              placeholder="Describe brevemente la trama y comparte tus motivos curatoriales: relevancia artística, fotografía, impacto cultural..."
              :required="true"
              :error-message="touched.synopsis ? errors.synopsis : undefined"
              helper-text="Tu reseña ayuda al comité a evaluar e indexar la película en el catálogo."
              @blur="markTouched('synopsis')"
            />
          </div>

          <!-- Section 6: Reference URL -->
          <FormularioItem
            id="film-ref-url"
            label="Enlace de Referencia / IMDb / Letterboxd (Opcional)"
            type="url"
            v-model="referenceUrl"
            placeholder="https://www.imdb.com/title/..."
            icon="language"
            :error-message="touched.referenceUrl ? errors.referenceUrl : undefined"
            helper-text="Adjunta la ficha oficial externa para validación de datos técnicos."
            @blur="markTouched('referenceUrl')"
          />

          <!-- Submit Button -->
          <div class="flex flex-col gap-3 pt-2 border-t border-[#33343b]/60">
            <button
              type="submit"
              class="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#ff4f73] to-[#ffb2ba] text-[#5a001b] font-display text-base font-bold shadow-[0_4px_24px_rgba(255,79,115,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[22px]">send</span>
              <span>Enviar Sugerencia al Equipo Editorial</span>
            </button>
            <p class="font-mono-code text-[11px] text-center text-[#8b94a8]">
              Al enviar, tu propuesta pasará a la cola de curaduría y se guardará en tu LocalStorage personal.
            </p>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirmation Modal via ModalConfirmacion -->
    <ModalConfirmacion
      :show="showConfirmModal"
      title="Confirmar Envío de Propuesta"
      :message="`¿Deseas enviar '${title}' (${year}) dirigida por ${director} con una valoración de ${rating}/10? Será almacenada localmente y postulada al archivo.`"
      confirm-text="Confirmar y Guardar"
      cancel-text="Revisar formulario"
      type="primary"
      icon="send"
      @confirm="confirmSubmission"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>
