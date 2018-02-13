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
// import { CartService } from  '../../services/cart.service';
import {LoginService} from  '../../services/login.service';

// import { CartComponent } from '../../components/cart/cart';
import {Cart} from  '../../models/cart';

@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html'
})
export class CartPage implements OnInit {
  @ViewChild(Content) content: Content;
  private cart: Cart;
  private visible: any;
  private slideshowIndex: number;
  private slideshowLastUpdate: number;
  private lastTotal: number;
  constructor(public liveService:LiveService,
              // private cartService: CartService,
              private loginService:LoginService,
              public navCtrl: NavController,
              public platform: Platform  ) {
      this.cart = this.liveService.cart;
      this.slideshowIndex = 0;
      this.slideshowLastUpdate = new Date('0:00').getTime();
      this.visible = {
        showCart:false,
        hideAfter: 45,
        showCartTotalsDelayed: false
      }
  }
  ngOnInit() {
    let self = this;
    self.loginService.initSlideShow();
    self.content.resize();
    // let self = this;
    // console.log('cartpage init');
    setInterval( () => {
      let diff:number = (new Date().getTime() - self.liveService.lastUpdate)/1000;
      // console.log('diff',diff);
      if (diff > 2*self.visible.hideAfter ) {
        self.visible.showCartTotalsDelayed = false;
      } else {
        self.visible.showCartTotalsDelayed = true;
      }
      if (diff > self.visible.hideAfter ) {
        self.visible.showCart = false;
      } else {
        self.visible.showCart = true;
      }
      if ( self.cart.totals.totale>0 ) {
        self.lastTotal = self.cart.totals.totale;
        // console.log('aggiornato lastTotal' , self.lastTotal);
      }
    }, 1000);
  }

  getSlideshow() {
    // calmierare con slideshowLastUpdate
    if (this.visible.showCart) {
      return {};
    }
    let diff:number = (new Date().getTime() - this.slideshowLastUpdate)/1000;

    let self = this;
    let background = 'background.jpg';
    if (self.liveService.slideshow && self.liveService.slideshow.length ) {
      if (diff>5) {
        self.slideshowIndex = (self.slideshowIndex+1)%self.liveService.slideshow.length;
        this.slideshowLastUpdate = new Date().getTime();
      }
      background = self.liveService.slideshow[self.slideshowIndex];
    }
    let backgroundPath = self.liveService.config.baseUrl + '/slideshow/' + background;
    return {'background-image':'url("'+backgroundPath+'")'};
  }
}
