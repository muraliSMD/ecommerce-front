export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
    </div>
  );
}
