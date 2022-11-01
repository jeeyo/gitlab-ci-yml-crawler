import z from 'zod';
import { schema as GitlabProjectCiLint } from '../types/GitlabProjectCiLint';

export interface IGitlabRepository {
  getRepositories: () => Promise<GitlabProject[]>;
  getGitlabCiYml(project_id: number): Promise<z.infer<typeof GitlabProjectCiLint>>;
}

export interface IOptions {
  gitlab: {
    endpoint: string;
    token: string;
    glob: string;
  };
  db: {
    host: string;
    user: string;
    pass: string;
    bucket: string;
  };
  loglevel: string;
}

export interface ILogger {
  error: (message: string, ...meta: any[]) => void;
  warn: (message: string, ...meta: any[]) => void;
  info: (message: string, ...meta: any[]) => void;
  debug: (message: string, ...meta: any[]) => void;
}

export interface IDatabase {
  upsert: <T>(id: string, value: T, options?: object) => Promise<void>;
}

export interface ICrawlerService {
  crawl: () => Promise<void>;
}

export const TYPES = {
  IGitlabRepository: Symbol.for('IGitlabRepository'),
  IOptions: Symbol.for('IOptions'),
  ILogger: Symbol.for('ILogger'),
  IDatabase: Symbol.for('IDatabase'),
  ICrawlerService: Symbol.for('ICrawlerService'),
};
