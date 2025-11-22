<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()

useHead({
  title: t('home')
})

definePageMeta({ name: 'index' })

const tools = [
  {
    id: 'image-to-webp',
    icon: 'mdi-image-multiple',
    titleKey: 'tools.imageToWebP.title',
    descKey: 'tools.imageToWebP.description',
    route: 'image-to-webp'
  }
]
</script>

<template>
  <v-container class="py-10">
    <div class="text-center mb-10">
      <h1 class="text-h3 font-weight-bold mb-2">{{ $t('dashboard.title') }}</h1>
      <p class="text-body-1 text-medium-emphasis">{{ $t('dashboard.subtitle') }}</p>
    </div>

    <v-row>
      <v-col
        v-for="tool in tools"
        :key="tool.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          :to="localePath(tool.route)"
          hover
          border
          class="h-100 d-flex flex-column"
        >
          <v-card-item>
            <template #prepend>
              <v-avatar color="primary" variant="tonal" rounded>
                <v-icon :icon="tool.icon"></v-icon>
              </v-avatar>
            </template>
            <v-card-title>{{ $t(tool.titleKey) }}</v-card-title>
          </v-card-item>

          <v-card-text class="text-medium-emphasis pt-2">
            {{ $t(tool.descKey) }}
          </v-card-text>

          <v-spacer></v-spacer>

          <v-card-actions>
            <v-btn
              variant="text"
              color="primary"
              block
              append-icon="mdi-arrow-right"
            >
              Open Tool
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <AdUnit slot-id="9876543210" />
  </v-container>
</template>

<style scoped>
</style>
