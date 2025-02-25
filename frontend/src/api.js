import axios from 'axios';

const API_URL = "http://localhost:8000";

export const startNewGame = async (mode) => {
    try {
        const response = await axios.post(`${API_URL}/new_game`, null, { params: { mode } });
        return response.data;
    } catch (error) {
        console.error("Error starting new game:", error);
        throw error;
    }
};

export const makeMove = async (index) => {
    try {
        const response = await axios.post(`${API_URL}/make_move`, { index });
        return response.data;
    } catch (error) {
        console.error("Error making move:", error.response?.data || error.message);
        throw error;
    }
};

export const getScore = async () => {
    try {
        const response = await axios.get(`${API_URL}/get_score`);
        return response.data;
    } catch (error) {
        console.error("Error fetching scores:", error);
        throw error;
    }
};