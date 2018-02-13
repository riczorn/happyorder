if [ "a$1" = "a" ]; then
  echo Usage compress.sh 1.1.0
  exit
fi

echo Debug and run: \$cordova run android
echo Debug just run: \$adb -d install -r platforms/android/build/outputs/apk/android-debug.apk

#newversion="1.1.7"
newversion=$1
extension="HappyOrder"
cd /rixx/DeV/HappyOrder/HappyOrder


echo Compressione di $extension $newversion. Rimuovo precedente versione

# aggiorna versione in config.xml
# <widget id="it.happyorder.app" version="1.0.11" xmlns
echo ""
#echo sed -i -e 's@^(<widget .*version)="[^"]*" @$1="$newversion"@' config.xml
echo "Aggiorno la versione..."
#sed -i -e 's@^\(<widget .*version\)="[^"]*" @$1="$newversion"@' config.xml
sed -i -e "s@^\(<widget .*version\)=\"[^\"]*\" @\1=\"$newversion\" @" config.xml
# versionNumber : string = '0.0.1';
sed -i -e "s@^\(\s*public\s*versionNumber *: *string *\)= *'[^\']*'@\1='$newversion'@" src/services/live.service.ts
echo "<version>$newversion</version> Aggiornata."

#<version>10027</version>
undottedversion=`echo $newversion | sed -e 's/\.\([0-9]\)\./.0\1./g'| sed -e 's/\.\([0-9]\)$/.0\1/g' | sed -e 's/\.//g'`
echo "Undotted: $undottedversion"
sed -i -e "s@<version>[0-9\.]\+</version>@<version>$undottedversion</version>@" ../node/www/update.xml


#exit

ionic cordova build android --prod --release

echo copy to node production
mkdir /rixx/DeV/HappyOrder/node/dist/apk &> /dev/null
cp /rixx/DeV/HappyOrder/HappyOrder/platforms/android/build/outputs/apk/android-release.apk /rixx/DeV/HappyOrder/node/dist/apk
cp /rixx/DeV/HappyOrder/HappyOrder/platforms/android/build/outputs/apk/android-release.apk /rixx/DeV/HappyOrder/resources/backup/android-release-$newversion.apk
rsync -ave ssh /rixx/DeV/HappyOrder/HappyOrder/platforms/android/build/outputs/apk/android-release.apk root@tmg.it:/home/happyorder/public_html/apk/happyorder-$newversion.apk

# e ora sistemiamo il file index.html da buttare sul sito,
#<span id="version">1.0.13</span>
sed -i -e "s@<span id=\"version\">[0-9\.]\+</span>@<span id=\"version\">$newversion</span>@g" ../index.html

#<a class="apk" href="happyorder-1.0.48.apk">
sed -i -e "s@\(<a class=\"apk\" href=\"happyorder\)-[0-9\.]\+\.apk\">@\1-$newversion.apk\">@g" ../index.html

rsync -ave ssh ../index.html root@tmg.it:/home/happyorder/public_html/apk


#rsync -ave ssh /rixx/DeV/HappyOrder/HappyOrder/platforms/android/build/outputs/apk/android-release-unsigned.apk root@tmg.it:/home/happyorder/public_html/files/android-release.apk

#ionic cordova build android --prod --release -- -- --keystore="/home/ric/.ssh/happyorder.keystore" --storePassword='limeFa((e53' --alias= happyorder --password='limeFa((e53'
#rsync -ave ssh /rixx/DeV/HappyOrder/HappyOrder/platforms/android/build/outputs/apk/android-release-signed.apk root@tmg.it:/home/happyorder/public_html/files/android-release.apk
