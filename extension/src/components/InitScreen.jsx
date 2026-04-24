import { RefreshCw } from "lucide-react";

export default function InitScreen() {
    return (
        <div className="flex h-screen items-center justify-center">
            <RefreshCw className="animate-spin text-brand-500 w-8 h-8" />
        </div>
    );
}
