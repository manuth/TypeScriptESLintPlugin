module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "ignorePatterns": [],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "@typescript-eslint/tslint",
        "import",
        "jsdoc",
        "prefer-arrow"
    ],
    "rules": {
        "capitalized-comments": [
            "warn",
            "always"
        ],
        "no-empty": "warn",
        "no-extra-semi": "error",
        "no-trailing-spaces": "warn",
        "spaced-comment": "warn"
    },
    "settings": {}
};
