from flask import Blueprint, Response, jsonify

from app import app

MainBlueprint = Blueprint("main", __name__)


@MainBlueprint.route('/')
def index():
    """
    Displays a list of all available endpoints.
    ---
    responses:
      200:
        description: A JSON object with a list of all available endpoints.
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                api_docs:
                  type: string
                endpoints:
                  type: array
                  items:
                    type: object
                    properties:
                      path:
                        type: string
                      methods:
                        type: string
                      endpoint:
                        type: string
    tags:
      - Main
    """
    routes = []
    for rule in app.url_map.iter_rules():
        if rule.endpoint != 'static':
            routes.append({
                'path': str(rule),
                'methods': ', '.join(sorted(rule.methods - {'HEAD', 'OPTIONS'})),
                'endpoint': rule.endpoint,
            })

    return jsonify({
        'message': 'Loan Stats API - Available Endpoints',
        'api_docs': '/apidocs',
        'endpoints': sorted(routes, key=lambda x: x['path'])
    })
