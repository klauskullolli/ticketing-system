import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Form, Button, Row, Col, Alert, Nav } from 'react-bootstrap';
import secureLocalStorage from "react-secure-storage";
import { FirstServer } from "../services/firstServerService";

const Login = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [requestError, setRequestError] = useState(null);
    const [error, setError] = useState({});
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const from = location.state?.from || '/';


    const submit = async (e) => {
        e.preventDefault();
        try {
            let newError = {};
            if (!username || username === '') {
                newError.username = 'Username is required';

            }
            if (!password || password === '') {
                newError.password = 'Password is required';
            }

            setError(newError);

            console.log('Error:', newError);

            if (newError && Object.keys(newError).length > 0) {
                return;
            }

            const firstServerService = new FirstServer();

            let data = await firstServerService.login({ username, password });

            secureLocalStorage.setItem('loginUser', data);

            console.log(from)

            navigate(from, { replace: true });

        } catch (err) {
            if (err?.response?.data?.type === 'not_found') {
                setRequestError("User not found");
                return;
            }

            if (err?.response?.data?.type === 'unauthorized') {
                setRequestError("Invalid credentials");
                return;
            }

            setRequestError("Something went wrong");
        }
    }


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'username') {
            setError({ ...error, username: '' });
            setUsername(value);
        }
        if (name === 'password') {
            setError({ ...error, password: '' });
            setPassword(value);
        }
    }


    return <>

        <Row className="mb-5">
            <Col />
        </Row>
        <div className="login-form">
            {requestError && <Alert variant='danger' onClose={() => setRequestError(null)} dismissible  >
                <p>
                    {requestError}
                </p>
            </Alert>}
            <Row className="mb-3">
                <h1 className="md-2">Login</h1>

            </Row>

            <Form onSubmit={submit}>
                <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Username or Email</Form.Label>
                    <Form.Control type="text" name="username" placeholder="Enter username" value={username} onChange={(e) => handleInputChange(e)} isInvalid={error?.username} />
                    <Form.Control.Feedback type="invalid">
                        {error.username}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" name="password" placeholder="Password" value={password} onChange={(e) => handleInputChange(e)} isInvalid={error?.password} />
                    <Form.Control.Feedback type="invalid">
                        {error.password}
                    </Form.Control.Feedback>
                </Form.Group>

                <Button variant="danger" onClick={() => { navigate('/') }}>
                    Cancel
                </Button>

                <Button variant="primary" type="submit" className="margin-bottom-login">
                    Submit
                </Button>
            </Form>
            <Row className='d-flex mt-3'>
                <Col>
                    <p className="mt-3">Don't have an account? <Nav.Link as={Link} to='/signup' className="login-nav">Sign Up</Nav.Link></p>
                </Col>
            </Row>
        </div>


    </>

}

export default Login;   