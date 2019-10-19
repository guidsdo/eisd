import { red } from "colors";
import * as commander from "commander";
import { eisd } from ".";

commander
    .usage("<command> [options] <directories...>")
    .arguments("<command> [options] <directories...>")
    .option("-a, --async", "Execute commands async across all folders, output will be a mess")
    .option(
        "-e, --allowErrors",
        "Allow errors (at default we stop when there is one). NOTE: always true when in async mode"
    )
    .option("-y, --yarnWorkspaces", "Use yarn workspaces for the directories to run the command in")
    .option(
        "-d, --envDirectories [environment_key]",
        "Environment variable that contains the directories, for example a package.json config var would be: npm_config_myVar"
    )
    .option("-v, --verbose", "More verbose output")
    .parse(process.argv);

if (!commander.args.length) {
    console.error(red("ERROR: No command given..\n"));
    throw new Error("No command found.");
}

const commandToExecute = commander.args.shift()!;
const directoriesToUse = commander.args;
const allowErrors = commander.allowErrors === true;
const aSynchronous = commander.async === true;
const yarnWorkspaces = commander.yarnWorkspaces === true;
const envVariable: string = commander.envDirectories || "";
const verbose = commander.verbose === true;

eisd({ commandToExecute, directoriesToUse, allowErrors, aSynchronous, envVariable, yarnWorkspaces, verbose });
