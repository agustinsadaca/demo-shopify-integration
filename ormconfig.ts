import { DataSource } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export const config: MysqlConnectionOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'test',
  password: 'admin12345',
  database: 'test',
  entities: ['*/**/*.entity.ts'],
  synchronize: false,
  extra: {
    authPlugin: 'mysql_native_password',
  },
};

export default new DataSource(config);
