import Skeleton from "../../components/shared/Skeleton";

export default function ProjectsLoading() {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff,#f6f0e7,#f7f4ef)] px-4 py-12">
            <div className="mx-auto w-full max-w-6xl space-y-6">
                <Skeleton className="h-24" />
                <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-40" />
                    ))}
                </div>
            </div>
        </div>
    );
}
