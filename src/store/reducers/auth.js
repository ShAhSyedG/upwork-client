import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  session: null,
  orgId: null,
};

const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action) {
      state.session = { ...state.session, ...action.payload };
    },
    setOrg(state, action) {
      state.orgId = action.payload;
    },
  },
});

export const { setSession: authSetSession, setOrg: authSetOrg } =
  AuthSlice.actions;
export default AuthSlice.reducer;
