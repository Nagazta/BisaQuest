import LanguageImage from '../../assets/images/languageSelection.png'
import './IllustrationPanel.css'

const IllustrationPanel = () => {
  return (
    <div className="illustration-panel">
      <img 
        src= {LanguageImage} 
        alt="Kingdom Library Interior"
      />
    </div>
  );
};

export default IllustrationPanel;