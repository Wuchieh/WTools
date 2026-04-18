<template>
    <v-app>
        <v-app-bar
            border
            flat
        >
            <v-app-bar-title>
                <NuxtLinkLocale
                    class="font-weight-bold text-decoration-none text-high-emphasis"
                    to="/"
                >
                    WTools
                </NuxtLinkLocale>
            </v-app-bar-title>

            <template #append>
                <v-spacer />

                <FeedbackDialog />

                <v-btn
                    variant="text"
                    icon
                    @click="toggleTheme"
                >
                    <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
                </v-btn>

                <v-menu>
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            icon="mdi-translate"
                            variant="text"
                        />
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

        <v-snackbar
            v-model="copySnackbar"
            timeout="2000"
            :color="copySnackbarColor"
        >
            {{ copySnackbarText }}
        </v-snackbar>
    </v-app>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';

const theme = useTheme();
const { locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const availableLocales = locales;

const copySnackbar = ref(false);
const copySnackbarText = ref('');
const copySnackbarColor = ref('success');

function toggleTheme() {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
}

// Provide copy snackbar globally
provide('showCopySnackbar', (text: string, color = 'success') => {
    copySnackbarText.value = text;
    copySnackbarColor.value = color;
    copySnackbar.value = true;
});
</script>

<style scoped lang="scss">
</style>
