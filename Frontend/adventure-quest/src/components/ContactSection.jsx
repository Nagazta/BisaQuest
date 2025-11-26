import { useState } from 'react';
import '../components/styles/ContactSection.css';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');
    
    // Simulate form submission
    setTimeout(() => {
      setFormStatus('success');
      setFormData({
        name: '',
        email: '',
        role: '',
        subject: '',
        message: ''
      });
      
      setTimeout(() => {
        setFormStatus('');
      }, 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      title: 'Email Us',
      detail: 'adventurequest@education.com',
      description: 'Send us an email anytime'
    },
    {
      title: 'Call Us',
      detail: '+1 (555) 123-4567',
      description: 'Mon-Fri from 8am to 5pm'
    },
    {
      title: 'Visit Us',
      detail: '123 Education Street, Learning City',
      description: 'Our office location'
    }
  ];


  const faqs = [
    {
      question: 'Is Adventure Quest suitable for all Grade 3 students?',
      answer: 'Yes! Our platform is designed specifically for Grade 3 reading levels and adapts to each student\'s pace.'
    },
    {
      question: 'How much does it cost?',
      answer: 'We offer flexible pricing plans including free trials. Contact us for detailed pricing information.'
    },
    {
      question: 'Can teachers track student progress?',
      answer: 'Absolutely! Teachers have access to comprehensive dashboards showing individual and class-wide progress.'
    }
  ];

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        {/* Section Header */}
        <div className="contact-header">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="contact-info-grid">
          {contactInfo.map((info, index) => (
            <div key={index} className="contact-info-card">
              <div className="info-icon">{info.icon}</div>
              <h3 className="info-title">{info.title}</h3>
              <p className="info-detail">{info.detail}</p>
              <p className="info-description">{info.description}</p>
            </div>
          ))}
        </div>

        {/* Main Contact Area */}
        <div className="contact-main">
          {/* Contact Form */}
          <div className="contact-form-wrapper">
            <h3 className="form-title">Send Us a Message</h3>
            <p className="form-subtitle">Fill out the form below and we'll get back to you shortly.</p>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role" className="form-label">I am a... *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-input form-select"
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="parent">Parent</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                    <option value="administrator">School Administrator</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="How can we help?"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-input form-textarea"
                  placeholder="Tell us more about your inquiry..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-button" disabled={formStatus === 'sending'}>
                {formStatus === 'sending' ? (
                  <>
                    <span className="spinner"></span>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <svg className="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>

              {formStatus === 'success' && (
                <div className="form-success">
                  <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p>Thank you! Your message has been sent successfully. We'll get back to you soon!</p>
                </div>
              )}
            </form>
          </div>

          {/* Sidebar Info */}
          <div className="contact-sidebar">
            {/* FAQ Section */}
            <div className="faq-section">
              <h3 className="sidebar-title">Frequently Asked Questions</h3>
              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <h4 className="faq-question">{faq.question}</h4>
                    <p className="faq-answer">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>     
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;