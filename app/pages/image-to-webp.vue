<script setup lang="ts">
const { t } = useI18n()

useHead({
  title: t('title'),
  meta: [
    { name: 'description', content: t('description') }
  ]
})
</script>

<template>
  <v-container class="py-10">
    <h1 class="text-h3 font-weight-bold text-center mb-2">{{ $t('hero.title') }}</h1>
    <p class="text-body-1 text-center text-medium-emphasis mb-10">
      {{ $t('hero.subtitle') }}
    </p>

    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <ImageUploader />
        <ImagePreview />
        <ConversionResult />
        <AdUnit slot-id="1122334455" />
      </v-col>
    </v-row>
  </v-container>
</template>
