import { Module } from '@nestjs/common';
import { WinstonModule } from '@shared/modules/winston/winston.module';

@Module({
  imports: [WinstonModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
