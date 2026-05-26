import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesPresenter {
  toDataResponse<T>(data: T) {
    return { data };
  }
}
