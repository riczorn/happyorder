/**
*  HappyOrder app
*  cart service. Gestisce gli ordini, carica e invia il carrello al backend node.
*
* @package    HappyOrder
* @author     Riccardo Zorn <code@fasterjoomla.com>
* @copyright  2002 - 2017 Riccardo Zorn
* @license    GNU General Public License version 2 or later; see LICENSE.txt
*/

import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
// import {Observable} from 'rxjs/Observable';
import { Platform, ToastController } from 'ionic-angular';

import 'rxjs/add/operator/map';

import {Cart} from '../models/cart';
import {LiveService} from '../services/live.service';
import { Vibration } from '@ionic-native/vibration';
// import { Toast } from '@ionic-native/toast';

@Injectable()

export class CartService {
  public carts:Array<Cart>;
  private response:any;
  private isToasting: boolean;

  /**
  * Nota: "private" http crea un oggetto private this.http automaticamente.
  *
  * @param http
  */
  constructor(private http:Http,
    private liveService:LiveService,
    // private toast: Toast,
    private toastCtrl: ToastController,
    private vibration: Vibration,
    private platform:Platform,
  ) {
    // this.liveService.schemas = [];
    this.isToasting = false;
  }

  sendCart(cart: Cart, action:number, successCallback?:Function) {
    let self = this;
    // console.log('sendCart - service', cart);
    cart.action = action?action:cart.getAction();
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    // headers.append("Accept", 'application/json');
    //     headers.append('Content-Type', 'application/json' );
    let options = new RequestOptions({ headers: headers, method:"post" });

    try {
      // these two vars will be used later to inform the user of what happened..
      let cartDoc = cart.doc.tipoDocumento;
      let cartActionStorno = cart.action & cart.cartActions.orderStorno;
      return this.http.post(this.liveService.getUrl('cart'),
      'cart='+JSON.stringify(cart),
      options) // 'mock/login.json')
      //.map(res => res.json())
      .map(res => this.liveService.parseResponse(res))
      // .catch(this.liveService.handleError)
      .subscribe(res => {
        // console.log('cart response from server: ', res);
        this.response = res;
        // this.updateLiveServiceWithLoginData();
        // console.log('21');

        if (res.status && res.status=='ok') {
          // console.log("cart successCallback", typeof successCallback);
          if (successCallback !== null && (typeof successCallback == 'function')) {
            successCallback(res);
          }
          let message='Ordine inviato';
          if (cartDoc>0) {
            message = 'Documento stampato';
          } else if (cartActionStorno ) {
            message = 'Storno ok';
          } else if (cart.action ==16 ) {
            message = 'Tavolo spostato';
          }
          self.toastAndVibrate(message,false);

          return true;
        } else {
          self.toastAndVibrate(`Errore `+JSON.stringify(res),true);
          return false; // ERROR in cart response!
          //return this.response.status == 'ok';
        }
      });

    } catch (e) {
      this.response = {status: 'ko', message: 'Richiesta al server fallita ' + JSON.stringify(e.message?e.message:e)};
      console.error('Error spawning login request', e);
    }
  }

  toastAndVibrate(
    toastMessage: string,
    isError: boolean) {
      let self = this;

      // console.log('toastAndVibrate', toastMessage);;

      let toastTimeout: number =1200,
          toastPosition: string='top',
          vibrations: Array<number> = [0,0,50];
      if  (isError) {
        toastTimeout = 2200;
        toastPosition = 'top';//s'middle';
        vibrations = [0,0,150,50,150,50,250];
      }
      // console.log('  toastAndVibrate', toastMessage);;
      if (!self.isToasting) {
        self.isToasting = true;
        let toast = self.toastCtrl.create({
          message: toastMessage,
          duration: toastTimeout,
          position:  toastPosition,
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
            self.vibration &&
            self.vibration.vibrate) {
          self.vibration.vibrate(vibrations);
        }
      } catch(e) {
        console.error('toasting',e);
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

      try {
        //, {tableId: table.id} trova modo di aggiungere i parametri.
        // in post li mettiamo altrove ma qui sta a getUrl la responsabilità?
        let url = self.liveService.getUrl('table', {tableId: table.id, clerkId: self.liveService.user.clerkId});
        // console.log('url table', url);
        return self.http.get(url)
        .map(res => self.liveService.parseResponse(res))
        .subscribe(
          res => {
            // console.log('table response from server: ', res);
            if (res)
            {
              if (res.status=='ok') {
                // console.log('Risultato ok');
              }
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
            self.liveService.cart.idOrdine = res.orderitems.id?res.orderitems.id:-1;
            for (let item of res.orderitems.orderitem) {

              self.liveService.cart.add(item, item.qt);

            }


            if (typeof successCallback == "function") {
              // console.log('status self',self,'this',this);
              successCallback(res);
            }
          },
          err=>{
            console.error('FAIL table response from server: ', err);
            // errore principale se il server node non è raggiungibile:
            successCallback({status:'ko',error:'Server node non disponibile / CORS'});
            //+"\n"+JSON.stringify(err)});
          },
          ()=>{
            // console.log('FINISH status response from server 2')
          }
        );

      } catch (e) {
        // self.error('Richiesta status al server fallita ' + JSON.stringify(e));
        console.error('Richiesta table al server fallita - Error spawning table request', e);
        if (typeof successCallback == "function") {
          successCallback(self.liveService.connected, {status:'ko',error:'Server non disponibile'});
        }
      }
    }

    /**
    * Retrieve and apply the updated state of the tables
    */
    updateTables(successCallback?:Function) {
      // console.log('tables - service');;
      var self = this;
      // headers.append('keys', '');
      self.liveService.connected = false;
      try {
        return self.http.get(self.liveService.getUrl('tables', {clerkId: self.liveService.user.clerkId}))
        .map(res => self.liveService.parseResponse(res))
        .subscribe(
          res => {
            // console.log('tables response from server: ', res);
            res.status = res.status?res.status:'ok';
            for (let i=0; i< self.liveService.settings.tables.table.length; i++) {
              let table = self.liveService.settings.tables.table[i];
              table.state = res.tableStates[i];
            }
            if (typeof successCallback == "function") {
              // console.log('status self',self,'this',this);
              successCallback(res);
            }
          },
          err=>{
            console.error('FAIL tables response from server: ', err);
            // errore principale se il server node non è raggiungibile:
            if (typeof successCallback == "function") {
              successCallback({status:'ko',command:'tables',error:'Server node non disponibile / CORS'});
            }
            //+"\n"+JSON.stringify(err)});
          },
          ()=>{
            // console.log('FINISH status response from server 2')
          }
        );

      } catch (e) {
        // self.error('Richiesta status al server fallita ' + JSON.stringify(e));
        console.error('Richiesta tables al server fallita - Error spawning status request', e);
        if (typeof successCallback == "function") {
          successCallback(self.liveService.connected, {status:'ko',error:'Server non disponibile'});
        }
      }

    }
  }
