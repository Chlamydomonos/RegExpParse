<template>
    <div class="main-frame" :style="mainStyle">
        <el-table style="width: 100%; height: 100%" :data="tableData" border>
            <el-table-column label="">
                <template #default="scope">
                    <el-icon color="#FF4040" v-if="scope.row.isInitial">
                        <Right />
                    </el-icon>
                    <el-icon color="#FF4040" v-if="scope.row.isFinal">
                        <CircleCheck />
                    </el-icon>
                </template>
            </el-table-column>
            <el-table-column label="状态">
                <template #default="scope">
                    <span>{{ scope.row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column
                v-for="i in value.charSet.length"
                :key="i"
                :label="charTest(value.charSet[i - 1])"
            >
                <template #default="scope">
                    <span>{{ scope.row.paths[i - 1] }}</span>
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
        value: { type: FATable, required: true },
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
            return this.value.items;
        },
    },
    methods: {
        charTest(char: string) {
            return char == '' ? 'ε' : char;
        },
    },
});
</script>

<style lang="scss" scoped></style>
