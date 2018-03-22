import { Inject, Injectable } from '@angular/core';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import { APP_CONFIG, IAppConfig, SyncTableConfig } from '../app/app.config';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class MobileCaddySyncService {
  logTag: string = 'mobilecaddy-sync.service.ts';
  initialSyncState: BehaviorSubject<string> = new BehaviorSubject('');
  syncState: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(@Inject(APP_CONFIG) private config: IAppConfig) {
    this.initialSyncState.next(localStorage.getItem('initialSyncState'));
    this.syncState.next('undefined');
  }

  doInitialSync(): void {
    console.log(this.logTag, 'Calling initialSync');
    this.syncState.next('InitialSyncInProgress');
    // return fromPromise(
    //   devUtils.initialSync(this.config.initialSyncTables).then(res => {
    //     localStorage.setItem('syncState', 'InitialLoadComplete');
    //     console.log(this.logTag, 'InitialLoadComplete');
    //     this.syncState.next('Completed');
    //     return 'Complete';
    //   })
    // );
    devUtils.initialSync(this.config.initialSyncTables).then(res => {
      localStorage.setItem('initialSyncState', 'InitialLoadComplete');
      console.log(this.logTag, 'InitialLoadComplete');
      this.initialSyncState.next('InitialLoadComplete');
      this.syncState.next('Completed');
      // return 'Complete';
    });
  }

  doColdStartSync(): void {
    console.log(
      this.logTag,
      'doColdStartSync',
      this.config.coldStartSyncTables
    );
    let mobileLogConfig: SyncTableConfig = {
      Name: 'Mobile_Log__mc',
      syncWithoutLocalUpdates: false
    };
    let coldStartTables = [mobileLogConfig].concat(
      this.config.coldStartSyncTables
    );
    this.syncTables(coldStartTables);
  }

  syncTables(tablesToSync: SyncTableConfig[]): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(this.logTag, 'syncTables');
      // TODO - put some local notification stuff in here.
      this.doSyncTables(tablesToSync).then(res => {
        // this.tableSyncComplete.emit({ result: 'Complete' });
        // setSyncState('Complete');
        if (!res || res.status == 100999) {
          // LocalNotificationService.setLocalNotification();
        } else {
          // LocalNotificationService.cancelNotification();
        }
        resolve(res);
      });
    });
  }

  doSyncTables(tablesToSync: SyncTableConfig[]): Promise<any> {
    // Check that we not syncLocked or have a sync in progress
    let syncLock = this.getSyncLock();
    let syncState = this.getSyncState();
    if (syncLock == 'true' || syncState == 'syncing') {
      return Promise.resolve({ status: 100999 });
    } else {
      this.setSyncState('syncing');
      // $rootScope.$broadcast('syncTables', { result: 'StartSync' });
      //   this.tableSyncStatus.emit({ result: 'StartSync' });

      let stopSyncing = false;
      const sequence = Promise.resolve();

      return tablesToSync.reduce((sequence, table) => {
        if (typeof table.maxTableAge == 'undefined') {
          table.maxTableAge = 1000 * 60 * 1; // 3 minutes
        }
        return sequence
          .then(res => {
            console.log(
              this.logTag,
              'doSyncTables inSequence',
              table,
              res,
              stopSyncing
            );
            // this.tableSyncStatus.emit({
            //   result: 'TableComplete ' + table.Name
            // });
            if (!stopSyncing) {
              return devUtils.syncMobileTable(
                table.Name,
                table.syncWithoutLocalUpdates,
                table.maxTableAge
              );
            } else {
              //console.log("skipping sync");
              return { status: 100999 };
            }
          })
          .then(resObject => {
            console.log(this.logTag, resObject);
            switch (resObject.status) {
              case devUtils.SYNC_NOK:
              case devUtils.SYNC_ALREADY_IN_PROGRESS:
                if (
                  typeof resObject.mc_add_status == 'undefined' ||
                  resObject.mc_add_status != 'no-sync-no-updates'
                ) {
                  stopSyncing = true;
                  this.setSyncState('Complete');
                }
            }
            // this.tableSyncStatus.emit({
            //   table: table.Name,
            //   result: resObject.status
            // });
            return resObject;
          })
          .catch(e => {
            console.error(this.logTag, 'doSyncTables', e);
            if (e.status != devUtils.SYNC_UNKONWN_TABLE) {
              stopSyncing = true;
              //   this.tableSyncStatus.emit({
              //     table: table.Name,
              //     result: e.status
              //   });
              this.setSyncState('Complete');
            }
            return e;
          });
      }, Promise.resolve());
    }
  }

  getSyncLock(syncLockName = 'syncLock'): string {
    var syncLock = localStorage.getItem(syncLockName);
    if (syncLock === null) {
      syncLock = 'false';
      localStorage.setItem(syncLockName, syncLock);
    }
    return syncLock;
  }

  setSyncLock(syncLockName: string, status: string): void {
    if (!status) {
      status = syncLockName;
      syncLockName = 'syncLock';
    }
    localStorage.setItem(syncLockName, status);
  }

  // getSyncState(): string {
  //   var syncState = localStorage.getItem('syncState');
  //   if (syncState === null) {
  //     syncState = 'Complete';
  //     localStorage.setItem('syncState', syncState);
  //   }
  //   return syncState;
  // }

  getInitialSyncState(): BehaviorSubject<String> {
    return this.initialSyncState;
  }

  hasInitialSynCompleted(): boolean {
    return localStorage.getItem('initialSyncState') ? true : false;
  }

  getSyncState(): BehaviorSubject<String> {
    var syncState = localStorage.getItem('syncState');
    if (syncState === null) {
      syncState = 'Complete';
      localStorage.setItem('syncState', syncState);
    }
    // return syncState;
    return this.syncState;
  }

  setSyncState(status: string): void {
    localStorage.setItem('syncState', status);
    this.syncState.next(status);
  }
}
