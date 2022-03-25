import * as repl from "repl" ; 
import * as node from './index';
import * as common from '../common/index';
declare var global : any ; 

global.node = node ;
global.common = common;
global.R  = common.R; 

const replServer = repl.start({
  prompt: '@> ',
});


