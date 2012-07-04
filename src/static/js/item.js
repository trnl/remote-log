var Item = function(data) {
	var self = this
	if(data == null) {
		data = {'id':null}
	}
	this.model = data;
	this.id = data.id;
	this.domClass = 'Item'
	this.providers = []
	this.selector = function() {
		return '.'+this.domClass+'[id="'+this.id+'"]'
	}
	this.registerProvider = function(provider) {
		ClientUtils.setItemInArray(provider, this.providers);
	};
	this.unregisterProvider = function(provider) {
		ClientUtils.removeItemFromArray(provider, this.providers);
	};
	this.remove = function() {
		var item = this
		_.each(item.providers, function(provider, index, list) {
			provider.removeItemByIdOnlyFromThisProvider(item.id)
			item.unregisterProvider(provider);
		});
		$(item.selector()).remove()
		delete item
	}
	this.htmlCode = function(mode) {
		return '<span id="'+this.id+'" class="'+this.domClass+'">'+
				this.internalHtmlCodeMethod(this.model, mode)+'</span>'
	};
	
	this.internalHtmlCodeMethod = function(model, mode) {};
	this.internalSetFunctionalMethod = function(item, element, mode) {};
	
	this.setFunctional = function(mode) {
		var item = this
		this.eachElement(function(element) {
			element.item = item
			element.model = item.model
			item.internalSetFunctionalMethod(item, element, mode)
		})
	};
	
	this.eachElement = function(callback) {
		$(this.selector()).each(function() {
			callback(this)
		});
	}
	
	this.updateModel = function(data, mode) {
		this.model = data
		this.setFunctional(mode)
	}
}

var ItemsProvider = function(itemConstructor) {
	var self = this
	this.model_name = itemConstructor.name
	this.items = []
	
	this.observers = []
	this.registerObserver = function(observer) {
		ClientUtils.setItemInArray(observer, this.observers);
		observer.onDataUpdated()
	};
	
	this.unregisterObserver = function(observer) {
		ClientUtils.removeItemFromArray(observer, this.observers);
	};
	
	this.notifyObserversAboutDataUpdated = function() {
		_.each(self.observers, function(observer, index, list) {
			observer.onDataUpdated()
		});
	}
	
	this.notifyObserversAboutDataAdded = function(item, itemIndex) {
		_.each(self.observers, function(observer, observerIndex, list) {
			observer.onDataAdded(item, itemIndex)
		});
	}
	
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
			newItemIndex = this.items.length
			this.items.push(item)
			added = true;
		}
		item.registerProvider(this)
		return {'item': item, 'added':added, 'index':newItemIndex}
	}
	
	this.setItemByModel = function(model) {
		var item = new itemConstructor(model)
		return this.setItem(item)
	}
	
	this.removeItemById = function(id) {
		var index = _.indexOf(_.pluck(this.items, 'id'), id)
		if(index >= 0) {
			this.items[index].unregisterProvider(this)
			this.items[index].remove()
			this.items.splice(index,1)
		}
	}
	
	this.removeItemByIdOnlyFromThisProvider = function(id) {
		var self = this
		var index = _.indexOf(_.pluck(self.items, 'id'), id)
		if(index >= 0) {
			this.items.splice(index,1)
		}
	}
	
	this.setModelsCollection = function(models_collection) {
		var provider = this
		_.each(models_collection, function(model, index, list) {
			provider.setItemByModel(model)
		});
		this.notifyObserversAboutDataUpdated()
	}
	
	this.clear = function() {
		_.each(self.items, function(item, index, list) {
			item.remove();
		});
		self.items = [];
	}
	
	this.onUpdate = function(model) {
		var itemSetResult = this.setItemByModel(model)
		if(itemSetResult.added == true) {
			this.notifyObserversAboutDataAdded(itemSetResult.item, itemSetResult.index)
		} else {
			this.notifyObserversAboutDataUpdated()
		}
	}
	
	this.onUpdateRemoveId = function(item_id) {
		this.removeItemById(item_id)
		this.notifyObserversAboutDataUpdated()
	}
	DataManager.registerItemsProvider(this)
}
