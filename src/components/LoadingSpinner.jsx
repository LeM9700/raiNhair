export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-32 w-32 border-t-8 border-b-8 border-green-500"></div>
    </div>
  );
}
