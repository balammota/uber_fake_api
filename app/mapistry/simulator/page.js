"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DarkCodeBlock,
  MapistryCard,
  MAPISTRY_API_KEY,
  MAPISTRY_BASE_URL,
  PageHeader,
} from "@/app/components/mapistry-ui";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "your-supabase-anon-key";

const TABS = [
  { id: "auth", label: "Authentication" },
  { id: "sites", label: "Get Sites" },
  { id: "upload", label: "Upload Entry" },
  { id: "pipeline", label: "Full Pipeline" },
  { id: "srm-pipeline", label: "SRM Pipeline" },
];

const CODE = {
  auth: {
    description:
      "Verify API connectivity with ping and list sites using your API key.",
    code: `// auth.js
const API_KEY = '${MAPISTRY_API_KEY}'
const BASE_URL = '${MAPISTRY_BASE_URL}'

async function ping() {
  const response = await fetch(\`\${BASE_URL}/ping\`)
  const data = await response.json()
  console.log('API Status:', data.message)
}

async function getSites() {
  const response = await fetch(\`\${BASE_URL}/sites\`, {
    headers: { 'x-api-key': API_KEY }
  })
  const data = await response.json()
  console.log(\`Found \${data.data.length} sites\`)
  return data.data
}

ping()
getSites()`,
    output: `API Status: pong
Found 10 sites`,
  },
  sites: {
    description: "Fetch all SRM Concrete facilities with pagination metadata.",
    code: `// get-sites.js
const API_KEY = '${MAPISTRY_API_KEY}'
const BASE_URL = '${MAPISTRY_BASE_URL}'

async function getAllSites() {
  try {
    const response = await fetch(\`\${BASE_URL}/sites\`, {
      headers: { 'x-api-key': API_KEY }
    })
    if (!response.ok) throw new Error(\`Status: \${response.status}\`)
    const data = await response.json()
    
    data.data.forEach(site => {
      console.log(\`\${site.name} — \${site.siteCity}, \${site.state}\`)
    })
    
    console.log(\`Total: \${data.meta.page.totalCount} sites\`)
  } catch(error) {
    console.log('Error:', error.message)
  }
}

getAllSites()`,
    output: `SRM Concrete - CDMX Plant 1 — CDMX, Mexico City
SRM Concrete - Dallas Plant — Dallas, Texas
...
Total: 10 sites`,
  },
  upload: {
    description:
      "POST a new emissions entry to a site log with randomized CO₂ values.",
    code: `// upload-entry.js
const API_KEY = '${MAPISTRY_API_KEY}'
const BASE_URL = '${MAPISTRY_BASE_URL}'

async function uploadEmissionsEntry(siteId, logId) {
  try {
    const entry = {
      logDate: new Date().toISOString().slice(0, 16),
      isComplete: true,
      fieldValues: {
        field_1: { value: Math.floor(Math.random() * 500) + 200, units: 'kg' },
        field_2: { value: new Date().toISOString().slice(0, 10) },
        field_3: { value: 'Automated entry from SRM integration' },
        field_4: { value: true }
      }
    }

    const response = await fetch(
      \`\${BASE_URL}/edp/sites/\${siteId}/logs/\${logId}/entries\`,
      {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      }
    )

    if (!response.ok) throw new Error(\`Status: \${response.status}\`)
    const data = await response.json()
    console.log('Entry created:', data.id)
    return data

  } catch(error) {
    console.log('Error:', error.message)
  }
}

uploadEmissionsEntry('site_1', 'log_1_1')`,
    output: `Entry created: entry_1712345678901`,
  },
  pipeline: {
    description:
      "Full SRM → Mapistry pipeline with retry logic for 429 and 5xx errors.",
    code: `// srm-pipeline.js
const API_KEY = '${MAPISTRY_API_KEY}'
const BASE_URL = '${MAPISTRY_BASE_URL}'
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchWithRetry(url, options, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options)
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 1
        console.log(\`Rate limited — waiting \${retryAfter}s\`)
        await wait(retryAfter * 1000)
        continue
      }
      if (response.status >= 500 && attempt < retries) {
        const delay = 1000 * Math.pow(2, attempt - 1)
        console.log(\`Server error — retry \${attempt}/\${retries} in \${delay}ms\`)
        await wait(delay)
        continue
      }
      return response
    } catch(error) {
      if (attempt < retries) {
        await wait(1000 * Math.pow(2, attempt - 1))
      } else throw error
    }
  }
}

async function runSRMPipeline() {
  console.log('Starting SRM → Mapistry pipeline...')
  
  const sitesResponse = await fetchWithRetry(\`\${BASE_URL}/sites\`, {
    headers: { 'x-api-key': API_KEY }
  })
  const { data: sites } = await sitesResponse.json()
  console.log(\`Processing \${sites.length} SRM plants\`)

  const results = []
  for (const site of sites) {
    try {
      const logId = \`log_\${site.id.replace('site_', '')}_1\`
      const entry = {
        logDate: new Date().toISOString().slice(0, 16),
        isComplete: true,
        fieldValues: {
          field_1: { value: Math.floor(Math.random() * 500) + 200, units: 'kg' },
          field_2: { value: new Date().toISOString().slice(0, 10) },
          field_3: { value: \`Automated entry — \${site.name}\` },
          field_4: { value: true }
        }
      }

      const response = await fetchWithRetry(
        \`\${BASE_URL}/edp/sites/\${site.id}/logs/\${logId}/entries\`,
        {
          method: 'POST',
          headers: { 
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entry)
        }
      )

      const data = await response.json()
      results.push({ site: site.name, status: 'success', entryId: data.id })
      console.log(\`✅ \${site.name} — entry created\`)
      await wait(500)

    } catch(error) {
      results.push({ site: site.name, status: 'failed', error: error.message })
      console.log(\`❌ \${site.name} — failed: \${error.message}\`)
    }
  }

  const successful = results.filter(r => r.status === 'success')
  const failed = results.filter(r => r.status === 'failed')
  
  console.log('\\n── PIPELINE REPORT ──')
  console.log(\`Total: \${results.length}\`)
  console.log(\`Successful: \${successful.length}\`)
  console.log(\`Failed: \${failed.length}\`)
}

runSRMPipeline()`,
    output: `Starting SRM → Mapistry pipeline...
Processing 10 SRM plants
✅ SRM Concrete - CDMX Plant 1 — entry created
...
── PIPELINE REPORT ──
Total: 10
Successful: 10
Failed: 0`,
  },
  "srm-pipeline": {
    description:
      "Read unuploaded rows from srm_production in Supabase, calculate emissions, and POST to Mapistry.",
    code: `// srm-pipeline.js
// Run: node srm-pipeline.js
// This reads from Supabase and uploads to Mapistry

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = '${SUPABASE_URL}'
const SUPABASE_KEY = '${SUPABASE_KEY}'
const MAPISTRY_API_KEY = '${MAPISTRY_API_KEY}'
const MAPISTRY_BASE_URL = '${MAPISTRY_BASE_URL}'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchWithRetry(url, options, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options)
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 1
        console.log('Rate limited — waiting', retryAfter, 'seconds')
        await wait(retryAfter * 1000)
        continue
      }
      if (response.status >= 500 && attempt < retries) {
        const delay = 1000 * Math.pow(2, attempt - 1)
        console.log('Server error — retry', attempt, 'of', retries)
        await wait(delay)
        continue
      }
      return response
    } catch(error) {
      if (attempt < retries) {
        await wait(1000 * Math.pow(2, attempt - 1))
      } else throw error
    }
  }
}

async function getUnuploadedRecords() {
  const { data, error } = await supabase
    .from('srm_production')
    .select('*')
    .eq('uploaded_to_mapistry', false)
    .order('date', { ascending: false })
  
  if (error) throw new Error('Supabase error: ' + error.message)
  return data
}

async function calculateEmissions(record) {
  return {
    CO2: record.cement_produced_tons * 842,
    NOx: record.fuel_consumed_liters * 0.0023,
    SO2: record.fuel_consumed_liters * 0.0015,
    PM10: record.cement_produced_tons * 8.9
  }
}

async function uploadToMapistry(record, emissions) {
  const logId = 'log_' + record.site_id.replace('site_', '') + '_1'
  const entry = {
    logDate: record.date + 'T08:00',
    isComplete: true,
    fieldValues: {
      field_1: { value: Math.round(emissions.CO2), units: 'kg' },
      field_2: { value: record.date },
      field_3: { value: record.operator_notes || 'SRM automated upload' },
      field_4: { value: true }
    }
  }

  const response = await fetchWithRetry(
    MAPISTRY_BASE_URL + '/edp/sites/' + record.site_id + '/logs/' + logId + '/entries',
    {
      method: 'POST',
      headers: {
        'x-api-key': MAPISTRY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(entry)
    }
  )

  if (!response.ok) throw new Error('Mapistry error: ' + response.status)
  return response.json()
}

async function markAsUploaded(recordId) {
  const { error } = await supabase
    .from('srm_production')
    .update({ 
      uploaded_to_mapistry: true,
      uploaded_at: new Date().toISOString()
    })
    .eq('id', recordId)
  
  if (error) throw new Error('Could not mark as uploaded: ' + error.message)
}

async function runPipeline() {
  console.log('Starting SRM → Mapistry pipeline...')
  
  const records = await getUnuploadedRecords()
  console.log('Found', records.length, 'records to upload')
  
  if (records.length === 0) {
    console.log('Nothing to upload — generate data first in the SRM Generator')
    return
  }

  const results = []
  
  for (const record of records) {
    try {
      const emissions = await calculateEmissions(record)
      console.log(record.site_name, '— CO2:', Math.round(emissions.CO2), 'kg')
      
      await uploadToMapistry(record, emissions)
      await markAsUploaded(record.id)
      
      results.push({ site: record.site_name, status: 'success', emissions })
      console.log('✅', record.site_name, '— uploaded successfully')
      
      await wait(300)
      
    } catch(error) {
      results.push({ site: record.site_name, status: 'failed', error: error.message })
      console.log('❌', record.site_name, '— failed:', error.message)
    }
  }

  const successful = results.filter(r => r.status === 'success')
  const failed = results.filter(r => r.status === 'failed')
  
  console.log('\\n── PIPELINE REPORT ──')
  console.log('Total processed:', results.length)
  console.log('Successful:', successful.length)
  console.log('Failed:', failed.length)
  
  if (successful.length > 0) {
    const totalCO2 = successful
      .reduce((acc, r) => acc + r.emissions.CO2, 0)
    console.log('Total CO2 uploaded:', Math.round(totalCO2), 'kg')
  }
}

runPipeline()`,
    output: `Starting SRM → Mapistry pipeline...
Found 10 records to upload
SRM Concrete - Dallas Plant — CO2: 1847290 kg
✅ SRM Concrete - Dallas Plant — uploaded successfully
...
── PIPELINE REPORT ──
Total processed: 10
Successful: 10
Failed: 0
Total CO2 uploaded: 15230450 kg`,
    showRunHint: true,
  },
};

export default function MapistrySimulatorPage() {
  const [tab, setTab] = useState("auth");
  const current = CODE[tab];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <PageHeader
        title="Node.js Integration Simulator"
        subtitle="Copy and run these examples in your terminal"
      />

      <MapistryCard className="mb-8 border-[#2D7A4F]/20 bg-[#E8F5EE]">
        <p className="text-sm text-[#1A1A1A]">
          These examples connect to your live Mapistry sandbox. Copy any example,
          run with <code className="rounded bg-white px-1 font-mono text-xs">node filename.js</code>,
          and see results in your Dashboard in real time.
        </p>
      </MapistryCard>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-[#E5E7EB]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-[#2D7A4F] text-[#2D7A4F]"
                : "border-transparent text-[#6B7280] hover:text-[#1A1A1A]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-[#6B7280]">{current.description}</p>

      <DarkCodeBlock code={current.code} label="nodejs" />

      <MapistryCard className="mt-6">
        <h3 className="text-sm font-bold text-[#1A1A1A]">Expected output</h3>
        <pre className="mt-3 whitespace-pre-wrap font-mono text-xs text-[#6B7280]">
          {current.output}
        </pre>
      </MapistryCard>

      {current.showRunHint && (
        <div className="mt-6 space-y-2 text-sm text-[#6B7280]">
          <p>
            Run this in your terminal:{" "}
            <code className="rounded bg-[#F7F8F5] px-2 py-0.5 font-mono text-[#1A1A1A]">
              node srm-pipeline.js
            </code>
          </p>
          <p>
            View results:{" "}
            <Link href="/mapistry/dashboard" className="font-semibold text-[#2D7A4F] hover:underline">
              /mapistry/dashboard
            </Link>
          </p>
        </div>
      )}

      <p className="mt-6">
        <Link
          href="/mapistry/dashboard"
          className="text-sm font-semibold text-[#2D7A4F] hover:underline"
        >
          View results in Dashboard →
        </Link>
      </p>
    </main>
  );
}
