import React, { useState } from 'react';
import {
  Code,
  Server,
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Terminal,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Cpu,
  Layers,
  X,
  FileText,
  MessageSquare,
  FileSpreadsheet,
  Lock,
  ArrowRight,
  RefreshCw,
  Sliders
} from 'lucide-react';

interface ApiIntegrationAndDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'apis' | 'deployment' | 'whatsapp' | 'sheets' | 'ai';
}

export const ApiIntegrationAndDeploymentModal: React.FC<ApiIntegrationAndDeploymentModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'apis'
}) => {
  const [activeTab, setActiveTab] = useState<'apis' | 'deployment' | 'whatsapp' | 'sheets' | 'ai'>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Top Header */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  API Integration Guide & Enterprise Deployment Manual
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v3.4 Production
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Step-by-step guides for REST endpoints, WhatsApp automated KPI triggers, Google Sheets sync & Cloud Run deployment.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-900/90 px-6 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('apis')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'apis'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Core REST APIs</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp KPI Trigger API</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sheets'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheets Sync API</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Gemini AI Integration</span>
          </button>

          <button
            onClick={() => setActiveTab('deployment')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'deployment'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud & Docker Deployment</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* TAB 1: CORE REST APIS */}
          {activeTab === 'apis' && (
            <div className="space-y-5">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Standard Authentication & Global Headers</span>
                </h3>
                <p className="text-slate-400 mt-1">
                  All AlphaERP REST API endpoints require a valid Bearer token and tenant identification.
                </p>
                <div className="mt-3 bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-emerald-400 border border-slate-800 relative">
                  <button
                    onClick={() =>
                      handleCopy(
                        `Authorization: Bearer YOUR_API_TOKEN\nContent-Type: application/json\nX-Alpha-Tenant-ID: default-corp`,
                        'auth-headers'
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-[10px] flex items-center gap-1"
                  >
                    {copiedKey === 'auth-headers' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'auth-headers' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <div>Authorization: Bearer YOUR_API_TOKEN</div>
                  <div>Content-Type: application/json</div>
                  <div>X-Alpha-Tenant-ID: default-corp</div>
                </div>
              </div>

              {/* Endpoint 1: Verify BOQ Inventory */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      POST
                    </span>
                    <span className="font-mono font-bold text-white text-xs">/api/projects/:id/verify-boq</span>
                  </div>
                  <span className="text-[11px] text-slate-400">BOQ Inventory & Reorder Level Verification</span>
                </div>
                <p className="text-slate-400">
                  Cross-checks project BOQ items against current inventory and detects any stock falling below defined <code>reorderLevel</code>.
                </p>

                <div className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800 relative">
                  <button
                    onClick={() =>
                      handleCopy(
                        `curl -X POST https://your-erp-domain.com/api/projects/PRJ-2026-001/verify-boq \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json"`,
                        'curl-verify-boq'
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-[10px] flex items-center gap-1"
                  >
                    {copiedKey === 'curl-verify-boq' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'curl-verify-boq' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <span className="text-slate-500"># Verification Request:</span>
                  <div className="text-blue-300">
                    curl -X POST https://your-erp-domain.com/api/projects/PRJ-2026-001/verify-boq \
                  </div>
                  <div>  -H "Authorization: Bearer YOUR_TOKEN" \</div>
                  <div>  -H "Content-Type: application/json"</div>
                </div>
              </div>

              {/* Endpoint 2: Projects List */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      GET
                    </span>
                    <span className="font-mono font-bold text-white text-xs">/api/projects</span>
                  </div>
                  <span className="text-[11px] text-slate-400">List Projects with Delay & Milestone Telemetry</span>
                </div>
                <p className="text-slate-400">
                  Retrieves all project records, status, physical progress (%), delay flags, and root cause reasons.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: WHATSAPP TRIGGER API */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-5">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Previous Day Business KPIs WhatsApp Trigger API</span>
                </h3>
                <p className="text-slate-400 mt-1">
                  Automatically calculates previous day sales leads, bill collections, receivables aging buckets (0, 30, 60, 90, &gt;90d), vendor disbursements, net revenue, and delayed projects with root causes.
                </p>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      POST
                    </span>
                    <span className="font-mono font-bold text-white text-xs">/api/kpi/whatsapp-trigger</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Daily 08:30 AM Automated Cron Endpoint</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800 relative">
                  <button
                    onClick={() =>
                      handleCopy(
                        `curl -X POST https://your-erp-domain.com/api/kpi/whatsapp-trigger \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "snapshotDate": "2026-09-03",\n    "recipients": [\n      {"name": "Managing Director", "phone": "+919820012345"},\n      {"name": "Chief Financial Officer", "phone": "+919811122233"}\n    ]\n  }'`,
                        'curl-whatsapp'
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-[10px] flex items-center gap-1"
                  >
                    {copiedKey === 'curl-whatsapp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'curl-whatsapp' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <div className="text-slate-400">// Dispatch Trigger Payload:</div>
                  <div className="text-emerald-300">curl -X POST https://your-erp-domain.com/api/kpi/whatsapp-trigger \</div>
                  <div>  -H "Authorization: Bearer YOUR_TOKEN" \</div>
                  <div>  -H "Content-Type: application/json" \</div>
                  <div>  -d '&#123;</div>
                  <div>    "snapshotDate": "2026-09-03",</div>
                  <div>    "recipients": [</div>
                  <div>      &#123;"name": "Managing Director", "phone": "+919820012345"&#125;,</div>
                  <div>      &#123;"name": "CFO", "phone": "+919811122233"&#125;</div>
                  <div>    ]</div>
                  <div>  &#125;'</div>
                </div>
              </div>

              {/* Sample Output */}
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl space-y-2">
                <span className="font-bold text-emerald-300 text-xs">Formatted Output Sent to Executive WhatsApp:</span>
                <pre className="font-mono text-[11px] text-emerald-200 bg-slate-950 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
{`📊 *ALPHA HVAC ENTERPRISE — PREVIOUS DAY BUSINESS KEY KPIS DIGEST*
📅 *Snapshot Date:* 03 Sep 2026 | *Triggered:* 08:30 IST

1️⃣ *NEW LEADS GENERATED (Sales Pipeline)*
• Total New Leads: *3 Leads* (Pipeline Value: *₹46.50 Lakhs*)

2️⃣ *BILL COLLECTIONS RECEIVED*
• Total Collections: *₹4,85,000* | Efficiency: *78.5%*

3️⃣ *PENDING RECEIVABLES AGING BUCKETS*
• Total Outstanding: *₹18,50,000*
  ├ 0–30 Days (Current): ₹8,20,000
  ├ 31–60 Days (Follow-up): ₹5,10,000
  ├ 61–90 Days (Critical): ₹3,20,000
  └ >90 Days (Overdue Alert): ₹2,00,000

4️⃣ *TOTAL PAYMENTS DONE (Outflows)*
• Total Disbursed: *₹3,40,000* (3 Vendor PO Settlements)

5️⃣ *NET BUSINESS REVENUE GENERATED*
• Won Contracts Revenue: *₹38.00 Lakhs* | Gross Margin: *24.8%*

6️⃣ *DELAYED PROJECTS & ROOT CAUSES*
⚠️ *1 Project Currently Delayed:*
• *PRJ-2026-001 (One BKC Tower - 120 HP VRF)*: 14 Days Delayed
  └ *Reason:* Client civil work delayed by 14 days
  └ *Mitigation:* Expedite ducting teams in double shifts`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE SHEETS */}
          {activeTab === 'sheets' && (
            <div className="space-y-5">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-green-400" />
                  <span>Google Sheets Bi-Directional Synchronization</span>
                </h3>
                <p className="text-slate-400 mt-1">
                  Connect any Google Spreadsheet to automatically synchronize Leads, Quotes, Inventory, and Projects.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700">
                  <span className="font-bold text-white text-xs block mb-1">Step 1: Share Spreadsheet</span>
                  <p className="text-slate-400 text-[11px]">
                    Share your Google Sheet with the ERP service account or configure Google OAuth2 Client ID in System Settings.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700">
                  <span className="font-bold text-white text-xs block mb-1">Step 2: Tab Mapping</span>
                  <p className="text-slate-400 text-[11px]">
                    Ensure tab names match: <code>Leads</code>, <code>Quotes</code>, <code>Inventory</code>, <code>Projects</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GEMINI AI */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>Gemini 2.5 AI Intelligence API</span>
                </h3>
                <p className="text-slate-400 mt-1">
                  Provides automated risk evaluations, margin optimization suggestions, and natural language audit summaries.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: CLOUD & DOCKER DEPLOYMENT */}
          {activeTab === 'deployment' && (
            <div className="space-y-5">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-indigo-400" />
                  <span>Production Deployment to Google Cloud Run / Docker</span>
                </h3>
                <p className="text-slate-400 mt-1">
                  Deploy as a single bundled container with Express + Vite middleware, port 3000 binding, and automatic scaling.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800 relative">
                <button
                  onClick={() =>
                    handleCopy(
                      `# Build Container\ngcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/alpha-erp:v3.4\n\n# Deploy to Cloud Run\ngcloud run deploy alpha-erp \\\n  --image gcr.io/YOUR_PROJECT_ID/alpha-erp:v3.4 \\\n  --platform managed \\\n  --region asia-east1 \\\n  --allow-unauthenticated \\\n  --port 3000 \\\n  --memory 1Gi`,
                      'gcloud-deploy'
                    )
                  }
                  className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-[10px] flex items-center gap-1"
                >
                  {copiedKey === 'gcloud-deploy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'gcloud-deploy' ? 'Copied' : 'Copy'}</span>
                </button>
                <div className="text-slate-500"># 1. Build Container Image:</div>
                <div className="text-indigo-300">gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/alpha-erp:v3.4</div>
                <div className="text-slate-500 mt-2"># 2. Deploy to Cloud Run:</div>
                <div className="text-emerald-300">gcloud run deploy alpha-erp \</div>
                <div>  --image gcr.io/YOUR_PROJECT_ID/alpha-erp:v3.4 \</div>
                <div>  --platform managed \</div>
                <div>  --region asia-east1 \</div>
                <div>  --allow-unauthenticated \</div>
                <div>  --port 3000 \</div>
                <div>  --memory 1Gi</div>
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-[11px] text-indigo-200">
                <strong>Deployment Verification:</strong> Visit <code>https://your-app.run.app/api/health</code> to verify container health status.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Documented in <strong>API_INTEGRATION_GUIDE.md</strong> & <strong>DEPLOYMENT_MANUAL.md</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
