import antfu from '@antfu/eslint-config'
import globals from 'globals'

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single',
    },
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'prefer-const': 'error',
      'no-undef': 'off',
      'no-console': 'off',
      'node/prefer-global/process': 'off',
      '@typescript-eslint/consistent-type-definitions': [
        'error',
        'type',
      ],
      '@typescript-eslint/no-unsafe-function-type': [
        'off',
      ],
      'ts/no-empty-object-type': ['off'],
      'no-unused-vars': ['off'],
    },
  },
  {
    ignores: ['node_modules/*', 'dist/*'],
  },
)
