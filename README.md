# Typescript APIs
A documented and clean collection of typescript code for composability and re-use :)


## About 
This repository includes libraries for cryptogrophy, functional programming, graphing, financial/cryptocurrency analysis, and much more!

### Usage

#### Web library
For import into react project or other website.
In your project directory simply run: 
`npm install tidyscripts_web`

#### Node library
For import by node process.
In your project directory simply run: 
`npm install tidyscripts_node`


### Local building

> :warning: **Make sure you are using the most up to date versions of node and typescript** or else you may get errors with packaging the libraries or running the repl! 

If you want, you can build the web and node packages locally by running `./bin/bundle_web` or `./bin/bundle_node` after cloning the repository and running `npm install`. After that, the packages will be available for local install by going to your project directory and running `npm install /path/to/typescript_apis/builds/web` for the web library and `npm install /path/to/typescript_apis/builds/node` for the node library.

This is how I build the packages myself prior to distributing them on npm as tidyscripts_web and tidyscripts_node. 

### Start node repl
``` ./bin/nrepl ```

### Generate docs
``` ./bin/generate_docs ```

### Build node npm module 
``` ./bin/bundle_node ```

### Build web npm module
``` ./bin/bundle_web ```

### Sync git repository
``` ./bin/sync COMMIT_MSG ``` 

## Contact
Twitter - @shayaluko\
Instagram - @sheunaluko\
Linked In - /sheun-aluko\