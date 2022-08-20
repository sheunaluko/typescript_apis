# Typescript APIs
A documented and clean collection of typescript code for composability and re-use :)

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

### About 
This repository includes libraries for cryptogrophy, functional programming, graphing, financial/cryptocurrency analysis, and much more!

The libaries will eventually be uploaded to npm. For now, to use the packages do the following:

#### Web library
For import into react project or other website.
First clone this repository and then run `./bin/bundle_web`.
Then, in your project directory simply run: 
`npm install /path/to/typescript_apis/builds/web`

#### Node library
For import by node process.
First clone this repository and then run `./bin/bundle_node`.
Then, in your project directory simply run: 
`npm install /path/to/typescript_apis/builds/node`

> :warning: **Make sure you are using the most up to date versions of node and typescript** or else you may get errors with packaging the libraries or running the repl! 
