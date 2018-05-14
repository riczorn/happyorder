# Project HappyOrder Electron App

![HappyOrder][logo]

[Main Project Readme](../README.md)
id: electron.happyorder.it

# Changelog

- 1.3.0 14/03/2018

    New electron version for Linux desktops

- 1.3.1 15/03/2018

    App update fixed on node server running on Windows 

- 1.3.2  (22/03/2018)
   
    New order buttons display, based on continuous scroll, in order to address a memory bug which severely affected performance on older processors.
    
- 1.3.5 (11/04/2018)

    Opzione suono: attiva suoni di feedback ed errore. (tutte le piattaforme)
    La vibrazione (android) è ora disattivabile.
    Il suono deve essere abilitato nelle opzioni.

    Feedback visivo, vibrazione e suono sugli eventi principali.
    
- 1.3.9 (24/4/2018)

    Shuffle the slideshow using the Fisher-Yates shuffle
    
- 1.3.10 (9/5/2018)

    Added numbered prepaid fidelity support (gutschein)
    See configuration docs to enable - trigger through the
    payment button, which will also contain any other fixed-amount gutscheins.

- 1.3.11 (10/5/2018)

    Keepalive on socket, and a nice keepalive signal on the main 
    order and tables and customer cart pages
    When re-printing an old older, print the document corrensponding
    to the button pressed.


[logo]: https://github.com/riczorn/happyorder/raw/master/HappyOrder/resources/android/icon/drawable-xxxhdpi-icon.png "HappyOrder logo"
