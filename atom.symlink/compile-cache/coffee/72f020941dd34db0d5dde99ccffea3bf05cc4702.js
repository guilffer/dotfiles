(function() {
  var Q, SymbolsGeneratorView, fs, path, spawn;

  path = require('path');

  fs = require('fs');

  Q = require('q');

  spawn = require('child_process').spawn;

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdDQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLEdBQVIsQ0FGSixDQUFBOztBQUFBLEVBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUMsS0FIakMsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLDhCQUFDLGVBQUQsR0FBQTtBQUNYLE1BQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxxQkFBcEMsRUFBMkQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsUUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzRCxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0Msa0JBQXBDLEVBQXdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEQsQ0FEQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSxtQ0FLQSxTQUFBLEdBQVcsU0FBQSxHQUFBLENBTFgsQ0FBQTs7QUFBQSxtQ0FRQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUEsRUFETztJQUFBLENBUlQsQ0FBQTs7QUFBQSxtQ0FXQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQ1IsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFaLEVBRFE7SUFBQSxDQVhWLENBQUE7O0FBQUEsbUNBY0EsS0FBQSxHQUFPLFNBQUEsR0FBQTthQUNMLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWixFQURLO0lBQUEsQ0FkUCxDQUFBOztnQ0FBQTs7TUFURixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/guilffer/Code/symbols-generator/lib/symbols-generator-view.coffee