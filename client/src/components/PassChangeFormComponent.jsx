

import { useState } from "react";
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { FirstServer } from "../services/firstServerService";
import secureLocalStorage from "react-secure-storage";
import { useNavigate } from "react-router-dom";


const PassChangeForm = ({ show, onHideAction, setRequestError, successAction }) => {

    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passConfig, setPassConfig] = useState('');
    const [error, setError] = useState({});
    const loginUser = secureLocalStorage.getItem('loginUser');
    const navigate = useNavigate();

    const validateForm = () => {
        let newErrors = {};
        if (!currentPassword || currentPassword === '') {
            newErrors.currentPassword = 'Current password is required';
        }
        if (!password || password === '') {
            newErrors.password = 'Password is required';
        }
        if (!passConfig || passConfig === '') {
            newErrors.passConfig = 'Password confirmation is required';
        }
        if (password !== passConfig) {
            newErrors.passConfig = 'Passwords do not match';
        }
        setError(newErrors);
        return newErrors;
    }


    const passHideAction = () => {
        setCurrentPassword('');
        setPassword('');
        setPassConfig('');
        setError({});
        onHideAction();
    }

    const submit = async (e) => {
        e.preventDefault();
        try {
            let newError = validateForm();
            if (newError && Object.keys(newError).length > 0) {
                return;
            }
            const firstServerService = new FirstServer(loginUser?.token);
            await firstServerService.updatePassword(currentPassword, password);
            successAction();
            passHideAction();
        }
        catch (err) {
            if (err?.response?.data?.type === 'unauthorized' || err?.response?.data?.type === 'invalid_token') {
                secureLocalStorage.removeItem('loginUser');
                navigate('/login');
                return;
            }
            setRequestError(err?.response?.data?.message || 'Something went wrong');
            passHideAction();
        }
    };

    const onInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'currentPassword') {
            setError({ ...error, currentPassword: '' });
            setCurrentPassword(value);
        }
        if (name === 'password') {
            setError({ ...error, password: '' });
            setPassword(value);
        }
        if (name === 'passConfig') {
            setError({ ...error, passConfig: '' });
            setPassConfig(value);
        }
    }

    return (
        <>
            <Modal show={show} onHide={passHideAction} backdrop="static" >
                <Modal.Header closeButton className="password-modal-header">
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body className="password-modal-body">
                    <Form onSubmit={submit}>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId="formCurrentPassword">
                                    <Form.Label>Current Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="currentPassword"
                                        value={currentPassword}
                                        onChange={(e) => onInputChange(e)}
                                        isInvalid={error.currentPassword}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {error.currentPassword}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => onInputChange(e)}
                                        isInvalid={error.password}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {error.password}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId="formPassConfig">
                                    <Form.Label>Password Confirmation</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="passConfig"
                                        value={passConfig}
                                        onChange={(e) => onInputChange(e)}
                                        isInvalid={error.passConfig}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {error.passConfig}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col>
                                <Button variant="primary" type="submit">
                                    Submit
                                </Button>
                            </Col>
                        </Row>

                    </Form>
                </Modal.Body>
            </Modal>

        </>
    )
};
export default PassChangeForm;