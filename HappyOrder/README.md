# Project HappyOrder Cordova App

![HappyOrder][logo]

[Main Project Readme](../README.md)
id: app.happyorder.it

# Changelog

- 1.0.12 (17/8/2017)

   First on play store

- 1.0.13
  
   App version plugin added to the Settings page.

- 1.0.14  (20/8/2014)

    sdoppia articolo su extra e qt>1
    tasto +, -, x
    tavoli: 5 colonne
    storno (richiede ho 198.12 per lo storno - update node)

- 1.0.15 (21/8/2017)

  Sistemati bottoni e qualche allineamento

- 1.0.16 (22/8/2017)

  LAN and Playstore support

- 1.0.18

  Settings - client display: larger button;
  Settings - Update config - force relogin after 1 sec.
  Settings - Login timeout for client config

- 1.0.21

  Sockets: now with items and totals
    improved transport, added security and permissions to protocol.

- 1.0.25

  Several update options added: local, remote apk, google play store.
  Now you have no excuse not to update.
  Which entails, amongst the rest, that you have to make sure the current
  version of node released is compatible with the app.

- 1.0.27

  inAppBrowser + node/dist/apk keeping versions well tied together.

- 1.0.28

    ionic-native AppUpdate.
    (failed)

- 1.0.29

    Stili responsive, added vertical and cols-5
    Toast
    Vibration

- 1.0.30 

    toast vibration platform removed. wouldn't go past login.


- 1.0.34 

   after restoring backup of node_modules and updating cli to 3.9

- 1.0.35 

   styles + fixed bug scrollIntoView() on cart.item.

- 1.0.36 

   componente bottone dedicato per ordini

- 1.0.37 

   Nuove opzioni per visualizzazione: colonne, font size, button height,
      layout  verticale/orizzontale.

- 1.0.38 

   Corretto layout orizzontale.

- 1.0.39 

   New Flex buttons per il cart
        conferma, confermaelimina, scontrino, ricevuta,fattura,prova,sospeso
        proforma,ricevutani,fatturaalt,contononsta,asporto
      e sistemati un po' i layout orizzontali

- 1.0.40 

   Test debug

- 1.0.41 

   Socket.io base funzionante (con debug e senza enableProdMode,
        ma anche in release)

- 1.0.42 

   Push Pools per customer display
       Slideshow

- 1.0.43 

   debugging ion-item-sliding

- 1.0.44 

   plugin vibration + platform working
        (nota: se la vibrazione non va, forse il volume è a zero)

- 1.0.45 

   section toolbar alignment fixed
       debug log cleanup

- 1.0.46 

   stili interfaccia ripuliti e forzate altezze.

- 1.0.47 

   toast e vibrazione su Conferma ordine, Stampa documento, Storno.
       inoltre pattern di vibrazione per errore (tre vibrazioni invece di una)

- 1.0.48 

   popupMenu (popover menu) su articoli, togli gli ion-item-sliding.

- 1.0.49 

   AppUpdate

- 1.0.50 

   no AppUpdate

- 1.0.51 

   fix bug in toast, necessario mutex (toastCtrl se ne mostro uno quando un
        altro è visibile, il primo resta a vita)

- 1.0.52 

   back slides component animato
       scrolltoitem => selezionando un articolo il carrello viene riposizionato
          per farlo vedere

- 1.0.53 

   Su operazioni privilegiate (storno per ora) un cameriere senza privilegio
      vedrà una popup con l'elenco dei camerieri (dotati di password) che hanno quel privilegio. Potrà così andare a farsi autorizzare storni ecc.

      Il meccanismo è basato sulla variabile del privilegio quindi può essere
      applicato ad altre operazioni privilegiate come stampa conti.

- 1.0.54 

   Un altro componente e iniziate a sistemare icone e bottoni

- 1.0.55 

   Tavoli grafici ed altre sistemazioni stili

- 1.0.56 

   Node release

- 1.0.57 

   Node release
       Il tavolo asporto viene ora aperto con l'eventuale contenuto.
       Gli extra sono nuovamente visualizzati dopo la conferma.
       Attenzione: Richiede l'aggiornamento di Node 1.0.57.

- 1.0.58 + Node release

         Ristampa scontrino:   Premendo il tasto scontrino, si ristampa
           lo scontrino oppure il bewirtungsbelegt dell'ultimo ordine,
           ma solo se l'ultimo ordine
           era stato chiuso con "Conferma elimina"

         Per screen tablet e desktop in landscape, ridotta la larghezza del carrello;
         Dopo aver confermato un carrello, reset alla prima pagina dei bottoni.

- 1.0.59

    Modificato lo slideshow della postazione Cliente (carrello senza funzioni):
      visto che lo slideshow previene o quantomeno rende difficile scrollare
      il menù, in caso di manutenzione, ora è sufficiente
      cliccare 10 volte sullo slideshow per andare ai tavoli.

- 1.1.1

    Pagamento con Gutschein / Buoni a prezzo fisso.

- 1.1.3

    Nuova opzione per mostrare i prezzi sulla schermata di ordine

- 1.1.4
    Forever batch updated for Windows drive auto-detection.
    CORS support added to add support for Chrome developer tools.

- 1.1.5
    Slightly modified style for readability

- 1.2.1
    Move table 
    Spostatavolo

- 1.2.3
    Choose your style

- 1.2.4
    Swipe on the order buttons left and right to change page;
    Swipe left on the cart items to descrease/increase qt; no drop below zero.
    items at zero will still show in case of an error, but after Confirm
    they will be gone.


- 1.3.0 

   14/03/2018
    New electron version for Linux desktops


- 1.3.1 

   15/03/2018
    App update fixed on node server running on Windows 

[logo]: https://github.com/riczorn/happyorder/raw/master/HappyOrder/resources/android/icon/drawable-xxxhdpi-icon.png "HappyOrder logo"
