<template>
    <div class="main-frame">
        <el-tabs v-on:tab-change="onTabChange" v-model="activeTab">
            <el-tab-pane label="状态转移表" name="1" />
            <el-tab-pane label="状态图" name="2" />
        </el-tabs>
        <div class="real-container">
            <FATableComponent
                v-if="tableVisible && table != null"
                :value="table"
            />
            <FAGraphComponent
                v-if="graphVisible && graph != null"
                :value="graph"
                :ref-prefix="refPrefix"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { FAGraph } from '@/show/FAGraph';
import { FATable } from '@/show/FATable';
import { defineComponent } from 'vue';
import FAGraphComponent from './FAGraphComponent.vue';
import FATableComponent from './FATableComponent.vue';

class Data {
    tableVisible = false;
    graphVisible = false;
    activeTab = '1';
}

export default defineComponent({
    props: {
        table: FATable,
        graph: FAGraph,
        refPrefix: { type: String, required: true },
    },
    data() {
        return new Data();
    },
    methods: {
        onTabChange(name: string) {
            if (name == '1') {
                this.graphVisible = false;
                setTimeout(() => {
                    this.tableVisible = true;
                }, 10);
            } else {
                this.tableVisible = false;
                setTimeout(() => {
                    this.graphVisible = true;
                }, 10);
            }
        },
        init() {
            this.graphVisible = false;
            setTimeout(() => {
                this.tableVisible = true;
            }, 10);
            this.activeTab = '1';
        },
    },
    components: { FATableComponent, FAGraphComponent },
});
</script>

<style lang="scss" scoped>
.main-frame {
    width: 100%;
    height: 100%;
}

.el-tabs {
    --el-tabs-header-height: 36px;
}

.real-container {
    height: calc(100% - 36px - 1rem);
}
</style>
