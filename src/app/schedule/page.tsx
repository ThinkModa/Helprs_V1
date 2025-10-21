import { CalendarView } from '@/components/scheduling/CalendarView'

export default function SchedulePage() {
  return (
    <div className="h-full">
      <CalendarView companyId="master-template" />
    </div>
  )
}
