<template>
  <v-app>
    <v-app-bar flat border>
      <v-app-bar-title>
        <NuxtLink to="/" class="text-decoration-none text-high-emphasis font-weight-bold">
          WTools
        </NuxtLink>
      </v-app-bar-title>

      <template #append>
        <v-btn
          icon
          variant="text"
          @click="toggleTheme"
        >
          <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>

        <v-menu>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              prepend-icon="mdi-translate"
            >
              {{ locale }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="l in availableLocales"
              :key="l.code"
              :to="switchLocalePath(l.code)"
              :value="l.code"
            >
              <v-list-item-title>{{ l.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'

const theme = useTheme()
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = [
  { code: 'en-US', name: 'English' },
  { code: 'zh-TW', name: '繁體中文' }
]

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>

<style scoped lang="scss">
</style>
