import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { ICrawlerService, IDatabase, IGitlabRepository, IOptions, ILogger, TYPES } from '../types/ioc';
import minimatch from 'minimatch';

@injectable()
export class CrawlerService implements ICrawlerService {

  private _gitlab: IGitlabRepository;
  private _db: IDatabase;
  private _options: IOptions;
  private _logger: ILogger;

  public constructor(
    @inject(TYPES.IGitlabRepository) gitlab: IGitlabRepository,
    @inject(TYPES.IDatabase) db: IDatabase,
    @inject(TYPES.IOptions) options: IOptions,
    @inject(TYPES.ILogger) logger: ILogger
  ) {
    this._gitlab = gitlab;
    this._db = db;
    this._options = options;
    this._logger = logger;
  }

  // filter by repository name with specified glob pattern
  private filterWithGlob(repos: GitlabProject[]) {

    if (this._options.gitlabRepoGlob.length > 0) {
      return repos.filter(repo => minimatch(repo.path_with_namespace, this._options.gitlabRepoGlob));
    }

    return repos;
  }

  public async crawl() {

    // get all repositories
    const repositories = this.filterWithGlob(await this._gitlab.getRepositories());

    // sequentially upsert CI to database
    for (const repo of repositories) {

      this._logger.info(`Crawling ${repo.path_with_namespace} (${repo.id})`);

      const ci = await this._gitlab.getGitlabCiYml(repo.id);
      await this._db.upsert(repo.path_with_namespace.toLowerCase(), ci);

      this._logger.info(`Finished crawling ${repo.path_with_namespace} (${repo.id})`);
    };
  }
}
