import json
import os

class LanguagesController:
    def __init__(self):
        self.translations = self._load_translations()

    def _load_translations(self):
        translations = {}
        base_path = os.path.join(os.path.dirname(__file__), "..", "languages")
        for lang_file in os.listdir(base_path):
            if lang_file.endswith(".json"):
                lang_code = lang_file.split(".")[0]
                with open(os.path.join(base_path, lang_file), "r", encoding="utf-8") as f:
                    translations[lang_code] = json.load(f)
        return translations

    def get_translation(self, lang_code, key, default_text=None):
        if os.environ.get('RELOAD_TRANSLATIONS_EACH_REQUEST') == '1':
            self.translations = self._load_translations()

        if lang_code in self.translations and key in self.translations[lang_code]:
            return self.translations[lang_code][key]

        if os.environ.get('RELOAD_TRANSLATIONS_EACH_REQUEST') != '1':
            self.translations = self._load_translations()
            if lang_code in self.translations and key in self.translations[lang_code]:
                return self.translations[lang_code][key]

        return default_text if default_text is not None else key

LanguagesControllerInstance = LanguagesController()
