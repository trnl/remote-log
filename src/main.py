import os
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

from google.appengine.ext import webapp

from base_handler import BaseHandler
from api_handler import ApiMethodsHandler
from random import random

class MainPage(BaseHandler): 
    def get(self):
        template_values = {
                'random':random()
        }
        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.out(template.render(path, template_values))
        return

application = webapp.WSGIApplication([('/', MainPage),
                                      ('/api', ApiMethodsHandler)
                                     ], debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()