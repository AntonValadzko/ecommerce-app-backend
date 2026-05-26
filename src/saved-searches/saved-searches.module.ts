import { Module } from '@nestjs/common';
import { SavedSearchesController } from './saved-searches.controller';
import { SavedSearchesService } from './saved-searches.service';
import { SavedSearchRepository } from './repositories/saved-search.repository';

@Module({
  controllers: [SavedSearchesController],
  providers: [SavedSearchesService, SavedSearchRepository],
})
export class SavedSearchesModule {}
