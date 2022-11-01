import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { IDatabase, IOptions, ILogger, TYPES } from '../types/ioc';
import * as couchbase from 'couchbase';
import '../node_modules/couchbase/build/Release/couchbase_impl.node';
import * as z from 'zod';

@injectable()
export class CouchbaseRepository implements IDatabase {

  private _options: IOptions;
  private _logger: ILogger;

  public constructor(
    @inject(TYPES.IOptions) options: IOptions,
    @inject(TYPES.ILogger) logger: ILogger
  ) {
    this._options = options;
    this._logger = logger;
  }

  private _cluster: couchbase.Cluster | null = null;
  private _bucket: couchbase.Bucket | null = null;
  private _collection: couchbase.Collection | null = null;
  private async connect() {

    // skip if already connected
    if (this._cluster !== null) {
      return;
    }

    this._cluster = await couchbase.connect(this._options.db.host, {
      username: this._options.db.user,
      password: this._options.db.pass,
    });

    this._bucket = this._cluster.bucket(this._options.db.bucket);
    this._collection = this._bucket.defaultCollection();
  }

  public async upsert<T>(id: string, value: T, opts?: object, schema?: z.ZodType<T>) {

    try {

      if (typeof schema !== 'undefined') {
        schema.parse(value);
      }

      await this.connect();
      await this._collection.upsert(id, value, opts);

    } catch(err) {
      this._logger.error('Couchbase upsert error', { err });
      throw err;
    }
  }
}
