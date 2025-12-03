import LanguageImage from '../../assets/images/languageSelection.png'
import '../language/styles/IllustrationPanel.css'

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