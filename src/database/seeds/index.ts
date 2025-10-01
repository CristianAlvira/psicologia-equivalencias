import 'dotenv/config';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { PermissionsSeed } from './permissions.seed';
import { UserAdminSeed } from './user-admin.seed';
import { RolesSeed } from './roles.seed';
import { PermissionsCategoriesSeed } from './permissions_categories.seed';
import AppDataSource from '../data-source';

async function seed() {
  const options: SeederOptions = {
    seeds: [
      PermissionsCategoriesSeed,
      PermissionsSeed,
      RolesSeed,
      UserAdminSeed,
    ],
    factories: [],
  };

  const dataSource = AppDataSource;
  await dataSource.initialize();

  try {
    await runSeeders(dataSource, options);
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
