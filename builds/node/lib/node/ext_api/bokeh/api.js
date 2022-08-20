"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bar_plot = exports.add_plot = exports.new_plot = exports.get_interface = void 0;
/*
   A nodejs interface to Bokeh plotting
   Uses a websocket server to relay plotting instructions to a browser window
*/
const ws_1 = require("ws");
const common = __importStar(require("../../../common/index"));
const node = __importStar(require("../../../node/index"));
const log = common.logger.get_logger({ id: "bokeh" });
const express_1 = __importDefault(require("express"));
var path = node.io.path;
var last_port = 9000;
var _interface = null;
/**
 *
 */
function get_interface() {
    console.log("Need to fix that html route! app.get(/)");
    process.exit(1);
    if (_interface) {
        return _interface;
    }
    let port = last_port++;
    let wss = new ws_1.WebSocketServer({ port });
    var client = null;
    var client_resolver = null;
    var client_connected = new Promise((resolve, reject) => {
        client_resolver = resolve;
    });
    var obj = { client, ws_port: port, wss, client_connected };
    wss.on('connection', function connection(ws) {
        log(`Client connected`);
        //assign the client 
        obj.client = ws;
        //resolve the promise
        client_resolver(true);
        ws.on('message', function message(data) {
            // - ignore messages from the client -- this is one way communication 
        });
    });
    log(`Bokeh WSS listening on port ${port}`);
    //now start the web server
    const app = (0, express_1.default)();
    port = last_port++;
    app.get('/', function (req, res) {
        let fname = path.join(path.dirname("").replace("file:", ""), '/assets/bokeh.html');
        //log(fname)
        res.sendFile(fname);
    });
    app.listen(port);
    log('Bokeh TSA Server started at http://localhost:' + port);
    obj.app = app;
    obj.server_port = port;
    _interface = obj;
    return obj;
}
exports.get_interface = get_interface;
function new_plot(params) {
    let { data, source_id, fields, title, tools, height, width, sizing_mode, plot_type, plot_id, figure_options, plot_options } = params;
    //first we register the data
    let data_registration_ops = {
        'type': 'register_data',
        id: source_id,
        data: data
    };
    _interface.client.send(JSON.stringify(data_registration_ops));
    //and then we send the plot options
    let plot_ops = {
        type: "new_plot",
        fields,
        title,
        tools,
        height,
        width,
        sizing_mode,
        source_id,
        plot_type,
        plot_id,
        plot_options,
        figure_options,
    };
    _interface.client.send(JSON.stringify(plot_ops));
}
exports.new_plot = new_plot;
function add_plot(params) {
    let { data, source_id, plot_type, plot_id, fields, plot_options, } = params;
    //first we register the data
    let data_registration_ops = {
        'type': 'register_data',
        id: source_id,
        data: data
    };
    _interface.client.send(JSON.stringify(data_registration_ops));
    //and then we send the plot options
    let plot_ops = {
        type: "add_plot",
        fields,
        source_id,
        plot_type,
        plot_id,
        plot_options,
    };
    _interface.client.send(JSON.stringify(plot_ops));
}
exports.add_plot = add_plot;
function bar_plot(params) {
    //first we register the data
    let data_registration_ops = {
        'type': 'register_data',
        id: params.source_id,
        data: params.data
    };
    _interface.client.send(JSON.stringify(data_registration_ops));
    //then we prep the message
    let ops = {
        'type': 'bar_plot',
        source_id: params.source_id,
    };
    _interface.client.send(JSON.stringify(ops));
}
exports.bar_plot = bar_plot;
