/**
  * HappyOrder app for phones
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */

  import { Component, Input } from '@angular/core';
  import {LiveService} from  '../../services/live.service';
  import {CartService} from  '../../services/cart.service';


@Component({
  selector: 'art-button',
  templateUrl: 'art-button.html'
})
export class ArtButtonComponent {
  @Input() button: any;

  constructor(
      private liveService: LiveService,
      private cartService:CartService) {

  }
  itemClick(button:any) {
    // console.log('artButton click',button);
    if ( !button ) return;
    if ( button.itemType ) {
      try {
        this.liveService.cart.add(button);
      } catch (e) {
        console.error('itemClick',e);
        this.cartService.toastAndVibrate(e,true);
      }
    } else if ( button.itype ) { //}cssClass=='bfunction') {
      console.log('richiesta payment: ',button, button.link);
      this.liveService.cart.addPayment(button);
    } else if ( button.link ) { //}cssClass=='bfunction') {
      console.log('richiesta azione: ',button, button.link);

    } else {
      console.log('button',button);
      console.log('a section button?',button.action, button.link);
    }
  }
}
