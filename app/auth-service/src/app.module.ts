import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@shared/modules/database/database.module';
import { WinstonModule } from '@shared/modules/winston/winston.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    WinstonModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
