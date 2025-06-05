import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Button, Badge } from 'react-bootstrap';
import { FaSearch, FaRobot, FaPlus, FaTimes } from 'react-icons/fa';
import './App.css';

// Utility function to highlight matching text
const highlightText = (text, searchTerm) => {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? 
      <mark key={index} className="search-highlight">{part}</mark> : 
      part
  );
};

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce search input for better performance
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetch(process.env.REACT_APP_ROBOTS_API_URL)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  // Enhanced search and filter logic
  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) return data;

    const searchTerms = debouncedSearch.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return data.filter((item) => {
      const name = item.name.toLowerCase();
      const email = item.email.toLowerCase();
      
      // Check if all search terms match either name or email
      return searchTerms.every(term => 
        name.includes(term) || 
        email.includes(term) ||
        // Fuzzy matching - allow for small typos
        name.replace(/[aeiou]/g, '').includes(term.replace(/[aeiou]/g, '')) ||
        email.replace(/[aeiou]/g, '').includes(term.replace(/[aeiou]/g, ''))
      );
    });
  }, [debouncedSearch, data]);

  // Handle search input changes
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearch(value);
    setShowSuggestions(value.length > 0);
  }, []);

  // Handle search submission (Enter key)
  const handleSearchSubmit = useCallback((e) => {
    if (e.key === 'Enter' && search.trim()) {
      const newSearch = search.trim();
      setRecentSearches(prev => {
        const filtered = prev.filter(s => s !== newSearch);
        return [newSearch, ...filtered].slice(0, 5); // Keep only 5 recent searches
      });
      setShowSuggestions(false);
    }
  }, [search]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearch('');
    setShowSuggestions(false);
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    setSearch(suggestion);
    setShowSuggestions(false);
  }, []);

  // Get search suggestions based on existing data
  const searchSuggestions = useMemo(() => {
    if (!search.trim() || search.length < 2) return [];
    
    const suggestions = new Set();
    const searchLower = search.toLowerCase();
    
    data.forEach(item => {
      const name = item.name.toLowerCase();
      const email = item.email.toLowerCase();
      
      if (name.includes(searchLower) && !suggestions.has(item.name)) {
        suggestions.add(item.name);
      }
      if (email.includes(searchLower) && !suggestions.has(item.email)) {
        suggestions.add(item.email);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, [search, data]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Spinner animation="border" className="loading-spinner" />
          <h3 className="loading-text">Loading Robots...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container fluid className="error-container">
        <div className="error-content">
          <FaRobot className="error-icon" />
          <h3>Oops! Something went wrong</h3>
          <p>Failed to load robots. Please try again later.</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="app-container">
      <Container fluid className="main-container">
        {/* Header Section */}
        <div className="header-section">
          <h1 className="app-title">
            <FaRobot className="title-icon" />
            Robofriends
          </h1>
          <p className="app-subtitle">Meet your friendly neighborhood robots!</p>
          
          {/* Search Section */}
          <div className="search-section">
            <div className="search-wrapper">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search robots by name or email..."
                  className="search-input"
                  value={search}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchSubmit}
                  onFocus={() => setShowSuggestions(search.length > 0)}
                />
                {search && (
                  <button className="clear-search-btn" onClick={clearSearch}>
                    <FaTimes />
                  </button>
                )}
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && (searchSuggestions.length > 0 || recentSearches.length > 0) && (
                <div className="search-suggestions">
                  {searchSuggestions.length > 0 && (
                    <div className="suggestions-group">
                      <h6 className="suggestions-title">Suggestions</h6>
                      {searchSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <FaSearch className="suggestion-icon" />
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {recentSearches.length > 0 && !search && (
                    <div className="suggestions-group">
                      <h6 className="suggestions-title">Recent Searches</h6>
                      {recentSearches.map((recent, index) => (
                        <div
                          key={index}
                          className="suggestion-item recent"
                          onClick={() => handleSuggestionClick(recent)}
                        >
                          <FaSearch className="suggestion-icon" />
                          {recent}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Add Robot Button */}
            <Button 
              variant="primary" 
              className="add-robot-btn"
              href={process.env.REACT_APP_ADD_ROBOT_FORM_URL} 
              target="_blank" 
              rel="noreferrer"
            >
              <FaPlus className="me-2" />
              Add Robot
            </Button>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {/* Search Results Info */}
          {debouncedSearch && (
            <div className="search-info">
              <Badge bg="info" className="results-badge">
                {filteredData.length} robot{filteredData.length !== 1 ? 's' : ''} found
                {debouncedSearch && ` for "${debouncedSearch}"`}
              </Badge>
            </div>
          )}
          
          {filteredData.length === 0 && debouncedSearch && (
            <div className="no-results">
              <FaRobot className="no-results-icon" />
              <h4>No robots found</h4>
              <p>Try searching with different keywords or check your spelling</p>
              <Button variant="outline-light" onClick={clearSearch}>
                Clear Search
              </Button>
            </div>
          )}
          
          <Row className="robots-grid">
            {filteredData.map((item, index) => (
              <Col key={item.id || index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <Card className="robot-card">
                  <div className="card-image-wrapper">
                    <Card.Img
                      variant="top"
                      src={`${process.env.REACT_APP_ROBOHASH_API_URL}/${item.id}?set=set${item.set}`}
                      alt={item.name}
                      className="robot-image"
                    />
                  </div>
                  <Card.Body className="card-body">
                    <Card.Title className="robot-name">
                      {highlightText(item.name, debouncedSearch)}
                    </Card.Title>
                    <Card.Text className="robot-email">
                      {highlightText(item.email, debouncedSearch)}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </div>
  );
}

export default App;
