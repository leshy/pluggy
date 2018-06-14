// Generated by CoffeeScript 1.9.3
(function() {
  var _, async, backbone, fs, h, helpers, lego, path;

  path = require('path');

  backbone = require('backbone4000');

  _ = require('underscore');

  helpers = h = require('helpers');

  fs = require('fs');

  async = require('async');

  lego = exports.lego = backbone.Model.extend4000({
    initialize: function(options) {
      this.env = options.env;
      return this.legos = options.legos;
    }
  });

  exports.loadLegos = function(options, callback) {
    var autoInit, env, files, legos, rootCandidates, rootDir;
    if (options == null) {
      options = {};
    }
    rootCandidates = [path.join(path.dirname(require.main.filename), 'node_modules'), path.join(process.cwd(), 'node_modules')];
    rootDir = _.find(rootCandidates, fs.existsSync);
    options = _.extend({
      dir: rootDir,
      legoClass: backbone.Model,
      prefix: 'lego_',
      env: {}
    }, options);
    env = options.env;
    if (options.verbose) {
      console.log('reading dir', options.dir);
    }
    files = fs.readdirSync(options.dir);
    legos = {};
    _.each(files, function(fileName) {
      var filePath, name, newLego, ref, requireData, stats;
      if (options.prefix && fileName.indexOf(options.prefix) !== 0) {
        return;
      }
      filePath = path.join(options.dir, fileName);
      stats = fs.lstatSync(filePath);
      if (stats.isDirectory() || stats.isSymbolicLink()) {
        name = fileName.substr(options.prefix.length);
        if (options.verbose) {
          console.log('loading module', fileName);
        }
        requireData = require(filePath);
        if (requireData.lego) {
          requireData = requireData.lego;
        }
        newLego = requireData.extend4000({
          name: name,
          env: env,
          legos: legos
        });
        newLego.prototype.settings = _.extend({}, newLego.prototype.settings || {}, ((ref = env.settings.module) != null ? ref[name] : void 0) || {});
        return env[name] = legos[name] = new newLego({
          env: env
        });
      }
    });
    h.dictMap(legos, function(lego, name) {
      h.map(h.array(lego.after), function(targetName) {
        if (legos[targetName]) {
          return lego.requires = h.push(h.array(lego.requires), targetName);
        }
      });
      return h.map(h.array(lego.before), function(targetName) {
        var targetLego;
        if (targetLego = legos[targetName]) {
          return targetLego.requires = h.push(h.array(targetLego.requires), name);
        }
      });
    });
    autoInit = h.dictMap(legos, function(lego, name) {
      return h.push(h.array(lego.requires), function(results, callback) {
        if (!callback) {
          callback = results;
        }
        return lego.init(function(err, data) {
          if (options.verbose) {
            console.log('module ready', name);
          }
          return callback(err, data);
        });
      });
    });
    return async.auto(autoInit, function(err, data) {
      return callback(err, legos);
    });
  };

}).call(this);
