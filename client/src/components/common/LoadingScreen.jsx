export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-sky-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-500 animate-spin"></div>
        </div>
        <p className="text-neutral-500 font-medium text-sm tracking-wide">Loading...</p>
      </div>
    </div>
  );
}
