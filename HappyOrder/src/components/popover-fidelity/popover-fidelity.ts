/**
  * HappyOrder app for phones
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */
import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';// , Platform, NavController, NavParams
import { LiveService } from '../../services/live.service';
import { CartService } from '../../services/cart.service';


@Component({
  selector: 'popover-fidelity',
  templateUrl: 'popover-fidelity.html'
})
export class PopoverFidelityComponent {
  /**
   * modePay true => mostra la tastiera per selezionare un gutschein
   *      scegli di usarlo per il pagamento;
   * modePay false => crea un nuovo gutschein
   */
  private modePay: boolean;
  private gutscheinId: number;
  private fidelity: any;
  public code: string;
  private cart: any;
  private amount: number;

  constructor(public viewCtrl: ViewController,
    public navParams: NavParams,
    private liveService: LiveService,
    private cartService: CartService) {
    this.amount = 0;
    this.fidelity = { id: -1, code: -1, val: 0 };
    this.modePay = navParams.data.modePay;
    this.cart = navParams.data.cart;
    this.gutscheinId = navParams.data.gutscheinId;
    if (this.gutscheinId) {
      this.amount = this.cart.totals.totale
      // console.log('popover-fidelity ', this.gutscheinId, this.amount);
    }
    //console.log('popover-fidelity built');
  }

  search() {
    let self = this;
    this.cartService.getFidelityInfo(
      this.code, (data) => {
        //console.log('Ricerca, ritornata',data);
        if (data.data && data.data.id) {
          self.fidelity = data.data;
        } else {
          console.error('Ricerca, ritornata vuota', data);
          self.fidelity = { id: -1, code: -1, val: 0 };
        }

      });
  }

  incAmount(delta: number) {
    this.amount = Math.round((this.amount + delta) * 10) / 10;
  }

  close(action: string) {
    // console.log('close',param, this.password, this.selectedClerk.serial);
    action = action ? action : 'cancel';
    switch (action) {
      case 'sell':
        let exitParams1 = {
          action: action,
          amount: this.amount,
          code: this.gutscheinId,
        };

        // console.log('exitParams: ',exitParams);
        this.viewCtrl.dismiss(exitParams1);
        break;
      case 'pay':
        let exitParams2 = {
          action: action,
          fidelity: this.fidelity
        };
        // console.log('exitParams: ',exitParams);
        this.viewCtrl.dismiss(exitParams2);
        break;
      case 'payWithGutschein':
        //console.log('payWith Gutttschen');
        this.fidelity = {
          id: -1,// this.gutscheinId,
          // this is just the db id of the fidelity;
          val: this.amount,
          code: this.gutscheinId,
          aname: "-"
        };
        let exitParams3 = {
          action: 'pay',
          fidelity: this.fidelity
        };
        //console.log('exitParams: ', exitParams3);
        this.viewCtrl.dismiss(exitParams3);
        break;
      default: this.viewCtrl.dismiss({ action: action });
        break;
    }
  }
}
