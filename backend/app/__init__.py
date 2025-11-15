from flask import Flask
from flask_cors import CORS
from flasgger import Swagger

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://localhost",
            "https://localhost:443",
            "https://localhost:3443",
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.config['SWAGGER'] = {
    'title': 'Loan Stats API',
    'uiversion': 3
}
swagger = Swagger(app)

from .blueprints.MainBlueprint import MainBlueprint
from .blueprints.DataBlueprint import DataBlueprint
from .blueprints.StatsBlueprint import StatsBlueprint
from .blueprints.ChartsBlueprint import ChartsBlueprint
from .blueprints.ChernoffBlueprint import ChernoffBlueprint

app.register_blueprint(MainBlueprint)
app.register_blueprint(DataBlueprint)
app.register_blueprint(StatsBlueprint)
app.register_blueprint(ChartsBlueprint)
app.register_blueprint(ChernoffBlueprint)
