import { Injectable } from '@nestjs/common';

@Injectable()
export class SavedSearchesPresenter {
  toDataResponse<T>(data: T) {
    return { data };
  }
}
