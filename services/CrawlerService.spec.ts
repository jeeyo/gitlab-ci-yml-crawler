import { Mock, It, Times } from 'moq.ts';
import { IDatabase, IGitlabRepository, IOptions, ILogger, TYPES } from '../types/ioc';
import { schema as GitlabProjectCiLint } from '../types/GitlabProjectCiLint';
import { CrawlerService } from './CrawlerService';
import z from 'zod';

describe('CrawlerService', () => {

  test('should crawl correctly', async () => {

    const fakeRepoList: GitlabProject[] = [{
      id: 1234,
      archived: false,
      mirror: false,
      default_branch: 'main',
      empty_repo: false,
      ssh_url_to_repo: 'git@gitlab.com:fake-group/fake-project.git',
      http_url_to_repo: 'https://gitlab.com/fake-group/fake-project.git',
      forked_from_project: false,
      repository_access_level: 'enabled',
      merge_requests_access_level: 'enabled',
      merge_method: 'merge',
      path_with_namespace: 'fake-group/fake-project',
    }];

    const fakeFirstRepoYml: z.infer<typeof GitlabProjectCiLint> = {
      valid: true,
      errors: [],
      warnings: [],
      includes: [],
      jobs: []
    };

    const mockGitlab = new Mock<IGitlabRepository>()
                .setup(instance => instance.getRepositories())
                .returnsAsync(fakeRepoList)
                .setup(instance => instance.getGitlabCiYml(It.IsAny()))
                .returnsAsync(fakeFirstRepoYml);

    const mockDb = new Mock<IDatabase>()
                .setup(instance => instance.upsert(It.IsAny(), It.IsAny()))
                .returnsAsync();

    const mockOptions = new Mock<IOptions>()
                .setup(instance => instance.gitlabRepoGlob)
                .returns('');

    const mockLogger = new Mock<ILogger>()
                .setup(instance => instance.debug(It.IsAny()))
                .returns()
                .setup(instance => instance.info(It.IsAny()))
                .returns();

    const underTest = new CrawlerService(mockGitlab.object(), mockDb.object(), mockOptions.object(), mockLogger.object());
    await underTest.crawl();

    mockGitlab.verify(instance => instance.getRepositories(), Times.Once());
    mockGitlab.verify(instance => instance.getGitlabCiYml(fakeRepoList[0].id), Times.Once());

    mockDb.verify(instance => instance.upsert(fakeRepoList[0].path_with_namespace.toLowerCase(), fakeFirstRepoYml), Times.Once());
  });
});
