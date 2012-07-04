from item import Item
from google.appengine.ext import db

class Message(Item):
    SEVERITY_INFO = 0
    SEVERITY_WARNING = 1
    SEVERITY_WARNING = 2
    SEVERITY_ERROR = 3
    
    application = db.StringProperty()
    device = db.StringProperty()
    deviceId = db.StringProperty()
    message = db.TextProperty()
    created_date = db.DateTimeProperty()
    severity = db.IntegerProperty()
    
    def jsonForm(self):
        return {'id': self.id(),
                 'time': str(self.created_date.strftime("%d.%m %H:%M:%S") + ".%03d" % (self.created_date.microsecond/1000)),
                 'app':self.application,
                 'device':self.device,
                 'deviceId':self.deviceId,
                 'message':self.message,
                 'severity':self.severity}