import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "../../lib/auth";
import toast from "react-hot-toast";
import { Link } from "react-router";
import Spinner from "../../components/ui/Spinner";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [isPassVisible, setIsPassVisible] = useState(false);
  const [passType, setPassType] = useState("password");
  useEffect(() => {
    if (isPassVisible) {
      setPassType("text");
    } else {
      setPassType("password");
    }
  }, [isPassVisible]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await signIn(data.email, data.password);
      toast.success("Successfully logged in");
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center px-6">
      <div className="w-full  px-6 md:w-[80%] lg:w-[40%] xl:w-[30%] mx-auto border border-gray-300 rounded-md">
        <form action="" className="py-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-center justify-center">
            <h2 className="font-semibold text-3xl">Welcome back!👋</h2>
            <p className="text-gray-400 text-base">sign in to your account</p>
          </div>
          <div className="my-4">
            <input
              type="email"
              name="email"
              id=""
              placeholder="Email"
              className="border border-gray-300 px-2 py-2 w-full rounded-md"
              {...register("email", {
                required: "Email address is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "invalid email address!",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-600"> {errors.email.message} </p>
            )}
          </div>
          <div className=" my-4">
            <div className="flex">
              <input
                type={passType}
                name="password"
                id=""
                placeholder="Password"
                className="border border-gray-300 px-2 py-2 w-full rounded-md"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password length must be 6 characters at least",
                  },
                })}
              />
              {isPassVisible ? (
                <Eye
                  onClick={() => setIsPassVisible(!isPassVisible)}
                  className="z-10 -ml-8 my-2 text-gray-300"
                />
              ) : (
                <EyeOff
                  onClick={() => setIsPassVisible(!isPassVisible)}
                  className="z-10 -ml-8 my-2 text-gray-300"
                />
              )}
            </div>

            {errors.password && (
              <p className="text-red-600"> {errors.password.message} </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 w-full rounded-md flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Spinner /> : "Login"}
          </button>

          <div className="flex items-center my-6">
            <span className="flex-1 border-b border-gray-300"></span>
            <span className="px-4">OR</span>
            <span className="flex-1 border-b  border-gray-300"></span>
          </div>

          <div className="flex items-center justify-center ">
            <h3 className=" text-lg text-gray-400 ">
              Don't have an account{" "}
              <Link
                to={"/auth/register"}
                className="text-blue-700 cursor-pointer"
              >
                Register
              </Link>{" "}
            </h3>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
