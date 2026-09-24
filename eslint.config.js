import js from '@eslint/js'
import boundaries from 'eslint-plugin-boundaries'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/** Слои Feature-Sliced Design сверху вниз: слой может импортировать только нижележащие. */
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']

const layerPolicies = LAYERS.map((layer, index) => ({
  from: { element: { type: layer } },
  allow: {
    to: {
      element: {
        types: { anyOf: LAYERS.slice(index + 1) },
        // Снаружи в slice можно заходить только через его публичный API.
        fileInternalPath: 'index.ts',
      },
    },
  },
}))

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.app.json' } },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'pages', pattern: 'src/pages/*', capture: ['slice'] },
        { type: 'widgets', pattern: 'src/widgets/*', capture: ['slice'] },
        { type: 'features', pattern: 'src/features/*', capture: ['slice'] },
        { type: 'entities', pattern: 'src/entities/*', capture: ['slice'] },
        { type: 'shared', pattern: 'src/shared/*', capture: ['segment'] },
      ],
      'boundaries/ignore': ['src/main.tsx', 'src/**/*.test.ts'],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            // Внутри одного slice/сегмента импорты свободные.
            { allow: { dependency: { relationship: { to: 'internal' } } } },
            // У shared нет слайсов: его сегменты могут импортировать друг друга.
            {
              from: { element: { type: 'shared' } },
              allow: { to: { element: { type: 'shared' } } },
            },
            ...layerPolicies,
          ],
        },
      ],
    },
  },
  prettier,
])
