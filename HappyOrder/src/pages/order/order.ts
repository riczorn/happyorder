/**
 *  HappyOrder app
 *
 * @package    HappyOrder
 * @author     Riccardo Zorn <code@fasterjoomla.com>
 * @copyright  2002 - 2017 Riccardo Zorn
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, Content } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { LiveService } from  '../../services/live.service';
import { CartService } from  '../../services/cart.service';

import { TavoliPage } from '../../pages/tavoli/tavoli';
import { OrderButtons } from '../../components/order-buttons/order-buttons';
import { CartComponent } from '../../components/cart/cart';

// import { OrderButtons } from '../../components/order-buttons/order-buttons';
// import { CartComponent } from '../../components/cart/cart';
import {Cart} from  '../../models/cart';

@Component({
  selector: 'page-order',
  templateUrl: 'order.html'
})
export class OrderPage implements OnInit {
  @ViewChild(Content) content: Content;
  @ViewChild(OrderButtons) orderButtons: OrderButtons;
  @ViewChild(CartComponent) cartComponent: CartComponent;
  // debugText: string;
  private cart: Cart;
  private visible: any;
  constructor(public liveService:LiveService,
              private cartService: CartService,
              public navCtrl: NavController,
              public platform: Platform  ) {
      this.cart = this.liveService.cart;
      this.visible = {cart:1, order:1, cssClass:'', active:1};
  }
  ngOnInit() {
    let selfOrder = this;
    this.doFlex(this.visible.order, this.visible.cart);
    this.content.resize();

    this.cartComponent.resetFunction = function(data) {
      // console.log('order.resetOrder Screen ',data);

      // now reset the first page of the buttonbar:
      selfOrder.orderButtons.showFirstTab();
    };

    // let self = this;
    // let page = self.liveService.settings.buttons.desktop.page;
    // self.debugText = JSON.stringify(page);
    // console.log('ordina init');
  }

  askEmpty() {
    console.log('n/a');// apri un popup e chiedi?
  }

  empty() {
    // console.log('empty click');
    this.cart.empty();
  }

  sendCart(event) {
    let self = this;
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }



      if (event && event.target) {
        event.target.disabled = true;
      }
      let action = self.cart.getAction();
      if   (self.liveService.user.defaultTableId == self.liveService.user.tableId) {
        // su asporto, conferma elimina è il default.
        action = self.cart.flagsToAction(true, true, false);
      }
      self.cartService.sendCart(self.cart, action, function(data:any) {
        // console.log('Cart Sent!', data);
        // magari vediamo che risponde?

        if (event && event.target) {
          event.target.disabled = false;
        }

        self.afterOrder(action);

      });

  }

  afterOrder(action: number) {
    let self = this;
    self.orderButtons.showFirstTab();

    if (self.liveService.user.defaultTableId &&
      (self.liveService.user.defaultTableId == self.liveService.user.tableId)) {
      self.cart.empty();
    } else {
      self.navCtrl.setRoot(TavoliPage);
    }
  }

  doFlex(order:number,cart:number) {
    this.visible.order = order;
    this.visible.cart = cart;
    // if (order+cart>1)
    // this.visible.active = 1 else
    // if (order) {
    //   this.visible.active = 0 ;
    // } else if (cart) {
    //   this.visible.active = 2;
    // }
    if ((order+cart)>=2) {
      this.visible.cssClass = 'half';
    } else {
      this.visible.cssClass = '';
    }
    // redundant, using css queries for flex-direction on #orderPage
      // if (this.platform.isPortrait()) {
      //   this.visible.cssClass = 'portrait';
      // } else {
      //   this.visible.cssClass = 'landscape'
      // }

  }

  /**
    * return an appropriate css class based on the current options:
    */
  getStyle() {
    let style='';
    let opts = this.liveService.options;
    if (opts.PagesVertical) {
      style = 'vertical';
    }

    style += ' cols-'+opts.ColumnCount;
    style += ' font-'+opts.FontSize;
    style += ' bheight-'+opts.ButtonHeight;
    return style;
  }
}
