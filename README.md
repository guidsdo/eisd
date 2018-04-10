# Execute In SubDirectories
Execute your favorite command in SubDirectories. Use it like: `eisd '[command]' [subdirs...]` (Example: `eisd 'yarn build' client server scripts`)

[Click here for the yarn install version!](https://github.com/guidojo/yisd)
[Click here for the npm install version!](https://github.com/guidojo/nisd)

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
