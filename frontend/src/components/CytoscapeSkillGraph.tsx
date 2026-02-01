import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";

interface SkillData {
    name: string;
    score: number;
    interviews: number;
    xp: number;
}

interface CytoscapeSkillGraphProps {
    skills: SkillData[];
    onNodeSelect?: (skill: SkillData | null) => void;
}

// Skill relationships - skills that commonly go together
const skillRelationships: Record<string, string[]> = {
    "JavaScript": ["TypeScript", "React", "Node.js", "HTML", "CSS"],
    "TypeScript": ["JavaScript", "React", "Angular", "Node.js"],
    "React": ["JavaScript", "TypeScript", "Redux", "Next.js", "CSS", "HTML"],
    "Python": ["Django", "Flask", "FastAPI", "SQL", "MongoDB"],
    "Node.js": ["JavaScript", "TypeScript", "Express", "MongoDB", "SQL"],
    "HTML": ["CSS", "JavaScript", "React"],
    "CSS": ["HTML", "JavaScript", "React", "Tailwind"],
    "SQL": ["Python", "Node.js", "PostgreSQL", "MySQL"],
    "MongoDB": ["Node.js", "Python", "Express"],
    "Docker": ["Kubernetes", "AWS", "Linux", "CI/CD"],
    "AWS": ["Docker", "Kubernetes", "Linux"],
    "Java": ["Spring", "SQL", "Hibernate"],
    "C": ["C++", "Linux", "Algorithms"],
    "C++": ["C", "Algorithms", "Data Structures"],
};

// Get level based on score
const getLevel = (score: number): string => {
    if (score >= 80) return "Expert";
    if (score >= 60) return "Advanced";
    if (score >= 40) return "Intermediate";
    if (score >= 20) return "Beginner";
    return "Newbie";
};

// Get color based on score
const getScoreColor = (score: number): string => {
    if (score >= 80) return "#10B981"; // Emerald
    if (score >= 60) return "#8B5CF6"; // Violet
    if (score >= 40) return "#06B6D4"; // Cyan
    if (score >= 20) return "#F59E0B"; // Amber
    return "#6B7280"; // Gray
};

export const CytoscapeSkillGraph = ({ skills, onNodeSelect }: CytoscapeSkillGraphProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<cytoscape.Core | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);

    useEffect(() => {
        if (!containerRef.current || skills.length === 0) return;

        // Build nodes
        const nodes = skills.map(skill => ({
            data: {
                id: skill.name,
                label: skill.name,
                score: skill.score,
                interviews: skill.interviews || 0,
                xp: skill.xp || 0,
                level: getLevel(skill.score),
                color: getScoreColor(skill.score),
                size: Math.max(30, 30 + skill.score * 0.4),
            },
        }));

        // Build edges based on relationships
        const edges: { data: { source: string; target: string; weight: number } }[] = [];
        const skillNames = new Set(skills.map(s => s.name));

        skills.forEach(skill => {
            const related = skillRelationships[skill.name] || [];
            related.forEach(relatedSkill => {
                if (skillNames.has(relatedSkill)) {
                    // Avoid duplicate edges
                    const edgeExists = edges.some(
                        e => (e.data.source === skill.name && e.data.target === relatedSkill) ||
                            (e.data.source === relatedSkill && e.data.target === skill.name)
                    );
                    if (!edgeExists) {
                        edges.push({
                            data: {
                                source: skill.name,
                                target: relatedSkill,
                                weight: 1,
                            },
                        });
                    }
                }
            });
        });

        // Initialize Cytoscape
        const cy = cytoscape({
            container: containerRef.current,
            elements: [...nodes, ...edges],
            style: [
                {
                    selector: "node",
                    style: {
                        "background-color": "data(color)",
                        "border-width": 2,
                        "border-color": "#ffffff20",
                        "label": "data(label)",
                        "width": "data(size)",
                        "height": "data(size)",
                        "font-size": "12px",
                        "color": "#ffffff",
                        "text-valign": "bottom",
                        "text-margin-y": 8,
                        "text-outline-width": 2,
                        "text-outline-color": "#0a0a0f",
                    },
                },
                {
                    selector: "node:selected",
                    style: {
                        "border-width": 4,
                        "border-color": "#8B5CF6",
                        "background-color": "#8B5CF6",
                    },
                },
                {
                    selector: "edge",
                    style: {
                        "width": 2,
                        "line-color": "#8B5CF640",
                        "curve-style": "bezier",
                        "target-arrow-shape": "none",
                    },
                },
                {
                    selector: "edge:selected",
                    style: {
                        "line-color": "#8B5CF6",
                        "width": 3,
                    },
                },
            ],
            layout: {
                name: "cose",
                idealEdgeLength: () => 120,
                nodeOverlap: 20,
                refresh: 20,
                fit: true,
                padding: 40,
                randomize: false,
                componentSpacing: 100,
                nodeRepulsion: () => 5000,
                edgeElasticity: () => 100,
                nestingFactor: 5,
                gravity: 0.5,
                numIter: 1000,
                initialTemp: 300,
                coolingFactor: 0.99,
                minTemp: 1.0,
            } as any,
            minZoom: 0.5,
            maxZoom: 2,
            wheelSensitivity: 0.3,
        });

        cyRef.current = cy;

        // Node click handler
        cy.on("tap", "node", (event) => {
            const node = event.target;
            const skillData: SkillData = {
                name: node.data("id"),
                score: node.data("score"),
                interviews: node.data("interviews"),
                xp: node.data("xp"),
            };
            setSelectedSkill(skillData);
            if (onNodeSelect) onNodeSelect(skillData);
        });

        // Background click to deselect
        cy.on("tap", (event) => {
            if (event.target === cy) {
                setSelectedSkill(null);
                if (onNodeSelect) onNodeSelect(null);
            }
        });

        // Highlight connected nodes on hover
        cy.on("mouseover", "node", (event) => {
            const node = event.target;
            const neighborhood = node.neighborhood().add(node);
            cy.elements().addClass("faded");
            neighborhood.removeClass("faded");
        });

        cy.on("mouseout", "node", () => {
            cy.elements().removeClass("faded");
        });

        // Add faded style
        cy.style().selector(".faded").style({
            "opacity": 0.25,
        }).update();

        return () => {
            if (cyRef.current) {
                cyRef.current.destroy();
            }
        };
    }, [skills, onNodeSelect]);

    return (
        <div className="relative w-full h-full min-h-[450px]">
            <div ref={containerRef} className="w-full h-full" />

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button
                    onClick={() => cyRef.current?.fit(undefined, 40)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white hover:bg-white/10 transition-colors"
                >
                    Fit View
                </button>
                <button
                    onClick={() => cyRef.current?.center()}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white hover:bg-white/10 transition-colors"
                >
                    Center
                </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-black/60 border border-white/10 backdrop-blur-sm">
                <p className="text-xs text-gray-400 mb-2">Skill Level</p>
                <div className="flex flex-col gap-1.5">
                    {[
                        { label: "Expert (80%+)", color: "#10B981" },
                        { label: "Advanced (60-79%)", color: "#8B5CF6" },
                        { label: "Intermediate (40-59%)", color: "#06B6D4" },
                        { label: "Beginner (20-39%)", color: "#F59E0B" },
                        { label: "Newbie (<20%)", color: "#6B7280" },
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs text-gray-300">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected skill info */}
            {selectedSkill && (
                <div className="absolute top-4 left-4 p-4 rounded-xl bg-black/80 border border-violet-500/30 backdrop-blur-sm min-w-[180px]">
                    <h4 className="font-semibold text-white mb-3">{selectedSkill.name}</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Score</span>
                            <span className="text-violet-400 font-medium">{selectedSkill.score}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Level</span>
                            <span className="text-white font-medium">{getLevel(selectedSkill.score)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Interviews</span>
                            <span className="text-cyan-400 font-medium">{selectedSkill.interviews}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">XP Earned</span>
                            <span className="text-amber-400 font-medium">{selectedSkill.xp}</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-gray-500">Click edges to see relationships</p>
                    </div>
                </div>
            )}

            {/* Help text */}
            <div className="absolute bottom-4 right-4">
                <p className="text-xs text-gray-500">Drag nodes • Scroll to zoom • Click for details</p>
            </div>
        </div>
    );
};

export default CytoscapeSkillGraph;
