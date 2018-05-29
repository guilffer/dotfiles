(function() {
  var CompositeDisposable, SymbolsGenerator, SymbolsGeneratorView;

  SymbolsGeneratorView = require('./symbols-generator-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = SymbolsGenerator = {
    symbolsGeneratorView: null,
    config: {
      DamnField: {
        type: "string",
        "default": "damn value"
      }
    },
    activate: function(state) {
      return this.symbolsGeneratorView = new SymbolsGeneratorView(state.symbolsGeneratorViewState);
    },
    deactivate: function() {
      return this.symbolsGeneratorView.destroy();
    },
    serialize: function() {
      return {
        symbolsGeneratorViewState: this.symbolsGeneratorView.serialize()
      };
    },
    consumeStatusBar: function(statusBar) {
      return this.symbolsGeneratorView.consumeStatusBar(statusBar);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJEQUFBOztBQUFBLEVBQUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDBCQUFSLENBQXZCLENBQUE7O0FBQUEsRUFDQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGdCQUFBLEdBQ2Y7QUFBQSxJQUFBLG9CQUFBLEVBQXNCLElBQXRCO0FBQUEsSUFDQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxZQURUO09BREY7S0FGRjtBQUFBLElBTUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBQyxDQUFBLG9CQUFELEdBQTRCLElBQUEsb0JBQUEsQ0FBcUIsS0FBSyxDQUFDLHlCQUEzQixFQURwQjtJQUFBLENBTlY7QUFBQSxJQVNBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsb0JBQW9CLENBQUMsT0FBdEIsQ0FBQSxFQURVO0lBQUEsQ0FUWjtBQUFBLElBWUEsU0FBQSxFQUFXLFNBQUEsR0FBQTthQUNUO0FBQUEsUUFBQSx5QkFBQSxFQUEyQixJQUFDLENBQUEsb0JBQW9CLENBQUMsU0FBdEIsQ0FBQSxDQUEzQjtRQURTO0lBQUEsQ0FaWDtBQUFBLElBZUEsZ0JBQUEsRUFBa0IsU0FBQyxTQUFELEdBQUE7YUFDaEIsSUFBQyxDQUFBLG9CQUFvQixDQUFDLGdCQUF0QixDQUF1QyxTQUF2QyxFQURnQjtJQUFBLENBZmxCO0dBSkYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/guilffer/Code/symbols-generator/lib/symbols-generator.coffee