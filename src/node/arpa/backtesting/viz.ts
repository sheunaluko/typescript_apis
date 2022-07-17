import * as tsa from "../../../index" ; 
const {common, node}  = tsa  ; 
tsa.register_module(import.meta.url, "viz") ;

const bapi = node.external_apis.bokeh.api ; 


export function to_plot_ops(series : any , _x : string, _y : string , plot_type : string, plot_options : any ) {
    
    let y = common.fp.map_prop(_y, series)
    let x = common.fp.map_prop(_x, series)    

    let data = {x, y } ; 

    var plot_params = { 
	data , 
	source_id : "general" , 
	fields : ["x" , "y" ] , 
	title : "VIZ" , 
	tools : "pan,wheel_zoom,box_zoom,reset,save", 
	sizing_mode : "stretch_both" , 
	plot_type : plot_type, 
	plot_id : "general" , 
	plot_options : plot_options  , 
	figure_options : {x_axis_type : "datetime" } , 
    }

    return plot_params 
}

export function plot1(d : any ) {
    let ops1 = to_plot_ops(d.balance_portfolio_series, 't', 'value' , 'line' , {line_color : "blue"})
    let ops2 = to_plot_ops(d.hodl_portfolio_series, 't', 'value' , 'line' , {line_color : "red"})
    let ops3 = to_plot_ops(d.balance_portfolio_series, 't', 'p' , 'line' , {line_color : "black"})
    
    bapi.new_plot(ops1) ;
    bapi.add_plot(ops2) ;
    bapi.add_plot(ops3) ;      
    
} 




