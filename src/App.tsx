import { TopNav } from '@/components/TopNav'
import { LeftSidebar } from '@/components/LeftSidebar'
import { Canvas } from '@/components/canvas/Canvas'
import { RightSidebar } from '@/components/RightSidebar'
import { AddTickerModal } from '@/components/AddTickerModal'

export default function App() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-studio-panel">
      <TopNav />
      <div className="flex min-h-0 flex-1">
        <LeftSidebar />
        <Canvas />
        <RightSidebar />
      </div>
      <AddTickerModal />
    </div>
  )
}
