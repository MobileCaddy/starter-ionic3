import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { MobileCaddyModule } from 'mobilecaddy-angular';
import { Network } from '@ionic-native/network';

// MobileCaddy - DO NOT REMOVE
import { SettingsPage, MCOutboxPage } from 'mobilecaddy-angular';

// Pages
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

// Native
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Components

// Providers
import { APP_CONFIG, AppConfig } from './app.config';

@NgModule({
  declarations: [MyApp, HomePage],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    MobileCaddyModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, HomePage, SettingsPage, MCOutboxPage],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: APP_CONFIG, useValue: AppConfig },
    Network
  ]
})
export class AppModule {}
