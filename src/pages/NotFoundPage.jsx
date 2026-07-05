import { useNavigate } from "react-router";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full md:w-[80%] lg:w-[60%] xl:w-[40%] mx-auto py-6">
      <div className="border border-gray-300 rounded-xl px-6 py-12 space-y-4 flex flex-col justify-center items-center ">
        <p>The page you're looking for doesn't exit </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-slate-900 text-white font-semibold rounded-lg px-6 py-2"
        >
          Go back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
