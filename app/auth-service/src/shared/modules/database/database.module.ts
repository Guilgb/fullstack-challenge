import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from '@shared/modules/config/database/config.database';
import * as entities from '@shared/modules/database/entities';
import { TypeOrmLogger } from '../winston/winston.service';

@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: Object.values(entities),
        synchronize: true, //todo colocar synchronize false em produção
        ssl: false,
        extra: {
          ssl: false,
        },
        logger: new TypeOrmLogger(),
        logging: ['query', 'error', 'schema', 'warn', 'info', 'log'],
        maxQueryExecutionTime: 1000,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
