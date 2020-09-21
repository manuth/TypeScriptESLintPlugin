const { join } = require("path");

module.exports = {
    env: {
        es6: true,
        node: true
    },
    extends: [
        "plugin:@manuth/typescript/recommended-requiring-type-checking"
    ],
    parserOptions: {
        project: join(__dirname, "tsconfig.json"),
        sourceType: "module"
    },
    rules: {
        "@typescript-eslint/ban-types": [
            "warn",
            {
                types: {
                    object: false
                }
            }
        ]
    }
};
