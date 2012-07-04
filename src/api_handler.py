from base_handler import BaseHandler
from google.appengine.api import channel
from message import Message
from instance import Instance
from base_utils import BaseUtils
from datetime import datetime
from instances_list import InstancesList
from item import Item

class ApiMethodsHandler(BaseHandler):
    def get(self):
        op = self.request.get('op')
        if op == 'test':
            for m in Message.all():
                m.delete()
        elif op == 'request_channel':
            channelName = self.request.get('instance_id')
            channelToken = channel.create_channel(channelName)
            ret = {}
            ret['channel_token'] = channelToken
            self.out(BaseUtils.asJson(ret))
            
        elif op == 'recent_instances':
            recentInstances = []
            for instance in ApiMethodsHandler.recentInstances():
                recentInstances.append(instance.jsonForm())
                
            self.out(BaseUtils.asJson(recentInstances))
        elif op == 'instance_by_id':
            instanceId = self.request.get('id')
            if instanceId != '':
                instance = ApiMethodsHandler.recentInstancesList().recentInstanceById(instanceId)
                if instance != None:
                    self.out(BaseUtils.asJson(instance.jsonForm()))
                    return
            
            self.out(BaseUtils.asJson({'id':''}))
        elif op == 'check_channel':
            self.notifyUser(self.request.get('channel'), 'event',
                                    {'data':self.request.get('val')})
            self.out('done')
            
            
    def post(self):
        op = self.request.get('op')
        if op == 'put_message':
            severity = Message.SEVERITY_INFO
            severity_param = self.request.get('severity')
            if severity_param != '':
                severity = int(severity_param)
                
            time = Item.timeInMillis(datetime.now())
            if self.request.get('time') != '':
                time = float(self.request.get('time'))
            self.out_putMessage(time,
                                self.request.get('app'),
                                self.request.get('device'),
                                self.request.get('device_id'),
                                self.request.get('message'),
                                severity)
        
    def out_putMessage(self, timeToUse, appToUse, deviceToUse, deviceIdToUse, messageToUse, severityToUse):
        message = Message(key_name = Message.generateKey(),
                          created_date = datetime.fromtimestamp(timeToUse*1.0/1000.0),
                          application=appToUse,
                          device=deviceToUse,
                          deviceId=deviceIdToUse,
                          message=messageToUse,
                          severity=severityToUse)
        self.notifyUser(appToUse+deviceToUse+deviceIdToUse,
                        'event', 
                        message.jsonForm())
        self.rememberInstance(appToUse, deviceToUse, deviceIdToUse)
        self.out('done')
    
    @staticmethod    
    def recentInstancesList():
        instancesList = InstancesList.loadFromCache('recent_instances')
        if instancesList == None:
            instancesList = InstancesList('recent_instances')
        return instancesList
        
    @staticmethod
    def recentInstances():
        return ApiMethodsHandler.recentInstancesList().recentInstances() 
        
    def rememberInstance(self, appToUse, deviceToUse, deviceIdToUse):
        ApiMethodsHandler.recentInstancesList().setInstance(Instance(key_name = appToUse+deviceToUse+deviceIdToUse,
                                application=appToUse,
                                device=deviceToUse,
                                deviceId=deviceIdToUse))