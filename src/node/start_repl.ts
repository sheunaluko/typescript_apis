import * as repl from "repl" ; 
import * as node_index from './index';

declare var global : any ; 

Object.keys(node_index).forEach((x : any) => {
    //@ts-ignore    
    global[x] = node_index[x] ;
});

const replServer = repl.start({
  prompt: '@> ',
});

