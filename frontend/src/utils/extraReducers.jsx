
export const Base_url = "http://localhost:4000/api/v1"

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