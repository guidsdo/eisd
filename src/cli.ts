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
    .option(
        "-d, --envDirectories [environment_key]",
        "Environment variable that contains the directories, for example a package.json config car would be: npm_config_myVar"
    )
    .parse(process.argv);

if (!commander.args.length) {
    console.error(red("ERROR: No command given..\n"));
    throw new Error("No command found.");
}

const commandToExecute = commander.args.shift()!;
const directoriesToUse = commander.args;
const allowErrors = commander.allowErrors === true;
const async = commander.async === true;
const envDirectories: string = commander.envDirectories || "";

eisd(commandToExecute, directoriesToUse, allowErrors, async, envDirectories);
