<template>
    <v-container class="py-10">
        <h1 class="font-weight-bold text-h3 mb-2 text-center">{{ $t('todo.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-10 text-center">{{ $t('todo.subtitle') }}</p>
        <v-row justify="center">
            <v-col cols="12" lg="8">
                <v-card border>
                    <v-card-text class="pt-4">
                        <v-text-field
                            v-model="newTask"
                            :label="$t('todo.addTask')"
                            append-inner-icon="mdi-plus"
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
                                    <v-checkbox-btn v-model="task.done" density="compact" />
                                </template>
                                <v-list-item-title>{{ task.text }}</v-list-item-title>
                                <template #append>
                                    <v-btn icon="mdi-delete" size="x-small" variant="text" @click="remove(i)" />
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
useHead({ meta: [{ content: t('todo.subtitle'), name: 'description' }], title: t('todo.title') });

const newTask = ref('');
const tasks = ref<{ text: string; done: boolean }[]>([]);
const doneCount = computed(() => tasks.value.filter((t) => t.done).length);

function addTask() {
    if (!newTask.value.trim()) return;
    tasks.value.push({ text: newTask.value.trim(), done: false });
    newTask.value = '';
}

function remove(i: number) {
    tasks.value.splice(i, 1);
}
</script>
