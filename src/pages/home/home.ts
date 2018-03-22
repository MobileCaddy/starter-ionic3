import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import { MobileCaddySyncService } from '../../providers/mobilecaddy-sync.service';

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
    private mobilecaddySyncService: MobileCaddySyncService
  ) {}

  ngOnInit() {
    // As we are the first page, we check to see when the initialSync is completed.
    this.mobilecaddySyncService
      .getInitialSyncState()
      .subscribe(initialSyncState => {
        console.log(this.logTag, 'initialSyncState Update', initialSyncState);
        if (initialSyncState == 'InitialLoadComplete') {
          this.showAccounts();
        }
      });
  }

  showAccounts(): void {
    devUtils.readRecords(this.accountTable).then(res => {
      console.log('res', res);
      this.projects = res.records;
    });
  }
}
