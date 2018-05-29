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
      this.activate_for_projects((function(_this) {
        return function(activate) {
          if (!activate) {

          }
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

    SymbolsGeneratorView.prototype.activate_for_projects = function(callback) {
      console.log("activate for projects");
      return callback();
    };

    return SymbolsGeneratorView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdDQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLEdBQVIsQ0FGSixDQUFBOztBQUFBLEVBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUMsS0FIakMsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFHUyxJQUFBLDhCQUFDLGVBQUQsR0FBQTtBQUNYLE1BQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxxQkFBcEMsRUFBMkQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsUUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzRCxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0Msa0JBQXBDLEVBQXdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEQsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsUUFBRCxHQUFBO0FBQ3JCLFVBQUEsSUFBQSxDQUFBLFFBQUE7QUFBQTtXQURxQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCLENBRkEsQ0FEVztJQUFBLENBQWI7O0FBQUEsbUNBU0EsU0FBQSxHQUFXLFNBQUEsR0FBQSxDQVRYLENBQUE7O0FBQUEsbUNBWUEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBLEVBRE87SUFBQSxDQVpULENBQUE7O0FBQUEsbUNBZUEsUUFBQSxHQUFVLFNBQUEsR0FBQTthQUNSLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBWixFQURRO0lBQUEsQ0FmVixDQUFBOztBQUFBLG1DQWtCQSxLQUFBLEdBQU8sU0FBQSxHQUFBO2FBQ0wsT0FBTyxDQUFDLEdBQVIsQ0FBWSxPQUFaLEVBREs7SUFBQSxDQWxCUCxDQUFBOztBQUFBLG1DQXFCQSxxQkFBQSxHQUF1QixTQUFDLFFBQUQsR0FBQTtBQUNyQixNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksdUJBQVosQ0FBQSxDQUFBO2FBQ0EsUUFBQSxDQUFBLEVBRnFCO0lBQUEsQ0FyQnZCLENBQUE7O2dDQUFBOztNQVhGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/guilffer/Code/symbols-generator/lib/symbols-generator-view.coffee