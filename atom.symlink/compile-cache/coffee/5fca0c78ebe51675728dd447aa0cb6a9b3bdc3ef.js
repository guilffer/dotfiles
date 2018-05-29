(function() {
  var CompositeDisposable, SymbolsGenerator, SymbolsGeneratorView;

  SymbolsGeneratorView = require('./symbols-generator-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = SymbolsGenerator = {
    symbolsGeneratorView: null,
    modalPanel: null,
    subscriptions: null,
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
    toggle: function() {
      return console.log('SymbolsGenerator was toggled!');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJEQUFBOztBQUFBLEVBQUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDBCQUFSLENBQXZCLENBQUE7O0FBQUEsRUFDQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGdCQUFBLEdBQ2Y7QUFBQSxJQUFBLG9CQUFBLEVBQXNCLElBQXRCO0FBQUEsSUFDQSxVQUFBLEVBQVksSUFEWjtBQUFBLElBRUEsYUFBQSxFQUFlLElBRmY7QUFBQSxJQUdBLE1BQUEsRUFDRTtBQUFBLE1BQUEsU0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLFlBRFQ7T0FERjtLQUpGO0FBQUEsSUFRQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7YUFDUixJQUFDLENBQUEsb0JBQUQsR0FBNEIsSUFBQSxvQkFBQSxDQUFxQixLQUFLLENBQUMseUJBQTNCLEVBRHBCO0lBQUEsQ0FSVjtBQUFBLElBa0JBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFHVixJQUFDLENBQUEsb0JBQW9CLENBQUMsT0FBdEIsQ0FBQSxFQUhVO0lBQUEsQ0FsQlo7QUFBQSxJQXVCQSxTQUFBLEVBQVcsU0FBQSxHQUFBO2FBQ1Q7QUFBQSxRQUFBLHlCQUFBLEVBQTJCLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxTQUF0QixDQUFBLENBQTNCO1FBRFM7SUFBQSxDQXZCWDtBQUFBLElBMEJBLE1BQUEsRUFBUSxTQUFBLEdBQUE7YUFDTixPQUFPLENBQUMsR0FBUixDQUFZLCtCQUFaLEVBRE07SUFBQSxDQTFCUjtHQUpGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/guilffer/Code/symbols-generator/lib/symbols-generator.coffee