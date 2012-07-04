var CONTAINER_DISPLAY_MODE_MINIMAL = 999;
var CONTAINER_DISPLAY_MODE_COMPACT = 1000;
var CONTAINER_DISPLAY_MODE_NORMAL = 1001;
var CONTAINER_DISPLAY_MODE_FULL = 1002;
var CONTAINER_DISPLAY_MODE_EXTENDED = 1003;
var CONTAINER_DISPLAY_MODE_EDIT = 1004;

function Container(container_selector) {
	var self = this
	this.selector = container_selector
	this.internalSelector = null
	this.reversed = true
	this.itemsProvider = null
	this.displayMode = CONTAINER_DISPLAY_MODE_NORMAL
	
	this.setupInternalArea = function() {
		var internalClass = ClientUtils.generateGuid()
		self.internalSelector = container_selector+" ."+internalClass
		return internalClass
	}
	this.setupInternalArea()
	
	this.onShown = function() {}
	
	this.getItemsFromProvider = function() {
		return self.itemsProvider.items
	}
	
	this.setupIntoSelector = function() {
		$(self.selector).html( "<div class=\""+this.setupInternalArea()+"\"></div>")
		self.onShown()
		self.update()
	}
	
	this.hide = function() {
		$(self.selector).empty()
	}

	this.update = function() {
		if(this.itemsProvider != null) {
			$(self.internalSelector).html(self.internalHtmlCodeMethod(self.displayMode))
			self.internalSetFunctionalMethod()
		} else {
			$(self.internalSelector).html('')
		}
	}
	this.internalHtmlCodeMethod = function() {
		var listHtml = ''
		_.each(self.getItemsFromProvider(), function(item, index, list) {
			if(self.reversed == true) {
				listHtml = item.htmlCode(self.displayMode) + listHtml
			} else {
				listHtml = listHtml + item.htmlCode(self.displayMode)
			}
		});
		return listHtml
	};
	
	this.addItem = function(item, index) {
		if(index == self.getItemsFromProvider().length - 1) {
			if(self.reversed == true) {
				$(item.htmlCode()).hide().prependTo(self.internalSelector).show(80)
			} else {
				$(item.htmlCode()).hide().appendTo(self.internalSelector).show(80)
			}
			item.setFunctional(self.displayMode)
		}
	}
	
	this.internalSetFunctionalMethod = function() {
		_.each(self.getItemsFromProvider(), function(item, index, list) {	
			item.setFunctional(self.displayMode)
		});
	};
	
	this.setDisplayMode = function (mode) {
		this.displayMode = mode
		this.update()
	}
	this.initWithItemsProvider = function(itemsProvider) {
		this.itemsProvider = itemsProvider
		this.itemsProvider.registerObserver(this)
	};
	
	this.onDataUpdated = function() {
		self.update()
	}
	
	this.onDataAdded = function(item, index) {
		self.addItem(item, index)
	}
}