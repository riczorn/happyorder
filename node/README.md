# HappyOrder node backend for angular app (desk and mobile)

![HappyOrder][logo]

[Main Project Readme](../README.md)
copyright (c) 2002-2018 fasterweb.net

# Architecture overview:

This module connects to a HappyOrder/uniKAS server on the IP specified in the
config/config.json file.

Node.js / socket / express.io for syncronization and communication,
the main purpose of this module is currently to translate the
/pocket/web_unikas.exe xml GET api to a json implementation
for ease of consumption by the app.

# Folder layout

- <root>    node project, all node, gulp, ts configuration files
- ./dist    the transpiled javascript.
- ./lib     this node project
- ./www     dummy content which will be served via web => eventually will be overwritten by the compiled app
- ../HappyOrder     source of the app code (ionic 3/angular 4)
- ./start ./forever startup scripts.

#### Libs: Node 6+, Typescript 2

#### Readings:
Setup and initial configuration
https://blog.pusher.com/use-typescript-with-node/

# Changelog

Please refer to the KONPHOS app https://github.com/riczorn/happyorder/raw/master/HappyOrder/README.md

[logo]: https://github.com/riczorn/happyorder/raw/master/HappyOrder/resources/android/icon/drawable-xxxhdpi-icon.png "HappyOrder logo"
