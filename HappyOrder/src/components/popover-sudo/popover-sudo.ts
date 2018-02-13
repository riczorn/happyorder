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
  selector: 'popover-sudo',
  templateUrl: 'popover-sudo.html'
})
export class PopoverSudoComponent {
  private cart: any;
  private selectedClerk: any;
  private clerks: any;

  private clerkId: any;
  public password: string;
  private message: string;

  constructor(public viewCtrl: ViewController, public navParams:NavParams) {
    this.cart = navParams.data.cart;
    this.clerks = navParams.data.clerks;
    if (this.clerks&&this.clerks.length) {
      this.selectedClerk = this.clerks[0];
    }
    this.password = '';
    this.message = '';
  }

  select(clerk) {
    this.clerkId = clerk.id;

    this.selectedClerk = clerk;
    this.message = '';
  }

  close(param) {
    // console.log('close',param, this.password, this.selectedClerk.serial);
    param = param?param:'';
    switch (param) {
      case 'cancel': this.viewCtrl.dismiss({action:'cancel'});
                    break;
      case 'storno':
                if (this.password && this.password.length && (this.password == this.selectedClerk.serial)) {
                  let exitParams = {action:param,password:this.password,clerkId:this.selectedClerk.id};
                  // console.log('exitParams: ',exitParams);
                  this.viewCtrl.dismiss(exitParams);
                  this.message = '';
                } else {
                  this.message = 'Password errata';
                }
                  break;
    }
    this.password = '';
  }
}
