import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Search, PlusCircle, User } from 'lucide-react';

const CustomNavbar = () => {
  return (
    <Navbar bg="white" expand="lg" className="shadow-sm py-3 sticky-top">
      <Container>
        <Navbar.Brand href="/" className="fw-bold text-primary fs-3">
          Found<span className="text-dark">It</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-3">
            <Nav.Link href="/showcase" className="fw-medium">Explore Items</Nav.Link>
            <Nav.Link href="/dashboard" className="fw-medium">Dashboard</Nav.Link>
            <Button variant="outline-primary" className="rounded-pill px-4">Login</Button>
            <Button variant="primary" className="rounded-pill px-4 shadow-sm">Get Started</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;