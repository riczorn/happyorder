/**
  * HappyOrder app for phones
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */

import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
// but not ToastController etc.
import { InAppBrowser } from '@ionic-native/in-app-browser';
// import { AppUpdate } from '@ionic-native/app-update';

import { HappyOrderApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SettingsPage } from '../pages/settings/settings';
import { TavoliPage } from '../pages/tavoli/tavoli';
import { OrderPage } from '../pages/order/order';
import { LocalPrintPage } from '../pages/local-print/local-print';
import { CartPage } from '../pages/cart/cart';
import { LiveService } from '../services/live.service';
import { LoginService } from '../services/login.service';

import { CartService } from '../services/cart.service';
// import { CoreModule } from './core.module';

// import {HomePage} from '../pages/home/home';
// import {HelpPage} from '../pages/help/help';
// import { AppVersion } from '@ionic-native/app-version';
import { Vibration } from '@ionic-native/vibration';
// import { Toast } from '@ionic-native/toast';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Bixolon } from '@ionic-native/bixolon';

import { HttpModule } from '@angular/http'; // see https://stackoverflow.com/questions/43609853/angular-4-and-ionic-3-no-provider-for-http
import { IonicStorageModule } from '@ionic/storage';
import { OrderButtons } from '../components/order-buttons/order-buttons';  //https://stackoverflow.com/questions/44825956/storage-provider-not-working
import { CartComponent } from '../components/cart/cart';
import { ArtButtonComponent } from '../components/art-button/art-button';
import { PopoverCartComponent } from '../components/popover-cart/popover-cart';
import { BackSlidesComponent } from '../components/back-slides/back-slides';
import { PopoverSudoComponent } from '../components/popover-sudo/popover-sudo';
import { PlusMinusButtonComponent } from '../components/plus-minus-button/plus-minus-button';
import { AbsoluteDrag } from '../directives/absolute-drag/absolute-drag';
import { OrderPageButtons } from '../components/order-page/order-page';
import { PopoverLastordersComponent } from '../components/popover-lastorders/popover-lastorders';
import { PopoverFidelityComponent } from '../components/popover-fidelity/popover-fidelity';
import { ConnectionStatusComponent } from '../components/connection-status/connection-status';

@NgModule({
  declarations: [
    HappyOrderApp,
    LoginPage,
    SettingsPage,
    TavoliPage,

    LocalPrintPage,
    OrderPage,
    CartPage,
    OrderButtons,
    CartComponent,
    ArtButtonComponent,
    PopoverCartComponent,
    BackSlidesComponent,
    PopoverSudoComponent,
    PlusMinusButtonComponent,
    AbsoluteDrag,
    OrderPageButtons,
    PopoverLastordersComponent,
    PopoverFidelityComponent,
    ConnectionStatusComponent
  ],
  imports: [
    // CoreModule,
    BrowserModule,
    IonicModule.forRoot(HappyOrderApp),
    HttpModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    HappyOrderApp,
    LoginPage,
    SettingsPage,
    TavoliPage,
    OrderPage,
    LocalPrintPage,
    CartPage,
    PopoverCartComponent,
    PopoverSudoComponent,
    PopoverLastordersComponent,
    PopoverFidelityComponent,
    ConnectionStatusComponent,
  ],
  providers: [
    LiveService,
    LoginService,
    CartService,
    StatusBar,
    SplashScreen,
    Bixolon,
    InAppBrowser,
    // ToastController,
    // Toast,
    Vibration,
    // AppUpdate,
    { provide: ErrorHandler, useClass: IonicErrorHandler },

  ]
})
export class AppModule { }
