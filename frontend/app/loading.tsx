export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-lighter via-neutral-light to-olive-light">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-earth-light rounded-full"></div>
          <div className="absolute inset-0 border-4 border-earth-dark rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Loading StudioSync...</h2>
        <p className="text-gray-600">Please wait a moment</p>
      </div>
    </div>
  )
}
