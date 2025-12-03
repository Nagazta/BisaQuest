import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageSelectionCard from '../../components/language/LanguageSelectionCard';
import ErrorNotification from '../../components/ErrorNotification';
import IllustrationPanel from '../../components/language/IllustrationPanel';
import SaveProgressModal from '../../components/progress/SaveProgressModal';
import Button from '../../components/Button';
import '../student/styles/LanguageSelectionPage.css';

const LanguageSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [error, setError] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);
  
  useEffect(() => {
    // Check for saved progress on mount
    checkForSavedProgress();
  }, []);

  const checkForSavedProgress = async () => {
    try {
      // Simulate API call to check for saved progress
      const response = await fetch('/api/check-progress');
      
      // FOR TESTING: Simulate saved progress exists
      // Comment out the fetch above and use this:
      const mockSavedProgress = {
        module: 'Module 1 - Vocabulary Quest',
        progress: 45,
        characterImage: '/assets/images/character-avatar.png'
      };
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (mockSavedProgress) {
        setSavedProgress(mockSavedProgress);
        setShowSaveModal(true);
      }
      
    } catch (err) {
      console.error('Error checking progress:', err);
      setError('Could not load saved progress. Starting fresh.');
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };
  
  const handleNext = async () => {
    try {
      const response = await fetch('/api/save-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: selectedLanguage })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save language preference');
      }
      
      console.log('Language saved:', selectedLanguage);
      
      // Check for saved progress after language selection
      checkForSavedProgress();
      
    } catch (err) {
      setError('Your language preference could not be saved. A session default will be used temporarily.');
      console.error('Error saving language:', err);
    }
  };

  const handleContinue = () => {
    console.log('Continuing with saved progress:', savedProgress);
    setShowSaveModal(false);
    // Navigate to the saved module/section
    navigate('/student/instructions');
  };

  const handleNewGame = () => {
    console.log('Starting new game, clearing progress');
    setSavedProgress(null);
    setShowSaveModal(false);
    // Clear saved progress and start fresh
    localStorage.removeItem('savedProgress');
    navigate('/student/instructions');
  };
  
  return (
    <>
      <div className="language-selection-page">
        <div className="back-button">
          <Button onClick={handleBack} variant="back" className='back-button language'>
            ← Back
          </Button>
        </div>
        
        <div className="content-container">
          <LanguageSelectionCard 
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            onNext={handleNext}
          />
          <IllustrationPanel />
        </div>
        
        <ErrorNotification 
          message={error}
          onClose={() => setError(null)}
        />
      </div>

      <SaveProgressModal
        isOpen={showSaveModal}
        onContinue={handleContinue}
        onNewGame={handleNewGame}
        characterImage={savedProgress?.characterImage}
        savedProgress={savedProgress}
      />
    </>
  );
};

export default LanguageSelectionPage;