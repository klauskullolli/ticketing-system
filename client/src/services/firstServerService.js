import config from "../config";
import axios from 'axios';

const server1 = config?.server1 || 'http://localhost:3001';




const FirstServer = function (token) {
    this.token = token;

    this.login = async (user) => {
        try {
            let response = await axios.post(`${server1}/login`, user);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    this.signup = async (user) => {
        try {
            let response = await axios.post(`${server1}/signup`, user);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    this.logout = async () => {
        try {
            let response = await axios.post(`${server1}/logout`, {}, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    this.getAuth = async () => {
        try {
            let response = await axios.get(`${server1}/auth`, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    };

    this.getTickets = async (page, size) => {
        try {
            if (page === undefined || size === undefined) {
                let response = await axios.get(`${server1}/ticket`);
                return response.data;
            } else {
                let response = await axios.get(`${server1}/ticket?page=${page}&size=${size}`);
                return response.data;
            }


        } catch (error) {
            throw error;
        }
    }

    this.getTicket = async (id) => {
        try {
            let response = await axios.get(`${server1}/ticket/${id}`, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    this.createTicket = async (ticket) => {
        try {
            let response = await axios.post(`${server1}/ticket`, ticket, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    this.updateTicketState = async (id, state) => {
        try {
            let response = await axios.put(`${server1}/ticket/${id}/state/${state}`, {}, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    this.updateTicketCategory = async (id, category) => {
        try {
            let response = await axios.put(`${server1}/ticket/${id}/category/${category}`, {}, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    };


    this.addTextBlock = async (ticket_id, text) => {
        try {
            let response = await axios.post(`${server1}/text_block/ticket/${ticket_id}`, { text }, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    this.updateTextBlock = async (id, text) => {
        try {
            let response = await axios.put(`${server1}/text_block/${id}`, { text }, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    this.deleteTextBlock = async (id) => {
        try {
            let response = await axios.delete(`${server1}/text_block/${id}`, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    this.changeCategory = async (id, category) => {
        try {
            let response = await axios.put(`${server1}/ticket/${id}/category/${category}`, {}, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    this.changeState = async (id, state) => {
        try {
            let response = await axios.put(`${server1}/ticket/${id}/state/${state}`, {}, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    this.searchTickets = async (word, page, size) => {
        try {
            let response = await axios.get(`${server1}/ticket/search/${word}?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            throw error;
        }

    };

    this.getProfile = async () => {
        try {
            let response = await axios.get(`${server1}/profile`, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    this.updateProfile = async (profile) => {
        try {
            let response = await axios.put(`${server1}/profile`, profile, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    this.updatePassword = async (oldPassword, newPassword) => {
        try {
            let response = await axios.put(`${server1}/profile/change_password`, { oldPassword, newPassword }, { headers: { Authorization: `Bearer ${this.token}` } });
            return response.data;
        } catch (error) {
            throw error;
        }
    };



}




export { FirstServer };   
