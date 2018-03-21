/**
 * MobileCaddy Sync Component
 *
 * @description Checks to see if an initialSync has been completed. If not it
 * call initialSync using config from /app/app.config. A loader is show whilst the sync
 * is in progress and an event is emitted when complete.
 * If the intialSync has already completed then the 'initialLoadComplete' event is
 * emitted straight away.
 *
 * TODO:
 * - Broadcast events for each initial sync - or is this in the actual SyncService?.
 *   This needs an update to devUtils to expose some sort of callback that can give us updates.
 * - Update once devUtils takes in an array of tables
 *
 * Roadmap:
 * - Update UI with "Table x of y", or "downloading Contacts"
 *   This needs an update to devUtils to expose some sort of callback that can give us updates.
 */

import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import { APP_CONFIG, IAppConfig, SyncTableConfig } from '../../app/app.config';

@Component({
  selector: 'mobilecaddy-sync',
  templateUrl: 'mobilecaddy-sync.html'
})
export class MobileCaddySyncComponent implements OnInit {
  logTag: string = 'mobilecaddy-sync.ts';
  accountTable: string = 'Account__ap';

  @Output()
  initialLoadComplete: EventEmitter<String> = new EventEmitter<String>();

  @Output() tableSyncComplete: EventEmitter<{}> = new EventEmitter<{}>();
  @Output() tableSyncStatus: EventEmitter<{}> = new EventEmitter<{}>();

  constructor(
    public loadingCtrl: LoadingController,
    @Inject(APP_CONFIG) private config: IAppConfig
  ) {}

  ngOnInit() {
    if (localStorage.getItem('syncState') == 'InitialLoadComplete') {
      console.log(this.logTag, 'InitialSync has already been run');
      this.initialLoadComplete.emit();
      this.doColdStartSync();
    } else {
      this.doInitialSync();
    }
  }

  doInitialSync(): void {
    console.log(this.logTag, 'Calling initialSync');
    let loader = this.loadingCtrl.create({
      content: 'Running Sync...',
      duration: 120000
    });
    loader.present();

    devUtils.initialSync(this.config.initialSyncTables).then(res => {
      localStorage.setItem('syncState', 'InitialLoadComplete');
      console.log(this.logTag, 'InitialLoadComplete');
      loader.dismiss();
      this.initialLoadComplete.emit();
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
        this.tableSyncComplete.emit({ result: 'Complete' });
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
      this.tableSyncStatus.emit({ result: 'StartSync' });

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
            this.tableSyncStatus.emit({
              result: 'TableComplete ' + table.Name
            });
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
            this.tableSyncStatus.emit({
              table: table.Name,
              result: resObject.status
            });
            return resObject;
          })
          .catch(e => {
            console.error(this.logTag, 'doSyncTables', e);
            if (e.status != devUtils.SYNC_UNKONWN_TABLE) {
              stopSyncing = true;
              this.tableSyncStatus.emit({
                table: table.Name,
                result: e.status
              });
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

  getSyncState(): string {
    var syncState = localStorage.getItem('syncState');
    if (syncState === null) {
      syncState = 'Complete';
      localStorage.setItem('syncState', syncState);
    }
    return syncState;
  }
  setSyncState(status: string): void {
    localStorage.setItem('syncState', status);
  }
}
