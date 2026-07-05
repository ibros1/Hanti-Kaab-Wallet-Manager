import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import Spinner from "../../components/ui/Spinner";
import { signUp } from "../../lib/auth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await signUp(data.email, data.password, data.username);
      toast.success("Successfully registered a new user");
      navigate("/auth/login");
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const password = watch("password", "");

  return (
    <div className="flex flex-col h-screen justify-center items-center px-6">
      <div className="w-full  px-6 md:w-[80%] lg:w-[40%] xl:w-[30%] mx-auto border border-gray-300 rounded-md">
        <form action="" className="py-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-center justify-center">
            <h2 className="font-semibold text-3xl">Registration Form</h2>
            <p className="text-gray-400 text-base">Create your a new account</p>
          </div>
          <div className="grid my-4 space-y-2">
            <label htmlFor="">Email Address</label>
            <input
              type="email"
              name="email"
              id=""
              placeholder="Enter your email address"
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
          <div className="my-4 grid space-y-2">
            <label htmlFor="">Username</label>
            <input
              type="username"
              name="username"
              id=""
              placeholder="Enter username"
              className="border border-gray-300 px-2 py-2 w-full rounded-md"
              {...register("username", {
                required: "username is required",
                minLength: {
                  value: 3,
                  message: "invalid username!",
                },
              })}
            />
            {errors.username && (
              <p className="text-red-600"> {errors.username.message} </p>
            )}
          </div>
          <div className="my-4 grid space-y-2">
            <label htmlFor="">Password</label>

            <input
              type="password"
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
            {errors.password && (
              <p className="text-red-600"> {errors.password.message} </p>
            )}
          </div>
          <div className="my-4 grid space-y-2">
            <label htmlFor="">Conform Password</label>

            <input
              type="password"
              name="confirmPassword"
              id=""
              placeholder="Confirm Password"
              className="border border-gray-300 px-2 py-2 w-full rounded-md"
              {...register("confirmPassword", {
                required: "confirm password is required",
                validate: (value) =>
                  password === value || "Passwords must match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-600"> {errors.confirmPassword.message} </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 w-full rounded-md flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Spinner /> : "Register"}
          </button>

          <div className="flex items-center my-6">
            <span className="flex-1 border-b border-gray-300"></span>
            <span className="px-4">OR</span>
            <span className="flex-1 border-b  border-gray-300"></span>
          </div>

          <div className="flex items-center justify-center ">
            <h3 className=" text-lg text-gray-400 ">
              Already have an account{" "}
              <Link to={"/auth/login"} className="text-blue-700 cursor-pointer">
                Login
              </Link>{" "}
            </h3>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
