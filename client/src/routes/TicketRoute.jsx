import { Container, Row, Col, Alert, Button, Form, FormControl, Modal } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState, useEffect } from "react";
import { FirstServer } from "../services/firstServerService";
import secureLocalStorage from "react-secure-storage";
import { useNavigate, useParams } from "react-router-dom";
import { ROLES, TICKET_CATEGORY, TICKET_STATUS } from "../utils/general";
import TextBlock from "../components/TextBlockComponent";




const Ticket = () => {

    const [requestError, setRequestError] = useState(null);
    const [ticket, setTicket] = useState(null);
    const loginUser = secureLocalStorage.getItem('loginUser');
    const firstServerService = new FirstServer(loginUser?.token);
    const { id } = useParams();
    const navigate = useNavigate();
    const [comment, setComment] = useState('');
    const [lastText, setLastText] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [editCategory, setEditCategory] = useState(false);
    const [editState, setEditState] = useState(false);
    const [category, setCategory] = useState('');
    const [state, setState] = useState('');


    useEffect(() => {
        const loadTicket = async () => {
            try {
                const data = await firstServerService.getTicket(id);
                setTicket(data);
                setCategory(data?.category);
                setState(data?.state);
            } catch (error) {
                if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'invalid_token') {
                    secureLocalStorage.removeItem('loginUser');
                    navigate('/login');
                    return;
                }
                setRequestError("Something went wrong");
            }

        };
        loadTicket();

        return () => {
            setTicket(null);
            setRequestError(null);
            setComment('');
            setLastText(null);
        }

    }, []);

    const commentGenerator = (textBlock, index) => {
        if (textBlock.owner === loginUser?.username) {
            let newTextBlock = { ...textBlock, owner: 'you' };
            let active = false;
            console.log(index);
            if ((index === ticket?.textBlocks?.length - 1) && !isClosedTicket()) {
                active = true;
            }

            if (active) {
                return <Row className="mb-3" key={index}>
                    <Col>
                        <TextBlock textBlock={newTextBlock} active={active} editAction={handleTextBlockEdit} deleteAction={handleTextBlockDelete} />
                    </Col>
                    <Col>
                    </Col>
                </Row>
            }
            else {
                return <Row className="mb-3" key={index}>
                    <Col>
                        <TextBlock textBlock={newTextBlock} active={active} />
                    </Col>
                    <Col>
                    </Col>
                </Row>
            }

        } else {
            return <Row className="mb-3" key={index}>
                <Col>
                </Col>
                <Col>
                    <TextBlock textBlock={textBlock} active={false} />
                </Col>
            </Row>
        }
    };

    const handleAddButton = async () => {
        try {
            if (comment === '') {
                return;
            }
            const data = await firstServerService.addTextBlock(id, comment);
            setComment('');
            setTicket({ ...ticket, textBlocks: [...ticket.textBlocks, data] });
        } catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'invalid_token') {
                secureLocalStorage.removeItem('loginUser');
                navigate('/login');
                return;
            }
            setRequestError('Server Error');
        }
    };

    const isClosedTicket = () => {
        return ticket?.state === TICKET_STATUS.CLOSED;
    }

    const getOwner = () => {
        if (ticket?.owner === loginUser?.username) {
            return 'you';
        } else {
            return ticket?.owner;
        }
    };

    const handleTextBlockInput = (e) => {
        e.preventDefault()
        e.target.style.height = 'inherit';
        e.target.style.height = `${e.target.scrollHeight}px`;
        setComment(e.target.value);
    };

    const handleCloseModalText = () => {
        setShowEdit(false);
    };

    const handleEditModalText = async () => {
        try {
            const data = await firstServerService.updateTextBlock(lastText.id, lastText?.text);
            setTicket({ ...ticket, textBlocks: ticket.textBlocks.map((textBlock) => textBlock.id === lastText.id ? data : textBlock) });
            setShowEdit(false);
        } catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'invalid_token') {
                secureLocalStorage.removeItem('loginUser');
                navigate('/login');
                return;
            }
            setRequestError('Server Error');
            setShowEdit(false);
        }
    };

    const handleTextBlockEdit = (textBlock) => {
        setLastText(textBlock);
        setShowEdit(true);
    };

    const handleTextBlockDelete = async (textBlock) => {
        try {
            await firstServerService.deleteTextBlock(textBlock.id);
            setTicket({ ...ticket, textBlocks: ticket.textBlocks.filter((block) => block.id !== textBlock.id) });
        } catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'invalid_token') {
                secureLocalStorage.removeItem('loginUser');
                navigate('/login');
                return;
            }
            setRequestError('Server Error');
        }
    };

    const handleEditCommentModalInputChange = (e) => {
        e.preventDefault()
        e.target.style.height = 'inherit';
        e.target.style.height = `${e.target.scrollHeight}px`;
        setLastText({ ...lastText, text: e.target.value });

    };

    const saveCategory = async () => {
        try {
            let data = await firstServerService.changeCategory(id, category);
            setTicket({ ...ticket, category: category });
            setEditCategory(false);
        }
        catch(error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'invalid_token') {
                secureLocalStorage.removeItem('loginUser');
                navigate('/login');
                return;
            }
            setRequestError('Server Error');
            setCategory(ticket?.category);
            setEditCategory(false);
        }
    };

    const saveState = async () => {
        try {
            let data = await firstServerService.changeState(id, state);
            setTicket({ ...ticket, state: state });
            setEditState(false);

        } catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'invalid_token') {
                secureLocalStorage.removeItem('loginUser');
                navigate('/login');
                return;
            }

            setRequestError('Server Error');
            setState(ticket?.state);
            setEditState(false);
        }
    };

    const handleChangeCategoryBut = () => {
        setEditCategory(true);
    };

    const handleChangeStateBut = () => {
        setEditState(true);
    };

    const handleStateCancel = () => {
        setEditState(false);
        setState(ticket?.state);
    };

    const handleCategoryCancel = () => {
        setEditCategory(false);
        setCategory(ticket?.category);
    };

    return (
        <Container fluid >
            <Row className="mt-3 mb-2">
                <Col className="d-flex justify-content-end" md={6}>
                    <h1>Ticket #{id}</h1>
                </Col>
                <Col className="d-flex justify-content-end" md={6}>
                    <p className="create-by-p">Created by: <span className='creator-span'>@{getOwner()}</span></p>
                </Col>
            </Row>

            <Row className="mb-2">
                <Col>
                    {requestError && <Alert variant='danger' onClose={() => setRequestError(null)} dismissible>
                        <p>
                            {requestError}
                        </p>
                    </Alert>}
                </Col>
            </Row>

            {
                ticket && <div className="ticket-container">
                    <Row className="mb-2">
                        <Col md={6} >
                            <Form.Group controlId="formTitle">
                                <Form.Label className="ticket-label" >Title:</Form.Label>
                                <Form.Control
                                    className="ticket-input"
                                    type="text"
                                    name="title"
                                    value={ticket?.title}
                                    disabled={true}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId="formCategory">
                                <Form.Label className="ticket-label">Category: </Form.Label>
                                <Form.Control as="select" name="category" value={category} disabled={!editCategory} onChange={e => setCategory(e.target.value)} >
                                    <option value="">{ }</option>
                                    {Object.values(TICKET_CATEGORY).map((category, index) => <option key={index} value={category}>{category.toUpperCase()}</option>)}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId="formState">
                                <Form.Label className="ticket-label">State: </Form.Label>
                                <Form.Control as="select" name="state" value={state} disabled={!editState} onChange={e => setState(e.target.value)}>
                                    <option value="">{ }</option>
                                    {Object.values(TICKET_STATUS).map((category, index) => <option key={index} value={category}>{category.toUpperCase()}</option>)}
                                </Form.Control>
                            </Form.Group>

                        </Col>
                    </Row>


                    <Row className="mb-2">
                        <Col md={6}>
                        </Col>
                        {
                            loginUser?.role === ROLES.ADMIN
                                ? <Col className="d-flex justify-content-end" md={3}>
                                    {editCategory &&
                                        <div>
                                            <Button className="me-2" size="sm" onClick={saveCategory}>Save</Button>
                                            <Button size="sm" onClick={handleCategoryCancel}>Cancel</Button>
                                        </div>
                                    }

                                    {!editCategory && <Button size="sm" onClick={handleChangeCategoryBut} disabled= {ticket?.state === TICKET_STATUS.CLOSED}>Change Category</Button>}
                                </Col>
                                : <Col md={3}></Col>
                        }

                        {
                            ((ticket?.state === TICKET_STATUS.OPEN && loginUser?.username === ticket.owner) || loginUser?.role === ROLES.ADMIN) &&
                            <Col className="d-flex justify-content-end" md={3}>
                                {editState &&
                                    <div>
                                        <Button className="me-2" size="sm" onClick={saveState}>Save</Button>
                                        <Button size="sm" onClick={handleStateCancel}>Cancel</Button>
                                    </div>
                                }

                                {!editState &&
                                    <Button size="sm" onClick={handleChangeStateBut}>Change State</Button>
                                }
                            </Col>
                        }

                    </Row>
                    <Row>
                        <Col>
                            <p className="ticket-label">Comments:</p>
                        </Col>
                    </Row>

                    <div className="ticket-comment-scroll">
                        {ticket?.textBlocks?.map((textBlock, index) => commentGenerator(textBlock, index))
                        }
                    </div>

                    <div className="d-flex mt-3">
                        <Form.Control
                            as={'textarea'}
                            placeholder="Comment..."
                            className="me-4"
                            rows={1}
                            value={comment}
                            disabled={isClosedTicket()}
                            onChange={(e) => { handleTextBlockInput(e) }}
                        />
                        <div>
                            <Button variant="success" onClick={handleAddButton} disabled={isClosedTicket()}><i className="bi bi-send-fill"></i></Button>
                        </div>
                    </div>
                </div>
            }

            <Modal show={showEdit} onHide={handleCloseModalText}>
                <Modal.Header closeButton>
                    <Modal.Title>{`Edit Comment`}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        as={'textarea'}
                        placeholder="Comment..."
                        className="me-4"
                        rows={1}
                        value={lastText?.text}
                        onChange={(e) => { handleEditCommentModalInputChange(e) }}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModalText}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleEditModalText}>
                        Edit
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );

};

export default Ticket;  