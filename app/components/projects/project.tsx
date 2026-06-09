
export default function Project({ title, description, link, className }: any) {

  const handleProjectOnClick = () => {
    if (link) {
      window.open(`${link}`, '_blank')
    }
  }

  return (
    <div className={`h-full ${className ?? ""}`}>
      <div
        className="h-full text-fg text-justify space-y-3 px-10 py-12 bg-transparent cursor-pointer transition-colors duration-200 hover:bg-fg hover:text-fg-invert"
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