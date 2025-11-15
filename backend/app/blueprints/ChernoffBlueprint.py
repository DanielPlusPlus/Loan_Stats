from flask import Blueprint, make_response, request
from app.controllers.RequestResponseController import RequestResponseController
from app.controllers.ChernoffController import ChernoffController

ChernoffBlueprint = Blueprint("chernoff", __name__)

ChernoffController = ChernoffController()


@ChernoffBlueprint.route("/chernoff-faces")
def get_chernoff_faces():
    """
    Generates Chernoff faces based on the dataset.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the legend.
    responses:
      200:
        description: A PNG image of Chernoff faces.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    mode = request.args.get('mode', 'normal')
    face = request.args.get('face')                                

    response = ChernoffController.generate_chernoff_faces(language, mode=mode, single_face=face)

    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'

    return response
