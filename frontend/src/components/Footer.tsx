import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        SolFluence © 2023
                    </span>
                </div>
                <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <Link className="hover:text-primary transition-colors" href="#">
                        Documentation
                    </Link>
                    <Link className="hover:text-primary transition-colors" href="#">
                        Privacy
                    </Link>
                    <Link className="hover:text-primary transition-colors" href="#">
                        Terms
                    </Link>
                </div>
            </div>
        </footer>
    );
}
