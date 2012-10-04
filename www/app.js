window.WebTemplate = (function () {
  var WebTemplate = {};
  
  WebTemplate.Model = Backbone.Model.extend({
  });
  
  WebTemplate.View = Backbone.View.extend({
    
    render: function () {
      Backbone.View.prototype.render.call(this);
      return this;
    },
    
    show: function () {
      (this.$el || $(this.el)).show();
    },
    
    hide: function () {
      (this.$el || $(this.el)).hide();
    }
  });

  WebTemplate.ModelView = WebTemplate.View.extend({
    
    initialize: function (options) {
      this.setModel(options.model, { skipRender: true });
      delete options.model;
    },

    observeModelProperties: {
      // "property" : function () { },
      // "property" : "methodName", ...
    },

    setModel: function (model, options) {
      function resolveMethod(method) {
        if (typeof(method) == "string") {
          return this[method];
        }
        return method;
      }
      
      if (this._model) {
        _.each(this.observeModelProperties, function (method, property) {
          method = resolveMethod.call(this, method);
          this._model.off('change:' + property, method, this) 
        }, this);
      }

      this._model = model;

      if (this._model) {
        _.each(this.observeModelProperties, function (method, property) {
          method = resolveMethod.call(this, method);
          this._model.on('change:' + property, method, this) 
        }, this);
      }

      if (!(options || {}).skipRender) this.render();
    },

    remove: function () {
      this.setModel();
      this.__proto__.remove();
    }
  });

  WebTemplate.ListView = WebTemplate.View.extend({
    
    initialize: function (options) {
      this.exampleView = options.exampleView;
      this.setItems(options.items, { skipRender: true });
    },

    setItems: function (model, options) {
      if (this._items) {
        _.each(['add', 'remove', 'reset'], function (e) { 
          this._items.off(e, this.synchronizeViews, this) 
        }, this);
      }
      
      this._items = model;
      
      if (this._items) {
        _.each(['add', 'remove', 'reset'], function (e) { 
          this._items.on(e, this.synchronizeViews, this) 
        }, this);
      }
      
      this._subviews = [];

      if (!(options || {}).skipRender) this.render();
    },

    remove: function () {
      _.each(this._subviews, function (sv) { sv.remove() });
      this._subviews = [];
    },
    
    synchronizeViews: function () {
      _.each(this._subviews, function (sv) { sv.remove() });
      var subviews = this._subviews = [];

      var $el = this.$el || $(this.el);
      $el.empty();
      
      this._items.each(function (m) { 
        var v = new this.exampleView({ model: m });
        subviews.push(v);
        $el.append(v.render().el);
      }, this);
    },

    render: function () {
      this.synchronizeViews();
      return this;
    }
  });

  WebTemplate.TabView = WebTemplate.View.extend({
    
    initialize: function (options) {
      this.model = options.model || new WebTemplate.Model();
      this.model._history = [];
      this.model.on('change:tabName', function (o, v) { this._showTab(v) }, this);
    },
    
    render: function () {
      var $el = this.$el || $(this.el);
      _.each(this.tabs, function (tab) {
        $el.append(tab.render().el);
        tab.hide();
      });
      return this;
    },
    
    showTab: function(tabName, dontRecordCurrentTab) {
      var currentTabName = this.model.get('tabName');
      if (tabName != currentTabName) {
        if (!dontRecordCurrentTab && currentTabName) this.model._history.push(currentTabName);
        this.model.set('tabName', tabName);
      }
    },
    
    showPreviousTab: function () {
      var prev = this.model._history.pop();
      var current = this.model.get('tabName');
      while (prev == current) prev = this.model._history.pop();
      this.model.set({ 'tabName' : prev });
    },
    
    _showTab: function(tabName) {
      
      _.each(this.tabs, function (t) {
        t.hide();
      });

      
      this.$el.removeClass(this.model._tabNameClass);
      var tabNameClass = tabName + '-tab';
      this.$el.addClass(tabNameClass);
      this.model._tabNameClass = tabNameClass;
      
      var tab = this.tabs[tabName];
      tab && tab.show();
    },
  });

  WebTemplate.load = function () {
    $(document.body).html('WebTemplate');
  }

  return WebTemplate;
})();
