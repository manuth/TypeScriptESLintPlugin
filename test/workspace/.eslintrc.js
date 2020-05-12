const Path = require("path");

module.exports = {
    extends: Path.join(__dirname, "..", ".eslintrc.base.js"),
    parserOptions: {
        project: Path.join(__dirname, "tsconfig.json")
    },
    "rules": {
        "no-debugger": "off",
        "no-empty-character-class": "warn"
    }
};
