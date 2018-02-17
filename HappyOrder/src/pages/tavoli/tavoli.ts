/**
 *  HappyOrder app
 *
 * @package    HappyOrder
 * @author     Riccardo Zorn <code@fasterjoomla.com>
 * @copyright  2002 - 2017 Riccardo Zorn
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

import { Component, ViewChild, OnInit, EventEmitter } from '@angular/core';
import { NavController, Content, Platform, AlertController } from 'ionic-angular';

import { LiveService } from  '../../services/live.service';
import { CartService } from  '../../services/cart.service';

import { OrderPage } from '../../pages/order/order';
import {Cart} from  '../../models/cart';

@Component({
  selector: 'page-tavoli',
  templateUrl: 'tavoli.html'
})
export class TavoliPage  implements OnInit  {
  @ViewChild(Content) content: Content;

  public containerTop : number;

  public tables:any;
  constructor(public liveService: LiveService,
        private cartService: CartService,
        public navCtrl: NavController,
        public platform: Platform,
        public alertCtrl: AlertController) {
  }

  ngOnInit() {
    let self = this;
    self.tables = self.liveService.settings.tables;
    self.cartService.updateTables(function(tableStates) {
      // console.log('updateTables callback tableStates',tableStates);
      // qui aggiornare lo stato dei tavoli da tableStates.
    });
    self.updateTablePos({});
    this.platform.resize.subscribe ( (event:any) => {
        // /console.log('resize event');
        self.updateTablePos({});
      }
    );


    // console.log('TavoliPage init');
  }

// ngAfterContentInit() {
//   console.log('tavoli ngAfterContentInit');
// }
// ngAfterContentChecked() {
//   console.log('tavoli ngAfterContentChecked');
// }
// ngAfterViewInit() {
//   console.log('tavoli ngAfterViewInit');
// }
// ngAfterViewChecked() {
//   console.log('tavoli ngAfterViewChecked');
// }

  openTable(table) {
    // console.log('openTable 1',table);
    let self = this;
    self.cartService.openTable(table, function(tableData) {
      // console.log('openTable 2 callback',tableData);
      self.navCtrl.setRoot(OrderPage);
    });
    // self.navCtrl.setRoot(OrderPage);
  }

  updateTablePos(event:any) { //EventEmitter<Event>):any {
    // console.log('updateTablePos');
    for (let table of this.liveService.settings.tables.table) {
      table.style = this.getTableStyle(table);
    }
    this.containerTop = 56;
  }

  /**
   * Tables are dropped to trigger the move table functionality.
   * table contains the source table, while event.center the coordinates
   * it is dropped on. 
   * This function will try and find any tables under the drop point, 
   * and if so trigger the move function.
   * 
   * @param event 
   * @param table 
   */
  dropTable(event, sourceTable) {
     // the object was dropped at: event.center.x, y
    // can I find a table at those coordinates?

    // watch out: the table's coordinates are scaled to 1000, getWidthPx handles this
    let center = {
      x  : parseInt(this.getWidthPx(event.center.x, true)),
      y  : parseInt(this.getHeightPx(event.center.y-this.containerTop, true))
    }
    //console.log('dropping',sourceTable, center);
    for (let table of this.liveService.settings.tables.table) {
      // console.log(table.id, table.left, table.left+table.width, center.x);
      // console.log(table.id, table.top, table.top+table.height, center.y);
      if ((center.x>table.left) && (center.x < table.left + table.width)
        && (center.y>table.top) && (center.y < table.top + table.height)) {
          //console.log('CENTRO!', table);
          this.moveTable(sourceTable, table, event);
          return true;
      }
    }
    
    return false;
  }  

  moveTable(sourceTable, destinationTable, event) {
    if (!this.liveService.user.hasPrivilege('transfer')) {
      this.cartService.toastAndVibrate('Non hai il privilegio spostatavolo',true);
      return false;
    }
    if (destinationTable.state!=="0") {
      this.cartService.toastAndVibrate('Sposta su un tavolo vuoto!',true);
      return false;
    }
    let cart: Cart;
    let self = this;
    cart = new Cart();
    cart.clerkId = self.liveService.user.clerkId;
    if (sourceTable.state=="0") return;

    self.askMoveTable(sourceTable, destinationTable, function() {

      cart.idTavolo = sourceTable.id;
      cart.idTavolo2 = destinationTable.id;
      let  action = 16; //cart.flagsToAction(true, true, false);
      self.cartService.sendCart(cart, action, function(data:any) {
        // update the status of the two tables.
        self.updateTablePos(event);
        self.cartService.updateTables(function(tableStates) {
          // console.log('updateTables callback tableStates',tableStates);
        });
      });
    });    
  }

  askMoveTable(t1: any, t2: any, callback: Function) {
    
    let confirm = this.alertCtrl.create({
      title: 'Sposto il tavolo?',
      message: `Vuoi spostare il tavolo ${t1.descrizione} sul ${t2.descrizione}?`,
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Spostatavolo annullato');
          }
        },
        {
          text: 'Si',
          handler: () => {
            if (callback instanceof Function) {
              console.log(`Sposto il tavolo ${t1.descrizione} sul ${t2.descrizione}`);
              callback();
            }
          }
        }
      ]
    });

    confirm.present();
  }
  

  getStyle() {
    let style='';
    let opts = this.liveService.options;
    if (opts.GraphicalTables) { //PagesVertical) {
      style = 'graphical';
    }

    style += ' cols-'+opts.ColumnCount;
    style += ' font-'+opts.FontSize;
    style += ' bheight-'+opts.ButtonHeight;
    return style;
  }

  getTableStyle(table) {
    let opts  = this.liveService.options;
    let tS    = this.liveService.settings.tables.tableSizes;
    if (!opts.GraphicalTables) { //PagesVertical) {
      return {
        width:'auto',height:'3.6rem',left:'auto',top:'auto',
        position:'relative'
      }
    }
    // console.log('getTableStyle', table.left, table.width, table.top, table.height);
    let style = {
      boxSizing: 'border-box',
      position:'absolute',
      width  : this.getWidthPx(table.width),
      height : this.getHeightPx(table.height),
      left   : this.getWidthPx(table.left-tS.left),
      top    : this.getHeightPx(table.top-tS.top)
    };
    // console.log('style', style);
    return style;
  }

  /** receives the size as a fraction of 1000;
    * returns the size in px including the unit
   */
  getWidthPx(size:number, invert:boolean=false) {
    // return '30px';
    // let opts = this.liveService.options;
    let tS = this.liveService.settings.tables.tableSizes;
    let el = this.content.getNativeElement();
    // console.log('getWidthPx',el);
    let width = el.clientWidth-10;
    // console.log('  getWidthPx', size, width, tS.width);
    return this.getSizePx(size, width, tS.width, invert);
  }

  getHeightPx(size:number, invert:boolean=false) {
    // return '30px';
    // let opts = this.liveService.options;
    let tS = this.liveService.settings.tables.tableSizes;
    let el = this.content.getNativeElement();
    // console.log('getHeightPx',el);
    let height = el.clientHeight-10;
    // console.log('  getHeightPx', size, height, tS.height);
    return this.getSizePx(size, height, tS.height, invert);
  }

  getSizePx(size:number, boxSize: number, maxSize: number, invert:boolean) {

    let newSize = size / maxSize * boxSize;
    if (invert) {
      newSize = size / boxSize * maxSize;
    }
    // console.log('  getSizePx', newSize);
    return Math.floor(newSize) + 'px';
  }
}
