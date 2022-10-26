import { createApp } from 'vue';
import App from './App.vue';
import NFAFactory from './NFAFactory';
import Parser from './Parser';

createApp(App).mount('#app');

const parser = new Parser('l(l|d)*');

const nfaFactory = new NFAFactory(parser.root);

console.log(nfaFactory.nfa);
