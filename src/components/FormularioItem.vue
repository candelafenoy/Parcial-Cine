<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    modelValue: string | number;
    type?: 'text' | 'number' | 'textarea' | 'select' | 'url';
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    icon?: string;
    helperText?: string;
    errorMessage?: string;
    rows?: number;
    min?: number | string;
    max?: number | string;
    step?: number | string;
    maxlength?: number;
    options?: Array<{ value: string | number; label: string }>;
  }>(),
  {
    type: 'text',
    placeholder: '',
    required: false,
    disabled: false,
    rows: 4
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'focus', event: FocusEvent): void;
}>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  emit('update:modelValue', target.value);
}
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full text-left">
    <!-- Header with label & required badge -->
    <div class="flex items-center justify-between">
      <label :for="id" class="font-display text-sm font-semibold text-[#e2e2eb] flex items-center gap-1.5">
        {{ label }}
        <span v-if="required" class="text-[#ff4f73] font-bold" title="Campo obligatorio">*</span>
      </label>
      <span
        v-if="required"
        class="font-mono-code text-[11px] text-[#00f1fd] bg-[#00f1fd]/10 px-2 py-0.5 rounded-full"
      >
        Obligatorio
      </span>
      <span
        v-else
        class="font-mono-code text-[11px] text-[#8b94a8]"
      >
        Opcional
      </span>
    </div>

    <!-- Input container with icon -->
    <div class="relative flex items-center group">
      <!-- Leading Icon -->
      <span
        v-if="icon"
        class="material-symbols-outlined absolute left-3.5 text-[20px] pointer-events-none transition-colors"
        :class="errorMessage ? 'text-[#ffb4ab]' : 'text-[#8b94a8] group-focus-within:text-[#00f1fd]'"
      >
        {{ icon }}
      </span>

      <!-- Select Field -->
      <select
        v-if="type === 'select'"
        :id="id"
        :value="modelValue"
        :disabled="disabled"
        @change="onInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
        :class="[
          'w-full bg-[#0c0e14] py-3 rounded-xl text-sm text-[#e2e2eb] transition-all cursor-pointer focus:outline-none appearance-none',
          icon ? 'pl-11 pr-10' : 'px-4 pr-10',
          errorMessage
            ? 'border border-[#ff4f73] bg-[#93000a]/10 shadow-[0_0_12px_rgba(255,79,115,0.3)]'
            : 'border border-[#33343b] focus:border-[#00f1fd] focus:bg-[#191b22] focus:shadow-[0_0_16px_rgba(0,242,254,0.25)]'
        ]"
      >
        <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          class="bg-[#191b22] text-[#e2e2eb]"
        >
          {{ opt.label }}
        </option>
      </select>

      <!-- Textarea Field -->
      <textarea
        v-else-if="type === 'textarea'"
        :id="id"
        :value="modelValue"
        :rows="rows"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        @input="onInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
        :class="[
          'w-full bg-[#0c0e14] py-3 rounded-xl text-sm text-[#e2e2eb] placeholder:text-[#8b94a8]/60 transition-all focus:outline-none resize-y',
          icon ? 'pl-11 pr-4' : 'px-4',
          errorMessage
            ? 'border border-[#ff4f73] bg-[#93000a]/10 shadow-[0_0_12px_rgba(255,79,115,0.3)]'
            : 'border border-[#33343b] focus:border-[#00f1fd] focus:bg-[#191b22] focus:shadow-[0_0_16px_rgba(0,242,254,0.25)]'
        ]"
      ></textarea>

      <!-- Standard Input Field (text, number, url, etc.) -->
      <input
        v-else
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :min="min"
        :max="max"
        :step="step"
        :maxlength="maxlength"
        @input="onInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
        :class="[
          'w-full bg-[#0c0e14] py-3 rounded-xl text-sm text-[#e2e2eb] placeholder:text-[#8b94a8]/60 transition-all focus:outline-none',
          icon ? 'pl-11 pr-4' : 'px-4',
          errorMessage
            ? 'border border-[#ff4f73] bg-[#93000a]/10 shadow-[0_0_12px_rgba(255,79,115,0.3)]'
            : 'border border-[#33343b] focus:border-[#00f1fd] focus:bg-[#191b22] focus:shadow-[0_0_16px_rgba(0,242,254,0.25)]'
        ]"
      />

      <!-- Custom Chevron for select -->
      <span
        v-if="type === 'select'"
        class="material-symbols-outlined absolute right-3.5 text-[20px] text-[#8b94a8] pointer-events-none"
      >
        expand_more
      </span>
    </div>

    <!-- Error message display -->
    <div
      v-if="errorMessage"
      class="flex items-center gap-1.5 text-xs text-[#ffb4ab] font-medium pt-0.5 animate-fadeIn"
    >
      <span class="material-symbols-outlined text-[15px] shrink-0 text-[#ff4f73]">error</span>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Helper text if no error -->
    <div
      v-else-if="helperText"
      class="flex items-center gap-1.5 text-xs text-[#8b94a8] pt-0.5"
    >
      <span class="material-symbols-outlined text-[14px] text-[#00f1fd]/80 shrink-0">info</span>
      <span>{{ helperText }}</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>
