from markupsafe import Markup

from . import app

METHOD_DESCRIPTIONS = {
    "mean_endpoint": {
        "description": "Calculates the arithmetic mean (average) of the specified column and returns a JSON object.",
        "input_type": "column_name (string) in POST JSON body",
        "return_type": "JSON: {'success': True, 'result': float} or {'success': False, 'error': string}"
    },
    "sum_endpoint": {
        "description": "Calculates the sum of all values in the specified column and returns a JSON object.",
        "input_type": "column_name (string) in POST JSON body",
        "return_type": "JSON: {'success': True, 'result': float} or {'success': False, 'error': string}"
    },
    "quartiles_endpoint": {
        "description": "Calculates the first, second (median), and third quartiles of the specified column and returns a JSON object.",
        "input_type": "column_name (string) in POST JSON body",
        "return_type": "JSON: {'success': True, 'result': {'Q1': float, 'Q2': float, 'Q3': float}} or {'success': False, 'error': string}"
    },
    "median_endpoint": {
        "description": "Calculates the median of the specified column and returns a JSON object.",
        "input_type": "column_name (string) in POST JSON body",
        "return_type": "JSON: {'success': True, 'result': float} or {'success': False, 'error': string}"
    },
    "mode_endpoint": {
        "description": "Finds the mode (most frequent value) of the specified column and returns a JSON object.",
        "input_type": "column_name (string) in POST JSON body",
        "return_type": "JSON: {'success': True, 'result': float or None} or {'success': False, 'error': string}"
    },
    "skewness_endpoint": {
        "description": "Calculates the skewness of the specified column and returns a JSON object.",
        "input_type": "column_name (string) in POST JSON body",
        "return_type": "JSON: {'success': True, 'result': float} or {'success': False, 'error': string}"
    },
    "kurtosis_endpoint": {
        "description": "Calculates the kurtosis of the specified column and returns a JSON object.",
        "input_type": "column_name (string) in POST JSON body",
        "return_type": "JSON: {'success': True, 'result': float} or {'success': False, 'error': string}"
    },
    "deviation_endpoint": {
        "description": "Calculates the standard deviation of the specified column and returns a JSON object.",
        "input_type": "column_name (string) in POST JSON body",
        "return_type": "JSON: {'success': True, 'result': float} or {'success': False, 'error': string}"
    }
}


def get_method_desc_html():
    routes = []
    for rule in app.url_map.iter_rules():
        if rule.endpoint != 'static':
            desc = METHOD_DESCRIPTIONS.get(rule.endpoint, {})
            description = desc.get("description", "No description")
            input_type = desc.get("input_type", "-")
            return_type = desc.get("return_type", "-")

            routes.append({
                'endpoint': rule.endpoint,
                'methods': ', '.join(sorted(rule.methods - {'HEAD', 'OPTIONS'})),
                'path': str(rule),
                'description': description,
                'input_type': input_type,
                'return_type': return_type
            })

    html = "<h2>Available endpoints:</h2><ul>"
    for r in routes:
        html += (
            f"<li><b>{r['path']}</b> — {r['methods']} — function: {r['endpoint']}<br>"
            f"<i>Description:</i> {r['description']}<br>"
            f"<i>Input type:</i> {r['input_type']}<br>"
            f"<i>Return type:</i> {r['return_type']}</li><br>"
        )
    html += "</ul>"

    return Markup(html)
