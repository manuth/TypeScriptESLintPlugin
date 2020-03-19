const Path = require("path");

module.exports = {
    "extends": Path.join(__dirname, "..", ".eslintrc.base.js"),
    "rules": {
        "no-debugger": "warn",
        "no-empty-character-class": "off"
    }
};
