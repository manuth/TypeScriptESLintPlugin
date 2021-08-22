const ESLintPresets = require("@manuth/eslint-plugin-typescript");
const mock = require("mock-require");
const { fileName } = require("types-tsconfig");

let originalPlugins = [
    ...ESLintPresets.configs[ESLintPresets.PresetName.RecommendedWithTypeChecking].plugins,
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
    root: true,
    extends: [
        require.resolve("../.eslintrc")
    ],
    ignorePatterns: [],
    parser: require.resolve("@typescript-eslint/parser"),
    parserOptions: {
        project: fileName,
        sourceType: "module"
    }
};
