module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
  parser: 'babel-eslint',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react', 'jest'],
  rules: {
    'linebreak-style': ['error', 'unix'],
    quotes: ['warn', 'single'],
    semi: ['warn', 'always'],
    'no-console': 1,
    'object-curly-spacing': ['warn', 'always'],
    'array-bracket-spacing': ['warn', 'always'],
    'jest/no-disabled-tests': [0],
    'react/display-name': [0],
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-shadow': 'warn',
    'no-unused-vars': [
      'warn',
      { vars: 'all', args: 'after-used', ignoreRestSiblings: false },
    ],
  },
};
