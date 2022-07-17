import * as tsa from "../../../index"
tsa.register_module(import.meta.url, 'plots') ; 

let log = console.log


// test function
export function test1(i : any ) {
    let x = [ 1, 2, 3, 4, 10] 
    let y = [ 1, 2, 7, 4, 10]

    let data = { x , y } ;

    var source_id = 'random' ; 

    let plot_ops  =  {
	'type' : 'new_plot' , 
	fields  :  ['x' , 'y' ]  ,
	title : 'Example of random D A T A', 
	tools : "pan,wheel_zoom,box_zoom,reset,save", 
	height : 300, 
	width : 300, 
	sizing_mode  : "stretch_both" ,
	source_id  ,
	plot_type  :  "line"  ,
	plot_id    :  "meh" ,
	options : {
	} 
    } 

    let data_registration_ops = {
	'type' : 'register_data'  ,
	id : source_id , 
	data : data 
    }

    log("sending register")
    i.client.send(JSON.stringify(data_registration_ops))

    log("sending new plot")
    i.client.send(JSON.stringify(plot_ops)) 

} 

export function test2(i : any ) {
    let x = [ 1, 2, 3, 4, 5 ] ;
    let y = [ 1, 2, 3, 4, 5 ] ;
    let colors  = [ "red" , "blue", "green" , "red" , "black" ] 
    let radii = [0.1, 0.2, 0.3, 0.4, 0.5 ] ; 

    let data = { x , y, colors } ;

    var source_id = 'random' ; 

    let plot_ops  =  {
	'type' : 'new_plot' , 
	fields  :  ['x' , 'y' ]  ,
	title : 'Example of random CIRCLE data', 
	tools : "pan,wheel_zoom,box_zoom,reset,save", 
	height : 300, 
	width : 300, 
	sizing_mode  : "stretch_both" ,
	source_id  ,
	plot_type  :  "circle"  ,
	plot_id    :  "meh" ,
	options : {
	    radius: radii , 
	    fill_color: {field : "colors" } , 
	    fill_alpha: 0.4,
	    line_color: null
	} , 
    } 

    let data_registration_ops = {
	'type' : 'register_data'  ,
	id : source_id , 
	data : data 
    }

    log("sending register")
    i.client.send(JSON.stringify(data_registration_ops))

    log("sending new plot")
    i.client.send(JSON.stringify(plot_ops)) 

} 
 
