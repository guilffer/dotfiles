(function() {
  var SymbolsGeneratorView;

  module.exports = SymbolsGeneratorView = (function() {
    function SymbolsGeneratorView(serializedState) {
      var message;
      this.element = document.createElement('div');
      this.element.classList.add('symbols-generator');
      message = document.createElement('div');
      message.textContent = "The SymbolsGenerator package is Alive! It's ALIVE!";
      message.classList.add('message');
      this.element.appendChild(message);
    }

    SymbolsGeneratorView.prototype.serialize = function() {};

    SymbolsGeneratorView.prototype.destroy = function() {
      return this.element.remove();
    };

    SymbolsGeneratorView.prototype.getElement = function() {
      return this.element;
    };

    return SymbolsGeneratorView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9CQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsOEJBQUMsZUFBRCxHQUFBO0FBRVgsVUFBQSxPQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbkIsQ0FBdUIsbUJBQXZCLENBREEsQ0FBQTtBQUFBLE1BSUEsT0FBQSxHQUFVLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBSlYsQ0FBQTtBQUFBLE1BS0EsT0FBTyxDQUFDLFdBQVIsR0FBc0Isb0RBTHRCLENBQUE7QUFBQSxNQU1BLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbEIsQ0FBc0IsU0FBdEIsQ0FOQSxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsT0FBckIsQ0FQQSxDQUZXO0lBQUEsQ0FBYjs7QUFBQSxtQ0FZQSxTQUFBLEdBQVcsU0FBQSxHQUFBLENBWlgsQ0FBQTs7QUFBQSxtQ0FlQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUEsRUFETztJQUFBLENBZlQsQ0FBQTs7QUFBQSxtQ0FrQkEsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxRQURTO0lBQUEsQ0FsQlosQ0FBQTs7Z0NBQUE7O01BRkYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/guilffer/Code/symbols-generator/lib/symbols-generator-view.coffee