
export const Base_url = process.env.BASE_URL;

export const uiState = {
    error: null,
    successMsg: "",
    loading: false
}

export const handleOnPending = (state) => {
    state.loading = true,
    state.error = null,
    state.successMsg = null
}

export const handleOnRejected = (state, action) => {
    state.loading = false,
    state.error = action.payload,
    state.successMsg = null
}