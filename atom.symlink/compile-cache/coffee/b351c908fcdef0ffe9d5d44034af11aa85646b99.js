(function() {
  var SymbolsGeneratorView;

  module.exports = SymbolsGeneratorView = (function() {
    function SymbolsGeneratorView(serializedState) {
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
    }

    SymbolsGeneratorView.prototype.serialize = function() {};

    SymbolsGeneratorView.prototype.destroy = function() {
      return this.element.remove();
    };

    SymbolsGeneratorView.prototype.generate = function() {
      return console.log("generate");
    };

    SymbolsGeneratorView.prototype.purge = function() {
      return console.log("purge");
    };

    return SymbolsGeneratorView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBT0E7QUFBQSxNQUFBLG9CQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsOEJBQUMsZUFBRCxHQUFBO0FBQ1gsTUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLHFCQUFwQyxFQUEyRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxRQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNELENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxrQkFBcEMsRUFBd0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsS0FBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RCxDQURBLENBRFc7SUFBQSxDQUFiOztBQUFBLG1DQUtBLFNBQUEsR0FBVyxTQUFBLEdBQUEsQ0FMWCxDQUFBOztBQUFBLG1DQVFBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBQSxFQURPO0lBQUEsQ0FSVCxDQUFBOztBQUFBLG1DQVdBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFDUixPQUFPLENBQUMsR0FBUixDQUFZLFVBQVosRUFEUTtJQUFBLENBWFYsQ0FBQTs7QUFBQSxtQ0FjQSxLQUFBLEdBQU8sU0FBQSxHQUFBO2FBQ0wsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBREs7SUFBQSxDQWRQLENBQUE7O2dDQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/guilffer/Code/symbols-generator/lib/symbols-generator-view.coffee