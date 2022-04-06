const express = require('express');
const exec = require('child_process').execSync;
const fs = require('fs');

const wkhtmltopdf='/usr/bin/wkhtmltopdf';
const filesFolder='/home/ud/node.js/api_js/files';

const app = express();
const PORT=6000;
const HOST='192.168.0.108';

/* Definimos el API de la aplicación Web */
app.get('/', function (req, res) {
	var out='';
	out+='<h2>Servicio para convertir web en imágenes</h2>';

	out+='<ul>';
	out+='<li>/html2png?url=&lt;URL> Descargar URL.</li>';
	out+='<li>/image Listado de imagenes.</li>';
	out+='<li>/image/&lt;id> Descargar imágen.</li>';
	out+='</ul>';

    	res.send( out );
	});

app.get('/html2png', function (req, res) {
    var pdfId=uuidv4();
    var pdfFile=filesFolder+"/"+pdfId+".pdf";

    if ( req.query.url==undefined ) {
	res.send( { 'status': 'error', 'description': 'Falta el parámetro URL.' } );
	res.end();

	return;		
	}

    var result=exec(wkhtmltopdf+" "+req.query.url+" "+pdfFile );
    if ( result.indexOf("Done") ) {
	result=exec("convert "+pdfFile+" -resize 400 "+pdfFile);
    	result=exec("convert "+pdfFile+" -crop 400x400+0+0 "+pdfFile);

    	res.send( { 'status': 'created', 'id': pdfId } );
    	res.end();
	return;
	}

    res.send( { 'status': 'error', 'description': 'Error al crear la imagen' } );
    });

app.get('/image', function (req, res) {
    var r=[];
    var files = fs.readdirSync( filesFolder );

    for ( var i=0; i<files.length; i++ )
	r.push( files[i].substring( 0, files[i].indexOf('.')) );

    res.send( r );
    });

app.get('/image/:id', function (req, res) {

    if ( req.params.id==undefined ) {
	res.send( { 'status': 'error', 'description': 'Falta el parámetro Id.' } );
	res.end();

	return;		
	}

    if (fs.existsSync(filesFolder+"/"+req.params.id+".pdf") ) {
    	res.download( filesFolder+"/"+req.params.id+".pdf" );
	return;
	}

    res.send( { error: "File not found"} );
    });

/* Ponemos la aplicación a funcionar por el puerto 3000 */
app.listen(PORT, function () {
    console.log('Sistema armado en el puerto ',PORT);
    });

/* Función que genera un UUID */
function uuidv4() {
   var uuid = "", i, random;
   for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;

    if (i == 8 || i == 12 || i == 16 || i == 20) uuid += "-";

    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }

   return uuid;
   }
