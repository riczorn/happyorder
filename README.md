# happyorder
A node typescript server to communicate with an old xml backend; an Ionic app to use it.

This is only part of a project, you need the HappyOrder, uniKAS or compatible servers to power it.  Without it, you won't even get to the login screen.
But it's fairly well commented, and has several neat feats.

# Node 6 / typescript server:

This module connects to a HappyOrder/uniKAS server on the IP specified in the
config/id.json file.

Node.js / socket / express.io for syncronization and communication,
the main purpose of this module is currently to translate the
/pocket/web_unikas.exe xml GET api to a json implementation
for ease of consumption by the app.

# Ionic 3 app:
Starts in ./HappyOrder

Started with Ionic 3 / Angular 4, it is very basic.
Some weird choices were made to 

- speed up the app
- accomodate customer requests

The app is also published on https://happyorder.it/apk/ and the play store.

