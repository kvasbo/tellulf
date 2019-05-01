module.exports = {
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
};