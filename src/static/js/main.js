var UpdatesUtils = {
	checkValue : null,
	channelName : null,
	
	openChannel : function() {
	  $('#wcs-iframe').remove() //remove old iframe used for interaction with server
	  if(document.channel != null) {
		document.socket.close();
		document.channel = null;
	  }
	  var token = document.channel_token;
	  document.channel = new goog.appengine.Channel(token);
	  var handler = {
	    'onopen': UpdatesUtils.onOpened,
	    'onmessage': UpdatesUtils.onMessage,
	    'onerror': function() {},
	    'onclose': function() {}
	  };
	  document.socket = document.channel.open(handler);
	},
	
	onOpened : function() {
		
	},
	
	onMessage : function(m) {
		update = eval('('+m.data+')')
		//console.log('channel val received '+update.data+' '+UpdatesUtils.checkValue)
	  if(update.data != null && update.data != undefined && update.data == UpdatesUtils.checkValue) {
	  	UpdatesUtils.checkValue = null;
	  } else {
	  	DataManager.onUpdate(update)
	  }
	},

	onUpdateBalance : function() {
	  	ServerInteractionUtils.getBalanceFromServer(function(balance, recent_units) {
	  		UIUtils.setBalance(balance)
	  		ClientUtils.getCurrentUser().recent_units = recent_units
	  	});
	},
	
	channelOpenLoop : function() {
		UpdatesUtils.openChannel();
		setTimeout(UpdatesUtils.checkChannel, 30000);
	},
	
	checkChannelValue : function() {
		console.log('check value '+UpdatesUtils.checkValue)
		if(UpdatesUtils.checkValue != null) {
			console.log('reopening channel')
			UpdatesUtils.openChannel()
		}
	},

	checkChannel : function() {
		if(document.channel != null) {
			UpdatesUtils.checkValue = ''+Math.random()
			ClientUtils.fetch('/api?op=check_channel&val='+UpdatesUtils.checkValue+'&channel='+UpdatesUtils.channelName,
			 function(res) {
				setTimeout(UpdatesUtils.checkChannelValue, 5000);
			});
			setTimeout(UpdatesUtils.checkChannel, 30000);
		}
	}
}

var DataManager = {
	itemsProviders : [],
	
	registerItemsProvider : function(provider) {
		if(!_.include(DataManager.itemsProviders, provider)) {
			DataManager.itemsProviders.push(provider)
		}
	},
	
	onUpdateSet : function(update) {
		_.each(DataManager.itemsProviders, function(itemProvider, index, list) {
			if(itemProvider.model_name == 'Log') {
				itemProvider.onUpdate(update)
			}
		});
	},
	
	onUpdateRemove : function(update) {
		_.each(DataManager.itemsProviders, function(itemProvider, index, list) {
			itemProvider.onUpdateRemoveId(update.related_item_id)
		});
	},
	
	onUpdate : function(update) {
		if(update.type == 'event') {
	      DataManager.onUpdateSet(update)
	    } else if(update.type == 'event_remove') {
	      DataManager.onUpdateRemove(update)
	    }
	}
}

var Application = {
	PAGE_LOGS : 2004,
	PAGE_INSTANCES : 2005,
	
	initialized : false,
	currentPage : null,
	
	checkInstancesTimeout : null,
	
	init : function(callback) {
		if(!Application.initialized) {
			document.channel = null;
			document.socket = null;
			Application.logProvider = new LogsProvider(Log)
			Application.instancesProvider = new ItemsProvider(Instance)
			
			Application.currentInstanceProvider = new ItemsProvider(Instance)
			Application.currentInstanceView = new Container('#static_area')
			Application.currentInstanceView.setDisplayMode(CONTAINER_DISPLAY_MODE_MINIMAL)
			Application.currentInstanceView.initWithItemsProvider(Application.currentInstanceProvider)
		    Application.initialized = true
   			callback()
	   }
	},
	
	openInstanceLog : function(instance) {
		if(Application.checkInstancesTimeout != null) {
			clearTimeout(Application.checkInstancesTimeout);
		}
		ServerInteractionUtils.getChannelAndChannelTokenForInstance(instance.id, function(channel_token) {
			Application.currentInstanceProvider.setItemByModel(instance)
			Application.currentInstanceView.setupIntoSelector()
			document.channel_token = channel_token;
			UpdatesUtils.channelName = instance.id
			UpdatesUtils.channelOpenLoop();
			Application.setPage(Application.PAGE_LOGS);
		});
	},
	
	setPage : function(page_type) {
		Application.currentPage = page_type
		var windowHash = ''
		var activeLinkSelector = ''
		if(page_type == Application.PAGE_LOGS) {
				if(Application.logView == null) {
				  	Application.logView = new Container('#content')
				  	Application.logView.initWithItemsProvider(Application.logProvider)
				}
				
				instance = Application.currentInstanceProvider.items[0].model
				windowHash = '#' + instance.id
				document.title = instance.app + ' on ' + instance.device
				Application.logProvider.clear()
				Application.logView.setupIntoSelector()
		} else if(page_type == Application.PAGE_INSTANCES) {
			if(Application.instancesView == null) {
			  	Application.instancesView = new Container('#content')
			  	Application.instancesView.initWithItemsProvider(Application.instancesProvider)
			}
			windowHash = '#instances'
			document.title = 'Running instances list'
			if(document.channel != null) {
				document.socket.close();
				document.channel = null;
			}
			Application.instancesProvider.clear()
			Application.currentInstanceProvider.clear()
			
			var checkInstances = function() {
				ServerInteractionUtils.getRecentInstances(function(instances) {
					Application.instancesProvider.setModelsCollection(instances)
					if(Application.instancesProvider.items.length > 0) {
						$('#static_area').html('Choose one of the running applications to see log');
					} else {
						$('#static_area').html('No running applications detected');
					}
					Application.instancesView.setupIntoSelector()
				});
				Application.checkInstancesTimeout = setTimeout(checkInstances, 10000);
			}
			
			checkInstances();
		}
  		window.location.assign(windowHash)
	},
	
	initPage : function(page_type) {
		Application.init(function() {
			Application.setPage(page_type)
		});
	},
	
	initPageByAddress : function() {
		var hash = window.location.hash
		if(hash != '' && hash != '#' && hash != '#instances') {
			Application.init(function() {
				ServerInteractionUtils.getInstanceByInstanceId(hash.substr(1), function(instance) {
					if(instance != null) {
						Application.openInstanceLog(instance)
					} else {
						Application.setPage(Application.PAGE_INSTANCES);
					}
				});
			});
		} else {
			Application.initPage(Application.PAGE_INSTANCES)
		}
	}	
}

var ServerInteractionUtils = {
	getRecentInstances : function(callback) {
		$.getJSON('/api?op=recent_instances', function(res) {
			callback(res)
		});
	},
	
	getChannelAndChannelTokenForInstance : function(instance_id, callback) {
		$.getJSON('/api?op=request_channel&instance_id='+instance_id, function(res) {
			callback(res.channel_token)
		});
	},
	
	getInstanceByInstanceId : function(instance_id, callback) {
		$.getJSON('/api?op=instance_by_id&id='+instance_id, function(res) {
			if(res.id == '') {
				callback(null)
			} else {
				callback(res)
			}
		});
	}
}

var ClientUtils = {
	fetch : function(url, callback) {
	  $.get(url, {}, callback)
	},
	
	setItemInArray : function(item, array) {
		if(array == null) {array = []}
		var index = _.indexOf(array, item)
		if(index >= 0) {
			array[index] = item
		} else {
			array.push(item)
		}
	},
	
	removeItemFromArray : function(item, array) {
		if(array == null) {return;}
		
		var index = _.indexOf(array, item)
		if(index >= 0) {
			array.splice(index,1)
		}
	},
	
	generateGuid : function() {
	    var S4 = function() {
	       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	    };
	    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}
}

function extend(Child, Parent) {
	var F = function() { }
	F.prototype = Parent.prototype
	Child.prototype = new F()
	Child.prototype.constructor = Child
	Child.superclass = Parent.prototype
}

var UIUtils = {
	screenHtml : function(text) {
		return text.replace(/</gi,'< ')
	}
}