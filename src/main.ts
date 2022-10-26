import { createApp } from 'vue';
import App from './App.vue';
import DFAFactory from './DFAFactory';
import NFAFactory from './NFAFactory';
import Parser from './Parser';

createApp(App).mount('#app');

const parser = new Parser('l(l|d)*');

console.log(parser.root);

const nfaFactory = new NFAFactory(parser.root);

console.log(nfaFactory.nfa);

const dfaFactory = new DFAFactory(nfaFactory.nfa);

console.log(dfaFactory.dfa);
