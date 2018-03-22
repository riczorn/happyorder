/**
  * HappyOrder app for phones
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2018 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */
 
import { Component, ViewChild } from '@angular/core';
import {Content} from 'ionic-angular'; //Platform, NavController, NavParams, ViewController
import {LiveService} from  '../../services/live.service';
import {CartService} from  '../../services/cart.service';

@Component({
  selector: 'order-page-buttons',
  templateUrl: 'order-page.html'
})
export class OrderPageButtons {
  @ViewChild(Content) orderPage: Content;
  
  private pages: any;
  private pageButtons: any;

  constructor(private liveService: LiveService,
    private cartService:CartService) {
    for (let page of this.liveService.settings.buttons.client.page) {

      page.page.active = false;
    }
    this.pages = this.liveService.settings.buttons.client.page;

    this.pageButtons = this.pages[0].page;
    this.pageButtons.active = true;
  }

  itemClick(button:any) {
    // occhio! Questa funzione non viene chiamata dagli articoli!!!
    // guarda il component art-button => /components/art-button/art-button.ts:itemClick()
    //  console.log('order-buttons button click',button);
    if (!button) return;

    if ( button.itemType ) {
      try {
        this.liveService.cart.add( button );
      } catch (e) {
        this.cartService.toastAndVibrate('ERROR 7 '+e.message,true);
      }
    } else if ( button.link ) { //}cssClass=='bfunction') {
      console.log('richiesta azione: ',button.action, button.link);

    } else {
      console.log('button',button);
      console.log('a section button?',button.action, button.link);
    }
  }


  swipeEvent(e:any) {
    //console.log('swipe:',e);

    if (e.stopPropagation) {
      e.stopPropagation();
    }
    
    let minSwipeLength=150;
    let maxSwipeHeight=50;
    if (Math.abs(e.deltaX)>minSwipeLength 
        && Math.abs(e.deltaY)<maxSwipeHeight) {
      this.handleSwipeLeftRight(e.deltaX<0);
      //this.handleSwipe(e.direction==2) http://www.ionicsync.com/2018/02/how-to-implement-gestures-in-ionic-2.html
    }
  }

  handleSwipeLeftRight(goRight:boolean) {
    //console.log('handleSwipe',this.pages.length);
    for (var i=0;i<this.pages.length; i++) {
      if (this.pages[i].page.active) {
        //console.log('i1',i,'newindex',newIndex);
        var newIndex = goRight?i+1:i-1;
        newIndex+=this.pages.length ;
        newIndex %= this.pages.length;
        //console.log('i2',i,'newindex',newIndex);
        this.showTab(this.pages[newIndex].page);
        break;
      } 
    }
  }
  /* used for reset after the order: */
  showFirstTab() {
    let page = this.pages[0];
    let res= this.showTab(page.page);
    return res;
  }

  showTab(page:any) {
    // console.log('showpage: ',page);
    // for (let aPage of this.pageButtons) {
    //   aPage.active = false;
    // }
    this.pageButtons.active = false;
    page.active = true;
    this.pageButtons = page;
    // page.active = true;
  }
}
