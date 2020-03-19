const Path = require("path");

module.exports = {
    "extends": Path.join(__dirname, "..", ".eslintrc.base.js"),
    "rules": {
        "no-debugger": "off",
        "no-empty-character-class": "warn"
    }
};
