import { red } from "colors";
import * as commander from "commander";
import { eisd } from ".";

commander
    .usage("<command> [options] <directories...>")
    .arguments("<command> [options] <directories...>")
    .option("-e, --allowErrors", "Allow errors (at default we stop when there is one)")
    .parse(process.argv);

if (!commander.args.length) {
    console.error(red("ERROR: No command given..\n"));
    throw new Error("No command found.");
}

const commandToExecute = commander.args.shift()!;
const directoriesToUse = commander.args;
const allowErrors = commander.allowErrors === true;

// Prevent triggering eisd twice
if (!process.env._runnedBefore) {
    process.env._runnedBefore = true;
    eisd(commandToExecute, directoriesToUse, allowErrors);
}
