import { rollup, RollupOptions, OutputOptions } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import typescript from 'rollup-plugin-typescript2'
// @ts-ignore
import postcss from 'rollup-plugin-postcss'

export function getRollupInputOption(path: string): RollupOptions {
  return {
    input: path,
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      typescript({ tsconfigOverride: { compilerOptions: { declaration: false } } }),
      postcss(),
      resolve(),
      commonjs(),
    ],
    external: ['react', 'react-dom'],
  }
}

export function getRollupOutputOption(path: string): OutputOptions {
  return {
    file: path,
    format: 'iife',
    name: 'dev',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      'prop-types': 'PropTypes',
    },
  }
}

export default async function compiler(input: string, output: string): Promise<void> {
  const inputOpiton = getRollupInputOption(input)
  const outputOpiton = getRollupOutputOption(output)

  const bundle = await rollup(inputOpiton)
  await bundle.write(outputOpiton)
}
