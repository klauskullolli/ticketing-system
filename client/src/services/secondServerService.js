import config from "../config";
import axios from "axios";

const server2 = config?.server2 || 'http://localhost:3002'; 

const SecondServer = function (token) {
    this.token = token;

    this.expire = async (ticket) => {
        try {
            let response = await axios.post(`${server2}/expire`, ticket, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    
    };

}; 


export default SecondServer;    


