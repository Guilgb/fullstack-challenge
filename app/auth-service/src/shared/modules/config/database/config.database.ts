import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'sabor_raiz_user',
  password: process.env.DATABASE_PASSWORD || 'sabor_raiz_password',
  database: process.env.DATABASE_NAME || 'sabor_raiz',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
}));
