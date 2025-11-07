import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import useLanguage from "../hooks/useLanguage";
import type { ChangeEvent } from "react";

const LanguageSelector = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as typeof language);
  };

  return (
    <InputGroup>
      <InputGroup.Text>Język</InputGroup.Text>
      <Form.Select
        value={language}
        onChange={handleChange}
        aria-label="Wybierz język"
      >
        {availableLanguages.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </Form.Select>
    </InputGroup>
  );
};

export default LanguageSelector;
