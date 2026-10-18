import { useMemo, useState } from 'react'
import {
  Placeholder,
  Carousel,
  SectionTitle,
  FilterBar,
  SearchInput,
  FilterSelect,
  ResetButton,
  RoomGrid,
  Pagination,
} from './components.jsx'

const AMENITIES = ['2 Persons', 'Bathroom', 'AC', 'Wi-Fi']

const ROOMS = [
  { number: 101, view: 'Lakeside View', price: 5250, status: 'Available', rating: 4.5, reviews: 513 },
  { number: 102, view: 'Moody Quiet', price: 3500, status: 'Available', rating: 4, reviews: 201 },
  { number: 103, view: 'Outdoor View', price: 3100, status: 'Available', rating: 4, reviews: 104 },
  { number: 104, view: 'Modern Suite', price: 4350, status: 'Reserved', rating: 4.5, reviews: 266 },
  { number: 105, view: 'Cityscape View', price: 4100, status: 'Maintenance', rating: 4.5, reviews: 172 },
  { number: 201, view: 'Beachside View', price: 5500, status: 'Available', rating: 5, reviews: 220 },
  { number: 202, view: 'Garden View', price: 3800, status: 'Available', rating: 4, reviews: 98 },
  { number: 203, view: 'Skyline Loft', price: 6200, status: 'Reserved', rating: 5, reviews: 340 },
  { number: 204, view: 'Poolside View', price: 4700, status: 'Available', rating: 3.5, reviews: 76 },
  { number: 205, view: 'Courtyard View', price: 2900, status: 'Maintenance', rating: 3, reviews: 54 },
].map((r) => ({ ...r, amenities: AMENITIES }))

const SLIDES = ['Suite', 'Lounge', 'Terrace', 'Bedroom', 'Lobby']

const STATUS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Available', label: 'Available' },
  { value: 'Reserved', label: 'Reserved' },
  { value: 'Maintenance', label: 'Maintenance' },
]

const RATING_OPTIONS = [
  { value: '0', label: 'All Rating' },
  { value: '5', label: '5 stars' },
  { value: '4', label: '4+ stars' },
  { value: '3', label: '3+ stars' },
]

const PAGE_SIZE = 6

export default function CustomerPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [minRating, setMinRating] = useState('0')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ROOMS.filter((r) => {
      const matchesQuery =
        !q || String(r.number).includes(q) || r.view.toLowerCase().includes(q)
      const matchesStatus = status === 'All' || r.status === status
      const matchesRating = r.rating >= Number(minRating)
      return matchesQuery && matchesStatus && matchesRating
    })
  }, [query, status, minRating])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  // Any filter change sends the user back to page 1
  const withReset = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const reset = () => {
    setQuery('')
    setStatus('All')
    setMinRating('0')
    setPage(1)
  }

  return (
    <main className="page">
      <section className="hero">
        <h1 className="hero__title">Elevate Every Stay at</h1>
        <Placeholder className="hero__logo" label="Logo" />
        <Carousel slides={SLIDES} />
      </section>

      <section className="rooms">
        <SectionTitle>Room List</SectionTitle>

        <FilterBar>
          <SearchInput
            value={query}
            onChange={withReset(setQuery)}
            placeholder="Search room number or room name..."
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={withReset(setStatus)}
            options={STATUS_OPTIONS}
          />
          <FilterSelect
            label="Rating"
            value={minRating}
            onChange={withReset(setMinRating)}
            options={RATING_OPTIONS}
          />
          <ResetButton onClick={reset} />
        </FilterBar>

        <RoomGrid rooms={visible} onView={(room) => console.log('View room', room.number)} />

        <Pagination page={current} totalPages={totalPages} onChange={setPage} />
      </section>
    </main>
  )
}
