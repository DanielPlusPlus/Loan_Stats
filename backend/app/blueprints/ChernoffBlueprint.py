from typing import Any

from flask import Blueprint, request
from app.controllers.RequestResponseController import RequestResponseController
from app.controllers.ChernoffController import ChernoffController

ChernoffBlueprint = Blueprint("chernoff", __name__)

ChernoffControllerInstance = ChernoffController()

@ChernoffBlueprint.route("/chernoff-faces")
def get_chernoff_faces() -> Any:
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
    tags:
      - Chernoff Faces
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    mode = request.args.get('mode', 'normal')
    face = request.args.get('face')

    language = language if isinstance(language, str) else "en"

    response = ChernoffControllerInstance.generate_chernoff_faces(language, mode=mode, single_face=face)

    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'

    return response


@ChernoffBlueprint.route("/chernoff-faces/legend")
def get_chernoff_legend() -> Any:
    """
    Generates a legend for Chernoff faces.
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
        description: A PNG image of the Chernoff faces legend.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Chernoff Faces
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code

    language = language if isinstance(language, str) else "en"

    response = ChernoffControllerInstance.generate_chernoff_legend(language)

    response.headers['Cache-control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'

    return response
