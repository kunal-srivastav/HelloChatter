import { useState, useRef } from 'react';
import { useNavigate, Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, updateProfile } from '../features/users/userThunks';
import { setClearMsg, setError } from '../features/users/userSlice';

function Register() {

  const navigate = useNavigate();
  const { userId } = useParams();
  const avatarRef = useRef(null);

  const dispatch = useDispatch();
  const { loading, error, successMsg } = useSelector((state) => state.users);
 
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: ""
  });

  const handleOnChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev , [name]: value}));
  };

  const handleForm = async (e) => {
    e.preventDefault();
    try {
      const userData = new FormData();
      userData.append("avatar", avatarRef.current.files[0]);
      userData.append("fullName", formData.fullName);
      userData.append("email", formData.email);
      if(userId) {
        userData.append("password", formData.password);
      }
      if(userId) {
        await dispatch(updateProfile({userId, userData})).unwrap();
      } else {
        await dispatch(registerUser(userData)).unwrap();
      }
      setTimeout(() => {
        navigate(`/chat`)
      }, 3000)
      setFormData({fullName: "", email: "", password: ""});
      avatarRef.current.value = null;
    } catch (err) {
      dispatch(setError(err || "Registration failed"));
    } finally {
      dispatch(setClearMsg());
    }
  };

  return (
    <div className="vh-100 d-flex justify-content-end align-items-center">
      <form onSubmit={handleForm} className="p-4 p-md-5 border rounded-3 bg-body-tertiary shadow position-relative"
        style={{ minWidth: "300px", maxWidth: "500px", width: "100%" }} >
          
        <h2 className="mb-4 text-center">{userId ? "Update profile" : "Register"}</h2>

        <div className="input-group mb-3">
          <input type="file" className="form-control" ref={avatarRef} id="inputGroupFile02" accept="image/*" />
          <label className="input-group-text" htmlFor="inputGroupFile02"> Upload </label>
        </div>

        <div className="form-floating mb-3">
          <input type="text" className="form-control" value={formData.fullName} id="floatingName" name="fullName" onChange={handleOnChange} placeholder="Full name" required={!userId}
          />
          <label htmlFor="floatingName">Full name</label>
        </div>

        <div className="form-floating mb-3">
          <input type="email" className="form-control" value={formData.email} id="floatingInput" name="email"
            onChange={handleOnChange}
            placeholder="name@example.com"
            required={!userId}
          />
          <label htmlFor="floatingInput">Email address</label>
        </div>

        {!userId && (
          <>
            <div className="form-floating mb-3">
              <input type="password" className="form-control" value={formData.password} id="floatingPassword"
                name="password"
                onChange={handleOnChange}
                placeholder="Password"
                required={!userId}
              />
              <label htmlFor="floatingPassword">Password</label>
            </div>

            <Link to="/" className="d-block mb-3 text-decoration-none">
              Already have an account?
            </Link>
          </>
        )}

        <button className="w-100 btn btn-lg btn-dark" type="submit" disabled={loading} >
          {userId ? "Update" : "Sign Up" }
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
  )
}

export default Register;