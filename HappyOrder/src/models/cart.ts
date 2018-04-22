/**
 *  HappyOrder app
 *  Datatype Cart
 *
 *  Implements the Cart
 *
 * @package    HappyOrder
 * @author     Riccardo Zorn <code@fasterjoomla.com>
 * @copyright  2002 - 2017 Riccardo Zorn
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

import { OrderItem } from '../models/order-item';

export class Cart {
  public name: string;
  // public orderConfirm:number;
  // public orderPrint:number;
  // public orderDelete:number;
  // public printDocument:number;
  // public orderSplit:number;
  public items: Array<OrderItem>;
  public statiRiga: Array<string>;
  public rigaOrdineSelezionata: OrderItem; // l'indice della riga corrente nell'array;
  public lastArt: OrderItem; // indice della riga che contiene l'ultimo articolo aggiunto/toccato
  public totals: any; // un oggetto con un po di totali a disposizione.
  public showPortata: boolean;
  public doc: any;
  public idOrdine: number;
  public idTavolo: number;
  public idTavolo2: number; // per spostatavolo e divisione ordine parziale.
  public clerkId: number;
  public action: number;
  public listino: number;
  public idCliente: number;
  public autoSplitBill: number;
  public nomeVeloce: number; // per l'asporto takeaway a orari prefissati
  public payments: Array<any>;
  public cartInput: String; // was divInput, può contenere un moltiplicatore oppure 3*2,30 per voci
  public cartActions: any;
  // libere.
  public loading: boolean;

  // these are passed by the calling page to reflect updates
  // in pages and components
  public onUpdate: Function;
  public onUpdateTotals: Function;



  constructor() {
    this.statiRiga = new Array('Vuoto', 'Menu', 'Ordinato', 'Mangia', 'Pagato', 'Eliminato');
    this.idOrdine = -1;
    this.idTavolo = -1;
    this.clerkId = -1;
    this.totals = { totale: 0, sconto: 0, totaleScontato: 0, count: 0 };
    this.doc =    { tipoDocumento: 1, intestato: 1 };
    this.cartActions = {
      orderConfirm: 1,
      orderPrint: 2,
      orderDelete: 4,
      printDocument: 8,
      orderSplit: 16,
      orderStorno: 32
    };
    this.payments = new Array();
    this.items = new Array();
    this.listino = -1;
    this.loading = true;

    this.empty();
  }

  /** 
   * Empty the current cart and reset relevant properties
   */
  empty() {

    this.doc.tipoDocumento = -1;
    this.rigaOrdineSelezionata = null;
    this.lastArt = null;
    this.idOrdine = -1;
    // this.idTavolo = -1;
    this.idTavolo2 = -1;
    this.action = -1;
    // this.listino = -1;
    this.cartInput = '';
    this.autoSplitBill = 1;
    this.items.splice(0, this.items.length);
    this.payments.splice(0, this.payments.length);
    this.updateTotals();
  }

  /**
    * Aggiunge un articolo al carrello, tenendo in considerazione la riga selezionata
    * Inoltre interpreta il valore del campo "cartInput"

    * Assumo i seguenti valori:
    * quantità = 1;
    * prezzo = prezzo dell'articolo;
    * se il box cartInput contiene un moltiplicatore o un prezzo, questo verrà applicato;
    */
  add(button: any, quantita?: number, nosdoppia?: boolean) {
    // console.log('.adding', quantita, nosdoppia);
    let self = this;
    nosdoppia = nosdoppia ? true : false; // default false
    quantita = quantita ? quantita : 1;
    // console.log('..adding', quantita, nosdoppia,button);
    // trovo una eventuale riga già presente dello stesso tipo, non confermata, da modificare;
    let currentArt = self.find(button.id, 2); // 2 = confermato
    // if (nosdoppia) {
    //   currentArt = false;
    // }
    if (currentArt && !nosdoppia) {
      currentArt.add(quantita);
      self.selectItem(currentArt);
    } else {
      // non c'è un articolo corrispondente, posso procedere a crearlo:
      currentArt = new OrderItem(button);
      currentArt.quantita = quantita;
      if (currentArt.idTipoArticolo > 1) {
        // è un extra:
        if (self.lastArt && self.lastArt.idStatoRiga < 2) {
          if ((!nosdoppia) && (self.lastArt.quantita > 1)) {
            // sdoppia riga
            // console.log('sdoppia!');
            self.lastArt.add(-1);
            let a = self.lastArt;
            // console.log('sdoppia2!');
            // we need to add the article this.lastArt;
            // tuttavia ha un formato non compatibile con cart.add.
            // facciamo prima a ritrovare l'articolo!
            //lastArt: {
            //  idArticolo: 15,
            //  idStatoRiga: 1,
            //  idRigaOrdine: -1,
            //  portata: 0,
            //  idTipoArticolo: 1,
            //  prezzo: 8,
            //  descrizione: "Capricciosa",
            //  children: Array[0],
            //  quantita: 1
            // }
            let newArt = {
              "name": a.descrizione,
              "price": a.prezzo,
              "id": a.idArticolo, // id articolo
              "itemType": a.idTipoArticolo,
              "image": "",
              "defaultTurn": 0, // portata
              // "code": "",
              // "sortGroup": 1
            };
            self.add(newArt, 1, true);
            // console.log('sdoppia3!');
            // che riassegna lastArt al nuovo articolo sdoppiato.
          }
          self.lastArt.children.push(currentArt);
          self.rigaOrdineSelezionata = currentArt;
        } else {
          if (self.lastArt && self.lastArt.idStatoRiga >= 2) {
            throw "L'articolo è già confermato";
          } else
            throw "Devi selezionare un articolo prima di aggiungere extra";
        }
      } else {
        self.items.push(currentArt);
        self.lastArt = currentArt; //this.items[this.items.length-1];
        self.rigaOrdineSelezionata = self.lastArt;
      }
    }
    self.updateTotals();
  }

  flagsToAction(doConferma, doElimina, doScontrino) {
    /*
    this.cartActions = {
      orderConfirm: 1,
      orderPrint: 2,
      orderDelete: 4,
      printDocument: 8,
      orderSplit: 16,
      orderStorno: 32
    };
    */

    var iAction = this.cartActions.orderPrint;

    if (doScontrino) {
      iAction += this.cartActions.printDocument;
    }
    if (doElimina) {
      iAction += this.cartActions.orderDelete;
    }
    if (doConferma) {
      iAction += this.cartActions.orderConfirm;
    }
    return iAction;
  }

  addPayment(payment: any) {
    // console.log('.adding', quantita, nosdoppia);
    let self = this;
    self.payments.push(payment);
  }

  getAction(linkName?: string) {
    if (linkName) {
      linkName = linkName.substring(1).toLowerCase();
      this.action = this.flagsToAction(true, false, true); // default action

      switch (linkName) {
        case 'conferma':
          this.doc.tipoDocumento = -1;
          this.action = this.flagsToAction(true, false, false);
          break;
        case 'confermaelimina':
          this.doc.tipoDocumento = 9;
          this.action = this.flagsToAction(true, true, true);
          break;
        case 'scontrino':
          this.doc.tipoDocumento = 1;
          break;
        case 'ricevuta':
          this.doc.tipoDocumento = 2;
          break;
        case 'fattura':
          this.doc.tipoDocumento = 3;
          break;
        case 'prova':
          this.doc.tipoDocumento = 4;
          break;
        case 'sospeso':
          this.doc.tipoDocumento = 5;
          break;
        case 'proforma':
          this.doc.tipoDocumento = 6;
          break;
        case 'ricevutani':
          this.doc.tipoDocumento = 7;
          break;
        case 'fatturaalt':
          this.doc.tipoDocumento = 8;
          break;
        case 'contononsta':
          this.doc.tipoDocumento = 9;
          break;
        case 'asporto':
          this.doc.tipoDocumento = 99;
          this.action = this.flagsToAction(false, false, false);
          break;
        
        default:
          // if (linkName.indexOf('servizio')>-1)
          // {
          //   var servizio = linkName.substr(linkName.indexOf(';')+1);
          //   //function aggiungiArt(idArticolo,prezzo,tipo,descrizione,squantita,sportata)
          //   var fservizio =Math.ceil(this.totals.prezzoTotale*servizio/10);
          //
          //   this.aggiungiArt(-1,parseInt(fservizio) / 10,1,'Servizio','1','0');
          // }
          // else
          {
            console.error('Action non riconosciuta: ', linkName);
            // this.action = this.flagsToAction(true, false, false);
          }
          this.action = this.flagsToAction(true, false, false);
          break;
      }
    } else {
      this.action = this.flagsToAction(true, false, false);
      console.log('button function N/A', this.action);
    }
    // console.log('Action', this.action, this.doc.tipoDocumento);
    return this.action;
  }

  /**
    * durante l'aggiunta, cerco un articolo corrispondente per aumentarne la quantita
    * questo dovrà avere uno statoMassimo 2 altrimenti modificherei righe già confermate.
    */
  find(idArticolo: number, statoMassimo: number) {
    let self = this;
    if (arguments.length == 1) {
      statoMassimo = 2;
    }
    for (let item of self.items) {
      if ((item.idStatoRiga < statoMassimo) && (item.idArticolo == idArticolo)) {

        if (item.children.length == 0) {

          // l'ho trovato!
          return item;

        }
      }
    }
    return false;
  }

  /**
   *  After any changes in the order we need to 
   *  update the total counters & price
   */
  updateTotals(itemComponent?) {
    let totale = 0;
    let count = 0;
    let tempItems = [];
    for (let item of this.items) {
      totale += item.prezzo * item.quantita
      count += item.quantita;
      tempItems.push({
        descrizione: item.descrizione,
        prezzo: item.prezzo,
        quantita: item.quantita
      });
      for (let extra of item.children) {
        totale += extra.prezzo * item.quantita * extra.quantita;
        tempItems.push({
          descrizione: extra.descrizione,
          prezzo: extra.prezzo,
          quantita: extra.quantita
        });
      }
    }
    this.totals.totale = totale;
    this.totals.count = count;

    this.totals.totaleScontato = totale * (1 - this.totals.sconto);
    this.loading = false;
    if (typeof this.onUpdate === "function") {
      // just the item names, totals, prices, and grand total:
      let tempCart = {
        total: this.totals.totale,
        count: this.totals.count,
        items: tempItems
      }
      this.onUpdate(tempCart);
    }
    if (typeof this.onUpdateTotals === "function") {
      // just the item names, totals, prices, and grand total:

      this.onUpdateTotals(itemComponent);
    }
  }

  /**
    * update selected item and lastArt after selection on the frontend;
    */
  selectItem(item) {
    this.rigaOrdineSelezionata = item;
    if (item.idTipoArticolo > 1) {
      // this.lastArt = this.rigaOrdineSelezionata.father;
    } else {
      this.lastArt = this.rigaOrdineSelezionata;
    }
  }

  delete(item) {
    
    console.log('deleting');
    let self = this;
    for (let i = 0; i< self.items.length; i++) {
        if (self.items[i] == item) {
          self.items.splice(i,1);
        }
    }    
  }

  doStorno(idRigaOrdine, shouldReload) {
    //  this.doConfirm(false, false, false, idRigaOrdine, 'storno');
    //document.location.href='?unikas_storno?id='+ idRigaOrdine // n.b. shouldReload serve solo al palmare.
  }

  doConfirm(doElimina, doScontrino, doConferma, idRigaDaModificare, doCmd, tipoDoc) {
    // this.tipoDoc = tipoDoc;
    // var iAction1 = this.flagsToAction(doConferma,doElimina,doScontrino);
    // this.action = iAction1;
    // var CartStr=this.toXML();
  }

  /** 
   * Invoked before leaving the order page when pressing the Tables button.
   * Just to see if the cart was changed. 
   * Changes require that we have an item with a state < 2.
   * No other changes are possible
  */
  hasNewItemsThatNeedSending() {
    let result = false;
    for (let item of this.items) {
      if (
        (item.idStatoRiga<2)
        && 
        (item.quantita !== 0)
      ) {
        result = true;
      }
    }
    return result;
  }
}
