import { Component, Inject, OnInit } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import * as devUtils from 'mobilecaddy-utils/devUtils';
import { McStartupService, McSyncService } from 'mobilecaddy-angular';
import { APP_CONFIG, IAppConfig } from '../../app/app.config';
import * as _ from 'underscore';

const logTag: string = 'home.ts';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  accounts;
  accountTable: string = 'Account__ap';
  config: IAppConfig;
  private loader: any;
  private mcInitStateSub;
  private mcInitSyncSub;
  private syncSub;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    private mcSyncService: McSyncService,
    private mcStartupService: McStartupService,
    @Inject(APP_CONFIG) private appConfig: IAppConfig
  ) {}

  ngOnInit() {
    /**
     * In this example code we're going to show a loader. As this is also the
     * 1st page in the app we need to initialise MobileCaddy. There is an
     * observable we can listen to to get the init status (inc initialSync
     * status)
     *
     * This pattern can be copied for your app's first page.
     */

    this.loader = this.loadingCtrl.create({
      content: 'Preparing data...',
      duration: 120000
    });
    this.loader.present();

    // Call the MobileCaddt startup, passing our config in.
    this.mcStartupService.startup(this.appConfig);

    // Subscribe to the observable so we can update our loader text
    this.mcInitSyncSub = this.mcInitStateSub = this.mcStartupService
      .getInitState()
      .subscribe(res => {
        console.log(logTag, 'Init Update', res);
        if (res) {
          if (res.status === -1) this.loader.setContent(res.info);
          if (res.status === 0) this.loader.setContent('Syncing ' + res.table);
        }
      });

    // Check to see if our initialSync has completed, if so we can show our accounts
    this.mcSyncService.getInitialSyncState().subscribe(initialSyncState => {
      console.log(logTag, 'initialSyncState Update', initialSyncState);
      if (initialSyncState == 'InitialLoadComplete') {
        this.showAccounts();
      }
    });
  }

  ionViewDidEnter() {
    // As we are the root our URL may not be updated if coming here via the 'back' button.
    // Maybe we can get rid of this is we Lazy load the home page?
    history.pushState({}, 'Home', '/');
  }

  showAccounts(): void {
    this.loader.setContent('Fetching records');
    let soql =
      'SELECT {' +
      this.accountTable +
      ':Id}, {' +
      this.accountTable +
      ':Name} FROM {' +
      this.accountTable +
      '}';
    devUtils.smartSql(soql).then(res => {
      console.log('res', res);
      // Sort by Name
      this.accounts = _.sortBy(res.records, el => {
        return el[1];
      });
      this.loader.dismiss();
    });
  }

  doSync(event): void {
    console.log(logTag, 'doSync');

    // You're unlikely to really want to show a loader whilst a background sync takes place,
    // but this is an example of using the mcSyncService.getSyncState() observable.
    this.loader = this.loadingCtrl.create({
      content: 'Syncing...',
      duration: 120000
    });
    this.loader.present();

    if (this.syncSub) this.syncSub.unsubscribe();
    this.syncSub = this.mcSyncService.getSyncState().subscribe(res => {
      console.log(logTag, 'SyncState Update', res);
      if (res.status === 0) this.loader.setContent('Syncing ' + res.table);
    });

    this.mcSyncService.syncTables('mySync').then(r => {
      this.loader.dismiss();
    });
  }

  goToAccount(a): void {
    console.log(logTag, 'goToAccount', a);
    this.navCtrl.push('AccountDetailPage', {
      id: a[0], // We set this as well, for our IonicPage segment
      account: { Id: a[0], Name: a[1] }
    });
  }

  ionViewDidLeave() {
    this.mcInitStateSub.unsubscribe();
    this.mcInitSyncSub.unsubscribe();
  }
}
