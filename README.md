# HappyOrder

![HappyOrder][logo]

A node typescript server to communicate with an old win32-based xml backend; an Ionic app + electron app to use it.

This is only part of a project, you need the HappyOrder, uniKAS or compatible servers to power it.  Without it, you won't even get to the login screen.
But it's fairly well commented, and has several neat feats.

# Node 6 / TypeScript server:

This module connects to a HappyOrder/uniKAS server on the IP specified in the config/id.json file.

Node.js / socket / express.io for syncronization and communication,
the main purpose of this module is currently to translate the
/pocket/web_unikas.exe xml GET api to a json implementation
for ease of consumption by the app, and marshaling data + serving the app updates.

[Node server Readme](node/README.md)

# Ionic 3 app (Android):

Starts in ./HappyOrder

Started with Ionic 3 / Angular 4, it is very basic.
Some weird choices were made to 

- speed up the app
- accomodate customer requests

The app is also published on https://happyorder.it/apk/ and the play store.

Libs: Ionic 3, Angular 4, Typescript 2

[HappyOrder Ionic 3 Readme](HappyOrder/README.md)

# Electron app:

Starts in ./electron
Build in ./electron/HappyOrder-linux-x64

The app is also published as a .tar.gz on https://happyorder.it/files/happyorder-linux-1.3.1.tar.gz

[Electron Readme](electron/README.md)


[logo]: https://github.com/riczorn/happyorder/raw/master/HappyOrder/resources/android/icon/drawable-xxxhdpi-icon.png "HappyOrder logo"
