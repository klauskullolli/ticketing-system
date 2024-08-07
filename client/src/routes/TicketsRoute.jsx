import { Container, Row, Col, Button, Alert, FormControl } from "react-bootstrap";
import { useState, useEffect } from "react";
import { FirstServer } from "../services/firstServerService";
import TicketTable from "../components/TicketTableComponent";
import secureLocalStorage from "react-secure-storage";
import SecondServer from "../services/secondServerService";
import { ROLES } from "../utils/general";
import { useNavigate } from "react-router-dom";

const Tickets = () => {

    const [tickets, setTickets] = useState([]);
    const [requestError, setRequestError] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const loginUser = secureLocalStorage.getItem('loginUser');
    const [auth, setAuth] = useState(false);
    const navigate = useNavigate();



    useEffect(() => {
        const loadTickets = async () => {
            try {

                const firstServerService = new FirstServer(loginUser?.token);
                const secondServerService = new SecondServer(loginUser?.token);
                let newAuth = false;

                try {
                    const firstServerService = new FirstServer(loginUser?.token);
                    await firstServerService.getAuth();
                    newAuth = true;
                    setAuth(true);
                } catch (error) {
                    secureLocalStorage.removeItem('loginUser');
                    setAuth(false);
                }

                let data = await firstServerService.getTickets(0, pageSize);
                if (loginUser?.role === ROLES.ADMIN && newAuth) {
                    data = await secondServerService.expire(data);
                }

                setTickets(data);
            } catch (error) {
                setTickets([]);
                setRequestError("Something went wrong");
            }

        };
        loadTickets();
        console.log('Tickets');

        return () => {
            setPage(0);
            setTickets([]);
            setRequestError(null);
            setSearchValue('');
        }

    }, []);


    const handleNextBtn = async () => {
        console.log('Next');
        let newPage = page + 1;
        setPage(newPage);
        try {
            const firstServerService = new FirstServer(loginUser?.token);
            const secondServerService = new SecondServer(loginUser?.token);
            let data = [];
            if (searchValue) {
                data = await firstServerService.searchTickets(searchValue, newPage, pageSize);
            }
            else {
                data = await firstServerService.getTickets(newPage, pageSize);
            }
            if (loginUser?.role === ROLES.ADMIN && auth) {
                data = await secondServerService.expire(data);
            }

            setTickets(data);
        } catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'invalid_token') {
                secureLocalStorage.removeItem('loginUser');
                setAuth(false);
                navigate('/');
                return;
                
            }
            setRequestError("Something went wrong");
        }
    };

    const handlePrevBtn = async () => {
        console.log('Prev');
        let newPage = page - 1;
        setPage(newPage);
        try {
            const firstServerService = new FirstServer(loginUser?.token);
            const secondServerService = new SecondServer(loginUser?.token);
            let data = [];
            if (searchValue) {
                data = await firstServerService.searchTickets(searchValue, newPage, pageSize);
            }
            else {
                data = await firstServerService.getTickets(newPage, pageSize);
            }
            if (loginUser?.role === ROLES.ADMIN && auth) {
                data = await secondServerService.expire(data);
            }
            setTickets(data);
        } catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'invalid_token') {
                secureLocalStorage.removeItem('loginUser');
                setAuth(false);
                navigate('/');
                return;
                
            }
            setRequestError("Something went wrong");
        }
    };

    const handleAddNewBtn = () => {
        navigate('/create_ticket');
    };


    const handleShowAllBtn = async () => {
        try {
            const firstServerService = new FirstServer(loginUser?.token);
            const secondServerService = new SecondServer(loginUser?.token);
            let newPage = 0;
            setPage(newPage);
            let data = await firstServerService.getTickets(newPage, pageSize);
            if (loginUser?.role === ROLES.ADMIN && auth) {
                data = await secondServerService.expire(data);
            }
            setTickets(data);
            setSearchValue('');
        } catch (error) {
            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'invalid_token') {
                secureLocalStorage.removeItem('loginUser');
                setAuth(false);
                navigate('/');
                return;
                
            }
            setRequestError("Something went wrong");
        }
    };

    const handleSearchBtn = async () => {
        try {
            const firstServerService = new FirstServer(loginUser?.token);
            const secondServerService = new SecondServer(loginUser?.token);
            let newPage = 0;
            setPage(newPage);
            let data = await firstServerService.searchTickets(searchValue, newPage, pageSize);
            if (loginUser?.role === ROLES.ADMIN && auth) {
                
                data = await secondServerService.expire(data);
            
            }
            setTickets(data);

        } catch (error) {

            if (error?.response?.data?.type === 'unauthorized' || error?.response?.data?.type === 'invalid_token') {
                secureLocalStorage.removeItem('loginUser');
                setAuth(false);
                navigate('/');
                return;
                
            }
            setRequestError("Something went wrong");
        }
    };

    return (
        <Container fluid>
            <Row className="mt-3 mb-2">
                <h1>Tickets</h1>
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

            <Row className="mb-4"  >
                <Col md={4}>
                    <Button variant="outline-primary" onClick={handleShowAllBtn}>Show All</Button>
                </Col>
                <Col md={7} className="d-flex justify-content-end">
                    <FormControl
                        type="search"
                        placeholder="Search"
                        className="me-2"
                        aria-label="Search"
                        value={searchValue}
                        onChange={(e) => { setSearchValue(e.target.value) }}
                    />
                </Col>
                <Col className="d-flex justify-content-end">
                    <Button variant="outline-success" disabled={searchValue == ''} onClick={handleSearchBtn} >Search</Button>
                </Col>
            </Row>

            <Row className="md-2">
                <Col>
                    <TicketTable data={tickets} />
                </Col>
            </Row>
            <Row className='justify-content-center'>
                <Col />
                <Col className='d-flex justify-content-end' >

                    {page > 0 && <Button size='sm' variant='light' className='mx-1 small-size' onClick={handlePrevBtn}>Previous</Button>}
                    {(tickets && tickets.length > 0) && <Button variant='light' size='sm small-size' className='mx-1' onClick={handleNextBtn}>Next</Button>}
                </Col>
                <Col className='text-start'>
                    <span className='page-span'>Page {page}</span>
                </Col>
                <Col md={2} className='d-flex justify-content-end'>
                    <Button variant='success' className='mx-2' onClick={handleAddNewBtn}>New <i className="bi bi-plus-circle"></i></Button>
                </Col>

            </Row>

        </Container>
    );
}

export default Tickets;