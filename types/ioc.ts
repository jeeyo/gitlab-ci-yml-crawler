import z from 'zod';
import { GitlabJobDefinitionsWithNameAndStage } from './GitlabJobDefinitionsWithNameAndStage';

export interface IGitlabRepository {
  getRepositories: () => Promise<GitlabProject[]>;
  getGitlabCiYml(project_id: number): Promise<z.infer<typeof GitlabJobDefinitionsWithNameAndStage>[]>;
}

export interface IOptions {
  gitlabEndpoint: string;
  gitlabToken: string;
  gitlabRepoGlob: string;
  dbHost: string;
  dbUsername: string;
  dbPassword: string;
  dbBucket: string;
}

export interface ILogger {
  error: (message: string, ...meta: any[]) => void;
  warn: (message: string, ...meta: any[]) => void;
  info: (message: string, ...meta: any[]) => void;
  debug: (message: string, ...meta: any[]) => void;
}

export interface IDatabase {
  upsert: <T>(id: string, value: T, options?: object) => Promise<void>;
  insert: <T>(id: string, value: T, options?: object) => Promise<void>;
  replace: <T>(id: string, value: T, options?: object) => Promise<void>;
  get: <T>(id: string, options?: object) => Promise<T>;
  remove: (id: string, options?: object) => Promise<void>;
}

export const TYPES = {
  IGitlabRepository: Symbol.for('IGitlabRepository'),
  IOptions: Symbol.for('IOptions'),
  ILogger: Symbol.for('ILogger'),
  IDatabase: Symbol.for('IDatabase'),
};