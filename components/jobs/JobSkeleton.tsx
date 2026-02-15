export default function JobSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-[380px] animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                <div className="w-20 h-6 bg-gray-100 rounded"></div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="w-3/4 h-7 bg-gray-100 rounded"></div>
                <div className="w-1/2 h-5 bg-gray-100 rounded"></div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="w-1/3 h-4 bg-gray-100 rounded"></div>
                <div className="w-1/3 h-4 bg-gray-100 rounded"></div>
                <div className="w-1/3 h-4 bg-gray-100 rounded"></div>
            </div>

            <div className="space-y-2 mb-6">
                <div className="w-full h-4 bg-gray-100 rounded"></div>
                <div className="w-full h-4 bg-gray-100 rounded"></div>
            </div>

            <div className="pt-6 border-t border-gray-50">
                <div className="w-full h-12 bg-gray-100 rounded-lg"></div>
            </div>
        </div>
    );
}
