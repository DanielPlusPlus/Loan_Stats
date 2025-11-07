from flask import Blueprint
from app.controllers.RequestResponseController import RequestResponseController
from app.controllers.ChartsController import ChartsController

ChartsBlueprint = Blueprint("charts", __name__)

ChartsController = ChartsController()


@ChartsBlueprint.route("/income-hist")
def income_hist():
    """Rozkład dochodów wg decyzji kredytowej."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_income_histogram)


@ChartsBlueprint.route("/credit-vs-loan")
def credit_vs_loan():
    """Kwota pożyczki vs Credit Score z podziałem na decyzję i dochód."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_credit_vs_loan)


@ChartsBlueprint.route("/employment-box")
def employment_box():
    """Staż pracy wg decyzji kredytowej."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_employment_boxplot)


@ChartsBlueprint.route("/corr-heatmap")
def corr_heatmap():
    """Macierz korelacji zmiennych numerycznych."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_correlation_heatmap)


@ChartsBlueprint.route("/income-vs-score")
def income_vs_score():
    """Dochód vs Credit Score wg decyzji kredytowej."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_income_vs_score)


@ChartsBlueprint.route("/income-vs-years")
def income_vs_years():
    """Dochód vs staż pracy wg decyzji kredytowej."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_income_vs_years)


@ChartsBlueprint.route("/credit-violin")
def credit_violin():
    """Rozkład Credit Score wg decyzji i grup dochodu."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_credit_violin)


@ChartsBlueprint.route("/avg-income-by-city")
def avg_income_by_city():
    """Średni dochód w miastach wg decyzji kredytowej."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_avg_income_by_city)


@ChartsBlueprint.route("/pairplot-main")
def pairplot_main():
    """Pairplot dla kluczowych zmiennych."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_pairplot_main)


@ChartsBlueprint.route("/loan-amount-box")
def loan_amount_box():
    """Kwota pożyczki wg decyzji kredytowej."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_loan_amount_box)


@ChartsBlueprint.route("/credit-score-hist")
def credit_score_hist():
    """Rozkład Credit Score wg decyzji kredytowej."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_credit_score_histogram)


@ChartsBlueprint.route("/income-hist-density")
def income_hist_density():
    """Histogram i funkcja gęstości dochodów."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_income_hist_and_density)


@ChartsBlueprint.route("/income-box")
def income_box():
    """Wykres pudełkowy dochodów."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_income_box)


@ChartsBlueprint.route("/income-ecdf")
def income_ecdf():
    """Dystrybuanta empiryczna dochodu."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_income_ecdf)


@ChartsBlueprint.route("/income-frequency")
def income_frequency():
    """Wykres liczebności klientów wg przedziałów dochodu."""'''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_income_frequency)


@ChartsBlueprint.route("/income-relative-frequency")
def income_relative_frequency():
    """Wykres częstości względnych dochodów."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_income_relative_frequency)


@ChartsBlueprint.route("/loan-pie")
def loan_pie():
    """Wykres kołowy decyzji kredytowych."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_loan_pie)


@ChartsBlueprint.route("/loan-group-means")
def loan_group_means():
    """Porównanie średnich wartości cech klientów wg decyzji kredytowej."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_loan_group_means)


@ChartsBlueprint.route("/income-radar")
def income_radar():
    """Wykres radarowy średnich miar."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_income_radar)


@ChartsBlueprint.route("/age-pyramid")
def age_pyramid():
    """Piramida wieku (symulacja: staż pracy ~ wiek)."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_age_pyramid)


@ChartsBlueprint.route("/income-line")
def income_line():
    """Wykres łamany dochodów."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_income_line)


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
    """Porównanie typów kurtozy (mezokurtyczny, lepto-, platy-)."""
    '''przyjmuje jezyk jako parametr: en, de, pl, zh, ko'''
    language, err, code = RequestResponseController.validate_language_request()
    if err:
        return err, code
    return RequestResponseController.make_data_response(ChartsController.plot_kurtosis_comparison)
