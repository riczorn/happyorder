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
  selector: 'popover-lastorders',
  templateUrl: 'popover-lastorders.html'
})
export class PopoverLastordersComponent {
  private orders: any;
  
  constructor(public viewCtrl: ViewController, public navParams:NavParams) {
    //console.log('popover last loading');
    this.orders = navParams.data.orders;
  }

  close(action, orderId) {
    // console.log('close',param, this.password, this.selectedClerk.serial);
    action = action?action:'cancel';
    switch (action) {
      case 'print':
          let exitParams = {
            action:action,
            orderId:orderId};
        // console.log('exitParams: ',exitParams);
        this.viewCtrl.dismiss(exitParams);
        break;
      default: this.viewCtrl.dismiss({action:'cancel'});
        break;
    }
  }  
}
