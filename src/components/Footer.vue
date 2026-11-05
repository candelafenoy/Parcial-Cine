<script setup lang="ts">
import type { ViewType } from '../types';

const emit = defineEmits<{
  (e: 'navigate', view: ViewType): void;
  (e: 'reset-storage'): void;
}>();
</script>

<template>
  <footer class="w-full bg-[#0c0e14] border-t border-[#33343b]/60 relative overflow-hidden mt-16 text-left">
    <!-- Top glowing gradient divider line -->
    <div class="w-full h-px bg-gradient-to-r from-transparent via-[#ff4f73]/50 to-[#00f1fd]/50"></div>

    <div class="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-12 py-12 flex flex-col gap-10">
      <!-- 4-Column Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Col 1: Brand & Purpose -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff4f73] to-[#00f1fd] p-0.5 flex items-center justify-center">
              <div class="w-full h-full bg-[#0c0e14] rounded-[6px] flex items-center justify-center">
                <span class="material-symbols-outlined text-[#ff4f73] text-[18px]">movie_filter</span>
              </div>
            </div>
            <span class="font-display font-extrabold text-lg text-[#e2e2eb] tracking-tight">
              CineTrack<span class="text-[#ff4f73]">.</span>
            </span>
          </div>
          <p class="text-xs text-[#8b94a8] leading-relaxed">
            Plataforma digital para cinéfilos obsesionados con el celuloide, la preservación en 35mm, las proyecciones de autor y la crítica rigurosa.
          </p>
          <div class="flex items-center gap-2 pt-1 text-[11px] font-mono-code text-[#00f1fd]">
            <span class="w-2 h-2 rounded-full bg-[#00f1fd] animate-pulse"></span>
            <span>API PÚBLICA CONECTADA • FETCH</span>
          </div>
        </div>

        <!-- Col 2: Navigation Links -->
        <div class="flex flex-col gap-2.5">
          <span class="font-mono-code text-xs text-[#e2e2eb] font-bold uppercase tracking-wider">
            NAVEGACIÓN SPA
          </span>
          <ul class="flex flex-col gap-2 text-xs text-[#8b94a8]">
            <li>
              <button type="button" @click="emit('navigate', 'catalogo')" class="hover:text-[#ff4f73] transition-colors cursor-pointer">
                Catálogo Curado
              </button>
            </li>
            <li>
              <button type="button" @click="emit('navigate', 'mi-coleccion')" class="hover:text-[#ff4f73] transition-colors cursor-pointer">
                Mi Colección &amp; Ranking
              </button>
            </li>
            <li>
              <button type="button" @click="emit('navigate', 'comunidad')" class="hover:text-[#ff4f73] transition-colors cursor-pointer">
                Comunidad en Vivo
              </button>
            </li>
            <li>
              <button type="button" @click="emit('navigate', 'sugerir-pelicula')" class="hover:text-[#ff4f73] transition-colors cursor-pointer">
                Sugerir Nueva Película (Formulario)
              </button>
            </li>
            <li>
              <button type="button" @click="emit('navigate', 'supabase-sql')" class="text-[#3ecf8e] hover:underline transition-colors cursor-pointer flex items-center gap-1">
                <span>Supabase SQL &amp; Persistencia</span>
                <span class="w-1.5 h-1.5 rounded-full bg-[#3ecf8e]"></span>
              </button>
            </li>
            <li>
              <button type="button" @click="emit('navigate', 'perfil')" class="hover:text-[#ff4f73] transition-colors cursor-pointer">
                Perfil de Usuario &amp; Estadísticas
              </button>
            </li>
          </ul>
        </div>

        <!-- Col 3: Curation Guidelines -->
        <div class="flex flex-col gap-2.5">
          <span class="font-mono-code text-xs text-[#e2e2eb] font-bold uppercase tracking-wider">
            CRITERIO DE SALA
          </span>
          <p class="text-xs text-[#8b94a8] leading-relaxed">
            Evaluamos cada propuesta considerando el valor del formato físico (70mm, 35mm), su distribución en salas independientes y el rescate de patrimonio cinematográfico nacional.
          </p>
          <div class="flex items-center gap-2 text-xs text-[#ffd166] mt-1 font-mono-code">
            <span class="material-symbols-outlined text-[15px]">verified</span>
            <span>Comité de Revisión 48-72h</span>
          </div>
        </div>

        <!-- Col 4: Local Storage & Data Maintenance -->
        <div class="flex flex-col gap-2.5">
          <span class="font-mono-code text-xs text-[#e2e2eb] font-bold uppercase tracking-wider">
            PERSISTENCIA LOCAL
          </span>
          <p class="text-xs text-[#8b94a8] leading-relaxed">
            Tu colección, favoritos, notas personales y ranking se almacenan de forma local en tu navegador mediante LocalStorage para disponibilidad offline.
          </p>
          <div class="pt-1">
            <button
              type="button"
              @click="emit('reset-storage')"
              class="px-3 py-1.5 rounded-lg bg-[#191b22] hover:bg-[#282a30] text-[#8b94a8] hover:text-[#ff4f73] border border-[#33343b] text-xs font-mono-code transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[14px]">restart_alt</span>
              <span>Restablecer datos muestra</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#1e1f26] text-xs text-[#8b94a8]">
        <div class="flex items-center gap-2">
          <span>&copy; {{ new Date().getFullYear() }} CineTrack Noir.</span>
          <span class="text-[#33343b]">•</span>
          <span>Desarrollado con Vue 3 &amp; Tailwind CSS</span>
        </div>
        <div class="flex items-center gap-2 font-mono-code text-[11px] text-[#ffd166]">
          <span>CineTrack v2.4.1 • Cinephile Studio Edition</span>
        </div>
      </div>
    </div>
  </footer>
</template>
