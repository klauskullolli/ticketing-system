import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button, Container, Form, Modal, Alert } from 'react-bootstrap';
import { FirstServer } from "../services/firstServerService";
import secureLocalStorage from "react-secure-storage";
import validator from "validator";
import PassChangeForm from "../components/PassChangeFormComponent";

const Profile = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState({});
    const [requestError, setRequestError] = useState(null);
    const loginUser = secureLocalStorage.getItem('loginUser');
    const [user, setUser] = useState(null);
    const [edit, setEdit] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);  
    const [successMessage, setSuccessMessage] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const loadUser = async () => {
            try {
                const firstServerService = new FirstServer(loginUser?.token);
                const data = await firstServerService.getProfile();
                setUser(data);
                setEmail(data?.email);
                setUsername(data?.username);
            } catch (error) {
                if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'invalid_token') {
                    secureLocalStorage.removeItem('loginUser');
                    navigate('/login');
                    return;
                }
                setRequestError('Something went wrong');
            }
        }
        loadUser();

        return () => {
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError({});
            setRequestError(null);
            setUser(null);
            setEdit(false);
            setShowProfileModal(false);
            setShowChangePasswordModal(false);
        }


    }, []);


    const handleCancel = () => {
        setEdit(false);
        setEmail(user?.email);
        setUsername(user?.username);
    }

    const validate = () => {
        let newError = {};
        if (!email || email === '') {
            newError.email = 'Email is required';
        }
        if (!validator.isEmail(email)) {
            newError.email = 'Email is invalid';
        }
        if (!username || username === '') {
            newError.username = 'Username is required';
        }
        return newError;
    }


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setError({ ...error, [name]: null });
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'username') {
            setUsername(value);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (username === user?.username && email === user?.email) {
            setRequestError('No changes to save');
            setEdit(false);
            return;
        }

        let newError = validate();
        setError(newError);
        if (newError && Object.keys(newError).length > 0) {
            return;
        }

        try {
            const firstServerService = new FirstServer(loginUser?.token);
            await firstServerService.updateProfile({ username, email });
            setShowProfileModal(true);
        } catch (err) {

            if (err?.response?.data?.type === 'exist') {
                setRequestError(err?.response?.data?.message);
                setUsername(user?.username);
                setEmail(user?.email);
                setEdit(false);
                return;
            }

            if (err?.response?.data?.type === 'unauthorized' || err?.response?.data?.type === 'invalid_token') {
                secureLocalStorage.removeItem('loginUser');
                navigate('/login');
                return;
            }
            setRequestError('Something went wrong');
        }
    };

    const handleModalProfile = () => {
        setShowProfileModal(false);
        secureLocalStorage.removeItem('loginUser'); 
        navigate('/');
    }; 

    const onPasswordChangeButt = (e) => {
        e.preventDefault();
        setShowChangePasswordModal(true);
        setEdit(false);
        setUsername(user?.username);
        setEmail(user?.email);

    };

    const onSuccessAction = ()=>{
        setSuccessMessage('Password updated successfully. Login again please!')
    }

    const onSuccessClose = () => {  
        setSuccessMessage(null);
        secureLocalStorage.removeItem('loginUser'); 
        navigate('/');
    };


    return (
        <>
            <div className="profile-container">

                {requestError && <Alert variant='danger' onClose={() => setRequestError(null)} dismissible>
                    <p>
                        {requestError}
                    </p>
                </Alert>}

                {successMessage && <Alert variant='success' onClose={onSuccessClose} dismissible>
                    <p>
                        {successMessage}
                    </p>
                </Alert>}

                <Row>
                    <Col>
                        <h1>Profile</h1>
                    </Col>
                </Row>


                <Row>
                    <Col>
                        <Form>
                            <Form.Group className="mb-3" controlId="formUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" name='username' placeholder="Enter username" value={username} onChange={(e) => handleInputChange(e)} disabled={!edit} isInvalid={error?.username} />
                                <Form.Control.Feedback type="invalid">
                                    {error.username}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control type="email" name='email' placeholder="Enter email" value={email} onChange={(e) => handleInputChange(e)} disabled={!edit} isInvalid={error?.email} />
                                <Form.Control.Feedback type="invalid">
                                    {error.email}
                                </Form.Control.Feedback>
                            </Form.Group>


                            <Row>
                                <Col>
                                    {
                                        edit
                                            ? <div>
                                                <Button variant="primary" type="button" className="me-2" onClick={handleSave} >
                                                    Save
                                                </Button>
                                                <Button variant="danger" type="button" onClick={handleCancel}>
                                                    Cancel
                                                </Button>
                                            </div>
                                            : <Button variant="primary" type="button" onClick={() => setEdit(true)}>
                                                Edit
                                            </Button>
                                    }

                                </Col>
                                <Col>
                                    <Button variant="primary" type="button" onClick={onPasswordChangeButt}>
                                        Change Password
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </div>

            <Modal show={showProfileModal} onHide={handleModalProfile}>
                <Modal.Header closeButton>
                    <Modal.Title>Profile Updated Successfully</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="profile-info-text">New Info</p>
                    <p><span className="profile-info-text">Username:</span> {username}</p>
                    <p><span className="profile-info-text">Email:</span> {email}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleModalProfile}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
            <PassChangeForm show={showChangePasswordModal} onHideAction={() => setShowChangePasswordModal(false)} setRequestError={setRequestError} successAction={onSuccessAction} />
        </>


    );

};

export default Profile;