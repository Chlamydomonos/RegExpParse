<template>
    <div @click="test">Test</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DFAFactory from './DFAFactory';
import DFAMinimizer from './DFAMinimizer';
import NFAFactory from './NFAFactory';
import Parser from './Parser';

export default defineComponent({
    methods: {
        test() {
            const parser = new Parser('(abcdefghijklmnopqrstuvwxyz)?|(<>,./)+');

            console.log(parser.root);

            const nfaFactory = new NFAFactory(parser.root);

            console.log(nfaFactory.nfa);

            const dfaFactory = new DFAFactory(nfaFactory.nfa);

            console.log(dfaFactory.dfa);

            const dfaMinimizer = new DFAMinimizer(dfaFactory.dfa);

            console.log(dfaMinimizer.minDFA);
        },
    },
});
</script>

<style lang="scss"></style>
