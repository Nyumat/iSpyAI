import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  userId: "123",
  jobId: null,
  jobStatus: "",
  jobProgress: "",
  jobResult: "",
  jobError: "",
  url: "",
  video: "",
  blog: "",
};

export const submitJob = createAsyncThunk(
  "session/submitJob",
  async (values: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://video-publi-18ljnttgnyky9-1470409612.us-west-2.elb.amazonaws.com/submitJob",
        values,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.userId = action.payload;
    },
    setUrl: (state, action) => {
      state.url = action.payload;
    },
    setVideo: (state, action) => {
      state.video = action.payload;
    },
    setBlog: (state, action) => {
      state.blog = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(submitJob.fulfilled, (state, action) => {
      state.jobId = action.payload.jobId;
    });
    builder.addCase(submitJob.rejected, (state: any, action) => {
      state.jobError = action.payload;
    });
  },
});

export const { setSession, setUrl, setVideo, setBlog } = sessionSlice.actions;

export default sessionSlice.reducer;
