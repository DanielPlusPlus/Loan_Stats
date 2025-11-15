from flask import Blueprint
from app.controllers.RequestResponseController import RequestResponseController
from app.controllers.StatsCalculatorController import StatsCalculatorController

StatsBlueprint = Blueprint("stats", __name__)

StatsCalculatorController = StatsCalculatorController()


@StatsBlueprint.route("/mean")
def get_columns_mean():
    """
    Calculate the mean of a given column.
    ---
    parameters:
      - name: column_name
        in: query
        type: string
        required: true
        description: The name of the column to calculate the mean on.
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the response messages.
    responses:
      200:
        description: The calculated mean.
        schema:
          type: object
          properties:
            data:
              type: number
            message:
              type: string
      400:
        description: Invalid column name or language.
    tags:
      - Statistics
    """
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_mean, column_name)


@StatsBlueprint.route("/sum")
def get_columns_sum():
    """
    Calculate the sum of a given column.
    ---
    parameters:
      - name: column_name
        in: query
        type: string
        required: true
        description: The name of the column to calculate the sum on.
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the response messages.
    responses:
      200:
        description: The calculated sum.
        schema:
          type: object
          properties:
            data:
              type: number
            message:
              type: string
      400:
        description: Invalid column name or language.
    tags:
      - Statistics
    """
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_sum, column_name)


@StatsBlueprint.route("/quartiles")
def get_columns_quartiles():
    """
    Calculate the quartiles of a given column.
    ---
    parameters:
      - name: column_name
        in: query
        type: string
        required: true
        description: The name of the column to calculate the quartiles on.
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the response messages.
    responses:
      200:
        description: The calculated quartiles.
        schema:
          type: object
          properties:
            data:
              type: object
            message:
              type: string
      400:
        description: Invalid column name or language.
    tags:
      - Statistics
    """
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_quartiles, column_name)


@StatsBlueprint.route("/median")
def get_columns_median():
    """
    Calculate the median of a given column.
    ---
    parameters:
      - name: column_name
        in: query
        type: string
        required: true
        description: The name of the column to calculate the median on.
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the response messages.
    responses:
      200:
        description: The calculated median.
        schema:
          type: object
          properties:
            data:
              type: number
            message:
              type: string
      400:
        description: Invalid column name or language.
    tags:
      - Statistics
    """
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_median, column_name)


@StatsBlueprint.route("/mode")
def get_columns_mode():
    """
    Calculate the mode of a given column.
    ---
    parameters:
      - name: column_name
        in: query
        type: string
        required: true
        description: The name of the column to calculate the mode on.
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the response messages.
    responses:
      200:
        description: The calculated mode.
        schema:
          type: object
          properties:
            data:
              type: array
              items:
                type: number
            message:
              type: string
      400:
        description: Invalid column name or language.
    tags:
      - Statistics
    """
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_mode, column_name)


@StatsBlueprint.route("/skewness")
def get_columns_skewness():
    """
    Calculate the skewness of a given column.
    ---
    parameters:
      - name: column_name
        in: query
        type: string
        required: true
        description: The name of the column to calculate the skewness on.
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the response messages.
    responses:
      200:
        description: The calculated skewness.
        schema:
          type: object
          properties:
            data:
              type: number
            message:
              type: string
      400:
        description: Invalid column name or language.
    tags:
      - Statistics
    """
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_skewness, column_name)


@StatsBlueprint.route("/kurtosis")
def get_columns_kurtosis():
    """
    Calculate the kurtosis of a given column.
    ---
    parameters:
      - name: column_name
        in: query
        type: string
        required: true
        description: The name of the column to calculate the kurtosis on.
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the response messages.
    responses:
      200:
        description: The calculated kurtosis.
        schema:
          type: object
          properties:
            data:
              type: number
            message:
              type: string
      400:
        description: Invalid column name or language.
    tags:
      - Statistics
    """
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_kurtosis, column_name)


@StatsBlueprint.route("/deviation")
def get_columns_deviation():
    """
    Calculate the standard deviation of a given column.
    ---
    parameters:
      - name: column_name
        in: query
        type: string
        required: true
        description: The name of the column to calculate the standard deviation on.
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the response messages.
    responses:
      200:
        description: The calculated standard deviation.
        schema:
          type: object
          properties:
            data:
              type: number
            message:
              type: string
      400:
        description: Invalid column name or language.
    tags:
      - Statistics
    """
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_deviation, column_name)
