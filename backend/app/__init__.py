from flask import Flask

app = Flask(__name__)

from . import files_manager

from . import routes
