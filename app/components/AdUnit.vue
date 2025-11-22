<template>
    <div class="ad-container my-4 text-center">
        <ins
            class="adsbygoogle"
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true"
            style="display:block"
            :data-ad-slot="props.slotId || '1234567890'"
        />
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    slotId?: string;
}>();

onMounted(() => {
    try {
        // eslint-disable-next-line ts/ban-ts-comment
    // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.error('Adsense error:', e);
    }
});
</script>

<style scoped>
.ad-container {
  min-height: 100px;
  background-color: rgba(0, 0, 0, 0.05); /* Placeholder background */
}
</style>
