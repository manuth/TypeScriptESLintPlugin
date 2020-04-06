const mock = require("mock-require");

let plugins = [
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/eslint-plugin-tslint",
    "eslint-plugin-import",
    "eslint-plugin-jsdoc",
    "eslint-plugin-prefer-arrow"
];

mock.stopAll();

for (let plugin of plugins)
{
    mock(plugin, require(plugin));
}

module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "root": true,
    "ignorePatterns": [],
    "parser": require.resolve("@typescript-eslint/parser"),
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": plugins,
    "rules": {
        "capitalized-comments": [
            "warn",
            "always"
        ],
        "no-empty": "warn",
        "no-extra-semi": "error",
        "no-trailing-spaces": "warn",
        "spaced-comment": "warn",
        "@typescript-eslint/semi": [
            "warn",
            "always"
        ]
    },
    "settings": {}
}