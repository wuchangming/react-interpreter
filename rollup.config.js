import { env } from 'process'
import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs'

import pkg from './package.json'

const extensions = ['.ts', '.tsx', '.js']
const noDeclarationFiles = { compilerOptions: { declaration: false } }

const babelRuntimeVersion = pkg.dependencies['@babel/runtime'].replace(/^[^0-9]*/, '')

const makeExternalPredicate = (externalArr) => {
    if (externalArr.length === 0) {
        return () => false
    }
    const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`)
    return (id) => pattern.test(id)
}

function getBanner(filename) {
    const date = new Date(env.SOURCE_DATE_EPOCH ? 1000 * +env.SOURCE_DATE_EPOCH : Date.now()).toUTCString()
    return `/*
  @license
  ${filename} v${pkg.version}
  ${date}
  @author ${pkg.author}
  https://github.com/wuchangming/react-interpreter
  Released under the MIT License.
*/`
}

export default async function () {
    return [
        // CommonJS
        {
            input: 'src/index.ts',
            output: {
                banner: getBanner('react-interpreter.js'),
                file: 'lib/react-interpreter.js',
                format: 'cjs',
                indent: false,
            },
            external: makeExternalPredicate([
                ...Object.keys(pkg.dependencies || {}),
                ...Object.keys(pkg.peerDependencies || {}),
            ]),
            plugins: [
                commonjs(),
                nodeResolve({
                    extensions,
                }),
                typescript({ useTsconfigDeclarationDir: true }),
                babel({
                    extensions,
                    plugins: [['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }]],
                    babelHelpers: 'runtime',
                }),
            ],
        },

        // ES
        {
            input: 'src/index.ts',
            output: {
                banner: getBanner('react-interpreter.js'),
                file: 'es/react-interpreter.js',
                format: 'es',
                indent: false,
            },
            external: makeExternalPredicate([
                ...Object.keys(pkg.dependencies || {}),
                ...Object.keys(pkg.peerDependencies || {}),
            ]),
            plugins: [
                commonjs(),
                nodeResolve({
                    extensions,
                }),
                typescript({ tsconfigOverride: noDeclarationFiles }),
                babel({
                    extensions,
                    plugins: [
                        ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion, useESModules: true }],
                    ],
                    babelHelpers: 'runtime',
                }),
            ],
        },

        // // ES for Browsers
        {
            input: 'src/index.ts',
            output: {
                banner: getBanner('react-interpreter.mjs'),
                file: 'es/react-interpreter.mjs',
                format: 'es',
                indent: false,
            },
            external: makeExternalPredicate([
                ...Object.keys(pkg.dependencies || {}),
                ...Object.keys(pkg.peerDependencies || {}),
            ]),
            plugins: [
                commonjs(),
                nodeResolve({
                    extensions,
                }),
                replace({
                    preventAssignment: true,
                    'process.env.NODE_ENV': JSON.stringify('production'),
                }),
                typescript({ tsconfigOverride: noDeclarationFiles }),
                babel({
                    extensions,
                    exclude: 'node_modules/**',
                    skipPreflightCheck: true,
                    babelHelpers: 'bundled',
                }),
                terser({
                    compress: {
                        pure_getters: true,
                        unsafe: true,
                        unsafe_comps: true,
                        warnings: false,
                    },
                }),
            ],
        },

        // // UMD Development
        {
            input: 'src/index.ts',
            output: {
                banner: getBanner('react-interpreter.js'),
                file: 'dist/react-interpreter.js',
                format: 'umd',
                name: 'ReactInterpreter',
                indent: false,
                globals: {
                    react: 'React',
                },
            },
            external: makeExternalPredicate([
                ...Object.keys(pkg.dependencies || {}),
                ...Object.keys(pkg.peerDependencies || {}),
            ]),
            plugins: [
                commonjs(),
                nodeResolve({
                    extensions,
                }),
                typescript({ tsconfigOverride: noDeclarationFiles }),
                babel({
                    extensions,
                    exclude: 'node_modules/**',
                    babelHelpers: 'bundled',
                }),
                replace({
                    preventAssignment: true,
                    'process.env.NODE_ENV': JSON.stringify('development'),
                }),
            ],
        },

        // // UMD Production
        {
            input: 'src/index.ts',
            output: {
                banner: getBanner('react-interpreter.min.js'),
                file: 'dist/react-interpreter.min.js',
                format: 'umd',
                name: 'ReactInterpreter',
                indent: false,
                globals: {
                    react: 'React',
                },
            },
            external: makeExternalPredicate([
                ...Object.keys(pkg.dependencies || {}),
                ...Object.keys(pkg.peerDependencies || {}),
            ]),
            plugins: [
                commonjs(),
                nodeResolve({
                    extensions,
                }),
                typescript({ tsconfigOverride: noDeclarationFiles }),
                babel({
                    extensions,
                    exclude: 'node_modules/**',
                    skipPreflightCheck: true,
                    babelHelpers: 'bundled',
                }),
                replace({
                    preventAssignment: true,
                    'process.env.NODE_ENV': JSON.stringify('production'),
                }),
                terser({
                    compress: {
                        pure_getters: true,
                        unsafe: true,
                        unsafe_comps: true,
                        warnings: false,
                    },
                }),
            ],
        },
    ]
}
