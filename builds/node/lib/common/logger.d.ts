export interface LoggerOps {
    id: string;
}
/**
 * Creates a logger object based on input options.
 * This is used to help separate and manage logs from submodules.
 * ```typescript
 * const log = get_logger({id: "util"})
 * log("brackets contain the submodule name") // => [util]:: brackets contain the submodule name
 * ```
 */
export declare function get_logger(ops: LoggerOps): (t: any) => void;