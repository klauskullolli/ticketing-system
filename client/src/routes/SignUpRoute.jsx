import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Form, Button, Row, Col, Alert, Nav } from 'react-bootstrap';
import { ROLES } from "../utils/general";
import { FirstServer } from '../services/firstServerService';
import validator from "validator";

const SignUp = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [requestError, setRequestError] = useState(null);
    const [error, setError] = useState({});
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('');
    const from = location.state?.from || '/';


    const validate = () => {
        let newError = {};
        if (!username || username === '') {
            newError.username = 'Username is required';

        }

        if (!email || email === '') {
            newError.email = 'Email is required';
        }

        if (!validator.isEmail(email)) {
            newError.email = 'Email is invalid';
        }

        if (!password || password === '') {
            newError.password = 'Password is required';
        }
        if (!confirmPassword || confirmPassword === '') {
            newError.confirmPassword = 'Confirm Password is required';
        } else {
            if (password !== confirmPassword) {
                newError.confirmPassword = 'Passwords do not match';
            }
        }

        if (!role || role === '') {
            newError.role = 'Role is required';
        }
        return newError;
    }

    const submit = async (e) => {
        e.preventDefault();
        try {
            let newError = validate();
            setError(newError);

            console.log('Error:', newError);

            if (newError && Object.keys(newError).length > 0) {
                return;
            }

            const firstServerService = new FirstServer();
            const data = await firstServerService.signup({ username, email, password, role });

            navigate('/');


        } catch (err) {
            setRequestError(err?.response?.data?.message || "Something went wrong");
        }
    }


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'username') {
            setError({ ...error, username: '' });
            setUsername(value);
        }

        if (name === 'email') {
            setError({ ...error, email: '' });
            setEmail(value);
        }

        if (name === 'password') {
            setError({ ...error, password: '' });
            setPassword(value);
        }
        if (name === 'confirmPassword') {
            setError({ ...error, confirmPassword: '' });
            setConfirmPassword(value);
        }
        if (name === 'role') {
            setError({ ...error, role: '' });
            setRole(value);
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
                <h1 className="md-2">Sign Up</h1>

            </Row>

            <Form onSubmit={submit}>
                <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" name="username" placeholder="Enter username" value={username} onChange={(e) => handleInputChange(e)} isInvalid={error?.username} />
                    <Form.Control.Feedback type="invalid">
                        {error.username}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="text" name="email" placeholder="Enter email" value={email} onChange={(e) => handleInputChange(e)} isInvalid={error?.email} />
                    <Form.Control.Feedback type="invalid">
                        {error.email}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" name="password" placeholder="Password" value={password} onChange={(e) => handleInputChange(e)} isInvalid={error?.password} />
                    <Form.Control.Feedback type="invalid">
                        {error.password}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formConfirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control type="password" name="confirmPassword" placeholder="Password" value={confirmPassword} onChange={(e) => handleInputChange(e)} isInvalid={error?.confirmPassword} />
                    <Form.Control.Feedback type="invalid">
                        {error.confirmPassword}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formRole">
                    <Form.Label>Role</Form.Label>
                    <Form.Control as="select" name="role" value={role} onChange={(e) => handleInputChange(e)} isInvalid={error?.role}>
                        <option value="">Select Role</option>
                        {Object.values(ROLES).map((role, index) => <option key={index} value={role}>{role?.toLocaleUpperCase()}</option>)}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {error.role}
                    </Form.Control.Feedback>
                </Form.Group>

                <Button variant="danger" onClick={() => { navigate('/') }}>
                    Cancel
                </Button>

                <Button variant="primary" type="submit" className="margin-bottom-login">
                    Submit
                </Button>


            </Form>
        </div>


    </>

}

export default SignUp;   