from app.controllers.FilesController import FilesControllerInstance
from typing import Any, Dict, Optional
import numpy as np


class DataController:
    PAGE_LIMIT = 15

    __BOOL_LABELS: Dict[str, Dict[bool, str]] = {
        "en": {True: "Yes", False: "No"},
        "pl": {True: "Tak", False: "Nie"},
        "de": {True: "Ja", False: "Nein"},
        "zh": {True: "是", False: "否"},
        "ko": {True: "예", False: "아니오"},
    }

    __HEADER_LABELS: Dict[str, Dict[str, str]] = {
        "en": {
            "city": "City",
            "credit_score": "Credit score",
            "income": "Income",
            "loan_amount": "Loan amount",
            "loan_approved": "Loan approved",
            "name": "Name",
            "points": "Points",
            "years_employed": "Years employed",
            "dataset": "Dataset",
        },
        "pl": {
            "city": "Miasto",
            "credit_score": "Wynik kredytowy",
            "income": "Dochód",
            "loan_amount": "Kwota pożyczki",
            "loan_approved": "Pożyczka zatwierdzona",
            "name": "Imię",
            "points": "Punkty",
            "years_employed": "Lata zatrudnienia",
            "dataset": "Zbiór danych",
        },
        "de": {
            "city": "Stadt",
            "credit_score": "Kredit-Score",
            "income": "Einkommen",
            "loan_amount": "Darlehensbetrag",
            "loan_approved": "Darlehen genehmigt",
            "name": "Name",
            "points": "Punkte",
            "years_employed": "Beschäftigungsjahre",
            "dataset": "Datensatz",
        },
        "zh": {
            "city": "城市",
            "credit_score": "信用评分",
            "income": "收入",
            "loan_amount": "贷款金额",
            "loan_approved": "贷款已批准",
            "name": "姓名",
            "points": "积分",
            "years_employed": "就业年限",
            "dataset": "数据集",
        },
        "ko": {
            "city": "도시",
            "credit_score": "신용 점수",
            "income": "소득",
            "loan_amount": "대출 금액",
            "loan_approved": "대출 승인됨",
            "name": "이름",
            "points": "포인트",
            "years_employed": "근속 연수",
            "dataset": "데이터셋",
        },
    }

    __DATASET_LABELS: Dict[str, Dict[str, str]] = {
        "en": {"normal": "Normal", "prognosis": "Prognosis"},
        "pl": {"normal": "Normalne", "prognosis": "Prognoza"},
        "de": {"normal": "Normal", "prognosis": "Prognose"},
        "zh": {"normal": "正常", "prognosis": "预测"},
        "ko": {"normal": "일반", "prognosis": "예측"},
    }

    @staticmethod
    def __to_bool(value: Any) -> Optional[bool]:
        if isinstance(value, (bool, np.bool_)):
            return bool(value)
        if isinstance(value, (int, np.integer)):
            if value in (0, 1):
                return bool(value)
        if isinstance(value, str):
            lowered = value.strip().lower()
            if lowered in ("true", "yes", "y", "1", "tak", "ja", "是", "예"):
                return True
            if lowered in ("false", "no", "n", "0", "nie", "nein", "否", "아니오"):
                return False
        return None

    @staticmethod
    def __localize_value(column: str, value: Any, language: Optional[str]) -> Any:
        if not language:
            return value

        if column == "loan_approved":
            normalized = DataController.__to_bool(value)
            if normalized is not None:
                labels = DataController.__BOOL_LABELS.get(
                    language, DataController.__BOOL_LABELS.get("en", {})
                )
                return labels.get(normalized, value)

        return value

    @staticmethod
    def get_data_headers() -> list:
        data = FilesControllerInstance.get_data()
        if data is not None:
            return list(data.columns)
        raise ValueError("No data loaded")

    @staticmethod
    def get_data_headers_localized(language: str) -> Dict[str, str]:
        data = FilesControllerInstance.get_data()
        if data is None:
            raise ValueError("No data loaded")
        labels = DataController.__HEADER_LABELS.get(language, DataController.__HEADER_LABELS.get("en", {}))
        result: Dict[str, str] = {}
        for col in data.columns:
            result[col] = labels.get(col, str(col))

        if 'dataset' not in result and 'dataset' in labels:
            result['dataset'] = labels['dataset']
        return result

    @staticmethod
    def get_data(page: int = 1, language: Optional[str] = None, mode: str = "normal") -> dict:
        mode_norm = (mode or "normal").strip().lower()
        if mode_norm == "prognosis":
            data = FilesControllerInstance.get_prognosis_only_data()
        elif mode_norm == "merged":

            data = FilesControllerInstance.get_prognosis_data()
        else:
            data = FilesControllerInstance.get_data()
        if data is not None:
            total_records = len(data)
            start = (page - 1) * DataController.PAGE_LIMIT
            end = start + DataController.PAGE_LIMIT
            page_data = data.iloc[start:end]
            if page_data.empty:
                raise ValueError("No data found for this page")
            records = page_data.to_dict(orient="records")
            for row in records:
                if "dataset" not in row:
                    row["dataset"] = "normal"
            if language:
                localized_records = []
                for row in records:
                    localized_row = {k: DataController.__localize_value(k, v, language) for k, v in row.items()}

                    if "dataset" in localized_row:
                        labels = DataController.__DATASET_LABELS.get(language, DataController.__DATASET_LABELS.get("en", {}))
                        val = str(localized_row["dataset"]).strip().lower()
                        localized_row["dataset"] = labels.get(val, localized_row["dataset"])
                        if mode_norm != "normal":
                            localized_row["dataset_code"] = val
                    localized_records.append(localized_row)
                records = localized_records
            return {
                "data": records,
                "has_next": end < total_records,
                "has_prev": page > 1,
                "total": total_records,
                "per_page": DataController.PAGE_LIMIT,
                "page": page
            }
        raise ValueError("Dataset not loaded")

    @staticmethod
    def get_prognosis_process_details() -> Dict[str, Any]:
        return FilesControllerInstance.get_prognosis_process_details()
