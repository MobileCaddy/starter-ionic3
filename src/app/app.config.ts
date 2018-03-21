import { InjectionToken } from '@angular/core';

export let APP_CONFIG = new InjectionToken('app.config');

export interface IAppConfig {
  initialSyncTables: string[];
  coldStartSyncTables: SyncTableConfig[];
}

export interface SyncTableConfig {
  Name: string;
  syncWithoutLocalUpdates?: boolean;
  maxTableAge?: number;
}

const fourHours: number = 1000 * 60 * 60 * 4;

export const AppConfig: IAppConfig = {
  initialSyncTables: ['Account__ap', 'Contact__ap'],
  coldStartSyncTables: [
    {
      Name: 'Account__ap',
      syncWithoutLocalUpdates: true,
      maxTableAge: fourHours
    },
    {
      Name: 'Contact__ap',
      syncWithoutLocalUpdates: true,
      maxTableAge: fourHours
    }
  ]
};
