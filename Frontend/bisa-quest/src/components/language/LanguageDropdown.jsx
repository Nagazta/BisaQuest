import { useState } from 'react';
import '../language/styles/LanguageDropdown.css'

const LanguageDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ceb', label: 'Cebuano', flag: '🇵🇭' }
  ];
  
  const selectedLanguage = languages.find(lang => lang.code === value) || languages[0];
  
  return (
    <div className="language-dropdown">
      <div 
        className="dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedLanguage.flag} {selectedLanguage.label}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      
      {isOpen && (
        <div className="dropdown-menu">
          {languages.map(lang => (
            <div
              key={lang.code}
              className={`dropdown-option ${value === lang.code ? 'selected' : ''}`}
              onClick={() => {
                onChange(lang.code);
                setIsOpen(false);
              }}
            >
              {lang.flag} {lang.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;