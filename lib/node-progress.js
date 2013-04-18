// Filename: node-progress.js
// Timestamp: 2013.04.17-18:35:02 (last modified)  
// Author(s): TJ Holowaychuk <tj@vision-media.ca>, Bumblehead (www.bumblehead.com)
//

// this file is forked from its original source and is heavily modified.

/*!
 * node-progress
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var readline = require('readline');

var ProgressBar = module.exports = (function () {

    var progressBar = {
      rl : null, // readline
      fmt : null,
      curr : 0,
      total : 0,
      width : 0,
      chars : null,
      complete : false,

      doComplete : function () {
        var that = this, rl = that.rl;
        that.complete = true;
        console.log('');
        rl.resume();
        rl.close();
      },

      getProgressUpdateStr : function (tokens) {
        var that = this, 
            curr = that.curr, total = that.total,
            width = that.width, chars = that.chars,

            percent = curr / total * 100,
            complete = Math.round(width * (curr / total)),
            incomplete,
            elapsed = new Date - this.start,
            eta = elapsed * (total / curr - 1),
            str;

        complete = Array(complete).join(chars.complete);
        incomplete = Array(width - complete.length).join(chars.incomplete);

        str = that.fmt
          .replace(':bar', complete + incomplete)
          .replace(':current', curr)
          .replace(':total', total)
          .replace(':elapsed', (elapsed / 1000).toFixed(1))
          .replace(':eta', (eta / 1000).toFixed(1))
          .replace(':percent', percent.toFixed(0) + '%');

        if (tokens) {
          for (var key in tokens) {
            str = str.replace(':' + key, tokens[key]);
          }
        }
        
        return str;
      },

      /*
      getCountUpdateStr : function (filename, count) {
        var that = this;
        return that.fmt + '(' + count + '/' + that.length + ') ' + filename;
      },

      count : function (filename, count) {
        var that = this, rl = that.rl, progressStr;

        progressStr = this.getCountUpdateStr(filename, count);

        rl.clearLine();
        rl.write(progressStr);        

        if (count >= that.length) {
          that.doComplete();
        }
      },
       */
       
      tick : function(len, tokens){
        var that = this, rl = that.rl, progressStr;
      
        len = (typeof len === 'number') ? len : 1;
        if (0 == that.curr) that.start = new Date;

        // progress complete
        that.curr += len;

        progressStr = that.getProgressUpdateStr(tokens);
        rl.clearLine();
        rl.write(progressStr);

        if (that.curr >= that.total) {
          that.doComplete();
        }
      }
    };

    return {
      getStream : function (options) {
        if (typeof options === 'object' && 
            options &&
            options.stream) {
          return options.stream;
        } else {
          return process.stdout;
        }
      },
    
      getNewReadline : function (options) {
        var rl, stream = this.getStream(options);

        rl = readline.createInterface({
          input: process.stdin,
          output: stream
        });

        rl.setPrompt('', 0);
        rl.clearLine = function () {
          this.write(null, {
            ctrl: true, name: 'u'
          });
        };

        return rl;
      },
      /*
      getNewCount : function (fmt, options) {
        var that = Object.create(progressBar);

        if (typeof fmt !== 'string') throw new Error('format required');
        if (typeof options.length !== 'number') throw new Error('length required');

        that.rl = this.getNewReadline(options);
        that.fmt = fmt;
        that.total = 0;
        that.width = options.width || 80;
        that.length = options.length;
        that.complete = false;

        return that;      
      },
       */

      getNew : function (fmt, options) {
        var that = Object.create(progressBar);

        if (typeof fmt !== 'string') throw new Error('format required');
        if (typeof options !== 'object' || !options) throw new Error('options required');
        if (typeof options.total !== 'number') throw new Error('total required');

        that.rl = this.getNewReadline(options);
        that.fmt = fmt;
        that.curr = 0;
        that.total = options.total;
        that.width = options.width || that.total;
        that.complete = false;
        that.chars = {
          complete: options.complete || '=',
          incomplete: options.incomplete || '-'
        };
        
        return that;
      }
    };

}());
