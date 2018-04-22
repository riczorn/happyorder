/**
  * HappyOrder app for phones
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */

import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { SettingsPage } from '../pages/settings/settings';
import { TavoliPage } from '../pages/tavoli/tavoli';
import { OrderPage } from '../pages/order/order';

// import { HomePage } from '../pages/home/home';
// import { HelpPage } from '../pages/help/help';


import { LoginPage } from '../pages/login/login';
import { LiveService } from  '../services/live.service';
import {CartService} from  '../services/cart.service';


@Component({
  templateUrl: 'app.html',
  providers: []
})
export class HappyOrderApp {
  @ViewChild(Nav) navCtrl: Nav;
    rootPage:any = LoginPage;

  constructor(platform: Platform, 
    statusBar: StatusBar, splashScreen: SplashScreen, 
    private liveService: LiveService,
    private cartService:CartService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      setTimeout(() => {
        splashScreen.hide();
      },500);
    });
  }
  // goToHome(params){
  //   if (!params) params = {};
  //   this.navCtrl.setRoot(HomePage);
  // }
  // goToHelp(params){
  //   if (!params) params = {};
  //   this.navCtrl.setRoot(HelpPage);
  // }
  goToLogin(params){
    if (!params) params = {};
    this.navCtrl.setRoot(LoginPage);
  }
  goToSettings(params){
    if (!params) params = {};
    this.navCtrl.setRoot(SettingsPage);
  }
  goToTavoli(params){
    if (!params) params = {};
    this.navCtrl.setRoot(TavoliPage);
  }
  goToOrder(params){
    if (!params) params = {};
    if (this.liveService.user && this.liveService.user.table) {
      this.navCtrl.setRoot(OrderPage);
    } else {
      this.cartService.toastAndVibrate('Prima scegli un tavolo',
        this.liveService.messageTypes.localError);
    }
  }
}
