import { Module } from '@nestjs/common';
import { SavedSearchesController } from './saved-searches.controller';
import { SavedSearchesPresenter } from './saved-searches.presenter';
import { SavedSearchesService } from '../../../application/saved-searches/saved-searches.service';

@Module({
  controllers: [SavedSearchesController],
  providers: [SavedSearchesService, SavedSearchesPresenter],
})
export class SavedSearchesModule {}
