import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { MobileCaddyModule } from 'mobilecaddy-angular';
import { Network } from '@ionic-native/network';

// MobileCaddy - DO NOT REMOVE
import { InitPage } from '../pages/init/init';
import { SettingsPage } from 'mobilecaddy-angular';
import { MCOutboxPage } from 'mobilecaddy-angular';
import { MobileCaddySyncService } from 'mobilecaddy-angular';

// Pages
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { OutboxPage } from '../pages/outbox/outbox';

// Native
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Components

// Providers
import { APP_CONFIG, AppConfig } from './app.config';

@NgModule({
  declarations: [MyApp, InitPage, HomePage, OutboxPage],
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
