<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = withDefaults(
  defineProps<{
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'primary' | 'info';
    icon?: string;
  }>(),
  {
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'primary',
    icon: 'help_outline'
  }
);

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
  (e: 'close'): void;
}>();

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show) {
    emit('cancel');
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        @click.self="emit('cancel')"
      >
        <div
          class="relative w-full max-w-md p-6 rounded-2xl bg-[#191b22] border border-[#ff4f73]/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col gap-5 text-left"
        >
          <!-- Ambient decorative light glow -->
          <div
            v-if="type === 'danger' || type === 'primary'"
            class="absolute -top-16 -right-16 w-44 h-44 bg-[#ff4f73]/20 rounded-full blur-3xl pointer-events-none"
          ></div>
          <div
            v-else
            class="absolute -top-16 -right-16 w-44 h-44 bg-[#00f1fd]/15 rounded-full blur-3xl pointer-events-none"
          ></div>

          <!-- Header Icon & Title -->
          <div class="flex items-start gap-3.5 z-10">
            <div
              :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg',
                type === 'danger' ? 'bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/30' :
                type === 'warning' ? 'bg-[#b28b26]/30 text-[#ffd166] border border-[#ffd166]/30' :
                'bg-[#ff4f73]/20 text-[#ff4f73] border border-[#ff4f73]/40'
              ]"
            >
              <span class="material-symbols-outlined text-[26px]">
                {{ icon || (type === 'danger' ? 'warning' : 'help_outline') }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <span class="font-mono-code text-[11px] text-[#00f1fd] uppercase tracking-wider font-semibold">
                SISTEMA CINETRACK • CONFIRMACIÓN
              </span>
              <h3 class="text-xl font-bold font-display text-[#e2e2eb] mt-0.5 leading-snug">
                {{ title }}
              </h3>
            </div>
          </div>

          <!-- Message Body -->
          <p class="text-sm text-[#8b94a8] leading-relaxed z-10">
            {{ message }}
          </p>

          <!-- Buttons -->
          <div class="flex items-center justify-end gap-3 pt-2 z-10 border-t border-[#33343b]/60">
            <button
              type="button"
              @click="emit('cancel')"
              class="px-4 py-2.5 rounded-xl bg-[#1e1f26] hover:bg-[#282a30] text-[#e2e2eb] text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              @click="emit('confirm')"
              :class="[
                'px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5',
                type === 'danger'
                  ? 'bg-gradient-to-r from-[#93000a] to-[#ff4f73] text-white shadow-[0_4px_16px_rgba(255,79,115,0.4)]'
                  : 'bg-gradient-to-r from-[#ff4f73] to-[#ffb2ba] text-[#5a001b] shadow-[0_4px_16px_rgba(255,79,115,0.4)] hover:brightness-110'
              ]"
            >
              <span>{{ confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
