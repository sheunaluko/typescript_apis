/*
  ARPA (Automated Rebalancing Portfolio Allocator)
  Mon Jul  4 13:51:24 CDT 2022
*/

import * as ts from "../../index"
import prompt from 'prompt' ;
import colors from  '@colors/colors/safe' ; 

let log = ts.common.logger.get_logger({id:"arpa_main"}) ;

prompt.message = colors.rainbow("[ARPA]");
prompt.delimiter = colors.green(" ");

var schema = {
    properties: {
	runtime_password : {
	    hidden : true  , 
            required: true ,
	    description: "Please enter the runtime password" ,
	    replace : "*", 
	},
    }
};

// Start the prompt
prompt.start();
let {runtime_password } = await prompt.get(schema) ; 
