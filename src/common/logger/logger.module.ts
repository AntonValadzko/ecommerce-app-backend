import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { buildWinstonModuleOptions } from './winston.config';

@Global()
@Module({
  imports: [WinstonModule.forRoot(buildWinstonModuleOptions())],
  exports: [WinstonModule],
})
export class LoggerModule {}
