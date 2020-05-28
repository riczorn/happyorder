/**
  * HappyOrder app for phones
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */

import { Component, OnInit, ElementRef } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';// , Platform, NavController, NavParams


@Component({
  selector: 'popover-cart',
  templateUrl: 'popover-cart.html'
})
export class PopoverCartComponent implements OnInit {
  private item: any;
  private cart: any;
  private editing: boolean;
  private percentPrice: number;

  constructor(private hostElement: ElementRef, public viewCtrl: ViewController, public navParams: NavParams) {
    this.item = navParams.data.item;
    this.cart = navParams.data.cart;
    this.editing = false;
    this.percentPrice = -15;
  }

  ngOnInit() {
    let self = this;
    // this.editing = false;
  }

  close(param) {
    param = param ? param : '';

    this.viewCtrl.dismiss(param);
  }

  toggleEdit(event) {
    event = event ? event : window.event;
    console.log('toggleEdit event:', event);
    this.editing = !this.editing;
    if (this.editing) {
      this.item.changedPrezzo = 1 * this.item.prezzo;
      // this.hostElement.nativeElement.offsetTop = -54;
      console.warn('popover component:', this.hostElement.nativeElement);
      // this.hostElement.nativeElement.outerHTML
    }
  }


  pricePercent() {
    console.log('pricePercent!');
    this.item.changedPrezzo = Math.round(this.item.prezzo * (100 + this.percentPrice)) / 100;
  }
}
