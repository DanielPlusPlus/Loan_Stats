from flask import Flask

app = Flask(__name__)

from .blueprints.MainBlueprint import MainBlueprint
from .blueprints.DataBlueprint import DataBlueprint
from .blueprints.StatsBlueprint import StatsBlueprint

app.register_blueprint(MainBlueprint)
app.register_blueprint(DataBlueprint)
app.register_blueprint(StatsBlueprint)
