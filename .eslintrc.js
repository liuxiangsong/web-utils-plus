module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    // indent: [
    //     2,
    //     4,
    //     {
    //         SwitchCase: 1
    //     }
    // ],
    // 'comma-style': ['error', 'first', {
    //     exceptions: {
    //         ArrayExpression: true,
    //         ObjectExpression: true
    //     }
    // }],
    // semi: [
    //     2,
    //     'never'
    // ],
    // 'no-floating-decimal': [
    //     2
    // ],
    '@typescript-eslint/no-explicit-any':'off',
    'no-param-reassign':'off',
    'no-multi-assign':'off',
    'max-len':'off',
    '@typescript-eslint/camelcase':'off',
    'no-underscore-dangle':'off',
    '@typescript-eslint/no-var-requires':'off',
    'func-names':'off',
    'linebreak-style':'off',
    'no-console': 'off',
    'no-debugger': 'off'
},
};
