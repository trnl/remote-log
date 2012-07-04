from google.appengine.ext import db
from google.appengine.api import memcache
import uuid
from datetime import datetime

class Item(db.Model):
    @staticmethod
    def timeInMillis(date):
        td = (date - datetime.min)
        return (td.microseconds + (td.seconds + td.days * 24 * 3600) * 10**6) / 10**6
    
    @staticmethod
    def generateKey():
        td = datetime.now() - datetime.min
        ts = (td.microseconds + (td.seconds + td.days * 24 * 3600) * 10**6) / 10**6
        return str(ts)+uuid.uuid4().hex 
    
    @classmethod
    def byId(cls, item_id):
        return db.get(db.Key.from_path(cls.__name__, item_id))
    
    def id(self):
        return self.key().name()
    
    def save(self):
        self.saveToPermanentStorage()
        self.saveToCache()
    
    @classmethod
    def load(cls, id):
        item = cls.loadFromCache(id)
        if item == None:
            item = cls.loadFromPermanentStorage(id)
        return item
    
    def saveToCache(self):
        memcache.Client().set(self.id(), self)
    
    def saveToPermanentStorage(self):
        self.put()
    
    @classmethod
    def loadFromCache(cls, id):
        memcache.Client().get(id)
    
    @classmethod
    def loadFromPermanentStorage(cls, id):
        return cls.byId(id)
        
    def jsonForm(self):
        return {}