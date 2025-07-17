import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import axios from "axios"
import StoreCard from "../components/StoreCard"

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchResults = async () => {
      const trimmed = query.trim()
      if (!trimmed) {
        setResults([])
        return
      }

      setLoading(true)
      setError("")

      try {
        const res = await axios.get(`http://localhost:8877/api/stores/search?q=${trimmed}`)
        setResults(res.data.stores || [])
      } catch (err) {
        console.error("🔴 Error fetching search:", err)
        setError("เกิดข้อผิดพลาดในการค้นหา")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-white">
        ผลลัพธ์การค้นหา: "{query}"
      </h1>

      {loading && (
        <div className="text-yellow-400">กำลังโหลดข้อมูล...</div>
      )}

      {error && (
        <div className="text-red-500">{error}</div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="text-gray-400">ไม่พบผลลัพธ์ที่เกี่ยวข้อง</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  )
}

export default SearchPage