import React from 'react';
import {
    SiHtml5,
    SiCss3,
    SiJavascript,
    SiTypescript,
    SiReact,
    SiNodedotjs,
    SiPython,
    SiC,
    SiCplusplus,
    SiGit,
    SiGithub,
    SiTensorflow,
    SiPandas,
    SiNumpy,
} from 'react-icons/si';
import {
    Code2,
    Database,
    Cloud,
    Network,
    BarChart3,
    Layers,
    GitBranch,
    Binary,
    TreeDeciduous,
    Share2,
    Boxes,
    LineChart
} from 'lucide-react';

interface TechLogoProps {
    icon: string;
    size?: number;
    className?: string;
}

const LOGO_MAP: Record<string, React.ReactNode> = {
    html: <SiHtml5 className="text-orange-500" />,
    css: <SiCss3 className="text-blue-500" />,
    javascript: <SiJavascript className="text-yellow-400" />,
    typescript: <SiTypescript className="text-blue-600" />,
    react: <SiReact className="text-cyan-400" />,
    nodejs: <SiNodedotjs className="text-green-500" />,
    python: <SiPython className="text-yellow-500" />,
    c: <SiC className="text-blue-400" />,
    cpp: <SiCplusplus className="text-blue-500" />,
    git: <SiGit className="text-orange-600" />,
    github: <SiGithub className="text-white" />,
    tensorflow: <SiTensorflow className="text-orange-500" />,
    pandas: <SiPandas className="text-purple-400" />,
    numpy: <SiNumpy className="text-blue-400" />,
    sklearn: <LineChart className="text-orange-400" />,
    matplotlib: <BarChart3 className="text-blue-500" />,
    // Custom icons for DSA and System Design
    arrays: <Layers className="text-amber-400" />,
    linkedlist: <GitBranch className="text-green-400" />,
    trees: <TreeDeciduous className="text-emerald-400" />,
    graphs: <Share2 className="text-purple-400" />,
    dp: <Binary className="text-red-400" />,
    sorting: <BarChart3 className="text-cyan-400" />,
    database: <Database className="text-blue-400" />,
    api: <Network className="text-violet-400" />,
    cloud: <Cloud className="text-sky-400" />,
    microservices: <Boxes className="text-pink-400" />,
    code: <Code2 className="text-green-400" />,
};

export const TechLogo: React.FC<TechLogoProps> = ({ icon, size = 32, className = '' }) => {
    const Logo = LOGO_MAP[icon.toLowerCase()];

    if (!Logo) {
        return <Code2 size={size} className={`text-gray-400 ${className}`} />;
    }

    return (
        <div
            className={`flex items-center justify-center ${className}`}
            style={{ fontSize: size }}
        >
            {Logo}
        </div>
    );
};

export default TechLogo;
