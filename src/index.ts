import clear from "clear";

import chalk from "chalk";
import figlet from "figlet";

import inquirer, { Question } from "inquirer";
import { execSync } from "child_process";

import fs from "fs";
import path from "path";

clear();
console.log(
    chalk.green(
        figlet.textSync("create-zp-vue-app")
    )
);

console.log(chalk.greenBright("The Vue App creator based on the Zero Penny Architecture"));

const questions: Question[] = [
    {
        type: "input",
        name: "projectName",
        message: "What's the name of your project?",
        default: "my-awesome-app",
    },
    {
        type: "input",
        name: "repositoryURL",
        message: "What's the URL of your gitlab repository for this project?",
        default: "git@gitlab.com:my-company/my-awesome-app.git",
        validate: async (input: string): Promise<string | boolean> => {
            return /(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|\#[-\d\w._]+?)$/.test(input) ? true : "Please input a valid git URL";
        }
    },
    {
        type: "input",
        name: "herokuAppName",
        message: "What's the name of your heroku app?",
        default: "my-awesome-app",
    },
    {
        type: "confirm",
        name: "runInstall",
        message: "Do you want to run `yarn install` after creating the project?",
        default: false,
    }
];

inquirer.prompt(questions).then(answers => {
    const { projectName, repositoryURL, herokuAppName, runInstall } = answers;
    const vueFrontendTemplateURL = "git@github.com:zero-penny-architecture/vuejs-starter-kit.git"

    let command: string;

    console.log(chalk.yellow("Cloning the template repository..."));
    command = `git clone --depth 10 '${vueFrontendTemplateURL}' ${projectName}`;
    execSync(command, { stdio: 'inherit' });

    console.log(chalk.yellow("Setting up the template..."));

    try {
        command = `git remote set-url origin '${repositoryURL}'`;
        console.log(command);
        execSync(command, { cwd: `./${projectName}`, stdio: 'inherit' });
    } catch (error) {
        console.error(error)
    }
    if (runInstall) {
        console.log(chalk.yellow(`Running "yarn install"`));
        execSync(`yarn install`, { cwd: `./${projectName}`, stdio: 'inherit' });
    }

    const repo = repositoryURL as string;
    const gitlabProjectPath = repo.slice(repo.lastIndexOf(":") + 1, repo.length - 4);
    const gitlabCIPath = `./${projectName}/.gitlab-ci.yml`;
    let gitlabCI = fs.readFileSync(gitlabCIPath).toString("utf8")
        .replace(`"app-name-for-production"`, `"${herokuAppName}"`)
        .replace(`"app-name-for-development"`, `"${herokuAppName}-dev"`)
        .replace("your-gitlab-project-path", gitlabProjectPath);
    fs.writeFileSync(gitlabCIPath, gitlabCI);

    console.log(chalk.green(`DONE, have fun with your newly created app ;)`));
});