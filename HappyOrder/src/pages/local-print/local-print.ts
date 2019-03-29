import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LiveService } from '../../services/live.service';
import { LoginService } from '../../services/login.service';
import { CartService } from '../../services/cart.service';
// import { bixolon } from 'cordova-plugin-bixolon-print';
import { CartComponent } from '../../components/cart/cart';
import { OrderPage } from '../../pages/order/order';
//import { Bixolon } from '@ionic-native/bixolon';
//import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
//import { Printer } from '@ionic-native/printer';
import { StarPRNT } from '@ionic-native/star-prnt';
/**
 * Generated class for the LocalPrintPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
import { Cart } from '../../models/cart';
import { templateJitUrl } from '@angular/compiler';

@Component({
  selector: 'page-local-print',
  templateUrl: 'local-print.html',
})
export class LocalPrintPage {
  public debugInfo: any;
  private printer: any;
  // @ViewChild(CartComponent) cartComponent: CartComponent;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private liveService: LiveService,
    private cartService: CartService,
    private loginService: LoginService,
    private starprnt: StarPRNT,
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
  print() {
    console.log('printing');
    console.log(this.starprnt);
    let printObj = {
      text: "Star Clothing Boutique\n123 Star Road\nCity, State 12345\n\n",
      cutReceipt: true,
      openCashDrawer: false
    }

    this.starprnt.printRawText('TCP:192.168.10.61', 'EscPosMobile', printObj)
      .then(result => {
        console.log('Success!');
      })

  }
  printChromeSocket() {
    (<any>window).chrome.sockets.tcp.create({}, createInfo => {
      let socketTcpId = createInfo.socketId;
      (<any>window).chrome.sockets.tcp.connect(socketTcpId, "192.168.10.61", 9100, result => {
        console.log("Connected to printerXXX");
      });
    });
  }
  printSocketIo() {
    let socket = window["io"]('192.168.10.61', {
      secure: false,
      port: 9100
    });
    socket.on('connect', function () {
      console.log('Print SOCKET CONNECT event');

    });
  }


  printX() {
    console.log('beginning local print');
    let self = this;
    //console.log(this.bixolon);
    // if (window.plugins.printer) {
    //   //let res = this.printer.check();//;
    //   this.debugInfo = JSON.stringify(this.printer);//res);
    //   //.write('hello world').then(self.writeSuccess).catch(err => { self.writeFail(err); });
    // }

    if (this.printer) {
      //let res = this.printer.check();//;
      console.error('printer found');
      this.debugInfo = JSON.stringify(this.printer);//res);
      console.log('printer found', this.printer);
      if (this.printer.isAvailable()) {
        console.log('printer is available');
        let printout = 'prima riga\n';
        this.liveService.cart.items.forEach(item => {
          printout += (item.descrizione + ' ' + item.prezzo + '\n');
        });
        printout += ('-----------');
        printout += ('ultima riga');
        this.printer.print(printout, { name: 'document.txt', printerId: 'TCP:192.168.10.61' });
      }
      else {
        console.log('printer is not available');
        this.cartService.toastAndVibrate('Stampante non disponibile', this.liveService.messageTypes.localError);

      }
      //.write('hello world').then(self.writeSuccess).catch(err => { self.writeFail(err); });
    }
    else {
      console.error('printer package not available');
      this.debugInfo = 'printer package not available';
    }
  }
  back() {
    this.navCtrl.setRoot(OrderPage);
  }

  pick() {
    if (this.printer && this.printer.pick) {
      this.printer.pick();
    }
  }
}
