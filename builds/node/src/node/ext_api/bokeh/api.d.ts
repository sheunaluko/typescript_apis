/**
 *
 */
export declare function get_interface(): any;
interface PlotParams {
    data: any;
    source_id: string;
    fields: string[];
    title: string;
    tools: string;
    height?: number;
    width?: number;
    sizing_mode: string;
    plot_type: string;
    plot_id: string;
    plot_options: any;
    figure_options: any;
}
export declare function new_plot(params: PlotParams): void;
interface AddPlotParams {
    title?: string;
    tools?: string;
    height?: number;
    width?: number;
    sizing_mode?: string;
    data: any;
    source_id: string;
    plot_type: string;
    plot_id: string;
    fields: string[];
    plot_options: any;
}
export declare function add_plot(params: AddPlotParams): void;
interface BarPlotParams {
    title?: string;
    tools?: string;
    height?: number;
    width?: number;
    sizing_mode?: string;
    data: any;
    source_id: string;
}
export declare function bar_plot(params: BarPlotParams): void;
export {};
