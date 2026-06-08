/**
 * FloatingControls — Bottom floating control bar.
 * Circular buttons: Mic, Camera, Screen Share, Code Mode, AI Assist, End Interview.
 */
import { motion } from "framer-motion";
import {
  Mic, MicOff, Video, VideoOff, Monitor,
  Code2, Sparkles, PhoneOff, Maximize, Minimize,
} from "lucide-react";
import { VoiceWaveform } from "./VoiceWaveform";

interface Props {
  micOn: boolean;
  camOn: boolean;
  codeMode: boolean;
  isFullscreen: boolean;
  audioStream: MediaStream | null;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleCodeMode: () => void;
  onToggleFullscreen: () => void;
  onScreenShare: () => void;
  onAiAssist: () => void;
  onEndInterview: () => void;
}

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  accent?: boolean;
  onClick: () => void;
}

const ControlButton = ({ icon, label, active, danger, accent, onClick }: ControlButtonProps) => (
  <motion.button
    onClick={onClick}
    className={`
      group relative flex items-center justify-center w-12 h-12 rounded-full
      transition-all duration-300 ease-out
      ${danger
        ? "bg-red-500/15 border border-red-500/25 hover:bg-red-500/30 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
        : active
        ? "bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25 hover:shadow-[0_0_20px_rgba(0,229,255,0.15)]"
        : accent
        ? "bg-violet-500/15 border border-violet-500/25 hover:bg-violet-500/25 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
        : "bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.12] hover:border-white/[0.15] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
      }
    `}
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
  >
    {icon}
    {/* Tooltip */}
    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className="px-2.5 py-1 rounded-lg bg-[#1a1a22] border border-white/[0.08] shadow-xl">
        <span className="text-[10px] font-medium text-gray-300 whitespace-nowrap">{label}</span>
      </div>
    </div>
  </motion.button>
);

export const FloatingControls = ({
  micOn, camOn, codeMode, isFullscreen, audioStream,
  onToggleMic, onToggleCam, onToggleCodeMode, onToggleFullscreen,
  onScreenShare, onAiAssist, onEndInterview,
}: Props) => {
  return (
    <motion.div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {/* Waveform (visible when mic is on) */}
      {micOn && audioStream && (
        <motion.div
          className="px-3 py-2 rounded-2xl glass-control"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
        >
          <VoiceWaveform
            audioStream={audioStream}
            isActive={micOn}
            width={100}
            height={28}
          />
        </motion.div>
      )}

      {/* Main controls pill */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-[28px] glass-dark shadow-2xl shadow-black/30">
        <ControlButton
          icon={micOn
            ? <Mic className="w-5 h-5 text-cyan-400" />
            : <MicOff className="w-5 h-5 text-red-400" />
          }
          label={micOn ? "Mute" : "Unmute"}
          active={micOn}
          onClick={onToggleMic}
        />

        <ControlButton
          icon={camOn
            ? <Video className="w-5 h-5 text-gray-300" />
            : <VideoOff className="w-5 h-5 text-red-400" />
          }
          label={camOn ? "Turn Off Camera" : "Turn On Camera"}
          onClick={onToggleCam}
        />

        <ControlButton
          icon={<Monitor className="w-5 h-5 text-gray-300" />}
          label="Screen Share"
          onClick={onScreenShare}
        />

        {/* Divider */}
        <div className="w-px h-7 bg-white/[0.08] mx-1" />

        <ControlButton
          icon={<Code2 className={`w-5 h-5 ${codeMode ? "text-cyan-400" : "text-gray-300"}`} />}
          label={codeMode ? "Video Mode" : "Code Mode"}
          active={codeMode}
          onClick={onToggleCodeMode}
        />

        <ControlButton
          icon={<Sparkles className="w-5 h-5 text-violet-400" />}
          label="AI Assist"
          accent
          onClick={onAiAssist}
        />

        <ControlButton
          icon={isFullscreen
            ? <Minimize className="w-5 h-5 text-gray-300" />
            : <Maximize className="w-5 h-5 text-gray-300" />
          }
          label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          onClick={onToggleFullscreen}
        />

        {/* Divider */}
        <div className="w-px h-7 bg-white/[0.08] mx-1" />

        <ControlButton
          icon={<PhoneOff className="w-5 h-5 text-red-400" />}
          label="End Interview"
          danger
          onClick={onEndInterview}
        />
      </div>
    </motion.div>
  );
};
