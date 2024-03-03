import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://opensheet.elk.sh/1yOOvT3Oo1WBxvQVsyDhZZaNqgQjCilrfTbpwRju2I0M/1')
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

  useEffect(() => {
    setFilteredData(
      data.filter((item) => {
        return item.name.toLowerCase().includes(search.toLowerCase());
      })
    );
  }, [search, data]);

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <Spinner animation="border" role="status" style={{height: '100px', width: '100px', color: '#fff'}}>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="d-flex justify-content-center align-items-center">
      <Row>
        <Col>
          <div className="search-container">
            <h1 className="mb-4">Robofriends</h1>
            <div className="search-input">
              <FaSearch />
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="primary" className='mt-3 button'>
              <a href="https://forms.gle/JYYQmvjdAy36bDuAA" target="_blank" rel="noreferrer" className='link'>
                Add Robot
              </a>
            </Button>
          </div>
          <Row>
            {filteredData.map((item, index) => (
              <Col>
                <Card className="custom-card">
                  <Card.Img
                    variant="top"
                    src={`https://robohash.org/${item.id}?set=set${item.set}`}
                    alt={item.name}
                    width="200"
                    height="200"
                  />
                  <Card.Body>
                    <Card.Title className='text-center'>{item.name}</Card.Title>
                    <Card.Text className='text-center'>{item.email}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
