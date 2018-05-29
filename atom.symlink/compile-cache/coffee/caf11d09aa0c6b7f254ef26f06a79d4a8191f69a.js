(function() {
  var Q, SymbolGenView, fs, path, spawn, swapFile;

  path = require('path');

  fs = require('fs');

  Q = require('q');

  spawn = require('child_process').spawn;

  swapFile = '.tags_swap';

  module.exports = SymbolGenView = (function() {
    SymbolGenView.prototype.isActive = false;

    function SymbolGenView(serializeState) {
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
          tagsFilePath = path.resolve(projectPath, 'tags');
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
      tagsFilePath = path.resolve(projectPath, 'tags');
      fs.unlink(tagsFilePath, function() {});
      return fs.unlink(swapFilePath, function() {});
    };

    SymbolGenView.prototype.generate_for_project = function(deferred, projectPath) {
      var args, command, ctags, defaultCtagsFile, swapFilePath, tagsFilePath;
      swapFilePath = path.resolve(projectPath, swapFile);
      tagsFilePath = path.resolve(projectPath, 'tags');
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
          return promises.push(p.promise);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJDQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLEdBQVIsQ0FGSixDQUFBOztBQUFBLEVBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUMsS0FIakMsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsR0FBVyxZQUxYLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosNEJBQUEsUUFBQSxHQUFVLEtBQVYsQ0FBQTs7QUFFYSxJQUFBLHVCQUFDLGNBQUQsR0FBQTtBQUNYLE1BQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxxQkFBcEMsRUFBMkQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsUUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzRCxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0Msa0JBQXBDLEVBQXdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEQsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsUUFBRCxHQUFBO0FBQ3JCLFVBQUEsSUFB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
//# sourceURL=/Users/guilffer/Code/symbol-gen/lib/symbol-gen-view.coffee