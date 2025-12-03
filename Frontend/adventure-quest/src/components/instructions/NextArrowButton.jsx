import Button from '../Button';
import Arrow from '../../assets/images/signs/arrow.png'
import '../instructions/styles/NextArrowButton.css';

const NextArrowButton = ({ onClick, disabled = false, arrowImage }) => {
  return (
    <Button
      variant="arrow"
      className="next-arrow-btn"
      onClick={onClick}
      disabled={disabled}
    >
      <img 
        src={Arrow}
        alt="Next"
        className="arrow-icon"
      />
    </Button>
  );
};

export default NextArrowButton;