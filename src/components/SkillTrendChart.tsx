import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { TrendingUp, TrendingDown, Award, Calendar, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResumeData } from "../types";

interface SkillDataPoint {
  month: string;
  value: number;
  note: string;
  change: string;
  isGrowth: boolean;
}

interface SkillTrend {
  skillName: string;
  color: string;
  gradientId: string;
  points: SkillDataPoint[];
}

interface SkillTrendChartProps {
  resume: ResumeData | null;
}

export default function SkillTrendChart({ resume }: SkillTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 });
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Hovered data point state for glassmorphic tooltip
  const [hoveredPoint, setHoveredPoint] = useState<{
    skillName: string;
    color: string;
    month: string;
    value: number;
    note: string;
    change: string;
    isGrowth: boolean;
    x: number;
    y: number;
  } | null>(null);

  // Generate dynamic skill names based on parsed resume or defaults
  const skillNames = React.useMemo(() => {
    if (resume && resume.skills && resume.skills.length >= 3) {
      // Pick up to 4 parsed skills from resume
      return resume.skills.slice(0, 4);
    }
    return ["React & Next.js", "TypeScript", "Python & AI", "System Architecture"];
  }, [resume]);

  // Construct structured historical progress showing both growth and decline points
  const trendData: SkillTrend[] = React.useMemo(() => {
    return [
      {
        skillName: skillNames[0] || "React & Next.js",
        color: "#3b82f6", // Blue
        gradientId: "gradient-skill-0",
        points: [
          { month: "Jan", value: 60, note: "Established foundation in frontend component states", change: "+10% Initial Base", isGrowth: true },
          { month: "Feb", value: 65, note: "Built dynamic client layouts with custom hooks", change: "+5% Growth", isGrowth: true },
          { month: "Mar", value: 72, note: "Mastered React Server Components and state routers", change: "+7% Advanced Step", isGrowth: true },
          { month: "Apr", value: 80, note: "Designed high-fidelity interactive data dashboards", change: "+8% High Growth", isGrowth: true },
          { month: "May", value: 78, note: "Minor pause due to backend system migration workload", change: "-2% Consolidation", isGrowth: false },
          { month: "Jun", value: 88, note: "Refactored UI architectures using optimized animations", change: "+10% Peak Growth", isGrowth: true }
        ]
      },
      {
        skillName: skillNames[1] || "TypeScript",
        color: "#a855f7", // Purple
        gradientId: "gradient-skill-1",
        points: [
          { month: "Jan", value: 45, note: "Began writing explicit parameters and interface files", change: "+5% Setup", isGrowth: true },
          { month: "Feb", value: 52, note: "Learned deep Union Types and partial utility helpers", change: "+7% Learning", isGrowth: true },
          { month: "Mar", value: 50, note: "Minor typing omissions in rapid prototype phase", change: "-2% Focus Shift", isGrowth: false },
          { month: "Apr", value: 62, note: "Implemented strict compiler rules across core structures", change: "+12% Refactoring", isGrowth: true },
          { month: "May", value: 75, note: "Mastered generic bounds and advanced conditional types", change: "+13% Advanced", isGrowth: true },
          { month: "Jun", value: 83, note: "Configured zero-any type-safety policies on client", change: "+8% Strict Mode", isGrowth: true }
        ]
      },
      {
        skillName: skillNames[2] || "Python & AI",
        color: "#10b981", // Emerald
        gradientId: "gradient-skill-2",
        points: [
          { month: "Jan", value: 70, note: "Solid experience in core syntax and backend scripts", change: "+5% Benchmark", isGrowth: true },
          { month: "Feb", value: 74, note: "Built web scraper engines and formatted pandas data", change: "+4% Growth", isGrowth: true },
          { month: "Mar", value: 82, note: "Integrated Google Gemini API and tailored agent tasks", change: "+8% AI Integration", isGrowth: true },
          { month: "Apr", value: 80, note: "Minor decline: prioritized system performance audits", change: "-2% Inactive Code", isGrowth: false },
          { month: "May", value: 88, note: "Engineered parallel worker pipelines and prompt tools", change: "+8% Engineering", isGrowth: true },
          { month: "Jun", value: 94, note: "Shipped low-latency automated intelligence routines", change: "+6% Production", isGrowth: true }
        ]
      },
      {
        skillName: skillNames[3] || "System Architecture",
        color: "#f59e0b", // Amber
        gradientId: "gradient-skill-3",
        points: [
          { month: "Jan", value: 35, note: "Studied basic virtual machine setups and manual routes", change: "+10% Foundation", isGrowth: true },
          { month: "Feb", value: 45, note: "Containerized microservices with Docker orchestrations", change: "+10% Containerization", isGrowth: true },
          { month: "Mar", value: 58, note: "Designed database write-replicas and distributed systems", change: "+13% Advanced", isGrowth: true },
          { month: "Apr", value: 55, note: "Brief setback during complex reverse-proxy debugging", change: "-3% Debugging Cycle", isGrowth: false },
          { month: "May", value: 68, note: "Established automated CI/CD multi-stage deployment checks", change: "+13% CI/CD", isGrowth: true },
          { month: "Jun", value: 76, note: "Engineered fault-tolerant setups under high load stresses", change: "+8% Resilience", isGrowth: true }
        ]
      }
    ];
  }, [skillNames]);

  // Handle responsive resize of the container
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 300),
          height: 320
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Render D3 chart inside SVG
  useEffect(() => {
    if (!svgRef.current || !dimensions.width) return;

    const svg = d3.select(svgRef.current);

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Helper to safely escape string IDs for selector use
    const escapeId = (name: string) => name.replace(/[^a-zA-Z0-9-]/g, "_");

    // Initialize or select main group 'g'
    let g = svg.select<SVGGElement>("g.main-group");
    if (g.empty()) {
      g = svg.append("g").attr("class", "main-group");
    }
    g.attr("transform", `translate(${margin.left},${margin.top})`);

    // Initialize sub-groups to manage layer order cleanly
    let gridGroup = g.select<SVGGElement>("g.grid-group");
    if (gridGroup.empty()) {
      gridGroup = g.append("g").attr("class", "grid-group");
    }

    let axesGroup = g.select<SVGGElement>("g.axes-group");
    if (axesGroup.empty()) {
      axesGroup = g.append("g").attr("class", "axes-group");
    }

    let pathsGroup = g.select<SVGGElement>("g.paths-group");
    if (pathsGroup.empty()) {
      pathsGroup = g.append("g").attr("class", "paths-group");
    }

    let nodesGroup = g.select<SVGGElement>("g.nodes-group");
    if (nodesGroup.empty()) {
      nodesGroup = g.append("g").attr("class", "nodes-group");
    }

    // X scale (Months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const xScale = d3
      .scalePoint()
      .domain(months)
      .range([0, width]);

    // Y scale (Proficiency %)
    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Update dynamic gradient defs safely
    let defs = svg.select<SVGDefsElement>("defs");
    if (defs.empty()) {
      defs = svg.append("defs");
    } else {
      defs.selectAll("*").remove();
    }

    trendData.forEach((skill) => {
      const gradient = defs
        .append("linearGradient")
        .attr("id", skill.gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", skill.color)
        .attr("stop-opacity", 0.4);

      gradient
        .append("stop")
        .attr("offset", "50%")
        .attr("stop-color", skill.color)
        .attr("stop-opacity", 1.0);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", skill.color)
        .attr("stop-opacity", 0.6);
    });

    // Update Gridlines
    gridGroup.selectAll("*").remove();
    gridGroup.append("g")
      .attr("class", "x-grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-height)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "rgba(148, 163, 184, 0.15)")
      .attr("stroke-dasharray", "2,2");

    gridGroup.append("g")
      .attr("class", "y-grid")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "rgba(148, 163, 184, 0.15)")
      .attr("stroke-dasharray", "2,2");

    // Setup and transition Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}%`);

    let xAxisEl = axesGroup.select<SVGGElement>("g.x-axis");
    if (xAxisEl.empty()) {
      xAxisEl = axesGroup.append("g").attr("class", "x-axis");
    }
    xAxisEl
      .attr("transform", `translate(0,${height})`)
      .transition()
      .duration(700)
      .call(xAxis)
      .attr("color", "#64748b");

    xAxisEl.selectAll("text")
      .attr("class", "font-sans text-[10px] font-semibold text-slate-500 mt-2");

    let yAxisEl = axesGroup.select<SVGGElement>("g.y-axis");
    if (yAxisEl.empty()) {
      yAxisEl = axesGroup.append("g").attr("class", "y-axis");
    }
    yAxisEl
      .transition()
      .duration(700)
      .call(yAxis)
      .attr("color", "#64748b");

    yAxisEl.selectAll("text")
      .attr("class", "font-mono text-[9px] font-medium text-slate-500");

    // Line Generator with smooth curve
    const lineGenerator = d3
      .line<SkillDataPoint>()
      .x((d) => xScale(d.month) || 0)
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Bind & Transition lines
    const linePaths = pathsGroup.selectAll<SVGPathElement, SkillTrend>("path.skill-line")
      .data(trendData, d => d.skillName);

    // EXIT old lines
    linePaths.exit()
      .transition()
      .duration(300)
      .attr("opacity", 0)
      .remove();

    // ENTER new lines
    const enterPaths = linePaths.enter()
      .append("path")
      .attr("class", "skill-line")
      .attr("fill", "none")
      .attr("stroke", d => `url(#${d.gradientId})`)
      .attr("stroke-width", d => {
        const isFocused = selectedSkill === null || selectedSkill === d.skillName;
        return isFocused ? 3 : 1.5;
      })
      .attr("opacity", 0)
      .attr("d", d => {
        // Flat start state for entering paths
        const flatPoints = d.points.map(p => ({ ...p, value: 0 }));
        return lineGenerator(flatPoints) || "";
      });

    // MERGE & UPDATE with transitions
    linePaths.merge(enterPaths)
      .transition()
      .duration(850)
      .ease(d3.easeCubicOut)
      .attr("d", d => lineGenerator(d.points) || "")
      .attr("stroke", d => `url(#${d.gradientId})`)
      .attr("stroke-width", d => {
        const isFocused = selectedSkill === null || selectedSkill === d.skillName;
        return isFocused ? 3 : 1.5;
      })
      .attr("opacity", d => {
        const isFocused = selectedSkill === null || selectedSkill === d.skillName;
        return isFocused ? 1.0 : 0.15;
      });

    // Flatten points data for unified D3 binding to interactive node elements
    interface FlatDataPoint {
      skillName: string;
      color: string;
      month: string;
      value: number;
      note: string;
      change: string;
      isGrowth: boolean;
    }

    const flatPoints: FlatDataPoint[] = [];
    trendData.forEach(skill => {
      skill.points.forEach(p => {
         flatPoints.push({
           skillName: skill.skillName,
           color: skill.color,
           month: p.month,
           value: p.value,
           note: p.note,
           change: p.change,
           isGrowth: p.isGrowth
         });
      });
    });

    // Bind visual nodes
    const visualNodes = nodesGroup.selectAll<SVGCircleElement, FlatDataPoint>("circle.skill-node")
      .data(flatPoints, d => `${d.skillName}-${d.month}`);

    // EXIT old nodes
    visualNodes.exit()
      .transition()
      .duration(300)
      .attr("opacity", 0)
      .remove();

    // ENTER new nodes
    const enterNodes = visualNodes.enter()
      .append("circle")
      .attr("class", d => `skill-node node-${escapeId(`${d.skillName}-${d.month}`)}`)
      .attr("cx", d => xScale(d.month) || 0)
      .attr("cy", height) // start animated up from the bottom line
      .attr("r", 4)
      .attr("fill", "#ffffff")
      .attr("stroke", d => d.color)
      .attr("stroke-width", 2)
      .attr("opacity", 0);

    // MERGE & UPDATE with transitions
    visualNodes.merge(enterNodes)
      .transition()
      .duration(850)
      .ease(d3.easeCubicOut)
      .attr("cx", d => xScale(d.month) || 0)
      .attr("cy", d => yScale(d.value))
      .attr("stroke", d => d.color)
      .attr("opacity", d => {
        const isSkillFocused = selectedSkill === null || selectedSkill === d.skillName;
        return isSkillFocused ? 1.0 : 0.15;
      });

    // Bind invisible catcher targets for generous touch/mouse areas
    const catchers = nodesGroup.selectAll<SVGCircleElement, FlatDataPoint>("circle.catcher-node")
      .data(flatPoints, d => `${d.skillName}-${d.month}-catcher`);

    catchers.exit().remove();

    const enterCatchers = catchers.enter()
      .append("circle")
      .attr("class", "catcher-node")
      .attr("r", 14)
      .attr("fill", "transparent")
      .attr("cursor", "pointer");

    catchers.merge(enterCatchers)
      .attr("cx", d => xScale(d.month) || 0)
      .attr("cy", d => yScale(d.value))
      .on("mouseenter", function (event, d) {
        const xPos = (xScale(d.month) || 0) + margin.left;
        const yPos = yScale(d.value) + margin.top;

        setHoveredPoint({
          skillName: d.skillName,
          color: d.color,
          month: d.month,
          value: d.value,
          note: d.note,
          change: d.change,
          isGrowth: d.isGrowth,
          x: xPos,
          y: yPos,
        });

        // Trigger transition on visual node directly
        const targetClass = `.node-${escapeId(`${d.skillName}-${d.month}`)}`;
        nodesGroup.select(targetClass)
          .transition()
          .duration(150)
          .attr("r", 7)
          .attr("stroke-width", 3)
          .style("filter", `drop-shadow(0 0 5px ${d.color})`)
          .attr("opacity", 1.0);
      })
      .on("mouseleave", function (event, d) {
        setHoveredPoint(null);

        const isSkillFocused = selectedSkill === null || selectedSkill === d.skillName;
        const targetClass = `.node-${escapeId(`${d.skillName}-${d.month}`)}`;
        nodesGroup.select(targetClass)
          .transition()
          .duration(150)
          .attr("r", 4)
          .attr("stroke-width", 2)
          .style("filter", null)
          .attr("opacity", isSkillFocused ? 1.0 : 0.15);
      });

  }, [dimensions, trendData, selectedSkill]);

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-visible" id="skill-trend-container">
      {/* Visual Accent Gradient Ring */}
      <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Core Competency Progression Trends
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">
            D3-powered visualization mapping skill growth, static pivots, and recovery periods. Hover nodes for context.
          </p>
        </div>

        {/* Legend / Interactive Selectors */}
        <div className="flex flex-wrap gap-2">
          {trendData.map((skill) => {
            const isFocused = selectedSkill === skill.skillName;
            return (
              <button
                key={skill.skillName}
                onClick={() => setSelectedSkill(isFocused ? null : skill.skillName)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all flex items-center gap-1.5 ${
                  selectedSkill === null
                    ? "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                    : isFocused
                    ? "text-slate-900 shadow-sm"
                    : "bg-slate-50/50 border-slate-100 text-slate-400 opacity-40"
                }`}
                style={isFocused ? { backgroundColor: `${skill.color}15`, borderColor: skill.color, color: skill.color } : {}}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: skill.color }} />
                {skill.skillName}
              </button>
            );
          })}
          {selectedSkill && (
            <button
              onClick={() => setSelectedSkill(null)}
              className="text-[9px] font-mono text-slate-400 hover:text-slate-600 transition-colors font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Chart Wrapper */}
      <div ref={containerRef} className="relative w-full overflow-visible" style={{ height: "320px" }}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="overflow-visible"
        >
        </svg>


        {/* Dynamic Glassmorphic Tooltip Overlay */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-50 pointer-events-none rounded-xl border border-slate-200 bg-white/95 backdrop-blur-xl p-3.5 shadow-xl flex flex-col gap-2 min-w-[220px] max-w-[280px]"
              style={{
                left: `${hoveredPoint.x + 15}px`,
                top: `${hoveredPoint.y - 60}px`,
                boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 0 15px -3px ${hoveredPoint.color}15`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold text-slate-500 font-sans uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {hoveredPoint.month} evaluation
                </span>
                <span
                  className="text-[11px] font-black font-mono px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${hoveredPoint.color}15`, color: hoveredPoint.color }}
                >
                  {hoveredPoint.value}%
                </span>
              </div>

              {/* Body */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900">{hoveredPoint.skillName}</h4>
                <p className="text-[10px] text-slate-600 leading-relaxed font-sans">{hoveredPoint.note}</p>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-100">
                {hoveredPoint.isGrowth ? (
                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                    <TrendingUp className="w-3 h-3" />
                    {hoveredPoint.change}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                    <TrendingDown className="w-3 h-3" />
                    {hoveredPoint.change}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Extra helper notice */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-slate-400 text-[10px] font-medium">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span>Click skill badges in the legend to focus specific paths. Hover data nodes to drill down details.</span>
      </div>
    </div>
  );
}
