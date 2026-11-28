import {
  formatItemDate,
  placeLabel,
  type PrototypeItem,
} from './prototype-items'

type EventDetailsBlockProps = {
  item: PrototypeItem
}

/** D: the Event details block that replaces the blog's author rail. */
const EventDetailsBlock = ({ item }: EventDetailsBlockProps) => {
  const rows = [
    ['Date', formatItemDate(item) + (item.eventDate ? '' : ' (published)')],
    ['Location', placeLabel(item)],
    ['Venue', item.venue],
    ['With', item.partner],
  ].filter((row): row is [string, string] => Boolean(row[1]))

  return (
    <dl className='space-y-3 border-t border-slate-300/70 pt-3 dark:border-zinc-800'>
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className='font-mono text-[11px] tracking-[0.18em] text-slate-400 uppercase'>
            {label}
          </dt>
          <dd className='mt-0.5 text-sm text-slate-700 dark:text-slate-300'>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default EventDetailsBlock
