import { Outlet, Link, useNavigate } from "react-router-dom";
import { Container, Nav, Navbar } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import secureLocalStorage from "react-secure-storage";
import { FirstServer } from "./services/firstServerService";

function Layout() {

    const navigator = useNavigate();
    const loginUser = secureLocalStorage.getItem('loginUser');

    const logoutHandler = async () => {
        try {
            console.log('logout');
            const firstServerService = new FirstServer(loginUser?.token);   
            await firstServerService.logout();
            secureLocalStorage.removeItem('loginUser');
            navigator('/');
        }
        catch (err) {
            console.error(err);
            secureLocalStorage.removeItem('loginUser');
            navigator('/');
        }

    };

    const Headers = () => {
        return (

            <Navbar bg="primary" data-bs-theme="dark" expand="lg">
                <Container fluid>

                    <Nav className="me-auto nav-link-large">
                        <Nav.Link as={Link} to={'/'}  >Tickets</Nav.Link>
                        {loginUser && <Nav.Link as={Link} to={'/profile'} >@{loginUser?.username}</Nav.Link>}
                    </Nav>

                    <Nav className="nav-link-large">
                        {loginUser
                            ? <Nav.Link className="icon-size" onClick={logoutHandler}><i className="bi bi-box-arrow-right logout-icon-size"></i></Nav.Link>
                            : <Nav.Link as={Link} to={'/login'}>Login</Nav.Link>
                        }
                    </Nav>
                </Container>
            </Navbar>
        );
    };

    return (
        <>
            <Headers />
            <Outlet />
        </>




    );
}

export default Layout;