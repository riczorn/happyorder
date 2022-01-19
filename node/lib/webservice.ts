/**
  * HappyOrder node backend for app consumption
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */

const http = require("http");
const querystring = require('querystring');
const io = require('socket.io');
const path = require('path');
const fs = require('fs');
const url = require('url');
var nodemailer;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  console.log('mock nodemailer');
  nodemailer = {
    createTransport: function (obj) {
      console.log('mock createTransport', obj);
      return {
        sendMail: function (obj) {
          console.log('mock sendMail', obj);
        }
      }
    }
  };

}

import { exit } from 'process';
import hOConfigModule = require('../lib/config');
// var express = require("express");


class WebService {
  // ref to Express instance
  public port: number;
  public remoteHost: string;
  public commandPath: string;
  public config: hOConfigModule.Config;
  public sockets: Array<any>;
  private static _instance: WebService;
  // public io: any;

  constructor(config: hOConfigModule.Config) {
    this.port = 80;
    this.config = config;
    this.remoteHost = "127.0.0.1";
    this.commandPath = '/pocket/web_unikas.exe';
    this.sockets = new Array();
    WebService.Instance = this;
  }

  public login(this: WebService, res: any, body: any): number {
    let login: string = body.login;
    let password: string = body.password;
    let display: string = body.display;
    let androidVersion: string = body.androidVersion;

    console.log('login', login, display, androidVersion);
    let self: WebService = this;
    this.doGetJSON(res, {
      action: 'login',
      login: login,
      password: password,
      display: display,
      androidVersion: androidVersion
    },
      function (data: any) {
        // console.log('received login callback',typeof data);
        // console.log(data);

        self.decodeXML(res, data, function (err: any, result: any) {
          // console.log('parseString doGetJSON login' ,err, result);
          if (err) {
            self.error(res, 'Errore nel server remoto ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)) + "; contenuto della risposta: " + JSON.stringify(data));
          } else {
            //           header('Access-Control-Allow-Origin: *');
            // header('Content-Type: application/json');
            // header('Access-Control-Allow-Headers: Content-Type');
            var status = 'ko';
            var command = 'login';
            var repackedResult;
            var displayObject;
            if (result.clerkID) {
              if ((result.clerkID.id > 0)) {
                status = 'ok';
                command = 'login';
              }
              displayObject = {
                main: true,
                display: 'main',
                request: ''
              };
              if (result.display && result.display.id && result.display.request) {
                displayObject = {
                  main: false,
                  display: result.display.id,
                  request: result.display.request
                };
              }
              repackedResult = {
                status: status,
                command: command,
                clerk: {
                  id: result.clerkID.id,
                  name: result.clerkName.name,
                  privileges: null
                },
                client: {
                  ip: result.clientIp.ip,
                  id: result.clientId.id,
                  display: displayObject
                },
                tableId: result.tableID.id,
                orderId: result.orderID.id,
              }
            } else {
              repackedResult = {
                status: status,
                command: command,
                message: 'Utente o password errati',
                clerk: { privileges: [] }
              }
            }
            if (result.privileges && result.privileges.priv) {
              repackedResult.clerk.privileges = self.listToObject(result.privileges.priv);;
            }
            res.json(repackedResult);

            res.end();
          }
        }
        );
      },
      function (err: any) {
        self.error(res, 'Errore login ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)));
      }
    );
    return 0;
  }

  public status(this: WebService, res: any): number {
    // console.log('status');
    let self: WebService = this;
    // res:any,
    this.doGet(res, '/',
      function (data: any) {
        //res: http.ClientRequest
        // console.log('received status callback');
        // console.log(typeof data);
        // console.log(data);

        // header('Access-Control-Allow-Headers: Content-Type');
        res.json({ status: "ok", command: "status", data: "statusok" });
        res.end();
      }
      ,
      function (err: any) {
        let errorString = (typeof err.message === "string" ? err.message : 'Server remoto irraggiungibile');
        errorString += " " + self.remoteHost + ":" + self.port;
        self.error(res,
          errorString);
      }
    );
    return 0;
  }

  /**
  * new strategy: node ships with the apk, so we don't need to get it from the
  * web/client rather unikas/bin/nodejs/dist/apk
  * see: https://stackoverflow.com/questions/7288814/download-a-file-from-nodejs-server-using-express#7288883
  */
  public update(this: WebService, res: any): void {
    //  console.log('inside new update',__dirname);
    // __dirname == 

    let file = "android-release.apk",
      filePath: string,
      sourceFolder = __dirname.split(path.sep);
    if (sourceFolder.length) {
      sourceFolder.pop();
      sourceFolder.push('apk');
    } else {
      sourceFolder = ['..', 'apk'];
    }

    // let sourceFolder = __dirname.split('/');
    // console.log('sF', sourceFolder, 'fP', filePath);
    // if (sourceFolder && sourceFolder.length) {
    //   sourceFolder[sourceFolder.length-1] = 'apk';
    // }
    filePath = sourceFolder.join(path.sep) + path.sep;

    console.log('Beginning update', filePath + file);
    console.log('    sF', sourceFolder, 'fP', filePath);

    fs.exists(filePath + file, function (exists: any) {
      if (exists) {
        res.writeHead(200, {
          // "Content-Type": "application/octet-stream",
          "Content-Type": "application/vnd.android.package-archive",
          "Content-Disposition": "attachment; filename=" + file
        });
        fs.createReadStream(filePath + file).pipe(res);
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("ERROR File " + filePath + file + " does NOT Exists.apk");
      }
    });


  }

  private updateRemote(this: WebService, res: any): number {
    // console.log('status');
    let self: WebService = this;
    // res:any,
    this.doGetFile(res, '/client/android-release.apk',
      function (data: any) {
        //res: http.ClientRequest
        console.log('... Received update callback');
        // console.log(typeof data);
        // console.log(data);

        // header('Access-Control-Allow-Headers: Content-Type');
        res.setHeader('Content-disposition',
          'attachment; filename=android-release.apk');
        res.setHeader('Content-type', 'application/octet-stream');

        res.writeHead(200);
        res.end(data, 'binary'); // also inspect res.download !
        // res.end();
        // res.json({status:"ok", command:"update", data:"statusok"});
        // res.end();
      }
      ,
      function (err: any) {
        self.error(res, (typeof err.message === "string" ?
          err.message : 'Server remoto irraggiungibile'));
      }
    );
    return 0;
  }

  public loadSettings(this: WebService, res: any): number {
    // console.log('loadSettings');
    let self = this;
    this.doGet(res, '/interface/settings.xml',
      function (data: any) {
        // console.log('received loadSettings callback');
        self.decodeXML(res, data, function (err: any, result: any) {
          // console.dir(result);
          if (err) {
            self.error(res, 'Errore nel server remoto ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)) + "; contenuto della risposta: " + JSON.stringify(data));
          } else {
            self.normalizeSettings(result);
            res.json(result);
            res.end();
          }
        }
        );
      },
      function (err: any) {
        self.error(res, 'Errore server non raggiungibile 1 ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)));
      }
    );
    return 0;
  }

  /**
   * Post a cart to the xml backend.
   * @param this 
   * @param res 
   * @param cart 
   */
  public sendCart(this: WebService, res: any, cart: any): number {
    // console.log('sendCart');
    // console.log('data: ',cart);
    let self: WebService = this;
    // console.log('self ok: ');
    // convert Cart to XML:
    let xmlCart: string = '';
    if (cart.cart) {
      xmlCart = 'xmlaction=' + encodeURIComponent(self.cartToXML(cart.cart));
    } else {
      this.error(res, 'Errore nel formato del carrello, consulta i log');
      return -1;
    }
    // console.log('xmlCart packed');
    // res.json({status:'ok',message:'just testing'});
    //
    // res.end();
    // return;

    this.doPost(res, 'xmlaction', xmlCart,
      function (data: any) {
        // console.log('received sendCart callback',typeof data);
        // console.log(data);

        self.decodeXML(res, data, function (err: any, result: any) {
          // console.log('parseString doGetJSON sendCart' ,err, result);
          if (err) {
            self.error(res, 'Errore nel server remoto ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)) + "; contenuto della risposta: " + JSON.stringify(data));
          } else {
            //           header('Access-Control-Allow-Origin: *');
            // header('Content-Type: application/json');
            // header('Access-Control-Allow-Headers: Content-Type');
            result = result ? result : {}
            result.status = 'ok';
            result.command = 'sendCart';

            res.json(result);

            res.end();
          }
        }
        );
      },
      function (err: any) {
        self.error(res, 'Errore login ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)));
      }
    );
    return 0;
  }

  /**
    * Marshal the info back to the customer display:
    * each client has its own id and each master may have a slave or more.
    * the array master-slaves at the app level is populated upon login
    * of each terminal, and each master has the ids of its slaves.
    */
  public broadCast(this: WebService, res: any, req: any): void {
    // 1. am I a master? get a handle of my object.
    // 2. do I have a slave? broadcast to it.
    //this.io.broadcast('controls', self.currentSettings);
    // req.io.broadcast('status', msg);
    // this.io.broadcast('controls', req.query);
  }

  /**
    * convert the json cart to the xml format expected by web_unikas.exe
    */
  // private cartToXML1(stringCart: any) {
  //   console.log('cartToXML', typeof stringCart, stringCart);
  //   let cart = JSON.parse(stringCart);
  //   let result = ['<?xml>','<items>'];
  //   console.log('2cartToXML');
  //   if (cart.items) {
  //     console.log('cart items exists: ', cart.items);
  //     for (let item of cart.items) {
  //       console.log('2.5cartToXML');
  //
  //       result.push(this.lineToXML(item));
  //     }
  //   }
  //   console.log('3cartToXML');
  //
  //   result.push('</items>');
  //   return result.join("\n");
  // }

  private cartToXML(cart: any) {
    {
      if (typeof cart == "string") {
        cart = JSON.parse(cart);
      }
      // console.log('cartToXML',typeof cart, cart);
      // prepara un pacchetto per l'invio dei dati in XML
      var counter = 0, cqt = 0;
      var CartItem;
      var CartStr = "";
      var CartItemStr = "";
      var tempRow;
      var tempDescrizione;
      var tempPrice;
      var closetag = "";

      // defaults:
      cart.idCliente = cart.idCliente ? cart.idCliente : -1;
      cart.nomeVeloce = cart.nomeVeloce ? cart.nomeVeloce : '';

      // riempire i cartItems.
      var openedItems = 0;
      if (cart.items) {
        while (cart.items.length > 0) {
          tempRow = cart.items.shift();
          if (CartItemStr != "")
            if ((tempRow.idTipoArticolo == 1) && (openedItems > 0)) {
              CartItemStr = CartItemStr + "</Items>\n";
              openedItems -= 1;
            }
          //this.items:  "idArticolo|prezzo|idTipoArticolo|descrizione|portata|riga|quantita|idRigaOrdine|idStatoRiga|flag|idPadre"
          // anche storno! if ((tempRow.quantita!=0)) //(tempRow.idRigaOrdine<0) &&
          {
            tempPrice = tempRow.changedPrezzo ? tempRow.changedPrezzo : tempRow.prezzo;
            tempDescrizione = tempRow.descrizione;

            if (tempRow.idArticolo < 0) {
              //tempDescrizione = tempRow.flag
              tempPrice = tempRow.prezzo;
            } else {
              tempDescrizione = ""; // i prezzi "volanti" devono avere unaa descrizione;
              // gli altri articoli prendono quella di default al momento di salvare
              // l'ordine.
            }
            if (!tempPrice) {
              tempPrice = 0;
            }

            // ric: override ma probabilmente non necessario (baco portata!)
            tempPrice = 0;

            closetag = (tempRow.idTipoArticolo <= 1 ? "" : "/");
            // console.log('tempRow',tempRow);
            CartItemStr += '<Items dbID="' + tempRow.idRigaOrdine + '" DefaultTurn="' + tempRow.portata
              + '" ItemType="' + tempRow.idTipoArticolo + '" Price="' + tempPrice
              + '" ItemName="' + (tempDescrizione.replace('"', "'")) + '" ID1="' + tempRow.idArticolo
              + '" Multi="' + tempRow.quantita + '" Code="0" Fax="" ' + closetag + '>\n';
            if (tempRow.idTipoArticolo <= 1) {
              openedItems += 1;
            }
            if (tempRow.children) {
              for (let child of tempRow.children) {
                tempPrice = child.changedPrezzo ? child.changedPrezzo : child.prezzo;
                tempDescrizione = child.descrizione.replace('"', "'");
                CartItemStr += '<Items dbID="' + child.idRigaOrdine
                  + '" DefaultTurn="' + child.portata
                  + '" ItemType="' + child.idTipoArticolo + '" Price="' + tempPrice
                  + '" ItemName="' + (tempDescrizione) + '" ID1="' + child.idArticolo
                  + '" Multi="' + child.quantita + '" Code="0" Fax="" />\n';
              }
            }
            //carrello.appendChild(cartItem);
          }
          counter++
          cqt += tempRow.quantita
        }

        if ((CartItemStr != "") && (openedItems > 0)) {
          CartItemStr = CartItemStr + "</Items>\n";
        }
      }


      // if (!cart.doc) {
      //   cart.doc = {tipoDocumento : -1};
      // }
      if (isNaN(cart.doc.tipoDocumento)) {
        //console.log("cart.tipoDoc 55: "+cart.doc.tipoDocumento);
        cart.doc.tipoDocumento = -1;
      }
      /*
        gestire ancora: Storno
        carrello.appendChild(cartItems);
        carrello.setAttribute("xmlns","unikas.it")
        cartAction.appendChild(carrello);
      */

      let xmlPayments = '';//cart.payments.toXML();
      //console.log('Payments',cart);
      for (let payment of cart.payments) {
        //{ id: 8, itype: 7, name: "2WC", val: 2, fidelity: false, cssClass: "bpayment" }
        // to
        //  <Payments id1="undefined" itype="7" descr="WC" code="undefined" val="1" />

        //xmlPayments += '<Payments id1="'+ payment.id +'" itype="'+payment.itype+'" descr="'+payment.name+'" code="'+payment.id+'" val="'+payment.val+'" />';
        if (payment.code && payment.code > 0) {
          xmlPayments += '<Payments id1="' + payment.id + '" itype="6" descr="' + payment.name + '" code="' + payment.code + '" val="' + payment.val + '" />\n';
        } else {
          xmlPayments += '<Payments id1="-1" itype="' + payment.id + '" descr="' + payment.name + '" code="" val="' + payment.val + '" />\n';
        }

        //                <Payments id1="-1" itype="8" descr="2WC" code="undefined" val="2" />

        //                <Payments id1="undefined" itype="7" descr="WC" code="undefined" val="1" />
      }
      //console.log('XMLPayments: ', xmlPayments);

      CartStr = '<?xml version="1.0"?>\n' +
        '<Cart xmlns="unikas.it">\n' + //xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        '  <clerkID>' + cart.clerkId + '</clerkID>\n' +
        '  <customerID>' + cart.idCliente + '</customerID>\n' +
        '  <tableID>' + cart.idTavolo + '</tableID>\n' +
        '  <tableID2>' + cart.idTavolo2 + '</tableID2>\n' +
        '  <orderID>' + cart.idOrdine + '</orderID>\n' +
        '  <nomeVeloce>' + cart.nomeVeloce + '</nomeVeloce>\n' +
        '  <action>' + (cart.action) + '</action>\n' +
        '  ' + xmlPayments +  //</Payments>\n'+
        '  <documentType>' + cart.doc.tipoDocumento + '</documentType>\n' +
        '  <tableID2>-1</tableID2>\n' +
        '  <autoSplitBill>' + cart.autoSplitBill + '</autoSplitBill>\n' +
        CartItemStr +
        '  <selectedIndex>0</selectedIndex>\n';
      //
      // if ((cart.replacementItemName != "" ) || (1*cart.replacementItemTotal != 0))
      // {
      // 	CartStr+='  <ReplacementItems dbID="-1" ItemName="'+cart.replacementItemName+'" Total="'+cart.replacementItemTotal+'" Multi="3" />\n'
      // }
      CartStr += '  <selectedExtraIndex>-1</selectedExtraIndex>\n' +
        '  <sconto>' + cart.totals.sconto + '</sconto>\n' +
        '  <listino>' + cart.listino + '</listino>\n' +
        '</Cart>\n';
      //alert(CartStr);
      // console.log('cartString XML elaborato');
      console.log(CartStr);
      // console.log('');
      return CartStr;
    }

  }


  private lineToXML(item: any) {
    let result = [];
    result.push('<item id="' + item.idArticolo + '"/>');
    return result.join(" ");
  }

  /**
   * Apri un tavolo e recupera l'ordine.
   * Comando: gettablecontent;
   * parametri: tableID, clerkID, opzionale: orderID (per ora non supportato?)
   */
  openTable(this: WebService, res: any, tableId: number, clerkId: number) {
    // console.log('openTable 101', tableId, clerkId);
    let self: WebService = this;
    this.doGetJSON(res, {
      action: 'gettablecontent',
      tableID: tableId,
      clerkID: clerkId
    },
      function (data: any) {
        // console.log('received openTable callback',typeof data);
        // console.log(data);

        self.decodeXML(res, data, function (err: any, result: any) {
          // console.log('parseString doGetJSON openTable' ,err, result);
          if (err) {
            self.error(res, 'Errore nel server remoto ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)) + "; contenuto della risposta: " + JSON.stringify(data));
          } else {
            //           header('Access-Control-Allow-Origin: *');
            // header('Content-Type: application/json');
            // header('Access-Control-Allow-Headers: Content-Type');
            var status = 'ok';
            var command = 'openTable';
            result.status = status;
            result.command = command;

            result.orders = self.makeSureItsAnArray(result.orders);
            if (!result.orderitems) {
              result.orderitems = {};
            }
            result.orderitems.orderitem = self.makeSureItsAnArray(result.orderitems.orderitem);
            for (let item of result.orderitems.orderitem) {
              /* Aggiorno i dati passati:

              {
                DefaultTurn
                atype
                dbID = orderid
                desc
                id
                qt
                stateid
                total
              }
              al formato bottone:
              {
                  "name": "BIER",
                  "price": "3,00",
                  "id": 108,
                  "itemType": 1,
                  "image": "",
                  "defaultTurn": 0,
                  "code": "",
                  "sortGroup": 1
              },
              */
              self.fixItem(item);
              // qt
              //stateid
              // dbID
              // @TODO gestire ordersubitem
              // console.log('item sub',item.name, item.ordersubitem);
              // console.log('  length',item.ordersubitem.length);
              if (item.ordersubitem) {
                // console.log('  child:',item.ordersubitem);
                item.children = self.makeSureItsAnArray(item.ordersubitem);
                for (let child of item.children) {
                  self.fixItem(child);
                  // item.children.push(child);
                }
                //
                //   console.log('  item sub2',item.children);
                delete (item.ordersubitem);
              }


            }
            res.json(result);

            res.end();
          }
        }
        );
      },
      function (err: any) {
        self.error(res, 'Errore openTable ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)));
      }
    );
    return 0;
  }

  /**
   * Elenco degli ultimi ordini, per mostrare una vista all'operatore
   * cliccando un ordine ne si ristampa lo scontrino.
   * @param this 
   * @param res 
   * @param query 
   */
  getLastOrders(this: WebService, res: any, query: any) {
    //console.log('>getLastOrders', query);
    let self = this;
    query.action = 'getlastorders';
    this.doGetJSON(
      res,
      query,
      function (data: any) {
        //console.log('received getLastOrders callback',typeof data);
        //console.log(data);

        self.decodeXML(res, data, function (err: any, result: any) {
          //console.log('decoded result',result);
          if (err) {
            self.error(res, 'Errore nel server remoto getLastOrders ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)) + "; contenuto della risposta: " + JSON.stringify(data));
          } else {
            // header('Access-Control-Allow-Origin: *');
            // header('Content-Type: application/json');
            // header('Access-Control-Allow-Headers: Content-Type');
            //console.log(result);
            var status = 'ok';
            var command = 'getLastOrders';
            var oResponse = {
              status: status,
              command: command,
              orders: self.makeSureItsAnArray(result.elencoOrdini.elencoOrdine)
            };
            oResponse.orders.splice(20);

            res.json(oResponse);

            res.end();
          }
        })
      },
      function (err: any) {
        self.error(res, 'Errore getLastOrders ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)));
      }
    );
  }

  /**
   * Restituisce lo stato della fidelity il cui codice è stato passato
   * nella richiesta:
   * @param this 
   * @param res 
   * @param query 
   */
  getFidelityInfo(this: WebService, res: any, query: any) {
    //console.log('>getFidelityInfo', query);
    let self = this;
    query.action = 'get-fidelity-info';
    this.doGetJSON(
      res,
      query,
      function (data: any) {
        //console.log('received getFidelityInfo callback',typeof data);
        //console.log(data);

        self.decodeXML(res, data, function (err: any, result: any) {
          //console.log('decoded result',result);
          if (err) {
            self.error(res, 'Errore nel server remoto getFidelityInfo ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)) + "; contenuto della risposta: " + JSON.stringify(data));
          } else {
            // header('Access-Control-Allow-Origin: *');
            // header('Content-Type: application/json');
            // header('Access-Control-Allow-Headers: Content-Type');
            //console.log(result);
            if (result.fidelity.val && result.fidelity.val.replace) {
              result.fidelity.val = parseFloat(result.fidelity.val.replace(',', '.'));
            }

            var status = 'ok';
            var command = 'getFidelityInfo';
            var oResponse = {
              status: status,
              command: command,
              data: result.fidelity
            };

            res.json(oResponse);

            res.end();
          }
        })
      },
      function (err: any) {
        self.error(res, 'Errore getFidelityInfo ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)));
      }
    );
  }

  createFidelity(this: WebService, res: any, query: any) {
    console.log('>createFidelity', query);
    let self = this;
    query.action = 'create-fidelity';
    this.doGetJSON(
      res,
      query,
      function (data: any) {
        //console.log('received createFidelity callback', typeof data);
        //console.log(data);

        self.decodeXML(res, data, function (err: any, result: any) {
          //console.log('decoded result',result);
          if (err) {
            self.error(res, 'Errore nel server remoto createFidelity ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)) + "; contenuto della risposta: " + JSON.stringify(data));
          } else {
            // header('Access-Control-Allow-Origin: *');
            // header('Content-Type: application/json');
            // header('Access-Control-Allow-Headers: Content-Type');
            //console.log(result);
            var status = 'ok';
            var command = 'createFidelity';
            var oResponse = {
              status: status,
              command: command,
              data: result //.fidelity ?
            };

            res.json(oResponse);

            res.end();
          }
        })
      },
      function (err: any) {
        self.error(res, 'Errore createFidelity ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)));
      }
    );
  }


  printDoc(this: WebService, res: any, query: any) {
    //console.log('>printDoc', query);
    let self = this;
    query.action = 'printDoc';
    this.doGetJSON(
      res,
      query,
      function (data: any) {
        //console.log('received printDoc callback',typeof data);
        //console.log(data);

        self.decodeXML(res, data, function (err: any, result: any) {
          //console.log('decoded result',result);
          if (err) {
            self.error(res, 'Errore nel server remoto getLastOrders ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)) + "; contenuto della risposta: " + JSON.stringify(data));
          } else {
            //           header('Access-Control-Allow-Origin: *');
            // header('Content-Type: application/json');
            // header('Access-Control-Allow-Headers: Content-Type');
            //console.log(result);
            var status = 'ok';
            var command = 'printDoc';
            var oResponse = {
              status: status,
              command: command
            };

            res.json(oResponse);
            res.end();
          }
        })
      },

      function (err: any) {
        self.error(res, 'Errore openTable ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)));
      }
    );
  }


  fatturaElettronica(this: WebService, res: any, query: any) {
    var self = this;
    // console.log('fatturaElettronica 1', query);
    console.log('fatturaElettronica 1', query.file);
    console.log('fatturaElettronica 2', self.config.fullConfig.fatturaElettronica);

    var oResponse = {
      status: 'ok',
      filename: query.file,
      command: 'fatturaElettronica',
      output: ''
    };

    fs.readFile(query.file, { encoding: 'utf-8' }, function (err, postData) {
      if (!err) {
        // now data contains the xml invoice
        console.log('letta fattura: ');// + postData); 

        if (self.config.fullConfig.fatturaElettronica == undefined
          || self.config.fullConfig.fatturaElettronica.sdiURI == undefined
          || self.config.fullConfig.fatturaElettronica.sdiURI == "") {
          console.error('fattura: non inviata - configurazione mancante', self.config.fullConfig.fatturaElettronica);
          res.json(oResponse);
          res.end();
          return true;
        }


        var sdiUri = url.parse(self.config.fullConfig.fatturaElettronica.sdiURI + '/invoice');
        console.log('sdiUri', sdiUri);

        var auth = 'Basic ' + Buffer.from(self.config.fullConfig.fatturaElettronica.auth.username + ':' + self.config.fullConfig.fatturaElettronica.auth.password).toString('base64');

        var options = {
          hostname: sdiUri.hostname,
          port: sdiUri.port || (sdiUri.protocol == 'http:' ? 80 : 443),
          path: sdiUri.path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/xml',
            'Content-Length': postData.length,
            'Authorization': auth,
            'ClientId': self.config.fullConfig.fatturaElettronica.params.ClientId
          }
        };
        console.log('http options', options);
        var sdiReq = http.request(options, function (resp) {
          console.log('STATUS: ' + resp.statusCode);
          console.log('HEADERS: ' + JSON.stringify(resp.headers));
          resp.setEncoding('utf8');
          resp.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            oResponse.output = oResponse.output + chunk;
          });
          resp.on('end', () => {
            console.log('  end of data.');
            res.json(oResponse);
            res.end();
          });
        });

        sdiReq.on('error', function (e) {
          console.error('problem with request: ' + e.message);
          oResponse.status = 'ko';
          oResponse.output = e.message;
          res.json(oResponse);
          res.end();
        });

        // write data to request body
        sdiReq.write(postData);
        sdiReq.end();
        // res.end not invoked here, but in the callbacks from the provider

      } else {
        oResponse.status = 'ko';
        oResponse.filename = query.file;
        console.error('fattura: errore', err);
        res.json(oResponse);
        res.end();
      }
    });

    // res.json(oResponse);
    // res.end();

  }

  getMailStyle() {
    return `
    <style>
    .fattura {
      display: flex;

    }

    button {
      padding: 10px;
      font-size: 120%;
    }

    .fattura:hover {
      background-color: #ddc;
    }

    .fattura>* {
      padding: 5px;
    }

    .fattura .num {
      flex-basis: 3rem;
    }

    .fattura .date {
      flex-basis: 6rem;
    }

    .fattura .name {
      flex-grow: 6;
    }

    .fattura .state {
      font-weight: bold;
      flex-basis: 5rem;
    }

    .fattura .state.ko {
      color: red;
    }

    .fattura .state.scartata {
      color: red;
    }

    .fattura .state.ok {
      color: green;
    }
    </style>
    `
  }

  async fattureAlerts(this: WebService, res: any, query: any) {
    let self = this;
    let response = { status: 'ok', errors: 0, fatture: [], totFatture: 0 };
    let year = new Date().getFullYear();
    let fatture = await self.fattureGetYear(year, new Date().getMonth() + 1);
    response.totFatture = fatture.length;
    let errors = 0;
    let errorLines = [];
    fatture.forEach((fattura) => {
      if (!fattura.RicevutaConsegna) {
        //if (new Date(fattura.DataFattura).getFullYear() == year) {
        errors += 1;

        //}
        errorLines.push(fattura);
      }
    });
    if (errors > 0 || query.includeAll) {
      // send mail report
      response.status = errors > 0 ? 'ko' : 'ok';
      response.errors = errors;
      if (query.includeAll) {
        response.fatture = fatture;
      } else {
        response.fatture = errorLines;
      }

      let messageHTML = self.formatMessage(response);
      let messageText = messageHTML.replace(/<\/div>/gi, "\n").replace(/<[^>]>/gi, "\t");
      let url = 'http://fe.happyorder.it/fatture';
      messageText += `\n${url}`;
      messageHTML += '<div><a href="http://fe.happyorder.it/fattureAlerts" target="_blank">Vedi online</a></div>';

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "mail.fasterjoomla.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: 'fatture@happyorder.it', // generated ethereal user
          pass: ']adeJump30', // generated ethereal password
        },
      });


      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"HappyOrder Server" <fatture@happyorder.it>', // sender address
        to: "Piergiovanni Carocari <p.carocari1@virgilio.it>", // list of receivers
        subject: `${errors} Fatture in errore`, // Subject line
        text: messageText, // plain text body
        html: self.getMailStyle() + messageHTML, // html body
      });

      console.log("Message sent: %s", info.messageId, info);
    }
    res.json(response);
    res.end();
  }

  formatMessage(response) {
    let message = [];

    message.push(`<h1>${response.errors} errori su ${response.totFatture} fatture</h1>`);
    response.fatture.forEach(fattura => {
      let date = new Date(fattura.DataFattura);
      message.push(`
        <div class="fattura">
          <div class="num">${fattura.numero}</div>
          <div class="date">${fattura.date}</div>
          <div class="name">${fattura.nome}</div>
          <div class="amount">${fattura.amount}</div>
          <div class="state ${fattura.status}">${fattura.status}</div>
        </div>
    `);

    });
    return message.join("\n");
  }

  async fattureList(this: WebService, res: any, query: any) {
    var self = this;
    // console.log('fatturaElettronica 1', query);
    console.log('fattureList 1');// , query.file);
    //console.log('fattureList 2', self.config.fullConfig.fatturaElettronica);

    if (!query) {
      query = {};
    }
    if (!query.anno) {
      query.anno = new Date().getFullYear();
    }
    if (!query.mese) {
      query.mese = (new Date().getMonth() + 1);
    }

    let oResponse = {
      status: 'ok',
      fatture: await self.fattureGetYear(query.anno, query.mese),
      command: 'fattureInviate',
      output: '',
    };



    res.json(oResponse);
    res.end();
  }

  async fattureGetYear(anno, mese) {
    let self = this;
    let fatture = [];

    for (let m = mese; m > 0; m--) {
      // let bottom = mese - 3;
      // // if (bottom < 1) { bottom = 1; }
      // for (let m = mese; m > bottom; m--) {
      let aResponse = await <any>self.fattureGetMonth(anno, m);
      console.log('  received fatt. ' + aResponse.fatture.length);
      let newFatture = aResponse.fatture;
      fatture.splice(0, 0, ...newFatture);
    }

    return this.processFatture(fatture);
    //console.log('fatture lengh', fatture.length);
  }

  async fattureGetMonth(year, month) {
    return new Promise((resolve, reject) => {
      let oResponse = {
        status: 'ko',
        fatture: [],
        command: 'fattureInviate',
        output: '',
      };

      let self = this;
      var sdiUri = url.parse(self.config.fullConfig.fatturaElettronica.sdiURI
        + '/sentInvoices?codiceFiscale=' + self.config.fullConfig.fatturaElettronica.params.PartitaIva
        + '&anno=' + year
        + '&mese=' + month);

      var auth = 'Basic ' + Buffer.from(self.config.fullConfig.fatturaElettronica.auth.username + ':' + self.config.fullConfig.fatturaElettronica.auth.password).toString('base64');

      var options = {
        hostname: sdiUri.hostname,
        port: sdiUri.port || (sdiUri.protocol == 'http:' ? 80 : 443),
        path: sdiUri.path,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': auth,
          'ClientId': self.config.fullConfig.fatturaElettronica.params.ClientId,
        }
      };
      //console.log('http options', options);
      let sdiReq = http.request(options, function (resp) {
        console.log('STATUS: ' + resp.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(resp.headers));
        resp.setEncoding('utf8');
        resp.on('data', function (chunk) {
          //console.log('BODY: ' + chunk);
          oResponse.output = oResponse.output + chunk;
        });
        resp.on('end', () => {
          console.log('  end of data.');
          if (oResponse.output) {
            oResponse.status = 'ok';
            oResponse.fatture = self.formatFatture(oResponse.output);
            resolve(oResponse);
          } else {
            resolve(oResponse);
          }

        });
      });

      sdiReq.on('error', function (e) {
        console.error('problem with request: ' + e.message);
        oResponse.status = 'ko';
        oResponse.output = e.message;
        reject(oResponse);
        //return oResponse;
      });
      sdiReq.end();
      console.log('returning ', month, '=> # fatt ', oResponse.fatture.length);
      //return await oResponse;
    });
    // write data to request body
    // sdiReq.write(postData) ;

  }

  fattureListOld(this: WebService, res: any, query: any) {
    var self = this;
    // console.log('fatturaElettronica 1', query);
    /*   console.log('fattureList 1');// , query.file);
       console.log('fattureList 2', self.config.fullConfig.fatturaElettronica);
   
       var oResponse = {
         status: 'ok',
         fatture: [],
         command: 'fattureInviate',
         output: ''
       };
       if (!query) {
         query = {};
       }
       if (!query.anno) {
         query.anno = new Date().getFullYear();
       }
       if (!query.mese) {
         query.mese = (new Date().getMonth() + 1);
       }
   
       var sdiUri = url.parse(self.config.fullConfig.fatturaElettronica.sdiURI
         + '/sentInvoices?codiceFiscale=' + self.config.fullConfig.fatturaElettronica.params.PartitaIva
         + '&anno=' + query.anno
         + '&mese=' + query.mese);
   
       var auth = 'Basic ' + Buffer.from(self.config.fullConfig.fatturaElettronica.auth.username + ':' + self.config.fullConfig.fatturaElettronica.auth.password).toString('base64');
   
       var options = {
         hostname: sdiUri.hostname,
         port: sdiUri.port || (sdiUri.protocol == 'http:' ? 80 : 443),
         path: sdiUri.path,
         method: 'GET',
         headers: {
           'Accept': 'application/json',
           'Authorization': auth,
           'ClientId': self.config.fullConfig.fatturaElettronica.params.ClientId
         }
       };
       console.log('http options', options);
       var sdiReq = http.request(options, function (resp) {
         console.log('STATUS: ' + resp.statusCode);
         console.log('HEADERS: ' + JSON.stringify(resp.headers));
         resp.setEncoding('utf8');
         resp.on('data', function (chunk) {
           // console.log('BODY: ' + chunk);
           oResponse.output = oResponse.output + chunk;
         });
         resp.on('end', () => {
           console.log('No more data in response.');
           if (oResponse.output) {
             let response = self.formatFatture(oResponse.output);
             res.json(response);
           } else {
             oResponse.status = 'ko';
             res.json([]);
           }
           //res.json(JSON.parse(oResponse.output));
   
           res.end();
         });
       });
   
       sdiReq.on('error', function (e) {
         console.error('problem with request: ' + e.message);
         oResponse.status = 'ko';
         oResponse.output = e.message;
         res.json(oResponse);
         res.end();
       });
   
       // write data to request body
       // sdiReq.write(postData);
       sdiReq.end();
       // res.end not invoked here, but in the callbacks from the provider
   
   */

    // res.json(oResponse);
    // res.end();
  }

  processFatture(fatture) {
    fatture.sort((a, b) => {
      return a.numero - b.numero;
    });
    //console.log('fatt2', fatture.length);
    let fattureOk = [];
    for (let i = 0; i < 200; i++) {
      fattureOk[i] = false;
    }
    // ora mi faccio un elenco delle fatture OK, così elimino le scartate corrispondenti.
    fatture.forEach((fattura, index) => {
      //console.log('      OK', index, ', num:', fattura.numero, ', ric.cons.', fattura.RicevutaConsegna);
      if (fattura.RicevutaConsegna) {
        fattureOk[fattura.numero] = true;
      }
    });

    //console.log('    ricevutaConsegna:', fattureOk);

    let errorsToDelete = []; // index of fatture which were eventually sent.
    fatture.forEach((fattura, index) => {
      //console.log('      ERR', index, ', num:', fattura.numero,
      //  ', ok:', fattureOk[fattura.numero], ', ric.cons.', fattura.RicevutaConsegna);
      if (fattureOk[fattura.numero] && !fattura.RicevutaConsegna) {
        errorsToDelete.push(index);
      }
    });

    //console.log('the following can be deleted', errorsToDelete);

    //errorsToDelete.sort();
    for (let i = errorsToDelete.length - 1; i >= 0; i--) {
      fatture.splice(errorsToDelete[i], 1);
    }


    // if (fattureOk[fattura.numero] && fattura.RicevutaConsegna) {
    // }

    //console.log('fatt3', fatture.length);
    return fatture;
  }

  formatFatture(fattureJsonAsString) {
    //console.log('fatt1');
    let response = [];

    if (fattureJsonAsString.length > 3) {
      let fatture = JSON.parse(fattureJsonAsString);
      //console.log('fatt', fatture.length);
      fatture.forEach(fattura => {

      });



      fatture.forEach(fattura => {
        // leviamo gli invii errati quando siamo riusciti a correggere:
        let status = 'ko';
        if (fattura.Inviato) {
          status = 'scartata';
        }
        if (fattura.RicevutaConsegna) {
          status = 'ok';
        }


        let ddate = new Date(fattura.DataFattura);


        response.push({
          IdFatturaSDI: fattura.IdFatturaSDI,
          DataOraInserimento: fattura.DataOraInserimento,
          DataFattura: fattura.DataFattura,
          RicevutaConsegna: fattura.RicevutaConsegna,
          Esito: fattura.Esito,
          Inviato: fattura.Inviato,
          numero: 1 * fattura.numeroFattura,
          nome: fattura.DenominazioneCessionario,
          amount: fattura.Importo.toLocaleString('it-IT', { minimumFractionDigits: 2 }),
          date: ddate.getDate() + '/' + (ddate.getMonth() + 1) + '/' + ddate.getFullYear(),
          status: status
        });

      });
    }
    return response;
  }

  fixItem(item: any) {
    item.itemType = item.atype;
    delete (item.atype);
    item.defaultTurn = item.DefaultTurn;
    delete (item.DefaultTurn);
    // id corrisponde.
    item.name = item.desc;
    delete (item.desc);
    item.price = item.total; //(item.total/item.qt);
    delete (item.total);
  }

  /**
   * recupera lo stato dei tavoli.
   * Comando: ;
   * parametri: nessuno
   */
  getTablesStates(this: WebService, res: any, clerkId: number) {
    // console.log('getTablesStates 101', clerkId);
    let self: WebService = this;
    this.doGetJSON(res, {
      action: 'readtablesstates',
      clerkID: clerkId
    },
      function (data: any) {
        // console.log('received getTablesStates callback',typeof data);
        // console.log(data);

        self.decodeXML(res, data, function (err: any, result: any) {
          // console.log('parseString doGetJSON openTable' ,err, result);
          if (err) {
            self.error(res, 'Errore nel server remoto ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)) + "; contenuto della risposta: " + JSON.stringify(data));
          } else {
            //           header('Access-Control-Allow-Origin: *');
            // header('Content-Type: application/json');
            // header('Access-Control-Allow-Headers: Content-Type');
            var status = 'ok';
            var command = 'tables';
            result.status = status;
            result.command = command;
            let t = [];
            for (let i = 0; i < result.tableStates.length; i++) {
              t.push(result.tableStates.charAt(i));
            }
            result.tableStates = t;

            res.json(result);

            res.end();
          }
        }
        );
      },
      function (err: any) {
        self.error(res, 'Errore openTable ' + (typeof err.message === "string" ? err.message : JSON.stringify(err)));
      }
    );
    return 0;
  }

  private normalizeSettings(result: any) {
    let self = this;
    result.settings.translations = self.listToObject(result.settings.translations.t);
    // tolgo robaccia
    for (var i = 0; i < result.clerks.clerk.length; i++) {
      result.clerks.clerk[i].translations =
        self.listToObject(result.clerks.clerk[i].translations.t);
    }
    delete (result.buttons.orderman);
    result.settings.printLocations = self.makeSureItsAnArray(result.settings.printLocations.printLocation);
    result.settings.priceLists = self.makeSureItsAnArray(result.settings.priceLists.priceList);
    result.settings.documents = self.makeSureItsAnArray(result.settings.documents.document);
    result.settings.payments = self.makeSureItsAnArray(result.settings.payments.payment);
    result.settings.fidelity = self.makeSureItsAnArray(result.settings.ukInput.fidelity);
    result.settings.tableStates = self.makeSureItsAnArray(result.settings.tableStates.state);
    delete (result.settings.ukInput);
    result.settings.valute = self.makeSureItsAnArray(result.settings.valute.valuta);
    result.tables.table = self.makeSureItsAnArray(result.tables.table);
    result.tables.floor = self.makeSureItsAnArray(result.tables.floor);
    result.clerks = self.makeSureItsAnArray(result.clerks.clerk);


    result.items.sections = self.makeSureItsAnArray(result.items.sections);

    for (let s of result.items.sections) {
      s.section = self.makeSureItsAnArray(s.section);
      if (s.item) {
        s.item = self.makeSureItsAnArray(s.item);
      }
      for (let s2 of s.section) {
        s2.item = self.makeSureItsAnArray(s2.item);
      }
    }


    for (let v of [result.buttons.desktop, result.buttons.client, result.buttons.pocketpc]) {
      // buttons.desktop.page
      v.page = self.makeSureItsAnArray(v.page);
      for (let p of v.page) {
        p.button = self.makeSureItsAnArray(p.button);
      }
      //buttons.desktop.buttonsTop.button
      if (v.buttonsTop) v.buttonsTop = self.makeSureItsAnArray(v.buttonsTop.button);
      if (v.buttonsBottom) v.buttonsBottom = self.makeSureItsAnArray(v.buttonsBottom.button);
      if (v.buttonsPreview) v.buttonsPreview = self.makeSureItsAnArray(v.buttonsPreview.button);
    }
  }

  private makeSureItsAnArray(item: any) {
    // console.log("makeSureItsAnArray",typeof item, item?item.constructor.name:'n/a');
    // if (typeof item === "Array") {}
    if (!(item instanceof Array)) {
      // console.log('Converting to Array:', item);
      if (item) {
        // console.log('Converting to Array:', item);
        item = new Array(item);
      } else {
        item = new Array();
      }
    }
    return item;
  }

  private listToObject(list: any) {
    let tempObj: any = {};
    for (var i = 0; i < list.length; i++) {
      let tempItem = list[i];
      tempObj[tempItem.id] = tempItem.val ? tempItem.val : tempItem.name;
    }
    return tempObj;

  }

  public decodeXML(this: WebService, res: any, data: string, callback?: Function) {
    let self: WebService = this;
    // console.log('decodeXML',typeof data);
    // var subdata = (<string>data).substring(0,1000);

    var xml2js = require('xml2js');
    // var parseString = require('xml2js').parseString;
    var parser = new xml2js.Parser({
      trim: false,
      // attrkey:'props_',
      mergeAttrs: true,
      explicitRoot: false,
      explicitArray: false,
      tagNameProcessors: [self.fixName],
      attrNameProcessors: [self.fixName],
      valueProcessors: [self.fixAttrValue],
      attrValueProcessors: [self.fixAttrValue]
    }); //var parser = new xml2js.Parser

    // reading the xml file can be tricky. Also, it can be something different,
    // i.e. a string error message or a json object.
    // try {

    parser.parseString(data, callback);
    // catch e:Exception
    // {
    //
    // }
    // res.end(data);
  }


  public fixName(name: string): string {
    //do something with `name`
    // console.log('EXAMINE fixName',name);
    if (name == 'fid') name = 'id';
    if (name == 'nome') name = 'name';
    if (name == 'fid1') name = 'id';
    if (name == 'id1') name = 'id';

    return name;
  }

  public fixAttrValue(val: any, name: string): any {
    //do something with `name`
    // console.log('EXAMINE fixAttrValue',name,'=',val);
    if (typeof val === "string") {
      if (val === 'False') {
        val = false;
      } else if (val === 'True') {
        val = true;
      } else {
        if ((val.length < 10) && val.match(/^-?[0-9]+\.?[0-9]*$/)) {
          var fval = parseFloat(val);
          if (!isNaN(fval)) {
            // it's a number: let's see if it's a float:
            if (fval - Math.floor(fval) == 0) {
              return parseInt(val);
            } else {
              return fval;
            }
          }
        } else {
          // è un IP o altra roba del genere
          return val;
        }
      }
    }
    return val
  }

  public doGetJSON(this: WebService, res: any, params: any, callback?: Function, callbackError?: Function): number {
    var arrParams: string[] = [];
    for (let param in params) {
      let sparam: string = <string>param;
      arrParams.push(sparam + '=' + encodeURIComponent(params[sparam]));
    }
    var stringParams = arrParams.join('&');
    // stringParams = 'user='+encodeURIComponent(params.user)+
    //           '&password='+encodeURIComponent(params.password);

    return this.doGet(res, this.commandPath + '?' + stringParams, callback, callbackError);
  }

  public doGet(this: WebService, res: any, query: string,
    callback?: Function, callbackError?: Function): number {
    var headers = {
      'Content-Type': 'application/json'
      // 'Content-Length': jsonBody.length
    };
    // this.remoteHost could include a path; if so I need to fix it
    console.log('22 remote host: ', this.remoteHost);
    const hasPath = this.remoteHost.match(/http:\/\/[0-9a-z_\.\-]+\/(.*)$/);
    if (hasPath) {
      console.log(this.remoteHost, 'contains a path; query: ', query);
      console.log(hasPath);
      const pathPart = hasPath[1];
      const hostPart = this.remoteHost.replace(pathPart, '');
      this.remoteHost = hostPart;
      query = pathPart.replace(/\/$/, '') + query;
      console.log('updated ', this.remoteHost, 'contains a path; query: ', query);
    }

    var options = {
      host: encodeURI(this.remoteHost),
      port: this.port,
      path: encodeURI(query),
      method: 'GET',
      timeout: 3000
    };
    // console.log('options:',JSON.stringify(options));
    /*
     http.request() returns an instance of the http.ClientRequest class.
     The ClientRequest instance is a writable stream.
     If one needs to upload a file with a POST request,
     then write to the ClientRequest object
    */
    var req = http.request(options,
      function (res: any) {
        res.setEncoding('utf-8');
        var responseString = '';

        res.on('data', function (data: any) {
          responseString += data;
        });

        res.on('end', function () {
          // console.log('RECEIVED ', responseString.length, 'bytes');
          if (typeof callback === "function") {
            // console.log('invoking callback:');//,callback);
            callback(responseString);
          }
          //  var resultObject = JSON.parse(responseString);
        });
      },

      function (error: any) {
        // console.log('ERROR ',error);
        if (typeof callbackError === "function") {
          //WebService.apply(callback, responseString)
          // console.log('invoking ',callback);
          callbackError('ERROR1 ' + error);
        }
      }
    );
    /*
    If any error is encountered during the request (be that with DNS resolution, TCP level errors, or actual HTTP parse errors) an 'error' event is emitted on the returned request object
    */
    req.on('response', function (res: any) {
      // console.log('response: ' + res);
      // console.log('response status code: ' + res.statusCode);
    });
    req.on('error', function (error: any) {
      console.error('Server non raggiungibile  2 ERROR ');//,error);
      if (typeof callbackError === "function") {
        // il sito non è raggiungibile. Apache giù oppure indirizzo IP sbagliato nella configurazione di node:
        // console.log('invoking callback ');//,callback);
        callbackError('Server non raggiungibile ' + error);
      }
    });
    // write data to request body
    req.write('');//jsonBody);
    req.end();
    //Note that in the example req.end() was called. With http.request() one must always call req.end() to signify that you're done with the request - even if there is no data being written to the request body
    return 1;
  };

  /**
    * basically identical to doGet but no headers.
    */
  public doGetFile(this: WebService, res: any, query: string,
    callback?: Function, callbackError?: Function): number {

    var headers = {
      // 'Content-Type': 'application/json'
      // 'Content-Length': jsonBody.length
    };

    var options = {
      host: encodeURI(this.remoteHost),
      port: this.port,
      path: encodeURI(query),
      method: 'GET',
      timeout: 3000
    };

    var req = http.request(options,
      function (res: any) {
        // res.setEncoding('utf-8');
        var responseString = '';

        res.on('data', function (data: any) {
          responseString += data;
        });

        res.on('end', function () {
          // console.log('RECEIVED ', responseString.length, 'bytes');
          if (typeof callback === "function") {
            // console.log('invoking callback:');//,callback);
            callback(responseString);
          }
        });
      },

      function (error: any) {
        if (typeof callbackError === "function") {
          callbackError('ERROR1 ' + error);
        }
      }
    );

    req.on('response', function (res: any) {
      // console.log('response: ' + res);
    });
    req.on('error', function (error: any) {
      console.error('Server non raggiungibile  22 ERROR ');//,error);
      if (typeof callbackError === "function") {
        // il sito non è raggiungibile. Apache giù oppure indirizzo IP sbagliato nella configurazione di node:
        // console.log('invoking callback ');//,callback);
        callbackError('Server non raggiungibile 22 ');//+error);
      }
    });
    req.write('');
    req.end();
    return 1;
  };

  private error(res: any, errorMessage: string): void {
    res.json({
      id: 501,
      status: 'ko',
      error: errorMessage
    });

    res.end();
  }

  public doPost(this: WebService, res: any, path: string, body: any, callback: any, errCallback: any): any {
    //Convert object js with data to json string
    // return "NON Usarmi non sono pronta!";
    // var jsonBody = JSON.stringify(body);

    var query = this.commandPath + '?action=' + path;
    // An object containing request headers.
    var headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      "Accept-Charset": "utf-8",
      'Content-Length': Buffer.byteLength(body)
      //'Content-Length': jsonBody.length
    };
    // req.xmlHttpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    //
    // 		req.xmlHttpRequest.setRequestHeader("Accept-Charset","utf-8");
    /*host: A domain name or IP address of the server to issue the request to. Defaults to 'localhost'
      port: Port of remote server. Defaults to 80
      path. Defaults to '/'. Should include query string example 'app/index'
      method: A string specifying the HTTP request method. Defaults to 'GET'
      headers: An object containing request headers
    */
    var options = {
      host: encodeURI(this.remoteHost),
      port: this.port,
      path: encodeURI(query),
      method: 'post',
      headers: headers
    };


    /*
     http.request() returns an instance of the http.ClientRequest class. The ClientRequest instance is a writable stream. If one needs to upload a file with a POST request, then write to the ClientRequest object
    */
    var req = http.request(options, function (res: any) {
      res.setEncoding('utf8');
      var responseString = '';

      res.on('data', function (data: any) {
        responseString += data;
      });

      res.on('end', function () {
        // var resultObject = JSON.parse(responseString);
        if (typeof callback === 'function') {
          callback(responseString);
        }
      });

    });
    /*
    If any error is encountered during the request (be that with DNS resolution, TCP level errors, or actual HTTP parse errors) an 'error' event is emitted on the returned request object
    */
    req.on('error', function (error: any) {
      errCallback('Error 119:' + error.message);
      console.error("Problem with request: " + error.message);
    });
    // write data to request body
    req.write(body);
    req.end();
    //Note that in the example req.end() was called. With http.request() one must always call req.end() to signify that you're done with the request - even if there is no data being written to the request body
  };

  /**
    * Socket connection:
    *   handle the "clients" array;
    *
    */
  public setupSocket(server: any) {
    let self = this;
    var sio = io.listen(server);
    // creating pipes: https://scotch.io/tutorials/a-realtime-room-chat-app-using-node-webkit-socket-io-and-mean

    sio.sockets.on('connection', function (socket: any) {
      console.log('IO A socket connected!');
      socket.on('disconnect', function () {
        console.error('IO A socket disconnected!');
      });
      socket.on('registerClient', function (regdata: any) {
        self.registerClient(socket, regdata, self.sockets);
      });
      socket.on('updateClient', function (data: any) {
        self.requestUpdateClient(socket, data, self.sockets);
      });
      // socket.on('registerclient', function(regdata) {
      //   console.log('SERVER event registerclient', regdata);
      //   // aggiungo il socket alla mia lista?
      //   setInterval(function() {
      //     somedata.counter = somedata.counter? somedata.counter+1: 1;
      //     socket.emit('updateclient', somedata);
      //   }, 5000);
      // });
      // socket.on('updateinfo', function(somedata) {
      //   console.log('SERVER event updateinfo', somedata);
      //   setInterval(function() {
      //     somedata.counter = somedata.counter? somedata.counter+1: 1;
      //     socket.emit('updateclient', somedata);
      //   }, 5000);
      // });
    });
  }

  private registerClient(socket: any, regdata: any, sockets: any) {
    // qui passerò l'id del client per registrarlo. Per ora ignoro?
    console.log('SERVER event registerClient', regdata);
    let self = this;
    /**
    regdata: {
      id: ID Client, è lo stesso per il terminale ed il customer display
      isCustomerDisplay:true/false
      message:'HOclientconnected' }
  
      quindi: se isCustomerDisplay, aggiungo il socket al pool.
    */
    if (regdata && regdata.isCustomerDisplay) {
      sockets[regdata.clientId] = socket;
    }
    // console.log('SOCKETS',sockets);
  }

  private requestUpdateClient(socket: any, data: any, sockets: any) {
    // console.log('SERVER event updateClient', data);//, 'sockets', sockets);
    let clientId = data.clientId;//11; // no, leggi da data.
    if (clientId in sockets) {
      // console.log('  >> targeted socket update');
      sockets[clientId].emit('updateClient', data);
    } else {
      console.error('  >> broadcast, failover')
      socket.broadcast.emit('updateClient', data);
    }
    // setInterval(function() {
    //     data.counter = data.counter? data.counter+1: 1;
    //     socket.emit('updateClient', data);
    //   }, 5000);
  }

  public static get Instance() {
    return WebService._instance;
  }
  public static set Instance(webService: WebService) {
    WebService._instance = webService;
  }
}

export default WebService;