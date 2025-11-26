import { useState } from 'react';
import '../components/styles/FeaturesSection.css';

const FeaturesSection = () => {
  const [activeQuest, setActiveQuest] = useState(0);

  const quests = [
    {
      title: 'Village Quest - Vocabulary',
      desc: 'Master 50+ new words through fun matching and association games. Build your word power!',
      badge: 'Word Explorer',
      color: '#FCD765',
      features: ['50+ Vocabulary Words', 'Matching Games', 'Word Association', 'Visual Learning']
    },
    {
      title: 'Forest Quest - Synonyms & Antonyms',
      desc: 'Discover word relationships in the enchanted forest. Learn synonym and antonym pairs!',
      badge: 'Synonym Sleuth',
      color: '#94785C',
      features: ['Synonym Pairs', 'Antonym Matching', 'Word Relationships', 'Interactive Puzzles']
    },
    {
      title: 'Castle Quest - Compound Words',
      desc: 'Learn to build and understand 30+ compound words through drag-and-drop challenges!',
      badge: 'Word Builder',
      color: '#B96C25',
      features: ['30+ Compound Words', 'Drag & Drop', 'Word Construction', 'Building Games']
    },
    {
      title: 'Kingdom Quest - Final Challenge',
      desc: 'Apply all your skills to solve the kingdom crisis! Integrate everything you\'ve learned!',
      badge: 'Master Reader',
      color: '#6B3E1D',
      features: ['Comprehensive Test', 'All Skills Combined', 'Story Integration', 'Final Achievement']
    }
  ];

  const mainFeatures = [
    {
      title: 'Gamified Learning',
      description: 'Turn reading practice into an exciting adventure with points, badges, and rewards.'
    },
    {
      title: 'Interactive Stories',
      description: 'Engage with captivating narratives designed specifically for Grade 3 comprehension levels.'
    },
    {
      title: 'Achievement System',
      description: 'Earn badges and unlock new quests as you progress through your reading journey.'
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor improvement with detailed analytics and personalized learning insights.'
    },
    {
      title: 'Adaptive Learning',
      description: 'Content adjusts to each student\'s skill level for optimal learning experience.'
    },
    {
      title: 'Collaborative Mode',
      description: 'Work together with classmates on special group quests and challenges.'
    }
  ];

  return (
    <section id="features" className="features-section">
      <div className="features-container">
        {/* Section Header */}
        <div className="features-header">
          <h2 className="section-title">Explore Our Learning Adventures</h2>
          <p className="section-subtitle">
            Discover the exciting features that make Adventure Quest the perfect reading companion
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="main-features-grid">
          {mainFeatures.map((feature, index) => (
            <div key={index} className="feature-card">
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Quest Showcase Section */}
        <div className="quest-showcase">
          <h3 className="quest-showcase-title">Your Reading Quest Journey</h3>
          <p className="quest-showcase-subtitle">
            Progress through four exciting quests, each designed to build specific reading skills
          </p>

          {/* Quest Navigation */}
          <div className="quest-navigation">
            {quests.map((quest, index) => (
              <button
                key={index}
                className={`quest-nav-button ${activeQuest === index ? 'active' : ''}`}
                onClick={() => setActiveQuest(index)}
              >
                <span className="quest-nav-text">Quest {index + 1}</span>
              </button>
            ))}
          </div>

          {/* Active Quest Display */}
          <div className="quest-display">
            <div className="quest-content">
              <div className="quest-info">
                <div className="quest-badge-display">{quests[activeQuest].badge}</div>
                <h4 className="quest-title">{quests[activeQuest].title}</h4>
                <p className="quest-description">{quests[activeQuest].desc}</p>
                
                <div className="quest-features-list">
                  <h5 className="quest-features-title">What You'll Learn:</h5>
                  <div className="quest-features-grid">
                    {quests[activeQuest].features.map((feature, index) => (
                      <div key={index} className="quest-feature-item">
           
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="start-quest-button">
                  <span>Start This Quest</span>
                  <svg className="button-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quest Progress Path */}
            <div className="quest-path">
              {quests.map((quest, index) => (
                <div
                  key={index}
                  className={`quest-path-node ${index <= activeQuest ? 'completed' : ''} ${index === activeQuest ? 'current' : ''}`}
                >
                  <div className="path-node-icon">{quest.icon}</div>
                  <div className="path-node-label">Quest {index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="features-cta">
          <h3 className="cta-title">Ready to Start Your Adventure?</h3>
          <p className="cta-text">
            Join thousands of Grade 3 students who are already improving their reading skills!
          </p>
          <div className="cta-buttons">
            <a href="#contact" className="cta-button primary">Get Started Now</a>
            <a href="#about" className="cta-button secondary">Learn More</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;