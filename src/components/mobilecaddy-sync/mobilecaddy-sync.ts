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

import { Component, Inject, OnInit } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { APP_CONFIG, IAppConfig, SyncTableConfig } from '../../app/app.config';
import { MobileCaddySyncService } from '../../providers/mobilecaddy-sync.service';

@Component({
  selector: 'mobilecaddy-sync',
  templateUrl: 'mobilecaddy-sync.html'
})
export class MobileCaddySyncComponent implements OnInit {
  logTag: string = 'mobilecaddy-sync.ts';

  constructor(
    public loadingCtrl: LoadingController,
    @Inject(APP_CONFIG) private config: IAppConfig,
    private mobilecaddySyncService: MobileCaddySyncService
  ) {}

  ngOnInit() {
    if (this.mobilecaddySyncService.hasInitialSynCompleted()) {
      const coldStart = localStorage.getItem('coldStart')
        ? localStorage.getItem('coldStart')
        : false;
      if (coldStart) {
        localStorage.removeItem('coldStart');
        this.doColdStartSync();
      }
    } else {
      localStorage.removeItem('coldStart');
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

    this.mobilecaddySyncService.getSyncState().subscribe(res => {
      console.log(this.logTag, 'SyncState Update', res);
      if (res == 'complete') {
        loader.dismiss();
      }
    });

    this.mobilecaddySyncService.doInitialSync();
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
    this.mobilecaddySyncService.syncTables(coldStartTables);
  }
}
