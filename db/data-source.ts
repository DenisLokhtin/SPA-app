import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST as string,
  port: +process.env.POSTGRES_PORT as number,
  username: process.env.POSTGRES_USER as string,
  password: process.env.POSTGRES_PASSWORD as string,
  database: process.env.POSTGRES_DB as string,
  entities: [__dirname + '/../**/*.entity.js'] as string[],
  synchronize: !!process.env.SYNCHRONIZE as boolean,
  migrations: ['dist/db/migrations/*-migration.js'] as string[],
};
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
