/**
  * HappyOrder app for phones
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */

import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';// , Platform, NavController, NavParams

@Component({
  selector: 'popover-cart',
  templateUrl: 'popover-cart.html'
})
export class PopoverCartComponent {
  private item: any;
  private cart: any;

  constructor(public viewCtrl: ViewController, public navParams:NavParams) {
    this.item = navParams.data.item;
    this.cart = navParams.data.cart;
  }

  close(param) {
    param = param?param:'';
    this.viewCtrl.dismiss(param);
  }
}
