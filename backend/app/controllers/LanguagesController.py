import os
import json


class LanguagesController:
    def __init__(self):
        self.__languages_list = ["en", "de", "pl", "zh", "ko"]

    def load_translations(self, lang: str, section: str) -> dict:
        translations = self.__load_translations_from_file(lang)

        if section:
            return translations.get(section, {})
        return translations

    def __load_translations_from_file(self, language: str) -> dict:
        locales_path = os.path.join(os.path.dirname(__file__), "..", "languages")

        if not self.__is_valid_language(language):
            raise ValueError(
                f"Invalid language '{language}' provided. Supported languages are {', '.join(self.__languages_list)}.")

        file_path = os.path.join(locales_path, f"{language}.json")

        if not os.path.exists(file_path):
            raise FileNotFoundError(
                f"Translation file for language '{language}' not found. Falling back to default language 'en.json'.")

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data
        except json.JSONDecodeError as e:
            raise ValueError(f"Error decoding JSON from the translation file for '{language}': {e}")
        except Exception as e:
            raise RuntimeError(f"An unexpected error occurred while loading translations for '{language}': {e}")

    def __is_valid_language(self, language: str) -> bool:
        return language in self.__languages_list


LanguagesControllerInstance = LanguagesController()
