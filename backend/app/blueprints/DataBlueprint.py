from flask import Blueprint
from app.controllers.RequestResponseController import RequestResponseController
from app.controllers.DataController import DataController

DataBlueprint = Blueprint("data", __name__)


@DataBlueprint.route("/headers")
def get_headers():
    return RequestResponseController.make_data_response(DataController.get_data_headers)


@DataBlueprint.route("/data")
def get_data():
    page, err, code = RequestResponseController.validate_data_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(lambda: DataController.get_data(page))


'''
from app import app
with app.app_context():
    response, status_code = RequestResponseController.make_data_response(lambda: DataController.get_data(1))
    print(response.get_json())
    print("Status code:", status_code)
'''
