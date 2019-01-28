# Execute In SubDirectories
Execute your favorite command in SubDirectories. Use it like: `eisd <command> [options] <directories...>` (Example: `eisd 'yarn build' --async client server scripts`)

[![npm version](https://badge.fury.io/js/eisd.svg)](https://badge.fury.io/js/eisd)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

[Click here for the yarn install version!](https://www.npmjs.com/package/yisd)

[Click here for the npm install version!](https://www.npmjs.com/package/nisd)

## Usage
```
  Usage: eisd <command> [options] <directories...>

  Options:
    -a, --async                             Execute commands async across all folders, output will be a mess
    -e, --allowErrors                       Allow errors (at default we stop when there is one). NOTE: always true when in async mode
    -d, --envDirectories [environment_key]  Environment variable that contains the directories, for example a package.json config car would be: npm_config_myVar
    -h, --help                              output usage information
```

## Examples
Cli:
`eisd 'yarn install' --ignoreRegex '^warning' --async client server testSetup/mockServer`

Package.json:
```json
{
  "name": "Root",
  "version": "0.0.1",
  "description": "mainFolder",
  "scripts": {
    "postinstall": "yisd client server",
    "build": "eisd 'yarn build' client server scripts",
    "lint": "eisd 'npm run lint' -d npm_package_config_components"
  },
  "config": {
    "components": "client server scripts"
  }
}
```

## Compatibility
Works on Linux and Mac, should also work on Windows (will test it soon). If not, create an issue and I will fix it. :-)
