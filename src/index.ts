import { green, red, yellow } from "colors";
import * as sh from "shelljs";
import * as node_fs from "fs";
import * as cluster from "cluster";
import { exec } from "child_process";

/**
 * This is a CLI tool helps you do execute cmds per given folder. If you try to do the same
 * with a normal cd command, it will do it in the wrong folder. So this tool simply
 * navigates to the proper folders and does `your command`. That's it. #ez #boring
 */
export async function eisd(
    commandToExecute: string,
    directoriesToUse: string[],
    allowFailures = false,
    aSynchronous = false
) {
    if (!commandToExecute) {
        process.stdout.write(red("ERROR: No command given..\n"));
        throw new Error("No command found.");
    }

    if (!directoriesToUse.length) {
        process.stdout.write(red("ERROR: No directories given..\n"));
        throw new Error("No directories found.");
    }

    const reallyAllowFailures = aSynchronous ? true : allowFailures;
    const { directoriesSucces, directoriesFailed } = await startMaster(
        commandToExecute,
        directoriesToUse,
        reallyAllowFailures,
        aSynchronous
    );

    if (directoriesSucces.length) {
        process.stdout.write(green(`Done executing '${commandToExecute}' in the following directories:`));
        process.stdout.write("\n");
        process.stdout.write(green(directoriesSucces.join(", ")));
        process.stdout.write("\n");
    }

    if (directoriesFailed.length) {
        process.stdout.write("\n");
        process.stdout.write(red(`Failed executing '${commandToExecute}' in the following directories:`));
        process.stdout.write("\n");
        process.stdout.write(green(directoriesFailed.join(", ")));
        process.stdout.write("\n");
        process.exit(1);
    }
}

type WorkResult = {
    directory: string;
    result: "ERROR" | "SUCCESS";
};

export function startMaster(
    commandToExecute: string,
    directoriesToUse: string[],
    allowFailures = false,
    aSynchronous = false
): Promise<{ directoriesSucces: string[]; directoriesFailed: string[] }> {
    return new Promise(resolve => {
        let directoriesToDo = directoriesToUse.length;
        const directoriesSucces: string[] = [];
        const directoriesFailed: string[] = [];

        if (aSynchronous) while (startWorker()) {}
        else startWorker();

        cluster.on("message", (worker: cluster.Worker, message: WorkResult) => {
            worker.kill();
            directoriesToDo--;

            message.result === "SUCCESS"
                ? directoriesSucces.push(message.directory)
                : directoriesFailed.push(message.directory);

            // No more directories or we there is a failure and we don't allow any? Resolve!
            if (!directoriesToDo || (!allowFailures && directoriesFailed.length)) {
                resolve({ directoriesSucces, directoriesFailed });
            } else {
                startWorker();
            }
        });
    });

    /**
     * Returns if there was a worker started
     */
    function startWorker() {
        return !!directoriesToUse.length && cluster.fork({ commandToExecute, directory: directoriesToUse.shift() });
    }
}

function executeWork(commandToExecute: string, directory: string) {
    const result: WorkResult = { directory, result: "SUCCESS" };

    try {
        node_fs.accessSync(directory, node_fs.constants.F_OK & node_fs.constants.R_OK);
    } catch (e) {
        process.stdout.write(red(`ERROR: Could not access path "${directory}"`));
        result.result = "ERROR";

        process.stdout.write("\n\n");
        process.send!(result);
        process.exit(1);
    }

    sh.cd(directory);

    console.log(yellow(`Executing command "${commandToExecute}" in: ${directory}`));

    const child = exec(commandToExecute);

    child.stdout.on("data", text => {
        process.stdout.write(text);
    });

    child.stderr.on("data", error => {
        result.result = "ERROR";
        console.error(red(`Error when executing "${commandToExecute}" in: ${directory}`));
        process.stdout.write(error);
    });

    // Use stderr.on("end") since it's always being called last, which is not the case for stdout.on("end")
    child.stderr.on("end", () => {
        result.result === "SUCCESS"
            ? process.stdout.write(green("Done"))
            : process.stdout.write(red("Done with errors"));

        process.stdout.write("\n\n");
        process.send!(result);
    });
}

if (cluster.isWorker) {
    executeWork(process.env.commandToExecute, process.env.directory);
}
