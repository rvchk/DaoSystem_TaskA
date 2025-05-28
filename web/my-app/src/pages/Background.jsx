export default function Background() {
  return (
    <>
      <div className="background-video">
        <video autoPlay loop muted playsInline className="background-video__file">
          <source src="/stel.mp4" type="video/mp4" />
          Ваш браузер не поддерживает видео.
        </video>
      </div>
      <div className="background-overlay"></div>
    </>
  );
}