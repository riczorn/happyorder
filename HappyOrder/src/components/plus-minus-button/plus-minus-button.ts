/**
  * HappyOrder app for phones
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'plus-minus-button',
  templateUrl: 'plus-minus-button.html'
})
export class PlusMinusButtonComponent {
  @Input() controlVar: number;
  @Output()  onMyValueChange: EventEmitter<any> = new EventEmitter();

  constructor() {
    // console.log('plusMinus',this.controlVar);
  }
  changeQt(num: number) {
    console.log('changeQt',num, this.controlVar);
    // this.controlVar = 1*num + 1*this.controlVar;
    let res = {result:1*num + 1*this.controlVar};
    console.log('cQt2',res);
    this.onMyValueChange.next(res);
  }
}
