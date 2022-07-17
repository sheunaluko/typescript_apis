

var log = console.log ; 
export var registry : any  = {} ; 

var hash_num = 1 ; 

export function register( fpath : string , name : string) {
    registry[name] = fpath ; 
}


export async function reload( name : string) {
    let import_path = `${registry[name]}#${hash_num++}`
    let new_mod = await import(import_path)
    return new_mod 
} 


