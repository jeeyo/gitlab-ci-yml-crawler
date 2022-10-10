import { schema as GitlabJobDefinitions } from './GitlabJobDefinitions';
import z from 'zod';

export const GitlabJobDefinitionsWithNameAndStage = GitlabJobDefinitions.merge(z.object({
  name: z.string(),
  stage: z.string(),
}));
