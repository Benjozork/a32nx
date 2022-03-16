'use strict';

import typescript from '@rollup/plugin-typescript';

const config = {
    input: './src/index.ts',
    output: {
        dir: 'client',
        format: 'esm',
        entryFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash][extname]',
    },
    plugins: [
        typescript(),
    ],
};

export default config;
