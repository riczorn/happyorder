/**
 *  HappyOrder app
 *
 * @package    HappyOrder
 * @author     Riccardo Zorn <code@fasterjoomla.com>
 * @copyright  2002 - 2017 Riccardo Zorn
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

import { Component, ViewChild, OnInit, EventEmitter } from '@angular/core';
import { NavController, Content, Platform } from 'ionic-angular';

import { LiveService } from  '../../services/live.service';
import { CartService } from  '../../services/cart.service';

import { OrderPage } from '../../pages/order/order';

@Component({
  selector: 'page-tavoli',
  templateUrl: 'tavoli.html'
})
export class TavoliPage  implements OnInit  {
  @ViewChild(Content) content: Content;

  public tables:any;
  constructor(public liveService: LiveService,
        private cartService: CartService,
        public navCtrl: NavController,
        public platform: Platform) {
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
  getWidthPx(size:number) {
    // return '30px';
    // let opts = this.liveService.options;
    let tS = this.liveService.settings.tables.tableSizes;
    let el = this.content.getNativeElement();
    // console.log('getWidthPx',el);
    let width = el.clientWidth-10;
    // console.log('  getWidthPx', size, width, tS.width);
    return this.getSizePx(size, width, tS.width);
  }

  getHeightPx(size:number) {
    // return '30px';
    // let opts = this.liveService.options;
    let tS = this.liveService.settings.tables.tableSizes;
    let el = this.content.getNativeElement();
    // console.log('getHeightPx',el);
    let height = el.clientHeight-10;
    // console.log('  getHeightPx', size, height, tS.height);
    return this.getSizePx(size, height, tS.height);
  }

  getSizePx(size:number, boxSize: number, maxSize: number) {
    let newSize = size/maxSize * boxSize;
    // console.log('  getSizePx', newSize);
    return Math.floor(newSize) + 'px';
  }
}
