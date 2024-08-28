export class QueryBuilder<T> {
  protected pipeline = [];

  match(): QueryBuilder<Omit<T, "_id">> {
    return this;
  }

  exec(): T {
    return {} as T;
  }
}
