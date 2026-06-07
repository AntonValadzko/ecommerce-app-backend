import { CategoriesPresenter } from './categories/categories.presenter';
import { SavedSearchesPresenter } from './saved-searches/saved-searches.presenter';

describe('simple presenters', () => {
  it('wraps categories data', () => {
    expect(new CategoriesPresenter().toDataResponse([{ id: 1 }])).toEqual({ data: [{ id: 1 }] });
  });

  it('wraps saved searches data', () => {
    expect(new SavedSearchesPresenter().toDataResponse({ id: '1' })).toEqual({ data: { id: '1' } });
  });
});
