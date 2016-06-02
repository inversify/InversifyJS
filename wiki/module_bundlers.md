# Working with module bundlers

## Browserify

### Reflect-Metadata
The source from the reflect-metadata module contains a require('crypto') statement,
which will pull additional node-builtin dependencies into your final bundle.
This is about 0.6MB, way too much for a **browser build**.

To workaround this issue add an init task in your gulp or grunt file to modify the library directly. Then browserify-shim the modified library. 
Below is an example for using gulp, you can execute multiple tasks within one tasks by using event-stream.
    
    gulp.task("init", function(done){
      var tasks = [];
    
      tasks.push(
        gulp.src(["node_modules/reflect-metadata/Reflect.js"])
          .pipe(replace(/var nodeCrypto = isNode && require\("crypto"\);/g, "var nodeCrypto = false;"))
          .pipe(gulp.dest("src/ts/libs"))
      );
    
      return es.merge(tasks).on("end", done);
    });
    
Then in your package.json file, add a browserify-shim to the modified library:
      
    dependencies:{
      "browserify-shim": "latest"
    }
    "browser": {
      "reflect-metadata": "./src/ts/libs/Reflect.js"
    },
    "browserify": {
      "transform" : ["browserify-shim" ]
    }

Make the init task a dependency to run before your main task.
You can then **require("reflect-metadata")** or **import "reflect-metadata"** in your inversify.config.ts/js file as usual.

## Webpack
TODO (acceptiong PRs)
