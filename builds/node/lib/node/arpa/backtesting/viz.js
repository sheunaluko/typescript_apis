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
Object.defineProperty(exports, "__esModule", { value: true });
exports.plot1 = exports.to_plot_ops = void 0;
const common = __importStar(require("../../../common/index"));
const node = __importStar(require("../../../node/index"));
const bapi = node.external_apis.bokeh.api;
function to_plot_ops(series, _x, _y, plot_type, plot_options) {
    let y = common.fp.map_prop(_y, series);
    let x = common.fp.map_prop(_x, series);
    let data = { x, y };
    var plot_params = {
        data,
        source_id: "general",
        fields: ["x", "y"],
        title: "VIZ",
        tools: "pan,wheel_zoom,box_zoom,reset,save",
        sizing_mode: "stretch_both",
        plot_type: plot_type,
        plot_id: "general",
        plot_options: plot_options,
        figure_options: { x_axis_type: "datetime" },
    };
    return plot_params;
}
exports.to_plot_ops = to_plot_ops;
/*
  Takes a backetest that has been run
*/
function plot1(d) {
    let ops1 = to_plot_ops(d.balance_portfolio_series, 't', 'value', 'line', { line_color: "blue" });
    let ops2 = to_plot_ops(d.hodl_portfolio_series, 't', 'value', 'line', { line_color: "red" });
    let ops3 = to_plot_ops(d.balance_portfolio_series, 't', 'p', 'line', { line_color: "black" });
    bapi.new_plot(ops1);
    bapi.add_plot(ops2);
    bapi.add_plot(ops3);
}
exports.plot1 = plot1;
