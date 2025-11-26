import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import HomePage from "../components/HomeSection";
import About from "../components/AboutSection";
import FeaturesPage from "../components/FeaturesSection";
import ContactPage from "../components/ContactSection";

const Landing = () => {
  return (
    <>
      <Header />

      {/* All landing routes inside Landing.jsx */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </>
  );
};

export default Landing;
