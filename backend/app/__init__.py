from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from .blueprints.MainBlueprint import MainBlueprint
from .blueprints.DataBlueprint import DataBlueprint
from .blueprints.StatsBlueprint import StatsBlueprint

app.register_blueprint(MainBlueprint)
app.register_blueprint(DataBlueprint)
app.register_blueprint(StatsBlueprint)
