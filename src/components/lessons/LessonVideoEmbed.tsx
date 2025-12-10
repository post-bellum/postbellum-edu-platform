interface LessonVideoEmbedProps {
  videoUrl: string
  title: string
}

export function LessonVideoEmbed({ videoUrl, title }: LessonVideoEmbedProps) {
  return (
    <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ paddingTop: '56.25%' }}>
      <iframe
        src={videoUrl}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
        title={title}
      />
    </div>
  )
}
