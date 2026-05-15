interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-3xl bg-white/80 ${className}`}
            aria-hidden="true"
        />
    );
}
