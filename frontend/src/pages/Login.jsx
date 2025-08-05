import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"
import { loginUser } from "../features/users/userThunks";
import { setClearMsg, setError } from "../features/users/userSlice";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, loading, successMsg } = useSelector(state => state.users);

  const dispatch = useDispatch()

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({email, password})).unwrap();
      setEmail("");
      setPassword("");
      setTimeout(() => {
        navigate("/chat");
      }, 3000);
    } catch (err) {
      dispatch(setError(err || "Login Failed"));
    } finally {
      setTimeout(() => {
        dispatch(setClearMsg());
      }, 3000);
    }
  };

  return (
    <div className="vh-100 d-flex justify-content-end align-items-center">
      <form
        onSubmit={handleLogin}
        className="p-4 p-md-5 border rounded-3 bg-body-tertiary shadow position-relative"
        style={{ minWidth: "300px", maxWidth: "400px", width: "100%" }}
      >
        <h2 className="mb-4 text-center text-dark">Sign In</h2>

        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="floatingInput"
            placeholder="name@example.com"
            required
          />
          <label htmlFor="floatingInput">Email address</label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="floatingPassword"
            placeholder="Password"
            required
          />
          <label htmlFor="floatingPassword">Password</label>
        </div>

        <Link to="/register" className="d-block mb-3 text-decoration-none">
          Create an Account
        </Link>

        <button className="w-100 btn btn-lg btn-dark" type="submit" disabled={loading}>
          Log In
        </button>
        {loading && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-25" style={{ zIndex: 1055 }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </form>
        {error && (
          <div className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-2" role="alert">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-2" role="alert">
            {successMsg}
          </div>
        )}
    </div>
  );
}

export default Login;
