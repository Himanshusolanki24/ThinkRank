import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

interface SkillNode {
    id: string;
    name: string;
    level: number;
    score: number;
    category: string;
    interviews: number;
}

interface SkillLink {
    source: string;
    target: string;
    strength: number;
}

interface D3SkillNetworkProps {
    skills: SkillNode[];
    onNodeClick?: (skill: SkillNode) => void;
}

// Skill categories and their colors
const categoryColors: Record<string, string> = {
    frontend: "#8B5CF6",
    backend: "#06B6D4",
    database: "#10B981",
    devops: "#F59E0B",
    language: "#EC4899",
    framework: "#6366F1",
    other: "#94A3B8",
};

// Determine skill category
const getSkillCategory = (skillName: string): string => {
    const frontendSkills = ["React", "Vue", "Angular", "HTML", "CSS", "Tailwind", "JavaScript", "TypeScript"];
    const backendSkills = ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring", "Laravel"];
    const databaseSkills = ["SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase"];
    const devopsSkills = ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "CI/CD", "Linux"];
    const languageSkills = ["Python", "Java", "C", "C++", "Go", "Rust", "PHP", "Ruby"];
    const frameworkSkills = ["Next.js", "Gatsby", "Nuxt", "Svelte", "Remix"];

    if (frontendSkills.some(s => skillName.toLowerCase().includes(s.toLowerCase()))) return "frontend";
    if (backendSkills.some(s => skillName.toLowerCase().includes(s.toLowerCase()))) return "backend";
    if (databaseSkills.some(s => skillName.toLowerCase().includes(s.toLowerCase()))) return "database";
    if (devopsSkills.some(s => skillName.toLowerCase().includes(s.toLowerCase()))) return "devops";
    if (languageSkills.some(s => skillName.toLowerCase().includes(s.toLowerCase()))) return "language";
    if (frameworkSkills.some(s => skillName.toLowerCase().includes(s.toLowerCase()))) return "framework";
    return "other";
};

// Generate skill links based on categories and relationships
const generateLinks = (skills: SkillNode[]): SkillLink[] => {
    const links: SkillLink[] = [];

    for (let i = 0; i < skills.length; i++) {
        for (let j = i + 1; j < skills.length; j++) {
            const skill1 = skills[i];
            const skill2 = skills[j];

            // Connect skills in the same category
            if (skill1.category === skill2.category) {
                links.push({
                    source: skill1.id,
                    target: skill2.id,
                    strength: 0.8,
                });
            }
            // Connect related categories
            else if (
                (skill1.category === "frontend" && skill2.category === "framework") ||
                (skill1.category === "backend" && skill2.category === "database") ||
                (skill1.category === "language" && skill2.category === "backend")
            ) {
                links.push({
                    source: skill1.id,
                    target: skill2.id,
                    strength: 0.5,
                });
            }
        }
    }

    return links;
};

export const D3SkillNetwork = ({ skills, onNodeClick }: D3SkillNetworkProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
    const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null);

    // Add categories to skills — memoized to prevent simulation restarts on hover
    const nodesWithCategories: SkillNode[] = useMemo(() => skills.map(skill => ({
        ...skill,
        category: skill.category || getSkillCategory(skill.name),
    })), [skills]);

    const links = useMemo(() => generateLinks(nodesWithCategories), [nodesWithCategories]);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    useEffect(() => {
        if (!svgRef.current || nodesWithCategories.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const { width, height } = dimensions;

        // Create gradient definitions
        const defs = svg.append("defs");

        // Radial gradient for glow effect
        const glowGradient = defs.append("radialGradient")
            .attr("id", "nodeGlow")
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%");

        glowGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#8B5CF6")
            .attr("stop-opacity", 0.5);

        glowGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#8B5CF6")
            .attr("stop-opacity", 0);

        // Create container group
        const g = svg.append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        // Create simulation
        const simulation = d3.forceSimulation(nodesWithCategories as d3.SimulationNodeDatum[])
            .force("link", d3.forceLink(links)
                .id((d: any) => d.id)
                .distance(100)
                .strength((d: any) => d.strength * 0.3))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(0, 0))
            .force("collision", d3.forceCollide().radius((d: any) => 25 + d.score * 0.2));

        // Draw links
        const link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke", "rgba(139, 92, 246, 0.2)")
            .attr("stroke-width", (d: any) => d.strength * 2);

        // Draw node glow
        const nodeGlow = g.append("g")
            .attr("class", "node-glows")
            .selectAll("circle")
            .data(nodesWithCategories)
            .enter()
            .append("circle")
            .attr("r", (d: any) => 25 + d.score * 0.15)
            .attr("fill", "url(#nodeGlow)")
            .attr("opacity", 0);

        // Draw nodes
        const node = g.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodesWithCategories)
            .enter()
            .append("circle")
            .attr("r", (d: any) => 12 + d.score * 0.1)
            .attr("fill", (d: any) => categoryColors[d.category])
            .attr("stroke", "rgba(255, 255, 255, 0.2)")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mouseenter", function (event, d: any) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 18 + d.score * 0.1)
                    .attr("stroke-width", 3)
                    .attr("stroke", "rgba(255, 255, 255, 0.5)");

                nodeGlow.filter((n: any) => n.id === d.id)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1);

                setHoveredNode(d);
            })
            .on("mouseleave", function (event, d: any) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 12 + d.score * 0.1)
                    .attr("stroke-width", 2)
                    .attr("stroke", "rgba(255, 255, 255, 0.2)");

                nodeGlow.filter((n: any) => n.id === d.id)
                    .transition()
                    .duration(200)
                    .attr("opacity", 0);

                setHoveredNode(null);
            })
            .on("click", (event, d: any) => {
                if (onNodeClick) onNodeClick(d);
            });

        // Draw labels
        const labels = g.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(nodesWithCategories)
            .enter()
            .append("text")
            .text((d: any) => d.name)
            .attr("font-size", "11px")
            .attr("fill", "rgba(255, 255, 255, 0.8)")
            .attr("text-anchor", "middle")
            .attr("dy", (d: any) => 25 + d.score * 0.1)
            .style("pointer-events", "none");

        // Update positions on tick
        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node
                .attr("cx", (d: any) => d.x)
                .attr("cy", (d: any) => d.y);

            nodeGlow
                .attr("cx", (d: any) => d.x)
                .attr("cy", (d: any) => d.y);

            labels
                .attr("x", (d: any) => d.x)
                .attr("y", (d: any) => d.y);
        });

        // Drag behavior
        const drag = d3.drag<SVGCircleElement, any>()
            .on("start", (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });

        node.call(drag);

        return () => {
            simulation.stop();
        };
    }, [nodesWithCategories, links, dimensions, onNodeClick]);

    return (
        <div ref={containerRef} className="relative w-full h-full min-h-[400px]">
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full h-full"
            />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-3">
                {Object.entries(categoryColors).slice(0, 5).map(([category, color]) => (
                    <div key={category} className="flex items-center gap-1.5">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-gray-400 capitalize">{category}</span>
                    </div>
                ))}
            </div>

            {/* Tooltip */}
            {hoveredNode && (
                <div className="absolute top-4 right-4 p-4 rounded-xl bg-black/80 border border-white/10 backdrop-blur-sm min-w-[160px]">
                    <h4 className="font-semibold text-white mb-2">{hoveredNode.name}</h4>
                    <div className="space-y-1 text-sm">
                        <p className="text-gray-400">
                            Score: <span className="text-violet-400 font-medium">{hoveredNode.score}%</span>
                        </p>
                        <p className="text-gray-400">
                            Interviews: <span className="text-cyan-400 font-medium">{hoveredNode.interviews || 0}</span>
                        </p>
                        <p className="text-gray-400">
                            Category: <span className="text-white font-medium capitalize">{hoveredNode.category}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default D3SkillNetwork;
