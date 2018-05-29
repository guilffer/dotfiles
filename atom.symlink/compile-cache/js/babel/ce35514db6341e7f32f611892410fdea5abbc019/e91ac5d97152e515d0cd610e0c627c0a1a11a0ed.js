Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.processListItems = processListItems;
exports.showError = showError;
exports.stoppingEvent = stoppingEvent;
var $class = '__$sb_intentions_class';

exports.$class = $class;

function processListItems(suggestions) {
  for (var i = 0, _length = suggestions.length; i < _length; ++i) {
    var suggestion = suggestions[i];
    var className = [];
    if (suggestion['class']) {
      className.push(suggestion['class'].trim());
    }
    if (suggestion.icon) {
      className.push('icon icon-' + suggestion.icon);
    }
    suggestion[$class] = className.join(' ');
  }

  return suggestions.sort(function (a, b) {
    return b.priority - a.priority;
  });
}

function showError(message) {
  var detail = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  if (message instanceof Error) {
    detail = message.stack;
    message = message.message;
  }
  atom.notifications.addError('[Intentions] ' + message, {
    detail: detail,
    dismissable: true
  });
}

function stoppingEvent(callback) {
  return function (event) {
    event.stopImmediatePropagation();
    callback.call(this, event);
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9ndWlsZmZlci8uZG90ZmlsZXMvYXRvbS5zeW1saW5rL3BhY2thZ2VzL2ludGVudGlvbnMvbGliL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBSU8sSUFBTSxNQUFNLEdBQUcsd0JBQXdCLENBQUE7Ozs7QUFFdkMsU0FBUyxnQkFBZ0IsQ0FBQyxXQUE0QixFQUFtQjtBQUM5RSxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsT0FBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzVELFFBQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQyxRQUFNLFNBQVMsR0FBRyxFQUFFLENBQUE7QUFDcEIsUUFBSSxVQUFVLFNBQU0sRUFBRTtBQUNwQixlQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsU0FBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7S0FDeEM7QUFDRCxRQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUU7QUFDbkIsZUFBUyxDQUFDLElBQUksZ0JBQWMsVUFBVSxDQUFDLElBQUksQ0FBRyxDQUFBO0tBQy9DO0FBQ0QsY0FBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7R0FDekM7O0FBRUQsU0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNyQyxXQUFPLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQTtHQUMvQixDQUFDLENBQUE7Q0FDSDs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxPQUF1QixFQUEwQjtNQUF4QixNQUFlLHlEQUFHLElBQUk7O0FBQ3ZFLE1BQUksT0FBTyxZQUFZLEtBQUssRUFBRTtBQUM1QixVQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQTtBQUN0QixXQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQTtHQUMxQjtBQUNELE1BQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxtQkFBaUIsT0FBTyxFQUFJO0FBQ3JELFVBQU0sRUFBTixNQUFNO0FBQ04sZUFBVyxFQUFFLElBQUk7R0FDbEIsQ0FBQyxDQUFBO0NBQ0g7O0FBRU0sU0FBUyxhQUFhLENBQUMsUUFBaUMsRUFBNEI7QUFDekYsU0FBTyxVQUFVLEtBQVksRUFBRTtBQUM3QixTQUFLLENBQUMsd0JBQXdCLEVBQUUsQ0FBQTtBQUNoQyxZQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtHQUMzQixDQUFBO0NBQ0YiLCJmaWxlIjoiL1VzZXJzL2d1aWxmZmVyLy5kb3RmaWxlcy9hdG9tLnN5bWxpbmsvcGFja2FnZXMvaW50ZW50aW9ucy9saWIvaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB0eXBlIHsgTGlzdEl0ZW0gfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgY29uc3QgJGNsYXNzID0gJ19fJHNiX2ludGVudGlvbnNfY2xhc3MnXG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzTGlzdEl0ZW1zKHN1Z2dlc3Rpb25zOiBBcnJheTxMaXN0SXRlbT4pOiBBcnJheTxMaXN0SXRlbT4ge1xuICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gc3VnZ2VzdGlvbnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBzdWdnZXN0aW9uID0gc3VnZ2VzdGlvbnNbaV1cbiAgICBjb25zdCBjbGFzc05hbWUgPSBbXVxuICAgIGlmIChzdWdnZXN0aW9uLmNsYXNzKSB7XG4gICAgICBjbGFzc05hbWUucHVzaChzdWdnZXN0aW9uLmNsYXNzLnRyaW0oKSlcbiAgICB9XG4gICAgaWYgKHN1Z2dlc3Rpb24uaWNvbikge1xuICAgICAgY2xhc3NOYW1lLnB1c2goYGljb24gaWNvbi0ke3N1Z2dlc3Rpb24uaWNvbn1gKVxuICAgIH1cbiAgICBzdWdnZXN0aW9uWyRjbGFzc10gPSBjbGFzc05hbWUuam9pbignICcpXG4gIH1cblxuICByZXR1cm4gc3VnZ2VzdGlvbnMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGIucHJpb3JpdHkgLSBhLnByaW9yaXR5XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93RXJyb3IobWVzc2FnZTogRXJyb3IgfCBzdHJpbmcsIGRldGFpbDogP3N0cmluZyA9IG51bGwpIHtcbiAgaWYgKG1lc3NhZ2UgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIGRldGFpbCA9IG1lc3NhZ2Uuc3RhY2tcbiAgICBtZXNzYWdlID0gbWVzc2FnZS5tZXNzYWdlXG4gIH1cbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBbSW50ZW50aW9uc10gJHttZXNzYWdlfWAsIHtcbiAgICBkZXRhaWwsXG4gICAgZGlzbWlzc2FibGU6IHRydWUsXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wcGluZ0V2ZW50KGNhbGxiYWNrOiAoKGV2ZW50OiBFdmVudCkgPT4gYW55KSk6ICgoZXZlbnQ6IEV2ZW50KSA9PiB2b2lkKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZXZlbnQ6IEV2ZW50KSB7XG4gICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGV2ZW50KVxuICB9XG59XG4iXX0=