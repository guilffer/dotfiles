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
      this.symbolsGeneratorView = new SymbolsGeneratorView(state.symbolsGeneratorViewState);
      this.modalPanel = atom.workspace.addModalPanel({
        item: this.symbolsGeneratorView.getElement(),
        visible: false
      });
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'symbols-generator:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      this.modalPanel.destroy();
      this.subscriptions.dispose();
      return this.symbolsGeneratorView.destroy();
    },
    serialize: function() {
      return {
        symbolsGeneratorViewState: this.symbolsGeneratorView.serialize()
      };
    },
    toggle: function() {
      console.log('SymbolsGenerator was toggled!');
      if (this.modalPanel.isVisible()) {
        return this.modalPanel.hide();
      } else {
        return this.modalPanel.show();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJEQUFBOztBQUFBLEVBQUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDBCQUFSLENBQXZCLENBQUE7O0FBQUEsRUFDQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGdCQUFBLEdBQ2Y7QUFBQSxJQUFBLG9CQUFBLEVBQXNCLElBQXRCO0FBQUEsSUFDQSxVQUFBLEVBQVksSUFEWjtBQUFBLElBRUEsYUFBQSxFQUFlLElBRmY7QUFBQSxJQUdBLE1BQUEsRUFDRTtBQUFBLE1BQUEsU0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLFlBRFQ7T0FERjtLQUpGO0FBQUEsSUFRQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxvQkFBRCxHQUE0QixJQUFBLG9CQUFBLENBQXFCLEtBQUssQ0FBQyx5QkFBM0IsQ0FBNUIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsb0JBQW9CLENBQUMsVUFBdEIsQ0FBQSxDQUFOO0FBQUEsUUFBMEMsT0FBQSxFQUFTLEtBQW5EO09BQTdCLENBRGQsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUpqQixDQUFBO2FBT0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7QUFBQSxRQUFBLDBCQUFBLEVBQTRCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCO09BQXBDLENBQW5CLEVBUlE7SUFBQSxDQVJWO0FBQUEsSUFrQkEsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsb0JBQW9CLENBQUMsT0FBdEIsQ0FBQSxFQUhVO0lBQUEsQ0FsQlo7QUFBQSxJQXVCQSxTQUFBLEVBQVcsU0FBQSxHQUFBO2FBQ1Q7QUFBQSxRQUFBLHlCQUFBLEVBQTJCLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxTQUF0QixDQUFBLENBQTNCO1FBRFM7SUFBQSxDQXZCWDtBQUFBLElBMEJBLE1BQUEsRUFBUSxTQUFBLEdBQUE7QUFDTixNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksK0JBQVosQ0FBQSxDQUFBO0FBRUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBWixDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFBLEVBSEY7T0FITTtJQUFBLENBMUJSO0dBSkYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/guilffer/Code/symbols-generator/lib/symbols-generator.coffee