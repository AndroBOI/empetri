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
  if (!search) return null
  const [result, setResult] = useState<VideoResult | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://empetri-backend.onrender.com/api/youtube",
          {
            params: { query: search },
          }
        )
        setResult(response.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [search])

  const handleDownload = async () => {
    if (!result) return

    try {
      const res = await axios.post(
        "https://empetri-backend.onrender.com/api/youtube/download",
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
      alert("Download started!")
    } catch (err) {
      console.error("Download error:", err)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full text-center p-4">
      {result ? (
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
      )}
      <button onClick={handleDownload} className="btn btn-primary mt-4">
        Download
      </button>
    </div>
  )
}

export default Card
