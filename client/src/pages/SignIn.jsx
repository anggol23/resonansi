import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure("Please fill all the fields"));
    }
    try {
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        return dispatch(signInFailure(data.message));
      }

      if (res.ok) {
        sessionStorage.setItem("token", data.access_token); // Simpan token
        dispatch(signInSuccess(data));
        // Redirect berdasarkan role
        if (data.role === "admin") {
          navigate("/dashboard?tab=users");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* {KIRI} */}
        <div className="flex-1">
          <Link to="/" className="font-extrabold dark:text-white text-3xl">
            Dashboard
            <span className="px-2 py-1 bg-red-600 rounded-lg text-white">
              Resonansi
            </span>
          </Link>
          <p className="text-sm mt-5">
            Ini merupakan dashboard resonansi. Anda bisa masuk menggunakan email
            dan kata sandi Anda, atau melalui Google.
          </p>
        </div>
        {/* {Kanan} */}

        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Masukan Email" />
              <TextInput
                type="email"
                placeholder="Email"
                id="email"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Masukan Password" />
              <TextInput
                type="password"
                placeholder="Password"
                id="password"
                onChange={handleChange}
              />
            </div>
            <Button
              gradientMonochrome="failure"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <span>Dont Have an account?</span>
            <Link to="/sign-up" className="text-blue-500">
              Sign Up
            </Link>
          </div>
          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
