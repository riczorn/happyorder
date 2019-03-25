import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LiveService } from '../../services/live.service';
import { LoginService } from '../../services/login.service';
import { CartService } from '../../services/cart.service';
// import { bixolon } from 'cordova-plugin-bixolon-print';
import { CartComponent } from '../../components/cart/cart';
import { OrderPage } from '../../pages/order/order';
import { Bixolon } from '@ionic-native/bixolon';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
/**
 * Generated class for the LocalPrintPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
import { Cart } from '../../models/cart';

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
    // private bixolon: Bixolon,
    private bluetoothSerial: BluetoothSerial) {
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
    console.log('beginning local print');
    let self = this;
    //console.log(this.bixolon);
    if (this.bluetoothSerial && this.bluetoothSerial.write) {
      this.bluetoothSerial.write('hello world').then(self.writeSuccess).catch(err => { self.writeFail(err); });
    } else {
      console.error('bluetoothSerial not available');
    }
  }
  back() {
    this.navCtrl.setRoot(OrderPage);
  }
}
