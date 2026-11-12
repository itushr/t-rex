import { Camera, Play, SkipForward, Video, Volume2, X } from "lucide-react"

function ActionPanel() {
    return (
        <div className="fixed bottom-10 bg-black/95 text-white rounded-full flex items-center scale-y-90">
            <div className="flex gap-5 items-center bg-black rounded-full p-2 pr-7 border border-border/20 scale-y-110">
                <div className="rounded-full border border-border/20 p-3">
                    {/* <img
                        src="/dino.svg"
                        className="size-8 invert-100"
                    /> */}
                    <Camera strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 stroke-black" />
                </div>
                <div className="flex gap-5 items-center">
                    <div className="text-3xl">00:00:05</div>
                    <Play strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />
                    <Volume2 strokeWidth={1.5} fill="white" nonScalingStroke className="size-8" />
                    <SkipForward strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />
                </div>
            </div>
            <div className="pl-2.5 pr-5 cursor-pointer">
                <X className="size-5" />
            </div>
        </div>
    )
}

export default ActionPanel