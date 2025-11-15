from flask import request, jsonify, Response
from typing import Callable, Any, Optional, Tuple
import numpy as np
import base64


class RequestResponseController:
    @staticmethod
    def validate_stats_request() -> Tuple[Optional[str], Optional[Response], Optional[int]]:
        column_name = request.args.get("column_name")
        if not column_name:
            return None, jsonify({"success": False, "error": "Missing column_name parameter"}), 400
        return column_name, None, None

    @staticmethod
    def validate_language_request() -> Tuple[Optional[str], Optional[Response], Optional[int]]:
        language = request.args.get("language")
        if not language:
            return None, jsonify({"success": False, "error": "Missing language parameter"}), 400
        return language, None, None

    @staticmethod
    def validate_data_request() -> Tuple[int, Optional[Response], Optional[int]]:
        try:
            page = int(request.args.get("page", 1))
            if page < 1:
                raise ValueError
            return page, None, None
        except ValueError:
            return 1, jsonify({"success": False, "error": "Invalid page number (must be positive integer)"}), 400

    @staticmethod
    def make_stats_response(function_name: Callable[[str], Any], column_name: str) -> Tuple[Response, int]:
        try:
            result = function_name(column_name)

            if isinstance(result, (np.integer, np.floating)):
                result = result.item()
            elif isinstance(result, dict):
                result = {
                    k: v.item() if isinstance(v, (np.integer, np.floating)) else v
                    for k, v in result.items()
                }

            return jsonify({"success": True, "result": result}), 200
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 400

    @staticmethod
    def make_data_response(function_name: Callable[[], Any]) -> Tuple[Response, int]:
        try:
            result = function_name()
            return jsonify({"success": True, "result": result}), 200
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 400

