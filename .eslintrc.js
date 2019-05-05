/*module.exports = {
  "extends": "airbnb",
  "env": {
    "browser": true,
    "es6": true
  },    
  "plugins": [
    "babel",
    "react"
  ],
  "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true,
            "es6": true,
        },
        "sourceType": "module"
    },
  "rules": {
    "max-len": ["error", { "code": 200 }],
    "react/forbid-prop-types": 0,
    "no-use-before-define": 0,
    "no-console": 0,
    "no-else-return": 1,
    "arrow-body-style": 0,
    "react/prefer-stateless-function": 0,
    "react/destructuring-assignment": 0,
    "jsx-a11y/accessible-emoji": 0,
    "react/jsx-one-expression-per-line": 0,
    "jsx-a11y/click-events-have-key-events": 0,
    "jsx-a11y/no-static-element-interactions": 0
  }
};*/


module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
      'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
      'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
      'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
      ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
      ecmaFeatures: {
          jsx: true, // Allows for the parsing of JSX
      },
  },
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    "@typescript-eslint/indent": ["error", 2],
    "@typescript-eslint/explicit-function-return-type": "off",
  },
  settings: {
      react: {
          version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
      },
  },
};