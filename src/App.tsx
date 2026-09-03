import { TopNav } from '@/components/TopNav'
import { LeftSidebar } from '@/components/LeftSidebar'
import { Canvas } from '@/components/canvas/Canvas'
import { RightSidebar } from '@/components/RightSidebar'
import { AddTickerModal } from '@/components/AddTickerModal'
import { useStudioStore } from '@/store/useStudioStore'

export default function App() {
  const hasTickers = useStudioStore((s) => s.tickers.length > 0)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-studio-panel">
      <TopNav />
      <div className="flex min-h-0 flex-1">
        <LeftSidebar />
        <Canvas />
        {hasTickers && <RightSidebar />}
      </div>
      <AddTickerModal />
    </div>
  )
}
