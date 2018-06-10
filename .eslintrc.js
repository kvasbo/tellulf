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
    "max-len": ["error", { "code": 150 }],
    "react/forbid-prop-types": 0,
    "no-use-before-define": 0,
    "no-console": 0,
    "react/prefer-stateless-function": 0,
    "jsx-a11y/accessible-emoji": 0
  }
};