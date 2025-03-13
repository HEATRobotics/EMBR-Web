import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { InitialState } from './types';

const initialState: InitialState = {
    isLoggedIn: false,
};

export const loggingSlice = createSlice({
    name: 'logging',
    initialState,
    reducers: {
        setIsLoggedIn: (state, { payload }: PayloadAction<boolean>) => {
            state.isLoggedIn = payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setIsLoggedIn } = loggingSlice.actions;

export default loggingSlice.reducer;
