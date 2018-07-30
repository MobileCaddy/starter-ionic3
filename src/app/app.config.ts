import { InjectionToken } from '@angular/core';

export let APP_CONFIG = new InjectionToken('app.config');

export interface IAppConfig {
  indexSpecs?: indexSpecConfig[];
  initialSyncTables: string[];
  syncPoints?: SyncPointConfig[];
  outboxTables?: OutBoxTableConfig[];
  recentItems?: RecentItemsConfig;
  globalSearch?: any;
}

export interface indexSpecConfig {
  table: string;
  specs: Array<{ path: string; type: string }>;
}

export interface SyncPointConfig {
  name: string;
  skipSyncPeriod?: number; // Seconds
  tableConfig: SyncTableConfig[];
}

export interface SyncTableConfig {
  Name: string;
  syncWithoutLocalUpdates?: boolean;
  maxTableAge?: number;
  maxRecsPerCall?: number;
  skipP2M?: boolean;
}

export interface OutBoxTableConfig {
  Name: string;
  DisplayName: string;
}

export interface RecentItemsConfig {
  maxItems?: number;
  encrypted?: boolean;
  tables?: any;
}

// const fourHours: number = 1000 * 60 * 60 * 4;
const oneMinute: number = 1000 * 60;

export const AppConfig: IAppConfig = {
  // Set our own indexSpecs
  indexSpecs: [
    {
      table: 'Account__ap',
      specs: [
        { path: 'Id', type: 'string' },
        { path: 'Name', type: 'string' },
        { path: 'Description', type: 'string' },
        { path: 'BillingCountry', type: 'string' }
      ]
    }
  ],

  // Tables to sync on initialSync
  initialSyncTables: ['Account__ap', 'Contact__ap'],

  syncPoints: [
    {
      name: 'coldStart',
      tableConfig: [
        {
          Name: 'Account__ap',
          syncWithoutLocalUpdates: true,
          maxTableAge: 0
        },
        {
          Name: 'Contact__ap',
          syncWithoutLocalUpdates: true,
          maxTableAge: 0
        }
      ]
    },
    {
      name: 'forceSync',
      tableConfig: [
        {
          Name: 'Account__ap',
          syncWithoutLocalUpdates: true,
          maxTableAge: 0
        },
        {
          Name: 'Contact__ap',
          syncWithoutLocalUpdates: true,
          maxTableAge: 0
        }
      ]
    },
    {
      name: 'mySync',
      skipSyncPeriod: 30,
      tableConfig: [
        {
          Name: 'Contact__ap'
        }
      ]
    }
  ],

  outboxTables: [
    { Name: 'Account__ap', DisplayName: 'Accounts' },
    { Name: 'Contact__ap', DisplayName: 'Contacts' }
  ],

  recentItems: {
    maxItems: 50,
    encrypted: false,
    tables: [
      {
        name: 'Account',
        icon: 'ion-folder',
        href: '/accounts/:Id'
      },
      {
        name: 'Contact',
        icon: 'ion-person',
        href: '/accounts/:AccountId/contacts/:Id'
      }
    ]
  },

  globalSearch: {
    maxItems: 10,
    encrypted: false,
    tables: [
      {
        table: 'Account__ap',
        name: 'Accounts',
        fieldsToQuery: ['Name'],
        displayFields: [
          {
            fields: ['Name', 'BillingState'],
            tags: ['h2', 'p']
          }
        ],
        icon: 'folder',
        pageName: 'AccountDetailPage',
        navParamName: 'account'
      }
      // We could add further config, like this :)
      // {
      //   table: 'Contact__ap',
      //   name: 'Contacts',
      //   fieldsToQuery: ['Name', 'Email'],
      //   displayFields: [
      //     {
      //       fields: ['Name']
      //     },
      //     {
      //       fields: ['Title'],
      //       tags: ['p']
      //     }
      //   ],
      //   icon: 'person',
      //   pageName: 'ContactDetailPage',
      //   navParamName: 'contact'
      // }
    ]
  }
};
