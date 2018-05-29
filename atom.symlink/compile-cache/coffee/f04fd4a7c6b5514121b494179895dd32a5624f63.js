(function() {
  var fs, helpers, path;

  path = require('path');

  fs = require('fs-plus');

  helpers = require('atom-linter');

  describe("linter-codeclimate package", function() {
    var fixturesPath;
    fixturesPath = "";
    beforeEach(function() {
      fixturesPath = path.join(__dirname, 'fixtures');
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-ruby");
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage("linter");
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage("linter-codeclimate");
      });
      waitsForPromise(function() {
        return atom.workspace.open(fixturesPath + '/cool_code.rb');
      });
      return spyOn(helpers, 'exec');
    });
    return describe("with a valid .codeclimate.yml file", function() {
      return it("runs codeclimate-linter on save", function() {
        expect(atom.workspace.getActiveTextEditor().getTitle()).toBe("cool_code.rb");
        expect(atom.workspace.getActiveTextEditor().getGrammar().name).toBe("Ruby");
        return runs(function() {
          var cmd;
          atom.commands.dispatch(atom.views.getView(atom.workspace), "core:save");
          cmd = '/usr/local/bin/codeclimate analyze -f json -e fixme -e rubocop \'cool_code.rb\' < /dev/null';
          return expect(helpers.exec).toHaveBeenCalledWith("/bin/bash", ["-lc", cmd], {
            cwd: fixturesPath
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2d1aWxmZmVyLy5kb3RmaWxlcy9hdG9tLnN5bWxpbmsvcGFja2FnZXMvbGludGVyLWNvZGVjbGltYXRlL3NwZWMvbGludGVyLWNvZGVjbGltYXRlLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlCQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQURMLENBQUE7O0FBQUEsRUFFQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGFBQVIsQ0FGVixDQUFBOztBQUFBLEVBSUEsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUEsR0FBQTtBQUNyQyxRQUFBLFlBQUE7QUFBQSxJQUFBLFlBQUEsR0FBZSxFQUFmLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLFlBQUEsR0FBZSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsVUFBckIsQ0FBZixDQUFBO0FBQUEsTUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixlQUE5QixFQURjO01BQUEsQ0FBaEIsQ0FGQSxDQUFBO0FBQUEsTUFLQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixRQUE5QixFQURjO01BQUEsQ0FBaEIsQ0FMQSxDQUFBO0FBQUEsTUFRQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixvQkFBOUIsRUFEYztNQUFBLENBQWhCLENBUkEsQ0FBQTtBQUFBLE1BV0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsWUFBQSxHQUFlLGVBQW5DLEVBRGM7TUFBQSxDQUFoQixDQVhBLENBQUE7YUFjQSxLQUFBLENBQU0sT0FBTixFQUFlLE1BQWYsRUFmUztJQUFBLENBQVgsQ0FGQSxDQUFBO1dBbUJBLFFBQUEsQ0FBUyxvQ0FBVCxFQUErQyxTQUFBLEdBQUE7YUFDN0MsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUEsR0FBQTtBQUNwQyxRQUFBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBb0MsQ0FBQyxRQUFyQyxDQUFBLENBQVAsQ0FBdUQsQ0FBQyxJQUF4RCxDQUE2RCxjQUE3RCxDQUFBLENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBb0MsQ0FBQyxVQUFyQyxDQUFBLENBQWlELENBQUMsSUFBekQsQ0FBOEQsQ0FBQyxJQUEvRCxDQUFvRSxNQUFwRSxDQURBLENBQUE7ZUFFQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsY0FBQSxHQUFBO0FBQUEsVUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUF2QixFQUEyRCxXQUEzRCxDQUFBLENBQUE7QUFBQSxVQUNBLEdBQUEsR0FBTSw2RkFETixDQUFBO2lCQUVBLE1BQUEsQ0FBTyxPQUFPLENBQUMsSUFBZixDQUFvQixDQUFDLG9CQUFyQixDQUEwQyxXQUExQyxFQUF1RCxDQUFDLEtBQUQsRUFBUSxHQUFSLENBQXZELEVBQXFFO0FBQUEsWUFBQyxHQUFBLEVBQUssWUFBTjtXQUFyRSxFQUhHO1FBQUEsQ0FBTCxFQUhvQztNQUFBLENBQXRDLEVBRDZDO0lBQUEsQ0FBL0MsRUFwQnFDO0VBQUEsQ0FBdkMsQ0FKQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/guilffer/.dotfiles/atom.symlink/packages/linter-codeclimate/spec/linter-codeclimate-spec.coffee
