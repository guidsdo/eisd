import { ChildProcess } from "child_process";
import { bgBlack, green, rainbow, red, yellow } from "colors";
import * as commander from "commander";
import * as sh from "shelljs";
import * as node_fs from "fs";

/**
 * This is a CLI tool helps you do execute cmds per given folder. If you try to do the same
 * with a normal cd command, it will do it in the wrong folder. So this tool simply
 * navigates to the proper folders and does `your command`. That's it. #ez #boring
 */

commander
    .usage("<command> <directories...>")
    .arguments("<command> <directories...>")
    .parse(process.argv);

if (!commander.args.length) {
    console.error(red("ERROR: No command given..\n"));
    throw new Error("No command found.");
}

const commandToExecute = commander.args.shift();
const directoriesToUse = commander.args;
const directoriesSucces: string[] = [];
const directoriesFailed: string[] = [];

if (!directoriesToUse.length) {
    console.error(red("ERROR: No directories given..\n"));
    throw new Error("No directories found.");
}

commander.args.forEach((directory: string) => {
    try {
        node_fs.accessSync(directory, node_fs.constants.F_OK & node_fs.constants.R_OK);
    } catch (e) {
        console.log(red(`Could not access path ${directory}, continuing...`));
        directoriesFailed.push(directory);
        return;
    }

    sh.pushd(directory);

    console.log(yellow(`Executing command "${commandToExecute}" in: ${directory}`));
    sh.exec(commandToExecute);
    directoriesSucces.push(directory);

    sh.popd();
    console.log(green("Done"));
});

if (directoriesSucces.length) {
    console.log();
    console.log(green(`Done executing '${commandToExecute}' in the following directories:`));
    console.log(green(directoriesSucces.join(", ")));
}

if (directoriesFailed.length) {
    console.log();
    console.log(red(`Failed executing '${commandToExecute}' in the following directories:`));
    console.log(green(directoriesSucces.join(", ")));
}
