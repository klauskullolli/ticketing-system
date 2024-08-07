import { useState } from 'react'
import { Container, Row, Col, Alert } from 'react-bootstrap'
import { Route, Routes, Link, BrowserRouter } from 'react-router-dom';
import Layout from './Layout.jsx'
import Login from './routes/LoginRoute.jsx'
import SignUp from './routes/SignUpRoute.jsx'
import './App.css'
import Tickets from './routes/TicketsRoute.jsx';
import RequireAuth from './components/RequireAuthComponent.jsx';
import { ROLES } from './utils/general.js';
import Ticket from './routes/TicketRoute.jsx';
import CreateTicket from './routes/CreateTicketRoute.jsx';
import Profile from './routes/ProfileRoute.jsx';



function App() {
  const [count, setCount] = useState(0);

  function NotFound() {
    return (
      <Container fluid className='mt-5'>
        <div className='alert-component'>
          <center>
            <Row className='mb-5'>
            </Row>
            <Row className='mb-5'>
            </Row>
            <Row>
              <Col>
                <Alert variant='danger' >
                  <Alert.Heading ><h2>404</h2></Alert.Heading>
                  <p className='h3'>Page Not Found!</p>
                </Alert>
              </Col>
            </Row>
          </center>

        </div>
      </Container>
    )
  };


  function NotAuthorized() {
    return (
      <Container fluid className='mt-5'>
        <div className='alert-component'>
          <center>
            <Row className='mb-5'>
            </Row>
            <Row className='mb-5'>
            </Row>
            <Row>
              <Col>
                <Alert variant='danger' >
                  <Alert.Heading ><h2>401</h2></Alert.Heading>
                  <p className='h3'>Unauthorized Access!</p>
                </Alert>
              </Col>
            </Row>
          </center>

        </div>
      </Container>
    )
  };



  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Tickets />} />
          <Route path='/ticket' element={<Tickets />} />
          <Route element={<RequireAuth roles={[ROLES.ADMIN, ROLES.USER]} />}>
            <Route path="/ticket/:id" element={<Ticket />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="create_ticket" element={<CreateTicket />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
