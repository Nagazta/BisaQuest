import '../instructions/styles/DialogueText.css';

const DialogueText = ({ text, language = 'en' }) => {
  return (
    <p className={`dialogue-text ${language}`}>
      {text}
    </p>
  );
};

export default DialogueText;