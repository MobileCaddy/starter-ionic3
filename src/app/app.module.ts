import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { MobileCaddyModule } from 'mobilecaddy-angular';
import { Network } from '@ionic-native/network';

// Pages
import { InitPage } from '../pages/init/init';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { OutboxPage } from '../pages/outbox/outbox';
import { SettingsPage } from 'mobilecaddy-angular';
import { MCOutboxPage } from 'mobilecaddy-angular';

// Native
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Components

// Providers
import { APP_CONFIG, AppConfig } from './app.config';
import { MobileCaddySyncService } from 'mobilecaddy-angular';

@NgModule({
  declarations: [MyApp, InitPage, HomePage, ListPage, OutboxPage],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    MobileCaddyModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    InitPage,
    HomePage,
    ListPage,
    OutboxPage,
    SettingsPage,
    MCOutboxPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: APP_CONFIG, useValue: AppConfig },
    MobileCaddySyncService,
    Network
  ]
})
export class AppModule {}
