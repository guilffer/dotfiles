Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _messageElement = require('./message-element');

'use babel';

var Interact = require('interact.js');
var Clipboard = require('clipboard');

var BottomPanel = (function () {
  function BottomPanel(scope) {
    var _this = this;

    _classCallCheck(this, BottomPanel);

    this.subscriptions = new _atom.CompositeDisposable();

    this.visibility = false;
    this.visibleMessages = 0;
    this.alwaysTakeMinimumSpace = atom.config.get('linter.alwaysTakeMinimumSpace');
    this.errorPanelHeight = atom.config.get('linter.errorPanelHeight');
    this.configVisibility = atom.config.get('linter.showErrorPanel');
    this.scope = scope;
    this.editorMessages = new Map();
    this.messages = new Map();

    var element = document.createElement('linter-panel'); // TODO(steelbrain): Make this a `div`
    element.tabIndex = '-1';
    this.messagesElement = document.createElement('div');
    element.appendChild(this.messagesElement);
    this.panel = atom.workspace.addBottomPanel({ item: element, visible: false, priority: 500 });
    Interact(element).resizable({ edges: { top: true } }).on('resizemove', function (event) {
      event.target.style.height = event.rect.height + 'px';
    }).on('resizeend', function (event) {
      atom.config.set('linter.errorPanelHeight', event.target.clientHeight);
    });
    element.addEventListener('keydown', function (e) {
      if (e.which === 67 && e.ctrlKey) {
        Clipboard.writeText(getSelection().toString());
      }
    });

    this.subscriptions.add(atom.config.onDidChange('linter.alwaysTakeMinimumSpace', function (_ref) {
      var newValue = _ref.newValue;

      _this.alwaysTakeMinimumSpace = newValue;
      _this.updateHeight();
    }));

    this.subscriptions.add(atom.config.onDidChange('linter.errorPanelHeight', function (_ref2) {
      var newValue = _ref2.newValue;

      _this.errorPanelHeight = newValue;
      _this.updateHeight();
    }));

    this.subscriptions.add(atom.config.onDidChange('linter.showErrorPanel', function (_ref3) {
      var newValue = _ref3.newValue;

      _this.configVisibility = newValue;
      _this.updateVisibility();
    }));

    this.subscriptions.add(atom.workspace.observeActivePaneItem(function (paneItem) {
      _this.paneVisibility = paneItem === atom.workspace.getActiveTextEditor();
      _this.updateVisibility();
    }));

    // Container for messages with no filePath
    var defaultContainer = document.createElement('div');
    this.editorMessages.set(null, defaultContainer);
    this.messagesElement.appendChild(defaultContainer);
    if (scope !== 'Project') {
      defaultContainer.setAttribute('hidden', true);
    }
  }

  _createClass(BottomPanel, [{
    key: 'setMessages',
    value: function setMessages(_ref4) {
      var _this2 = this;

      var added = _ref4.added;
      var removed = _ref4.removed;

      if (removed.length) {
        this.removeMessages(removed);
      }
      if (added.length) {
        (function () {
          var activeFile = atom.workspace.getActiveTextEditor();
          activeFile = activeFile ? activeFile.getPath() : undefined;
          added.forEach(function (message) {
            if (!_this2.editorMessages.has(message.filePath)) {
              var container = document.createElement('div');
              _this2.editorMessages.set(message.filePath, container);
              _this2.messagesElement.appendChild(container);
              if (!(_this2.scope === 'Project' || activeFile === message.filePath)) {
                container.setAttribute('hidden', true);
              }
            }
            var messageElement = _messageElement.Message.fromMessage(message);
            _this2.messages.set(message, messageElement);
            _this2.editorMessages.get(message.filePath).appendChild(messageElement);
            if (messageElement.updateVisibility(_this2.scope).visibility) {
              _this2.visibleMessages++;
            }
          });
        })();
      }

      this.editorMessages.forEach(function (child, key) {
        // Never delete the default container
        if (key !== null && !child.childNodes.length) {
          child.remove();
          _this2.editorMessages['delete'](key);
        }
      });

      this.updateVisibility();
    }
  }, {
    key: 'removeMessages',
    value: function removeMessages(messages) {
      var _this3 = this;

      messages.forEach(function (message) {
        var messageElement = _this3.messages.get(message);
        _this3.messages['delete'](message);
        messageElement.remove();
        if (messageElement.visibility) {
          _this3.visibleMessages--;
        }
      });
    }
  }, {
    key: 'refresh',
    value: function refresh(scope) {
      var _this4 = this;

      if (scope) {
        this.scope = scope;
      } else scope = this.scope;
      this.visibleMessages = 0;

      this.messages.forEach(function (messageElement) {
        if (messageElement.updateVisibility(scope).visibility && scope === 'Line') {
          _this4.visibleMessages++;
        }
      });

      if (scope === 'File') {
        (function () {
          var activeFile = atom.workspace.getActiveTextEditor();
          activeFile = activeFile ? activeFile.getPath() : undefined;
          _this4.editorMessages.forEach(function (messagesElement, filePath) {
            if (filePath === activeFile) {
              messagesElement.removeAttribute('hidden');
              _this4.visibleMessages = messagesElement.childNodes.length;
            } else messagesElement.setAttribute('hidden', true);
          });
        })();
      } else if (scope === 'Project') {
        this.visibleMessages = this.messages.size;
        this.editorMessages.forEach(function (messageElement) {
          messageElement.removeAttribute('hidden');
        });
      }

      this.updateVisibility();
    }
  }, {
    key: 'updateHeight',
    value: function updateHeight() {
      var height = this.errorPanelHeight;

      if (this.alwaysTakeMinimumSpace) {
        // Add `1px` for the top border.
        height = Math.min(this.messagesElement.clientHeight + 1, height);
      }

      this.messagesElement.parentNode.style.height = height + 'px';
    }
  }, {
    key: 'getVisibility',
    value: function getVisibility() {
      return this.visibility;
    }
  }, {
    key: 'updateVisibility',
    value: function updateVisibility() {
      this.visibility = this.configVisibility && this.paneVisibility && this.visibleMessages > 0;

      if (this.visibility) {
        this.panel.show();
        this.updateHeight();
      } else {
        this.panel.hide();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
      this.messages.clear();
      try {
        this.panel.destroy();
      } catch (err) {
        // Atom fails weirdly sometimes when doing this
      }
    }
  }]);

  return BottomPanel;
})();

exports['default'] = BottomPanel;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9ndWlsZmZlci8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL2xpbnRlci9saWIvdWkvYm90dG9tLXBhbmVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUlrQyxNQUFNOzs4QkFDbEIsbUJBQW1COztBQUx6QyxXQUFXLENBQUE7O0FBRVgsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ3ZDLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQTs7SUFJakIsV0FBVztBQUNuQixXQURRLFdBQVcsQ0FDbEIsS0FBSyxFQUFFOzs7MEJBREEsV0FBVzs7QUFFNUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBdUIsQ0FBQTs7QUFFNUMsUUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUE7QUFDdkIsUUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUE7QUFDeEIsUUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUE7QUFDOUUsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUE7QUFDbEUsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUE7QUFDaEUsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQy9CLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTs7QUFFekIsUUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUN0RCxXQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtBQUN2QixRQUFJLENB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QUcsSUFBSSxDQUFDLGdCQUFnQixDQUFBOztBQUVsQyxVQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRTs7QUFFL0IsY0FBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFBO09BQ2pFOztBQUVELFVBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQU0sTUFBTSxPQUFJLENBQUE7S0FDN0Q7OztXQUNZLHlCQUFHO0FBQ2QsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFBO0tBQ3ZCOzs7V0FDZSw0QkFBRztBQUNqQixVQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFBOztBQUUxRixVQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDbkIsWUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNqQixZQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7T0FDcEIsTUFBTTtBQUNMLFlBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7T0FDbEI7S0FDRjs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzVCLFVBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDckIsVUFBSTtBQUNGLFlBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDckIsQ0FBQyxPQUFPLEdBQUcsRUFBRTs7T0FFYjtLQUNGOzs7U0FyS2tCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6Ii9Vc2Vycy9ndWlsZmZlci8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL2xpbnRlci9saWIvdWkvYm90dG9tLXBhbmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuY29uc3QgSW50ZXJhY3QgPSByZXF1aXJlKCdpbnRlcmFjdC5qcycpXG5jb25zdCBDbGlwYm9hcmQgPSByZXF1aXJlKCdjbGlwYm9hcmQnKVxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHtNZXNzYWdlfSBmcm9tICcuL21lc3NhZ2UtZWxlbWVudCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQm90dG9tUGFuZWwge1xuICBjb25zdHJ1Y3RvcihzY29wZSkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICB0aGlzLnZpc2liaWxpdHkgPSBmYWxzZVxuICAgIHRoaXMudmlzaWJsZU1lc3NhZ2VzID0gMFxuICAgIHRoaXMuYWx3YXlzVGFrZU1pbmltdW1TcGFjZSA9IGF0b20uY29uZmlnLmdldCgnbGludGVyLmFsd2F5c1Rha2VNaW5pbXVtU3BhY2UnKVxuICAgIHRoaXMuZXJyb3JQYW5lbEhlaWdodCA9IGF0b20uY29uZmlnLmdldCgnbGludGVyLmVycm9yUGFuZWxIZWlnaHQnKVxuICAgIHRoaXMuY29uZmlnVmlzaWJpbGl0eSA9IGF0b20uY29uZmlnLmdldCgnbGludGVyLnNob3dFcnJvclBhbmVsJylcbiAgICB0aGlzLnNjb3BlID0gc2NvcGVcbiAgICB0aGlzLmVkaXRvck1lc3NhZ2VzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5tZXNzYWdlcyA9IG5ldyBNYXAoKVxuXG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbnRlci1wYW5lbCcpIC8vIFRPRE8oc3RlZWxicmFpbik6IE1ha2UgdGhpcyBhIGBkaXZgXG4gICAgZWxlbWVudC50YWJJbmRleCA9ICctMSdcbiAgICB0aGlzLm1lc3NhZ2VzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLm1lc3NhZ2VzRWxlbWVudClcbiAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoe2l0ZW06IGVsZW1lbnQsIHZpc2libGU6IGZhbHNlLCBwcmlvcml0eTogNTAwfSlcbiAgICBJbnRlcmFjdChlbGVtZW50KS5yZXNpemFibGUoe2VkZ2VzOiB7dG9wOiB0cnVlfX0pXG4gICAgICAub24oJ3Jlc2l6ZW1vdmUnLCBldmVudCA9PiB7XG4gICAgICAgIGV2ZW50LnRhcmdldC5zdHlsZS5oZWlnaHQgPSBgJHtldmVudC5yZWN0LmhlaWdodH1weGBcbiAgICAgIH0pXG4gICAgICAub24oJ3Jlc2l6ZWVuZCcsIGV2ZW50ID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIuZXJyb3JQYW5lbEhlaWdodCcsIGV2ZW50LnRhcmdldC5jbGllbnRIZWlnaHQpXG4gICAgICB9KVxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChlLndoaWNoID09PSA2NyAmJiBlLmN0cmxLZXkpIHtcbiAgICAgICAgQ2xpcGJvYXJkLndyaXRlVGV4dChnZXRTZWxlY3Rpb24oKS50b1N0cmluZygpKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdsaW50ZXIuYWx3YXlzVGFrZU1pbmltdW1TcGFjZScsICh7bmV3VmFsdWV9KSA9PiB7XG4gICAgICB0aGlzLmFsd2F5c1Rha2VNaW5pbXVtU3BhY2UgPSBuZXdWYWx1ZVxuICAgICAgdGhpcy51cGRhdGVIZWlnaHQoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnbGludGVyLmVycm9yUGFuZWxIZWlnaHQnLCAoe25ld1ZhbHVlfSkgPT4ge1xuICAgICAgdGhpcy5lcnJvclBhbmVsSGVpZ2h0ID0gbmV3VmFsdWVcbiAgICAgIHRoaXMudXBkYXRlSGVpZ2h0KClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2xpbnRlci5zaG93RXJyb3JQYW5lbCcsICh7bmV3VmFsdWV9KSA9PiB7XG4gICAgICB0aGlzLmNvbmZpZ1Zpc2liaWxpdHkgPSBuZXdWYWx1ZVxuICAgICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5KClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtKHBhbmVJdGVtID0+IHtcbiAgICAgIHRoaXMucGFuZVZpc2liaWxpdHkgPSBwYW5lSXRlbSA9PT0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHkoKVxuICAgIH0pKVxuXG4gICAgLy8gQ29udGFpbmVyIGZvciBtZXNzYWdlcyB3aXRoIG5vIGZpbGVQYXRoXG4gICAgY29uc3QgZGVmYXVsdENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5lZGl0b3JNZXNzYWdlcy5zZXQobnVsbCwgZGVmYXVsdENvbnRhaW5lcilcbiAgICB0aGlzLm1lc3NhZ2VzRWxlbWVudC5hcHBlbmRDaGlsZChkZWZhdWx0Q29udGFpbmVyKVxuICAgIGlmIChzY29wZSAhPT0gJ1Byb2plY3QnKSB7XG4gICAgICBkZWZhdWx0Q29udGFpbmVyLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgdHJ1ZSlcbiAgICB9XG4gIH1cbiAgc2V0TWVzc2FnZXMoe2FkZGVkLCByZW1vdmVkfSkge1xuICAgIGlmIChyZW1vdmVkLmxlbmd0aCkge1xuICAgICAgdGhpcy5yZW1vdmVNZXNzYWdlcyhyZW1vdmVkKVxuICAgIH1cbiAgICBpZiAoYWRkZWQubGVuZ3RoKSB7XG4gICAgICBsZXQgYWN0aXZlRmlsZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgYWN0aXZlRmlsZSA9IGFjdGl2ZUZpbGUgPyBhY3RpdmVGaWxlLmdldFBhdGgoKSA6IHVuZGVmaW5lZFxuICAgICAgYWRkZWQuZm9yRWFjaChtZXNzYWdlID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmVkaXRvck1lc3NhZ2VzLmhhcyhtZXNzYWdlLmZpbGVQYXRoKSkge1xuICAgICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICAgdGhpcy5lZGl0b3JNZXNzYWdlcy5zZXQobWVzc2FnZS5maWxlUGF0aCwgY29udGFpbmVyKVxuICAgICAgICAgIHRoaXMubWVzc2FnZXNFbGVtZW50LmFwcGVuZENoaWxkKGNvbnRhaW5lcilcbiAgICAgICAgICBpZiAoISh0aGlzLnNjb3BlID09PSAnUHJvamVjdCcgfHwgYWN0aXZlRmlsZSA9PT0gbWVzc2FnZS5maWxlUGF0aCkpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsIHRydWUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VFbGVtZW50ID0gTWVzc2FnZS5mcm9tTWVzc2FnZShtZXNzYWdlKVxuICAgICAgICB0aGlzLm1lc3NhZ2VzLnNldChtZXNzYWdlLCBtZXNzYWdlRWxlbWVudClcbiAgICAgICAgdGhpcy5lZGl0b3JNZXNzYWdlcy5nZXQobWVzc2FnZS5maWxlUGF0aCkuYXBwZW5kQ2hpbGQobWVzc2FnZUVsZW1lbnQpXG4gICAgICAgIGlmIChtZXNzYWdlRWxlbWVudC51cGRhdGVWaXNpYmlsaXR5KHRoaXMuc2NvcGUpLnZpc2liaWxpdHkpIHtcbiAgICAgICAgICB0aGlzLnZpc2libGVNZXNzYWdlcysrXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5lZGl0b3JNZXNzYWdlcy5mb3JFYWNoKChjaGlsZCwga2V5KSA9PiB7XG4gICAgICAvLyBOZXZlciBkZWxldGUgdGhlIGRlZmF1bHQgY29udGFpbmVyXG4gICAgICBpZiAoa2V5ICE9PSBudWxsICYmICFjaGlsZC5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICBjaGlsZC5yZW1vdmUoKVxuICAgICAgICB0aGlzLmVkaXRvck1lc3NhZ2VzLmRlbGV0ZShrZXkpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eSgpXG4gIH1cbiAgcmVtb3ZlTWVzc2FnZXMobWVzc2FnZXMpIHtcbiAgICBtZXNzYWdlcy5mb3JFYWNoKG1lc3NhZ2UgPT4ge1xuICAgICAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSB0aGlzLm1lc3NhZ2VzLmdldChtZXNzYWdlKVxuICAgICAgdGhpcy5tZXNzYWdlcy5kZWxldGUobWVzc2FnZSlcbiAgICAgIG1lc3NhZ2VFbGVtZW50LnJlbW92ZSgpXG4gICAgICBpZiAobWVzc2FnZUVsZW1lbnQudmlzaWJpbGl0eSkge1xuICAgICAgICB0aGlzLnZpc2libGVNZXNzYWdlcy0tXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICByZWZyZXNoKHNjb3BlKSB7XG4gICAgaWYgKHNjb3BlKSB7XG4gICAgICB0aGlzLnNjb3BlID0gc2NvcGVcbiAgICB9IGVsc2Ugc2NvcGUgPSB0aGlzLnNjb3BlXG4gICAgdGhpcy52aXNpYmxlTWVzc2FnZXMgPSAwXG5cbiAgICB0aGlzLm1lc3NhZ2VzLmZvckVhY2gobWVzc2FnZUVsZW1lbnQgPT4ge1xuICAgICAgaWYgKG1lc3NhZ2VFbGVtZW50LnVwZGF0ZVZpc2liaWxpdHkoc2NvcGUpLnZpc2liaWxpdHkgJiYgc2NvcGUgPT09ICdMaW5lJykge1xuICAgICAgICB0aGlzLnZpc2libGVNZXNzYWdlcysrXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmIChzY29wZSA9PT0gJ0ZpbGUnKSB7XG4gICAgICBsZXQgYWN0aXZlRmlsZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgYWN0aXZlRmlsZSA9IGFjdGl2ZUZpbGUgPyBhY3RpdmVGaWxlLmdldFBhdGgoKSA6IHVuZGVmaW5lZFxuICAgICAgdGhpcy5lZGl0b3JNZXNzYWdlcy5mb3JFYWNoKChtZXNzYWdlc0VsZW1lbnQsIGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIGlmIChmaWxlUGF0aCA9PT0gYWN0aXZlRmlsZSkge1xuICAgICAgICAgIG1lc3NhZ2VzRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpXG4gICAgICAgICAgdGhpcy52aXNpYmxlTWVzc2FnZXMgPSBtZXNzYWdlc0VsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGhcbiAgICAgICAgfSBlbHNlIG1lc3NhZ2VzRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsIHRydWUpXG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAoc2NvcGUgPT09ICdQcm9qZWN0Jykge1xuICAgICAgdGhpcy52aXNpYmxlTWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzLnNpemVcbiAgICAgIHRoaXMuZWRpdG9yTWVzc2FnZXMuZm9yRWFjaChtZXNzYWdlRWxlbWVudCA9PiB7XG4gICAgICAgIG1lc3NhZ2VFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJylcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5KClcbiAgfVxuICB1cGRhdGVIZWlnaHQoKSB7XG4gICAgbGV0IGhlaWdodCA9IHRoaXMuZXJyb3JQYW5lbEhlaWdodFxuXG4gICAgaWYgKHRoaXMuYWx3YXlzVGFrZU1pbmltdW1TcGFjZSkge1xuICAgICAgLy8gQWRkIGAxcHhgIGZvciB0aGUgdG9wIGJvcmRlci5cbiAgICAgIGhlaWdodCA9IE1hdGgubWluKHRoaXMubWVzc2FnZXNFbGVtZW50LmNsaWVudEhlaWdodCArIDEsIGhlaWdodClcbiAgICB9XG5cbiAgICB0aGlzLm1lc3NhZ2VzRWxlbWVudC5wYXJlbnROb2RlLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGBcbiAgfVxuICBnZXRWaXNpYmlsaXR5KCkge1xuICAgIHJldHVybiB0aGlzLnZpc2liaWxpdHlcbiAgfVxuICB1cGRhdGVWaXNpYmlsaXR5KCkge1xuICAgIHRoaXMudmlzaWJpbGl0eSA9IHRoaXMuY29uZmlnVmlzaWJpbGl0eSAmJiB0aGlzLnBhbmVWaXNpYmlsaXR5ICYmIHRoaXMudmlzaWJsZU1lc3NhZ2VzID4gMFxuXG4gICAgaWYgKHRoaXMudmlzaWJpbGl0eSkge1xuICAgICAgdGhpcy5wYW5lbC5zaG93KClcbiAgICAgIHRoaXMudXBkYXRlSGVpZ2h0KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wYW5lbC5oaWRlKClcbiAgICB9XG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5tZXNzYWdlcy5jbGVhcigpXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMucGFuZWwuZGVzdHJveSgpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBBdG9tIGZhaWxzIHdlaXJkbHkgc29tZXRpbWVzIHdoZW4gZG9pbmcgdGhpc1xuICAgIH1cbiAgfVxufVxuIl19
//# sourceURL=/Users/guilffer/.dotfiles/atom.symlink/packages/linter/lib/ui/bottom-panel.js
