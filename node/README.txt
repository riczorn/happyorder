HappyOrder node backend for angular app (desk and mobile)
copyright (c) 2002-2017 code@fasterjoomla.com


Architecture overview:

This module connects to a HappyOrder/uniKAS server on the IP specified in the
config/config.json file.

Node.js / socket / express.io for syncronization and communication,
the main purpose of this module is currently to translate the
/pocket/web_unikas.exe xml GET api to a json implementation
for ease of consumption by the app.

Folder layout

<root>    node project, all node, gulp, ts configuration files
./dist    the transpiled javascript.
./lib     this node project
./www     dummy content which will be served via web => eventually will be overwritten by the compiled app
../HappyOrder     source of the app code (ionic 3/angular 4)
./start ./forever startup scripts.

Readings:
Setup and initial configuration
https://blog.pusher.com/use-typescript-with-node/

1.0.56 Node release: server.listen to wildcard.
       Linux defaults server.listen(port) to server.listen(port,'0.0.0.0')
       Windows defaults to server.listen(port,'127.0.0.1') I guess.

       The default mask can be set in the configuration id.json file.
1.0.57
  fixed bug ordini aperti senza extra.
  Distribuito con HappyOrder 1.9.8.14
1.0.58
  Ristampa scontrino:   Premendo il tasto scontrino, si ristampa
    lo scontrino oppure il bewirtungsbelegt dell'ultimo ordine,
    ma solo se l'ultimo ordine
    era stato chiuso con "Conferma elimina"
1.1.1
  Pagamento con Gutschein / buoni a importo fisso
  
1.1.4
    Forever batch updated for Windows drive auto-detection.

1.2.1
    Updated all packages (a full distro is required to update);
    
1.3.0
    New electron version for Linux desktops