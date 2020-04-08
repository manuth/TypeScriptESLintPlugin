# TypeScriptESLintPlugin
A plugin for TypeScript which provides eslint-reports to your IDE.

## Getting Started
First you need to have `eslint` installed.
You can install it by invoking this command:
```sh
npm install -D eslint
```

Next go ahead and install this plugin:
```
npm install -D typescript-eslint-plugin
```

As a last step open up your project's `tsconfig.json`-file and add this plugin to the settings:
```json
{
    "compilerOptions": {
        "plugins": [
            {
                "name": "typescript-eslint-plugin",
                "configFile": "./my.eslintrc.js"
            }
        ]
    }
}
```

## Configuration
You might want to change the behaviour of this plugin to your likings.
Following settings are supported:

  * `ignoreJavaScript`:  
    Allows you to disable eslint-reports in JavaScript files (default is `false`)
  * `ignoreTypeScript`:  
    Allows you to disable eslint-reports in TypeScript files (default is `false`)
  * `allowInlineConfig`:  
    Allows you to disable eslint configuration-comments (default is `true`)
  * `reportUnusedDisableDirectives`:  
    Use this setting to disable errors when useless `eslint-disable-next-line`-comments are reported (default is `true`).
  * `useEslintrc`:  
    You can disable the processing of `.eslintrc.*`-files by setting this to `false` (default is `true`)
  * `configFile`:  
    Allows you to specify a custom config-file to use (default is `undefined`)
  * `alwaysShowRuleFailuresAsWarnings`:  
    By setting this to `true` all rule-failures, regardless whether you set `warn` or `error` are represented as warnings (default is `false`)
  * `suppressWhileTypeErrorsPresent`:  
    Allows you to disable `eslint` while there are other errors present (default is `false`)
  * `suppressDeprecationWarnings`:  
    Usually this plugin reports warnings when deprecated rules are in use. Use this setting to disable this feature. (default is `false`)
  * `packageManager`:  
    Set this option either to `npm`, `pnpm` or `yarn` to load global modules correctly and get propper commands in error messages. (default is `npm`)
  * `logLevel`:  
    Allows you to set the verbosity of this plugin in the `TS Server log` either to `none`, `normal` or `verbose`. (default is `none`)

### Note
When updating the configuration of the plugin using a `ConfigurePluginRequest`, the settings made in `tsconfig.json` will presist, as `tsconfig.json`-settings have a higher priority than the dynamic settings sent using a `ConfigurePluginRequest`.  
Please let me know if this is not the behavior you'd expect.
