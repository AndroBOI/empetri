import axios from "axios"
import { useEffect, useState } from "react"

type Thumbnail = {
  url: string
  width: number
  height: number
}

type VideoResult = {
  title: string
  thumbnails: Thumbnail[]
}

function App() {
  const[result, setResult] = useState<VideoResult | null>(null)


  useEffect(()=> {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/youtube")
        setResult(response.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
        {
          result ? (
            <div>
              <h2>{result.title}</h2>
              <img src={result.thumbnails[0].url} alt="" />
            </div>
          ) : (
            <p>loading</p>
          )
        }
    </div>
  )
}

export default App
