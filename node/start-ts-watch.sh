# HappyOrder - vedi il README.txt

echo "Running gulp for transpiling typescript"
sourcedir=/rixx/DeV/HappyOrder/node
cd "$sourcedir"
sourcedir=$sourcedir/*.ts
echo -e "Watching $sourcedir for changes\n----------------------------------"
sleep 1
/usr/bin/inotifywait -r -m -e modify $sourcedir | 
  while read path _ file; do
	echo "  >> $path$file modified, invoking push <<"
	cd /rixx/DeV/HappyOrder/node
  tsc
  # exit
  done
echo "exiting now"
sleep 2

# killall gulp &> /dev/null
# gulp watch
