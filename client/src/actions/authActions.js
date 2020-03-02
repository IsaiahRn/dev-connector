import axios from 'axios';
import jwt_decode from 'jwt-decode';
import setAuthToken from '../utils/setAuthToken';
import { GET_ERRORS, SET_CURRENT_USER } from "./types"

const performAction = (type, payload) => ({
    type,
    payload,
  });

  // Register User
export const registerUser = (userData, history) => dispatch => {
    axios
        .post('/api/users/register', userData)
        .then(res => history.push('/login'))
        .catch(err => dispatch(performAction(GET_ERRORS, err.response.data)))
};

// Login User
export const loginUser = (userData) => dispatch => {
    axios
        .post('api/users/login', userData)
        .then(res => {
            // Save to localstorage
            const { token } = res.data;
            // Set token to localStorage
            localStorage.setItem('jwtToken', token);
            // Set token to Auth header
            setAuthToken(token);
            // Decode token
            const decoded = jwt_decode(token);
            // Set current user
            dispatch(setCurrentUser(decoded));
        })
        .catch(err => dispatch(performAction(GET_ERRORS, err.response.data)))
};

// Set logged in user
export const setCurrentUser = (decoded) => {
    return performAction(SET_CURRENT_USER, decoded);
}

// Log user out
export const logoutUser = () => dispatch => {
    // Remove token from localstorage
    localStorage.removeItem('jwtToken');
    // Remove auth header for future requests
    setAuthToken(false);
    // Set current user to {} which will set isAuthenticated to false
    dispatch(setCurrentUser({}));
}