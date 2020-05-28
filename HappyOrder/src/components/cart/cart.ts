/**
  * HappyOrder app for phones
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */

import { Component, Input, ViewChild } from '@angular/core';
import { NavController, Content, PopoverController } from 'ionic-angular';//ViewController , Platform, NavController, NavParams
import { LiveService } from '../../services/live.service';
import { Cart } from '../../models/cart';
import { OrderItem } from '../../models/order-item';
import { CartService } from '../../services/cart.service';
import { TavoliPage } from '../../pages/tavoli/tavoli';
import { LocalPrintPage } from '../../pages/local-print/local-print';
import { PopoverCartComponent } from '../../components/popover-cart/popover-cart';
import { PopoverSudoComponent } from '../../components/popover-sudo/popover-sudo';
import { PopoverLastordersComponent } from '../../components/popover-lastorders/popover-lastorders';
import { PopoverFidelityComponent } from '../../components/popover-fidelity/popover-fidelity'
import { List } from 'ionic-angular';

@Component({
  selector: 'cart',
  templateUrl: 'cart.html'
})
export class CartComponent {
  @ViewChild(Content) cartComponent: Content;
  @ViewChild(List) cartList: List;
  @Input() cartButtonsViewStyle: string;

  private cart: Cart;
  private functionButtons: any;
  public resetFunction: Function;

  constructor(private cartService: CartService,
    private liveService: LiveService,
    public navCtrl: NavController,
    public popoverCtrl: PopoverController) {
    let self = this;
    this.cart = this.liveService.cart;
    this.functionButtons = this.liveService.settings.buttons.client.buttonsPreview;
    this.cart.onUpdateTotals = function (item) {
      self.onUpdateTotals(item);
    }
  }

  select(event, item: any) {
    if (event.stopPropagation) {
      event.stopPropagation();
    }

    //console.log('select',item);
    if (item.itemType || item.idTipoArticolo) {
      this.cart.selectItem(item);
    }

    // open the slider automatically on tap:
    // console.log(event.target);
    // angular.element(event.target).parent().css('transform',
    //   'translate3d(-70px,0,0)');

    return false;
  }

  removePayment(event, payment) {
    console.log('removePayment', payment)
    //if (payment.itype) {
    this.cart.payments.splice(0, this.cart.payments.length);
    //}
  }

  // presentPopover(myEvent) {
  //
  // }

  /* mostra un menù contestuale su action hold, da testare */
  async showContext(event, item, childParentItem: any) {
    let self = this;
    let cart = self.cart;
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }

    const popover = await this.popoverCtrl.create(PopoverCartComponent,
      {
        item: item,
        cart: self.cart,
      },
      {
        cssClass: 'item-edit-pop krz-item',
      });
    // console.log('popover',popover);
    // popover.item = item;
    // popover.cart = this.cart;
    await popover.present({
      ev: event
    });

    popover.onDidDismiss((popoverData) => {
      // console.log('popoverData',popoverData);
      switch (popoverData) {
        case 'cancel': self.cancelItem(item); break;
        case 'add': self.changeQt(cart.items, item, +1); break;
        case 'edit': self.editItem(item); break; // done in popoverCart
        case 'remove': self.changeQt(cart.items, item, -1); break;
        case 'delete': self.deleteChild(cart.items, item); break;
        case 'storno': self.storno(event, cart.items, item); break;
        case 'deleteChild': self.deleteChild(childParentItem.children, item); break;
      }
    });
    // open the slider automatically on tap:
    // console.log('showContext', event.target);

    // angular.element(event.target).parent().css('transform',
    //   'translate3d(-70px,0,0)');

    return false;
  }


  cancelItem(item: OrderItem) {
    console.log('cancel item');
    item.changedPrezzo = item.prezzo;
    // this.editItem(item);
  }
  /**
   * invoked on an unconfirmed cart item, allows (if privileges are granted) to 
   * superseded? now in popoverCart.
   * @param item 
   */
  editItem(item: OrderItem) {
    console.log('editItem', item);
    item.prezzo = item.changedPrezzo;
    this.updateTotals(item);
  }

  showLastOrders(data: any, tipoDocumento: number) {
    let self = this;
    let event = { status: 'useless' };
    let popoverLastOrders = this.popoverCtrl.create(PopoverLastordersComponent, {
      orders: data
    });

    popoverLastOrders.present({
      ev: event
    });

    popoverLastOrders.onDidDismiss((popoverData) => {
      // console.log('AHA '  + JSON.stringify(popoverData));
      if (popoverData && (popoverData.action == 'print')) {
        //alert('print ' + popoverData.docId);
        self.cartService.printDoc(popoverData.orderId, tipoDocumento,
          function (data: any) {
            //console.log('printDoc returned',data);
            self.cartService.toastAndVibrate('Stampato',
              self.liveService.messageTypes.success);
          }
        );
        // send as docID (capital D)
      }
    });

    return false;
  }

  /**
   * This behaves differently based on context.
   * If the cart is empty, show the "sell a new gutschein"
   * if the cart is full, show the add payment features.
   * (param modePay of popoverFidelity)
   */
  showPaga(gutscheinId?) {
    let self = this;
    let event = { status: 'useless' };
    // popoverFidelity shows a Sell Gutschein if the cart is empty, and 
    // pay with gutschein if the cart is full.

    if (self.cart.items.length > 0 && self.cart.payments.length > 0) {
      self.cartService.toastAndVibrate('Max un gutschein per ordine', self.liveService.messageTypes.remoteError);
      return;
    }

    let popoverFidelity = this.popoverCtrl.create(PopoverFidelityComponent, {
      cart: self.cart, modePay: self.cart.items.length > 0, gutscheinId: (gutscheinId ? gutscheinId : 0)
    });

    popoverFidelity.present({
      ev: event
    });

    popoverFidelity.onDidDismiss((popoverData) => {

      if (popoverData && (popoverData.action == 'pay')) {
        //console.log('popoverFidelity callback',popoverData.fidelity);
        // paga tutto o solo una parte con fidelity a seconda della disponibilità
        let amountToPay = Math.min(popoverData.fidelity.val, self.cart.totals.totale);
        // il formato del pagamento è:
        let payment = {
          id: popoverData.fidelity.id,
          // don't be fooled: popoverData.fidelity.id
          // is just the db id of the fidelity

          val: amountToPay,
          code: popoverData.fidelity.code,
          name: "Gutschein n." + popoverData.fidelity.aname
        }
        self.cart.addPayment(payment);

      } else if (popoverData && (popoverData.action == 'sell')) {
        self.cartService.createFidelity(popoverData.amount, popoverData.code, (data) => {
          //console.log('Fidelity Creata', data);
          if (data && data.status && data.status == "ok") {
            self.cartService.toastAndVibrate(data.data._, self.liveService.messageTypes.success);
          } else {
            self.cartService.toastAndVibrate('Fidelity non creata', self.liveService.messageTypes.remoteError);
          }
        });
      }
    });

    return false;
  }

  payWithGutschein(gutscheinId) {
    let self = this;
    // il formato del pagamento è:
    let payment = {
      id: gutscheinId,
      // this is just the db id of the fidelity;

      val: self.cart.totals.totale,
      code: gutscheinId,
      name: "Gutschein"
    }
    self.cart.addPayment(payment);
  }

  /**
    * returns true if the specified line is currently selected
    */
  isSelected(item) {
    return item && (item == this.cart.rigaOrdineSelezionata);
  }

  getItemClass(item) {
    let cssClass = '';

    if (item.idTipoArticolo == 1) {
      cssClass = 'article';
    } else {
      cssClass = 'extra';
    }
    if (item.idStatoRiga > 1) {
      cssClass += ' saved';
    }
    if (this.isSelected(item)) {
      cssClass = cssClass + ' selected';
    }
    return cssClass;
  }

  deleteChild(collection, item) {
    var index = collection.indexOf(item, 0);
    if (index > -1) {
      collection.splice(index, 1);
    }
    // delete(collection[item]);
    this.updateTotals(item);
  }

  changeQt(collection, item, change) {
    item.quantita += change;
    if (item.quantita === 0) {
      var index = collection.indexOf(item, 0);
      if (index > -1) {
        collection.splice(index, 1);
      }
    }
    // delete(collection[item]);
    this.updateTotals(item);
  }

  /**
    * Una procedura delicata. Se l'utente non ha il privilegio di fare uno
    * storno, devo presentargli una richiesta di codice, presumibilmente
    * creato da un supervisore.

    */
  storno(event, collection, item) {
    if (this.liveService.user.hasPrivilege('storno')) {
      item.quantita -= 1;
      this.sendCartStorno();
    } else {
      // show a request for password:
      // console.log('non hai il permesso di stornare');
      this.presentChoiceForLogin(event, item, 'storno');
    }
  }

  presentChoiceForLogin(event, item, actionName) {
    // console.log('presentChoiceForLogin', actionName);
    let self = this;
    // trova i soli clerks che hanno il privilegio necessario actionName
    // let clerks = [
    //   {id:'1',name:'johnny',serial:'1212'},
    //   {id:'2',name:'randy',serial:'2121'}
    // ];
    let clerks = this.liveService.settings.clerks.byPrivilege('storno');
    if (clerks.length == 0) {
      self.cartService.toastAndVibrate('Nessun cameriere ha il privilegio storno', this.liveService.messageTypes.localError);
      return false;
    } // else
    // console.log('222', clerks);
    let popover = this.popoverCtrl.create(PopoverSudoComponent, {
      clerks: clerks,
      cart: self.cart
    });
    // console.log('popover',popover);
    // popover.item = item;
    // popover.cart = this.cart;
    popover.present({
      ev: event
    });
    popover.onDidDismiss((popoverData) => {
      //  console.log('popoverData', popoverData);
      if (popoverData && popoverData) {
        switch (popoverData.action) {
          case 'cancel':
            // console.log('cancel storno');
            break;
          case 'storno':
            // console.log('storno!!!',popoverData);
            self.cart.clerkId = popoverData.clerkId;
            item.quantita -= 1;
            self.sendCartStorno();
            break;
        }
      }
    });

    return false;
  }

  sendCartStorno() {

    let self = this;
    if (self.cart.items.length) {
      let action = self.cart.cartActions.orderStorno +
        self.cart.cartActions.orderPrint +
        self.cart.cartActions.orderConfirm;
      // console.log(' cart ',action);
      self.cartService.sendCart(self.cart, action, function (data: any) {
        self.cartService.openTable(self.liveService.user.table, function (tableData) {
          // console.log('updated cart ',action);
        });
      });
    }
  }

  sendCartCommand(event, button) {
    //console.log('sendCartCommand');
    let self = this;
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    switch (button.link) {
      case "Fpageup":
        console.log('pageup');

        return;
      case "Fpagedown":
        console.log('pagedown');
        return;
      case "Fpaga":
        //console.log('Paga!');
        self.showPaga();
        return;
      case "Fbixolon":
        console.log('processing cart for bixolon');
        self.navCtrl.setRoot(LocalPrintPage);
        return;
    }
    if (button.link.indexOf('Fpaga:') === 0) {
      /** qui abbiamo un pagamento con gutschein automatico;
       *  il formato dell'action è Fpaga:7 dove 7 è l'id di un gutschein con sufficiente credito.
       */
      let gutscheinId = button.link.split(':').pop();
      if (self.cart.totals.count !== 0) {
        //console.log('add payment with gutscheinId:', gutscheinId);
        self.showPaga(gutscheinId);
      } else {
        self.showPaga(gutscheinId);
      }
      return;
    }


    /*
     * note: a cart with length 0 will reprint 
     * a previous order.
     * Now we move on to:
     * - if the cart is empty, show a popup and lazy-load
     *   the list of older orders on the current table, 
     *   (eventually filtering on non-existing orders)
     * - cart full, as usual.
     */
    let actionConto: boolean;
    // vediamo se ho premuto un bottone scontrino o simili.
    let action = self.cart.getAction(button.link);
    let tipoDocumento = self.cart.doc.tipoDocumento;
    if (self.cart.items.length === 0 && tipoDocumento > 0 &&
      tipoDocumento !== 9 && tipoDocumento !== 4) {
      // cart is empty, get a list of orders:
      // window.alert('cart is empty');
      self.cartService.getLastOrders(-1, function (data: any) {
        //console.log('getLastOrders returned',data);
        self.showLastOrders(data, tipoDocumento);
      });

    }
    else if (self.cart.items.length > 0) {
      if (event && event.target) {
        event.target.disabled = true;
      }
      // getAction also sets the cart.doc.tipoDocumento according to the function.
      let action = self.cart.getAction(button.link);


      self.cartService.sendCart(self.cart, action, function (data: any) {
        console.log('Cart Sent!', data);
        // magari vediamo che risponde?

        if (event && event.target) {
          event.target.disabled = false;
        }

        self.afterOrder(action);

      });
    } else {
      self.afterOrder(-1);//  self.navCtrl.setRoot(TavoliPage);
    }
  }

  afterOrder(action: number) {
    let self = this;
    if (self.liveService.user.defaultTableId &&
      (self.liveService.user.defaultTableId == self.liveService.user.tableId)) {
      // self.cart.empty();
      self.cartService.openTable(self.liveService.user.table, function (tableData) {
        self.resetOrder({ command: 'asportoreload' });
        // console.log('updated cart 2 ',action);
      });
    } else {
      if ((action & this.cart.cartActions.orderDelete) ||
        (action & this.cart.cartActions.printDocument)) {
        // if the command is other than a simple confirm, return to
        // tables.
        self.navCtrl.setRoot(TavoliPage);
      } else {
        // reload the cart to reflect changes.
        self.cartService.openTable(self.liveService.user.table, function (tableData) {
          self.resetOrder({ command: 'asportoreload' });
          // console.log('updated cart 2 ',action);
        });
      }
    }
  }

  /* after an operation, we want to reset the order buttons:
   * the calling page (order.ts) will inject the callback function;
   */
  resetOrder(data: any) {
    // console.log('cart.resetOrder', data);
    let self = this;
    if (typeof self.resetFunction == "function" && self.resetFunction) {
      self.resetFunction(data);
    }
  }

  updateTotals(item) {
    //chiamato dal carrello stesso;
    // le aggiunte da pulsante non triggerano questo evento.
    // console.log('updateTotals',item);
    this.cart.updateTotals(item);
    // console.log(item);
    // item.scrollIntoView();
  }

  onUpdateTotals(itemComponent?) {
    // console.log('onUpdateTotals', itemComponent);
    if (itemComponent && itemComponent.scrollIntoView) {
      itemComponent.scrollIntoView();
    } else if (true) { //this.cart.lastArt) {
      // cerco l'elemento:
      // console.log('e mo che scrollo', this.cartComponent);
      // ma è nullo! this non è collegato.
      // console.log('onUpdateTotals cartList:',this.cartList._elementRef.nativeElement)  ;
      // console.log('onUpdateTotals cartList:',this.cartList._elementRef.nativeElement.children);
      // console.log('onUpdateTotals cartList:',this.cartList._elementRef.nativeElement.childNodes);
      // try {
      //   let children = this.cartList._elementRef.nativeElement.children;
      //   let elm = children[children.length-1];
      //   // no ora selezioniamo l'elemento giusto!
      //   // potrei controllare se rigaOrdineSelezionata corrisponde?
      //   elm.scrollIntoView();
      // } catch(e) {
      //     // ignore e
      // }
      if (this.cartList && this.cartList._elementRef &&
        this.cartList._elementRef.nativeElement) {
        let children = this.cartList._elementRef.nativeElement.children;
        // console.log('children',children);
        if (children && children.length) {
          let elm = children[children.length - 1];
          // console.log('last elm ', elm);
          // no ora selezioniamo l'elemento giusto!
          // potrei controllare se rigaOrdineSelezionata corrisponde?
          let selectedIndex = children.length - 1;
          for (let i = 0; i < this.cart.items.length; i++) {
            if (this.cart.items[i] == this.cart.rigaOrdineSelezionata) {
              selectedIndex = i;
              // console.log('cart item corrensponds:',i,this.cart.items[i],'=',this.cart.rigaOrdineSelezionata)
              break;
            }
          }
          if (selectedIndex > children.length - 1) {
            selectedIndex = children.length - 1;
          }

          elm = children[selectedIndex];
          // console.log('sel elm ', elm);
          if (elm && elm.scrollIntoView) {
            setTimeout(() => {
              elm.scrollIntoView();
            }, 300);

          }
        }
      }

      // this.cartList._elementRef.nativeElement.scrollToBottom();

      // console.log(this.content.find('cart'));
      // facciamo che me lo cerco?
      // element.getBoundingClientRect().top
      // this.content.find('cart').scrollToBottom();
    }
  }


  swipeEvent(e, item: any) {
    //console.log('swipe:',e);
    let minSwipeLength = 80;
    let maxSwipeHeight = 30;
    if (Math.abs(e.deltaX) > minSwipeLength
      && Math.abs(e.deltaY) < maxSwipeHeight) {

      if (e.stopPropagation) {
        e.stopPropagation();
      }

      //console.log('swipe ', e.deltaX<0, e.target);
      this.handleSwipeLeftRight(e.deltaX < 0, item);

      //this.handleSwipe(e.direction==2) http://www.ionicsync.com/2018/02/how-to-implement-gestures-in-ionic-2.html
    }
  }

  handleSwipeLeftRight(goRight: boolean, item: any) {
    //console.log('handleSwipeLeftRight',item);
    let self = this;
    if (item.add && item.idStatoRiga < 2) {
      item.add(goRight ? -1 : 1);
      this.updateTotals(item);
    }
    if (item.quantita == 0) {
      item.timeout = setTimeout(function () {
        self.cart.delete(item);
      }, 2000);
    }
  }
}
