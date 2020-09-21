const eslintBase = require("@manuth/eslint-plugin-typescript");
const mock = require("mock-require");

let originalPlugins = [
    ...eslintBase.configs["recommended-requiring-type-checking"].plugins,
    "@manuth/typescript"
];

let plugins = originalPlugins.map(
        (plugin) =>
        {
            let result = /^(?:(@.*?)?(?:\/|$))?(.*)$/.exec(plugin);
            return `${result[1] ? `${result[1]}/` : ""}eslint-plugin${result[2] ? `-${result[2]}` : ""}`;
        });

mock.stopAll();

for (let plugin of plugins)
{
    mock(plugin, require(plugin));
}

module.exports = {
    env: {
        es6: true,
        node: true
    },
    root: true,
    extends: [
        require.resolve("../.eslintrc")
    ],
    ignorePatterns: [],
    parser: require.resolve("@typescript-eslint/parser"),
    parserOptions: {
        project: "tsconfig.json",
        sourceType: "module"
    }
};
