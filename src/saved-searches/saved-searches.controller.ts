import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiHeader,
  ApiBody,
} from '@nestjs/swagger';
import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { SessionId } from '../common/decorators/session-id.decorator';

@ApiTags('Saved Searches')
@ApiHeader({ name: 'x-session-id', description: 'Session identifier', required: false })
@Controller('saved-searches')
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Get()
  @ApiOperation({ summary: 'List saved searches for current session' })
  @ApiResponse({ status: 200, description: 'List of saved searches' })
  async findAll(@SessionId() sessionId: string) {
    return { data: await this.savedSearchesService.list(sessionId) };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save a search/filter combination' })
  @ApiBody({ type: CreateSavedSearchDto })
  @ApiResponse({ status: 201, description: 'Saved search created' })
  async create(@SessionId() sessionId: string, @Body() dto: CreateSavedSearchDto) {
    return { data: await this.savedSearchesService.save(sessionId, dto.name, dto.query) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a saved search' })
  @ApiParam({ name: 'id', description: 'Saved search UUID' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  @ApiResponse({ status: 404, description: 'Saved search not found' })
  async remove(@Param('id') id: string, @SessionId() sessionId: string) {
    await this.savedSearchesService.remove(id, sessionId);
  }
}
