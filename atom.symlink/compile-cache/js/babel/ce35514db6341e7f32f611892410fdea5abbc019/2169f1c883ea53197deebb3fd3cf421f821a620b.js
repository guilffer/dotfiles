Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies

var _atom = require('atom');

var _path = require('path');

var _atomLinter = require('atom-linter');

var Helpers = _interopRequireWildcard(_atomLinter);

'use babel';

var devLog = function devLog(msg) {
  if (!atom.inDevMode()) return;
  // eslint-disable-next-line no-console
  console.log('linter-codeclimate:: ' + msg);
};

/**
 * @summary Promisify a delay (timeout).
 * @param   {Integer} ms The time (milliseconds) to delay.
 * @return  {Promise}    Promise that is resolved after `ms` milliseconds.
 */
var delay = _asyncToGenerator(function* (ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
});

var measure = {
  start: function start(cwd) {
    if (!atom.inDevMode()) return;
    var startMark = cwd + '-start';
    // Clear start mark from previous execution for the same file
    if (performance.getEntriesByName(startMark).length) {
      performance.clearMarks(startMark);
    }
    performance.mark(startMark);
  },

  end: function end(cwd) {
    if (!atom.inDevMode()) return;
    var mark = {
      start: cwd + '-start',
      end: cwd + '-end'
    };
    performance.mark(mark.end);
    performance.measure(cwd, mark.start, mark.end);
    devLog('Analysis for ' + cwd + ' took: ' + performance.getEntriesByName(cwd)[0].duration.toFixed(2));
    /*
    // eslint-disable-next-line no-console
    console.log(
      `${logHeader} Analysis for ${cwd} took:`,
      performance.getEntriesByName(cwd)[0].duration.toFixed(2),
    );
    */
    performance.clearMeasures(cwd);
    performance.clearMarks(mark.start);
    performance.clearMarks(mark.end);
  }
};

/**
 * @summary Show a clearer error in Atom when the exact problem is known.
 * @param   {Error}  err              The caught error.
 * @param   {String} [description=''] A descriptive explanation of the error in
 *                                  Markdown (preserves line feeds).
 * @see     {@link https://atom.io/docs/api/latest/NotificationManager#instance-addError|Adding error notifications}
 */
var notifyError = function notifyError(err) {
  var description = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  var friendlyDesc = '';
  var detail = 'Exception details:';

  if (err.message) {
    detail += '\n- MESSAGE: ' + err.message;
  }

  var binErrorDefaults = {
    buttons: [{
      className: 'btn-install',
      onDidClick: function onDidClick() {
        // eslint-disable-next-line import/no-extraneous-dependencies
        require('shell').openExternal('https://github.com/codeclimate/codeclimate');
      },
      text: 'Install guide'
    }],
    dismissable: true
  };
  var defaults = {};
  if (err.code) {
    detail += '\n- CODE: ' + err.code;
    switch (err.code) {
      case 'ENOENT':
        friendlyDesc = 'CodeClimate binary could not be found.';
        defaults = binErrorDefaults;
        break;
      case 'EACCES':
      case 'EDIR':
        friendlyDesc = 'Executable path not pointing to a binary.';
        defaults = binErrorDefaults;
        break;
      default:
        friendlyDesc = 'CodeClimate execution failed.';
    }
  }

  var options = Object.assign(defaults, {
    description: (description + '\n' + friendlyDesc).trim(),
    detail: detail,
    stack: err.stack
  });
  atom.notifications.addError('linter-codeclimate error', options);
};

/**
 * Search for a CodeClimate config file in the project tree. If none found,
 * use the presence of a `.git` directory as the assumed project root.
 *
 * @param  {String}  filePath The absolute path to the file triggering the analysis.
 * @return {Promise}          The absolute path to the project root.
 */
var findProjectRoot = _asyncToGenerator(function* (filePath) {
  var fileDir = (0, _path.dirname)(filePath);
  var configurationFilePath = yield Helpers.findAsync(fileDir, '.codeclimate.yml');

  if (configurationFilePath !== null) {
    return (0, _path.dirname)(configurationFilePath);
  }

  // Fall back to dir of current file if a .git repo can't be found.
  var gitPath = yield Helpers.findAsync(fileDir, '.git');
  return (0, _path.dirname)(gitPath || filePath);
});

/**
 * @summary Estimates the range for a non-open file.
 * @param   {Object}  location The location object of the CodeClimate issue.
 * @return  {Array[]}          The range: `[[lineNumber, colStart], [lineNumber, colEnd]]`.
 */
var estimateRange = function estimateRange(location) {
  if (Object.prototype.hasOwnProperty.call(location, 'lines')) {
    return [[location.lines.begin - 1, 0], [location.lines.end - 1, 0]];
  }

  if (Object.prototype.hasOwnProperty.call(location, 'positions')) {
    var _location$positions = location.positions;
    var begin = _location$positions.begin;
    var end = _location$positions.end;

    return [[begin.line - 1, begin.column - 1], [end.line - 1, end.column - 1]];
  }

  return [[0, 0], [0, 0]];
};

/**
 * @summary Returns the range (lines/columns) for a given issue from its location.
 * @param   {TextEditor} textEditor The Atom TextEditor instance.
 * @param   {Object}     location   The location object of the CodeClimate issue.
 * @return  {Array[]}               The range: `[[lineNumber, colStart], [lineNumber, colEnd]]`.
 */
var calcRange = function calcRange(textEditor, location) {
  // Issue only has a line number
  if (!Object.prototype.hasOwnProperty.call(location, 'positions')) {
    return Helpers.generateRange(textEditor, location.lines.begin - 1);
  }

  var positions = location.positions;

  var line = positions.begin.line - 1;

  // Invalid starting column, just treat it as a line number
  if (positions.begin.column === undefined) {
    return Helpers.generateRange(textEditor, line);
  }

  var colStart = positions.begin.column - 1;
  var colEnd = positions.end.column === undefined ? undefined : positions.end.column - 1;

  // No valid end column, let `generateRange()` highlight a word
  if (colEnd === undefined || colStart === colEnd) {
    return Helpers.generateRange(textEditor, line, colStart);
  }

  // Valid end column, and different from the start one
  return [[line, colStart], [line, colEnd]];
};

var ccLinter = {
  cache: {},
  fingerprints: {},
  linting: {},

  activate: function activate() {
    var _this = this;

    // Idle callback to check version
    this.idleCallbacks = new Set();
    var depsCallbackID = undefined;
    var installLinterCodeclimateDeps = function installLinterCodeclimateDeps() {
      _this.idleCallbacks['delete'](depsCallbackID);
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-codeclimate');
      }
    };
    depsCallbackID = window.requestIdleCallback(installLinterCodeclimateDeps);
    this.idleCallbacks.add(depsCallbackID);

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-codeclimate.executablePath', function (value) {
      _this.executablePath = value;
    }), atom.config.observe('linter-codeclimate.disableTimeout', function (value) {
      _this.disableTimeout = value;
    }), atom.workspace.observeTextEditors(function (textEditor) {
      return _this.cacheEditor(textEditor);
    }));
  },

  deactivate: function deactivate() {
    this.idleCallbacks.forEach(function (callbackID) {
      return window.cancelIdleCallback(callbackID);
    });
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      name: 'Code Climate',
      grammarScopes: ['*'],
      scope: 'project',
      lintsOnChange: false,
      lint: _asyncToGenerator(function* (textEditor) {
        return _this2.debouncedLint(textEditor);
      })
    };
  },

  /**
   * @summary Debounces the linting to join triggerings from multiple files of same project.
   * @param   {TextEditor} textEditor The TextEditor instance of the triggering file.
   * @return  {Promise}               An array of issues in the format that AtomLinter expects.
   */
  debouncedLint: _asyncToGenerator(function* (textEditor) {
    var path = textEditor.getPath();

    // Exit early on `untitled` files (not saved into disk yet)
    if (path === undefined) return null;

    if (!this.cache[path]) {
      // Beware with race condition: textEditor observer and linter fired simultaneously
      yield this.cacheEditor(textEditor);
    }
    var project = this.cache[path].project;

    var now = Date.now();
    if (this.linting[project] === undefined) {
      this.linting[project] = [now];
    } else {
      this.linting[project].push(now);
    }

    yield delay(250);
    this.linting[project].shift();

    // More lints for the same project have been requested and delayed.
    if (this.linting[project].length > 0) return null;

    // This is the last requested lint, so analyze!
    return this.lintProject(project);
  }),

  /**
   * @summary Lints a project.
   * @param   {String}  path The absolute path to the project to analyze.
   * @return  {Promise}      An array of issues in the format that AtomLinter expects.
   */
  lintProject: _asyncToGenerator(function* (path) {
    // Debug the command executed to run the Code Climate CLI to the console
    devLog('Analyzing project @ ' + path);

    // Start measure for how long the analysis took
    measure.start(path);

    // Exec cc-cli and handle unique spawning (killed execs will return `null`)
    var result = yield this.runCli(path);
    if (result === null) return null;

    var linterResults = this.parseIssues(path, result);

    // Log the length of time it took to run analysis
    measure.end(path);

    this.reset(path);
    return linterResults;
  }),

  /**
   * @summary Cache and keeps track of open textEditors and cache its file/project paths.
   * @param   {TextEditor} textEditor TextEditor instance of the file which triggered the analysis.
   */
  cacheEditor: _asyncToGenerator(function* (textEditor) {
    var _this3 = this;

    var path = textEditor.getPath();

    if (path === undefined) {
      // Although this could be placed after the event subscriptions to allow
      // TextEditors to automatically get fixed, it could mean that there were
      // multiple subscriptions for the same editor. By returning before
      // subscribing to events on an unsaved TextEditor we avoid this, and if
      // a lint() is called on it later once it has a path it will get cached
      // then.
      return;
    }

    if (this.cache[path]) return;

    textEditor.onDidDestroy(function () {
      return delete _this3.cache[path];
    });
    textEditor.onDidChangePath(function (newPath) {
      var cached = _this3.cache[path];
      delete _this3.cache[path];
      cached.path = newPath;
      _this3.cache[newPath] = cached;
    });

    this.cache[path] = {
      editor: textEditor,
      file: path,
      project: yield findProjectRoot(path)
    };
  }),

  findTextEditor: function findTextEditor(filepath) {
    return this.cache[filepath] && this.cache[filepath].editor;
  },

  /**
   * @summary Runs the CodeClimate CLI in a spawned process.
   * @param   {String}        cwd The absolute path to the project root.
   * @return  {Promise|null}      Promise with the output from executing the CLI.
   * @todo    Remove option `ignoreExitCode` after fixing https://github.com/steelbrain/exec/issues/97
   */
  runCli: _asyncToGenerator(function* (cwd) {
    var execArgs = ['analyze', '-f', 'json'];
    var execOpts = {
      cwd: cwd,
      ignoreExitCode: true,
      uniqueKey: 'linter-codeclimate::' + cwd
    };

    if (this.disableTimeout || atom.inSpecMode()) {
      execOpts.timeout = Infinity;
    }

    // Execute the Code Climate CLI, parse the results, and emit them to the
    // Linter package as warnings. The Linter package handles the styling.
    try {
      return yield Helpers.exec(this.executablePath, execArgs, execOpts);
    } catch (e) {
      notifyError(e);
      return null;
    }
  }),

  /**
   * @summary Parses the issues reported by CodeClimate CLI to the format AtomLinter expects.
   * @param   {String}   project The absolute path to the project to analyze.
   * @param   {Object}   result  JSON string from the CodeClimate CLI output to parse.
   * @return  {Object[]}         Parsed issues, with following keys per object (array item):
   *                             - description: explanation of the issue.
   *                             - excerpt: summary of the issue.
   *                             - location: { file, position }.
   *                             - severity: the issue severity (one of (info|warning|error)).
   */
  parseIssues: function parseIssues(project, result) {
    var _this4 = this;

    var messages = undefined;

    try {
      messages = JSON.parse(result);
    } catch (e) {
      notifyError(e, 'Invalid JSON returned from CodeClimate. See the Console for details.');
      // eslint-disable-next-line no-console
      console.error('Invalid JSON returned from CodeClimate:', result);
      return [];
    }

    var linterResults = [];
    messages.forEach(function (issue) {
      // Exit early if not an issue
      if (issue.type.toLowerCase() !== 'issue') return;

      // Exit early if duplicated issue
      if (_this4.reportedPreviously(project, issue.fingerprint)) return;

      var file = (0, _path.join)(project, issue.location.path);
      var textEditor = _this4.findTextEditor(file);
      var position = textEditor ? calcRange(textEditor, issue.location) : estimateRange(issue.location);
      var mapSeverity = {
        major: 'error',
        minor: 'warning'
      };
      linterResults.push({
        severity: mapSeverity[issue.severity] || 'warning',
        excerpt: issue.engine_name.toUpperCase() + ': ' + issue.description + ' [' + issue.check_name + ']',
        description: issue.content && issue.content.body ? issue.content.body : undefined,
        location: { file: file, position: position }
      });
    });

    return linterResults;
  },

  /**
   * @summary Checks if the reported issue has been reported previously (duplicated).
   * @param   {String}  projectRoot The project root.
   * @param   {}
   * @return  {Boolean} Whether the issue is duplicated (`true`) or not (`false`).
   * @todo    Remove after fixing https://github.com/phpmd/phpmd/issues/467
   */
  reportedPreviously: function reportedPreviously(projectRoot, fingerprint) {
    if (!Object.prototype.hasOwnProperty.call(this.fingerprints, projectRoot)) {
      this.fingerprints[projectRoot] = new Set();
    }

    if (this.fingerprints[projectRoot].has(fingerprint)) return true;

    this.fingerprints[projectRoot].add(fingerprint);
    return false;
  },

  /**
   * @summary Resets the flags for project at `projectRoot`.
   * @param   {String} projectRoot The absolute path to the project root.
   */
  reset: function reset(projectRoot) {
    delete this.fingerprints[projectRoot];
    delete this.linting[projectRoot];
  }
};

exports['default'] = ccLinter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9ndWlsZmZlci8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL2xpbnRlci1jb2RlY2xpbWF0ZS9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFHb0MsTUFBTTs7b0JBQ1osTUFBTTs7MEJBQ1gsYUFBYTs7SUFBMUIsT0FBTzs7QUFMbkIsV0FBVyxDQUFDOztBQU9aLElBQU0sTUFBTSxHQUFHLFNBQVQsTUFBTSxDQUFJLEdBQUcsRUFBSztBQUN0QixNQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLE9BQU87O0FBRTlCLFNBQU8sQ0FBQyxHQUFHLDJCQUF5QixHQUFHLENBQUcsQ0FBQztDQUM1QyxDQUFDOzs7Ozs7O0FBT0YsSUFBTSxLQUFLLHFCQUFHLFdBQU0sRUFBRTtTQUFJLElBQUksT0FBTyxDQUFDLFVBQUEsT0FBTztXQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO0dBQUEsQ0FBQztDQUFBLENBQUEsQ0FBQzs7QUFFMUUsSUFBTSxPQUFPLEdBQUc7QUFDZCxPQUFLLEVBQUEsZUFBQyxHQUFHLEVBQUU7QUFDVCxRQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLE9BQU87QUFDOUIsUUFBTSxTQUFTLEdBQU0sR0FBRyxXQUFRLENBQUM7O0FBRWpDLFFBQUksV0FBVyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUNsRCxpQkFBVyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNuQztBQUNELGVBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDN0I7O0FBRUQsS0FBRyxFQUFBLGFBQUMsR0FBRyxFQUFFO0FBQ1AsUUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxPQUFPO0FBQzlCLFFBQU0sSUFBSSxHQUFHO0FBQ1gsV0FBSyxFQUFLLEdBQUcsV0FBUTtBQUNyQixTQUFHLEVB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ekYsbUJBQVcsRUFBRSxBQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsU0FBUztBQUNuRixnQkFBUSxFQUFFLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBRSxRQUFRLEVBQVIsUUFBUSxFQUFFO09BQzdCLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQzs7QUFFSCxXQUFPLGFBQWEsQ0FBQztHQUN0Qjs7Ozs7Ozs7O0FBU0Qsb0JBQWtCLEVBQUEsNEJBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRTtBQUMzQyxRQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLEVBQUU7QUFDekUsVUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0tBQzVDOztBQUVELFFBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUM7O0FBRWpFLFFBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2hELFdBQU8sS0FBSyxDQUFDO0dBQ2Q7Ozs7OztBQU1ELE9BQUssRUFBQSxlQUFDLFdBQVcsRUFBRTtBQUNqQixXQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdEMsV0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQ2xDO0NBQ0YsQ0FBQzs7cUJBRWEsUUFBUSIsImZpbGUiOiIvVXNlcnMvZ3VpbGZmZXIvLmRvdGZpbGVzL2F0b20uc3ltbGluay9wYWNrYWdlcy9saW50ZXItY29kZWNsaW1hdGUvbGliL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvZXh0ZW5zaW9ucywgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgeyBkaXJuYW1lLCBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBIZWxwZXJzIGZyb20gJ2F0b20tbGludGVyJztcblxuY29uc3QgZGV2TG9nID0gKG1zZykgPT4ge1xuICBpZiAoIWF0b20uaW5EZXZNb2RlKCkpIHJldHVybjtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgY29uc29sZS5sb2coYGxpbnRlci1jb2RlY2xpbWF0ZTo6ICR7bXNnfWApO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBQcm9taXNpZnkgYSBkZWxheSAodGltZW91dCkuXG4gKiBAcGFyYW0gICB7SW50ZWdlcn0gbXMgVGhlIHRpbWUgKG1pbGxpc2Vjb25kcykgdG8gZGVsYXkuXG4gKiBAcmV0dXJuICB7UHJvbWlzZX0gICAgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIGFmdGVyIGBtc2AgbWlsbGlzZWNvbmRzLlxuICovXG5jb25zdCBkZWxheSA9IGFzeW5jIG1zID0+IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xuXG5jb25zdCBtZWFzdXJlID0ge1xuICBzdGFydChjd2QpIHtcbiAgICBpZiAoIWF0b20uaW5EZXZNb2RlKCkpIHJldHVybjtcbiAgICBjb25zdCBzdGFydE1hcmsgPSBgJHtjd2R9LXN0YXJ0YDtcbiAgICAvLyBDbGVhciBzdGFydCBtYXJrIGZyb20gcHJldmlvdXMgZXhlY3V0aW9uIGZvciB0aGUgc2FtZSBmaWxlXG4gICAgaWYgKHBlcmZvcm1hbmNlLmdldEVudHJpZXNCeU5hbWUoc3RhcnRNYXJrKS5sZW5ndGgpIHtcbiAgICAgIHBlcmZvcm1hbmNlLmNsZWFyTWFya3Moc3RhcnRNYXJrKTtcbiAgICB9XG4gICAgcGVyZm9ybWFuY2UubWFyayhzdGFydE1hcmspO1xuICB9LFxuXG4gIGVuZChjd2QpIHtcbiAgICBpZiAoIWF0b20uaW5EZXZNb2RlKCkpIHJldHVybjtcbiAgICBjb25zdCBtYXJrID0ge1xuICAgICAgc3RhcnQ6IGAke2N3ZH0tc3RhcnRgLFxuICAgICAgZW5kOiBgJHtjd2R9LWVuZGAsXG4gICAgfTtcbiAgICBwZXJmb3JtYW5jZS5tYXJrKG1hcmsuZW5kKTtcbiAgICBwZXJmb3JtYW5jZS5tZWFzdXJlKGN3ZCwgbWFyay5zdGFydCwgbWFyay5lbmQpO1xuICAgIGRldkxvZyhgQW5hbHlzaXMgZm9yICR7Y3dkfSB0b29rOiAke3BlcmZvcm1hbmNlLmdldEVudHJpZXNCeU5hbWUoY3dkKVswXS5kdXJhdGlvbi50b0ZpeGVkKDIpfWApO1xuICAgIC8qXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgIGAke2xvZ0hlYWRlcn0gQW5hbHlzaXMgZm9yICR7Y3dkfSB0b29rOmAsXG4gICAgICBwZXJmb3JtYW5jZS5nZXRFbnRyaWVzQnlOYW1lKGN3ZClbMF0uZHVyYXRpb24udG9GaXhlZCgyKSxcbiAgICApO1xuICAgICovXG4gICAgcGVyZm9ybWFuY2UuY2xlYXJNZWFzdXJlcyhjd2QpO1xuICAgIHBlcmZvcm1hbmNlLmNsZWFyTWFya3MobWFyay5zdGFydCk7XG4gICAgcGVyZm9ybWFuY2UuY2xlYXJNYXJrcyhtYXJrLmVuZCk7XG4gIH0sXG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IFNob3cgYSBjbGVhcmVyIGVycm9yIGluIEF0b20gd2hlbiB0aGUgZXhhY3QgcHJvYmxlbSBpcyBrbm93bi5cbiAqIEBwYXJhbSAgIHtFcnJvcn0gIGVyciAgICAgICAgICAgICAgVGhlIGNhdWdodCBlcnJvci5cbiAqIEBwYXJhbSAgIHtTdHJpbmd9IFtkZXNjcmlwdGlvbj0nJ10gQSBkZXNjcmlwdGl2ZSBleHBsYW5hdGlvbiBvZiB0aGUgZXJyb3IgaW5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hcmtkb3duIChwcmVzZXJ2ZXMgbGluZSBmZWVkcykuXG4gKiBAc2VlICAgICB7QGxpbmsgaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL2xhdGVzdC9Ob3RpZmljYXRpb25NYW5hZ2VyI2luc3RhbmNlLWFkZEVycm9yfEFkZGluZyBlcnJvciBub3RpZmljYXRpb25zfVxuICovXG5jb25zdCBub3RpZnlFcnJvciA9IChlcnIsIGRlc2NyaXB0aW9uID0gJycpID0+IHtcbiAgbGV0IGZyaWVuZGx5RGVzYyA9ICcnO1xuICBsZXQgZGV0YWlsID0gJ0V4Y2VwdGlvbiBkZXRhaWxzOic7XG5cbiAgaWYgKGVyci5tZXNzYWdlKSB7XG4gICAgZGV0YWlsICs9IGBcXG4tIE1FU1NBR0U6ICR7ZXJyLm1lc3NhZ2V9YDtcbiAgfVxuXG4gIGNvbnN0IGJpbkVycm9yRGVmYXVsdHMgPSB7XG4gICAgYnV0dG9uczogW3tcbiAgICAgIGNsYXNzTmFtZTogJ2J0bi1pbnN0YWxsJyxcbiAgICAgIG9uRGlkQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llc1xuICAgICAgICByZXF1aXJlKCdzaGVsbCcpLm9wZW5FeHRlcm5hbCgnaHR0cHM6Ly9naXRodWIuY29tL2NvZGVjbGltYXRlL2NvZGVjbGltYXRlJyk7XG4gICAgICB9LFxuICAgICAgdGV4dDogJ0luc3RhbGwgZ3VpZGUnLFxuICAgIH1dLFxuICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICB9O1xuICBsZXQgZGVmYXVsdHMgPSB7fTtcbiAgaWYgKGVyci5jb2RlKSB7XG4gICAgZGV0YWlsICs9IGBcXG4tIENPREU6ICR7ZXJyLmNvZGV9YDtcbiAgICBzd2l0Y2ggKGVyci5jb2RlKSB7XG4gICAgICBjYXNlICdFTk9FTlQnOlxuICAgICAgICBmcmllbmRseURlc2MgPSAnQ29kZUNsaW1hdGUgYmluYXJ5IGNvdWxkIG5vdCBiZSBmb3VuZC4nO1xuICAgICAgICBkZWZhdWx0cyA9IGJpbkVycm9yRGVmYXVsdHM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnRUFDQ0VTJzpcbiAgICAgIGNhc2UgJ0VESVInOlxuICAgICAgICBmcmllbmRseURlc2MgPSAnRXhlY3V0YWJsZSBwYXRoIG5vdCBwb2ludGluZyB0byBhIGJpbmFyeS4nO1xuICAgICAgICBkZWZhdWx0cyA9IGJpbkVycm9yRGVmYXVsdHM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZnJpZW5kbHlEZXNjID0gJ0NvZGVDbGltYXRlIGV4ZWN1dGlvbiBmYWlsZWQuJztcbiAgICB9XG4gIH1cblxuICBjb25zdCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywge1xuICAgIGRlc2NyaXB0aW9uOiBgJHtkZXNjcmlwdGlvbn1cXG4ke2ZyaWVuZGx5RGVzY31gLnRyaW0oKSxcbiAgICBkZXRhaWwsXG4gICAgc3RhY2s6IGVyci5zdGFjayxcbiAgfSk7XG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignbGludGVyLWNvZGVjbGltYXRlIGVycm9yJywgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIFNlYXJjaCBmb3IgYSBDb2RlQ2xpbWF0ZSBjb25maWcgZmlsZSBpbiB0aGUgcHJvamVjdCB0cmVlLiBJZiBub25lIGZvdW5kLFxuICogdXNlIHRoZSBwcmVzZW5jZSBvZiBhIGAuZ2l0YCBkaXJlY3RvcnkgYXMgdGhlIGFzc3VtZWQgcHJvamVjdCByb290LlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gIGZpbGVQYXRoIFRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBmaWxlIHRyaWdnZXJpbmcgdGhlIGFuYWx5c2lzLlxuICogQHJldHVybiB7UHJvbWlzZX0gICAgICAgICAgVGhlIGFic29sdXRlIHBhdGggdG8gdGhlIHByb2plY3Qgcm9vdC5cbiAqL1xuY29uc3QgZmluZFByb2plY3RSb290ID0gYXN5bmMgKGZpbGVQYXRoKSA9PiB7XG4gIGNvbnN0IGZpbGVEaXIgPSBkaXJuYW1lKGZpbGVQYXRoKTtcbiAgY29uc3QgY29uZmlndXJhdGlvbkZpbGVQYXRoID0gYXdhaXQgSGVscGVycy5maW5kQXN5bmMoZmlsZURpciwgJy5jb2RlY2xpbWF0ZS55bWwnKTtcblxuICBpZiAoY29uZmlndXJhdGlvbkZpbGVQYXRoICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIGRpcm5hbWUoY29uZmlndXJhdGlvbkZpbGVQYXRoKTtcbiAgfVxuXG4gIC8vIEZhbGwgYmFjayB0byBkaXIgb2YgY3VycmVudCBmaWxlIGlmIGEgLmdpdCByZXBvIGNhbid0IGJlIGZvdW5kLlxuICBjb25zdCBnaXRQYXRoID0gYXdhaXQgSGVscGVycy5maW5kQXN5bmMoZmlsZURpciwgJy5naXQnKTtcbiAgcmV0dXJuIGRpcm5hbWUoZ2l0UGF0aCB8fCBmaWxlUGF0aCk7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IEVzdGltYXRlcyB0aGUgcmFuZ2UgZm9yIGEgbm9uLW9wZW4gZmlsZS5cbiAqIEBwYXJhbSAgIHtPYmplY3R9ICBsb2NhdGlvbiBUaGUgbG9jYXRpb24gb2JqZWN0IG9mIHRoZSBDb2RlQ2xpbWF0ZSBpc3N1ZS5cbiAqIEByZXR1cm4gIHtBcnJheVtdfSAgICAgICAgICBUaGUgcmFuZ2U6IGBbW2xpbmVOdW1iZXIsIGNvbFN0YXJ0XSwgW2xpbmVOdW1iZXIsIGNvbEVuZF1dYC5cbiAqL1xuY29uc3QgZXN0aW1hdGVSYW5nZSA9IChsb2NhdGlvbikgPT4ge1xuICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGxvY2F0aW9uLCAnbGluZXMnKSkge1xuICAgIHJldHVybiBbXG4gICAgICBbbG9jYXRpb24ubGluZXMuYmVnaW4gLSAxLCAwXSxcbiAgICAgIFtsb2NhdGlvbi5saW5lcy5lbmQgLSAxLCAwXSxcbiAgICBdO1xuICB9XG5cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChsb2NhdGlvbiwgJ3Bvc2l0aW9ucycpKSB7XG4gICAgY29uc3QgeyBiZWdpbiwgZW5kIH0gPSBsb2NhdGlvbi5wb3NpdGlvbnM7XG4gICAgcmV0dXJuIFtcbiAgICAgIFtiZWdpbi5saW5lIC0gMSwgYmVnaW4uY29sdW1uIC0gMV0sXG4gICAgICBbZW5kLmxpbmUgLSAxLCBlbmQuY29sdW1uIC0gMV0sXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiBbWzAsIDBdLCBbMCwgMF1dO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBSZXR1cm5zIHRoZSByYW5nZSAobGluZXMvY29sdW1ucykgZm9yIGEgZ2l2ZW4gaXNzdWUgZnJvbSBpdHMgbG9jYXRpb24uXG4gKiBAcGFyYW0gICB7VGV4dEVkaXRvcn0gdGV4dEVkaXRvciBUaGUgQXRvbSBUZXh0RWRpdG9yIGluc3RhbmNlLlxuICogQHBhcmFtICAge09iamVjdH0gICAgIGxvY2F0aW9uICAgVGhlIGxvY2F0aW9uIG9iamVjdCBvZiB0aGUgQ29kZUNsaW1hdGUgaXNzdWUuXG4gKiBAcmV0dXJuICB7QXJyYXlbXX0gICAgICAgICAgICAgICBUaGUgcmFuZ2U6IGBbW2xpbmVOdW1iZXIsIGNvbFN0YXJ0XSwgW2xpbmVOdW1iZXIsIGNvbEVuZF1dYC5cbiAqL1xuY29uc3QgY2FsY1JhbmdlID0gKHRleHRFZGl0b3IsIGxvY2F0aW9uKSA9PiB7XG4gIC8vIElzc3VlIG9ubHkgaGFzIGEgbGluZSBudW1iZXJcbiAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobG9jYXRpb24sICdwb3NpdGlvbnMnKSkge1xuICAgIHJldHVybiBIZWxwZXJzLmdlbmVyYXRlUmFuZ2UodGV4dEVkaXRvciwgbG9jYXRpb24ubGluZXMuYmVnaW4gLSAxKTtcbiAgfVxuXG4gIGNvbnN0IHsgcG9zaXRpb25zIH0gPSBsb2NhdGlvbjtcbiAgY29uc3QgbGluZSA9IHBvc2l0aW9ucy5iZWdpbi5saW5lIC0gMTtcblxuICAvLyBJbnZhbGlkIHN0YXJ0aW5nIGNvbHVtbiwganVzdCB0cmVhdCBpdCBhcyBhIGxpbmUgbnVtYmVyXG4gIGlmIChwb3NpdGlvbnMuYmVnaW4uY29sdW1uID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gSGVscGVycy5nZW5lcmF0ZVJhbmdlKHRleHRFZGl0b3IsIGxpbmUpO1xuICB9XG5cbiAgY29uc3QgY29sU3RhcnQgPSBwb3NpdGlvbnMuYmVnaW4uY29sdW1uIC0gMTtcbiAgY29uc3QgY29sRW5kID0gKHBvc2l0aW9ucy5lbmQuY29sdW1uID09PSB1bmRlZmluZWQpXG4gICAgPyB1bmRlZmluZWQgOiAocG9zaXRpb25zLmVuZC5jb2x1bW4gLSAxKTtcblxuICAvLyBObyB2YWxpZCBlbmQgY29sdW1uLCBsZXQgYGdlbmVyYXRlUmFuZ2UoKWAgaGlnaGxpZ2h0IGEgd29yZFxuICBpZiAoY29sRW5kID09PSB1bmRlZmluZWQgfHwgY29sU3RhcnQgPT09IGNvbEVuZCkge1xuICAgIHJldHVybiBIZWxwZXJzLmdlbmVyYXRlUmFuZ2UodGV4dEVkaXRvciwgbGluZSwgY29sU3RhcnQpO1xuICB9XG5cbiAgLy8gVmFsaWQgZW5kIGNvbHVtbiwgYW5kIGRpZmZlcmVudCBmcm9tIHRoZSBzdGFydCBvbmVcbiAgcmV0dXJuIFtbbGluZSwgY29sU3RhcnRdLCBbbGluZSwgY29sRW5kXV07XG59O1xuXG5cbmNvbnN0IGNjTGludGVyID0ge1xuICBjYWNoZToge30sXG4gIGZpbmdlcnByaW50czoge30sXG4gIGxpbnRpbmc6IHt9LFxuXG4gIGFjdGl2YXRlKCkge1xuICAgIC8vIElkbGUgY2FsbGJhY2sgdG8gY2hlY2sgdmVyc2lvblxuICAgIHRoaXMuaWRsZUNhbGxiYWNrcyA9IG5ldyBTZXQoKTtcbiAgICBsZXQgZGVwc0NhbGxiYWNrSUQ7XG4gICAgY29uc3QgaW5zdGFsbExpbnRlckNvZGVjbGltYXRlRGVwcyA9ICgpID0+IHtcbiAgICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5kZWxldGUoZGVwc0NhbGxiYWNrSUQpO1xuICAgICAgaWYgKCFhdG9tLmluU3BlY01vZGUoKSkge1xuICAgICAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ2xpbnRlci1jb2RlY2xpbWF0ZScpO1xuICAgICAgfVxuICAgIH07XG4gICAgZGVwc0NhbGxiYWNrSUQgPSB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFjayhpbnN0YWxsTGludGVyQ29kZWNsaW1hdGVEZXBzKTtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MuYWRkKGRlcHNDYWxsYmFja0lEKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoXG4gICAgICAgICdsaW50ZXItY29kZWNsaW1hdGUuZXhlY3V0YWJsZVBhdGgnLFxuICAgICAgICAodmFsdWUpID0+IHsgdGhpcy5leGVjdXRhYmxlUGF0aCA9IHZhbHVlOyB9LFxuICAgICAgKSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoXG4gICAgICAgICdsaW50ZXItY29kZWNsaW1hdGUuZGlzYWJsZVRpbWVvdXQnLFxuICAgICAgICAodmFsdWUpID0+IHsgdGhpcy5kaXNhYmxlVGltZW91dCA9IHZhbHVlOyB9LFxuICAgICAgKSxcbiAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyh0ZXh0RWRpdG9yID0+IHRoaXMuY2FjaGVFZGl0b3IodGV4dEVkaXRvcikpLFxuICAgICk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MuZm9yRWFjaChjYWxsYmFja0lEID0+IHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2soY2FsbGJhY2tJRCkpO1xuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5jbGVhcigpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH0sXG5cbiAgcHJvdmlkZUxpbnRlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ0NvZGUgQ2xpbWF0ZScsXG4gICAgICBncmFtbWFyU2NvcGVzOiBbJyonXSxcbiAgICAgIHNjb3BlOiAncHJvamVjdCcsXG4gICAgICBsaW50c09uQ2hhbmdlOiBmYWxzZSxcbiAgICAgIGxpbnQ6IGFzeW5jIHRleHRFZGl0b3IgPT4gdGhpcy5kZWJvdW5jZWRMaW50KHRleHRFZGl0b3IpLFxuICAgIH07XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IERlYm91bmNlcyB0aGUgbGludGluZyB0byBqb2luIHRyaWdnZXJpbmdzIGZyb20gbXVsdGlwbGUgZmlsZXMgb2Ygc2FtZSBwcm9qZWN0LlxuICAgKiBAcGFyYW0gICB7VGV4dEVkaXRvcn0gdGV4dEVkaXRvciBUaGUgVGV4dEVkaXRvciBpbnN0YW5jZSBvZiB0aGUgdHJpZ2dlcmluZyBmaWxlLlxuICAgKiBAcmV0dXJuICB7UHJvbWlzZX0gICAgICAgICAgICAgICBBbiBhcnJheSBvZiBpc3N1ZXMgaW4gdGhlIGZvcm1hdCB0aGF0IEF0b21MaW50ZXIgZXhwZWN0cy5cbiAgICovXG4gIGFzeW5jIGRlYm91bmNlZExpbnQodGV4dEVkaXRvcikge1xuICAgIGNvbnN0IHBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcblxuICAgIC8vIEV4aXQgZWFybHkgb24gYHVudGl0bGVkYCBmaWxlcyAobm90IHNhdmVkIGludG8gZGlzayB5ZXQpXG4gICAgaWYgKHBhdGggPT09IHVuZGVmaW5lZCkgcmV0dXJuIG51bGw7XG5cbiAgICBpZiAoIXRoaXMuY2FjaGVbcGF0aF0pIHtcbiAgICAgIC8vIEJld2FyZSB3aXRoIHJhY2UgY29uZGl0aW9uOiB0ZXh0RWRpdG9yIG9ic2VydmVyIGFuZCBsaW50ZXIgZmlyZWQgc2ltdWx0YW5lb3VzbHlcbiAgICAgIGF3YWl0IHRoaXMuY2FjaGVFZGl0b3IodGV4dEVkaXRvcik7XG4gICAgfVxuICAgIGNvbnN0IHsgcHJvamVjdCB9ID0gdGhpcy5jYWNoZVtwYXRoXTtcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIGlmICh0aGlzLmxpbnRpbmdbcHJvamVjdF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5saW50aW5nW3Byb2plY3RdID0gW25vd107XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGludGluZ1twcm9qZWN0XS5wdXNoKG5vdyk7XG4gICAgfVxuXG4gICAgYXdhaXQgZGVsYXkoMjUwKTtcbiAgICB0aGlzLmxpbnRpbmdbcHJvamVjdF0uc2hpZnQoKTtcblxuICAgIC8vIE1vcmUgbGludHMgZm9yIHRoZSBzYW1lIHByb2plY3QgaGF2ZSBiZWVuIHJlcXVlc3RlZCBhbmQgZGVsYXllZC5cbiAgICBpZiAodGhpcy5saW50aW5nW3Byb2plY3RdLmxlbmd0aCA+IDApIHJldHVybiBudWxsO1xuXG4gICAgLy8gVGhpcyBpcyB0aGUgbGFzdCByZXF1ZXN0ZWQgbGludCwgc28gYW5hbHl6ZSFcbiAgICByZXR1cm4gdGhpcy5saW50UHJvamVjdChwcm9qZWN0KTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgTGludHMgYSBwcm9qZWN0LlxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgcGF0aCBUaGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgcHJvamVjdCB0byBhbmFseXplLlxuICAgKiBAcmV0dXJuICB7UHJvbWlzZX0gICAgICBBbiBhcnJheSBvZiBpc3N1ZXMgaW4gdGhlIGZvcm1hdCB0aGF0IEF0b21MaW50ZXIgZXhwZWN0cy5cbiAgICovXG4gIGFzeW5jIGxpbnRQcm9qZWN0KHBhdGgpIHtcbiAgICAvLyBEZWJ1ZyB0aGUgY29tbWFuZCBleGVjdXRlZCB0byBydW4gdGhlIENvZGUgQ2xpbWF0ZSBDTEkgdG8gdGhlIGNvbnNvbGVcbiAgICBkZXZMb2coYEFuYWx5emluZyBwcm9qZWN0IEAgJHtwYXRofWApO1xuXG4gICAgLy8gU3RhcnQgbWVhc3VyZSBmb3IgaG93IGxvbmcgdGhlIGFuYWx5c2lzIHRvb2tcbiAgICBtZWFzdXJlLnN0YXJ0KHBhdGgpO1xuXG4gICAgLy8gRXhlYyBjYy1jbGkgYW5kIGhhbmRsZSB1bmlxdWUgc3Bhd25pbmcgKGtpbGxlZCBleGVjcyB3aWxsIHJldHVybiBgbnVsbGApXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5ydW5DbGkocGF0aCk7XG4gICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBsaW50ZXJSZXN1bHRzID0gdGhpcy5wYXJzZUlzc3VlcyhwYXRoLCByZXN1bHQpO1xuXG4gICAgLy8gTG9nIHRoZSBsZW5ndGggb2YgdGltZSBpdCB0b29rIHRvIHJ1biBhbmFseXNpc1xuICAgIG1lYXN1cmUuZW5kKHBhdGgpO1xuXG4gICAgdGhpcy5yZXNldChwYXRoKTtcbiAgICByZXR1cm4gbGludGVyUmVzdWx0cztcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgQ2FjaGUgYW5kIGtlZXBzIHRyYWNrIG9mIG9wZW4gdGV4dEVkaXRvcnMgYW5kIGNhY2hlIGl0cyBmaWxlL3Byb2plY3QgcGF0aHMuXG4gICAqIEBwYXJhbSAgIHtUZXh0RWRpdG9yfSB0ZXh0RWRpdG9yIFRleHRFZGl0b3IgaW5zdGFuY2Ugb2YgdGhlIGZpbGUgd2hpY2ggdHJpZ2dlcmVkIHRoZSBhbmFseXNpcy5cbiAgICovXG4gIGFzeW5jIGNhY2hlRWRpdG9yKHRleHRFZGl0b3IpIHtcbiAgICBjb25zdCBwYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG5cbiAgICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBBbHRob3VnaCB0aGlzIGNvdWxkIGJlIHBsYWNlZCBhZnRlciB0aGUgZXZlbnQgc3Vic2NyaXB0aW9ucyB0byBhbGxvd1xuICAgICAgLy8gVGV4dEVkaXRvcnMgdG8gYXV0b21hdGljYWxseSBnZXQgZml4ZWQsIGl0IGNvdWxkIG1lYW4gdGhhdCB0aGVyZSB3ZXJlXG4gICAgICAvLyBtdWx0aXBsZSBzdWJzY3JpcHRpb25zIGZvciB0aGUgc2FtZSBlZGl0b3IuIEJ5IHJldHVybmluZyBiZWZvcmVcbiAgICAgIC8vIHN1YnNjcmliaW5nIHRvIGV2ZW50cyBvbiBhbiB1bnNhdmVkIFRleHRFZGl0b3Igd2UgYXZvaWQgdGhpcywgYW5kIGlmXG4gICAgICAvLyBhIGxpbnQoKSBpcyBjYWxsZWQgb24gaXQgbGF0ZXIgb25jZSBpdCBoYXMgYSBwYXRoIGl0IHdpbGwgZ2V0IGNhY2hlZFxuICAgICAgLy8gdGhlbi5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jYWNoZVtwYXRoXSkgcmV0dXJuO1xuXG4gICAgdGV4dEVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4gZGVsZXRlIHRoaXMuY2FjaGVbcGF0aF0pO1xuICAgIHRleHRFZGl0b3Iub25EaWRDaGFuZ2VQYXRoKChuZXdQYXRoKSA9PiB7XG4gICAgICBjb25zdCBjYWNoZWQgPSB0aGlzLmNhY2hlW3BhdGhdO1xuICAgICAgZGVsZXRlIHRoaXMuY2FjaGVbcGF0aF07XG4gICAgICBjYWNoZWQucGF0aCA9IG5ld1BhdGg7XG4gICAgICB0aGlzLmNhY2hlW25ld1BhdGhdID0gY2FjaGVkO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jYWNoZVtwYXRoXSA9IHtcbiAgICAgIGVkaXRvcjogdGV4dEVkaXRvcixcbiAgICAgIGZpbGU6IHBhdGgsXG4gICAgICBwcm9qZWN0OiBhd2FpdCBmaW5kUHJvamVjdFJvb3QocGF0aCksXG4gICAgfTtcbiAgfSxcblxuICBmaW5kVGV4dEVkaXRvcihmaWxlcGF0aCkge1xuICAgIHJldHVybiB0aGlzLmNhY2hlW2ZpbGVwYXRoXSAmJiB0aGlzLmNhY2hlW2ZpbGVwYXRoXS5lZGl0b3I7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFJ1bnMgdGhlIENvZGVDbGltYXRlIENMSSBpbiBhIHNwYXduZWQgcHJvY2Vzcy5cbiAgICogQHBhcmFtICAge1N0cmluZ30gICAgICAgIGN3ZCBUaGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgcHJvamVjdCByb290LlxuICAgKiBAcmV0dXJuICB7UHJvbWlzZXxudWxsfSAgICAgIFByb21pc2Ugd2l0aCB0aGUgb3V0cHV0IGZyb20gZXhlY3V0aW5nIHRoZSBDTEkuXG4gICAqIEB0b2RvICAgIFJlbW92ZSBvcHRpb24gYGlnbm9yZUV4aXRDb2RlYCBhZnRlciBmaXhpbmcgaHR0cHM6Ly9naXRodWIuY29tL3N0ZWVsYnJhaW4vZXhlYy9pc3N1ZXMvOTdcbiAgICovXG4gIGFzeW5jIHJ1bkNsaShjd2QpIHtcbiAgICBjb25zdCBleGVjQXJncyA9IFsnYW5hbHl6ZScsICctZicsICdqc29uJ107XG4gICAgY29uc3QgZXhlY09wdHMgPSB7XG4gICAgICBjd2QsXG4gICAgICBpZ25vcmVFeGl0Q29kZTogdHJ1ZSxcbiAgICAgIHVuaXF1ZUtleTogYGxpbnRlci1jb2RlY2xpbWF0ZTo6JHtjd2R9YCxcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuZGlzYWJsZVRpbWVvdXQgfHwgYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgICAgIGV4ZWNPcHRzLnRpbWVvdXQgPSBJbmZpbml0eTtcbiAgICB9XG5cbiAgICAvLyBFeGVjdXRlIHRoZSBDb2RlIENsaW1hdGUgQ0xJLCBwYXJzZSB0aGUgcmVzdWx0cywgYW5kIGVtaXQgdGhlbSB0byB0aGVcbiAgICAvLyBMaW50ZXIgcGFja2FnZSBhcyB3YXJuaW5ncy4gVGhlIExpbnRlciBwYWNrYWdlIGhhbmRsZXMgdGhlIHN0eWxpbmcuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBIZWxwZXJzLmV4ZWModGhpcy5leGVjdXRhYmxlUGF0aCwgZXhlY0FyZ3MsIGV4ZWNPcHRzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBub3RpZnlFcnJvcihlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgUGFyc2VzIHRoZSBpc3N1ZXMgcmVwb3J0ZWQgYnkgQ29kZUNsaW1hdGUgQ0xJIHRvIHRoZSBmb3JtYXQgQXRvbUxpbnRlciBleHBlY3RzLlxuICAgKiBAcGFyYW0gICB7U3RyaW5nfSAgIHByb2plY3QgVGhlIGFic29sdXRlIHBhdGggdG8gdGhlIHByb2plY3QgdG8gYW5hbHl6ZS5cbiAgICogQHBhcmFtICAge09iamVjdH0gICByZXN1bHQgIEpTT04gc3RyaW5nIGZyb20gdGhlIENvZGVDbGltYXRlIENMSSBvdXRwdXQgdG8gcGFyc2UuXG4gICAqIEByZXR1cm4gIHtPYmplY3RbXX0gICAgICAgICBQYXJzZWQgaXNzdWVzLCB3aXRoIGZvbGxvd2luZyBrZXlzIHBlciBvYmplY3QgKGFycmF5IGl0ZW0pOlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBkZXNjcmlwdGlvbjogZXhwbGFuYXRpb24gb2YgdGhlIGlzc3VlLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBleGNlcnB0OiBzdW1tYXJ5IG9mIHRoZSBpc3N1ZS5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gbG9jYXRpb246IHsgZmlsZSwgcG9zaXRpb24gfS5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gc2V2ZXJpdHk6IHRoZSBpc3N1ZSBzZXZlcml0eSAob25lIG9mIChpbmZvfHdhcm5pbmd8ZXJyb3IpKS5cbiAgICovXG4gIHBhcnNlSXNzdWVzKHByb2plY3QsIHJlc3VsdCkge1xuICAgIGxldCBtZXNzYWdlcztcblxuICAgIHRyeSB7XG4gICAgICBtZXNzYWdlcyA9IEpTT04ucGFyc2UocmVzdWx0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBub3RpZnlFcnJvcihlLCAnSW52YWxpZCBKU09OIHJldHVybmVkIGZyb20gQ29kZUNsaW1hdGUuIFNlZSB0aGUgQ29uc29sZSBmb3IgZGV0YWlscy4nKTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLmVycm9yKCdJbnZhbGlkIEpTT04gcmV0dXJuZWQgZnJvbSBDb2RlQ2xpbWF0ZTonLCByZXN1bHQpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IGxpbnRlclJlc3VsdHMgPSBbXTtcbiAgICBtZXNzYWdlcy5mb3JFYWNoKChpc3N1ZSkgPT4ge1xuICAgICAgLy8gRXhpdCBlYXJseSBpZiBub3QgYW4gaXNzdWVcbiAgICAgIGlmIChpc3N1ZS50eXBlLnRvTG93ZXJDYXNlKCkgIT09ICdpc3N1ZScpIHJldHVybjtcblxuICAgICAgLy8gRXhpdCBlYXJseSBpZiBkdXBsaWNhdGVkIGlzc3VlXG4gICAgICBpZiAodGhpcy5yZXBvcnRlZFByZXZpb3VzbHkocHJvamVjdCwgaXNzdWUuZmluZ2VycHJpbnQpKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGZpbGUgPSBqb2luKHByb2plY3QsIGlzc3VlLmxvY2F0aW9uLnBhdGgpO1xuICAgICAgY29uc3QgdGV4dEVkaXRvciA9IHRoaXMuZmluZFRleHRFZGl0b3IoZmlsZSk7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IHRleHRFZGl0b3JcbiAgICAgICAgPyBjYWxjUmFuZ2UodGV4dEVkaXRvciwgaXNzdWUubG9jYXRpb24pXG4gICAgICAgIDogZXN0aW1hdGVSYW5nZShpc3N1ZS5sb2NhdGlvbik7XG4gICAgICBjb25zdCBtYXBTZXZlcml0eSA9IHtcbiAgICAgICAgbWFqb3I6ICdlcnJvcicsXG4gICAgICAgIG1pbm9yOiAnd2FybmluZycsXG4gICAgICB9O1xuICAgICAgbGludGVyUmVzdWx0cy5wdXNoKHtcbiAgICAgICAgc2V2ZXJpdHk6IG1hcFNldmVyaXR5W2lzc3VlLnNldmVyaXR5XSB8fCAnd2FybmluZycsXG4gICAgICAgIGV4Y2VycHQ6IGAke2lzc3VlLmVuZ2luZV9uYW1lLnRvVXBwZXJDYXNlKCl9OiAke2lzc3VlLmRlc2NyaXB0aW9ufSBbJHtpc3N1ZS5jaGVja19uYW1lfV1gLFxuICAgICAgICBkZXNjcmlwdGlvbjogKGlzc3VlLmNvbnRlbnQgJiYgaXNzdWUuY29udGVudC5ib2R5KSA/IGlzc3VlLmNvbnRlbnQuYm9keSA6IHVuZGVmaW5lZCxcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZSwgcG9zaXRpb24gfSxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGxpbnRlclJlc3VsdHM7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IENoZWNrcyBpZiB0aGUgcmVwb3J0ZWQgaXNzdWUgaGFzIGJlZW4gcmVwb3J0ZWQgcHJldmlvdXNseSAoZHVwbGljYXRlZCkuXG4gICAqIEBwYXJhbSAgIHtTdHJpbmd9ICBwcm9qZWN0Um9vdCBUaGUgcHJvamVjdCByb290LlxuICAgKiBAcGFyYW0gICB7fVxuICAgKiBAcmV0dXJuICB7Qm9vbGVhbn0gV2hldGhlciB0aGUgaXNzdWUgaXMgZHVwbGljYXRlZCAoYHRydWVgKSBvciBub3QgKGBmYWxzZWApLlxuICAgKiBAdG9kbyAgICBSZW1vdmUgYWZ0ZXIgZml4aW5nIGh0dHBzOi8vZ2l0aHViLmNvbS9waHBtZC9waHBtZC9pc3N1ZXMvNDY3XG4gICAqL1xuICByZXBvcnRlZFByZXZpb3VzbHkocHJvamVjdFJvb3QsIGZpbmdlcnByaW50KSB7XG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5maW5nZXJwcmludHMsIHByb2plY3RSb290KSkge1xuICAgICAgdGhpcy5maW5nZXJwcmludHNbcHJvamVjdFJvb3RdID0gbmV3IFNldCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmZpbmdlcnByaW50c1twcm9qZWN0Um9vdF0uaGFzKGZpbmdlcnByaW50KSkgcmV0dXJuIHRydWU7XG5cbiAgICB0aGlzLmZpbmdlcnByaW50c1twcm9qZWN0Um9vdF0uYWRkKGZpbmdlcnByaW50KTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFJlc2V0cyB0aGUgZmxhZ3MgZm9yIHByb2plY3QgYXQgYHByb2plY3RSb290YC5cbiAgICogQHBhcmFtICAge1N0cmluZ30gcHJvamVjdFJvb3QgVGhlIGFic29sdXRlIHBhdGggdG8gdGhlIHByb2plY3Qgcm9vdC5cbiAgICovXG4gIHJlc2V0KHByb2plY3RSb290KSB7XG4gICAgZGVsZXRlIHRoaXMuZmluZ2VycHJpbnRzW3Byb2plY3RSb290XTtcbiAgICBkZWxldGUgdGhpcy5saW50aW5nW3Byb2plY3RSb290XTtcbiAgfSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNjTGludGVyO1xuIl19