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
exports.test_bar_data = exports.bar_chart = exports.time_series = void 0;
const api = __importStar(require("./api"));
/**
 * Creates a time series plot given x values and y values
 *
 */
function time_series(x, y) {
    let data = { x, y };
    let source_id = 'time_series';
    let plot_id = 'time_series';
    let fields = ['x', 'y'];
    let title = 'Time series';
    let tools = "pan,wheel_zoom,box_zoom,reset,save";
    let height = 300;
    let width = 300;
    let sizing_mode = "stretch_both";
    let plot_type = "line";
    api.new_plot({
        data, source_id, fields, title, tools, height, width, sizing_mode, plot_type,
        plot_id, plot_options: null, figure_options: { x_axis_type: "datetime" },
    });
}
exports.time_series = time_series;
/**
 * Creates a bar chart from specified data.
 * Data is an array of arrays, of the format shown below:
 * ```
 * var test_bar_data = [
 *   ["Fruit" , "Value" ] ,
 *   ["Apple" , 1 ] ,
 *   ["Banana" , 2] ,
 *   ["Pear" , 1 ] ,
 * ]
 * ```
 */
function bar_chart(data) {
    let source_id = 'bar_chart';
    api.bar_plot({
        data, source_id
    });
}
exports.bar_chart = bar_chart;
exports.test_bar_data = [
    ["Fruit", "Value"],
    ["Apple", 1],
    ["Banana", 2],
    ["Pear", 1],
    ["Algo", 2],
    ["Bond", 1],
    ["Test", 12],
];
