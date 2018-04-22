import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';// , Platform, NavController, NavParams

/**
 * Generated class for the PopoverLastordersComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'popover-lastorders',
  templateUrl: 'popover-lastorders.html'
})
export class PopoverLastordersComponent {
  private orders: any;
  
  constructor(public viewCtrl: ViewController, public navParams:NavParams) {
    console.log('popover last loading');
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
