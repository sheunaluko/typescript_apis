"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_logger = void 0;
/**
 * Creates a logger object based on input options.
 * This is used to help separate and manage logs from submodules.
 * ```typescript
 * const log = get_logger({id: "util"})
 * log("brackets contain the submodule name") // => [util]:: brackets contain the submodule name
 * ```
 */
function get_logger(ops) {
    let { id } = ops;
    return function (t) {
        if (t.toString() == '[object Object]') {
            console.log(`[${id}]:: > `);
            console.log(t);
        }
        else {
            console.log(`[${id}]:: ${t}`);
        }
    };
}
exports.get_logger = get_logger;
