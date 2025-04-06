import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`; // Adjust this based on your backend URL

const initialState = {
    attendanceRecords: [],
    salaryRecords: [],
    loading: false,
    error: null,
};

// Mark Attendance
export const markAttendance = createAsyncThunk(
    "staffManagement/markAttendance",
    async (attendanceData, thunkAPI) => {
        try {
            const response = await axios.post(`${API_URL}/attendance/mark`, attendanceData);
            return response.data.attendance;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Get Attendance Records
export const getAttendanceRecords = createAsyncThunk(
    "staffManagement/getAttendanceRecords",
    async (params, thunkAPI) => {
        try {
            const response = await axios.get(`${API_URL}/attendance`, { params });
            return response.data.attendanceRecords;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Create Salary Record
export const createSalaryRecord = createAsyncThunk(
    "staffManagement/createSalaryRecord",
    async (salaryData, thunkAPI) => {
        try {
            const response = await axios.post(`${API_URL}/salary/create`, salaryData);
            return response.data.salaryRecord;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Mark Salary as Paid
export const markSalaryPaid = createAsyncThunk(
    "staffManagement/markSalaryPaid",
    async (salaryRecordId, thunkAPI) => {
        try {
            const response = await axios.patch(`${API_URL}/salary/paid/${salaryRecordId}`);
            return response.data.salaryRecord;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Get Salary Records
export const getSalaryRecords = createAsyncThunk(
    "staffManagement/getSalaryRecords",
    async (params, thunkAPI) => {
        try {
            const response = await axios.get(`${API_URL}/salary`, { params });
            return response.data.salaryRecords;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

const staffManagementSlice = createSlice({
    name: "staffManagement",
    initialState,
    reducers: {
        clearStaffManagementState: (state) => {
            state.attendanceRecords = [];
            state.salaryRecords = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(markAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(markAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceRecords.push(action.payload);
            })
            .addCase(markAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getAttendanceRecords.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAttendanceRecords.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceRecords = action.payload;
            })
            .addCase(getAttendanceRecords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createSalaryRecord.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSalaryRecord.fulfilled, (state, action) => {
                state.loading = false;
                state.salaryRecords.push(action.payload);
            })
            .addCase(createSalaryRecord.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(markSalaryPaid.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(markSalaryPaid.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.salaryRecords.findIndex(
                    (record) => record._id === action.payload._id
                );
                if (index !== -1) {
                    state.salaryRecords[index] = action.payload;
                }
            })
            .addCase(markSalaryPaid.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getSalaryRecords.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSalaryRecords.fulfilled, (state, action) => {
                state.loading = false;
                state.salaryRecords = action.payload;
            })
            .addCase(getSalaryRecords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearStaffManagementState } = staffManagementSlice.actions;
export default staffManagementSlice.reducer;