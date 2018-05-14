/**
  * HappyOrder node backend for app consumption
  * @package    HappyOrder
  * @author     Riccardo Zorn <code@fasterjoomla.com>
  * @copyright  2002 - 2017 Riccardo Zorn
  * @license    GNU General Public License version 2 or later; see LICENSE.txt
  */

import * as express from 'express';
//var express = require ('express');
var bodyParser     =        require("body-parser");
var cors = require('cors'); //https://www.npmjs.com/package/cors
// import hOConfigModule = require('../lib/config');
// import WebServiceModule from '../lib/webservice';
//console.log('app importing ws');
import WebService from '../lib/webservice';
//console.log('/app importing ws');
let webservice =  <WebService> WebService.Instance;
//console.log('app instance ok');
var fs = require('fs'),
path = require('path')
// Creates and configures an ExpressJS web server.
class App {
  // ref to Express instance
  public express: express.Application;
  // public config: any;//hOConfigModule.Config;

  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express();

    // global parser objects:
    this.express.use(bodyParser.urlencoded({ extended: true }));
    this.express.use(bodyParser.raw());

    let corsOptions = {
        "origin": "*",
        "methods": "GET,POST",//HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "credentials": true,
        "optionsSuccessStatus": 204
      }

    this.express.use(cors(corsOptions));
    // this.express.use(bodyParser.json());

    // this.config should point to Config (main.ts)
    // this.port = this.config.port;
    // this.middleware(this.express);
    this.express.options('*', cors());

    this.routes();

  }
  /**
      come far convivere socket.io e express?
      https://stackoverflow.com/questions/17696801/express-js-app-listen-vs-server-listen

    * Configure Express middleware.
    */
  private middleware(server:any): void {
    // // this.webservice.login('pino','mino');
    // console.log('setting up sockets');
    // // this.webservice.io = this.app.io;
    // // let hOConfigModule = require('../lib/config');
    // // the ajax bridge:
    // let httpServer  = require("http").createServer(server);
    // var sio = io.listen(httpServer);
    // sio.sockets.on('connection', function (socket:any) {
    //     console.log('A socket connected!');
    //     socket.on('disconnect', function () {
    //         console.log('A socket with sessionID ' //+ hs.sessionID
    //             + ' disconnected!');
    //
    //     });
    // });
  }



  // Configure API endpoints.
  private routes(): void {

    let router = express.Router();
    let self = this;
    //https://stackoverflow.com/questions/11569181/serve-static-files-on-a-dynamic-route-using-express


    router.get('/', (req:any, res:any, next:any) => {
      res.json({
        message: "HappyOrder backend server - browse to /help for info"
      });
    });

    router.get('/slideshow/:filename', function (req, res) {
      var filename = req.params.filename;
      res.sendFile(path.join(__dirname , '../../www/slideshow/'+filename));
      // res.end('Password: ' + filename);
    });
    // app.use( express.static('/www/slideshow'));
    // app.use(express.static(path.join(__dirname, 'public')));

    // router.get('/hello/:name', function(req, res) {
    //     res.send('hello ' + req.params.name + '!');
    // });

    router.get('/login', (request: any, response: any, next: any) => {
      // response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
      this.error(response, 'illegal login request 595');
      // response.end();
    });

// var urlencodedParser = bodyParser.urlencoded({ extended: true });

    router.post('/login',
    // urlencodedParser,
      (request: any, response: any, next: any) => {
      if (webservice && (request.method == 'POST')) {
        console.log('router login', JSON.stringify(request.body));
        // response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
        webservice.login(response,
          request.body
        );
        // response.end();


      }
      else {
        this.error(response, 'login not initialized');
        // response.end();
      }
    });
    router.post('/cart',
    // urlencodedParser,
      (request: any, response: any, next: any) => {
      if (webservice && (request.method == 'POST')) {
        // console.log('router cart post', request );
        // response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
        webservice.sendCart(response, request.body);
        // response.end();


      }
      else {
        this.error(response, 'cart not initialized');
        // response.end();
      }
    });
    router.get('/settings', (req:any, res:any, next:any) => {
      //console.log('enter settings');
      if (webservice) {
        webservice.loadSettings(res);
      }
      else {
        self.error(res, 'settings not initialized');
      }
    });
    router.get('/table', (req:any, res:any, next:any) => {
      //console.log('enter table', req.query);
      if (webservice) {
        webservice.openTable(res, req.query.tableId, req.query.clerkId);
      }
      else {
        this.error(res, 'table not initialized');
      }
    });
    router.get('/tables', (req:any, res:any, next:any) => {
      //console.log('enter tables');
      if (webservice) {
        webservice.getTablesStates(res, req.query.clerkId);
      }
      else {
        this.error(res, 'tables not initialized');
      }
    });
    router.get('/status', (req:any, res:any, next:any) => {
      //console.log('enter status');
      if (webservice) {
        webservice.status(res);
      }
      else {
        this.error(res, 'status not initialized');
      }
    });

    router.get('/customer-display', (req:any, res:any, next:any) => {
      if (webservice) {
        webservice.broadCast(res, req);
      }
      else {
        this.error(res, 'customer-display not initialized');
      }


    });
    router.get('/update', (req:any, res:any, next:any) => {
      //console.log('enter update', req.query);
      if (webservice) {
        webservice.update(res);
      }
      else {
        this.error(res, 'update not initialized');
      }
    });
    router.get('/help', (req:any, res:any, next:any) => {

      fs.readFile('www/index.html',
          (err:any, data:any) => {
              if (err) {
                  // res.writeHead(500);
                  self.error(res,'Error loading index.html');
                  // return res.end('Error loading index.html');
              }
              else {
                res.writeHead(200);
                res.end(data);
              }
          });

    });
    router.get('/update.xml', (req:any, res:any, next:any) => {
      let filePath = 'www/update.xml';
      fs.exists(filePath, function(exists:any){
         if(exists){ // results true
          fs.readFile(filePath, 'utf-8',
              (err:any, data:any) => {
                  if (err) {
                      // res.writeHead(500);
                      self.error(res,'Error loading '+filePath);
                      // return res.end('Error loading index.html');
                  }
                  else {
                    // rimpiazziamo i token indirizzo ip del server:
                    //console.log('----ex----',data,'---------');
                    let sdata:string = <string>data;
                    //console.log('----SDATA----',sdata,'---------');

                    //sdata = sdata.replace('http://localhost:8080/update',
                    //    'http://192.168.11.31:8080/update');
                    console.log('@TODO: unfinished needs real IP')
                    res.writeHead(200);
                    res.end(sdata);
                  }
              });
            }
          });
    });
    router.get('/get-last-orders', (req:any, res:any, next:any) => {
        //console.log('enter get-last-orders', req.query);
        if (webservice) {
          webservice.getLastOrders(res, req.query);
        }
        else {
          this.error(res, 'get-last-orders not initialized');
        }
    });
    router.get('/get-fidelity-info', (req:any, res:any, next:any) => {
      //console.log('enter get-fidelity-info', req.query);
      if (webservice) {
        webservice.getFidelityInfo(res, req.query);
      }
      else {
        this.error(res, 'get-fidelity-info not initialized');
      }
    });
    router.get('/create-fidelity', (req:any, res:any, next:any) => {
      //console.log('enter create-fidelity', req.query);
      if (webservice) {
        webservice.createFidelity(res, req.query);
      }
      else {
        this.error(res, 'create-fidelity not initialized');
      }
    });
    router.get('/printdoc', (req:any, res:any, next:any) => {
      //console.log('enter printdoc', req.query);
      if (webservice) {
        webservice.printDoc(res, req.query);
      }
      else {
        this.error(res, 'printdoc not initialized');
      }
  });

    this.express.use('/', router);
  }

  private error(res:any, errorMessage: string): void {
    //res.writeHead(500);
    res.json({
      id:500,
      status:'ko',
      error:'server Error - ' + errorMessage
    });

    res.end();
  }

}
export default new App().express;
