<template>
    <div class="big-frame">
        <FATableComponent
            :value="{
                charSet: ['a'],
                items: [
                    {
                        isInitial: true,
                        isFinal: true,
                        name: 'test',
                        paths: [],
                    },
                ],
            }"
        ></FATableComponent>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FATableComponent from './components/FATableComponent.vue';

export default defineComponent({ components: { FATableComponent } });
</script>

<style lang="scss">
.big-frame {
    width: 100vw;
    height: 100vh;
}
</style>
