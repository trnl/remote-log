function Instance(data) {
	Instance.superclass.constructor.apply(this, arguments)
	this.domClass = 'Instance'
	var self = this
	
	this.internalHtmlCodeMethod = function(model, mode) {
		deviceId = 'unknown'
		if(model.deviceId != '') {
			deviceId = model.deviceId;
		}
		if(mode != CONTAINER_DISPLAY_MODE_MINIMAL) {
			return '<div class="instance" >'+
					'<div><span class="filter_label fixed_width" > Application: </span>'+ 
					UIUtils.screenHtml(self.model.app)+
					'</div><div><span class="filter_label fixed_width" > Device: </span>'+
					UIUtils.screenHtml(self.model.device)+
					'</div><span class="filter_label fixed_width" > Device ID: </span>'+
					UIUtils.screenHtml(deviceId)+'</div>'
		} else {
			return '<div class="instance" ><span class="filter_label" > Application: </span>'+ 
					UIUtils.screenHtml(self.model.app)+
					' <span class="filter_label" > Device: </span>'+
					UIUtils.screenHtml(self.model.device)+
					' <span class="filter_label" > Device ID: </span>'+
					UIUtils.screenHtml(deviceId)+'</div>'
		}
	};
	this.internalSetFunctionalMethod = function(item, element, mode) {
		if(mode != CONTAINER_DISPLAY_MODE_MINIMAL) {
			$(element).click(function() {
				Application.openInstanceLog(item.model)
			});
		} else {
			$(element).click(function() {
				Application.setPage(Application.PAGE_INSTANCES)
			});
		}
	};
}
extend(Instance, Item)