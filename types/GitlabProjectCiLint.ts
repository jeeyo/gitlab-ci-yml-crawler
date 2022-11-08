import { schema as GitlabJobDefinitionsWithNameAndStage } from './GitlabJobDefinitionsWithNameAndStage';
import z from 'zod';

export const schema = z.object({
  valid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  merged_yaml: z.string().nullable(),
  includes: z.array(
    z.object({
      context_project: z.string().nullable(),
      context_sha: z.string().nullable(),
      type: z.string(),
      location: z.string(),
      blob: z.string().nullable(),
      raw: z.string(),
      extra: z.object({
          project: z.string().optional(),
          ref: z.string().optional(),
      }),
    }),
  ).nullable(),
  jobs: z.array(GitlabJobDefinitionsWithNameAndStage.passthrough()),
});
