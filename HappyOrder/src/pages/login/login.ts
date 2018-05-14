/**
 *  HappyOrder app
 *
 *
 * @package    HappyOrder
 * @author     Riccardo Zorn <code@fasterjoomla.com>
 * @copyright  2002 - 2017 Riccardo Zorn
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */


import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import {LiveService} from  '../../services/live.service';
import {LoginService} from  '../../services/login.service';
import { CartService } from  '../../services/cart.service';

import { TavoliPage } from '../../pages/tavoli/tavoli';
import { SettingsPage } from '../../pages/settings/settings';
import { OrderPage } from '../../pages/order/order';
import { CartPage } from '../../pages/cart/cart';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: []
})
export class LoginPage {

  /**
    passing private or public params to constructor makes them properties
    */
  constructor(public navCtrl: NavController,
                private liveService:LiveService,
                private cartService: CartService,
                private loginService:LoginService) {
                  // console.log('building loginPage');;
  }

  ngOnInit() {
      // console.log('login.ts ngOnInit');
      let self = this;


      // self.loadStorageSettings();

      this.loginService.loadStorageSettings().then(
          result => {
              self.checkServer();
            }
      );
  }

  checkServer() {
    let self = this;
    // invoke the status function until a connection is made;
    // switch the view (hide / show the login box - app address box)
    self.loginService.status(function (status: boolean, data:any) {
      return self.updateStatusCallback(status, data);
    });
  }

  updateStatusCallback(status: boolean, data:any) {
    // console.log('Status received', status, data);
    let self=this;
    // console.log('Status received', status, data);
    if (status ) {
      self.liveService.user.errorMessage = 'Connessione ok.';// + '('+data.id+')';

      self.downloadSettings();

    } else { // ! status
      // il webservice non è connesso al server HappyOrder
      // console.log('not status!',data);
      self.liveService.user.errorMessage = 'Connessione fallita: '+data.error + '. Riprovo.';// + '('+data.id+')';
      setTimeout( () => {
          console.log('Nuovo tentativo di connessione al server in 3 secondi...')
          self.checkServer();
        }, 3000);
    }
  }

  downloadSettings() {
    let self = this;
    self.loginService.downloadSettings(function (data) {
      if (self.liveService.settings && self.liveService.user.autoLogin ) {
        self.liveService.user.errorMessage = 'Impostazioni scaricate, accesso in corso  '
        self.performLogin();
      }
    });
  }

  handleLoginSubmit(event) {
    // console.log(event)
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    this.performLogin();
  }

  performLogin() {
      // console.log('login');

      let self = this;
      this.loginService.login(function(data:any) {
          // self.nav.setRoot(TeamsPage);

          // let's find the user in the settings:
          // just a few quick tests:
          // let sysclerk = self.liveService.settings.clerks.byId(data.clerk.id);
          // let item = self.liveService.settings.items.byId(78);
          // console.log('SYSCLERK',sysclerk,'ITEM',item);
         // console.log('Loggato (login.ts callback)!', data);
          if (data.tableId>0 ) {
            self.liveService.user.tableId = data.tableId;
            self.liveService.user.defaultTableId = data.tableId;
            self.liveService.cart.idTavolo = data.tableId;
            self.liveService.user.table =
                self.liveService.settings.tables.table.byId(data.tableId);

            // is this main or secondary display? does it matter? yes!
            if ((! self.liveService.user.extraDisplay)
              && (self.liveService.user.extraDisplayName == '')) {
              // console.log('Interfaccia principale');
              self.cartService.openTable(self.liveService.user.table, function(tableData) {
                // console.log('openTable 3 callback',tableData);
                self.navCtrl.setRoot(OrderPage);
              });


            } else {
              //console.log('Interfaccia client display');
              self.navCtrl.setRoot(CartPage);
            }
          } else {
            self.navCtrl.setRoot(TavoliPage);
          }
      });
  }
  gotoSettings() {
    this.navCtrl.setRoot(SettingsPage);
  }
}
