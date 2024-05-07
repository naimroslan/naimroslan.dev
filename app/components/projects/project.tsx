
export default function Project({ title, description}: any) {

  return (
    <div className="h-auto">
      <div className="text-white text-justify space-y-2 -ml-4 py-6 px-10 shadow-lg rounded-lg bg-[#000000] max-w-[500px]">
        <div className="text-lg font-medium">
          {title}
        </div>
        <div>
          {description}
        </div>
      </div>
    </div>
  )
}