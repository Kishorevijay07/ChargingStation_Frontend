import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import carimage from "./../images/car1_image.jpg"; // Adjust path as needed
import { baseUrl } from "../../urls/constant";  
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: login, isError, isPending, error } = useMutation({
    mutationFn: async ({ email, password }) => {
      console.log("Logging in with:", { email, password });

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
     
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      console.log("Login response:", data);
      return data;
    },
    onSuccess: () => {
      toast.success("Login successful!");
       
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      console.log("authUser query invalidated", queryClient.getQueryData(["authUser"]));
      navigate("/chargers"); // Redirect to chargers page after successful login
    },
    onError: (error) => {
      console.error("Login error:", error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${carimage})` }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full h-full px-6 max-w-6xl mx-auto">
        {/* Left Section */}


        {/* Right - Login Form */}
        <div className="md:w-1/3 mt-10 md:mt-0 bg-white bg-opacity-90 rounded-lg p-8 shadow-lg backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Sign in</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2">
              <FaUser className="text-gray-500" />
              <input
                type="text"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full focus:outline-none"
              />
            </label>

            <label className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2">
              <MdPassword className="text-gray-500" />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full focus:outline-none"
              />
            </label>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-semibold"
            >
              {isPending ? <LoadingSpinner /> : "Sign in now"}
            </button>
          </form>

          {isError && <p className="text-red-600 mt-2">{error.message}</p>}

          <p className="mt-4 text-sm text-center text-gray-700">
            New user?{" "}
            <Link
              to="/signup"
              className="text-green-600 hover:underline font-semibold"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
