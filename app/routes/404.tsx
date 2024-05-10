import lost from "~/assets/lost-john-travolta.gif";

export default function ErrorNotFound() {
  return(
    <div className="h-screen overflow-hidden">
      <div className="flex flex-col font-SpaceGrotesk justify-center items-center mt-28">
        <div className="h-full">
          <div className="flex flex-row items-center">
            <div className="flex flex-col">
              <div className="text-lg">I believe...</div>
              <div className="text-3xl font-medium">you're lost, sire!</div>
            </div>
            <div>
              <img src={lost} />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button className="py-4 px-8 bg-black rounded-lg text-white">Let's go home</button>
        </div>
      </div>
    </div>
  )
}