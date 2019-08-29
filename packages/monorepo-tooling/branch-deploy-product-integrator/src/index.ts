import chalk from 'chalk';
import meow from 'meow';
import simpleGit from 'simple-git/promise';

//@ts-ignore
import installFromCommit from '@atlaskit/branch-installer';

//@ts-ignore
import fetch from 'isomorphic-fetch';

// type Flags = {

// };
// prettier-ignore
const HELP_MSG = `
  🚀 Atlaskit branch deploy product integrator™ 🚀

   ${chalk.green('Options')}
     ${chalk.yellow('--branchPrefix')} Prefix for the generated branch [default=atlaskit-branch-deploy/]
     ${chalk.yellow('--workingPath')}  Working path of the product repo installing a branch in [default=./]
     ${chalk.yellow('--atlaskitCommitHash')} Atlaskit commit hash of the branch deploy that needs to be installed
     ${chalk.yellow('--atlaskitBranchName')} The name of the Atlaskit branch being installed
     ${chalk.yellow('--packageEngine')} The package manager to use, currently only tested with Bolt and yarn [default=yarn]
     ${chalk.yellow('--packages')} comma delimited list of packages to install branch deploy of
`;

// const getGitUrl = async (gitUrl?: string): Promise<string> => {
//   if (gitUrl) {
//     return gitUrl;
//   }
//   return getOriginUrl();
// };

// const getCommit = async (commit?: string): Promise<string> => {
//   if (commit) {
//     return commit;
//   }
//   return getRef();
// };

export async function run() {
  const cli = meow(HELP_MSG, {
    flags: {
      branchPrefix: {
        type: 'string',
        default: 'atlaskit-branch-deploy/',
      },
      workingPath: {
        type: 'string',
        default: './',
      },
      atlaskitBranchName: {
        type: 'string',
      },
      packageEngine: {
        type: 'string',
        default: 'yarn',
      },
      atlaskitCommitHash: {
        type: 'string',
      },
      packages: {
        type: 'string',
      },
    },
  });
  const {
    workingPath,
    atlaskitBranchName,
    atlaskitCommitHash,
    branchPrefix,
    packageEngine,
    packages,
  } = cli.flags;
  const git = simpleGit(workingPath);
  const branchName = `${branchPrefix}${atlaskitBranchName}`;

  const remote = await git.listRemote(['--get-url']);

  if (remote.indexOf('atlassian/atlaskit-mk-2') > -1) {
    throw new Error('Working path should not be the Atlaskit repo!');
  }
  let branchExists;

  try {
    await git.revparse(['--verify', `origin/${branchName}`]);
    branchExists = true;
  } catch (error) {
    branchExists = false;
  }

  if (branchExists) {
    await git.checkout(branchName);
    await git.pull('origin', branchName);
  } else {
    await git.checkoutBranch(branchName, 'origin/master');
  }

  await installFromCommit(atlaskitCommitHash, {
    engine: packageEngine,
    cmd: 'upgrade',
    packages: packages,
    timeout: 30 * 60 * 1000, // Takes between 15 - 20 minutes to build a AK branch deploy
    interval: 30000,
  });

  await git.add(['./']);

  const commitInfo = await (await fetch(
    `https://api.bitbucket.org/2.0/repositories/atlassian/atlaskit-mk-2/commit/${atlaskitCommitHash}`,
    {},
  )).json();
  const emailRegex = /^.*<([A-z]+@atlassian.com)>$/;

  let authorEmail = 'no-reply@atlassian.com';
  if (commitInfo.author.raw.match(emailRegex)) {
    authorEmail = commitInfo.author.raw.replace(emailRegex, '$1');
  }

  // prettier-ignore
  const commitMessage = `Upgraded to Atlaskit changes on branch ${cli.flags.atlaskitBranchName}

https://bitbucket.org/atlassian/atlaskit-mk-2/branch/${cli.flags.atlaskitBranchName}

This commit was auto-generated.
  `;

  await git.commit(commitMessage, [
    '--author',
    `BOT Atlaskit branch deploy integrator <${authorEmail}>`,
  ]);
  await git.push('origin', branchName);
}
