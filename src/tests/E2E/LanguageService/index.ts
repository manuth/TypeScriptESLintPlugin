suite(
    "Language-Service",
    () =>
    {
        require("./General.test");
        require("./Diagnostics.test");
        require("./Config.test");
        require("./MultiRoot.test");
    });
