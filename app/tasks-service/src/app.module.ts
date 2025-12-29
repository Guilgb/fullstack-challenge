import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from '@shared/modules/database/database.module';
import { AuthModule } from './modules/auth /auth.module';
import { BoardsModule } from './modules/boards/boards.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { WinstonLoggerService } from './shared/modules/winston/winston-logger.service';
import { LoggingInterceptor } from './shared/modules/winston/winston.interceptor';
import { WinstonModule } from './shared/modules/winston/winston.module';
import { EventsModule } from './shared/services/events.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    WinstonModule,
    DatabaseModule,
    AuthModule,
    TasksModule,
    BoardsModule,
    EventsModule,
  ],
  providers: [
    WinstonLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
