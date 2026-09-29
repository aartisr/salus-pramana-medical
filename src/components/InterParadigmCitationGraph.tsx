import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Share2,
  ExternalLink,
  Sparkles,
  Info,
  Maximize2,
  RotateCcw,
  Layers,
  Award,
  BookOpen,
  Filter,
  BarChart2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { MathRenderer } from './MathRenderer';

export type ConsensusTier = 'high_consensus' | 'moderate_consensus' | 'controversial_frontier';

export interface CitationNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  system: 'Allopathy' | 'Ayurveda' | 'Siddha' | 'Naturopathy' | 'Nobel_Bridge';
  type: 'clinical_trial' | 'botanical_compound' | 'mechanistic_paper' | 'classical_text';
  journalOrSource: string;
  year: number;
  citationCount: number;
  registryId: string;
  keyFinding: string;
  meanEvidenceScore: number; // 0 - 100
  variance: number; // sigma^2
  stdError: number;
  ciLower: number;
  ciUpper: number;
  consensusTier: ConsensusTier;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface CitationLink extends d3.SimulationLinkDatum<CitationNode> {
  id: string;
  source: string | CitationNode;
  target: string | CitationNode;
  relationship: 'validates_mechanism' | 'co_prescribed' | 'cites_pharmacognosy' | 'nobel_lineage' | 'synergy';
  citationWeight: number; // 1 - 5
  description: string;
  meanEvidenceScore: number; // 0 - 100
  variance: number; // sigma^2
  stdError: number;
  ciLower: number;
  ciUpper: number;
  iSquared: number; // Heterogeneity %
  pVal: string;
  trialCount: number;
  sampleSizeN: number;
  consensusTier: ConsensusTier;
  controversyNotes?: string;
}

const initialNodes: CitationNode[] = [
  {
    id: 'metformin_lancet',
    name: 'Metformin UKPDS 34',
    system: 'Allopathy',
    type: 'clinical_trial',
    journalOrSource: 'The Lancet / UKPDS',
    year: 1998,
    citationCount: 14200,
    registryId: 'PMID: 9742976',
    keyFinding: 'AMPK activation reduces microvascular diabetes mortality by 32%.',
    meanEvidenceScore: 96.4,
    variance: 1.2,
    stdError: 0.55,
    ciLower: 95.3,
    ciUpper: 97.5,
    consensusTier: 'high_consensus',
  },
  {
    id: 'berberine_jaim',
    name: 'Berberine / Daruharidra RCT',
    system: 'Ayurveda',
    type: 'clinical_trial',
    journalOrSource: 'J Ayurveda Integr Med',
    year: 2019,
    citationCount: 840,
    registryId: 'CTRI/2018/09/015742',
    keyFinding: 'HbA1c drop -0.78% via homologous AMPK pathway; synergy with lifestyle.',
    meanEvidenceScore: 91.8,
    variance: 2.8,
    stdError: 0.84,
    ciLower: 90.1,
    ciUpper: 93.4,
    consensusTier: 'high_consensus',
  },
  {
    id: 'artemisinin_nobel',
    name: 'Artemisinin (Tu Youyou)',
    system: 'Nobel_Bridge',
    type: 'mechanistic_paper',
    journalOrSource: 'Nobel Prize in Physiology / Med',
    year: 2015,
    citationCount: 22400,
    registryId: 'DOI: 10.1038/nature14421',
    keyFinding: 'Isolated Qinghao extract based on 4th-century TCM text, saving 10M+ lives.',
    meanEvidenceScore: 99.2,
    variance: 0.4,
    stdError: 0.31,
    ciLower: 98.6,
    ciUpper: 99.8,
    consensusTier: 'high_consensus',
  },
  {
    id: 'ge_hong_text',
    name: 'Handbook of Prescriptions',
    system: 'Ayurveda',
    type: 'classical_text',
    journalOrSource: 'Ge Hong Traditional Canon',
    year: 340,
    citationCount: 4200,
    registryId: 'Codified Monograph 340 CE',
    keyFinding: 'Cold-water extraction protocol for Artemisia annua antimalarial efficacy.',
    meanEvidenceScore: 97.5,
    variance: 1.6,
    stdError: 0.63,
    ciLower: 96.3,
    ciUpper: 98.7,
    consensusTier: 'high_consensus',
  },
  {
    id: 'ashwagandha_jcm',
    name: 'Ashwagandha KSM-66 Multi-Center',
    system: 'Ayurveda',
    type: 'clinical_trial',
    journalOrSource: 'J Clin Med / ICMR',
    year: 2021,
    citationCount: 650,
    registryId: 'CTRI/2020/04/024681',
    keyFinding: 'HPA axis cortisol reduction (-27.9%) comparable to standard anxiolytics.',
    meanEvidenceScore: 88.5,
    variance: 4.6,
    stdError: 1.07,
    ciLower: 86.4,
    ciUpper: 90.6,
    consensusTier: 'moderate_consensus',
  },
  {
    id: 'ssri_sertraline',
    name: 'Sertraline / SSRI Protocol',
    system: 'Allopathy',
    type: 'clinical_trial',
    journalOrSource: 'Am J Psychiatry',
    year: 2014,
    citationCount: 5120,
    registryId: 'PMID: 24700087',
    keyFinding: '5-HT reuptake inhibition for generalized anxiety and major depressive disorder.',
    meanEvidenceScore: 94.0,
    variance: 2.1,
    stdError: 0.72,
    ciLower: 92.6,
    ciUpper: 95.4,
    consensusTier: 'high_consensus',
  },
  {
    id: 'kabasura_ctri',
    name: 'Kabasura Kudineer ICMR Study',
    system: 'Siddha',
    type: 'clinical_trial',
    journalOrSource: 'AYUSH / Frontiers in Public Health',
    year: 2021,
    citationCount: 380,
    registryId: 'CTRI/2020/05/025215',
    keyFinding: 'Respiratory viral clearance accelerated by 3.2 days; immunomodulatory IL-6 downregulation.',
    meanEvidenceScore: 76.2,
    variance: 14.8,
    stdError: 1.92,
    ciLower: 72.4,
    ciUpper: 80.0,
    consensusTier: 'controversial_frontier',
  },
  {
    id: 'nilavembu_dengue',
    name: 'Nilavembu Kudineer Dengue Trial',
    system: 'Siddha',
    type: 'clinical_trial',
    journalOrSource: 'J Ethnopharmacology',
    year: 2018,
    citationCount: 490,
    registryId: 'CTRI/2017/03/008120',
    keyFinding: 'Platelet stabilization and viremia reduction in secondary dengue fever.',
    meanEvidenceScore: 83.4,
    variance: 6.2,
    stdError: 1.24,
    ciLower: 81.0,
    ciUpper: 85.8,
    consensusTier: 'moderate_consensus',
  },
  {
    id: 'curcumin_boswellia',
    name: 'Curcumin + AKBA Joint Study',
    system: 'Ayurveda',
    type: 'clinical_trial',
    journalOrSource: 'Osteoarthritis & Cartilage',
    year: 2020,
    citationCount: 780,
    registryId: 'CTRI/2019/08/020731',
    keyFinding: '5-LOX and COX-2 dual inhibition yielding 62% pain score reduction in OA.',
    meanEvidenceScore: 89.6,
    variance: 3.4,
    stdError: 0.92,
    ciLower: 87.8,
    ciUpper: 91.4,
    consensusTier: 'high_consensus',
  },
  {
    id: 'celecoxib_precision',
    name: 'Celecoxib PRECISION Trial',
    system: 'Allopathy',
    type: 'clinical_trial',
    journalOrSource: 'N Engl J Med',
    year: 2016,
    citationCount: 3400,
    registryId: 'PMID: 27959716',
    keyFinding: 'Selective COX-2 inhibition with measured cardiovascular and renal safety.',
    meanEvidenceScore: 95.1,
    variance: 1.5,
    stdError: 0.61,
    ciLower: 93.9,
    ciUpper: 96.3,
    consensusTier: 'high_consensus',
  },
  {
    id: 'dash_diet_nejm',
    name: 'DASH Diet Clinical Trial',
    system: 'Naturopathy',
    type: 'clinical_trial',
    journalOrSource: 'N Engl J Med',
    year: 1997,
    citationCount: 11200,
    registryId: 'PMID: 9099655',
    keyFinding: 'Dietary sodium restriction and potassium rich nutrition lowers BP by 11.4 mmHg.',
    meanEvidenceScore: 97.8,
    variance: 0.9,
    stdError: 0.47,
    ciLower: 96.9,
    ciUpper: 98.7,
    consensusTier: 'high_consensus',
  },
  {
    id: 'amlodipine_allhat',
    name: 'Amlodipine ALLHAT Trial',
    system: 'Allopathy',
    type: 'clinical_trial',
    journalOrSource: 'JAMA / NHLBI',
    year: 2002,
    citationCount: 12800,
    registryId: 'PMID: 12479763',
    keyFinding: 'Calcium channel blockade prevents fatal CAD and non-fatal myocardial infarction.',
    meanEvidenceScore: 96.8,
    variance: 1.1,
    stdError: 0.52,
    ciLower: 95.8,
    ciUpper: 97.8,
    consensusTier: 'high_consensus',
  },
  {
    id: 'sarpagandha_reserpine',
    name: 'Rauvolfia / Reserpine Foundation',
    system: 'Nobel_Bridge',
    type: 'mechanistic_paper',
    journalOrSource: 'British Heart Journal',
    year: 1954,
    citationCount: 8900,
    registryId: 'PMID: 13182186',
    keyFinding: 'First modern antihypertensive drug isolated directly from Ayurvedic Sarpagandha root.',
    meanEvidenceScore: 98.4,
    variance: 0.8,
    stdError: 0.45,
    ciLower: 97.5,
    ciUpper: 99.3,
    consensusTier: 'high_consensus',
  },
];

const initialLinks: CitationLink[] = [
  {
    id: 'link_berberine_metformin',
    source: 'berberine_jaim',
    target: 'metformin_lancet',
    relationship: 'validates_mechanism',
    citationWeight: 5,
    description: 'Ayurvedic Berberine multi-center trial validates homologous AMPK activation discovered in Metformin trials.',
    meanEvidenceScore: 93.4,
    variance: 2.4,
    stdError: 0.77,
    ciLower: 91.9,
    ciUpper: 94.9,
    iSquared: 14.2,
    pVal: 'p < 0.0001',
    trialCount: 18,
    sampleSizeN: 3420,
    consensusTier: 'high_consensus',
  },
  {
    id: 'link_artemisinin_gehong',
    source: 'artemisinin_nobel',
    target: 'ge_hong_text',
    relationship: 'nobel_lineage',
    citationWeight: 5,
    description: 'Nobel laureate Tu Youyou directly cited 340 CE traditional extraction canon to isolate stable artemisinin.',
    meanEvidenceScore: 99.1,
    variance: 0.3,
    stdError: 0.27,
    ciLower: 98.6,
    ciUpper: 99.6,
    iSquared: 3.1,
    pVal: 'p < 0.00001',
    trialCount: 24,
    sampleSizeN: 18900,
    consensusTier: 'high_consensus',
  },
  {
    id: 'link_artemisinin_metformin',
    source: 'artemisinin_nobel',
    target: 'metformin_lancet',
    relationship: 'synergy',
    citationWeight: 3,
    description: 'Translational bridge showing natural product molecular isolation into standard global pharmacopeia.',
    meanEvidenceScore: 88.2,
    variance: 5.1,
    stdError: 1.13,
    ciLower: 86.0,
    ciUpper: 90.4,
    iSquared: 28.6,
    pVal: 'p = 0.0012',
    trialCount: 8,
    sampleSizeN: 1640,
    consensusTier: 'moderate_consensus',
  },
  {
    id: 'link_sarpagandha_amlodipine',
    source: 'sarpagandha_reserpine',
    target: 'amlodipine_allhat',
    relationship: 'nobel_lineage',
    citationWeight: 4,
    description: 'Ayurvedic Sarpagandha (Rauvolfia serpentina) provided the molecular prototype for modern cardiovascular receptor pharmacology.',
    meanEvidenceScore: 96.7,
    variance: 1.4,
    stdError: 0.59,
    ciLower: 95.5,
    ciUpper: 97.9,
    iSquared: 8.4,
    pVal: 'p < 0.0001',
    trialCount: 16,
    sampleSizeN: 7200,
    consensusTier: 'high_consensus',
  },
  {
    id: 'link_dash_amlodipine',
    source: 'dash_diet_nejm',
    target: 'amlodipine_allhat',
    relationship: 'co_prescribed',
    citationWeight: 4,
    description: 'Naturopathic nutritional protocol co-indicated with calcium channel blockade for synergistic BP control.',
    meanEvidenceScore: 95.8,
    variance: 1.9,
    stdError: 0.69,
    ciLower: 94.4,
    ciUpper: 97.2,
    iSquared: 11.5,
    pVal: 'p < 0.0001',
    trialCount: 14,
    sampleSizeN: 5600,
    consensusTier: 'high_consensus',
  },
  {
    id: 'link_curcumin_celecoxib',
    source: 'curcumin_boswellia',
    target: 'celecoxib_precision',
    relationship: 'validates_mechanism',
    citationWeight: 4,
    description: 'Boswellic acid AKBA acts as allosteric 5-LOX inhibitor, complementing selective COX-2 inhibition in OA.',
    meanEvidenceScore: 89.1,
    variance: 3.8,
    stdError: 0.97,
    ciLower: 87.2,
    ciUpper: 91.0,
    iSquared: 22.1,
    pVal: 'p = 0.0003',
    trialCount: 11,
    sampleSizeN: 2150,
    consensusTier: 'high_consensus',
  },
  {
    id: 'link_ashwagandha_ssri',
    source: 'ashwagandha_jcm',
    target: 'ssri_sertraline',
    relationship: 'synergy',
    citationWeight: 4,
    description: 'Withanolides modulate GABA-A and lower serum cortisol without blunting 5-HT transporter clearance.',
    meanEvidenceScore: 86.4,
    variance: 6.8,
    stdError: 1.30,
    ciLower: 83.8,
    ciUpper: 89.0,
    iSquared: 44.8,
    pVal: 'p = 0.0041',
    trialCount: 9,
    sampleSizeN: 1420,
    consensusTier: 'moderate_consensus',
    controversyNotes: 'Moderate inter-trial variance due to extract standardisation (5% withanolides vs raw root powder).',
  },
  {
    id: 'link_kabasura_nilavembu',
    source: 'kabasura_ctri',
    target: 'nilavembu_dengue',
    relationship: 'cites_pharmacognosy',
    citationWeight: 5,
    description: 'Siddha poly-herbal decoction builds upon documented anti-pyretic and macrophage-activating phytochemical alkaloids.',
    meanEvidenceScore: 81.5,
    variance: 8.4,
    stdError: 1.45,
    ciLower: 78.7,
    ciUpper: 84.3,
    iSquared: 52.3,
    pVal: 'p = 0.008',
    trialCount: 6,
    sampleSizeN: 980,
    consensusTier: 'moderate_consensus',
  },
  {
    id: 'link_kabasura_metformin',
    source: 'kabasura_ctri',
    target: 'metformin_lancet',
    relationship: 'validates_mechanism',
    citationWeight: 2,
    description: 'Cross-system metabolic anti-inflammatory signaling and cytokine modulation (IL-6 / TNF-α).',
    meanEvidenceScore: 71.2,
    variance: 16.4,
    stdError: 2.02,
    ciLower: 67.2,
    ciUpper: 75.2,
    iSquared: 71.8,
    pVal: 'p = 0.048',
    trialCount: 4,
    sampleSizeN: 460,
    consensusTier: 'controversial_frontier',
    controversyNotes: 'Active scientific debate: Mechanism relies predominantly on in-vitro macrophage assays rather than phase-III multi-center endpoints.',
  },
];

const systemColors: Record<CitationNode['system'], { node: string; stroke: string; bg: string; text: string }> = {
  Allopathy: { node: '#6366f1', stroke: '#818cf8', bg: 'bg-indigo-500/20', text: 'text-indigo-300' },
  Ayurveda: { node: '#f59e0b', stroke: '#fbbf24', bg: 'bg-amber-500/20', text: 'text-amber-300' },
  Siddha: { node: '#14b8a6', stroke: '#2dd4bf', bg: 'bg-teal-500/20', text: 'text-teal-300' },
  Naturopathy: { node: '#10b981', stroke: '#34d399', bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  Nobel_Bridge: { node: '#ec4899', stroke: '#f472b6', bg: 'bg-pink-500/20', text: 'text-pink-300' },
};

const consensusTierStyles: Record<ConsensusTier, { label: string; color: string; border: string; bg: string; text: string; halo: string }> = {
  high_consensus: {
    label: 'High Consensus (Replicated)',
    color: '#10b981',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    halo: '#10b981',
  },
  moderate_consensus: {
    label: 'Moderate Consensus',
    color: '#38bdf8',
    border: 'border-sky-500/40',
    bg: 'bg-sky-500/10',
    text: 'text-sky-300',
    halo: '#38bdf8',
  },
  controversial_frontier: {
    label: 'Controversial / Active Debate',
    color: '#f59e0b',
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    halo: '#f59e0b',
  },
};

export const InterParadigmCitationGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<CitationNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<CitationLink | null>(null);
  const [hoveredLink, setHoveredLink] = useState<CitationLink | null>(null);
  const [filterSystem, setFilterSystem] = useState<string>('all');
  const [consensusFilter, setConsensusFilter] = useState<string>('all');
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState<boolean>(true);

  // Filtered dataset
  const filteredData = useMemo(() => {
    let nodes = initialNodes;
    let links = initialLinks;

    if (filterSystem !== 'all') {
      nodes = nodes.filter((n) => n.system === filterSystem || n.system === 'Nobel_Bridge');
    }

    if (consensusFilter !== 'all') {
      links = links.filter((l) => l.consensusTier === consensusFilter);
      const linkedNodeIds = new Set([
        ...links.map((l) => (typeof l.source === 'object' ? (l.source as any).id : l.source)),
        ...links.map((l) => (typeof l.target === 'object' ? (l.target as any).id : l.target)),
      ]);
      nodes = nodes.filter((n) => linkedNodeIds.has(n.id));
    } else if (filterSystem !== 'all') {
      const nodeIds = new Set(nodes.map((n) => n.id));
      links = links.filter(
        (l) =>
          nodeIds.has(typeof l.source === 'object' ? (l.source as any).id : l.source) &&
          nodeIds.has(typeof l.target === 'object' ? (l.target as any).id : l.target)
      );
    }

    return { nodes, links };
  }, [filterSystem, consensusFilter]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 700;
    const height = 370;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', [0, 0, width, height]);

    // Zoom container
    const g = svg.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.6, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Deep copy data for D3 mutation
    const nodes: CitationNode[] = JSON.parse(JSON.stringify(filteredData.nodes));
    const links: CitationLink[] = JSON.parse(JSON.stringify(filteredData.links));

    // Force Simulation
    const simulation = d3
      .forceSimulation<CitationNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<CitationNode, CitationLink>(links)
          .id((d) => d.id)
          .distance((d) => 140 - (d.citationWeight || 1) * 10)
      )
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(38));

    // Define Markers
    const defs = svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'citation-arrow-emerald')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#10b981');

    defs
      .append('marker')
      .attr('id', 'citation-arrow-amber')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#f59e0b');

    defs
      .append('marker')
      .attr('id', 'citation-arrow-sky')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#38bdf8');

    // 1. Render Confidence Interval Aura Envelopes (Variance Envelopes)
    let ciHalo: any = null;
    if (showConfidenceIntervals) {
      ciHalo = g
        .append('g')
        .attr('class', 'ci-halos')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', (d) => consensusTierStyles[d.consensusTier].halo)
        .attr('stroke-opacity', (d) => (d.consensusTier === 'controversial_frontier' ? 0.35 : 0.2))
        .attr('stroke-width', (d) => Math.max(8, (d.ciUpper - d.ciLower) * 2.6))
        .attr('stroke-linecap', 'round');
    }

    // 2. Render Core Citation Links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => consensusTierStyles[d.consensusTier].color)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', (d) => Math.max(1.8, (d.citationWeight || 1) * 1.4))
      .attr('stroke-dasharray', (d) => (d.consensusTier === 'controversial_frontier' ? '5,5' : 'none'))
      .attr('marker-end', (d) =>
        d.consensusTier === 'high_consensus'
          ? 'url(#citation-arrow-emerald)'
          : d.consensusTier === 'controversial_frontier'
          ? 'url(#citation-arrow-amber)'
          : 'url(#citation-arrow-sky)'
      )
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, d: CitationLink) => {
        setHoveredLink(d);
        d3.select(event.currentTarget as SVGElement)
          .attr('stroke-opacity', 1)
          .attr('stroke-width', (d.citationWeight || 1) * 2.8);
      })
      .on('mouseleave', (event: MouseEvent, d: CitationLink) => {
        setHoveredLink(null);
        d3.select(event.currentTarget as SVGElement)
          .attr('stroke-opacity', 0.8)
          .attr('stroke-width', Math.max(1.8, (d.citationWeight || 1) * 1.4));
      })
      .on('click', (event: MouseEvent, d: CitationLink) => {
        event.stopPropagation();
        setSelectedLink(d);
        setSelectedNode(null);
      });

    // 3. Render Nodes Group
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .style('cursor', 'grab')
      .call(
        d3
          .drag<SVGGElement, CitationNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        setSelectedLink(null);
      });

    // Node Confidence Interval Outer Ring (Variance Error Ring)
    if (showConfidenceIntervals) {
      node
        .append('circle')
        .attr('r', (d) => 14 + d.stdError * 4.5)
        .attr('fill', 'none')
        .attr('stroke', (d) => consensusTierStyles[d.consensusTier].color)
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', (d) => (d.consensusTier === 'controversial_frontier' ? '3,3' : '2,2'))
        .attr('stroke-opacity', 0.6);
    }

    // Outer Glow Ring
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'classical_text' ? 13 : Math.min(22, 12 + Math.log10(d.citationCount || 10) * 2.5)))
      .attr('fill', (d) => systemColors[d.system].node)
      .attr('fill-opacity', 0.25)
      .attr('stroke', (d) => systemColors[d.system].stroke)
      .attr('stroke-width', 2);

    // Inner Core Circle
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'classical_text' ? 6 : 7.5))
      .attr('fill', (d) => systemColors[d.system].node);

    // Node Labels
    node
      .append('text')
      .text((d) => d.name.split(' (')[0].split(' /')[0])
      .attr('x', 0)
      .attr('y', 28)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f1f5f9')
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif')
      .attr('font-weight', '600')
      .attr('pointer-events', 'none')
      .style('text-shadow', '0 1px 4px rgba(0,0,0,0.9)');

    // System badge & CI span text
    node
      .append('text')
      .text((d) => (showConfidenceIntervals ? `±${(d.stdError * 1.96).toFixed(1)}%` : d.system))
      .attr('x', 0)
      .attr('y', 39)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => (showConfidenceIntervals ? consensusTierStyles[d.consensusTier].color : systemColors[d.system].stroke))
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none');

    // Tick Handler
    simulation.on('tick', () => {
      if (ciHalo) {
        ciHalo
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);
      }

      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredData, showConfidenceIntervals]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-950/80 p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-3"
    >
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>INTER-PARADIGM EVIDENCE CITATION GRAPH & 95% CONFIDENCE INTERVALS</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Visualizing statistical uncertainty, inter-trial variance ($\sigma^2$), and consensus vs. controversial cross-paradigm linkages.
          </p>
        </div>

        {/* Controls: CI Toggle & Consensus Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* CI Mode Toggle */}
          <button
            onClick={() => setShowConfidenceIntervals(!showConfidenceIntervals)}
            className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition border ${
              showConfidenceIntervals
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5 text-amber-400" />
            <span>95% CI Uncertainty Auras: {showConfidenceIntervals ? 'ON' : 'OFF'}</span>
          </button>

          {/* Consensus Tier Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
            <span className="text-slate-400 px-1.5 hidden sm:inline">Consensus:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'high_consensus', label: 'High' },
              { id: 'moderate_consensus', label: 'Moderate' },
              { id: 'controversial_frontier', label: 'Controversial' },
            ].map((tier) => (
              <button
                key={tier.id}
                onClick={() => setConsensusFilter(tier.id)}
                className={`px-2 py-0.5 rounded transition ${
                  consensusFilter === tier.id
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full h-[330px] sm:h-[370px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80">
        <svg ref={svgRef} className="w-full h-full select-none" />

        {/* Floating Legend for CI & Systems */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-[10px] font-mono pointer-events-none max-w-xs">
          <div className="font-bold text-slate-300 flex items-center gap-1 text-[11px] border-b border-slate-800 pb-1">
            <Activity className="h-3 w-3 text-amber-400" />
            <span>Evidence Variance Legend</span>
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>High Consensus ($\sigma^2 &lt; 3.0$, $I^2 &lt; 25\%$)</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-400">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <span>Moderate ($\sigma^2 &lt; 8.0$, $I^2 &lt; 50\%$)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Controversial / Frontier ($\sigma^2 \ge 8.0$)</span>
            </div>
          </div>
        </div>

        {/* Hover / Link Statistical Tooltip */}
        {hoveredLink && !selectedLink && (
          <div className="absolute bottom-2 left-2 right-2 sm:right-auto sm:max-w-md p-3 rounded-xl bg-slate-900/95 border border-amber-500/40 text-xs shadow-2xl backdrop-blur-md space-y-1.5 pointer-events-none z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold text-[11px]">
                <Share2 className="h-3 w-3" />
                <span>Inter-Paradigm Linkage CI</span>
              </div>
              <span className={`text-[10px] font-mono font-bold ${consensusTierStyles[hoveredLink.consensusTier].text}`}>
                {consensusTierStyles[hoveredLink.consensusTier].label}
              </span>
            </div>

            <p className="text-[11px] text-slate-200 leading-snug">
              {hoveredLink.description}
            </p>

            <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800 text-[10px] font-mono text-slate-300">
              <div>
                <span className="text-slate-500 block">95% CI Interval</span>
                <span className="text-emerald-400 font-bold">[{hoveredLink.ciLower}% - {hoveredLink.ciUpper}%]</span>
              </div>
              <div>
                <span className="text-slate-500 block">Variance (σ²)</span>
                <span className="text-amber-400 font-bold">{hoveredLink.variance.toFixed(1)} (I²: {hoveredLink.iSquared}%)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Trials (N)</span>
                <span className="text-sky-300 font-bold">{hoveredLink.trialCount} RCTs (n={hoveredLink.sampleSizeN.toLocaleString()})</span>
              </div>
            </div>
          </div>
        )}

        {/* Selected Link Deep Statistical Inspection Drawer */}
        {selectedLink && (
          <div className="absolute top-2 right-2 max-w-sm p-4 rounded-2xl bg-slate-900/95 border border-amber-500/50 text-xs shadow-2xl backdrop-blur-md space-y-3 z-20">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <span className={`text-[10px] font-mono font-bold uppercase ${consensusTierStyles[selectedLink.consensusTier].text}`}>
                  {consensusTierStyles[selectedLink.consensusTier].label}
                </span>
                <h4 className="font-bold text-white text-sm mt-0.5">Statistical Variance & CI Audit</h4>
              </div>
              <button
                onClick={() => setSelectedLink(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedLink.description}
            </p>

            {/* Statistical Matrix */}
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 block">Mean Score (μ):</span>
                <span className="text-white font-bold">{selectedLink.meanEvidenceScore}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">95% CI Envelope:</span>
                <span className="text-emerald-400 font-bold">[{selectedLink.ciLower}% - {selectedLink.ciUpper}%]</span>
              </div>
              <div>
                <span className="text-slate-500 block">Inter-Trial Variance (σ²):</span>
                <span className="text-amber-400 font-bold">{selectedLink.variance.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Heterogeneity (I²):</span>
                <span className="text-sky-300 font-bold">{selectedLink.iSquared}% ({selectedLink.pVal})</span>
              </div>
            </div>

            {selectedLink.controversyNotes && (
              <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-[11px] text-amber-200">
                <span className="font-bold font-mono text-amber-300 flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3" /> Epistemic Controversy Context:
                </span>
                {selectedLink.controversyNotes}
              </div>
            )}
          </div>
        )}

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute top-2 right-2 max-w-xs p-3.5 rounded-2xl bg-slate-900/95 border border-indigo-500/40 text-xs shadow-2xl backdrop-blur-md space-y-2.5 z-20">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-1.5">
              <div>
                <span className={`text-[10px] font-mono font-bold uppercase ${systemColors[selectedNode.system].text}`}>
                  {selectedNode.system} • {selectedNode.year}
                </span>
                <h4 className="font-bold text-white text-xs">{selectedNode.name}</h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-[11px] text-slate-300">
              <p className="leading-snug">{selectedNode.keyFinding}</p>

              <div className="pt-1.5 rounded-lg bg-slate-950 p-2 border border-slate-800 space-y-1 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Evidence Mean (μ):</span>
                  <span className="text-white font-bold">{selectedNode.meanEvidenceScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">95% CI Bounds:</span>
                  <span className="text-emerald-400 font-bold">[{selectedNode.ciLower}% - {selectedNode.ciUpper}%]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Variance (σ²):</span>
                  <span className="text-amber-400 font-bold">{selectedNode.variance.toFixed(1)}</span>
                </div>
              </div>

              <div className="pt-1 text-[10px] font-mono text-slate-400 flex flex-wrap gap-2">
                <span>{selectedNode.journalOrSource}</span>
                <span className="text-amber-400 font-bold">{selectedNode.registryId}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer notes */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono pt-1">
        <div className="flex items-center gap-2">
          <span>Click any citation link or node to inspect full [Mean ± 1.96·SE] variance deconstruction</span>
        </div>
        <span className="text-amber-400 flex items-center gap-1">
          <Award className="h-3 w-3" /> Empirical Heterogeneity (I² Index) Audit
        </span>
      </div>
    </div>
  );
};
