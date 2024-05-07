
export default function Project({ title, description, link}: any) {

  const handleProjectOnClick = () => {
    window.open(`${link}`, '_blank')
  }

  return (
    <div className="h-auto">
      <div 
        className="text-white text-justify space-y-2 py-6 px-10 shadow-lg rounded-lg bg-[#000000] max-w-[500px] cursor-pointer"
        onClick={handleProjectOnClick}      
      >
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