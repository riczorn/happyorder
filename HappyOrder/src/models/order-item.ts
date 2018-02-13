/**
 *  HappyOrder app
 *  Datatype OrderItem
 *
 *  Implements the OrderItem, i.e. the single line in a cart.
 *
 * @package    HappyOrder
 * @author     Riccardo Zorn <code@fasterjoomla.com>
 * @copyright  2002 - 2017 Riccardo Zorn
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

 export class OrderItem {
   idArticolo:number;

   prezzo: number;
   changedPrezzo: number;
   idTipoArticolo:number;
   descrizione: string;
   portata: number;
   riga: number;
   quantita: number;
   idRigaOrdine: number;
   idStatoRiga: number;

   flag: number;
   idPadre: number;
   children: Array<OrderItem>;

   constructor(button: any) {
     /* caricamento da interfaccia (premo bottone articolo)

     {
         "name": "BIER",
         "price": "3,00",
         "id": 108, // id articolo
         "itemType": 1,
         "image": "",
         "defaultTurn": 0,
         "code": "",
         "sortGroup": 1
     },
     // caricamento da server (storico) in più abbiamo:

        dbID = orderid
       qt
       stateid
       */

     if ( !button.itemType ) {
       return null;
     }
     this.idArticolo = button.id;
     this.idStatoRiga = 1;
     this.idRigaOrdine = -1;
     this.portata = 0;
     this.idTipoArticolo = button.itemType;
     if (isNaN(button.price) && (typeof button.price == 'string')) {
       this.prezzo = parseFloat(button.price.replace(',','.'));
     } else {
       this.prezzo = button.price;
     }
     this.descrizione = button.name;


    if (button.dbID) {
      // è un articolo storicizzato ricaricato dal db;
      // allineo le proprietà:
      this.idRigaOrdine = button.dbID;
      this.idStatoRiga = button.stateid;
    }


    //  if (button.itemType == 1) {}
     this.children = new Array();
     if (button.children && button.children.length) {
       for (let child of button.children) {
         let extra = new OrderItem(child);
         extra.quantita = 1;
         this.children.push(extra);
       }
     }
   }

   add(quantita: number) {
     if (this.quantita + quantita <= 0) {
       if (this.idRigaOrdine > 0) {
         // this.storno();
       }
     }
     this.quantita += quantita;
   }

 }
