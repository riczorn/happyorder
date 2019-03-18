/**
 *  HappyOrder app

  * il tasto Trova Server potrebbe usare:
       https://www.npmjs.com/package/cordova-plugin-ping
       ma anche no: è un wrapper enorme, e chissene del ping posso
       sempre usare un http get.
  * il tasto download update deve aprire il system browser,
  * è quindi necessario inAppBrowser, vedi
  * https://www.techiediaries.com/inappbrowser-ionic-v3/
    (implementazione completa)
 *
 * @package    HappyOrder
 * @author     Riccardo Zorn <code@fasterjoomla.com>
 * @copyright  2002 - 2017 Riccardo Zorn
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { LiveService } from '../../services/live.service';
import { LoginService } from '../../services/login.service';
import { PlusMinusButtonComponent } from '../../components/plus-minus-button/plus-minus-button';
// import { process }

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  options: InAppBrowserOptions = {
    location: 'yes',//Or 'no'
    hidden: 'no', //Or  'yes'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'yes',//Android only ,shows browser zoom controls
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no', //Android only
    closebuttoncaption: 'Close', //iOS only
    disallowoverscroll: 'no', //iOS only
    toolbar: 'yes', //iOS only
    enableViewportScale: 'no', //iOS only
    allowInlineMediaPlayback: 'no',//iOS only
    presentationstyle: 'pagesheet',//iOS only
    fullscreen: 'yes',//Windows only
  };
  // process: any;

  constructor(public navCtrl: NavController,
    private liveService: LiveService,
    private loginService: LoginService,
    private theInAppBrowser: InAppBrowser) {
    //this.process = process;
  }
  goToLogin() {
    this.navCtrl.push(LoginPage);
  }
  handleSettingsSubmit() {

    this.loginService.saveStorageSettings();
  }

  changeRole(makeMain: boolean) {
    let self = this;
    let user = self.liveService.user;
    if (makeMain) {
      user.extraDisplay = false;
      user.extraDisplayName = '';
    } else {
      user.extraDisplay = true;
      user.extraDisplayName = 'extra';
    }
    self.loginService.saveStorageSettings();

    setTimeout(() => {
      self.goToLogin();
    }, 500);
  }

  findUpdate(online: boolean) {
    let self = this;
    let url = '';
    if (online) {
      url = 'https://happyorder.it/apk/';
      // window.open(,'_system', 'location=yes');
    } else {
      url = 'http://' + self.liveService.user.serverUrl + '/update/';
      // window.open(,'_system', 'location=yes');
    }

    let target = "_system"; // openWithSystemBrowser
    // let target = "_blank"; // openWithInAppBrowser
    // let target = "_self"; // openWithCordovaBrowser
    this.theInAppBrowser.create(url, target, this.options);
  }

  downloadSettings() {
    let self = this;
    self.liveService.settings = false;
    self.loginService.downloadSettings(function (data) {
      if (self.liveService.settings && self.liveService.user.autoLogin) {
        self.liveService.user.errorMessage = 'Impostazioni scaricate ';
        setTimeout(() => {
          self.goToLogin();
        }, 1000);
      }
    });
  }
  updateValue(event: any) {
    console.log('updateValue', event);
  }

  /**
   * Android e electron: shut the app down.
   */
  closeApp(restart: boolean) {
    //@TODO try again to get this working.
    console.log('closeApp @TODO');//, process);
    /*let electron = '';
    try {
      electron = require('electron');
      console.log('electron:',electron);  
      if (electron) {
        //let w = electron.remote.getCurrentWindow()
        window.close();
        // w.close();
        // console.log ('YES electron');
      } else {
        console.log ('NOT electron');
      }
    } catch (e) {
      console.error('closeApp', 'electron not found',e);
    }
    window.close();
    */
  }
}
