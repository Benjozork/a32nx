import fs from 'fs';
import { join } from 'path';
import { baseCompile } from './plugins.mjs';
import { getTemplatePlugin } from './templatePlugins.mjs';
import { Directories } from './directories.mjs';
import { getInputs } from './igniter/tasks.mjs';

const oldDir = process.cwd();

process.chdir(Directories.src);

export default getInputs()
    .filter(({ name }) => name === 'EFB')
    .map(({ path, name, isInstrument }) => {
        const config = JSON.parse(fs.readFileSync(join(Directories.instruments, 'src', path, 'config.json')));

        const additionalImports = config.additionalImports ? config.additionalImports : [];
        return {
            watch: true,
            name,
            input: join(Directories.instruments, 'src', path, config.index),
            output: {
                dir: 'client',
                format: 'iife',
                entryFileNames: '[name].[hash].js',
                assetFileNames: '[name].[hash][extname]',
                globals: [
                    'console',
                ],
                sourceMap: false,
            },
            plugins: [
                ...baseCompile(name, path),
                // getTemplatePlugin({
                //     name,
                //     path,
                //     imports: [
                //         '/JS/dataStorage.js',
                //         '/Pages/VCockpit/Instruments/FlightElements/A32NX_Waypoint.js',
                //         '/Pages/A32NX_Core/math.js',
                //         '/JS/A32NX_Util.js',
                //         ...additionalImports,
                //     ],
                //     config,
                //     isInstrument,
                // }),
            ],
        };
    });

console.log(process.cwd());
