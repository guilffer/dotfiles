(function() {
  var CompositeDisposable, Q, SymbolGenView, fs, path, spawn, swapFile;

  CompositeDisposable = require('atom').CompositeDisposable;

  path = require('path');

  fs = require('fs');

  Q = require('q');

  spawn = require('child_process').spawn;

  swapFile = '.tags_swap';

  module.exports = SymbolGenView = (function() {
    SymbolGenView.prototype.isActive = false;

    function SymbolGenView(serializeState) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('symbol-gen:filename', this.updateFilename));
      atom.commands.add('atom-workspace', "symbol-gen:generate", (function(_this) {
        return function() {
          return _this.generate();
        };
      })(this));
      atom.commands.add('atom-workspace', "symbol-gen:purge", (function(_this) {
        return function() {
          return _this.purge();
        };
      })(this));
      this.activate_for_projects((function(_this) {
        return function(activate) {
          if (!activate) {
            return;
          }
          _this.isActive = true;
          return _this.watch_for_changes();
        };
      })(this));
    }

    SymbolGenView.prototype.updateFilename = function(value) {
      return this.tagsFile = value;
    };

    SymbolGenView.prototype.serialize = function() {};

    SymbolGenView.prototype.destroy = function() {};

    SymbolGenView.prototype.consumeStatusBar = function(statusBar) {
      var element;
      this.statusBar = statusBar;
      element = document.createElement('div');
      element.classList.add('inline-block');
      element.textContent = 'Generating symbols';
      element.style.visibility = 'collapse';
      return this.statusBarTile = this.statusBar.addRightTile({
        item: element,
        priority: 100
      });
    };

    SymbolGenView.prototype.watch_for_changes = function() {
      atom.commands.add('atom-workspace', 'core:save', (function(_this) {
        return function() {
          return _this.check_for_on_save();
        };
      })(this));
      atom.commands.add('atom-workspace', 'core:save-as', (function(_this) {
        return function() {
          return _this.check_for_on_save();
        };
      })(this));
      return atom.commands.add('atom-workspace', 'window:save-all', (function(_this) {
        return function() {
          return _this.check_for_on_save();
        };
      })(this));
    };

    SymbolGenView.prototype.check_for_on_save = function() {
      var onDidSave;
      if (!this.isActive) {
        return;
      }
      return onDidSave = atom.workspace.getActiveTextEditor().onDidSave((function(_this) {
        return function() {
          _this.generate();
          return onDidSave.dispose();
        };
      })(this));
    };

    SymbolGenView.prototype.activate_for_projects = function(callback) {
      var projectPaths, shouldActivate;
      projectPaths = atom.project.getPaths();
      shouldActivate = projectPaths.some((function(_this) {
        return function(projectPath) {
          var tagsFilePath;
          tagsFilePath = path.resolve(projectPath, _this.tagsFile);
          try {
            fs.accessSync(tagsFilePath);
            return true;
          } catch (_error) {}
        };
      })(this));
      return callback(shouldActivate);
    };

    SymbolGenView.prototype.purge_for_project = function(projectPath) {
      var swapFilePath, tagsFilePath;
      swapFilePath = path.resolve(projectPath, swapFile);
      tagsFilePath = path.resolve(projectPath, this.tagsFile);
      fs.unlink(tagsFilePath, function() {});
      return fs.unlink(swapFilePath, function() {});
    };

    SymbolGenView.prototype.generate_for_project = function(deferred, projectPath) {
      var args, command, ctags, defaultCtagsFile, swapFilePath, tagsFilePath;
      swapFilePath = path.resolve(projectPath, swapFile);
      tagsFilePath = path.resolve(projectPath, this.tagsFile);
      command = path.resolve(__dirname, '..', 'vendor', "ctags-" + process.platform);
      defaultCtagsFile = require.resolve('./.ctags');
      args = ["--options=" + defaultCtagsFile, '-R', "-f" + swapFilePath];
      ctags = spawn(command, args, {
        cwd: projectPath
      });
      ctags.stderr.on('data', function(data) {
        return console.error('symbol-gen:', 'ctag:stderr ' + data);
      });
      return ctags.on('close', (function(_this) {
        return function(data) {
          return fs.rename(swapFilePath, tagsFilePath, function(err) {
            if (err) {
              console.warn('symbol-gen:', 'Error swapping file: ', err);
            }
            return deferred.resolve();
          });
        };
      })(this));
    };

    SymbolGenView.prototype.purge = function() {
      var projectPaths;
      projectPaths = atom.project.getPaths();
      projectPaths.forEach((function(_this) {
        return function(path) {
          return _this.purge_for_project(path);
        };
      })(this));
      return this.isActive = false;
    };

    SymbolGenView.prototype.generate = function() {
      var isGenerating, projectPaths, promises, showStatus;
      if (!this.isActive) {
        this.isActive = true;
        this.watch_for_changes();
      }
      isGenerating = true;
      showStatus = (function(_this) {
        return function() {
          var _ref;
          if (!isGenerating) {
            return;
          }
          return (_ref = _this.statusBarTile) != null ? _ref.getItem().style.visibility = 'visible' : void 0;
        };
      })(this);
      setTimeout(showStatus, 300);
      promises = [];
      projectPaths = atom.project.getPaths();
      projectPaths.forEach((function(_this) {
        return function(path) {
          var p;
          p = Q.defer();
          _this.generate_for_project(p, path);
          return promises.push(p);
        };
      })(this));
      return Q.all(promises).then((function(_this) {
        return function() {
          var _ref;
          if ((_ref = _this.statusBarTile) != null) {
            _ref.getItem().style.visibility = 'collapse';
          }
          return isGenerating = false;
        };
      })(this));
    };

    return SymbolGenView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdFQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLENBQUEsR0FBSSxPQUFBLENBQVEsR0FBUixDQUhKLENBQUE7O0FBQUEsRUFJQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQyxLQUpqQyxDQUFBOztBQUFBLEVBTUEsUUFBQSxHQUFXLFlBTlgsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSiw0QkFBQSxRQUFBLEdBQVUsS0FBVixDQUFBOztBQUVhLElBQUEsdUJBQUMsY0FBRCxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBQWpCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IscUJBQXBCLEVBQTJDLElBQUMsQ0FBQSxjQUE1QyxDQUFuQixDQURBLENBQUE7QUFBQSxNQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MscUJBQXBDLEVBQTJELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLFFBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0QsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVB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
//# sourceURL=/Users/guilffer/Code/symbol-gen/lib/symbol-gen-view.coffee