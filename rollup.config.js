import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'
const babelRuntimeVersion = pkg.dependencies['@babel/runtime'].replace(/^[^0-9]*/, '')
const noDeclarationFiles = { compilerOptions: { declaration: false } }

const makeExternalPredicate = externalArr => {
  if (externalArr.length === 0) {
    return () => false
  }

  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`)
  return id => pattern.test(id)
}

export default [
  // CommonJS
  {
    input: 'src/index.ts',
    output: { file: 'lib/index.js', format: 'cjs', indent: false, exports: 'named' },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]),
    plugins: [
      babel({
        plugins: [['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }]],
        babelHelpers: 'runtime',
      }),
      typescript({ useTsconfigDeclarationDir: true }),
      resolve(),
    ],
  },

  // ES
  // {
  //   input: 'src/index.ts',
  //   output: { file: 'es', format: 'es', indent: false, exports: 'named' },
  //   external: makeExternalPredicate([
  //     ...Object.keys(pkg.dependencies || {}),
  //     ...Object.keys(pkg.peerDependencies || {}),
  //   ]),
  //   plugins: [
  //     babel({
  //       plugins: [
  //         ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion, useESModules: true }],
  //       ],
  //       babelHelpers: 'runtime',
  //     }),
  //     typescript({ tsconfigOverride: noDeclarationFiles }),
  //     resolve(),
  //   ],
  // },

  // ES for Browsers
  {
    input: 'src/index.ts',
    output: { file: 'es/index.mjs', format: 'es', indent: false, exports: 'named' },
    plugins: [
      replace({
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
      babel({
        plugins: [['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }]],
        babelHelpers: 'runtime',
      }),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      commonjs(),
      resolve(),
    ],
  },

  // UMD Development
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name: 'Charts',
      indent: false,
      exports: 'named',
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      babel({
        plugins: [['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }]],
        babelHelpers: 'runtime',
      }),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      commonjs(),
      resolve(),
    ],
  },

  // UMD Production
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'Charts',
      indent: false,
      exports: 'named',
    },
    plugins: [
      replace({
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
      babel({
        plugins: [['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }]],
        babelHelpers: 'runtime',
      }),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      commonjs(),
      resolve(),
    ],
  },
]
