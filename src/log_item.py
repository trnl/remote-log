from google.appengine.ext import db

class LogItem(db.Model):
    text = db.TextProperty()