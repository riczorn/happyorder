import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LiveService } from '../../services/live.service';
import { LoginService } from '../../services/login.service';
import { CartService } from '../../services/cart.service';
// import { bixolon } from 'cordova-plugin-bixolon-print';
import { CartComponent } from '../../components/cart/cart';
import { OrderPage } from '../../pages/order/order';
// import { Bixolon } from '@ionic-native/bixolon';
//import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
// import { Socket } from 'cordova-plugin-socket-tcp';
//import { Socket } from 'cordova-chrome-net';
/**
 * Generated class for the LocalPrintPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
import { Cart } from '../../models/cart';

import { Http, Headers } from '@angular/http';
// import { Socket } from 'net';
// import { SocketsForCordova } from 'cordova-plugin-socket-tcp';

// var net = require('cordova-chrome-net');
// import TCPSocket from 'emailjs-tcp-socket'//

@Component({
  selector: 'page-local-print',
  templateUrl: 'local-print.html',
})
export class LocalPrintPage {
  // @ViewChild(CartComponent) cartComponent: CartComponent;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private liveService: LiveService,
    private cartService: CartService,
    private loginService: LoginService,
    private http: Http,
    // private socket: Socket,
    // private bixolon: Bixolon,
    //private bluetoothSerial: BluetoothSerial
  ) {
  }

  ionViewDidLoad() {

    console.log('ionViewDidLoad LocalPrintPage');
    this.liveService.localPrint();
  }

  writeSuccess(data) {
    console.log('write success', data);
  }
  writeFail(err) {
    console.error('write FAIL', err);
  }

  makeLen(s, len) {
    s += '                                                                              ';
    return s.substring(0, len - 1);
  }
  makeNum(num, len?) {
    let result = num.toFixed(2);
    if (len) {
      while (result.length < len) { result = ' ' + result; }
    }
    return result.replace('.', ',');
  }
  print() {
    console.log('XSprinting');
    // see bixolon SRP350plusIII for escpos reference.
    let ESC = String.fromCharCode(27);
    let E00 = String.fromCharCode(0);
    let E01 = String.fromCharCode(1);
    let E02 = String.fromCharCode(2);
    let E04 = String.fromCharCode(4);
    let E16 = String.fromCharCode(16);
    let E19 = String.fromCharCode(19);
    let GS = String.fromCharCode(29);
    //let DOUBLEHEIGHT = 

    let printout = ESC + GS + 't' + E04;
    printout += // ESC + 'R' + E02 + // codepage deutsch
    /**/        ESC + 't' + E16 + // codepage 1252
    //*/        ESC + 't' + E19 + // codepage 858
    /**/        ESC + 'a1' + // centered
    /**/        ESC + '!' + E16 + // double height
    /**/        'Osteria La Fenice\n' +
    /**/        ESC + '!' + E00;  // single height

    printout += 'Inh. Massimo Milan\n';
    printout += 'Nordersteinstraße 6\n';
    printout += '27472 Cuxhaven\n';
    printout += 'St. Nr. 18/130/02344\n\n';
    printout += 'Tel. 04721 6984151\n';
    printout += 'osterialafenicecuxaven@gmail.com\n\n';
    printout += ESC + 'a0'; // left

    printout += 'Tisch  ' + this.makeLen(this.liveService.cart.idTavolo, 4) + '           Kellner: Chef\n\n';
    let prog = Math.round((300 + Math.random() * 1000));
    let date = new Date();
    //let sdate = `${date.getDay()}.$.2d{date.getMonth()}.${date.getFullYear()}`;
    let sdate = date.toLocaleDateString('de-DE').split('.');
    if (sdate[0].length === 1) sdate[0] = '0' + sdate[0];
    if (sdate[1].length === 1) sdate[1] = '0' + sdate[1];
    let totals = {
      date: sdate.join('.'),
      totalf: this.liveService.cart.totals.totale,
      total: '0',
      totalR: '0',
      vatp: 19,
      netto: '0',
      vat: '0',
    }
    totals.total = this.makeNum(totals.totalf);
    totals.totalR = this.makeNum(totals.totalf, 7);
    totals.netto = this.makeLen(this.makeNum((totals.totalf / (1 + totals.vatp / 100))), 12);
    totals.vat = this.makeLen(this.makeNum((totals.totalf * (totals.vatp / 100))), 9);

    printout += 'Rechnung Nr. B' + prog +
      ' vom ' + totals.date + '\n\n';

    printout += 'Menge     Beschreibung     Betrag    MwSt\n';
    printout += '- - - - - - - - - - - - - - - - - - - -\n';



    this.liveService.cart.items.forEach(item => {
      let itemPrint = {
        qt: this.makeLen(item.quantita, 8),
        desc: this.makeLen(item.descrizione, 22),
        price: this.makeLen(this.makeNum(item.prezzo), 9)
      }
      printout += `${itemPrint.qt}${itemPrint.desc} ${itemPrint.price}  ${totals.vatp}\n`;
    });
    printout += '- - - - - - - - - - - - - - - - - - - -\n';

    printout += (`             Zwischensumme: ${totals.total}\n`);

    printout += ('Euro\n\n');
    printout += ('MwSt %       Netto        MwSt     Brutto\n');
    printout += (`    ${totals.vatp}        ${totals.netto} ${totals.vat}${totals.totalR}\n\n`);

    printout += ESC + '!' + E16 + // double height
      ESC + 'a2' + // right
      `            Betrag bezahlt:${totals.totalR} Euro \n` +
      GS + 'VB' + E16 // cut the last param is the distance to feed before cutting

    let response;
    console.log('printing ', printout);

    try {
      var headers = new Headers();
      headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json');
      return this.http.post('http://192.168.10.2:8080',
        { printData: printout },
        {
          headers: headers
        }) // 'mock/login.json')
        //.map(res => res.json())
        .map(res => this.liveService.parseResponse(res))
        // .catch(this.liveService.handleError)
        .subscribe(res => {
          // console.log('login response from server: ', res);
          response = res;
          // in case of a remote settings.json, the login will contain the settings, and need to be applied.
          console.log('print', res);

          return true; // not logged in!
          //return this.response.status == 'ok';
        });

    } catch (e) {
      response = { status: 'ko', message: 'Richiesta al server fallita ' + JSON.stringify(e.message ? e.message : e) };
      console.error('Error spawning login request', e);
    }

    /*var client = new net.Socket();
    client.connect(9100, '192.168.10.61', function () {
      console.log('Connected');
      client.write('oriva\nprova');
    });

    client.on('data', function (data) {
      console.log('Received: ' + data);
      client.destroy(); // kill client after server's response
    });*/
    //console.log(this.socket);
    /*let socket = window["io"]('http://192.168.10.61:9100', {
      secure: false,
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      port: 9100,
    });
    console.log('socket', socket);*/
  }
  printX() {
    console.log('beginning local print');
    let self = this;
    //console.log(this.bixolon);
    /*if (this.bluetoothSerial && this.bluetoothSerial.write) {
      this.bluetoothSerial.write('hello world').then(self.writeSuccess).catch(err => { self.writeFail(err); });
    } else {
      console.error('bluetoothSerial not available');
    }*/
  }
  back() {
    this.navCtrl.setRoot(OrderPage);
  }
}
