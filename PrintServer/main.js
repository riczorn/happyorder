"use strict";
/**
 * HappyOrder Print Server
 */
const net = require('net');
const http = require('http')
const encoding = require("encoding");

startServer();

function startServer() {
  const server = http.createServer(function (request, response) {
    console.dir(request.param)

    if (request.method == 'POST') {
      console.log('POST')
      var body = ''
      request.on('data', function (data) {
        body += data
        console.log('Partial body: ' + body)
      })
      request.on('end', function () {
        console.log('Body: ' + body)
        response.writeHead(200, { 'Content-Type': 'text/html' });
        var jsonObject = JSON.parse(body);
        printData(jsonObject.printData);
        response.end('{"status":"ok","command":"print"}')
      })
    } else {
      console.log('GET')
      var html = `
              <html>
                  <body>
                      HappyOrder PrintServer
                  </body>
              </html>`
      response.writeHead(200, { 'Content-Type': 'text/html' })
      response.end(html)
    }
  })

  const port = 8080
  const host = '0.0.0.0'
  server.listen(port, host)
  // console.log(`Listening at http://${host}:${port}`)
  console.log(`HappyOrder PrintServer Listening at http://${host}:${port}`);


}

function printData(data) {
  let cdata = encoding.convert(data, 'cp1252', 'UTF-8');
  var client = new net.Socket();
  client.connect(9100, '192.168.10.61', function () {
    console.log('Connected');
    client.write(cdata, 'cp1252', (finished) => {
      console.log('done:' + finished)
      client.destroy(); // kill client after server's response
    });

  });

  client.on('data', function (data) {
    console.log('Received: ' + data);
    client.destroy(); // kill client after server's response
  });

  client.on('close', function () {
    console.log('Connection closed');
  });
}



