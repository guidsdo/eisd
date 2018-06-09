# Execute In SubDirectories
Execute your favorite command in SubDirectories. Use it like: `eisd '[command]' [subdirs...]` (Example: `eisd 'yarn build' client server scripts`)

[Click here for the yarn install version!](https://github.com/guidojo/yisd)
[Click here for the npm install version!](https://github.com/guidojo/nisd)

## Usage
```
  Usage: eisd <command> [options] <directories...>

  Options:
    -a, --async        Execute commands async across all folders, output will be a mess
    -e, --allowErrors  Allow errors (at default we stop when there is one). NOTE: always true when in async mode!
    -h, --help         output usage information
```

## Example package.json
```json
{
  "name": "Root",
  "version": "0.0.1",
  "description": "mainFolder",
  "scripts": {
    "postinstall": "yisd client server",
    "build": "eisd 'yarn build' client server scripts"
  }
}
```

## Compatibility
Works on Linux and Mac, should also work on Windows (will test it soon). If not, create an issue and I will fix it. :-)
