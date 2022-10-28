import { Container } from 'inversify';

import * as IoC from '../types/ioc';

import { GitlabRepository } from '../repositories/GitlabRepository';
import { CouchbaseRepository } from '../repositories/CouchbaseRepository';
import winston from 'winston';
import minimatch from 'minimatch';

(async () => {

  const options: IoC.IOptions = {
    gitlabEndpoint: process.env.GITLAB_API_ENDPOINT || '',
    gitlabToken: process.env.GITLAB_API_TOKEN || '',
    gitlabRepoGlob: process.env.GITLAB_REPO_GLOB || '*/**',
    dbHost: process.env.DB_HOST || 'couchbase://localhost',
    dbUsername: process.env.DB_USER || '',
    dbPassword: process.env.DB_PASS || '',
    dbBucket: process.env.DB_BUCKET || 'gitlab-ci-yml-crawler',
  };

  const app = new Container();
  app.bind<IoC.IOptions>(IoC.TYPES.IOptions).toConstantValue(options);
  app.bind<IoC.IGitlabRepository>(IoC.TYPES.IGitlabRepository).to(GitlabRepository);
  app.bind<IoC.ILogger>(IoC.TYPES.ILogger).toConstantValue(
    winston.createLogger({
      level: 'debug',
      format: winston.format.json(),
      defaultMeta: {
        service: process.env.npm_package_name,
        version: process.env.npm_package_version,
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    })
  );
  app.bind<IoC.IDatabase>(IoC.TYPES.IDatabase).to(CouchbaseRepository);

  const gitlabRepo = app.get<IoC.IGitlabRepository>(IoC.TYPES.IGitlabRepository);
  const appOptions = app.get<IoC.IOptions>(IoC.TYPES.IOptions);
  const couchbaseRepo = app.get<IoC.IDatabase>(IoC.TYPES.IDatabase);

  // filter by repository name with specified glob pattern
  const filterWithGlob = (repos: GitlabProject[]) => {

    if (appOptions.gitlabRepoGlob.length > 0) {
      return repos.filter(repo => minimatch(repo.path_with_namespace, appOptions.gitlabRepoGlob));
    }

    return repos;
  };

  // get all repositories
  const repositories = filterWithGlob(await gitlabRepo.getRepositories());

  for (const repo of repositories) {
    console.log(`Retrieving ${repo.path_with_namespace}`);
    couchbaseRepo.upsert(repo.path_with_namespace.toLowerCase(), await gitlabRepo.getGitlabCiYml(repo.id));
  };

})();
