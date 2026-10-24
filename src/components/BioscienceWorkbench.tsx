import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as $3Dmol from '3dmol';
import {
  Dna,
  Search,
  ExternalLink,
  RotateCcw,
  Sparkles,
  BookOpen,
  Activity,
  Layers,
  Eye,
  Play,
  Pause,
  Sun,
  Moon,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface BioscienceWorkbenchProps {
  isDarkMode: boolean;
  onAskQuantumAssistant: (prompt: string, sessionTitle: string) => void;
}

interface PresetTarget {
  gene: string;
  uniprotId: string;
  pdbId: string;
  name: string;
  roleBadge: string;
}

const PRESET_TARGETS: PresetTarget[] = [
  {
    gene: 'TP53',
    uniprotId: 'P04637',
    pdbId: '1TUP',
    name: 'Hücresel Tümör Antijeni p53',
    roleBadge: 'Tümör Baskılayıcı',
  },
  {
    gene: 'EGFR',
    uniprotId: 'P00533',
    pdbId: '1M17',
    name: 'Epidermal Büyüme Faktörü Reseptörü',
    roleBadge: 'Kinaz Reseptörü',
  },
  {
    gene: 'BRCA1',
    uniprotId: 'P38398',
    pdbId: '1JM7',
    name: 'DNA Onarım Proteini BRCA1',
    roleBadge: 'Genomik Kararlılık',
  },
  {
    gene: 'INS',
    uniprotId: 'P01308',
    pdbId: '4INS',
    name: 'İnsülin Hormonu',
    roleBadge: 'Metabolik Regülatör',
  },
  {
    gene: 'HBB',
    uniprotId: 'P68871',
    pdbId: '4HHB',
    name: 'Hemoglobin Alt Birimi Beta',
    roleBadge: 'Oksijen Taşıyıcı',
  },
  {
    gene: 'PCSK9',
    uniprotId: 'Q8NBP7',
    pdbId: '2P4E',
    name: 'Proprotein Konvertaz Subtilisin/Keksin Tip 9',
    roleBadge: 'Kolesterol Hedefi',
  },
];

interface UniProtFeature {
  type: string;
  description: string;
  start: number;
  end: number;
}

interface UniProtData {
  accession: string;
  id: string;
  geneName: string;
  proteinName: string;
  organism: string;
  sequenceLength: number;
  sequence: string;
  functionText: string;
  features: UniProtFeature[];
}

interface AlphaFoldPrediction {
  entryId: string;
  cifUrl: string;
  pdbUrl: string;
  paeImageUrl?: string;
  uniprotStart: number;
  uniprotEnd: number;
}

interface LiteratureItem {
  id: string;
  title: string;
  authorString: string;
  journalTitle: string;
  pubYear: string;
  citedByCount: number;
  doi?: string;
  pmid?: string;
}

interface ClinicalTrialItem {
  nctId: string;
  title: string;
  status: string;
  phases: string[];
  conditions: string[];
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 2,
  baseDelayMs = 500
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok) return response;
    if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, attempt)));
      continue;
    }
    throw new Error(`HTTP ${response.status} from ${url}`);
  }
  throw new Error(`Failed after retries: ${url}`);
}

export const BioscienceWorkbench: React.FC<BioscienceWorkbenchProps> = ({
  isDarkMode,
  onAskQuantumAssistant,
}) => {
  // Search & active target states
  const [searchInput, setSearchInput] = useState('P04637');
  const [activeUniprotId, setActiveUniprotId] = useState('P04637');
  const [activePdbId, setActivePdbId] = useState('1TUP');
  const [structureSource, setStructureSource] = useState<'alphafold' | 'pdb'>('alphafold');

  // 3D Viewer states
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const viewerInstanceRef = useRef<any>(null);
  const [renderStyle, setRenderStyle] = useState<'plddt' | 'spectrum' | 'stick' | 'sphere'>('plddt');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [viewerDarkBg, setViewerDarkBg] = useState<boolean>(true);
  const [selectedResidue, setSelectedResidue] = useState<{
    resi: number;
    resn: string;
    plddt?: number;
  } | null>(null);

  // Fetched biological data states
  const [loadingBio, setLoadingBio] = useState<boolean>(true);
  const [loading3D, setLoading3D] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uniprotData, setUniprotData] = useState<UniProtData | null>(null);
  const [afPrediction, setAfPrediction] = useState<AlphaFoldPrediction | null>(null);
  const [papers, setPapers] = useState<LiteratureItem[]>([]);
  const [trials, setTrials] = useState<ClinicalTrialItem[]>([]);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'domains' | 'literature'>('overview');

  // Apply styling to 3Dmol viewer
  const applyViewerStyle = useCallback(
    (styleMode: 'plddt' | 'spectrum' | 'stick' | 'sphere', source: 'alphafold' | 'pdb') => {
      const viewer = viewerInstanceRef.current;
      if (!viewer) return;

      viewer.removeAllShapes();

      if (styleMode === 'plddt') {
        // Canonical AlphaFold 4-tier pLDDT confidence color scale
        const colorFunc = (atom: any) => {
          const b = atom.b ?? 85;
          if (b > 90) return '#0053D6'; // Very High (>90): Deep Blue
          if (b > 70) return '#65CBF3'; // Confident (70-90): Light Blue
          if (b > 50) return '#FFDB13'; // Low (50-70): Yellow
          return '#FF7D45'; // Very Low (<50): Orange
        };
        viewer.setStyle(
          {},
          source === 'alphafold'
            ? { cartoon: { colorfunc: colorFunc } }
            : { cartoon: { color: 'spectrum' } }
        );
      } else if (styleMode === 'spectrum') {
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
      } else if (styleMode === 'stick') {
        viewer.setStyle(
          {},
          {
            cartoon: { color: '#94a3b8', opacity: 0.65 },
            stick: { radius: 0.18, colorscheme: 'Jmol' },
          }
        );
      } else if (styleMode === 'sphere') {
        viewer.setStyle({}, { sphere: { scale: 0.85, colorscheme: 'Jmol' } });
      }

      viewer.render();
    },
    []
  );

  // Initialize 3Dmol WebGL Viewer
  useEffect(() => {
    if (!viewerContainerRef.current) return;
    const viewer = $3Dmol.createViewer(viewerContainerRef.current, {
      defaultcolors: $3Dmol.rasmolElementColors,
      backgroundColor: viewerDarkBg ? '#0F172A' : '#F8FAFC',
    });
    viewerInstanceRef.current = viewer;

    return () => {
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.clear();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  // Update 3D background color when toggled
  useEffect(() => {
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.setBackgroundColor(viewerDarkBg ? '#0F172A' : '#F8FAFC');
      viewerInstanceRef.current.render();
    }
  }, [viewerDarkBg]);

  // Update 3D spin state
  useEffect(() => {
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.spin(isSpinning ? 'y' : false);
    }
  }, [isSpinning]);

  // Fetch UniProtKB, AlphaFold DB, Europe PMC & ClinicalTrials.gov data
  const loadTargetData = useCallback(async (queryTerm: string, fallbackPdb = '1TUP') => {
    const cleanQuery = queryTerm.trim().toUpperCase();
    if (!cleanQuery) return;

    setLoadingBio(true);
    setErrorMsg(null);
    setSelectedResidue(null);

    try {
      // Determine if input is a UniProt accession or gene symbol
      let targetAccession = cleanQuery;
      const matchedPreset = PRESET_TARGETS.find(
        (p) => p.gene === cleanQuery || p.uniprotId === cleanQuery
      );
      if (matchedPreset) {
        targetAccession = matchedPreset.uniprotId;
        setActivePdbId(matchedPreset.pdbId);
      } else if (!/^[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/.test(cleanQuery)) {
        // Search UniProtKB by gene symbol in Human (9606)
        const searchRes = await fetchWithRetry(
          `https://rest.uniprot.org/uniprotkb/search?query=gene_exact:${encodeURIComponent(
            cleanQuery
          )}+AND+organism_id:9606+AND+reviewed:true&format=json&size=1`
        );
        const searchJson = await searchRes.json();
        if (searchJson.results && searchJson.results.length > 0) {
          targetAccession = searchJson.results[0].primaryAccession;
        }
      }

      setActiveUniprotId(targetAccession);

      // 1. Fetch UniProtKB Entry JSON
      const uniprotRes = await fetchWithRetry(
        `https://rest.uniprot.org/uniprotkb/${targetAccession}.json`
      );
      const uJson = await uniprotRes.json();

      const geneName =
        uJson.genes?.[0]?.geneName?.value ||
        matchedPreset?.gene ||
        targetAccession;
      const proteinName =
        uJson.proteinDescription?.recommendedName?.fullName?.value ||
        uJson.proteinDescription?.submissionNames?.[0]?.fullName?.value ||
        'Biyomoleküler Protein Yapısı';
      const organism = uJson.organism?.scientificName || 'Homo sapiens';
      const sequence = uJson.sequence?.value || '';
      const sequenceLength = uJson.sequence?.length || sequence.length;

      const functionComment = uJson.comments?.find(
        (c: any) => c.commentType === 'FUNCTION'
      );
      const functionText =
        functionComment?.texts?.[0]?.value ||
        'Bu protein hücresel sinyal iletimi, moleküler etkileşim ve genomik regülasyon süreçlerinde görev alır.';

      const relevantTypes = new Set([
        'Domain',
        'Active site',
        'Binding site',
        'DNA binding',
        'Zinc finger',
        'Region',
        'Mutagenesis',
      ]);
      const parsedFeatures: UniProtFeature[] = (uJson.features || [])
        .filter((f: any) => relevantTypes.has(f.type) && f.location?.start?.value)
        .slice(0, 14)
        .map((f: any) => ({
          type: f.type,
          description: f.description || f.type,
          start: f.location.start.value,
          end: f.location.end?.value || f.location.start.value,
        }));

      // Check if UniProt cross-references have a PDB ID
      const pdbXref = (uJson.uniProtKBCrossReferences || []).find(
        (x: any) => x.database === 'PDB'
      );
      if (pdbXref?.id) {
        setActivePdbId(pdbXref.id);
      } else {
        setActivePdbId(fallbackPdb);
      }

      setUniprotData({
        accession: targetAccession,
        id: uJson.uniProtkbId || targetAccession,
        geneName,
        proteinName,
        organism,
        sequenceLength,
        sequence,
        functionText,
        features: parsedFeatures,
      });

      // 2. Fetch AlphaFold DB Prediction Metadata dynamically
      try {
        const afRes = await fetch(
          `https://alphafold.ebi.ac.uk/api/prediction/${targetAccession}`
        );
        if (afRes.ok) {
          const afArr = await afRes.json();
          if (Array.isArray(afArr) && afArr.length > 0) {
            setAfPrediction({
              entryId: afArr[0].entryId,
              cifUrl: afArr[0].cifUrl,
              pdbUrl: afArr[0].pdbUrl,
              paeImageUrl: afArr[0].paeImageUrl,
              uniprotStart: afArr[0].uniprotStart || 1,
              uniprotEnd: afArr[0].uniprotEnd || sequenceLength,
            });
          } else {
            setAfPrediction(null);
          }
        } else {
          setAfPrediction(null);
        }
      } catch {
        setAfPrediction(null);
      }

      // 3. Fetch Biomedical Literature from Europe PMC & ClinicalTrials.gov in parallel
      const [epmcRes, ctRes] = await Promise.allSettled([
        fetch(
          `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(
            geneName
          )}+AND+OPEN_ACCESS:Y&format=json&pageSize=5&sort=CITED+desc`
        ),
        fetch(
          `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(
            geneName
          )}&pageSize=4`
        ),
      ]);

      if (epmcRes.status === 'fulfilled' && epmcRes.value.ok) {
        const epmcJson = await epmcRes.value.json();
        const resultList = epmcJson.resultList?.result || [];
        setPapers(
          resultList.map((item: any) => ({
            id: item.id || item.pmid || String(Math.random()),
            title: item.title || 'Biyomedikal Araştırma Makalesi',
            authorString: item.authorString || 'Araştırma Grubu',
            journalTitle: item.journalTitle || 'Europe PMC',
            pubYear: item.pubYear || '2024',
            citedByCount: item.citedByCount || 0,
            doi: item.doi,
            pmid: item.pmid,
          }))
        );
      }

      if (ctRes.status === 'fulfilled' && ctRes.value.ok) {
        const ctJson = await ctRes.value.json();
        const studies = ctJson.studies || [];
        setTrials(
          studies.map((s: any) => ({
            nctId: s.protocolSection?.identificationModule?.nctId || 'NCT00000000',
            title:
              s.protocolSection?.identificationModule?.briefTitle ||
              'Klinik Araştırma Protokolü',
            status:
              s.protocolSection?.statusModule?.overallStatus || 'ACTIVE',
            phases: s.protocolSection?.designModule?.phases || ['PHASE2'],
            conditions:
              s.protocolSection?.conditionsModule?.conditions?.slice(0, 2) || [geneName],
          }))
        );
      }
    } catch (err: any) {
      setErrorMsg(
        `Biyobilim veritabanı sorgusunda hata oluştu (${cleanQuery}): Lütfen geçerli bir UniProt ID (örn. P04637) veya Gen Sembolü (örn. TP53, EGFR) girin.`
      );
    } finally {
      setLoadingBio(false);
    }
  }, []);

  // Load 3D Structure into 3Dmol.js when activeUniprotId, afPrediction, or structureSource changes
  useEffect(() => {
    const viewer = viewerInstanceRef.current;
    if (!viewer || !activeUniprotId) return;

    let isCancelled = false;
    setLoading3D(true);

    const fetchAndRender3D = async () => {
      try {
        let coordText = '';
        let format: 'cif' | 'pdb' = 'cif';

        if (structureSource === 'alphafold') {
          const cifUrl =
            afPrediction?.cifUrl ||
            `https://alphafold.ebi.ac.uk/files/AF-${activeUniprotId}-F1-model_v6.cif`;
          const res = await fetch(cifUrl);
          if (res.ok) {
            coordText = await res.text();
            format = 'cif';
          } else {
            // Fallback to RCSB PDB if AlphaFold structure unavailable
            const pdbRes = await fetch(
              `https://files.rcsb.org/download/${activePdbId.toUpperCase()}.cif`
            );
            coordText = await pdbRes.text();
            format = 'cif';
          }
        } else {
          const pdbRes = await fetch(
            `https://files.rcsb.org/download/${activePdbId.toUpperCase()}.cif`
          );
          coordText = await pdbRes.text();
          format = 'cif';
        }

        if (isCancelled || !coordText) return;

        viewer.clear();
        viewer.addModel(coordText, format);
        applyViewerStyle(renderStyle, structureSource);

        // Enable interactive residue click picking
        viewer.setClickable({}, true, (atom: any) => {
          if (!atom) return;
          setSelectedResidue({
            resi: atom.resi,
            resn: atom.resn,
            plddt: atom.b ? Math.round(atom.b * 10) / 10 : undefined,
          });
          viewer.removeAllShapes();
          viewer.addSphere({
            center: { x: atom.x, y: atom.y, z: atom.z },
            radius: 2.2,
            color: '#0D9488',
            opacity: 0.65,
          });
          viewer.render();
        });

        viewer.zoomTo();
        viewer.render();
      } catch (e) {
        console.error('3D structure load error:', e);
      } finally {
        if (!isCancelled) setLoading3D(false);
      }
    };

    fetchAndRender3D();

    return () => {
      isCancelled = true;
    };
  }, [activeUniprotId, activePdbId, afPrediction, structureSource]);

  // Re-apply style when renderStyle changes
  useEffect(() => {
    applyViewerStyle(renderStyle, structureSource);
  }, [renderStyle, structureSource, applyViewerStyle]);

  // Initial load on mount (TP53 / P04637)
  useEffect(() => {
    loadTargetData('P04637', '1TUP');
  }, [loadTargetData]);

  // Focus camera on a specific residue range (Domain or Residue click)
  const focusResidueRange = (startRes: number, endRes: number, label: string) => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;

    applyViewerStyle(renderStyle, structureSource);
    const rangeList: number[] = [];
    for (let i = startRes; i <= Math.min(endRes, startRes + 60); i++) {
      rangeList.push(i);
    }

    viewer.addStyle(
      { resi: rangeList },
      { stick: { radius: 0.3, color: '#E8710A' } }
    );
    viewer.zoomTo({ resi: rangeList });
    viewer.render();

    setSelectedResidue({
      resi: startRes,
      resn: label,
    });
  };

  // Construct validated DeepMind AlphaGenome Atlas link
  const getAlphaGenomeLink = (geneSymbol: string) => {
    const params = new URLSearchParams({ q: geneSymbol });
    return `https://deepmind.google.com/science/alphagenome/atlas?${params.toString()}`;
  };

  return (
    <div className="space-y-5">
      {/* Publication-Grade Header & Quick-Try Example Pill Bar */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-colors ${
          isDarkMode
            ? 'bg-[#111622] border-slate-800/90 text-slate-100'
            : 'bg-white border-[#E2E8F0] text-slate-900 shadow-2xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-500/15">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1A73E8]/15 border border-[#1A73E8]/30 flex items-center justify-center text-[#1A73E8] shrink-0">
              <Dna size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30 font-semibold">
                  WİFO Q-PU 9000 · BİYOBİLİM & MOLEKÜLER TEZGAH
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#1A73E8]/15 text-[#1A73E8] border border-[#1A73E8]/30">
                  AlphaFold DB · UniProtKB · RCSB PDB · Europe PMC
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight mt-1">
                Kuantum Biyobilim, 3B Protein Yapısı ve Genomik Analiz Stüdyosu
              </h1>
            </div>
          </div>

          {/* Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadTargetData(searchInput);
            }}
            className="flex items-center gap-2 w-full lg:w-auto"
          >
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border flex-1 lg:w-72 ${
                isDarkMode
                  ? 'bg-[#0B0F17] border-slate-700 text-white'
                  : 'bg-[#F8FAFC] border-[#CBD5E1] text-slate-900'
              }`}
            >
              <Search size={15} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Gen veya UniProt (örn. TP53, P04637, EGFR)..."
                className="w-full text-xs font-mono bg-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loadingBio}
              className="px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-display font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {loadingBio ? 'Sorgulanıyor...' : 'Analiz Et'}
            </button>
          </form>
        </div>

        {/* Top Quick-Try Example Pill Bar */}
        <div className="pt-3.5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <FlaskConical size={13} className="text-[#0D9488]" />
            <span>Hızlı Örnek Hedefler:</span>
          </span>
          {PRESET_TARGETS.map((target) => {
            const isActive = activeUniprotId === target.uniprotId;
            return (
              <button
                key={target.uniprotId}
                type="button"
                onClick={() => {
                  setSearchInput(target.uniprotId);
                  loadTargetData(target.uniprotId, target.pdbId);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#1A73E8] text-white border-[#1A73E8] shadow-xs'
                    : isDarkMode
                    ? 'bg-[#161F30] border-slate-800 text-slate-300 hover:border-slate-700'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="font-bold">{target.gene}</span>
                <span className="font-mono text-[11px] opacity-80">({target.uniprotId})</span>
                <span className="hidden sm:inline text-[10px] opacity-75">· {target.roleBadge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Multi-Pane Scientific Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT PANE (7 cols): Interactive 3D Molecular WebGL Canvas (3Dmol.js) */}
        <div
          className={`lg:col-span-7 rounded-2xl border overflow-hidden flex flex-col ${
            isDarkMode ? 'bg-[#111622] border-slate-800/90' : 'bg-white border-[#E2E8F0]'
          }`}
        >
          {/* 3D Canvas Toolbar */}
          <div
            className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2 ${
              isDarkMode ? 'border-slate-800 bg-[#0D121D]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {/* Source Switcher: AlphaFold DB vs RCSB PDB */}
              <div
                className={`inline-flex p-0.5 rounded-xl border text-xs ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setStructureSource('alphafold')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    structureSource === 'alphafold'
                      ? 'bg-[#1A73E8] text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  AlphaFold DB ({activeUniprotId})
                </button>
                <button
                  type="button"
                  onClick={() => setStructureSource('pdb')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    structureSource === 'pdb'
                      ? 'bg-[#0D9488] text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  RCSB PDB ({activePdbId})
                </button>
              </div>

              {/* Epistemic Provenance Badge */}
              <span
                className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
                  structureSource === 'alphafold'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {structureSource === 'alphafold'
                  ? '[Predicted by model · AlphaFold v6]'
                  : '[Experimentally determined · PDB]'}
              </span>
            </div>

            {/* Style & Camera Controls */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['plddt', 'spectrum', 'stick', 'sphere'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setRenderStyle(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    renderStyle === st
                      ? 'bg-[#1A73E8]/20 border-[#1A73E8] text-[#1A73E8] dark:text-blue-300'
                      : isDarkMode
                      ? 'border-slate-800 text-slate-400 hover:text-white'
                      : 'border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'plddt'
                    ? 'pLDDT Güven'
                    : st === 'spectrum'
                    ? 'Spektrum'
                    : st === 'stick'
                    ? 'Atomik Bağ'
                    : 'Küre (VdW)'}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsSpinning((s) => !s)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isSpinning
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : isDarkMode
                    ? 'border-slate-800 text-slate-400 hover:text-white'
                    : 'border-slate-200 text-slate-600'
                }`}
                title="3B Modeli Döndür / Durdur"
              >
                {isSpinning ? <Pause size={13} /> : <Play size={13} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (viewerInstanceRef.current) {
                    applyViewerStyle(renderStyle, structureSource);
                    viewerInstanceRef.current.zoomTo();
                    viewerInstanceRef.current.render();
                    setSelectedResidue(null);
                  }
                }}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'border-slate-800 text-slate-400 hover:text-white'
                    : 'border-slate-200 text-slate-600'
                }`}
                title="Kamerayı Sıfırla"
              >
                <RotateCcw size={13} />
              </button>

              <button
                type="button"
                onClick={() => setViewerDarkBg((b) => !b)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'border-slate-800 text-slate-400 hover:text-white'
                    : 'border-slate-200 text-slate-600'
                }`}
                title="3B Sahne Arka Planını Değiştir"
              >
                {viewerDarkBg ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            </div>
          </div>

          {/* 3Dmol.js WebGL Viewport Container */}
          <div className="relative h-[430px] w-full">
            <div ref={viewerContainerRef} className="w-full h-full" />

            {loading3D && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-10">
                <Dna size={28} className="animate-spin text-[#65CBF3]" />
                <span className="text-xs font-mono">
                  3B Makromoleküler Koordinatlar (.cif) Yükleniyor...
                </span>
              </div>
            )}

            {/* Selected Residue HUD Overlay */}
            {selectedResidue && (
              <div className="absolute top-3 left-3 z-10 px-3 py-2 rounded-xl bg-slate-900/90 border border-teal-500/40 text-white text-xs font-mono shadow-lg">
                <div className="text-[10px] text-teal-300 uppercase">Seçili Kalıntı / Bölge</div>
                <div className="font-bold">
                  Konum #{selectedResidue.resi} · {selectedResidue.resn}
                  {selectedResidue.plddt !== undefined && (
                    <span className="ml-2 text-cyan-300">(pLDDT: {selectedResidue.plddt})</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Canonical 4-Band AlphaFold pLDDT Confidence Scale Legend */}
          <div
            className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
              isDarkMode ? 'border-slate-800 bg-[#0D121D]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-400">AlphaFold pLDDT Güven Ölçeği:</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#0053D6]" />
                <span>Çok Yüksek (&gt;90)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#65CBF3]" />
                <span>Güvenilir (70-90)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#FFDB13]" />
                <span>Düşük (50-70)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#FF7D45]" />
                <span>Düzensiz (&lt;50)</span>
              </span>
            </div>

            {uniprotData && (
              <button
                type="button"
                onClick={() =>
                  onAskQuantumAssistant(
                    `${uniprotData.geneName} (${uniprotData.accession} - ${uniprotData.proteinName}) proteininin 3 boyutlu yapısal biyolojisini, aktif bölgelerini ve hastalıklarla ilişkisini kuantum moleküler düzeyde analiz et.`,
                    `${uniprotData.geneName} Moleküler Analizi`
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#1A73E8] to-[#0D9488] text-white font-semibold text-xs flex items-center gap-1.5 hover:opacity-95 transition-opacity cursor-pointer"
              >
                <Sparkles size={13} />
                <span>WİFO Kuantum Asistan ile Analiz Et</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT PANE (5 cols): Synchronized Tabbed Bioscience Data Inspector */}
        <div
          className={`lg:col-span-5 rounded-2xl border flex flex-col overflow-hidden ${
            isDarkMode ? 'bg-[#111622] border-slate-800/90' : 'bg-white border-[#E2E8F0]'
          }`}
        >
          {/* Inspector Navigation Tabs */}
          <div
            className={`px-4 pt-3 border-b flex items-center gap-4 text-xs font-semibold ${
              isDarkMode ? 'border-slate-800 bg-[#0D121D]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
            }`}
          >
            <button
              type="button"
              onClick={() => setInspectorTab('overview')}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                inspectorTab === 'overview'
                  ? 'border-[#1A73E8] text-[#1A73E8] dark:text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity size={14} />
              <span>Protein & Genom Özeti</span>
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab('domains')}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                inspectorTab === 'domains'
                  ? 'border-[#0D9488] text-[#0D9488] dark:text-teal-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers size={14} />
              <span>Bölgeler & Dizi ({uniprotData?.features.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab('literature')}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                inspectorTab === 'literature'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={14} />
              <span>Literatür & Klinik ({papers.length})</span>
            </button>
          </div>

          {/* Inspector Content Area */}
          <div className="p-5 flex-1 overflow-y-auto max-h-[480px] custom-scrollbar space-y-4">
            {inspectorTab === 'overview' && uniprotData && (
              <>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#1A73E8]/15 text-[#1A73E8] border border-[#1A73E8]/30">
                      {uniprotData.geneName} · {uniprotData.accession}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>[Literature curated · UniProtKB/Swiss-Prot]</span>
                    </span>
                  </div>
                  <h2 className="font-display text-lg font-bold leading-snug">
                    {uniprotData.proteinName}
                  </h2>
                  <p className="text-xs text-slate-400 italic">
                    Organizma: {uniprotData.organism} · Uzunluk: {uniprotData.sequenceLength} amino asit
                  </p>
                </div>

                {/* Biological Function Card */}
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    isDarkMode
                      ? 'bg-[#161F30]/80 border-slate-800 text-slate-300'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                    Moleküler Fonksiyon (UniProtKB)
                  </div>
                  {uniprotData.functionText}
                </div>

                {/* Authoritative Outbound Database Citations & AlphaGenome Deep-Link */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Doğrulanmış Biyobilim Kaynak Bağlantıları
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <a
                      href={`https://www.uniprot.org/uniprotkb/${uniprotData.accession}/entry`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50 text-slate-200'
                          : 'bg-[#F8FAFC] border-slate-200 hover:border-blue-500 text-slate-800'
                      }`}
                    >
                      <span>UniProtKB Kaydı</span>
                      <ExternalLink size={13} className="text-[#1A73E8]" />
                    </a>

                    <a
                      href={`https://alphafold.ebi.ac.uk/entry/${uniprotData.accession}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50 text-slate-200'
                          : 'bg-[#F8FAFC] border-slate-200 hover:border-blue-500 text-slate-800'
                      }`}
                    >
                      <span>AlphaFold DB</span>
                      <ExternalLink size={13} className="text-[#1A73E8]" />
                    </a>

                    <a
                      href={`https://www.rcsb.org/structure/${activePdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-800 hover:border-teal-500/50 text-slate-200'
                          : 'bg-[#F8FAFC] border-slate-200 hover:border-teal-500 text-slate-800'
                      }`}
                    >
                      <span>RCSB PDB ({activePdbId})</span>
                      <ExternalLink size={13} className="text-[#0D9488]" />
                    </a>

                    <a
                      href={getAlphaGenomeLink(uniprotData.geneName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-800 hover:border-purple-500/50 text-slate-200'
                          : 'bg-[#F8FAFC] border-slate-200 hover:border-purple-500 text-slate-800'
                      }`}
                    >
                      <span>AlphaGenome Atlas</span>
                      <ExternalLink size={13} className="text-purple-400" />
                    </a>
                  </div>
                </div>
              </>
            )}

            {inspectorTab === 'domains' && uniprotData && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold mb-1">
                    Fonksiyonel Bölgeler & Aktif Alanlar (3B Kamerada Odaklamak İçin Tıklayın)
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2.5">
                    Bir bölgeye tıkladığınızda sol taraftaki 3B protein modeli otomatik olarak ilgili amino asit koordinatlarına yakınlaşır.
                  </p>

                  <div className="space-y-2">
                    {uniprotData.features.map((feat, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          focusResidueRange(feat.start, feat.end, `${feat.type}: ${feat.description}`)
                        }
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#161F30]/90 border-slate-800 hover:border-[#0D9488]'
                            : 'bg-[#F8FAFC] border-slate-200 hover:border-[#0D9488]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#0D9488]/15 text-[#0D9488] font-bold">
                              {feat.type}
                            </span>
                            <span className="text-xs font-semibold">{feat.description}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-xs text-[#E8710A] shrink-0">
                          <span>
                            {feat.start}-{feat.end}
                          </span>
                          <Eye size={13} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sequence Preview Box */}
                <div>
                  <div className="text-xs font-semibold mb-1.5">
                    Kanoni̇k Amino Asit Dizisi (FASTA · İlk 240 Kalıntı)
                  </div>
                  <div
                    className={`p-3 rounded-xl border font-mono text-[11px] leading-relaxed break-all select-all ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {uniprotData.sequence.slice(0, 240)}
                    {uniprotData.sequence.length > 240 ? '...' : ''}
                  </div>
                </div>
              </div>
            )}

            {inspectorTab === 'literature' && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold mb-2">
                    Europe PMC Açık Erişim Bilimsel Makaleler
                  </div>
                  <div className="space-y-2.5">
                    {papers.map((paper) => (
                      <div
                        key={paper.id}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          isDarkMode
                            ? 'bg-[#161F30]/80 border-slate-800'
                            : 'bg-[#F8FAFC] border-slate-200'
                        }`}
                      >
                        <div className="font-semibold leading-snug">{paper.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {paper.authorString}
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                          <span className="text-[#0D9488]">
                            {paper.journalTitle} ({paper.pubYear}) · {paper.citedByCount} Atıf
                          </span>
                          {paper.pmid && (
                            <a
                              href={`https://europepmc.org/article/MED/${paper.pmid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1A73E8] hover:underline flex items-center gap-1"
                            >
                              <span>PMID:{paper.pmid}</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {trials.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold mb-2">
                      ClinicalTrials.gov İlişkili Klinik Araştırmalar
                    </div>
                    <div className="space-y-2">
                      {trials.map((tr) => (
                        <div
                          key={tr.nctId}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                            isDarkMode
                              ? 'bg-slate-900/80 border-slate-800'
                              : 'bg-[#F8FAFC] border-slate-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-mono text-[11px] text-emerald-400 font-bold">
                              {tr.nctId} · {tr.status}
                            </div>
                            <div className="truncate font-medium mt-0.5">{tr.title}</div>
                          </div>
                          <a
                            href={`https://clinicaltrials.gov/study/${tr.nctId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#1A73E8]/15 text-[#1A73E8] shrink-0"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
