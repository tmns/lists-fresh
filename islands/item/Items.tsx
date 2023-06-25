import { useState } from 'preact/hooks'
import { useDataSubscription } from 'utils/hooks.ts'
import { Item } from 'utils/types.ts'
import ItemComponent from 'islands/item/Item.tsx'
import NewItemForm from 'islands/item/NewItemForm.tsx'

interface ItemsProps {
  items: Item[]
}

export default function Items(props: ItemsProps) {
  const [items, setItems] = useState(props.items)

  const path = window?.location?.pathname.split('/')
  const listId = path?.[path?.length - 1]

  // General approach taken from https://github.com/denoland/tic-tac-toe
  useDataSubscription(() => {
    const eventSource = new EventSource(`/api/events/items?listId=${encodeURIComponent(listId)}`)

    eventSource.onmessage = (e) => {
      const newItems = JSON.parse(e.data) as Item[]
      const sortedItems = newItems.sort((a, b) => a.createdAt?.localeCompare(b.createdAt))
      setItems(sortedItems)
    }

    return () => eventSource.close()
  }, [listId])

  return (
    <>
      <ul class="divide-y divide-zinc-400/40 px-3 sm:px-4 py-2 lg:px-2">
        {items.length === 0 ? (
          <li class="p-2">
            This list doesn't have any items yet. Add some items by using the form below!
          </li>
        ) : (
          items.map((item) => <ItemComponent key={item.id} items={items} item={item} />)
        )}
      </ul>
      <NewItemForm listId={listId} items={items} />
    </>
  )
}
