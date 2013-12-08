/* http://github.com/jpapillon/jquery.simpleTypeahead */
/* global jQuery, $ */
(function ($) {
  'use strict';

  // Plugin defaults
  var defaultOptions = {
    items: [],
    maxNbMatches: 2,
    mustMatch: true,
    onNoMatchesItem: null,
    onSelect: null
  };

  function SimpleTypeahead(elem, options) {
    this.options = options;

    this.$input = elem;
    this.$results = $('<ul class="typeahead-results"></ul>').hide();
    this.$input.after(this.$results);

    this.setEvents();
  };

  SimpleTypeahead.prototype = {
    constructor: SimpleTypeahead,

    setEvents: function() {
      var self = this;

      this.$results.on("click", ".typeahead-result", function(e) {
        var value = $(e.target).data("value");
        if (self.options.onSelect) {
          self.options.onSelect(value);
        } else {
          self.$input.val(value);
        }
        self.$results.hide();
      });

      // When user clicks on tab
      this.$input.on("keydown", function(e) {
         switch (e.which) {
          case 17: // Control
          case 37: // Left arrow
          case 39: // Right arrow
            break;
          case 38: // Up arrow
          case 40: // Down arrow
            e.preventDefault();
            e.stopPropagation();
            break;
          case 9: // Tab
            if (!self.$results.is(":hidden")) {
              e.preventDefault();
            }
            break;
          case 13: // Enter
            break;
        }
      });

      // When user releases a letter
      this.$input.on("keyup", function(e) {
        switch (e.which) {
          case 17: // Control
          case 37: // Left arrow
          case 39: // Right arrow
            break;
          case 9: // Tab
          case 13: // Enter
            var selectedItem = self.$results.find("li.active");
            if (selectedItem.length > 0) {
              var value = selectedItem.data("value");
              if (self.options.onSelect) {
                self.options.onSelect(value);
              } else {
                self.$input.val(value);
              }
            }
            self.$results.hide();
            e.preventDefault();
            e.stopPropagation();
            break;
          case 38: // Up arrow
            var selectedItem = self.$results.find("li.active");
            if (selectedItem.length > 0) {
              var prevItem = selectedItem.prev("li.typeahead-result");
              if (prevItem.length > 0) {
                prevItem.addClass("active");
              } else {
                self.$results.hide();
              }
              selectedItem.removeClass("active");
            }
            break;
          case 40: // Down arrow
            if (self.$results.is(":hidden")) {
              self.search();
            } else {
              var selectedItem = self.$results.find("li.active");
              if (selectedItem.length > 0) {
                var nextItem = selectedItem.next("li.typeahead-result");
                if (nextItem.length > 0) {
                  selectedItem.removeClass("active");
                  nextItem.addClass("active");
                }
              } else {
                self.$results.find("li").first().addClass("active");
              }
            }
            break;
          default:
            self.$results.hide();
            self.search(self.$input.val());
            break;
        }
      });
    },

    getNoMatchesItem: function(text) {
      var item;
      if (this.options.onNoMatchesItem) {
        item = this.options.onNoMatchesItem(text);
        item.data("value", text);
      } else {
        item = null;
      }
      return item;
    },

    showResults: function(results, text) {
      this.$results.find("li").remove();
      var nbResultsToShow = Math.min(results.length, this.options.maxNbMatches);
      var foundOne = false;
      for (var i = 0; i < nbResultsToShow; i++) {
        var itemInResults = results[i].toLowerCase() === text.toLowerCase();
        foundOne = foundOne || itemInResults;
        var result = $('<li class="typeahead-result' + (itemInResults ? ' active' : '') + '"">' + results[i] + '</li>');
        result.data("value", results[i]);
        this.$results.append(result);
      }

      var highlightedResult = this.$results.find("li.active");
      if (this.options.mustMatch) {
        if (highlightedResult.length === 0) {
          // Highlight first result
          this.$results.find("li").first().addClass("active");
        }
      }

      if (nbResultsToShow < results.length) {
        if (this.options.mustMatch || foundOne) {
          this.$results.append('<li>Type for more...</li>');
        } else if (text !== "") {
          this.$results.append(this.getNoMatchesItem(text));
        }
      } else if (results.length === 0) {
        if (this.options.mustMatch) {
          this.$results.append("<li>No Matches</li>");
        } else if (text !== "") {
          this.$results.append(this.getNoMatchesItem(text));
        }
      }

      this.$results.show();
    },

    sort: function(results, text) {
      return results.sort(function(a, b) {
        return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
      });
    },

    search: function(text) {
      text = text || this.$input.val();
      if (this.options.items.length > 0) {
        var results = $.grep(this.options.items, function(item) {
          return item.toLowerCase().indexOf(text.toLowerCase()) === 0;
        });

        this.showResults(this.sort(results, text), text);
      }
    }
  };

  $.fn.simpleTypeahead = function(arg1, arg2) {
    var self = this;
    var typeahead = $(this).data("typeahead");
    if (!typeahead) {
      var options = $.extend({}, defaultOptions, arg1);
      return this.each(function() {
        var typeahead = new SimpleTypeahead($(this), options);
        $(this).data("typeahead", typeahead);
      });
    } else {
      if (typeahead[arg1]) {
        return typeahead[arg1](arg2);
      }
    }
  };
}(window.jQuery));