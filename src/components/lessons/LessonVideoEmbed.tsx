interface LessonVideoEmbedProps {
  videoUrl: string
  title: string
}

export function LessonVideoEmbed({ videoUrl, title }: LessonVideoEmbedProps) {
  return (
    <div className="relative w-full max-w-[1260px] aspect-video rounded-[28px] overflow-hidden bg-black">
      <iframe
        src={videoUrl}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 w-full h-full"
        title={title}
      />
    </div>
  )
}
