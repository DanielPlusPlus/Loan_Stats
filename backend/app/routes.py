from . import app
from flask import request, jsonify
import numpy as np

from app.stats_calculator import (
    calculate_mean,
    calculate_sum,
    calculate_quartiles,
    calculate_median,
    calculate_mode,
    calculate_skewness,
    calculate_kurtosis,
    calculate_deviation
)

from app.method_descriptions import get_method_desc_html


def make_response(function_name, column_name):
    try:
        result = function_name(column_name)

        if isinstance(result, (np.integer, np.floating)):
            result = result.item()
        elif isinstance(result, dict):
            result = {k: v.item() if isinstance(v, (np.integer, np.floating)) else v
                      for k, v in result.items()}

        return jsonify({"success": True, "result": result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/')
def index():
    return get_method_desc_html()


@app.route("/mean", methods=["POST"])
def mean_endpoint():
    data = request.get_json()
    column_name = data.get("column_name")
    return make_response(calculate_mean, column_name)


@app.route("/sum", methods=["POST"])
def sum_endpoint():
    data = request.get_json()
    column_name = data.get("column_name")
    return make_response(calculate_sum, column_name)


@app.route("/quartiles", methods=["POST"])
def quartiles_endpoint():
    data = request.get_json()
    column_name = data.get("column_name")
    return make_response(calculate_quartiles, column_name)


@app.route("/median", methods=["POST"])
def median_endpoint():
    data = request.get_json()
    column_name = data.get("column_name")
    return make_response(calculate_median, column_name)


@app.route("/mode", methods=["POST"])
def mode_endpoint():
    data = request.get_json()
    column_name = data.get("column_name")
    return make_response(calculate_mode, column_name)


@app.route("/skewness", methods=["POST"])
def skewness_endpoint():
    data = request.get_json()
    column_name = data.get("column_name")
    return make_response(calculate_skewness, column_name)


@app.route("/kurtosis", methods=["POST"])
def kurtosis_endpoint():
    data = request.get_json()
    column_name = data.get("column_name")
    return make_response(calculate_kurtosis, column_name)


@app.route("/deviation", methods=["POST"])
def deviation_endpoint():
    data = request.get_json()
    column_name = data.get("column_name")
    return make_response(calculate_deviation, column_name)


'''
working check
with app.app_context():
    response, status_code = make_response(calculate_quartiles, "income")
    print(response.get_json())
    print("Status code:", status_code)
'''
