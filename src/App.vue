<template>
    <div class="big-frame">
        <el-row class="half-frame">
            <el-col :span="12" class="full-height">
                <div class="area-container">
                    <h1>输入正则表达式</h1>
                    <el-row class="area-main-frame">
                        <el-col :span="16" class="full-height">
                            <div class="input-container">
                                <el-input type="textarea" v-model="regex" />
                            </div>
                        </el-col>
                        <el-col :span="8" class="full-height">
                            <div class="upload-container">
                                <el-upload
                                    drag
                                    :auto-upload="false"
                                    ref="upload"
                                    @change="onUpload"
                                >
                                    <el-icon class="el-icon--upload"
                                        ><upload-filled
                                    /></el-icon>
                                    <div class="el-upload__text">
                                        把含有正则表达式的文件拖拽至此处或<em
                                            >点击选择</em
                                        >
                                    </div>
                                </el-upload>
                            </div>
                            <div class="button-container">
                                <el-button @click="generate">生成</el-button>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-col>
            <el-col :span="12" class="full-height">
                <div class="area-container">
                    <h1>NFA</h1>
                    <el-row class="area-main-frame horizontal-main-frame">
                        <FAComponent
                            :table="nfaTable"
                            :graph="nfaGraph"
                            ref-prefix="nfa"
                        />
                    </el-row>
                </div>
            </el-col>
        </el-row>
        <el-row class="half-frame">
            <el-col :span="12" class="full-height">
                <div class="area-container">
                    <h1>DFA</h1>
                    <el-row class="area-main-frame horizontal-main-frame">
                        <FAComponent
                            :table="dfaTable"
                            :graph="dfaGraph"
                            ref-prefix="dfa"
                        />
                    </el-row>
                </div>
            </el-col>
            <el-col :span="12" class="full-height">
                <div class="area-container">
                    <h1>最小DFA</h1>
                    <el-row class="area-main-frame horizontal-main-frame">
                        <FAComponent
                            :table="minDfaTable"
                            :graph="minDfaGraph"
                            ref-prefix="min-dfa"
                        />
                    </el-row>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FAComponent from './components/FAComponent.vue';
import type {
    UploadFile,
    UploadFiles,
    UploadInstance,
    UploadRawFile,
} from 'element-plus/es/components/upload';
import type { FATable } from './show/FATable';
import type { FAGraph } from './show/FAGraph';
import Parser from './data/Parser';
import NFAFactory from './data/NFAFactory';
import NFATableFactory from './show/NFATableFactory';
import NFAGraphFactory from './show/NFAGraphFactory';
import DFAFactory from './data/DFAFactory';
import DFATableFactory from './show/DFATableFactory';
import DFAGraphFactory from './show/DFAGraphFactory';
import DFAMinimizer from './data/DFAMinimizer';

class Data {
    regex = '';
    nfaTable?: FATable;
    nfaGraph?: FAGraph;
    dfaTable?: FATable;
    dfaGraph?: FAGraph;
    minDfaTable?: FATable;
    minDfaGraph?: FAGraph;
}

export default defineComponent({
    components: { FAComponent },
    data() {
        return new Data();
    },
    methods: {
        onUpload(file: UploadFile, files: UploadFiles) {
            if (files.length == 0 && file == null) {
                return;
            }
            if (file.raw != null) {
                this.uploadFile(file.raw);
            }
            return;
        },
        async uploadFile(file: UploadRawFile) {
            try {
                this.regex = await file.text();
            } catch (e) {
                alert('不是文本文件！');
            }

            const upload = this.$refs['upload'] as UploadInstance;
            upload.clearFiles();
        },
        generate() {
            try {
                const parser = new Parser(this.regex);
                const nfaFactory = new NFAFactory(parser.root);
                const nfaTableFactory = new NFATableFactory(nfaFactory.nfa);
                this.nfaTable = nfaTableFactory.table;
                const nfaGraphFactory = new NFAGraphFactory(nfaFactory.nfa);
                this.nfaGraph = nfaGraphFactory.graph;
                const dfaFactory = new DFAFactory(nfaFactory.nfa);
                const dfaTableFactory = new DFATableFactory(dfaFactory.dfa);
                this.dfaTable = dfaTableFactory.table;
                const dfaGraphFactory = new DFAGraphFactory(dfaFactory.dfa);
                this.dfaGraph = dfaGraphFactory.graph;
                const dfaMinimizer = new DFAMinimizer(dfaFactory.dfa);
                const minDFATableFactory = new DFATableFactory(
                    dfaMinimizer.minDFA
                );
                this.minDfaTable = minDFATableFactory.table;
                const minDFAGraphFactory = new DFAGraphFactory(
                    dfaMinimizer.minDFA
                );
                this.minDfaGraph = minDFAGraphFactory.graph;
            } catch (e) {
                alert('正则表达式的格式有误！');
            }
        },
    },
});
</script>

<style lang="scss">
.big-frame {
    width: 100vw;
    height: 100vh;
}

.half-frame {
    width: 100%;
    height: 50%;
}

.full-height {
    height: 100%;
}

.area-container {
    width: calc(100% - 1rem);
    height: calc(100% - 1rem);
    margin: 0.5rem;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
}

h1 {
    text-align: center;
    font-weight: lighter;
    font-size: 36px;
    line-height: 36px;
    margin-top: 16px;
    margin-bottom: 16px;
}

.area-main-frame {
    height: calc(100% - 73px);
}

.horizontal-main-frame {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    margin-left: 0.5rem;
    margin-right: 00.5rem;
    width: calc(100% - 1rem);
}

.input-container {
    height: calc(100% - 1rem);
    padding: 5px;
    * {
        height: 100%;
        font-family: 'consolas';
        font-size: 14px;
    }
}

.upload-container {
    margin: 5px;
    height: 80%;
    div {
        height: 100%;
    }
}

.button-container {
    margin-top: 8%;
    text-align: center;
}
</style>
