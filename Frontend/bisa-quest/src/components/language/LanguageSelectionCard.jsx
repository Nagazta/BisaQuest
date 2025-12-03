import LanguageDropdown from './LanguageDropDown';
import Card from '../../assets/images/cards.png';
import Button from '../Button';
import '../language/styles/LanguageSelectionCard.css'

const LanguageSelectionCard = ({ selectedLanguage, onLanguageChange, onNext }) => {
  return (
    <div className="language-card">
      <div className="language-card-content">
        <h2>Choose Language</h2>
        <LanguageDropdown 
          value={selectedLanguage}
          onChange={onLanguageChange}
        />
        <Button onClick={onNext} variant="primary" className='next-btn'>
          Next
        </Button>
      </div>
    </div>
  );
};

export default LanguageSelectionCard