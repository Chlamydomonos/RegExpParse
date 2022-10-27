<template>
    <div class="main-frame" :style="mainStyle" :ref="`${refPrefix}-main`"></div>
</template>

<script lang="ts">
import { FAGraph } from '@/show/FAGraph';
import { defineComponent } from 'vue';
import * as echarts from 'echarts';

class Data {
    chart: any = null;
}

export default defineComponent({
    props: {
        width: String,
        height: String,
        value: { type: FAGraph, required: true },
        refPrefix: { type: String, required: true },
    },
    data() {
        return new Data();
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
    },
    methods: {
        nonFinalStop(color: string): any {
            return [
                {
                    offset: 0,
                    color: '#fff',
                },
                {
                    offset: 0.95,
                    color: '#fff',
                },
                {
                    offset: 0.95,
                    color: color,
                },
                {
                    offset: 1,
                    color: color,
                },
            ];
        },
        finalStop(color: string): any {
            return [
                {
                    offset: 0,
                    color: '#fff',
                },
                {
                    offset: 0.8,
                    color: '#fff',
                },
                {
                    offset: 0.8,
                    color: color,
                },
                {
                    offset: 0.85,
                    color: color,
                },
                {
                    offset: 0.85,
                    color: '#fff',
                },
                {
                    offset: 0.95,
                    color: '#fff',
                },
                {
                    offset: 0.95,
                    color: color,
                },
                {
                    offset: 1,
                    color: color,
                },
            ];
        },
        colorStop(category: number): any {
            if (category == 0) {
                return this.nonFinalStop('#000');
            } else if (category == 1) {
                return this.finalStop('#000');
            } else if (category == 2) {
                return this.nonFinalStop('#f00');
            } else {
                return this.finalStop('#f00');
            }
        },
    },
    mounted() {
        console.log(this.value);
        const element = this.$refs[`${this.refPrefix}-main`] as any;
        this.chart = echarts.init(element);
        const chart = this.chart as unknown as echarts.ECharts;
        chart.setOption({
            series: [
                {
                    type: 'graph',
                    layout: 'force',
                    roam: true,
                    nodes: this.value.nodes,
                    links: this.value.links,
                    itemStyle: {
                        color: (params: any) => {
                            return {
                                type: 'radial',
                                x: 0.5,
                                y: 0.5,
                                r: 0.5,
                                colorStops: this.colorStop(
                                    params.data.category
                                ),
                            };
                        },
                    },
                    lineStyle: {
                        color: '#000',
                    },
                    label: {
                        show: true,
                        position: 'inside',
                        align: 'center',
                        color: '#202020',
                    },
                    edgeLabel: {
                        show: true,
                        position: 'middle',
                        color: '#202020',
                        formatter: (params: any) => {
                            return params.data.relation.name;
                        },
                        fontFamily: 'consolas',
                    },
                    edgeSymbol: ['none', 'arrow'],
                    autoCurveness: 0.5,
                },
            ],
        });
    },
});
</script>

<style lang="scss" scoped></style>
