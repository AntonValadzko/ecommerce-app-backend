import { EntityNotFoundError } from './entity-not-found.error';

describe('EntityNotFoundError', () => {
  it('builds message and metadata', () => {
    const error = new EntityNotFoundError('Product', 42);

    expect(error.name).toBe('EntityNotFoundError');
    expect(error.message).toBe('Product "42" not found');
    expect(error.entityName).toBe('Product');
    expect(error.identifier).toBe(42);
  });

  it('supports string identifiers', () => {
    const error = new EntityNotFoundError('Category', 'electronics');

    expect(error.message).toBe('Category "electronics" not found');
  });
});
