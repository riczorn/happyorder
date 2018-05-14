/**
 *  HappyOrder app
 *  Login Service gestisce il login e l'avvio, incluso salvare i dati di login e server
 *  nel local storage.
 *
 * @package    HappyOrder
 * @author     Riccardo Zorn <code@fasterjoomla.com>
 * @copyright  2002 - 2017 Riccardo Zorn
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

import {Injectable} from '@angular/core';
// import {Storage, LocalStorage} from 'ionic-angular';
import { Storage } from '@ionic/storage';
// import {Http, Headers} from '@angular/http';
import { Http,  Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
// import { AppUpdate } from '@ionic-native/app-update';

import {LiveService} from  '../services/live.service';
import { resolve } from 'dns';
//import { TavoliPage } from '../pages/tavoli/tavoli';

@Injectable()

export class LoginService {
    private response:any;
    private disconnectTimeout: number;

    constructor(private http: Http,
                private liveService:LiveService,
                public storage: Storage
                // private appUpdate:AppUpdate
              ) {
                  // console.log('building liveService');;
        this.response = null;
        this.liveService.fixHttpCORS(this.http);

    }

    /**
     * send login, and set liveService variables accordingly.
     * Note: this function subscribes to the http request !
     *
     * @param email
     * @param password
     * @returns {Observable<R>}
     */
    login(successCallback?:Function) {
      // console.log('login - service');;
        let login:string = this.liveService.user.login;
        let password:string = this.liveService.user.password;
        let appVersion: string = this.liveService.versionNumber;
        let extraDisplayName:string = this.liveService.user.extraDisplayName || '';

        var body = 'login=' + login + '&password=' + password + '&display='+extraDisplayName+'&androidVersion='+appVersion;
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        // headers.append('keys', '');

        try {

            return this.http.post(this.liveService.getUrl('login'),
                body,
                {
                    headers: headers
                }) // 'mock/login.json')
                //.map(res => res.json())
                .map(res => this.liveService.parseResponse(res))
                // .catch(this.liveService.handleError)
                .subscribe(res => {
                    // console.log('login response from server: ', res);
                    this.response = res;
                    this.updateLiveServiceWithLoginData();
                    // console.log('2');
                    if (this.liveService.user.loggedIn) {
                        // console.log("successCallback", typeof successCallback);
                        if (successCallback !== null && (typeof successCallback === 'function')) {
                            successCallback(res);
                        }

                        return true;
                    }
                    return false; // not logged in!
                    //return this.response.status == 'ok';
                });

        } catch (e) {
            this.response = {status: 'ko', message: 'Richiesta al server fallita ' + JSON.stringify(e.message?e.message:e)};
            console.error('Error spawning login request', e);
        }
    }

    logout() {
        this.liveService.user.autoLogin = false;
        this.saveStorageSettings();

        try {
            this.liveService.user.loggedIn = false;
            return this.http.get(this.liveService.getUrl('logout'))
                // .map(res => res.json())
                .map(res => this.liveService.parseResponse(res))
                // .catch(this.liveService.handleError)
                .subscribe(res => {
                    // console.log('logout response from server: ', res);
                    this.response = res;
                    if (this.response.error=='HTML' && this.response.status==200) {
                        this.updateLiveServiceWithLoginData();
                        return true; // this.response.status == 'ok';
                    } else {
                        return false;
                    }
                });

        } catch (e) {
            this.response = {status: 'ko', message: 'Richiesta al server fallita ' + JSON.stringify(e)};
            console.error('Error spawning logout request', e);
        }
    }

    /**
     * After the login response is received, we store the identification data
     * in liveService so it will be available application-wide.
     *
     * @returns {boolean}
     */
    updateLiveServiceWithLoginData() {
        if ((this.response.command == 'login') && (this.response.status=='ok')) {
            // this.liveService.user.clerkId = this.response.idCliente;
            this.liveService.login = this.response;
            // this.liveService.user.runaId = this.response.idRuna;
            this.liveService.user.name = this.response.name;

            this.liveService.clientId = this.response.client.id;
            if (this.response.client.display) {
              this.liveService.user.extraDisplay = ! this.response.client.display.main;
              if (this.liveService.user.extraDisplay) {
                this.liveService.user.extraDisplayName = this.response.client.display.display;

              } else {
                this.liveService.user.extraDisplayName = '';
              }
            }
            this.connectSocket();
            this.findUpdate();
            this.liveService.user.clerkId = this.response.clerk.id;
            this.liveService.cart.clerkId = this.liveService.user.clerkId;

            // this.liveService.user.id = this.response.nome;
            // this.liveService.user.login = this.response.login;
            // this.liveService.user.lastName = this.response.cognome;
            this.liveService.user.loggedIn = true;
            this.liveService.user.status = this.response.status;
            this.liveService.user.errorMessage = '';
            this.liveService.user.autoLogin = true;
            this.saveStorageSettings();
            return true;
        } else {
            this.liveService.user.status = this.response.status;
            this.liveService.user.errorMessage = this.response.message;
            this.liveService.user.clerkId = -1;
            this.liveService.user.autoLogin = false;
            // this.saveStorageSettings();
            return false;
        }
    }

    /*
      https://socket.io/docs/#
      https://www.sitepoint.com/community/t/is-it-possible-to-make-work-socket-io-using-php-on-server-side/245667/6

    */
    connectSocket() {
      let self = this;
      // console.log('Connecting Socket' , self.liveService.config.wsUrl);
      // console.log(window["io"]);
      let serverUrl = self.liveService.config.wsUrl;//'ws://'+

      let socket = window["io"](serverUrl, {secure:false, 
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax : 5000,
        reconnectionAttempts: Infinity,
          port:8080 });
        // optional: port:8080

        // self.liveService.getUrl('status'));//.connect();
        socket.on('connect', function(){
          // console.log('SOCKET CONNECT event');
          self.liveService.connectionStatus.socketConnected = true;
          if (self.disconnectTimeout) {
            clearTimeout(self.disconnectTimeout);
            self.disconnectTimeout = null;
          }
        });
        socket.on('disconnect', reason => { 
          self.liveService.connectionStatus.socketConnected = false;
          self.liveService.connectionStatus.message = reason;
          //if(reason === 'io server disconnect') {
            //you should renew token or do another important things before reconnecting
          //  socket.connect();
          //}

          self.disconnectTimeout = window.setInterval(() => {
            if (self.liveService.connectionStatus.socketConnected) {
              clearInterval(self.disconnectTimeout);
              self.disconnectTimeout = null;
              return;
            }
            socket.connect();
          }, 5000);

            /*console.log('SOCKET disconnect event');
            self.disconnectTimeout = window.setTimeout( function() {
              if (self.disconnectTimeout) {
                clearTimeout(self.disconnectTimeout);
                self.disconnectTimeout = null;
              }
              socket = null;
              self.connectSocket();
            }, 5000 );*/
        });

      self.liveService.socket = socket;

      if (self.liveService.user.extraDisplay) {
        // this is a customer display
        socket.on('updateClient', function(data) {
          // console.log('received a message from the server: ',data);
          self.liveService.cart.totals.totale = data.total;
          self.liveService.cart.totals.count = data.count;
          self.liveService.cart.items = data.items;
          self.liveService.lastUpdate = new Date().getTime();
        });
      } else {
        // this is a desktop app, here we just need to send data
        self.liveService.cart.onUpdate = function(data) {
          data.clientId = self.liveService.clientId;
          socket.emit('updateClient',data);
        }
      }


      this.liveService.socket.emit('registerClient', {
        clientId:this.liveService.clientId,
        isCustomerDisplay:this.liveService.user.extraDisplayName.length>0,
        message:'HOclientconnected'});
      // this.liveService.socket.emit('updateinfo', {some:'info'});
    }

    /**
     * Retrieve settings from local storage - on the client's browser
     */
    loadStorageSettings() {
        // let local:Storage = new Storage();
        this.storage.get('options').then(optionsString => {
            // console.log('retrieved options from localStorage ',optionsString);
            if (optionsString && (optionsString.length > 0)) {
                let options = JSON.parse(optionsString);
                for (let key in options) {
                  this.liveService.options[key] = options[key];
                }
                this.normalizeOptions();
                // this.liveService.options = options;
            }
        }).catch(error => {
            console.error('localStorage options error', error);
        });

        return this.storage.get('user').then(userString => {
            // console.log('retrieved user from localStorage ',JSON.stringify(userString));
            if (userString.length > 0) {
                let user = JSON.parse(userString);
                this.liveService.user.login = user.login;
                this.liveService.user.password = user.password;
                this.liveService.user.serverUrl = user.serverUrl;

                this.liveService.user.extraDisplay = user.extraDisplay?true:false;
                this.liveService.user.extraDisplayName = user.extraDisplayName?user.extraDisplayName:'';

                this.liveService.config.baseUrl = 'http://' + user.serverUrl;
                this.liveService.config.wsUrl   = 'ws://' + user.serverUrl;
                this.liveService.user.autoLogin = user.autoLogin;

            }

        }).catch(error => {
            console.error('localStorage user error', error);
        });

    }

    saveStorageSettings() {
      this.liveService.user = this.liveService.user || <any>{};
      this.liveService.user.email = this.liveService.user.email?
            this.liveService.user.email.toLowerCase() : '';
      this.liveService.user.login = this.liveService.user.login?
            this.liveService.user.login.toLowerCase() : '';
      this.liveService.user.serverUrl = this.liveService.user.serverUrl?
            this.liveService.user.serverUrl:'';

      this.liveService.config.baseUrl = 'http://' + this.liveService.user.serverUrl;
      this.liveService.config.wsUrl = 'ws://' + this.liveService.user.serverUrl;
      this.storage.set('user', this.liveService.stringify(this.liveService.user));
      this.normalizeOptions();
      this.storage.set('options', this.liveService.stringify(this.liveService.options));
      //console.log('options saved: ',this.liveService.options);
      
    }

    normalizeOptions() {
      let opts = this.liveService.options;
      if (opts.ButtonHeight >3 ) opts.ButtonHeight = 3;
      if (opts.FontSize > 3) opts.FontSize = 3;
      if (opts.ColumnCount > 10) opts.ColumnCount = 10;
      if (opts.ButtonHeight <1 ) opts.ButtonHeight = 1;
      if (opts.FontSize < 1) opts.FontSize = 1;
      if (opts.ColumnCount < 2) opts.ColumnCount = 2;
    }

    status(successCallback?:Function) {
      // console.log('status - service');;
      var self = this;
        // headers.append('keys', '');
        self.liveService.connected = false;
        self.liveService.connectionStatus.connected = false;
        try {
            return self.http.get(self.liveService.getUrl('status'))
                .map(res => self.liveService.parseResponse(res))
                .subscribe(
                  res => {
                    // console.log('status response from server: ', res);
                    if (res)
                    {
                      if (res.status=='ok') {
                        self.liveService.connected = true;
                        self.liveService.connectionStatus.connected =true;
                      }
                    }
                     // not logged in!
                    //return this.response.status == 'ok';
                    if (typeof successCallback == "function") {
                      // console.log('status self',self,'this',this);
                      successCallback(self.liveService.connected, res);
                    }
                  },
                  err=>{
                    console.error('FAIL status response from server: ', err);
                    // errore principale se il server node non è raggiungibile:
                    successCallback(self.liveService.connected, {status:'ko',error:'Server node non disponibile / CORS'});
                      //+"\n"+JSON.stringify(err)});
                  },
                  ()=>{
                    // console.log('FINISH status response from server 2')
                  }
                );

        } catch (e) {
            // self.error('Richiesta status al server fallita ' + JSON.stringify(e));
            console.error('Richiesta status al server fallita - Error spawning status request', e);
            if (typeof successCallback == "function") {
              successCallback(self.liveService.connected, {status:'ko',error:'Server non disponibile'});
            }
        }

    }

    downloadSettings(successCallback?:Function) {
      // console.log('settings - service');;
      let self = this;
      if (self.liveService.settings) {
          console.log('settings already downloaded');
          return Observable.create(observer => {
                  observer.next(self.liveService.settings );
                  observer.complete();
              }
          );
      }
      else
        try {
            return self.http.get(self.liveService.getUrl('settings'))
                .map(res => self.liveService.parseResponse(res))
                .subscribe(
                  res => {
                    // console.log('settings response from server: ', res);
                    if (res)
                    {
                      // console.log('storing res');
                      self.liveService.settings = res;
                      self.normalizeSettings(self.liveService.settings);
                    }
                     if (typeof successCallback == "function") {
                      successCallback(res);
                    }
                  },
                  err=>{
                    console.error('FAIL settings response from server: ', err);
                    // errore principale se il server node non è raggiungibile:
                    successCallback({status:'ko',error:'Server node non disponibile / CORS 2'});
                  }
                );
        } catch (e) {
            // self.error('Richiesta status al server fallita ' + JSON.stringify(e));
            console.error('Richiesta status al server fallita - Error spawning status request', e);
            if (typeof successCallback == "function") {
              successCallback(self.liveService.connected, {status:'ko',error:'Server non disponibile'});
            }
        }
    }

    /**
      * Query the node server for an updated app version.
      * https://ionicframework.com/docs/native/app-update/
      does not work without extra .jar
      */
    findUpdate() {
      // const updateUrl = this.liveService.config.baseUrl+'update.xml';
      // console.log('updating from ', updateUrl);
      // this.appUpdate.checkAppUpdate(updateUrl);
    }
    private shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;
    
      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
    
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
    
      return array;
    }
    // init and download the list of files for the slideshow
    public initSlideShow() {
      let self = this;
      try {
          return self.http.get(self.liveService.getUrl('slideshow'))
              .map(res => self.liveService.parseResponse(res))
              .subscribe(
                res => {
                  // console.log('settings response from server: ', res);
                  if (res && (res.length))
                  {
                    //console.log('storing res ', res);
                    
                    self.liveService.slideshow=self.shuffle(res);
                  }

                },
                err=>{
                  console.error('FAIL slideshow response from server: ', err);
                  // errore principale se il server node non è raggiungibile:

                }
              );

      } catch (e) {
          // self.error('Richiesta status al server fallita ' + JSON.stringify(e));
          console.error('Richiesta status al server fallita - Error spawning status request', e);

      }
    }

    private extendArray (arr:any ) {
      if (arr) {
          arr.byId = function(id:number) {
            if (id>=0) {
                for (let item of this) {
                  if (item.id==id) return item;
                }
                // for (let i=0; i<this.length; i++) {
                //   if (this[i].id==id) return this[i];
                // }
            }
            return false;
        };
      }
      return arr;
    }

    normalizeSettings(result) {
      let self = this;
      result.settings.printLocations = self.extendArray(result.settings.printLocations);
      result.settings.priceLists = self.extendArray(result.settings.priceLists);
      result.settings.documents = self.extendArray(result.settings.documents);
      result.settings.payments = self.extendArray(result.settings.payments);
      result.settings.fidelity = self.extendArray(result.settings.ukInput);
      result.settings.tableStates = self.extendArray(result.settings.tableStates);
      result.settings.valute = self.extendArray(result.settings.valute);
      self.prepareTables(result);

      result.tables.floor = self.extendArray(result.tables.floor);

      result.clerks = self.extendArray(result.clerks);
      for (let c of result.clerks) {
        c.privileges = self.extendArray(c.privileges.t);
        c.hasPrivilege = function(privilege: string) {
          // console.log('clerk hasPrivilege', privilege)
          for (let p of this.privileges) {
            if ((p.id==privilege) &&   p.val) {
              return true;
            }
          }
          return false;
        }
      }

      result.clerks.byPrivilege = function(privilege: string) {
        let results = [];
        for (let clerk of result.clerks) {
          if (clerk.serial && clerk.hasPrivilege(privilege)) {
            results.push(clerk);
          }
        }
        return results;
      };

      result.items.sections = self.extendArray(result.items.sections);

      for (let s of result.items.sections) {
        s.section = self.extendArray(s.section);
        if (s.item) {
          s.item = self.extendArray(s.item);
        }
        for (let s2 of s.section) {
          s2.item = self.extendArray(s2.item);
        }
      }


      result.items.byId = function(id:number) {
        // cerca un articolo in tutte le sezioni
        // console.log('items by id',id);//, this);
        for (let topSection of this.sections) {
          if (topSection.item) {
            for (let item of topSection.item) {
              if (item.id==id) {
                return item;
              }
            }
          }

          for (let section of topSection.section) {
            if (section.item) {
              for (let item of section.item) {
                if (item.id==id) {
                  return item;
                }
              }
            }
          }
        }
        console.error('NOT FOUND article ',id);
        return false;
      }; // end byId


      result.items.sections.byId = function(id:number) {
        // cerca una sezione specifica in tutte le sezioni e sottosezioni
        // console.log('sections by id',id);//, this);
        for (let topSection of this) {
          if (topSection.id && topSection.items &&  (topSection.id == id)) {
            return topSection;
          } else {
              for (let section of topSection.section) {
                if (section.id == id) {
                  return section;
                }
              }
          }

        }
        console.error('NOT FOUND section ',id);
        return false;
      } // end sections.byId



      // occhio: buildPageButtons fa affidamento su items.byId e items.
      result.pages = self.buildPageButtons(result.buttons.client.page, result.settings.payments);

    }

    prepareTables(result:any) {
      let self = this;
      result.tables.table = self.extendArray(result.tables.table);
      let tableSizes = {
        left:1000,top:1000,right:0,bottom:0,width:1000,height:1000
      }
      for (let table of result.tables.table) {
        table.state = 0;
        table.style = {};
        if (table.left<tableSizes.left) {
          tableSizes.left = table.left;
        }
        if (table.top<tableSizes.top) {
          tableSizes.top = table.top;
        }
        if (table.left+table.width>tableSizes.right) {
          tableSizes.right = table.left+table.width;
        }
        if (table.top+table.height>tableSizes.bottom) {
          tableSizes.bottom = table.top+table.height;
        }
      }
      tableSizes.width = tableSizes.right - tableSizes.left;
      tableSizes.height = tableSizes.bottom - tableSizes.top;
      // console.log('tableSizes', tableSizes);
      result.tables.tableSizes = tableSizes;
      // now a new iter to adapt the tables to the screen? or at least

    }

    /**
      * page contiene buttons; questo deve:
      * - creare un nuovo array dove verranno espansi i buttons;
      * - aggiungere il nuovo array a pageButtons
      * - impostare un riferimento dentro page al nuovo indice di array.
      */
    buildPageButtons(pages:any, payments:any) {
      // console.log('buildPageButtons', pages);
      // console.log (this.liveService.settings);
      let result = new Array();
      let currentSection = 0;
      for (let page of pages) {
        let pageButtons: Array<any> = new Array();

        for (let button of page.button) {
          // console.log('buildPageButtons ',button);
          let name = button.name;
          let link = button.link;
          let code = parseInt(link.substring(1));
          switch(link.charAt(0)) {

            case 'S':
              // console.log('SEZIONE');
                currentSection = (currentSection) % 3 + 1 ;
                  button.cssClass = 'bsection';
                  pageButtons.push( button ); //link + ' ' + name );
                  this.addSectionArticles(pageButtons, code, currentSection);
                  break;
            case 'A':
              // console.log('Articolo');
                  let article = this.liveService.settings.items.byId(code);
                  if (article) {
                    if (article.itemType == 1) {
                      article.cssClass = 'barticle';
                    } else {
                      article.cssClass = 'bextra';
                    }
                    pageButtons.push( article ); //link + ' ' + name );
                  }
                  break;
            case 'F':
            // console.log('Funzioni');
                // let cssClass = link.charAt(0)=='F'?'bfunction':'bpayment';
                pageButtons.push({
                  name:name,
                  cssClass:'bfunction',
                  action:code,
                  link:link
                });
                break;
            case 'Z':
              // console.log('Funzioni');
                  let payment =  payments.byId(code);
                  if (payment) {
                    payment.cssClass = 'bpayment';
                    pageButtons.push(payment);
                  }
                  // pageButtons.push({
                  //   name:name,
                  //   cssClass:cssClass,
                  //   action:code,
                  //   link:link
                  // });
                  break;
          }

        }
        page.page = pageButtons;
        result.push(pageButtons);

      }
      return result;
    }

    /**
      * add all the articles in the given section to the pageButtons Array
      */
    addSectionArticles(pageButtons: Array<any>, code:number, currentSection:number) {
      //for (let sections of this.liveService.settings.items.sections) {
      let section = this.liveService.settings.items.sections.byId(code);
      if (section) {
        // console.log('section:',section);
        for (let item of section.item) {
          item.cssClass = 'barticle';
          if (item.itemType>1) {
            item.cssClass = 'bextra';
          }
          item.cssClass += ' section-'+currentSection;
          pageButtons.push(item);
        }
    }
  }  //addSectionArticles end


} // class end
