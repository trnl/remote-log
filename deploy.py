import sys
import os

APP_NAME = 'remote-log-tool'

def deploy(mode):
	f_template = open('src/app.yaml.template', 'r')
	content = f_template.read()
	f_template.close()
	f_out = open('src/app.yaml', 'w')
	if mode == 'release':
		content = content.replace('##app_name##', APP_NAME)
		content = content.replace('##version##', '1')
	elif mode == 'dev':
		content = content.replace('##app_name##', APP_NAME)
		content = content.replace('##version##', 'dev')
	f_out.write(content)
	f_out.close()
	
	os.system('appcfg.py update src')

	print('UPDATE ENDED')
if len(sys.argv) > 1:
	deploy(sys.argv[1])
else:
	deploy(None)
