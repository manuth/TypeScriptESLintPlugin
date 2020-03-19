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
    "plugins": [
        require.resolve("@typescript-eslint/eslint-plugin"),
        require.resolve("@typescript-eslint/tslint"),
        require.resolve("eslint-plugin-import"),
        require.resolve("eslint-plugin-jsdoc"),
        require.resolve("eslint-plugin-prefer-arrow")
    ],
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