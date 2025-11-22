<script setup lang="ts">
const props = defineProps<{
  slotId?: string
}>()

onMounted(() => {
  try {
    // @ts-ignore
    (window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch (e) {
    console.error('Adsense error:', e)
  }
})
</script>

<template>
  <div class="ad-container my-4 text-center">
    <ins
      class="adsbygoogle"
      style="display:block"
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      :data-ad-slot="props.slotId || '1234567890'"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  </div>
</template>

<style scoped>
.ad-container {
  min-height: 100px;
  background-color: rgba(0, 0, 0, 0.05); /* Placeholder background */
}
</style>
