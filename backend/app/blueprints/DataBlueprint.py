from flask import Blueprint, request
from app.controllers.RequestResponseController import RequestResponseController
from app.controllers.DataController import DataController

DataBlueprint = Blueprint("data", __name__)


@DataBlueprint.route("/headers")
def get_headers():
    """
    Get the headers of the dataset.
    ---
    responses:
      200:
        description: A JSON list of the dataset headers.
        schema:
          type: array
          items:
            type: string
    tags:
      - Data
    """
    return RequestResponseController.make_data_response(DataController.get_data_headers)


@DataBlueprint.route("/data")
def get_data():
    """
    Get a paginated list of the dataset records.
    ---
    parameters:
      - name: page
        in: query
        type: integer
        required: false
        default: 1
        description: The page number to retrieve.
      - name: mode
        in: query
        type: string
        required: false
        default: 'normal'
        description: "Dataset mode to use; one of 'normal' (original data), 'prognosis' (generated prognosis), or 'merged' (combined)."
      - name: language
        in: query
        type: string
        required: false
        description: The language code for value localization (e.g., 'pl', 'en').
    responses:
      200:
        description: A paginated list of records.
        schema:
          type: object
          properties:
            data:
              type: array
              items:
                type: object
            has_next:
              type: boolean
            has_prev:
              type: boolean
            next_page:
              type: integer
            prev_page:
              type: integer
            page:
              type: integer
            pages:
              type: integer
            per_page:
              type: integer
            total:
              type: integer
      400:
        description: Invalid page number.
    tags:
      - Data
    """
    page, err, code = RequestResponseController.validate_data_request()
    if err:
        return err, code
    language = request.args.get("language")
    mode = request.args.get("mode", "normal")
    return RequestResponseController.make_data_response(lambda: DataController.get_data(page, language, mode))


@DataBlueprint.route("/headers-localized")
def get_headers_localized():
    """
    Get localized labels for dataset headers.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: true
        description: The language code (e.g., 'en', 'pl', 'de', 'zh', 'ko').
    responses:
      200:
        description: A JSON object mapping header keys to localized labels.
        schema:
          type: object
      400:
        description: Missing language parameter.
    tags:
      - Data
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(lambda: DataController.get_data_headers_localized(language))


@DataBlueprint.route("/prognosis-process")
def get_prognosis_process():
    """
    Get details of how prognosis data is generated (parameters and samples).
    ---
    responses:
      200:
        description: Generation parameters and source samples per column.
        schema:
          type: object
    tags:
      - Data
    """
    return RequestResponseController.make_data_response(DataController.get_prognosis_process_details)
