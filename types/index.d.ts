// https://github.com/renovatebot/renovate/blob/main/lib/modules/platform/gitlab/types.ts#L52
type MergeMethod = 'merge' | 'rebase_merge' | 'ff';

interface GitlabProject {
  id: number;
  archived: boolean;
  mirror: boolean;
  default_branch: string;
  empty_repo: boolean;
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  forked_from_project: boolean;
  repository_access_level: 'disabled' | 'private' | 'enabled';
  merge_requests_access_level: 'disabled' | 'private' | 'enabled';
  merge_method: MergeMethod;
  path_with_namespace: string;
  squash_option?: 'never' | 'always' | 'default_on' | 'default_off';
}

interface GitlabProjectCILint {
  valid: boolean;
  errors: string[];
  warnings: string[];
  merged_yaml: string;
  includes: string[];
  jobs: object[]; // will be validated at runtime
}