from flask import Blueprint
from flask import request
from app.controllers.RequestResponseController import RequestResponseController
from app.controllers.ChartsController import ChartsController

ChartsBlueprint = Blueprint("charts", __name__)

ChartsController = ChartsController()
@ChartsBlueprint.route("/quantiles-distance")
def quantiles_distance():
    """
    Quantiles distance from mean (Income): |Q1-mean|, |Q2-mean|, |Q3-mean|.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
      - name: column
        in: query
        type: string
        required: false
        default: income
        description: Numeric column key (e.g., income, loan_amount, credit_score, years_employed, points)
      - name: mode
        in: query
        type: string
        required: false
        default: normal
        enum: ['normal', 'prognosis']
        description: Dataset mode to use.
      - name: compare
        in: query
        type: boolean
        required: false
        default: false
        description: When true, overlays Normal vs Prognosis distances
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_quantiles_distance(language)
@ChartsBlueprint.route("/dist-normal")
def dist_normal():
    """
    Theoretical Gaussian (Normal) distribution plot.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_normal_distribution(language)


@ChartsBlueprint.route("/dist-student-t")
def dist_student_t():
    """
    Theoretical Student's t distribution (df=5) plot.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_student_t_distribution(language)


@ChartsBlueprint.route("/income-hist")
def income_hist():
    """
    Distribution of income by credit decision.
    This endpoint returns a histogram of income distribution based on credit decisions.
    ---
    parameters:
      - name: language
        in: query
        type: string
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        required: false
        default: en
        description: The language for the response messages.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Bad request, e.g., invalid language parameter.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_income_histogram(language)


@ChartsBlueprint.route("/credit-vs-loan")
def credit_vs_loan():
    """
    Loan Amount vs Credit Score by decision and income.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_credit_vs_loan(language)


@ChartsBlueprint.route("/employment-box")
def employment_box():
    """
    Years of employment by credit decision.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_employment_boxplot(language)


@ChartsBlueprint.route("/corr-heatmap")
def corr_heatmap():
    """
    Correlation matrix of numeric variables.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_correlation_heatmap(language)


@ChartsBlueprint.route("/income-vs-score")
def income_vs_score():
    """
    Income vs Credit Score by credit decision.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_income_vs_score(language)


@ChartsBlueprint.route("/income-vs-years")
def income_vs_years():
    """
    Income vs years of employment by credit decision.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_income_vs_years(language)


@ChartsBlueprint.route("/credit-violin")
def credit_violin():
    """
    Credit Score distribution by decision and income group.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_credit_violin(language)


@ChartsBlueprint.route("/avg-income-by-city")
def avg_income_by_city():
    """
    Average income in cities by credit decision.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_avg_income_by_city(language)


@ChartsBlueprint.route("/pairplot-main")
def pairplot_main():
    """
    Pairplot for key variables.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_pairplot_main(language)


@ChartsBlueprint.route("/loan-amount-box")
def loan_amount_box():
    """
    Loan amount by credit decision.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_loan_amount_box(language)


@ChartsBlueprint.route("/credit-score-hist")
def credit_score_hist():
    """
    Credit Score distribution by credit decision.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_credit_score_histogram(language)


@ChartsBlueprint.route("/income-hist-density")
def income_hist_density():
    """
    Income histogram and density function.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_income_hist_and_density(language)


@ChartsBlueprint.route("/income-box")
def income_box():
    """
    Income box plot.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_income_box(language)


@ChartsBlueprint.route("/income-ecdf")
def income_ecdf():
    """
    Empirical cumulative distribution function of income.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_income_ecdf(language)


@ChartsBlueprint.route("/income-frequency")
def income_frequency():
    """
    Client frequency in income ranges.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_income_frequency(language)


@ChartsBlueprint.route("/income-relative-frequency")
def income_relative_frequency():
    """
    Relative frequency of incomes.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_income_relative_frequency(language)


@ChartsBlueprint.route("/loan-pie")
def loan_pie():
    """
    Pie chart of credit decisions.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_loan_pie(language)


@ChartsBlueprint.route("/loan-group-means")
def loan_group_means():
    """
    Comparison of mean client features by credit decision.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_loan_group_means(language)


@ChartsBlueprint.route("/income-radar")
def income_radar():
    """
    Radar chart of average measures.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_income_radar(language)


@ChartsBlueprint.route("/age-pyramid")
def age_pyramid():
    """
    Age pyramid (simulation: years of employment ~ age).
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_age_pyramid(language)


@ChartsBlueprint.route("/income-line")
def income_line():
    """
    Line plot of incomes.
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_income_line(language)


'''
@ChartsBlueprint.route("/combined-distribution/<column>")
def combined_distribution(column):
    """Połączony wykres rozkładu gęstości, ECDF i boxplota dla kolumny."""
    przyjmuje jezyk jako parametr: en, de, pl, zh, ko
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(lambda: ChartsController.plot_combined_distribution(column))
'''


@ChartsBlueprint.route("/kurtosis-comparison")
def kurtosis_comparison():
    """
    Comparison of kurtosis types (mesokurtic, leptokurtic, platykurtic).
    ---
    parameters:
      - name: language
        in: query
        type: string
        required: false
        default: en
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: The language for the chart titles and labels.
    responses:
      200:
        description: A PNG image of the chart.
        content:
          image/png:
            schema:
              type: string
              format: binary
      400:
        description: Invalid language provided.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return ChartsController.plot_kurtosis_comparison(language)


@ChartsBlueprint.route("/chart-description")
def chart_description():
    """
    Returns a localized, comprehensive description of a chart.
    ---
    parameters:
      - name: chart
        in: query
        type: string
        required: true
        description: Chart id (e.g., 'income-hist', 'credit-vs-loan').
      - name: language
        in: query
        type: string
        required: true
        enum: ['en', 'de', 'pl', 'zh', 'ko']
        description: Target language code.
    responses:
      200:
        description: JSON payload with chart id and localized description.
        content:
          application/json:
            schema:
              type: object
              properties:
                success:
                  type: boolean
                result:
                  type: object
                  properties:
                    chart:
                      type: string
                    description:
                      type: string
      400:
        description: Missing or invalid parameters.
    tags:
      - Charts
    """
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code

    chart_id = request.args.get("chart")
    if not chart_id:
        from flask import jsonify
        return jsonify({"success": False, "error": "Missing chart parameter"}), 400

    def _resolver():
        return ChartsController.get_chart_description(chart_id, language)

    return RequestResponseController.make_data_response(_resolver)
