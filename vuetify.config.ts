import { defineVuetifyConfiguration } from 'vuetify-nuxt-module/custom-configuration';

export default defineVuetifyConfiguration({
    // your Vuetify options here
    theme: { defaultTheme: 'dark' },
    defaults: {
        VTextField: { variant: 'outlined' },
        VTextarea: { variant: 'outlined' },
        VSelect: { variant: 'outlined' },
        VAutocomplete: { variant: 'outlined' },
        VCombobox: { variant: 'outlined' },
    }
});
