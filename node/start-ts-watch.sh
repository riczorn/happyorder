# HappyOrder - vedi il README.txt

echo "Running tsc for transpiling typescript"
sourcedir=/rixx/DeV/HappyOrder/node/
cd "$sourcedir"
# sourcedir=$sourcedir/*.ts
echo -e "Watching $sourcedir for changes\n----------------------------------"
sleep 1
/usr/bin/inotifywait -r -m --exclude '.js' -e modify "$sourcedir" | 
  while read path _ file; do
	echo "  >> $path$file modified, invoking tsc <<"
	cd "$sourcedir"
  /usr/local/bin/tsc
  echo "       done";
  # exit
  done 
echo "exiting now"
sleep 2

# killall gulp &> /dev/null
# gulp watch
