const { join } = require("path");

module.exports = {
    env: {
        es6: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.json",
        sourceType: "module"
    },
    plugins: [
        "@typescript-eslint",
        "@typescript-eslint/tslint",
        "import",
        "jsdoc",
        "prefer-arrow"
    ],
    rules: {
        "@typescript-eslint/adjacent-overload-signatures": "warn",
        "@typescript-eslint/array-type": [
            "warn",
            {
                default: "array-simple"
            }
        ],
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/ban-types": "error",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/class-name-casing": "off",
        "@typescript-eslint/comma-spacing": "warn",
        "@typescript-eslint/consistent-type-assertions": "warn",
        "@typescript-eslint/consistent-type-definitions": [
            "warn",
            "interface"
        ],
        "@typescript-eslint/default-param-last": "error",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/func-call-spacing": "warn",
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
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/member-delimiter-style": [
            "warn",
            {
                singleline: {
                    delimiter: "comma",
                    requireLast: false
                },
                multiline: {
                    delimiter: "semi",
                    requireLast: true
                }
            }
        ],
        "@typescript-eslint/member-ordering": [
            "warn",
            {
                default: [
                    // Fields
                    "public-static-field",
                    "protected-static-field",
                    "private-static-field",

                    "public-instance-field",
                    "protected-instance-field",
                    "private-instance-field",

                    "public-abstract-field",
                    "protected-abstract-field",
                    "private-abstract-field",

                    "public-field",
                    "protected-field",
                    "private-field",

                    "static-field",
                    "instance-field",
                    "abstract-field",

                    "field",

                    // Constructors
                    "public-constructor",
                    "protected-constructor",
                    "private-constructor",

                    "constructor",

                    // Index signature
                    "signature",

                    // Methods
                    "public-static-method",
                    "protected-static-method",
                    "private-static-method",

                    "public-instance-method",
                    "protected-instance-method",
                    "private-instance-method",

                    "public-abstract-method",
                    "protected-abstract-method",
                    "private-abstract-method",

                    "public-method",
                    "protected-method",
                    "private-method",

                    "static-method",
                    "instance-method",
                    "abstract-method",

                    "method"
                ]
            }
        ],
        "@typescript-eslint/naming-convention": [
            "warn",
            {
                selector: "enumMember",
                format: ["PascalCase"]
            },
            {
                selector: "typeLike",
                format: ["PascalCase"]
            },
            {
                selector: "interface",
                prefix: ["I"],
                format: ["PascalCase"]
            },
            {
                selector: "typeParameter",
                prefix: ["T"],
                format: ["PascalCase"]
            }
        ],
        "@typescript-eslint/no-dynamic-delete": "error",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-for-in-array": "error",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-namespace": [
            "warn",
            {
                allowDeclarations: true,
                allowDefinitionFiles: true
            }
        ],
        "@typescript-eslint/no-parameter-properties": "error",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-unused-expressions": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-use-before-define": [
            "warn",
            {
                functions: false,
                classes: false,
                variables: true
            }
        ],
        "@typescript-eslint/no-var-requires": "warn",
        "@typescript-eslint/prefer-as-const": "warn",
        "@typescript-eslint/prefer-for-of": "warn",
        "@typescript-eslint/prefer-function-type": "warn",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/prefer-optional-chain": "warn",
        "@typescript-eslint/quotes": [
            "warn",
            "double",
            {
                avoidEscape: true
            }
        ],
        "@typescript-eslint/semi": [
            "error",
            "always"
        ],
        "@typescript-eslint/space-before-function-paren": [
            "warn",
            {
                anonymous: "never",
                asyncArrow: "always",
                named: "never"
            }
        ],
        "@typescript-eslint/triple-slash-reference": "off",
        "@typescript-eslint/type-annotation-spacing": "warn",
        "@typescript-eslint/unified-signatures": "off",
        "array-bracket-newline": [
            "warn",
            "consistent"
        ],
        "array-bracket-spacing": "warn",
        "array-element-newline": [
            "warn",
            "consistent"
        ],
        "arrow-parens": [
            "off",
            "as-needed"
        ],
        "arrow-spacing": "warn",
        "block-spacing": "warn",
        "brace-style": [
            "warn",
            "allman",
            {
                allowSingleLine: true
            }
        ],
        "comma-dangle": "error",
        "comma-style": "warn",
        complexity: "off",
        "computed-property-spacing": "warn",
        "constructor-super": "error",
        curly: "off",
        "dot-notation": "off",
        "eol-last": "warn",
        eqeqeq: [
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
        "import/no-default-export": "warn",
        "import/no-duplicates": "warn",
        "import/order": [
            "warn",
            {
                groups: [
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
                pathGroups: [
                    {
                        pattern: "child_process",
                        group: "builtin"
                    }
                ],
                alphabetize: {
                    order: "asc",
                    caseInsensitive: false
                }
            }
        ],
        "jsdoc/check-alignment": "warn",
        "jsdoc/check-indentation": "warn",
        "jsdoc/check-param-names": "warn",
        "jsdoc/check-syntax": "warn",
        "jsdoc/check-tag-names": "warn",
        "jsdoc/check-values": "warn",
        "jsdoc/empty-tags": "warn",
        "jsdoc/newline-after-description": "warn",
        "jsdoc/require-description": [
            "warn",
            {
                contexts: [
                    "ClassDeclaration",
                    "ClassExpression",
                    "ArrowFunctionExpression",
                    "FunctionDeclaration",
                    "FunctionExpression",
                    "MethodDefinition",
                    "TSEnumDeclaration",
                    "TSEnumMember",
                    "TSInterfaceDeclaration",
                    "ClassProperty",
                    "TSPropertySignature",
                    "TSAbstractMethodDefinition",
                    "TSCallSignatureDeclaration",
                    "TSConstructSignatureDeclaration",
                    "TSMethodSignature",
                    "TSTypeAliasDeclaration"
                ]
            }
        ],
        "jsdoc/require-jsdoc": [
            "warn",
            {
                require: {
                    ClassDeclaration: true,
                    ClassExpression: true,
                    ArrowFunctionExpression: true,
                    FunctionDeclaration: true,
                    FunctionExpression: true,
                    MethodDefinition: true
                },
                contexts: [
                    "TSEnumDeclaration",
                    "TSEnumMember",
                    "TSInterfaceDeclaration",
                    "ClassProperty",
                    "TSTypeAliasDeclaration",
                    "TSPropertySignature",
                    "TSAbstractMethodDefinition",
                    "TSCallSignatureDeclaration",
                    "TSConstructSignatureDeclaration",
                    "TSMethodSignature",
                    "TSDeclareFunction"
                ]
            }
        ],
        "jsdoc/require-param-description": [
            "warn",
            {
                contexts: [
                    "any"
                ]
            }
        ],
        "jsdoc/require-param-name": [
            "warn",
            {
                contexts: [
                    "any"
                ]
            }
        ],
        "jsdoc/require-param-type": [
            "warn",
            {
                contexts: [
                    "any"
                ]
            }
        ],
        "jsdoc/require-param": [
            "warn",
            {
                exemptedBy: [],
                checkSetters: false,
                contexts: [
                    "ArrowFunctionExpression",
                    "FunctionDeclaration",
                    "FunctionExpression",
                    "TSEmptyBodyFunctionExpression",
                    "TSMethodSignature",
                    "TSConstructSignatureDeclaration",
                    "TSCallSignatureDeclaration",
                    "TSDeclareFunction",
                    "TSFunctionType"
                ]
            }
        ],
        "jsdoc/require-returns-type": [
            "warn",
            {
                contexts: [
                    "any"
                ]
            }
        ],
        "jsdoc/require-returns": [
            "warn",
            {
                checkGetters: false,
                exemptedBy: []
            }
        ],
        "lines-between-class-members": "warn",
        "max-classes-per-file": "off",
        "max-len": "off",
        "multiline-ternary": [
            "warn",
            "always-multiline"
        ],
        "new-parens": "warn",
        "no-async-promise-executor": "off",
        "no-bitwise": "off",
        "no-caller": "error",
        "no-case-declarations": "off",
        "no-cond-assign": "error",
        "no-console": "off",
        "no-constant-condition": "warn",
        "no-constructor-return": "error",
        "no-control-regex": "off",
        "no-debugger": "warn",
        "no-duplicate-case": "error",
        "no-empty": "off",
        "no-empty-pattern": "off",
        "no-eval": "warn",
        "no-fallthrough": "error",
        "no-floating-decimal": "error",
        "no-implicit-coercion": "warn",
        "no-inner-declarations": "off",
        "no-invalid-this": "off",
        "no-lonely-if": "warn",
        "no-multiple-empty-lines": [
            "warn",
            {
                max: 1,
                maxBOF: 0,
                maxEOF: 0
            }
        ],
        "no-multi-spaces": "warn",
        "no-new-wrappers": "error",
        "no-octal-escape": "warn",
        "no-regex-spaces": "off",
        "no-return-await": "warn",
        "no-sequences": "error",
        "no-shadow": "off",
        "no-sparse-arrays": "error",
        "no-throw-literal": "error",
        "no-trailing-spaces": "warn",
        "no-undef-init": "warn",
        "no-unreachable": "off",
        "no-unsafe-finally": "error",
        "no-unused-labels": "warn",
        "no-useless-catch": "off",
        "no-useless-rename": "warn",
        "no-var": "error",
        "no-void": "warn",
        "no-whitespace-before-property": "warn",
        "object-curly-newline": "warn",
        "object-curly-spacing": [
            "warn",
            "always"
        ],
        "object-property-newline": [
            "warn",
            {
                allowAllPropertiesOnSameLine: true
            }
        ],
        "object-shorthand": "warn",
        "one-var": [
            "warn",
            "never"
        ],
        "operator-linebreak": [
            "warn",
            "after"
        ],
        "padded-blocks": [
            "warn",
            "never"
        ],
        "padding-line-between-statements": [
            "warn",
            {
                blankLine: "always",
                prev: "*",
                next: "multiline-block-like"
            },
            {
                blankLine: "always",
                prev: "multiline-block-like",
                next: "*"
            },
            {
                blankLine: "any",
                prev: "multiline-block-like",
                next: [
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
            "as-needed"
        ],
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
        "yield-star-spacing": "warn",
        yoda: "warn"
    },
    overrides: [
        {
            files: [
                "*.js",
                "*.jsx"
            ],
            rules: {
                "valid-typeof": "error"
            }
        },
        {
            files: [
                "*.ts",
                "*.tsx"
            ],
            rules: {
                "@typescript-eslint/explicit-member-accessibility": [
                    "warn",
                    {
                        accessibility: "explicit"
                    }
                ],
                "@typescript-eslint/explicit-function-return-type": [
                    "warn",
                    {
                        allowExpressions: true
                    }
                ],
                "jsdoc/no-types": [
                    "warn",
                    {
                        contexts: [
                            "any"
                        ]
                    }
                ],
                "jsdoc/require-param-type": "off",
                "jsdoc/require-returns-type": "off",
                "@typescript-eslint/await-thenable": "warn",
                "@typescript-eslint/no-throw-literal": "warn",
                "@typescript-eslint/no-floating-promises": "off",
                "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
                "@typescript-eslint/no-unnecessary-qualifier": "warn",
                "@typescript-eslint/no-unnecessary-type-arguments": "warn",
                "@typescript-eslint/no-unnecessary-type-assertion": "warn",
                "@typescript-eslint/prefer-includes": "warn",
                "@typescript-eslint/prefer-nullish-coalescing": "warn",
                "@typescript-eslint/prefer-string-starts-ends-with": "warn",
                "@typescript-eslint/restrict-plus-operands": [
                    "warn",
                    {
                        checkCompoundAssignments: true
                    }
                ],
                "@typescript-eslint/return-await": "warn",
                "@typescript-eslint/unbound-method": "warn",
                "@typescript-eslint/tslint/config": [
                    "warn",
                    {
                        lintFile: join(__dirname, "tslint.json")
                    }
                ]
            }
        }
    ]
};
