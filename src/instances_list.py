from datetime import datetime
from google.appengine.api import memcache

class InstancesList:
    instances = []
    
    def __init__(self, key):
        self.key = key
        self.saveToCache()
        
    def id(self):
        return self.key
        
    @classmethod
    def loadFromCache(cls, id):
        memcache.Client().get(id)
        
    def saveToCache(self):
        memcache.Client().set(self.id(), self)
    
    def setInstance(self, instance):
        if instance in self.instances:
            self.instances[self.instances.index(instance)].last_seen = datetime.now()
        else:
            self.instances.append(instance)
            
        self.saveToCache()
            
    def recentInstances(self):
        needToSave = False
        for instance in self.instances:
            if not instance.isRecent():
                self.instances.remove(instance)
                needToSave = True
                
        if needToSave:
            self.saveToCache()
        
        return self.instances
            
    def recentInstanceById(self, id):
        recentInstances = self.recentInstances()
        for instance in recentInstances:
            if instance.id() == id:
                return instance