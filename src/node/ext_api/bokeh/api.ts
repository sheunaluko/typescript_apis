/* 
   A nodejs interface to Bokeh plotting 
   Uses a websocket server to relay plotting instructions to a browser window 
*/
import { WebSocketServer } from 'ws';
import * as tsa from "../../../index"
const { common, node }  = tsa ; 
const log = common.logger.get_logger({id :"bokeh"}) ;

import express from 'express' 


var path = node.io.path ; 


var last_port = 9000 ; 


/**
 * 
 */
export function get_interface() {

    let port = last_port++ ; 
    let wss = new WebSocketServer({ port  });
    var client = null

    var obj : any = { client , ws_port : port, wss } 

    wss.on('connection', function connection(ws : any) {
	log(`Client connected`) 
	//assign the client 
	obj.client = ws   ; 
	ws.on('message', function message(data : string) {
	    // - ignore messages from the client -- this is one way communication 
	});
    });

    log(`Bokeh WSS listening on port ${port}`)


    //now start the web server
    const app = express();
    port = last_port ++ 

    app.get('/', function(req, res) {
	let fname = path.join(path.dirname(import.meta.url).replace("file:",""), '/assets/bokeh.html')
	//log(fname)
	res.sendFile(fname);
    });

    app.listen(port);
    log('Bokeh TSA Server started at http://localhost:' + port);

    obj.app = app ;
    obj.server_port = port ; 
    
    return obj 
    
} 

