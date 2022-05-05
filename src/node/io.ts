import  fs from 'fs' ;
import path from 'path' ; 


/**
 * Save string to disk 
 * 
 */
export function write_file(fname : string,s : string) { fs.writeFileSync(fname,s) ; } 


/**
 * Read a text file from disk
 * 
 */
export function read_file(fname : string)  : string { return fs.readFileSync(fname , 'utf8') }

/**
 * Read a text file from disk (same as read_file) 
 * 
 */
export function read_text(fname : string)  : string { return fs.readFileSync(fname , 'utf8') }

/**
 * Read a json file from disk and return the json object
 * 
 */
export function read_json(fname : string)  { return JSON.parse(read_file(fname)) } 


/**
 * Reads a directory and returns file names
 * 
 */
export function read_dir(fname : string)  {  return fs.readdirSync(fname) } 

/**
 * Appends file extension to fname if not already there. 
 * 
 */
export function ensure_extension(fname : string, ext : string)  {
    if (fname.match(new RegExp(`.{ext}$`))){
	return fname 
    } else {
	return `${fname}.${ext}`
    } 
} 

/**
 * Makes sure a directory exists and if not creates it. 
 * 
 */
export function ensure_dir(dir : string)  { if (!fs.existsSync(dir)){ fs.mkdirSync(dir, { recursive: true });  } } 

/**
 * Write a json file to disk 
 * 
 */
export function write_json(fname : string, o : any)  {
    return write_file(ensure_extension(fname,"json"), JSON.stringify(o))
} 


export type WriteFileOps = {
    path : string,
    data : string,
    append : boolean , 
} 
/**
 * Write a text file to disk 
 */
export function write_text(ops : WriteFileOps)  {
    let { path, data, append } = ops ; 
    return (append ? fs.appendFileSync(path, data) : write_file(path, data) ) ; 
} 



/**
 * Check if a file exists 
 * 
 */
export function exists(fname : string) { return fs.existsSync(fname) } 

/**
 * Get all (non-hidden) files in the directory as full subpaths 
 * 
 */
export function read_nonhidden_subfiles(dname : string) {
    return fs.readdirSync(dname).filter(
	(y:string)=> (y[0] != ".")
    ).map(
	(y:string) => path.join(dname,y)
    )
} 


export {fs, path}  ; 
