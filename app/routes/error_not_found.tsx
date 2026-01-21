import { useEffect } from "react";
import { useNavigate } from "react-router";
import lost from "~/assets/lost-john-travolta.gif";

export default function ErrorNotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Not Found | naimroslan";
  }, []);

  return (
    <div className="h-screen overflow-hidden px-5 py-10">
      <div className="flex flex-col font-SpaceGrotesk justify-center items-center mt-28">
        <div className="h-full">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="flex flex-col">
              <div className="text-lg">I believe...</div>
              <div className="text-3xl font-medium">you're lost, sire! </div>
            </div>
            <div>
              <img src={lost} />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            className="py-4 px-8 bg-black rounded-lg text-white cursor-pointer"
            onClick={() => navigate("/")}
          >
            Let's go home
          </button>
        </div>
      </div>
    </div>
  );
}
