import { Container, Button, Form, Row, Col, Alert, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { FirstServer } from "../services/firstServerService";
import secureLocalStorage from "react-secure-storage";
import { useNavigate } from "react-router-dom";
import { ROLES, TICKET_CATEGORY } from "../utils/general";
import SecondServer from "../services/secondServerService";



const CreateTicket = () => {
    const [requestError, setRequestError] = useState(null);
    const [error, setError] = useState({});
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [text, setText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const loginUser = secureLocalStorage.getItem('loginUser');
    const [expireData, setExpireData] = useState(null);

    const firstServerService = new FirstServer(loginUser?.token);
    const secondServerService = new SecondServer(loginUser?.token);


    const validate = () => {
        let localError = {};
        if (!title) {
            localError.title = 'Title is required';
        }
        if (!category) {
            localError.category = 'Category is required';
        }
        if (!text) {
            localError.text = 'Text is required';
        }

        return localError;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'title') {
            setTitle(value);
            setError({ ...error, title: '' });
        }
        if (name === 'category') {
            setCategory(value);
            setError({ ...error, category: '' });
        }
        if (name === 'text') {
            setText(value);
            setError({ ...error, text: '' });
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            const localError = validate();
            if (Object.keys(localError).length > 0) {
                setError(localError);
                return;
            }

            const data = await secondServerService.expire({ title, category, text });
            setExpireData(data);
            setShowModal(true);

        }
        catch (err) {
            if (err?.response?.data?.type === 'unauthorized' || err?.response?.data?.type === 'invalid_token') {
                secureLocalStorage.removeItem('loginUser');
                navigate('/login');
                return;
            }
            setRequestError("Something went wrong");
        }


    };

    const handleCloseModal = () => {
        setShowModal(false);
    }



    const GenerateTicketInfo = function () {

        const handleExpire = (expire) => {
            let exp = "";
            if (expire?.days) {
                exp += `${expire.days} days `;
            }
            if (expire?.hours) {
                exp += `${expire.hours} hours `;
            }
            return exp;
        };

        return (
            <div>
                <p><span className="ticket-info">Title: </span>{title}</p>
                <p><span className="ticket-info">Category: </span>{category}</p>
                <p><span className="ticket-info">Text: </span> {text}</p>
                <p><span className="ticket-info">Expire: </span> {handleExpire(expireData?.expire)}</p>
            </div>);
    };

    const handleModalConfirm = async () => {
        try {
            const ticket = { title, category, text };
            const data = await firstServerService.createTicket(ticket);
            navigate('/');
            setShowModal(false);
        }
        catch (err) {
            if (err?.response?.data?.type === 'unauthorized' || err?.response?.data?.type === 'invalid_token') {
                secureLocalStorage.removeItem('loginUser');
                navigate('/login');
                return;
            }
            setShowModal(false);    
            setRequestError("Something went wrong");
        }
    }



    return (
        <Container fluid className='mt-5'>
            <Row>
                <Col className="d-flex justify-content-center">
                    <h1>Create Ticket</h1>
                </Col>
            </Row>

            <Row>
                <Col>
                    {requestError && <Alert variant='danger' onClose={() => setRequestError(null)} dismissible >
                        <Alert.Heading>Server Error!</Alert.Heading>
                        <p>
                            {requestError}
                        </p>
                    </Alert>}
                </Col>
            </Row>

            <div className="create-ticket-container">
                <Form onSubmit={submit}>
                    <Row>
                        <Col md={9} className="">
                            <Form.Group className="mb-3" controlId="formTitle">
                                <Form.Label className="create-ticket-label">Title</Form.Label>
                                <Form.Control type="text" name='title' placeholder="Enter title" value={title} onChange={(e) => handleInputChange(e)} isInvalid={error?.title} />
                                <Form.Control.Feedback type="invalid">
                                    {error.title}
                                </Form.Control.Feedback>

                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3" controlId="fromCategory">
                                <Form.Label className="create-ticket-label">Category</Form.Label>
                                <Form.Select aria-label="Default select example" name='category' value={category} onChange={(e) => handleInputChange(e)} isInvalid={error?.category}>
                                    <option>Select Category</option>
                                    {
                                        Object.keys(TICKET_CATEGORY).map((key, index) => {
                                            return <option key={index} value={TICKET_CATEGORY[key]}>{TICKET_CATEGORY[key].toUpperCase()}</option>
                                        })
                                    }
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {error.category}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Form.Group className="mb-3" controlId="formText">
                                <Form.Label className="create-ticket-label">Text</Form.Label>
                                <Form.Control as="textarea" rows={3} value={text} name="text" onChange={(e) => handleInputChange(e)} isInvalid={error?.text} />
                                <Form.Control.Feedback type="invalid">
                                    {error.text}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col className="d-flex justify-content-center">
                            <Button variant="danger" className="me-2" type="button" onClick={() => navigate('/')}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Ticket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <GenerateTicketInfo />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleModalConfirm}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>


        </Container>
    )
};

export default CreateTicket;    