module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
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
        "@typescript-eslint/camelcase": [
            "warn",
            {
                "properties": "always",
                "genericType": "always",
            }
        ],
        "@typescript-eslint/class-name-casing": "warn",
        "@typescript-eslint/comma-spacing": "warn",
        "@typescript-eslint/consistent-type-assertions": "warn",
        "@typescript-eslint/consistent-type-definitions": "warn",
        "@typescript-eslint/default-param-last": "warn",
        "@typescript-eslint/explicit-member-accessibility": [
            "warn",
            {
                "accessibility": "explicit"
            }
        ],
        "@typescript-eslint/func-call-spacing": "warn",
        "@typescript-eslint/generic-type-naming": [
            "warn",
            "^T([A-Z][A-Za-z]+)?$"
        ],
        // "@typescript-eslint/indent": [
        //     "warn",
        //     4,
        //     {
        //         "FunctionDeclaration": {
        //             "parameters": "first"
        //         },
        //         "FunctionExpression": {
        //             "parameters": "first"
        //         },
        //         "CallExpression": {
        //             "arguments": 1
        //         },
        //         "SwitchCase": 1
        //     }
        // ],
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
                }
            }
        ],
        "@typescript-eslint/member-ordering": "warn",
        "@typescript-eslint/naming-convention": [
            "warn",
            {
                "selector": "default",
                "format": ["camelCase"]
            },
            {
                "selector": "variableLike",
                "format": ["camelCase"]
            },
            {
                "selector": "function",
                "format": ["camelCase", "PascalCase"]
            },
            {
                "selector": "memberLike",
                "format": ["camelCase"]
            },
            {
                "selector": "memberLike",
                "modifiers": ["public"],
                "format": ["PascalCase"]
            },
            {
                "selector": "memberLike",
                "modifiers": ["protected"],
                "format": ["PascalCase"]
            },
            {
                "selector": "accessor",
                "format": ["PascalCase"]
            },
            {
                "selector": "method",
                "format": ["camelCase", "PascalCase"]
            },
            {
                "selector": "enumMember",
                "format": ["PascalCase"]
            },
            {
                "selector": "typeLike",
                "format": ["PascalCase"]
            }
        ],
        "@typescript-eslint/no-dupe-class-members": "warn",
        "@typescript-eslint/no-dynamic-delete": "warn",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-for-in-array": "off",
        "@typescript-eslint/no-inferrable-types": "warn",
        "@typescript-eslint/no-misused-new": "warn",
        "@typescript-eslint/no-namespace": "warn",
        "@typescript-eslint/no-parameter-properties": "warn",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-throw-literal": "warn",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
        "@typescript-eslint/no-unnecessary-qualifier": "warn",
        "@typescript-eslint/no-unnecessary-type-arguments": "warn",
        "@typescript-eslint/no-unnecessary-type-assertion": "warn",
        "@typescript-eslint/no-unused-expressions": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-use-before-define": "warn",
        "@typescript-eslint/no-var-requires": "warn",
        "@typescript-eslint/prefer-for-of": "warn",
        "@typescript-eslint/prefer-function-type": "warn",
        "@typescript-eslint/prefer-includes": "warn",
        "@typescript-eslint/prefer-namespace-keyword": "warn",
        "@typescript-eslint/prefer-nullish-coalescing": "warn",
        "@typescript-eslint/prefer-optional-chain": "warn",
        "@typescript-eslint/prefer-string-starts-ends-with": "warn",
        "@typescript-eslint/quotes": [
            "warn",
            "double",
            {
                "avoidEscape": true
            }
        ],
        "@typescript-eslint/restrict-plus-operands": [
            "warn",
            {
                "checkCompoundAssignments": true
            }
        ],
        "@typescript-eslint/return-await": "warn",
        "@typescript-eslint/semi": [
            "warn",
            "always"
        ],
        "@typescript-eslint/space-before-function-paren": [
            "warn",
            {
                "anonymous": "never",
                "asyncArrow": "always",
                "named": "never"
            }
        ],
        "@typescript-eslint/triple-slash-reference": "warn",
        "@typescript-eslint/type-annotation-spacing": "warn",
        "@typescript-eslint/unified-signatures": "warn",
        "array-bracket-spacing": "warn",
        "array-bracket-newline": [
            "warn",
            "consistent"
        ],
        "array-element-newline": [
            "warn",
            "consistent"
        ],
        "arrow-body-style": "warn",
        "arrow-parens": [
            "off",
            "as-needed"
        ],
        "arrow-spacing": "warn",
        "block-spacing": "warn",
        "brace-style": ["warn", "allman"],
        "capitalized-comments": [
            "warn",
            "always"
        ],
        "comma-dangle": "warn",
        "comma-style": "warn",
        "complexity": "off",
        "computed-property-spacing": "warn",
        "constructor-super": "warn",
        "curly": "warn",
        "dot-notation": "off",
        "eol-last": "warn",
        "eqeqeq": [
            "warn",
            "always"
        ],
        "function-call-argument-newline": [
            "warn",
            "consistent"
        ],
        "generator-star-spacing": "warn",
        "grouped-accessor-pairs": "warn",
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
                "pathGroups": [
                    {
                        "pattern": "child_process",
                        "group": "builtin"
                    }
                ],
                "alphabetize": {
                    "order": "asc",
                    "caseInsensitive": false
                }
            }
        ],
        "jsdoc/no-types": "warn",
        "lines-between-class-members": "warn",
        "max-classes-per-file": "off",
        "multiline-ternary": [
            "warn",
            "always-multiline"
        ],
        "max-len": "off",
        "new-parens": "warn",
        "no-async-promise-executor": "off",
        "no-bitwise": "off",
        "no-caller": "warn",
        "no-case-declarations": "off",
        "no-cond-assign": "warn",
        "no-console": "off",
        "no-constant-condition": "off",
        "no-control-regex": "off",
        "no-constructor-return": "warn",
        "no-debugger": "warn",
        "no-duplicate-case": "warn",
        "no-duplicate-imports": "warn",
        "no-empty": "off",
        "no-eval": "warn",
        "no-fallthrough": "off",
        "no-floating-decimal": "warn",
        "no-implicit-coercion": "warn",
        "no-inner-declarations": "off",
        "no-invalid-this": "off",
        "no-lonely-if": "warn",
        "no-multiple-empty-lines": [
            "warn",
            {
                "max": 1,
                "maxBOF": 0,
                "maxEOF": 0
            }
        ],
        "no-multi-spaces": "warn",
        "no-new-wrappers": "warn",
        "no-octal-escape": "warn",
        "no-regex-spaces": "off",
        "no-sequences": "warn",
        "no-shadow": [
            "off",
            {
                "hoist": "all"
            }
        ],
        "no-sparse-arrays": "warn",
        "no-throw-literal": "off",
        "no-trailing-spaces": "warn",
        "no-undef-init": "warn",
        "no-underscore-dangle": "warn",
        "no-unsafe-finally": "warn",
        "no-unused-labels": "warn",
        "no-useless-catch": "off",
        "no-useless-rename": "warn",
        "no-var": "warn",
        "no-whitespace-before-property": "warn",
        "object-curly-newline": "warn",
        "object-curly-spacing": [
            "warn",
            "always"
        ],
        "object-property-newline": [
            "warn",
            {
                "allowAllPropertiesOnSameLine": true
            }
        ],
        "object-shorthand": "warn",
        "one-var": [
            "warn",
            "never"
        ],
        "operator-linebreak": ["warn", "after"],
        "padded-blocks": ["warn", "never"],
        "padding-line-between-statements": [
            "warn",
            {
                "blankLine": "always",
                "prev": "*",
                "next": "multiline-block-like"
            },
            {
                "blankLine": "always",
                "prev": "multiline-block-like",
                "next": "*"
            },
            {
                "blankLine": "any",
                "prev": "multiline-block-like",
                "next": [
                    "return",
                    "break",
                    "continue"
                ]
            }
        ],
        "prefer-const": "off",
        "prefer-object-spread": "warn",
        "prefer-rest-params": "warn",
        "prefer-spread": "warn",
        "quote-props": [
            "warn",
            "consistent-as-needed"
        ],
        "radix": "warn",
        "rest-spread-spacing": "warn",
        "semi-spacing": "warn",
        "semi-style": "warn",
        "space-before-blocks": "warn",
        "space-in-parens": "warn",
        "space-infix-ops": "warn",
        "space-unary-ops": "warn",
        "spaced-comment": "warn",
        "switch-colon-spacing": "warn",
        "template-curly-spacing": "warn",
        "use-isnan": "warn",
        "valid-typeof": "off",
        "yield-star-spacing": "warn",
        "yoda": "warn",
        "@typescript-eslint/tslint/config": [
            "warn",
            {
                "rules": {
                    "completed-docs": true,
                    "import-spacing": true,
                    "jsdoc-format": true,
                    "match-default-export-name": true,
                    "no-reference-import": true,
                    "return-undefined": true,
                    "whitespace": true
                }
            }
        ]
    },
    "settings": {}
};
