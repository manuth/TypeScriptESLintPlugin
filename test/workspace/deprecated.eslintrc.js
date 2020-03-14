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
        "prefer-reflect": "warn"
    },
    "settings": {}
};
