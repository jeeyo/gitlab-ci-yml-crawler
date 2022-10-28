import { schema as GitlabJobDefinitions } from './GitlabJobDefinitions';
import z from 'zod';

export const schema = GitlabJobDefinitions.merge(z.object({
  name: z.string(),
  stage: z.string(),
}));
