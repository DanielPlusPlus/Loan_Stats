from flask import Blueprint
from app.controllers.RequestResponseController import RequestResponseController
from app.controllers.ChernoffController import ChernoffController

ChernoffBlueprint = Blueprint("chernoff", __name__)

ChernoffController = ChernoffController()


@ChernoffBlueprint.route("/chernoff-faces")
def get_chernoff_faces():
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(lambda: ChernoffController.generate_chernoff_faces(language))
