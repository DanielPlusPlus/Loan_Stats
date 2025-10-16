from . import app
from markupsafe import Markup


@app.route('/')
def index():
    routes = []
    for rule in app.url_map.iter_rules():
        if rule.endpoint != 'static':
            routes.append({
                'endpoint': rule.endpoint,
                'methods': ', '.join(sorted(rule.methods - {'HEAD', 'OPTIONS'})),
                'path': str(rule)
            })

    html = "<h2>Available endpoints:</h2><ul>"
    for r in routes:
        html += f"<li><b>{r['path']}</b> — {r['methods']} — function: {r['endpoint']}</li>"
    html += "</ul>"

    return Markup(html)


@app.route("/mean")
def calculate_mean():
    pass


@app.route("/sum")
def calculate_sum():
    pass


@app.route("/quartiles")
def calculate_quartiles():
    pass


@app.route("/median")
def calculate_median():
    pass


@app.route("/mode")
def calculate_mode():
    pass


@app.route("/skewness")
def calculate_skewness():
    pass


@app.route("/kurtosis")
def calculate_kurtosis():
    pass


@app.route("/deviation")
def calculate_deviation():
    pass
