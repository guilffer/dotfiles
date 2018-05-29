(function() {
  var CompositeDisposable, SymbolGen, SymbolGenView;

  SymbolGenView = require('./symbol-gen-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = SymbolGen = {
    symbolGenView: null,
    config: {
      DamnField: {
        type: "string",
        "default": "damn value"
      }
    },
    activate: function(state) {
      return this.symbolGenView = new SymbolGenView(state.symbolGenViewState);
    },
    deactivate: function() {
      return this.symbolGenView.destroy();
    },
    serialize: function() {
      return {
        symbolGenViewState: this.symbolGenView.serialize()
      };
    },
    consumeStatusBar: function(statusBar) {
      return this.symbolGenView.consumeStatusBar(statusBar);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZDQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsbUJBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUNDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFERCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQSxHQUNmO0FBQUEsSUFBQSxhQUFBLEVBQWUsSUFBZjtBQUFBLElBQ0EsTUFBQSxFQUNFO0FBQUEsTUFBQSxTQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsWUFEVDtPQURGO0tBRkY7QUFBQSxJQU1BLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUFjLEtBQUssQ0FBQyxrQkFBcEIsRUFEYjtJQUFBLENBTlY7QUFBQSxJQVNBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQURVO0lBQUEsQ0FUWjtBQUFBLElBWUEsU0FBQSxFQUFXLFNBQUEsR0FBQTthQUNUO0FBQUEsUUFBQSxrQkFBQSxFQUFvQixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQWYsQ0FBQSxDQUFwQjtRQURTO0lBQUEsQ0FaWDtBQUFBLElBZUEsZ0JBQUEsRUFBa0IsU0FBQyxTQUFELEdBQUE7YUFDaEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxnQkFBZixDQUFnQyxTQUFoQyxFQURnQjtJQUFBLENBZmxCO0dBSkYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/guilffer/Code/symbol-gen/lib/symbol-gen.coffee