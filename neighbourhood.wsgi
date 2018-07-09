#!/usr/bin/python
from flask import Flask, render_template

application = Flask(__name__)

@application.route('/')
def showGoogleMaps():
    return render_template('index.html')

if __name__ == '__main__':
    application.secret_key = '<b\x1f\xa3\x01\xf0\xc9X\x06\xe00\xfb\xba\x15\x92\x92'
    application.debug = True
    application.run(host='0.0.0.0', port=8000)
