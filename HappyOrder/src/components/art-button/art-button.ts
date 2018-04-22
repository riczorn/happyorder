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
    //console.log('artButton click',button);
    //console.log('art-button create, ',this.button);
    if ( !button ) return;
    let currentClass = button.cssClass;
    if (button.timeout) {
      clearTimeout(button.timeout);
    }
    button.cssClass += ' justclicked';


    button.timeout = setTimeout (function() {
      button.cssClass=currentClass.replace(/ justclicked/g,'');
      //console.log('currentClass',button.id, currentClass, '<--', button.cssClass);
    
    },300);

    if ( button.itemType ) {
      try {
        this.liveService.cart.add(button);
        if (this.liveService.options.Feedback=='sound' || this.liveService.options.Feedback=='vibrate') {
          //console.log('now,1 '+this.liveService.options.Feedback);
          this.cartService.toastAndVibrate(null,this.liveService.messageTypes.tick);
        }
        /*if (this.liveService.options.Feedback=='sound') {
          console.log('now,2 '+this.liveService.options.Feedback);
        }*/
      } catch (e) {
        console.error('itemClick',e);
        this.cartService.toastAndVibrate(e,this.liveService.messageTypes.localError);
      }
    } else if ( button.itype ) { //}cssClass=='bfunction') {
      //console.log('richiesta payment: ',button, button.link);
      this.liveService.cart.addPayment(button);
    } else if ( button.link ) { //}cssClass=='bfunction') {
      console.log('richiesta azione: ',button, button.link);

    } else {
      //console.log('button',button);
      console.log('a section button?',button.action, button.link);
    }
    //console.log('/artButton click')
  }
}
