import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/authSlice";
import { Navigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        {error && <p className="text-red-500 text-center">{error.message}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
