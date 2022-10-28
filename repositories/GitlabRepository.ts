import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { IGitlabRepository, IOptions, ILogger, TYPES } from '../types/ioc';
import { schema as GitlabProjectCiLint } from '../types/GitlabProjectCiLint';
import axios from 'axios';
import z from 'zod';

@injectable()
export class GitlabRepository implements IGitlabRepository {

  private _options: IOptions;
  private _logger: ILogger;

  public constructor(
    @inject(TYPES.IOptions) options: IOptions,
    @inject(TYPES.ILogger) logger: ILogger
  ) {
    this._options = options;
    this._logger = logger;
  }

  private async getJson<T>(url: string, opts?: { paginate: boolean }, schema?: z.ZodType<T>): Promise<T> {

    try {

      // fetch for result
      const response = await axios.get(new URL(url, this._options.gitlabEndpoint).href, {
        headers: {
          'PRIVATE-TOKEN': this._options.gitlabToken,
          'Content-Type': 'application/json',
        },
      });

      const result = response.data as T;

      // validate schema if specified
      if (typeof schema !== 'undefined') {
        schema.parse(result);
      }

      // if the request is paginated, recursively fetch next pages
      if (opts && opts.paginate && Array.isArray(result)) {
        if ('x-next-page' in response.headers) {

          const nextpage = parseInt(response.headers['x-next-page']);
          if (isNaN(nextpage)) {
            return result;
          }

          const nextresult = await this.getJson<T>(`${url}&page=${nextpage}`, opts, schema) as T[];
          result.push(...nextresult);
        }
      }

      return result;

    } catch(err) {
      this._logger.error(`GitLab getJson error`, { err });
      throw err;
    }
  }

  // https://github.com/renovatebot/renovate/blob/4006ef4667cc416d40f88b0be6ba24690def8500/lib/modules/platform/gitlab/index.ts#L144
  // Get all repositories that the user has access to
  public async getRepositories(): Promise<GitlabProject[]> {

    this._logger.info('Autodiscovering GitLab repositories');
    try {

      const url = `projects?membership=true&per_page=100&min_access_level=30&archived=false`;
      const res = await this.getJson<GitlabProject[]>(url, {
        paginate: true,
      });

      this._logger.info(`Discovered ${res.length} project(s)`);
      return res
        .filter((repo) => !repo.mirror && !repo.archived)
        .map((repo) => repo);

    } catch (err) {
      this._logger.error(`GitLab getRepositories error`, { err });
      throw err;
    }
  }

  public async getGitlabCiYml(project_id: number): Promise<z.infer<typeof GitlabProjectCiLint>> {

    this._logger.debug(`Fetching CI from project with ID ${project_id}`);
    try {

      const url = `projects/${project_id}/ci/lint?include_jobs=true`;
      const res = await this.getJson<z.infer<typeof GitlabProjectCiLint>>(url, undefined, GitlabProjectCiLint);

      this._logger.debug(`Done fetching CI from project with ID ${project_id}`);
      return GitlabProjectCiLint.passthrough().parse(res);

    } catch (err) {
      this._logger.error(`GitLab getRepositories error`, { err });
      throw err;
    }
  }
}
