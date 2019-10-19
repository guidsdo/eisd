import { green, red } from "colors";
import { startMaster } from "./cluster";
import { checkYarnAvailability, getYarnWorkspaces } from "./yarnHelpers";

type EisdConfig = {
    commandToExecute: string;
    directoriesToUse: string[];
    allowErrors?: boolean;
    aSynchronous?: boolean;
    envVariable?: string;
    yarnWorkspaces?: boolean;
    verbose?: boolean;
};

/**
 * This is a CLI tool helps you do execute cmds per given folder. If you try to do the same
 * with a normal cd command, it will do it in the wrong folder. So this tool simply
 * navigates to the proper folders and does `your command`. That's it. #ez #boring
 */
export async function eisd(config: EisdConfig) {
    // Prevent triggering eisd twice because the cluster-worker will rerun all the code
    if (process.env._runnedBefore) return;
    process.env._runnedBefore = "true";

    if (!config.commandToExecute) {
        process.stdout.write(red("ERROR: No command given..\n"));
        throw new Error("No command found.");
    }

    if (config.yarnWorkspaces) {
        checkYarnAvailability();
        config.directoriesToUse.push(...getYarnWorkspaces());
    }

    if (config.envVariable) {
        if (!process.env[config.envVariable]) {
            process.stdout.write(red(`ERROR: No environment value found on "process.env.${config.envVariable}"..\n`));
            throw new Error(`Invalid env variable given "${config.envVariable}".`);
        }

        const directories = (process.env[config.envVariable] as string).split(" ");
        config.directoriesToUse.push(...directories);
    }

    if (!config.directoriesToUse.length) {
        process.stdout.write(red("ERROR: No directories given..\n"));
        throw new Error("No directories found.");
    }

    if (config.verbose) {
        console.log("Directories:", config.directoriesToUse);
        process.stdout.write("\n");
    }

    const { directoriesSucces, directoriesFailed } = await startMaster(
        config.commandToExecute,
        config.directoriesToUse,
        config.allowErrors,
        config.aSynchronous,
        config.verbose
    );

    if (config.verbose && directoriesSucces.length) {
        process.stdout.write(green(`Done executing '${config.commandToExecute}' in the following directories:`));
        process.stdout.write("\n");
        process.stdout.write(directoriesSucces.join(", "));
        process.stdout.write("\n");
    }

    if (directoriesFailed.length) {
        process.stdout.write("\n");
        process.stdout.write(
            red(`Error(s) while executing '${config.commandToExecute}' in the following directories:`)
        );
        process.stdout.write("\n");
        process.stdout.write(directoriesFailed.join(", "));
        process.stdout.write("\n");
        if (!config.allowErrors) process.exit(1);
    }
}
