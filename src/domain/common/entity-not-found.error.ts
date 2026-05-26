export class EntityNotFoundError extends Error {
  constructor(
    public readonly entityName: string,
    public readonly identifier: string | number,
  ) {
    super(`${entityName} "${identifier}" not found`);
    this.name = 'EntityNotFoundError';
  }
}
