import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LiveService } from '../../services/live.service';
import { LoginService } from '../../services/login.service';
import { CartService } from '../../services/cart.service';
// import { bixolon } from 'cordova-plugin-bixolon-print';
import { CartComponent } from '../../components/cart/cart';
import { OrderPage } from '../../pages/order/order';
import { Bixolon } from '@ionic-native/bixolon';
/**
 * Generated class for the LocalPrintPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-local-print',
  templateUrl: 'local-print.html',
})
export class LocalPrintPage {
  //@ViewChild(CartComponent) cartComponent: CartComponent;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private liveService: LiveService,
    private cartService: CartService,
    private loginService: LoginService,
    private bixolon: Bixolon) {
  }

  ionViewDidLoad() {

    console.log('ionViewDidLoad LocalPrintPage');
    this.liveService.localPrint();
  }

  print() {
    console.log('beginning local print');
    console.log(this.bixolon);

  }
  back() {
    this.navCtrl.setRoot(OrderPage);
  }
}
