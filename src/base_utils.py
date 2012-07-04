from google.appengine.api import channel
from google.appengine.api import mail
from google.appengine.api import memcache

from log_item import LogItem


from google.appengine.api.urlfetch import fetch, POST
import urllib
import simplejson

class BaseUtils:
    
    @staticmethod
    def asJson(input):
        return simplejson.dumps(input)
    
    @staticmethod    
    def notifyUser(user_id, notification_type, notification):
        try:
            notification['type'] = notification_type
            channel.send_message(user_id, BaseUtils.asJson(notification))
        except Exception:
            pass
    
    @staticmethod
    def sendEmail(email_address, subject, plain_body, html_body=None):
        if email_address != None and email_address != '' and mail.is_email_valid(email_address):
                sender_address = "notify@efectr.com"
                if html_body == None:
                    html_body = plain_body
                mail.send_mail(sender_address, email_address, subject, plain_body, html=html_body)
                return True
        return False
    
    @staticmethod   
    def totalTimedeltaSeconds(td):
        return (td.microseconds + (td.seconds + td.days * 24 * 3600) * 10**6) / 10**6
    
    @staticmethod
    def log(log_info):
        l = LogItem(text = log_info)
        l.put()

class Cache:        
    @staticmethod
    def getValue(key):
        return memcache.Client().get(key)
   
    @staticmethod
    def setValue(key, value):
        memcache.Client().set(key, value)
        
    @staticmethod
    def deleteValue(key):
        memcache.Client().delete(key)
        
class Http:
    @staticmethod
    def GETJson(url):
        try:
            return simplejson.loads(Http.GET(url))
        except Exception:
            return None

    @staticmethod
    def GET(url):
        return fetch(url, deadline=600).content

    @staticmethod
    def POST(url, data):
        return fetch(url,urllib.urlencode(data, True),POST).content