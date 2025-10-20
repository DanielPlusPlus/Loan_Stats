from app.controllers.FilesController import FilesControllerInstance


class DataController:
    PAGE_LIMIT = 100

    @staticmethod
    def get_data_headers() -> list:
        data = FilesControllerInstance.get_data()
        if data is not None:
            return list(data.columns)
        raise ValueError("No data loaded")

    @staticmethod
    def get_data(page: int = 1) -> dict:
        data = FilesControllerInstance.get_data()
        if data is not None:
            start = (page - 1) * DataController.PAGE_LIMIT
            end = start + DataController.PAGE_LIMIT
            page_data = data.iloc[start:end]
            if page_data.empty:
                raise ValueError("No data found for this page")
            return page_data.to_dict(orient="records")
        raise ValueError("Dataset not loaded")
