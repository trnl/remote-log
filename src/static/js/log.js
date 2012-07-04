var SEVERITY_INFO = 0
var SEVERITY_DEBUG = 1
var SEVERITY_WARNING = 2
var SEVERITY_ERROR = 3

function Log(data) {
	Log.superclass.constructor.apply(this, arguments)
	this.domClass = 'Log'
	var self = this
	
	var severityToClass = function(severity) {
		if(severity == SEVERITY_DEBUG) {
			return 'debug'
		} else if(severity == SEVERITY_WARNING) {
			return 'warning'
		} else if(severity == SEVERITY_ERROR) {
			return 'error'
		} else {
			return 'info'
		}
	}
	
	this.internalHtmlCodeMethod = function(model, mode) {
		return '<div class="'+severityToClass(self.model.severity)+'" >'+ 
		//UIUtils.screenHtml(
			self.model.time + '  ' +self.model.message
		//	)
			+'</div>'
	};
}
extend(Log, Item)

function LogsProvider(itemConstructor) {
	LogsProvider.superclass.constructor.apply(this, arguments)
	var self = this
	var MAX_ITEMS = 150;
	
	this.setItem = function(item) {
		var added = true;
		var newItemIndex = -1;
		var index = _.indexOf(_.pluck(this.items, 'id'), item.id)
		if(index >= 0) {
			if(this.items[index] != item) {
				this.items[index] = item
				added = false;
				newItemIndex = index;
			}
		} else {
			this.items.push(item)
			added = true;
			if(this.items.length > MAX_ITEMS) {
				this.items.shift().remove()
			}
			newItemIndex = this.items.length - 1
		}
		item.registerProvider(this)
		return {'item': item, 'added':added, 'index':newItemIndex}
	}
}
extend(LogsProvider, ItemsProvider)