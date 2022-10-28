import { Container } from 'inversify';

import * as IoC from '../types/ioc';

import { GitlabRepository } from '../repositories/GitlabRepository';
import { CouchbaseRepository } from '../repositories/CouchbaseRepository';
import { CrawlerService } from '../services/CrawlerService';
import winston from 'winston';

(async () => {

  const options: IoC.IOptions = {
    gitlabEndpoint: process.env.GITLAB_API_ENDPOINT || '',
    gitlabToken: process.env.GITLAB_API_TOKEN || '',
    gitlabRepoGlob: process.env.GITLAB_REPO_GLOB || '*/**',
    dbHost: process.env.DB_HOST || 'couchbase://localhost',
    dbUsername: process.env.DB_USER || '',
    dbPassword: process.env.DB_PASS || '',
    dbBucket: process.env.DB_BUCKET || 'gitlab-ci-yml-crawler',
    logLevel: process.env.LOG_LEVEL || 'info',
  };

  const app = new Container();
  app.bind<IoC.IOptions>(IoC.TYPES.IOptions).toConstantValue(options);
  app.bind<IoC.IGitlabRepository>(IoC.TYPES.IGitlabRepository).to(GitlabRepository);
  app.bind<IoC.ILogger>(IoC.TYPES.ILogger).toConstantValue(
    winston.createLogger({
      level: app.get<IoC.IOptions>(IoC.TYPES.IOptions).logLevel,
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
  app.bind<IoC.ICrawlerService>(IoC.TYPES.ICrawlerService).to(CrawlerService);

  const crawler = app.get<IoC.ICrawlerService>(IoC.TYPES.ICrawlerService);
  await crawler.crawl();

})();
