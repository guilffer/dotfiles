(function() {
  var CompositeDisposable, EX, FS, Path, YAML, getEnabledEngines, getPosEnd, makeEngineString,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CompositeDisposable = require('atom').CompositeDisposable;

  FS = require('fs');

  Path = require('path');

  YAML = require('js-yaml');

  EX = require('child_process').execSync;

  makeEngineString = function(engineNames) {
    var language;
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = engineNames.length; _i < _len; _i++) {
        language = engineNames[_i];
        _results.push("-e " + language);
      }
      return _results;
    })()).join(" ");
  };

  getEnabledEngines = function(configFilePath) {
    var attrs, configYaml, engine, _ref, _results;
    configYaml = YAML.safeLoad(FS.readFileSync(configFilePath, "utf8"));
    _ref = configYaml["engines"];
    _results = [];
    for (engine in _ref) {
      attrs = _ref[engine];
      if (attrs["enabled"] === true) {
        _results.push(engine);
      }
    }
    return _results;
  };

  getPosEnd = function(posEnd, posBeg) {
    if (posBeg === posEnd) {
      return posBeg + 2;
    } else {
      return posEnd || 120;
    }
  };

  module.exports = {
    config: {
      executablePath: {
        type: 'string',
        "default": '/usr/local/bin/codeclimate'
      }
    },
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.config.observe('linter-codeclimate.executablePath', (function(_this) {
        return function(executablePath) {
          return _this.executablePath = executablePath;
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    provideLinter: function() {
      var Helpers, configurationFile, linterMap, provider;
      Helpers = require('atom-linter');
      configurationFile = '.codeclimate.yml';
      linterMap = {
        '*': ['fixme'],
        'Ruby': ['rubocop'],
        'Ruby on Rails': ['rubocop'],
        'Ruby on Rails (RJS)': ['rubocop'],
        'JavaScript': ['eslint'],
        'CoffeeScript': ['coffeelint'],
        'CoffeeScript (Literate)': ['coffeelint'],
        'Python': ['pep8', 'radon'],
        'PHP': ['phpcodesniffer', 'phpmd'],
        'Go': ['gofmt', 'golint', 'govet']
      };
      return provider = {
        name: 'Code Climate',
        grammarScopes: ['*'],
        scope: 'file',
        lint: (function(_this) {
          return function(textEditor) {
            var analysisBeginTime, cmd, configEnabledEngines, configurationFilePath, error, fileDir, filePath, gitDir, grammarName, initRepo, linter, linterEnabledEngines, linterNameArray, message, _i, _j, _len, _len1, _ref, _ref1;
            filePath = textEditor.getPath();
            fileDir = Path.dirname(filePath);
            grammarName = textEditor.getGrammar().name;
            linterNameArray = [];
            _ref = linterMap['*'];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              linter = _ref[_i];
              linterNameArray.push(linter);
            }
            if (!FS.existsSync(_this.executablePath)) {
              try {
                _this.executablePath = EX("/bin/bash -lc 'which codeclimate'").toString().trim();
                atom.config.set("linter-codeclimate.executablePath", _this.executablePath);
              } catch (_error) {
                error = _error;
                atom.notifications.addError("codeclimate binary not found! Installation instructions at http://github.com/codeclimate/codeclimate");
                return [];
              }
            }
            configurationFilePath = Helpers.findFile(fileDir, configurationFile);
            if (!configurationFilePath) {
              gitDir = Path.dirname(Helpers.findFile(fileDir, ".git"));
              if (atom.config.get("linter-codeclimate.init") !== false) {
                message = "No .codeclimate.yml file found. Should I initialize one for you in " + gitDir + "?";
                initRepo = confirm(message);
                if (initRepo) {
                  try {
                    EX("/bin/bash -lc '" + _this.executablePath + " init'", {
                      cwd: gitDir
                    });
                    atom.notifications.addSuccess("init complete. Save your code again to run Code Climate analysis.");
                  } catch (_error) {
                    error = _error;
                    atom.notifications.addError("Unable to initialize .codeclimate.yml file in " + gitDir);
                  }
                } else {
                  atom.config.set("linter-codeclimate.init", false);
                }
              }
              return [];
            }
            if (linterMap.hasOwnProperty(grammarName) === true) {
              _ref1 = linterMap[grammarName];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                linter = _ref1[_j];
                if ((__indexOf.call(linterNameArray, linter) < 0)) {
                  linterNameArray.push(linter);
                }
              }
            }
            configEnabledEngines = getEnabledEngines(configurationFilePath);
            linterEnabledEngines = (function() {
              var _k, _len2, _results;
              _results = [];
              for (_k = 0, _len2 = linterNameArray.length; _k < _len2; _k++) {
                linter = linterNameArray[_k];
                if ((__indexOf.call(configEnabledEngines, linter) >= 0) === true) {
                  _results.push(linter);
                }
              }
              return _results;
            })();
            cmd = [
              _this.executablePath, "analyze", "-f json", makeEngineString((function() {
                var _k, _len2, _results;
                _results = [];
                for (_k = 0, _len2 = linterEnabledEngines.length; _k < _len2; _k++) {
                  linter = linterEnabledEngines[_k];
                  if (linter) {
                    _results.push(linter);
                  }
                }
                return _results;
              })()), "'" + atom.project.relativize(filePath) + "'"
            ].join(" ");
            console.log(cmd);
            analysisBeginTime = Date.now();
            return Helpers.exec("/bin/bash", ["-lc", cmd], {
              cwd: Path.dirname(configurationFilePath)
            }).then(JSON.parse).then(function(messages) {
              var issue, linterResults, locLine, locPosBeg, locPosEnd, _fn, _k, _len2;
              linterResults = [];
              _fn = function(issue) {
                return linterResults.push({
                  type: "Warning",
                  text: issue.description,
                  filePath: filePath,
                  range: [[locLine, locPosBeg], [locLine, locPosEnd]]
                });
              };
              for (_k = 0, _len2 = messages.length; _k < _len2; _k++) {
                issue = messages[_k];
                if (issue.location.positions) {
                  locLine = issue.location.positions.begin.line - 1;
                  locPosBeg = (issue.location.positions.begin.column - 1) || 0;
                  locPosEnd = getPosEnd(issue.location.positions.end.column, issue.location.positions.begin.column);
                } else {
                  locLine = issue.location.lines.begin - 1;
                  locPosBeg = 0;
                  locPosEnd = 120;
                }
                _fn(issue);
              }
              console.log("Code Climate analysis: " + (Date.now() - analysisBeginTime) + "ms");
              return linterResults;
            });
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2d1aWxmZmVyLy5kb3RmaWxlcy9hdG9tLnN5bWxpbmsvcGFja2FnZXMvbGludGVyLWNvZGVjbGltYXRlL2xpYi9saW50ZXItY29kZWNsaW1hdGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVGQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSLENBSFAsQ0FBQTs7QUFBQSxFQUlBLEVBQUEsR0FBSyxPQUFBLENBQVEsZUFBUixDQUF3QixDQUFDLFFBSjlCLENBQUE7O0FBQUEsRUFNQSxnQkFBQSxHQUFtQixTQUFDLFdBQUQsR0FBQTtBQUNqQixRQUFBLFFBQUE7V0FBQTs7QUFBQztXQUFBLGtEQUFBO21DQUFBO0FBQUEsc0JBQUMsS0FBQSxHQUFRLFNBQVQsQ0FBQTtBQUFBOztRQUFELENBQWdELENBQUMsSUFBakQsQ0FBc0QsR0FBdEQsRUFEaUI7RUFBQSxDQU5uQixDQUFBOztBQUFBLEVBU0EsaUJBQUEsR0FBb0IsU0FBQyxjQUFELEdBQUE7QUFDbEIsUUFBQSx5Q0FBQTtBQUFBLElBQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxRQUFMLENBQWMsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsY0FBaEIsRUFBZ0MsTUFBaEMsQ0FBZCxDQUFiLENBQUE7QUFDQztBQUFBO1NBQUEsY0FBQTsyQkFBQTtVQUF1RCxLQUFNLENBQUEsU0FBQSxDQUFOLEtBQW9CO0FBQTNFLHNCQUFBLE9BQUE7T0FBQTtBQUFBO29CQUZpQjtF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

//# sourceURL=/Users/guilffer/.dotfiles/atom.symlink/packages/linter-codeclimate/lib/linter-codeclimate.coffee
