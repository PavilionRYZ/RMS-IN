import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT_SUCCESS,
    LOGOUT_FAIL,
    CLEAR_ERRORS,
    CLEAR_POPUP_MESSAGE 
} from "../constants/userConstant";
// Compare this snippet from Frontend/src/redux/Actions/userAction.js:
import axios from "axios";


// Login action
export const login = (email, password) => async (dispatch) => {
    try {
        dispatch({ type: LOGIN_REQUEST });

        const config = {
            headers: {
                "Content-Type": "application/json",
                withCredentials: true,
            },
        };

        const { data } = await axios.post(
            "/api/users/login",
            { email, password },
            config
        );

        dispatch({
            type: LOGIN_SUCCESS,
            payload: data.user,
        });

        localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (error) {
        dispatch({
            type: LOGIN_FAIL,
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        });
    }
}

// Logout action
export const logout = () => (dispatch) => {
 try {
    axios.get("/api/v1/logout");
    dispatch({ type: LOGOUT_SUCCESS });
 } catch (error) {
    dispatch({
        type: LOGOUT_FAIL,
        payload:error.message.response.data.message || "Logout Failed",
    });
 }
}

// Clear Errors
export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
}

// Clear Popup Message
export const clearPopupMessage = () => (dispatch) => {
    dispatch({ type: CLEAR_POPUP_MESSAGE });
}