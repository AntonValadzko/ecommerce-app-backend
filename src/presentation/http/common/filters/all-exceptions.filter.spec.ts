import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { EntityNotFoundError } from '../../../../domain/common/entity-not-found.error';

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();
  let response: { status: jest.Mock; json: jest.Mock };

  beforeEach(() => {
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  function createHost() {
    return {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    };
  }

  it('maps EntityNotFoundError to 404', () => {
    filter.catch(new EntityNotFoundError('Product', 1), createHost() as never);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Product "1" not found',
    });
  });

  it('passes through HttpException body', () => {
    filter.catch(new HttpException('bad', HttpStatus.BAD_REQUEST), createHost() as never);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'bad',
    });
  });

  it('returns generic 500 for unknown errors', () => {
    const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    filter.catch(new Error('boom'), createHost() as never);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
    expect(loggerSpy).toHaveBeenCalled();

    loggerSpy.mockRestore();
  });
});
