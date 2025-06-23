import axios from "axios"
import { useEffect, useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
type Thumbnail = { url: string; width: number; height: number }
type VideoResult = { title: string; link: string; thumbnails: Thumbnail[] }
type Props = { search: string }

function Card({ search }: Props) {
  if (!search) return null

  const [result, setResult] = useState<VideoResult | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    axios
      .get("https://empetri-backend.onrender.com/api/youtube", {
        params: { query: search },
      })
      .then((r) => setResult(r.data))
      .catch((e) => console.error("fetch error:", e))
  }, [search])

  const handleDownload = async () => {
    if (!result) return
    setDownloading(true)
    try {
      const res = await axios.post(
        "https://empetri-backend.onrender.com/api/youtube/download",
        { url: result.link },
        { responseType: "blob" }
      )
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a")
      a.href = url
      a.download = `${result.title}.m4a`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Download Complete")
    } catch (err) {
      console.error("download error:", err)
        toast.error("Download Error")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center w-full text-center p-4">
         <ToastContainer />
      {result ? (
        <>
          <h2 className="font-medium max-w-md break-words">{result.title}</h2>
          <img
            className="object-cover my-4 max-w-full"
            src={result.thumbnails[0].url}
            alt="thumbnail"
          />
        </>
      ) : (
        <span className="loading loading-spinner text-info" />
      )}

      <button
        onClick={handleDownload}
        className="btn btn-primary mt-4"
        disabled={downloading}
      >
        {downloading && (
          <span className="loading loading-spinner loading-xs mr-2" />
        )}
        {downloading ? "Downloading…" : "Download"}
      </button>

    </div>
  )
}

export default Card
