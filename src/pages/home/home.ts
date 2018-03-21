import { Component } from '@angular/core';
import { LoadingController, NavController } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  logTag: string = 'home.ts';
  projects;
  accountTable: string = 'Account__ap';

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController
  ) {}

  // This is called when the mobilecaddy-initial-sync emits the initialLoadCompleted event,
  // and so we're ready to go.
  onInitialLoadComplete(): void {
    console.log(this.logTag, 'onInitialLoadComplete');
    this.showAccounts();
  }

  onTableSyncComplete(event): void {
    console.log(this.logTag, event);
  }

  onTableSyncStatus(event): void {
    console.log(this.logTag, 'onTableSyncStatus', event);
  }

  showAccounts(): void {
    devUtils.readRecords(this.accountTable).then(res => {
      console.log('res', res);
      this.projects = res.records;
    });
  }
}
