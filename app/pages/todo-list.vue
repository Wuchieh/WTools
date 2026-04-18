<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">
            {{ $t('todo.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">
            {{ $t('todo.subtitle') }}
        </p>
        <v-row justify="center">
            <v-col
                cols="12"
                lg="8"
            >
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-text-field
                            v-model="newTask"
                            append-inner-icon="mdi-plus"
                            :label="$t('todo.addTask')"
                            border
                            @click:append-inner="addTask"
                            @keyup.enter="addTask"
                        />
                        <v-list class="mt-2">
                            <v-list-item
                                v-for="(task, i) in tasks"
                                :key="i"
                                :class="{ 'text-decoration-line-through text-medium-emphasis': task.done }"
                            >
                                <template #prepend>
                                    <v-checkbox-btn
                                        v-model="task.done"
                                        density="compact"
                                    />
                                </template>
                                <v-list-item-title>{{ task.text }}</v-list-item-title>
                                <template #append>
                                    <v-btn
                                        icon="mdi-delete"
                                        size="x-small"
                                        variant="text"
                                        @click="remove(i)"
                                    />
                                </template>
                            </v-list-item>
                        </v-list>
                        <div class="text-caption text-medium-emphasis mt-2">
                            {{ doneCount }}/{{ tasks.length }} {{ $t('todo.done') }}
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n();
useSeoMeta({
    description: t('todo.subtitle'),
    ogImage: '/og/todo-list.png',

    title: t('todo.title'),
    twitterCard: 'summary_large_image',
    twitterImage: '/og/todo-list.png',
});

const STORAGE_KEY = 'wtools-todo';
const newTask = ref('');
const tasks = ref<{ done: boolean; text: string }[]>([]);
const doneCount = computed(() => tasks.value.filter((t) => t.done).length);

// Auto-save to localStorage whenever tasks change
watch(tasks, (val) => {
    if (!localStorage) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
}, { deep: true });

function addTask() {
    if (!newTask.value.trim()) return;
    tasks.value.push({
        done: false,
        text: newTask.value.trim(),
    });
    newTask.value = '';
}

function remove(i: number) {
    tasks.value.splice(i, 1);
}

onMounted(() => {
    tasks.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
});
</script>
