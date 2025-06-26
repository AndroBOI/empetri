import { ToastContainer, toast } from 'react-toastify';
import axios from "axios"
import { useEffect, useState } from "react"
type Thumbnail = {
  url: string
  width: number
  height: number
}

type VideoResult = {
  title: string
  link: string
  thumbnails: Thumbnail[]
}

type Props = {
  search: string
}

function Card({ search }: Props) {
  if (!search) return
  const [result, setResult] = useState<VideoResult | null>(null)
  const [downloading, setDownloading] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/youtube", {
          params: { query: search }
        })
        setResult(response.data)
       
      } catch (error) {
        console.error("Error fetching data:", error)
       
      }
    }

    fetchData()
  }, [search])


  const handleDownload = async () => {
    if (!result) return
    setDownloading(true)
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/youtube/download",
        { url: result.link },
        { responseType: "blob" }
      )
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${result.title}.mp3`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error("Download error:", err)
        toast.error("Download Error")
    } finally {
      setDownloading(false)
    }

  }
  return (
    <div className="flex flex-col items-center justify-center w-full text-center p-4">
      <ToastContainer />
      {
        result ? (
          <div className="flex flex-col items-center justify-center">
            <h2 className="font-medium max-w-md break-words">{result.title}</h2>
            <img
              className="object-cover my-4 max-w-full"
              src={result.thumbnails[0].url}
              alt="Video thumbnail"
            />
          </div>
        ) : (
          <span className="loading loading-spinner text-info"></span>
        )
      }
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
