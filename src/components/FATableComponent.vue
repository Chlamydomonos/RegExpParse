<template>
    <div class="main-frame" :style="mainStyle">
        <el-table style="width: 100%; height: 100%" :data="tableData">
            <el-table-column label="">
                <template #default="scope">
                    <el-icon v-if="scope.row.isInitial"><Right /></el-icon>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts">
import { FATable } from '@/show/FATable';
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        width: String,
        height: String,
        value: FATable,
    },
    computed: {
        mainStyle() {
            let width = this.width;
            if (width == null) {
                width = '100%';
            }
            let height = this.height;
            if (height == null) {
                height = '100%';
            }
            return {
                width: width,
                height: height,
            };
        },
        tableData() {
            return this.value?.items;
        },
    },
});
</script>

<style lang="scss" scoped></style>
