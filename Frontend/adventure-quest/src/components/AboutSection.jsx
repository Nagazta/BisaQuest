import { useState } from 'react';
import '../components/styles/AboutSection.css';

const AboutSection = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: "Team Member 1",
      role: "Project Lead",
      image: "👨‍💼",
      bio: "Passionate about educational technology and making learning fun for young readers.",
      skills: ["Leadership", "Project Management", "Education"]
    },
    {
      id: 2,
      name: "Team Member 2",
      role: "Lead Developer",
      image: "👩‍💻",
      bio: "Expert in creating interactive learning experiences through innovative coding solutions.",
      skills: ["React", "Web Development", "UI/UX"]
    },
    {
      id: 3,
      name: "Team Member 3",
      role: "Content Designer",
      image: "👨‍🎨",
      bio: "Specializes in crafting engaging stories and educational content for Grade 3 learners.",
      skills: ["Content Writing", "Story Design", "Curriculum"]
    },
    {
      id: 4,
      name: "Team Member 4",
      role: "UX Designer",
      image: "👩‍🎨",
      bio: "Dedicated to creating intuitive and delightful user experiences for young students.",
      skills: ["UI Design", "User Research", "Prototyping"]
    },
    {
      id: 5,
      name: "Team Member 5",
      role: "Quality Assurance",
      image: "👨‍🔬",
      bio: "Ensures every feature works perfectly to provide the best learning experience.",
      skills: ["Testing", "Quality Control", "Analytics"]
    }
  ];

  const goals = [
    {
      title: "Enhance Reading Skills",
      description: "Improve comprehension, vocabulary, and critical thinking through interactive stories and exercises."
    },
    {
      title: "Build Confidence",
      description: "Create a supportive environment where every student feels encouraged to read and learn at their own pace."
    },
    {
      title: "Make Learning Fun",
      description: "Transform reading practice into an exciting adventure with gamification and engaging narratives."
    },
    {
      title: "Track Progress",
      description: "Provide detailed insights and achievements to help students and teachers monitor improvement."
    }
  ];

  return (
    <section id="about" className="about-section">
      {/* About Project Container */}
      <div className="about-container">
        {/* Section Header */}
        <div className="about-header">
          <h2 className="section-title">Our Mission & Vision</h2>
          <p className="section-subtitle">
            Empowering Grade 3 learners through innovative reading adventures
          </p>
        </div>

        {/* Project Info */}
        <div className="project-info">
          <div className="project-description">
            <h3 className="project-title">About Adventure Quest</h3>
            <p className="project-text">
              Adventure Quest is an innovative reading comprehension platform designed specifically for Grade 3 students. 
              We believe that reading should be an exciting journey, not a chore. Our platform combines interactive 
              storytelling, gamification, and adaptive learning to create an engaging educational experience.
            </p>
            <p className="project-text">
              Through carefully crafted stories and comprehension exercises, we help young learners develop critical 
              reading skills while having fun. Each adventure is designed to challenge students at their level, 
              building confidence and fostering a lifelong love for reading.
            </p>
            <div className="project-features">
              <div className="feature-tag">📚 Interactive Stories</div>
              <div className="feature-tag">🏆 Achievement System</div>
              <div className="feature-tag">📈 Progress Tracking</div>
              <div className="feature-tag">🎨 Colorful Design</div>
            </div>
          </div>

          {/* Illustration */}
          <div className="project-illustration">
            <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Background Circle */}
              <circle cx="150" cy="150" r="130" fill="#FFFEF2" opacity="0.5"/>
              
              {/* Book Stack */}
              <rect x="80" y="140" width="140" height="20" rx="5" fill="#B96C25"/>
              <rect x="70" y="160" width="160" height="20" rx="5" fill="#6B3E1D"/>
              <rect x="90" y="180" width="120" height="20" rx="5" fill="#94785C"/>
              
              {/* Open Book on Top */}
              <rect x="100" y="100" width="100" height="45" rx="5" fill="#FFFEF2" stroke="#6B3E1D" strokeWidth="3"/>
              <line x1="150" y1="100" x2="150" y2="145" stroke="#6B3E1D" strokeWidth="3"/>
              
              {/* Stars */}
              <circle cx="60" cy="80" r="5" fill="#FCD765"/>
              <circle cx="240" cy="90" r="6" fill="#FCD765"/>
              <circle cx="50" cy="200" r="4" fill="#B96C25"/>
              <circle cx="250" cy="180" r="5" fill="#B96C25"/>
              
              {/* Trophy */}
              <path d="M130 50 L140 50 L145 70 L125 70 Z" fill="#FCD765" stroke="#6B3E1D" strokeWidth="2"/>
              <rect x="127" y="70" width="16" height="5" fill="#6B3E1D"/>
            </svg>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="goals-container">
          <h3 className="goals-title">Our Goals</h3>
          <div className="goals-grid">
            {goals.map((goal, index) => (
              <div key={index} className="goal-card">
                <div className="goal-icon">{goal.icon}</div>
                <h4 className="goal-title">{goal.title}</h4>
                <p className="goal-description">{goal.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="team-container">
          <h3 className="team-title">Meet Our Team</h3>
          <p className="team-subtitle">
            The passionate individuals behind Adventure Quest
          </p>
          
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className={`team-card ${hoveredCard === member.id ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard(member.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="team-card-inner">
                  {/* Front of Card */}
                  <div className="team-card-front">
                    <div className="member-image">{member.image}</div>
                    <h4 className="member-name">{member.name}</h4>
                    <p className="member-role">{member.role}</p>
                    <div className="card-hover-hint">Hover to learn more</div>
                  </div>
                  
                  {/* Back of Card */}
                  <div className="team-card-back">
                    <p className="member-bio">{member.bio}</p>
                    <div className="member-skills">
                      {member.skills.map((skill, index) => (
                        <span key={index} className="skill-badge">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;