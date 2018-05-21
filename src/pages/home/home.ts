import { Component, Inject, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import { MobileCaddySyncService } from 'mobilecaddy-angular';
import { APP_CONFIG, IAppConfig } from '../../app/app.config';
import { Network } from '@ionic-native/network';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  logTag: string = 'home.ts';
  accounts;
  accountTable: string = 'Account__ap';
  config: IAppConfig;

  constructor(
    public navCtrl: NavController,
    private mobilecaddySyncService: MobileCaddySyncService,
    @Inject(APP_CONFIG) private appConfig: IAppConfig,
    private network: Network
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
    this.config = this.appConfig;

    // watch network for a disconnect
    let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
    });

    // watch network for a connection
    let connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      // We just got a connection but we need to wait briefly
      // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          console.log('we got a wifi connection, woohoo!');
        }
      }, 3000);
    });
  }

  showAccounts(): void {
    devUtils.readRecords(this.accountTable).then(res => {
      console.log('res', res);
      this.accounts = res.records;
    });
  }

  doSync(event): void {
    console.log(this.logTag, 'doSync');
    this.mobilecaddySyncService
      .syncTables([{ Name: this.accountTable }])
      .then(function(r) {
        alert(r.status);
      });
  }
}
