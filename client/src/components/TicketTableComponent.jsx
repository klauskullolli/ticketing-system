import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Table, ListGroup, ButtonGroup, Button, Container } from 'react-bootstrap';
import secureLocalStorage from 'react-secure-storage';
import { ROLES } from '../utils/general';
import { useNavigate } from 'react-router-dom'; 

const TicketTable = ({ data, setData, setError }) => {

    const navigator = useNavigate();

    const loginUser = secureLocalStorage.getItem('loginUser');   

    const handleEdit = (id) => {
        console.log('Edit', id);
        navigator(`/ticket/${id}`); 
    };

    const convertExpire = (expire)  => {
        return `${expire?.days} days, ${expire?.hours} hours`;
    }



    return (
        <Table striped bordered hover >
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>State</th>
                    <th>Timestamp</th>
                    <th>Owner</th>  
                    {ROLES.ADMIN === loginUser?.role && <th>Expire</th>}


                    <th></th>    
                </tr>
            </thead>
            <tbody>

                {(!data || data.length === 0) ? <tr><td colSpan='16' className='text-center fs-4'>No data found</td></tr> :


                    data.map((item, index) => (
                        <tr key={index}>
                            <td>{item?.id}</td>
                            <td>{item?.title}</td>
                            <td>{item?.category?.toUpperCase()}</td>
                            <td>{item?.state?.toUpperCase()}</td>
                            <td>{item?.timestamp}</td>
                            <td>{item?.owner === loginUser?.username? 'you' : item.owner}</td>
                            {ROLES.ADMIN === loginUser?.role && <td>{convertExpire(item.expire)}</td>}
                            <td>
                                <div className="d-flex justify-content-center align-items-center button-container">
                                    <Button variant="warning"  className='mx-1' onClick={() => handleEdit(item.id)}><i className="bi bi-arrow-right-circle"></i></Button>
                                </div>
                            </td>
                        </tr>
                    ))}
            </tbody>
        </Table>

    );
}


export default TicketTable; 