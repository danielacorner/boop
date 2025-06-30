import { useEffect, useState } from "react";
import { Fidget1 } from "./Fidget1";
import { Fidget2 } from "./Fidget2";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";

// Array of all available fidget components
const fidgetComponents = [
  { id: 0, component: Fidget1 },
  { id: 1, component: Fidget2 },
  // Add more fidget components here as they're created
  // { id: 2, component: Fidget3 },
];

function App() {
  // Get the saved fidget index from localStorage or default to 0
  const [currentFidgetIndex, setCurrentFidgetIndex] = useState<number>(() => {
    const savedIndex = localStorage.getItem("currentFidgetIndex");
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  // Save the current fidget index whenever it changes
  useEffect(() => {
    localStorage.setItem("currentFidgetIndex", currentFidgetIndex.toString());
  }, [currentFidgetIndex]);

  const navigateNext = () => {
    setCurrentFidgetIndex((prevIndex) => 
      prevIndex === fidgetComponents.length - 1 ? 0 : prevIndex + 1
    );
  };

  const navigatePrevious = () => {
    setCurrentFidgetIndex((prevIndex) => 
      prevIndex === 0 ? fidgetComponents.length - 1 : prevIndex - 1
    );
  };

  // Get the current fidget component
  const CurrentFidget = fidgetComponents[currentFidgetIndex].component;

  // Use this for debugging
  console.log('Current fidget index:', currentFidgetIndex);
  
  const handleNavigateNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navigate next clicked');
    navigateNext();
  };

  const handleNavigatePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navigate previous clicked');
    navigatePrevious();
  };

  return (
    <div className="app-container">
      <div className="fidget-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFidgetIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%", height: "100%" }}
          >
            <CurrentFidget />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls in a separate container with higher z-index */}
      <div className="navigation-controls">
        {/* Previous arrow */}
        <button 
          className="carousel-arrow left-arrow"
          onClick={handleNavigatePrevious}
          aria-label="Previous fidget"
        >
          ‹
        </button>

        {/* Next arrow */}
        <button 
          className="carousel-arrow right-arrow"
          onClick={handleNavigateNext}
          aria-label="Next fidget"
        >
          ›
        </button>
      </div>

      {/* Pagination indicator */}
      <div className="pagination-dots">
        {fidgetComponents.map((_, index) => (
          <button
            key={index}
            className={`pagination-dot ${index === currentFidgetIndex ? 'active' : ''}`}
            onClick={() => setCurrentFidgetIndex(index)}
            aria-label={`Go to fidget ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
