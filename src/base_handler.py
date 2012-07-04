from google.appengine.ext import webapp
from google.appengine.api import channel

import simplejson

class BaseHandler(webapp.RequestHandler):
      
    def itemId(self, item):
        return item.key().name()
        
    def asJson(self, input):
        return simplejson.dumps(input)
    
    def out(self, output):
        self.response.out.write(output)
        
    def notifyUser(self, user_id, notification_type, notification):
        try:
            notification['type'] = notification_type
            channel.send_message(user_id, self.asJson(notification))
        except Exception:
            pass