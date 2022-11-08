import { Container } from 'inversify';

import * as IoC from '../types/ioc';

import { GitlabRepository } from '../repositories/GitlabRepository';
import { CouchbaseRepository } from '../repositories/CouchbaseRepository';
import { CrawlerService } from '../services/CrawlerService';
import winston from 'winston';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

(async () => {

  const app = new Container();
  app.bind<IoC.IOptions>(IoC.TYPES.IOptions).toConstantValue(
    yargs(hideBin(process.argv))
      .option({
        'gitlab.endpoint': { type: 'string', default: 'https://gitlab.agodadev.io/api/v4/' },
        'gitlab.token': { type: 'string' },
        'gitlab.glob': { type: 'string', default: '**/**' },
        'db.host': { type: 'string', default: 'couchbase://localhost' },
        'db.user': { type: 'string' },
        'db.password': { type: 'string' },
        'db.bucket': { type: 'string', default: 'gitlab-ci-yml-crawler' },
        'loglevel': { type: 'string', default: 'info' },
      })
      .coerce(['gitlab', 'db'], opt => ({ ...opt }))
      .parseSync()
  );
  app.bind<IoC.IGitlabRepository>(IoC.TYPES.IGitlabRepository).to(GitlabRepository);
  app.bind<IoC.ILogger>(IoC.TYPES.ILogger).toConstantValue(
    winston.createLogger({
      level: app.get<IoC.IOptions>(IoC.TYPES.IOptions).loglevel,
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
