/**
*  HappyOrder app
*  cart service. Gestisce gli ordini, carica e invia il carrello al backend node.
*
* @package    HappyOrder
* @author     Riccardo Zorn <code@fasterjoomla.com>
* @copyright  2002 - 2017 Riccardo Zorn
* @license    GNU General Public License version 2 or later; see LICENSE.txt
*/

import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
// import {Observable} from 'rxjs/Observable';
import { Platform, ToastController } from 'ionic-angular';

import 'rxjs/add/operator/map';

import { Cart } from '../models/cart';
import { LiveService } from '../services/live.service';
import { Vibration } from '@ionic-native/vibration';
// import { Toast } from '@ionic-native/toast';

@Injectable()

export class CartService {
  public carts: Array<Cart>;
  private response: any;
  private isToasting: boolean;

  /**
  * Nota: "private" http crea un oggetto private this.http automaticamente.
  *
  * @param http
  */
  constructor(private http: Http,
    private liveService: LiveService,
    // private toast: Toast,
    private toastCtrl: ToastController,
    private vibration: Vibration,
    private platform: Platform,
  ) {
    // this.liveService.schemas = [];
    this.isToasting = false;
  }

  sendCart(cart: Cart, action: number, successCallback?: Function) {
    let self = this;
    // console.log('sendCart - service', cart);
    cart.action = action ? action : cart.getAction();
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    // headers.append("Accept", 'application/json');
    //     headers.append('Content-Type', 'application/json' );
    let options = new RequestOptions({ headers: headers, method: "post" });

    if (!self.handleDemo(successCallback))
      try {
        // these two vars will be used later to inform the user of what happened..
        let cartDoc = cart.doc.tipoDocumento;
        let cartActionStorno = cart.action & cart.cartActions.orderStorno;
        return this.http.post(this.liveService.getUrl('cart'),
          'cart=' + JSON.stringify(cart),
          options) // 'mock/login.json')
          //.map(res => res.json())
          .map(res => this.liveService.parseResponse(res))
          // .catch(this.liveService.handleError)
          .subscribe(res => {
            // console.log('cart response from server: ', res);
            this.response = res;
            // this.updateLiveServiceWithLoginData();
            // console.log('21');

            if (res.status && res.status == 'ok') {
              // console.log("cart successCallback", typeof successCallback);
              if (successCallback !== null && (typeof successCallback == 'function')) {
                successCallback(res);
              }
              let message = 'Ordine inviato';
              if (cartDoc > 0) {
                message = 'Documento stampato';
              } else if (cartActionStorno) {
                message = 'Storno ok';
              } else if (cart.action == 16) {
                message = 'Tavolo spostato';
              }
              self.toastAndVibrate(message,
                this.liveService.messageTypes.success);

              return true;
            } else {
              self.toastAndVibrate(`Errore ` + JSON.stringify(res), this.liveService.messageTypes.localError);
              return false; // ERROR in cart response!
              //return this.response.status == 'ok';
            }
          });

      } catch (e) {
        this.response = { status: 'ko', message: 'Richiesta al server fallita ' + JSON.stringify(e.message ? e.message : e) };
        console.error('Error spawning login request', e);
      }
  }

  /**
   * Show a toast, and if appropriate, vibrate and play audio
   * based on the user settings.
   * Each message type (liveService.messageTypes) has a 
   * different sound, except for tick that has 5.
   * 
   * @param toastMessage 
   * @param messageKind 
   */
  toastAndVibrate(
    toastMessage: string,
    messageKind: string) {
    let self = this;
    let isError = messageKind == this.liveService.messageTypes.localError
      || messageKind == this.liveService.messageTypes.remoteError;

    // console.log('toastAndVibrate', toastMessage);;

    let toastTimeout: number = 1200,
      toastPosition: string = 'top',
      vibrations: Array<number> = [0, 0, 50];

    if (isError) {
      toastTimeout = 2200;
      toastPosition = 'top';//s'middle';
      vibrations = [0, 0, 150, 50, 150, 50, 250];
    }
    // console.log('  toastAndVibrate', toastMessage);;
    if (!self.isToasting) {
      self.isToasting = true;
      let toast = self.toastCtrl.create({
        message: toastMessage,
        duration: toastTimeout,
        position: toastPosition,
        // dismissOnPageChange: true
        // showCloseButton: true,
        // closeButtonText:'x',
      });
      toast.onDidDismiss(() => {
        // console.log('Dismissed toast');
        self.isToasting = false;
      });

      toast.present();
    }

    try {

      // console.log('  toastAndVibrate vibrate', vibrations);;
      // self.toast.show(toastMessage, toastTimeout, toastPosition).subscribe(
      //   toast => {
      //     console.log('t err',toast);
      //   }
      // );

      // setTimeout(() => {if (toast) {toast.dismiss();}},2000);
      // console.log('toast presented',rtoast,toast);

      if (self.platform.is('cordova') &&
        (this.liveService.options.Feedback == 'vibrate' ||
          this.liveService.options.Feedback == 'sound') &&
        this.vibration && this.vibration.vibrate) {
        try {
          this.vibration.vibrate(vibrations);
        } catch (e) {
          console.error('this.vibration.vibrate unavailable', e);
          throw ('this.vibration.vibrate unavailable: ' + e);
        }
      }

      if ( //self.platform.is('cordova')  &&
        (this.liveService.options.Feedback == 'sound')
        //&& self.audioEnabled
      ) {
        // console.log('toastAndVibrate: now make sound.');
        if (messageKind == this.liveService.messageTypes.tick) {
          messageKind = messageKind + "" + (Math.trunc(Math.random() * 50) % 5 + 1);
        }
        var audio = new Audio("./assets/sounds/" + messageKind + ".wav");
        audio.play();
        //self.makeTickSound();

      }
    } catch (e) {
      console.error('toasting', e);
    }
  }


  /**
  *  download updated data for this table, including open orders, status, and current cart
  *  this will replace the current cart contents.
  */
  openTable(table, successCallback) {
    // vuota carrello, imposta elementi, listino, idordine ecc.
    // this.liveService.cart.
    // this.liveService.listino.
    let cart = this.liveService.cart;
    let self = this;
    cart.empty();
    cart.loading = true;
    self.liveService.connected = false;
    self.liveService.connectionStatus.connected = false;
    if (!self.handleDemo(successCallback))
      try {
        //, {tableId: table.id} trova modo di aggiungere i parametri.
        // in post li mettiamo altrove ma qui sta a getUrl la responsabilità?
        let url = self.liveService.getUrl('table', { tableId: table.id, clerkId: self.liveService.user.clerkId });
        // console.log('url table', url);
        return self.http.get(url)
          .map(res => self.liveService.parseResponse(res))
          .subscribe(
            res => {
              // console.log('table response from server: ', res);
              if (res && res.status == 'ok') {
                // console.log('Risultato ok');
              }


              self.liveService.user.table = table;
              self.liveService.user.tableId = table.id;
              self.liveService.cart.empty();
              self.liveService.cart.idTavolo = table.id;
              if (res.orderitems && res.orderitems.priceList) {
                self.liveService.cart.listino = res.orderitems.priceList;
              } else {
                self.liveService.cart.listino = table.listino;
              }
              self.liveService.cart.idOrdine = -1;
              if (res.orderitems && res.orderitems.id) {
                self.liveService.cart.idOrdine = res.orderitems.id;
                for (let item of res.orderitems.orderitem) {

                  self.liveService.cart.add(item, item.qt);

                }
              }




              if (typeof successCallback == "function") {
                // console.log('status self',self,'this',this);
                successCallback(res);
              }

              setTimeout(() => {
                self.liveService.connected = true;
                self.liveService.connectionStatus.connected = true;

              }, 500);

            },
            err => {
              console.error('FAIL table response from server: ', err);
              // errore principale se il server node non è raggiungibile:
              successCallback({ status: 'ko', error: 'Server node non disponibile / CORS' });
              //+"\n"+JSON.stringify(err)});
            },
            () => {
              // console.log('FINISH status response from server 2')
            }
          );

      } catch (e) {
        // self.error('Richiesta status al server fallita ' + JSON.stringify(e));
        console.error('Richiesta table al server fallita - Error spawning table request', e);
        if (typeof successCallback == "function") {
          successCallback(self.liveService.connected, { status: 'ko', error: 'Server non disponibile' });
        }
      }
  }
  handleDemo(callback?: Function) {
    let self = this;
    if (self.liveService.settings.demo) {
      if (typeof callback == "function") {
        // console.log('status self',self,'this',this);
        callback({ "status": "ok" });
      }
      return true;
    }
    return false;
  }
  /**
  * Retrieve and apply the updated state of the tables
  */
  updateTables(successCallback?: Function) {
    // console.log('tables - service');;
    var self = this;
    // headers.append('keys', '');
    self.liveService.connected = false;
    self.liveService.connectionStatus.connected = false;

    if (!self.handleDemo(successCallback))
      try {
        return self.http.get(self.liveService.getUrl('tables', { clerkId: self.liveService.user.clerkId }))
          .map(res => self.liveService.parseResponse(res))
          .subscribe(
            res => {
              // console.log('tables response from server: ', res);
              res.status = res.status ? res.status : 'ok';
              self.liveService.connected = true;
              self.liveService.connectionStatus.connected = true;

              for (let i = 0; i < self.liveService.settings.tables.table.length; i++) {
                let table = self.liveService.settings.tables.table[i];
                table.state = res.tableStates[i];
              }
              if (typeof successCallback == "function") {
                // console.log('status self',self,'this',this);
                successCallback(res);
              }
            },
            err => {
              console.error('FAIL tables response from server: ', err);
              // errore principale se il server node non è raggiungibile:
              if (typeof successCallback == "function") {
                successCallback({ status: 'ko', command: 'tables', error: 'Server node non disponibile / CORS' });
              }
              //+"\n"+JSON.stringify(err)});
            },
            () => {
              // console.log('FINISH status response from server 2')
            }
          );

      } catch (e) {
        // self.error('Richiesta status al server fallita ' + JSON.stringify(e));
        console.error('Richiesta tables al server fallita - Error spawning status request', e);
        if (typeof successCallback == "function") {
          successCallback(self.liveService.connected, { status: 'ko', error: 'Server non disponibile' });
        }
      }

  }

  /**
   *  download a list of latest orders
   */
  getLastOrders(table, successCallback) {
    //let cart = this.liveService.cart;
    let self = this;

    if (!self.handleDemo(successCallback))
      try {
        let url = self.liveService.getUrl('get-last-orders', { tableId: table.id, clerkId: self.liveService.user.clerkId });
        return self.http.get(url)
          .map(res => self.liveService.parseResponse(res))
          .subscribe(
            res => {
              //console.log('getLastOrders response from server: ', res);
              if (res) {
                if (res.status == 'ok') {
                  // console.log('Risultato ok');
                }
              }

              if (typeof successCallback == "function") {
                // console.log('status self',self,'this',this);
                successCallback(res);
              }
            },
            err => {
              console.error('FAIL getLastOrders response from server: ', err);
              // errore principale se il server node non è raggiungibile:
              successCallback({ status: 'ko', error: 'Impossibile recuperare ultimi ordini' });
              //+"\n"+JSON.stringify(err)});
            },
            () => {
              // console.log('FINISH status response from server 2')
            }
          );

      } catch (e) {
        // self.error('Richiesta status al server fallita ' + JSON.stringify(e));
        console.error('Richiesta getLastOrders al server fallita - Error spawning getLastOrders request', e);
        if (typeof successCallback == "function") {
          successCallback(self.liveService.connected, { status: 'ko', error: 'Server non disponibile' });
        }
      }
  }

  /**
   * Find and return a gutschein / fidelity status and value.
   * @param code 
   */
  async getFidelityInfo(code, successCallback) {
    let self = this;
    if (!self.handleDemo(successCallback))
      try {
        let url = self.liveService.getUrl('get-fidelity-info',
          {
            tableId: self.liveService.user.tableId,
            clerkId: self.liveService.user.clerkId,
            code: code
          });
        return self.http.get(url)
          .map(res => self.liveService.parseResponse(res))
          .subscribe(
            res => {
              //console.log('getLastOrders response from server: ', res);
              if (res) {
                if (res.status == 'ok') {
                  // console.log('Risultato ok');
                }
              }

              if (typeof successCallback == "function") {
                //console.log('getFidelityInfo callback res',res);
                successCallback(res);
              }
            },
            err => {
              console.error('FAIL getLastOrders response from server: ', err);
              // errore principale se il server node non è raggiungibile:
              successCallback({ status: 'ko', error: 'Impossibile recuperare ultimi ordini' });
              //+"\n"+JSON.stringify(err)});
            },
            () => {
              // console.log('FINISH status response from server 2')
            }
          );

      } catch (e) {
        // self.error('Richiesta status al server fallita ' + JSON.stringify(e));
        console.error('Richiesta getLastOrders al server fallita - Error spawning getLastOrders request', e);
        if (typeof successCallback == "function") {
          successCallback(self.liveService.connected, { status: 'ko', error: 'Server non disponibile' });
        }
      }
  }
  /**
   * create a new gutschein / fidelity by value.
   * invokes the webservice which translates to xml and invokes the
   * backend server
   * 
   * gutscheinCode is passed only for fixed-fidelity (unnumbered) where all fidelity cards default back to one.
   * @param code 
   */
  createFidelity(amount, gutscheinCode, successCallback) {
    let self = this;

    try {
      let url = self.liveService.getUrl('create-fidelity',
        {
          tableId: self.liveService.user.tableId,
          clerkId: self.liveService.user.clerkId,
          code: gutscheinCode,
          importo: amount
        });
      return self.http.get(url)
        .map(res => self.liveService.parseResponse(res))
        .subscribe(
          res => {
            //console.log('getLastOrders response from server: ', res);
            if (res) {
              if (res.status == 'ok') {
                // console.log('Risultato ok');
              }
            }

            if (typeof successCallback == "function") {
              // console.log('status self',self,'this',this);
              successCallback(res);
            }
          },
          err => {
            console.error('FAIL getLastOrders response from server: ', err);
            // errore principale se il server node non è raggiungibile:
            successCallback({ status: 'ko', error: 'Impossibile recuperare ultimi ordini' });
            //+"\n"+JSON.stringify(err)});
          },
          () => {
            // console.log('FINISH status response from server 2')
          }
        );

    } catch (e) {
      // self.error('Richiesta status al server fallita ' + JSON.stringify(e));
      console.error('Richiesta getLastOrders al server fallita - Error spawning getLastOrders request', e);
      if (typeof successCallback == "function") {
        successCallback(self.liveService.connected, { status: 'ko', error: 'Server non disponibile' });
      }
    }
  }
  /**
   * Print a copy of a non-printed document (quittung etc.)
   * @param orderId 
   * @param successCallback 
   */
  printDoc(orderId, tipoDocumento, successCallback) {
    let self = this;
    if (!self.handleDemo(successCallback))
      try {
        //, {tableId: table.id} trova modo di aggiungere i parametri.
        // in post li mettiamo altrove ma qui sta a getUrl la responsabilità?
        let url = self.liveService.getUrl('printdoc', {
          orderId: orderId,
          tableId: this.liveService.cart.idTavolo,
          clerkId: self.liveService.user.clerkId,
          docType: tipoDocumento
        });
        // console.log('url table', url);
        return self.http.get(url)
          .map(res => self.liveService.parseResponse(res))
          .subscribe(
            res => {
              //console.log('printDoc response from server: ', res);
              if (res) {
                if (res.status == 'ok') {
                  console.log('Risultato ok');
                }
              }

              // self.liveService.cart.idOrdine = res.orderitems.id?res.orderitems.id:-1;


              if (typeof successCallback == "function") {
                // console.log('status self',self,'this',this);
                successCallback(res);
              }
            },
            err => {
              console.error('FAIL printDoc response from server: ', err);
              // errore principale se il server node non è raggiungibile:
              successCallback({ status: 'ko', error: 'Impossibile ristampare documento' });
              //+"\n"+JSON.stringify(err)});
            },
            () => {
              // console.log('FINISH status response from server 2')
            }
          );

      } catch (e) {
        // self.error('Richiesta status al server fallita ' + JSON.stringify(e));
        console.error('Richiesta getLastOrders al server fallita - Error spawning getLastOrders request', e);
        if (typeof successCallback == "function") {
          successCallback(self.liveService.connected, { status: 'ko', error: 'Server non disponibile' });
        }
      }
  }

}
