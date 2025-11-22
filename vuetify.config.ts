import { defineVuetifyConfiguration } from 'vuetify-nuxt-module/custom-configuration';

export default defineVuetifyConfiguration({
    defaults: {
        VAutocomplete: { variant: 'outlined' },
        VCombobox: { variant: 'outlined' },
        VSelect: { variant: 'outlined' },
        VTextarea: { variant: 'outlined' },
        VTextField: { variant: 'outlined' },
    },
    // your Vuetify options here
    theme: { defaultTheme: 'dark' },
});
