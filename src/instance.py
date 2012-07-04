from item import Item
from google.appengine.ext import db
from datetime import datetime, timedelta

class Instance(Item):
    application = db.StringProperty()
    device = db.StringProperty()
    deviceId = db.StringProperty()
    last_seen = db.DateTimeProperty(auto_now=True)
    
    RECENT_TIMEDELTA = timedelta(minutes=20)
    
    @classmethod
    def getRecentById(cls, id):
        instance = Instance.load(id)
        if instance != None and instance.isRecent():
            return instance
        
    @classmethod
    def getAllRecent(cls):
        return cls.all().filter("last_seen > ", datetime.now() - cls.RECENT_TIMEDELTA)
    
    def isRecent(self):
        return self.last_seen > datetime.now() - self.__class__.RECENT_TIMEDELTA
    
    def jsonForm(self):
        return {'id': self.id(),
                 'app':self.application,
                 'device':self.device,
                 'deviceId':self.deviceId,
                 'last_seen':Item.timeInMillis(self.last_seen),
                 'date': self.last_seen.strftime("%d.%m.%Y %H:%M")}