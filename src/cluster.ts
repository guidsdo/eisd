import { green, red, yellow } from "colors";
import * as sh from "shelljs";
import * as node_fs from "fs";
import * as cluster from "cluster";

type WorkResult = {
    directory: string;
    result: "ERROR" | "SUCCESS";
};

export function startMaster(
    commandToExecute: string,
    directoriesToUse: string[],
    allowFailures = false,
    aSynchronous = false,
    verbose = false
): Promise<{ directoriesSucces: string[]; directoriesFailed: string[] }> {
    return new Promise(resolve => {
        let directoriesToDo = directoriesToUse.length;
        const directoriesSucces: string[] = [];
        const directoriesFailed: string[] = [];

        if (aSynchronous) while (startWorker()) { }
        else startWorker();

        cluster.on("message", (worker: cluster.Worker, message: WorkResult) => {
            worker.kill();
            directoriesToDo--;

            message.result === "SUCCESS"
                ? directoriesSucces.push(message.directory)
                : directoriesFailed.push(message.directory);

            // No more directories or there is a failure (in synchronous mode) and we don't allow any? Resolve!
            if (!directoriesToDo || (!aSynchronous && !allowFailures && directoriesFailed.length)) {
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
        return !!directoriesToUse.length && cluster.fork({ commandToExecute, directory: directoriesToUse.shift(), verbose: verbose.toString() });
    }
}

function executeWork(commandToExecute: string, directory: string, verbose: boolean) {
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

    const execOutput = sh.exec(commandToExecute);

    result.result = execOutput.code === 0 ? "SUCCESS" : "ERROR";

    if (verbose) {
        result.result === "SUCCESS"
            ? process.stdout.write(green(`Done with executing "${commandToExecute}" in ${directory}`))
            : process.stdout.write(red(`Done with errors after executing "${commandToExecute}" in ${directory}`));

        process.stdout.write("\n\n");
    }

    process.send!(result);
}

if (cluster.isWorker) {
    executeWork(process.env.commandToExecute, process.env.directory, process.env.verbose === "true");
}
