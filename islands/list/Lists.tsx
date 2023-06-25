import { useState } from 'preact/hooks'
import { useDataSubscription } from 'utils/hooks.ts'
import { List } from 'utils/types.ts'
import ListComponent from 'islands/list/List.tsx'

interface ListsProps {
  lists: List[]
  userId: string
}

export default function Lists(props: ListsProps) {
  const [lists, setLists] = useState(props.lists)

  // General approach taken from https://github.com/denoland/tic-tac-toe
  useDataSubscription(() => {
    const eventSource = new EventSource('/api/events/lists')

    eventSource.onmessage = (e) => {
      const newLists = JSON.parse(e.data) as List[]
      const sortedLists = newLists.sort((a, b) => a.createdAt?.localeCompare(b.createdAt))
      setLists(sortedLists)
    }

    return () => eventSource.close()
  }, [])

  return (
    <ul class="-mx-2 space-y-1">
      {lists.map((list) => (
        <ListComponent key={list.id} lists={lists} list={list} />
      ))}
    </ul>
  )
}
