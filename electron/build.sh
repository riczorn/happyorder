if [ "a$1" = "a" ]; then
  echo Usage build.sh 1.1.0
  exit
fi

echo Debug and run: npm start
echo now building HappyOrder Linux x64 v.$1

#newversion="1.1.7"
newversion=$1
extension="HappyOrder"
happyFolder=/rixx/DeV/HappyOrder
electronFolder=$happyFolder/electron
electronBuildFolder=$electronFolder/HappyOrder-linux-x64
cd $electronFolder


echo Compressione di $extension $newversion. Rimuovo precedente versione
echo "Attenzione\! La build Android (cordova) deve esser stata già eseguita\!"

echo "build linux 64 in $electronBuildFolder"
echo "npm run package:"
npm run package
# build linux 64 in $electronFolder

echo copy to node production

tar czf $happyFolder/software/happyorder-linux-$newversion.tgz $electronBuildFolder

rsync --progress -ave ssh $happyFolder/software/happyorder-linux-$newversion.tgz root@tmg.it:/home/happyorder/public_html/files

# e ora sistemiamo il file index.html da buttare sul sito,
#<span id="version">1.0.13</span>
sed -i -e "s@<span id=\"version\">[0-9\.]\+</span>@<span id=\"version\">$newversion</span>@g" ../index.html

#<a class="apk" href="happyorder-1.0.48.apk">
sed -i -e "s@\(<a class=\"electron\" href=\"../files/happyorder-linux\)-[0-9\.]\+\.tgz\">@\1-$newversion.tgz\">@g" ../index.html

rsync -ave ssh ../index.html root@tmg.it:/home/happyorder/public_html/apk


#rsync -ave ssh /rixx/DeV/HappyOrder/HappyOrder/platforms/android/build/outputs/apk/android-release-unsigned.apk root@tmg.it:/home/happyorder/public_html/files/android-release.apk

#ionic cordova build android --prod --release -- -- --keystore="/home/ric/.ssh/happyorder.keystore" --storePassword='limeFa((e53' --alias= happyorder --password='limeFa((e53'
#rsync -ave ssh /rixx/DeV/HappyOrder/HappyOrder/platforms/android/build/outputs/apk/android-release-signed.apk root@tmg.it:/home/happyorder/public_html/files/android-release.apk
