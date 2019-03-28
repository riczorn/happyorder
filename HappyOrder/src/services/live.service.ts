/**
 *  HappyOrder app
 *  LiveService è un singleton usato da tutti i componenti, moduli, e servizi dell'app
 *
 * @package    HappyOrder
 * @author     Riccardo Zorn <code@fasterjoomla.com>
 * @copyright  2002 - 2017 Riccardo Zorn
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

import { Injectable } from '@angular/core';

import { Cart } from '../models/cart';
// import {Player} from '../models/player';

import { Observable } from 'rxjs/Observable';
import { User } from '../models/user';

import 'rxjs/add/operator/map';


@Injectable()

class Options {
    public PagesVertical: boolean;
    public GraphicalTables: boolean;
    public ShowPrice: boolean;
    public ColumnCount: number; // 2..10
    public ButtonHeight: number; // 1,2,3 rem
    public FontSize: number; // 1,2,3 rem
    public Style: string;
    public Feedback: string;
}
class ConnectionStatus {
    public connected: boolean;
    public socketConnected: boolean;
    public message: string;
    constructor() {
        this.connected = false;
        this.socketConnected = false;
        this.message = "";
    }
}
/**
 * The actual service.
 */
export class LiveService {
    // occhio: variabile aggiornata dal processo di build, build.sh nella root:
    // (lievemente meglio che usare il plugin appVersion che - detto tra noi - manco funzionava!)
    public versionNumber: string ='1.4.20';
    public teamListElement: any;
    public user: User;
    public login: any; // the login data
    public settings: any; // the settings data
    public tableStates: Array<string>;
    public config: { test: boolean, debug: boolean, baseUrl: string, wsUrl: string };
    public options: Options;
    public cart: Cart;
    public socket: any;

    public urls: any;
    private urlNames: Array<string>;
    public slideshow: Array<string>;
    public connected: boolean;
    public connectionStatus: ConnectionStatus;
    public clientId: number;
    public lastUpdate: number;
    public appType: string;
    public messageTypes: {
        tick: string,
        localError: string,
        send: string,
        remoteError: string,
        whipLeft: string,
        whipRight: string,
        success: string,
    };

    constructor() {
        // console.log('building liveService');;
        this.user = new User(this);
        this.connected = false;
        this.cart = new Cart();
        this.socket = null;
        this.connectionStatus = new ConnectionStatus();
        this.messageTypes = {
            tick: "tick",
            localError: "localError",
            send: "send",
            remoteError: "remoteError",
            whipLeft: "whipLeft",
            whipRight: "whipRight",
            success: "success"
        };

        if (process && process.versions && process.versions["electron"]) {
            this.appType = 'electron';
        } else if (window["cordova"]) {
            this.appType = 'cordova';
        } else {
            this.appType = 'browser';
        }

        // this.tableInnerStates_unused = ['n/a','Libero', 'Prenotato', 'Occupato', 'Scaduto', 'Messaggio']
        this.tableStates = ['Vuoto', 'Menu', 'Ordinato', 'Mangia', 'Pagato', 'Eliminato', 'Libero'];
        this.slideshow = new Array();
        /*
         The debug, test, baseUrl are overridden in the main app.ts config private var.
         baseUrl:'http://happyorder.it:8080/'
         */
        this.config = {
            debug: false,
            test: false,
            baseUrl: 'http://my.happyorder.it/my',
            wsUrl: 'ws://192.168.0.1',

        }
        this.options = {
            PagesVertical: false,
            GraphicalTables: true,
            ShowPrice: false,
            ColumnCount: 4,
            ButtonHeight: 2,
            FontSize: 2,
            Style: "default",
            Feedback: "vibrate",
        }

        this.urlNames = ['login',
            /*  1- 5 */ 'settings', 'tables', 'cart', 'table', 'status',
            /*  6-10 */ 'update', 'slideshow', 'get-last-orders', 'printdoc', 'get-fidelity-info',
            /*  11.. */ 'create-fidelity'
        ];
        this.urls = {
            local: [
                { id: 0, url: 'mock/login.json' },

                { id: 1, url: 'mock/settings.xml' },
                { id: 2, url: 'mock/tables.json' },
                { id: 3, url: 'mock/cart.json' },
                { id: 4, url: 'mock/table.json' },
                { id: 5, url: 'mock/status.json' },

                { id: 6, url: 'mock/update.xml' },
                { id: 7, url: 'mock/slides.json' },
                { id: 8, url: 'mock/table.json' },
                { id: 9, url: 'mock/table.json' },
                { id: 10, url: 'mock/table.json' },

                { id: 11, url: 'mock/table.json' },
            ],
            remote: [
                { id: 0, url: '/login' },

                { id: 1, url: '/settings' },
                { id: 2, url: '/tables' },
                { id: 3, url: '/cart' },
                { id: 4, url: '/table' },
                { id: 5, url: '/status' },

                { id: 6, url: '/update' },
                { id: 7, url: '/slideshow/slides.json' },
                { id: 8, url: '/get-last-orders' },
                { id: 9, url: '/printdoc' },
                { id: 10, url: '/get-fidelity-info' },

                { id: 11, url: '/create-fidelity' },
            ]
        }
        this.lastUpdate = new Date().getTime();
    }

    /**
     * Return the appropriate urls to use, based on the debug and test flags;
     * baseUrl + call;
     *
     * @param urlName
     */
    getUrl(urlName: string, params?: any) {
        let urlIndex: number = this.urlNames.indexOf(urlName);
        let url: string = '';
        if (urlIndex >= 0) {
            if (this.config.debug || this.config.test) {
                url = this.urls.local[urlIndex].url;
            } else {
                url = this.urls.remote[urlIndex].url;
                // handle the mocked urls in production list:
                if (url.indexOf('mock') < 0) {
                    url = this.config.baseUrl + url;
                }
            }
        } else {
            console.error(urlName + ' is not defined', params);
        }

        // url = url.replace(/\{leagueId}/, '' + this.teamListElement.leagueId);
        // url = url.replace(/\{teamId}/, '' + this.teamListElement.teamId);
        // url = url.replace(/\{dayNumber}/, '' + this.teamListElement.currentDay);
        // url = url.replace(/\{previousDayNumber}/, "" + (this.teamListElement.currentDay - 1));
        // url = url.replace(/\{matchId}/, this.teamListElement.matchId);

        if (params && (url.indexOf('mock') < 0)) {
            if (url.indexOf('?') > 0) {
                url += '&';
            }
            else {
                url += '?';
            }

            let encodedParams = [];

            Object.keys(params).forEach(function (key, index) {
                // console.log('params to get',key,index, params[key]);
                // key: the name of the object key
                // index: the ordinal position of the key within the object
                encodedParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));


            });
            url += encodedParams.join('&');
        }

        // console.log('getUrl ' + urlName, params, url);
        // if (this.config.proxyUrl.length > 0 && ( url.indexOf('mock') < 0 )) {
        //     // console.log('proxy:',this.config.proxyUrl , encodeURIComponent(url));
        //     return this.config.proxyUrl + encodeURIComponent(url);
        // } else {
        return url;

    }

    /**
     * for bixolon printers, directly print (if enabled in the config)
     */
    localPrint() {
        console.log('bixolon localPrint', this.cart);
    }

    /**
     * Generic error handler for observables.
     * @param error
     * @returns {ErrorObservable}
     */
    public handleError(error) {
        console.error('Error in LiveService', error);
        // let self = this;
        // return an observable: ;
        return Observable.create(observer => {
            //let errorMessage = self.buildErrorMessage('Richiesta al server fallita ', error.message, error);
            let errorContent = {};
            try {
                errorContent = error.json();
            } catch (e) {
                console.error('Error: No json available', e);
            }
            if (!errorContent) {
                try {
                    let errorContentString = error.text();
                    errorContent = JSON.parse(errorContentString);
                } catch (e) {
                    console.error('Error: No json available-exc', e);
                }
            }
            if (typeof errorContent["message"] == "undefined") {
                errorContent["message"] = 'Errore di comunicazione con il server';
            }
            if (typeof errorContent["status"] == "undefined") {

                errorContent["status"] = 'ko';
            }
            if (typeof errorContent["httpStatus"] == "undefined") {
                errorContent["httpStatus"] = error.status;
            }
            if (typeof errorContent["error"] == "undefined") {
                errorContent["error"] = error.message ? error.message : error;
            }


            //if (self.config.debug) {
            //    errorMessage.message += "\n" + JSON.stringify(error);
            //}
            observer.next(errorContent);
            observer.complete();
        }
        );
        //return Observable.throw(error.json().error || 'Server error');
    }




    /**
     * This is to assist players-list in getting the right collection:
     * @param collectionName
     * @returns {any}
     */

    // public getSettings() {
    //     console.log('liveService async getSettings');
    //     let collection;
    //     let self = this;
    //     // return an observable: ;
    //     return Observable.create(observer => {
    //             /*
    //              Why oh why do I have to do this? couldn't I just hook into the team service
    //              and see it?
    //              */
    //             let waitForServer = setInterval(function (settings) {
    //                 console.log('received SEETTINGS' );
    //                 if (self.settings) {
    //                     console.log('received SEETTINGS TRUE ' , self.settings);
    //                     observer.next(self.settings );
    //                     observer.complete();
    //                     clearInterval(waitForServer);
    //                 }
    //                 // else we keep waiting...
    //             }, 150);
    //
    //         }
    //     );
    //     //return Observable.throw(error.json().error || 'Server error');
    // }

    /**
     * Workaround to support CORS
     * docs:        http://restlet.com/blog/2015/12/15/understanding-and-using-cors/
     *              https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
     * solution:    https://github.com/angular/http/issues/65
     * (plus: use CORS plugin on browser)
     *
     * @param http
     */
    fixHttpCORS(http: any) {
        if (http._backend && http._backend._browserXHR && http._backend._browserXHR.build) {
            let _build = (<any>http)._backend._browserXHR.build;
            (<any>http)._backend._browserXHR.build = () => {
                let _xhr = _build();
                _xhr.withCredentials = false;
                return _xhr;
            };
        }
    }

    /**
     * interesting text starts at <div class="content">
     * and stops at <div class='footer'>
     * remove / hijack the links <a href="/priv/lg/e?is=1101486&ic=116149"
     *
     * @param html
     * @returns {any}
     */
    public sanitize(inputHtml) {
        // console.log('sanitize');
        if (inputHtml._body) {
            inputHtml = inputHtml._body;
        }
        //console.log(html);
        let htmlLines = inputHtml.split("\n");
        // console.log('htmlLines',htmlLines.length);
        while (htmlLines.length > 0 && !htmlLines[0].match(/<div class="content">/m)) {
            htmlLines.splice(0, 1);
        }
        let counter = 0;
        while (counter < htmlLines.length - 1 && !htmlLines[counter++].match(/<div class='footer'>/m)) {
            if (htmlLines[counter].match(/<script/m)) {
                while (counter < htmlLines.length && !htmlLines[counter].match(/<\/script/m)) {
                    htmlLines.splice(counter, 1);
                }
                if (htmlLines[counter].match(/<\/script/m)) {
                    htmlLines.splice(counter, 1);
                }
            }
        }
        htmlLines.splice(counter - 1, htmlLines.length);
        // console.log('htmlLines init text',htmlLines.length);
        let html;
        if (htmlLines.length > 2) {
            // keep the original if we didn't find anything
            html = htmlLines.join("\n");
        }
        //html = html.replace(/^[.\n\r\t\f]*<div class=["']content["']>/mi,"XXXXXXX");
        html = html.replace(/(&nbsp;|<\/?a([^>]*)>)/ig, "");
        html = html.replace(/<select/ig, "<!--");
        html = html.replace(/<\/select/ig, "-->");
        //console.log(html);

        return html;

        // let warning = '<div class="error xsuper">Attenzione: Dati estratti da una pagina HTML ancora non &egrave; disponibile una chiamata JSON</div>';
        // return warning.concat(html);
    }

    stringify(obj) {
        let seen = [];

        return JSON.stringify(obj, function (key, val) {
            if (val != null && typeof val == "object") {
                if (seen.indexOf(val) >= 0) {
                    return;
                }
                seen.push(val);
            }
            return val;
        });
    }

    public buildErrorMessage(error: string, response: string, res: any) {
        return this.buildMessage({
            status: 'ko',
            error: error,
            response: response
        }, res);
    }

    private buildMessage(result: any, res: any) {
        if (!result.httpStatus) {
            result.httpStatus = res ? res.status : 200;
        }

        return result;
    }

    /**
     * Parse a string response from a webservice.
     * In case it's a string, format it as a message;
     * Add the http request code to the structure.
     *
     * @param res
     * @returns {{status: string, message: string}}
     */
    parseResponse(res: any) {
        // console.log('parseResponse', res);
        if (res) {
            // console.log('data p',res);
            let initialResponse = res;
            // is it an object or a string?
            if (res.json) {
                // this will fire every time, as the res object does contain a json
                // method even if it's not json content.
                try {
                    let jResponse = res.json();
                    // now we know for sure the data was json and valid
                    // console.log('  Risposta JSON Normale (1b)');
                    return this.buildMessage(jResponse, res);
                } catch (e) {
                    // but it will fail miserably here!
                    console.error('parseResponse failed: ', res, e);
                }
            }

            // now we're already handling errors:
            let jsonText = '';
            if (res.text) {
                console.error('  Server returned HTML');
                jsonText = res.text();
                return this.buildErrorMessage('HTML', jsonText, initialResponse);
            }

            // now we're left with some data retrieved from the text() function
            // which could however contain JSON:

            if (typeof res !== "string") {
                // console.log('  log parseResponse 3', res);
                return this.buildErrorMessage('UNKNOWNRETURN ', '', initialResponse);

            }

            // now res is a string. Is this actually possible?

            // console.log('  log parseResponse 4', res);
            if (res.substr) {
                let initChars = res.substr(35).trim();
                //let response ;
                if (initChars.length > 0 && '{['.indexOf(initChars[0]) === 0) {
                    // console.log('  log parseResponse 5', res);

                    try {
                        res = JSON.parse(res);
                        return this.buildMessage(res, res);
                        //return JSON.parse(res);
                    } catch (e) {
                        console.error('parseResponse failed: ', res, e);
                    }
                }
            }
            // this catches all errors: either it's a string or it's a broken json:
            if (res.match) {
                if ((res.match(/\{/g) || []).length > 1) {
                    //it's a compromised json
                    //console.log('  log parseResponse 7', res);

                    return this.buildErrorMessage('BROKENJSON', res.substr(35), initialResponse);
                    //{status: 'ko', error: 'BROKENJSON', message: 'Errore dal server ' + res.substr(35)}

                } else {
                    //it's a string
                    //console.log('  log parseResponse 8', res);
                    return this.buildErrorMessage('STRINGRETURN', res, initialResponse);

                }
            } else {
                //console.log('  log parseResponse 8a', res);

                return this.buildErrorMessage('NOSTRINGRETURN', res, initialResponse);
            }
        } else {
            //console.log('  log parseResponse 9', res);
            return this.buildErrorMessage('NODATA', res, res);
        }
    }
}
