import { SearchIcon } from "lucide-react"
import Card from "./components/Card"
import { useState } from "react"

function App() {
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleSearch = () => {
    const trimmed = search.trim()
    if (trimmed === "") {
      alert("Please enter a valid search term.")
      return
    }
    setQuery(trimmed)
  }

  return (
    <div className="flex w-screen min-h-screen justify-center p-6">
      <div className="w-full max-w-xl flex flex-col items-center gap-8">
        <div className="flex w-full gap-2">
          <form className="flex w-full gap-2" onSubmit={(e) => {
    e.preventDefault()
    handleSearch()
  }}>
            <input
              value={search}
              onChange={handleChange}
              type="text"
              placeholder="Search for a YouTube video..."
              className="input input-bordered w-full"
            />
            <button type="submit" className="btn btn-primary">
              <SearchIcon className="h-5 w-5" />
            </button>
          </form>

        </div>
        {query && <Card search={query} />}
      </div>
    </div>
  )
}

export default App
