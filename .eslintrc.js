module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": [],
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
        "@typescript-eslint/adjacent-overload-signatures": "warn",
        "@typescript-eslint/array-type": "warn",
        "@typescript-eslint/await-thenable": "warn",
        "@typescript-eslint/ban-types": "warn",
        "@typescript-eslint/class-name-casing": "warn",
        "@typescript-eslint/consistent-type-assertions": "warn",
        "@typescript-eslint/consistent-type-definitions": "warn",
        "@typescript-eslint/explicit-member-accessibility": [
            "warn",
            {
                "accessibility": "explicit"
            }
        ],
        "@typescript-eslint/indent": [
            "warn",
            4,
            {
                "FunctionDeclaration": {
                    "parameters": "first"
                },
                "FunctionExpression": {
                    "parameters": "first"
                }
            }
        ],
        "@typescript-eslint/interface-name-prefix": [
            "warn",
            {
                "prefixWithI": "always"
            }
        ],
        "@typescript-eslint/member-delimiter-style": [
            "warn",
            {
                "multiline": {
                    "delimiter": "semi",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/member-ordering": "warn",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-for-in-array": "off",
        "@typescript-eslint/no-inferrable-types": "warn",
        "@typescript-eslint/no-misused-new": "warn",
        "@typescript-eslint/no-namespace": "warn",
        "@typescript-eslint/no-parameter-properties": "warn",
        "@typescript-eslint/no-unnecessary-qualifier": "warn",
        "@typescript-eslint/no-unnecessary-type-assertion": "warn",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-var-requires": "warn",
        "@typescript-eslint/prefer-for-of": "warn",
        "@typescript-eslint/prefer-function-type": "warn",
        "@typescript-eslint/prefer-namespace-keyword": "warn",
        "@typescript-eslint/quotes": [
            "warn",
            "double",
            {
                "avoidEscape": true
            }
        ],
        "@typescript-eslint/restrict-plus-operands": "warn",
        "@typescript-eslint/semi": [
            "warn",
            "always"
        ],
        "@typescript-eslint/triple-slash-reference": "warn",
        "@typescript-eslint/type-annotation-spacing": "warn",
        "@typescript-eslint/unified-signatures": "warn",
        "arrow-body-style": "warn",
        "arrow-parens": [
            "off",
            "as-needed"
        ],
        "camelcase": "warn",
        "capitalized-comments": [
            "warn",
            "always"
        ],
        "comma-dangle": "off",
        "complexity": "off",
        "constructor-super": "warn",
        "curly": "warn",
        "dot-notation": "off",
        "eol-last": "off",
        "eqeqeq": [
            "warn",
            "always"
        ],
        "guard-for-in": "off",
        "id-match": "warn",
        "import/no-default-export": "warn",
        "import/order": [
            "warn",
            {
                "groups": [
                    "builtin",
                    [
                        "external",
                        "internal"
                    ],
                    [
                        "parent",
                        "sibling",
                        "index"
                    ]
                ],
                "alphabetize": {
                    "order": "asc",
                    "caseInsensitive": false
                }
            }
        ],
        "jsdoc/no-types": "warn",
        "max-classes-per-file": "off",
        "max-len": "off",
        "new-parens": "warn",
        "no-bitwise": "off",
        "no-caller": "warn",
        "no-cond-assign": "warn",
        "no-console": "off",
        "no-debugger": "warn",
        "no-duplicate-case": "warn",
        "no-duplicate-imports": "warn",
        "no-empty": "off",
        "no-eval": "warn",
        "no-fallthrough": "off",
        "no-invalid-this": "off",
        "no-multiple-empty-lines": "warn",
        "no-new-wrappers": "warn",
        "no-return-await": "warn",
        "no-sequences": "warn",
        "no-shadow": [
            "off",
            {
                "hoist": "all"
            }
        ],
        "no-sparse-arrays": "warn",
        "no-throw-literal": "warn",
        "no-trailing-spaces": "warn",
        "no-undef-init": "warn",
        "no-underscore-dangle": "warn",
        "no-unsafe-finally": "warn",
        "no-unused-expressions": "warn",
        "no-unused-labels": "warn",
        "no-var": "warn",
        "object-shorthand": "warn",
        "one-var": [
            "warn",
            "never"
        ],
        "prefer-const": "off",
        "prefer-object-spread": "warn",
        "quote-props": [
            "warn",
            "consistent-as-needed"
        ],
        "radix": "warn",
        "space-before-function-paren": [
            "warn",
            {
                "anonymous": "never",
                "asyncArrow": "always",
                "named": "never"
            }
        ],
        "spaced-comment": "warn",
        "use-isnan": "warn",
        "valid-typeof": "off",
        "@typescript-eslint/tslint/config": [
            "error",
            {
                "rules": {
                    "completed-docs": true,
                    "import-spacing": true,
                    "jsdoc-format": true,
                    "match-default-export-name": true,
                    "no-boolean-literal-compare": true,
                    "no-dynamic-delete": true,
                    "no-reference-import": true,
                    "number-literal-format": true,
                    "return-undefined": true,
                    "whitespace": true
                }
            }
        ]
    },
    "settings": {}
};
