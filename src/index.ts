
console.log("loading index") 
import * as node from "./node"
import * as common from "./common" 

export {
    node,
    common, 
}

/*
  Top level utility for registering modules, 
  Which allows for in-repl module reloading 
*/
export function register_module(fpath: string, id : string) {
    return common.module_manager.register(fpath,id)
} 

/*
  Top level utility for reloading modules after source code modiciation (without restarting the repl) 
*/
export async function load_module(id : string) {
    return await common.module_manager.reload(id)
} 
