export declare function to_plot_ops(series: any, _x: string, _y: string, plot_type: string, plot_options: any): {
    data: {
        x: unknown[];
        y: unknown[];
    };
    source_id: string;
    fields: string[];
    title: string;
    tools: string;
    sizing_mode: string;
    plot_type: string;
    plot_id: string;
    plot_options: any;
    figure_options: {
        x_axis_type: string;
    };
};
export declare function plot1(d: any): void;
