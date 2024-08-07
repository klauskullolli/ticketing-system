import { Row, Col, Button, Container } from 'react-bootstrap';



const TextBlock = ({ textBlock, active, editAction, deleteAction }) => {

    const handleTextNewLines = (text) => {  
        return text.split('\n').map((str, index) => {
            return <p className='text-block-comment' key={index}>{str}</p>
        });
    }


    return (
        <div className='text-block'>
            <Row className='mt-2'>
                <Col>
                    {handleTextNewLines(textBlock.text)}
                </Col>
            </Row>
            <Row className='mt-2'>
                <Col className='d-flex justify-content-start'>
                    <p className='text-block-user'>@{textBlock.owner}</p>
                </Col>
                <Col className='d-flex justify-content-end'>
                    <p className='text-block-date'>Date: {textBlock.timestamp}</p>
                </Col>
            </Row>
            {
                active && (
                    <Row>
                        <Col className='d-flex justify-content-end'>
                            <Button  variant='outline-light' className='text-block-butt me-2' size="sm" onClick={() => editAction(textBlock)}><i className="bi bi-pencil-fill"></i></Button>
                            <Button variant='outline-light' size="sm" className='text-block-butt' onClick={() => deleteAction(textBlock)}><i className="bi bi-trash3-fill"></i></Button>
                        </Col>
                    </Row>
                )
            }

        </div>

    );

};

export default TextBlock;
