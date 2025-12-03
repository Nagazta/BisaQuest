import Button from '../Button';
import '../progress/styles/ConfirmationDialog.css';

const ConfirmationDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-dialog">
        <div className="confirmation-border">
          <div className="confirmation-content">
            <h3 className="confirmation-title">{title}</h3>
            <p className="confirmation-message">{message}</p>
            
            <div className="confirmation-actions">
              <Button 
                variant="secondary" 
                className="confirmation-btn cancel-btn"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                className="confirmation-btn confirm-btn"
                onClick={onConfirm}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;