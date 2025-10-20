from flask import Blueprint
from app.controllers.RequestResponseController import RequestResponseController
from app.controllers.StatsCalculatorController import StatsCalculatorController

StatsBlueprint = Blueprint("stats", __name__)

StatsCalculatorController = StatsCalculatorController()


@StatsBlueprint.route("/mean")
def get_columns_mean():
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_mean, column_name)


@StatsBlueprint.route("/sum")
def get_columns_sum():
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_sum, column_name)


@StatsBlueprint.route("/quartiles")
def get_columns_quartiles():
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_quartiles, column_name)


@StatsBlueprint.route("/median")
def get_columns_median():
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_median, column_name)


@StatsBlueprint.route("/mode")
def get_columns_mode():
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_mode, column_name)


@StatsBlueprint.route("/skewness")
def get_columns_skewness():
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_skewness, column_name)


@StatsBlueprint.route("/kurtosis")
def get_columns_kurtosis():
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_kurtosis, column_name)


@StatsBlueprint.route("/deviation")
def get_columns_deviation():
    column_name, err, code = RequestResponseController.validate_stats_request()
    if err:
        return err, code
    return RequestResponseController.make_stats_response(StatsCalculatorController.calculate_deviation, column_name)


"""
from app import app
with app.app_context():
    response, status_code = RequestResponseController.make_stats_response(StatsCalculatorController.calculate_quartiles, "income")
    print(response.get_json())
    print("Status code:", status_code)
"""
