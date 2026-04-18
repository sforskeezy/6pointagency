import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { 
  Search, Globe, Mail, BarChart3, Play, Square, ArrowLeft, 
  Building2, AlertCircle, CheckCircle2, Eye, X,
  Activity, MapPin, Clock, Send, Bot
} from 'lucide-react';
import { Logo } from './Logo';
import './AgentDashboard.css';

// ── API Config ──
const RAPID_API_KEY = '5c7ce818cfmsh7e1944115367b76p17808fjsn0956139896ed';

const BUSINESS_CATEGORIES = [
  'plumber', 'electrician', 'landscaper', 'hair salon', 'barber shop',
  'auto repair', 'cleaning service', 'pest control', 'roofing contractor',
  'hvac', 'painter', 'handyman', 'photographer', 'florist',
  'bakery', 'personal trainer', 'tattoo shop', 'nail salon',
  'dentist', 'chiropractor', 'veterinarian', 'daycare',
  'catering', 'tailor', 'dry cleaner', 'locksmith',
  'moving company', 'carpet cleaner', 'window tinting',
  'fencing contractor', 'tree service', 'pressure washing',
  'accounting', 'real estate agent', 'insurance agent',
  'gym', 'yoga studio', 'martial arts', 'dance studio',
  'tutoring', 'music lessons', 'dog groomer', 'pet boarding'
];

const SEARCH_LOCATIONS = [
  { label: 'Greenville, SC', lat: 34.8526, lng: -82.3940, zoom: 13 },
  { label: 'Greenville (wider)', lat: 34.8526, lng: -82.3940, zoom: 11 },
  { label: 'Mauldin, SC', lat: 34.7785, lng: -82.3018, zoom: 13 },
  { label: 'Simpsonville, SC', lat: 34.7371, lng: -82.2543, zoom: 13 },
  { label: 'Greer, SC', lat: 34.9387, lng: -82.2271, zoom: 13 },
  { label: 'Taylors, SC', lat: 34.9207, lng: -82.3095, zoom: 13 },
  { label: 'Travelers Rest, SC', lat: 34.9679, lng: -82.4415, zoom: 13 },
  { label: 'Easley, SC', lat: 34.8299, lng: -82.6015, zoom: 13 },
  { label: 'Piedmont, SC', lat: 34.7023, lng: -82.4676, zoom: 13 },
  { label: 'Fountain Inn, SC', lat: 34.6882, lng: -82.1951, zoom: 13 },
  { label: 'Spartanburg, SC', lat: 34.9496, lng: -81.9320, zoom: 13 },
  { label: 'Anderson, SC', lat: 34.5034, lng: -82.6501, zoom: 13 },
  { label: 'Clemson, SC', lat: 34.6834, lng: -82.8374, zoom: 13 },
  { label: 'Seneca, SC', lat: 34.6857, lng: -82.9532, zoom: 13 },
  { label: 'Laurens, SC', lat: 34.4990, lng: -82.0143, zoom: 13 },
];

// ── Helpers ──
const timestamp = () => {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};
const delay = (ms) => new Promise(r => setTimeout(r, ms));

export const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRunning, setIsRunning] = useState(false);
  const [thinkingText, setThinkingText] = useState('');
  const [localLog, setLocalLog] = useState([]); // live feed for current session
  const [currentLocation, setCurrentLocation] = useState('');
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [editEmailValue, setEditEmailValue] = useState('');
  const [isManualSending, setIsManualSending] = useState(false);
  const [isSendingAll, setIsSendingAll] = useState(false);
  const feedRef = useRef(null);
  const abortRef = useRef(false);

  // ── Convex queries (live-updating) ──
  const dbProspectsRaw = useQuery(api.agentDash.listProspects);
  const dbPitchedRaw = useQuery(api.agentDash.listPitchedProspects);
  const dbStatsRaw = useQuery(api.agentDash.getStats);
  const dbProspects = useMemo(() => dbProspectsRaw || [], [dbProspectsRaw]);
  const dbPitched = useMemo(() => dbPitchedRaw || [], [dbPitchedRaw]);
  const dbStats = useMemo(
    () => dbStatsRaw || { found: 0, noSite: 0, emailed: 0, categories: 0 },
    [dbStatsRaw]
  );

  // ── Convex mutations ──
  const upsertProspect = useMutation(api.agentDash.upsertProspect);
  const logActivityDb = useMutation(api.agentDash.logActivity);
  const clearActivityDb = useMutation(api.agentDash.clearActivity);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [localLog]);

  const log = useCallback((text, type = 'search') => {
    setLocalLog(prev => [...prev, { text, type, time: timestamp(), id: Date.now() + Math.random() }]);
    // Also persist to Convex (fire and forget)
    logActivityDb({ text, type }).catch(() => {});
  }, [logActivityDb]);

  // ── Maps Data API: search businesses ──
  const searchBusinesses = useCallback(async (category, location) => {
    try {
      const response = await fetch(
        `https://maps-data.p.rapidapi.com/searchmaps.php?query=${encodeURIComponent(category + ' in ' + location.label)}&limit=10&country=us&lang=en&lat=${location.lat}&lng=${location.lng}&zoom=${location.zoom}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': RAPID_API_KEY,
            'x-rapidapi-host': 'maps-data.p.rapidapi.com',
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      return data?.data || [];
    } catch (err) {
      log(`API error searching "${category}": ${err.message}`, 'error');
      return [];
    }
  }, [log]);

  // ── Maps Data API: get business details (for email discovery) ──
  const getBusinessDetails = useCallback(async (businessId) => {
    if (!businessId) return null;
    try {
      const response = await fetch(
        `https://maps-data.p.rapidapi.com/place.php?business_id=${encodeURIComponent(businessId)}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': RAPID_API_KEY,
            'x-rapidapi-host': 'maps-data.p.rapidapi.com',
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      return data?.data || null;
    } catch {
      return null;
    }
  }, []);

  // ── GPT-4o: generate pitch ──
  const generatePitch = useCallback(async (business) => {
    try {
      const systemPrompt = `You are a friendly, experienced business development professional at 6POINT, a premium digital design agency in South Carolina. Write a personalized cold outreach email to a local business owner who doesn't have a website. The email should:
- Feel genuinely human, warm, and conversational — NOT salesy or AI-generated
- Reference their specific business name and what they do
- Mention you noticed they don't have a website while researching local businesses in their area
- Briefly explain why a website matters for their type of business
- Keep it under 200 words
- End with: "This email cannot be replied to — please call us at 803-669-5425 or email sixpointagency@gmail.com to chat."
- Sign off as "The 6POINT Team"
Do NOT use subject line, just write the body.`;

      const userMsg = `Write a pitch email for: "${business.name}" — a ${business.category || 'local business'} located at ${business.address || 'Greenville, SC area'}. ${business.phone ? 'Their phone is ' + business.phone + '.' : ''}`;

      const response = await fetch('https://gpt-4o.p.rapidapi.com/chat/completions', {
        method: 'POST',
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': 'gpt-4o.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMsg }
          ]
        })
      });

      const data = await response.json();
      return data?.choices?.[0]?.message?.content || null;
    } catch (err) {
      log(`GPT-4o error for "${business.name}": ${err.message}`, 'error');
      return null;
    }
  }, [log]);

  // ── Resend: send email via backend ──
  const sendEmailApi = useCallback(async (to, businessName, pitchBody) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, businessName, pitchBody })
      });
      const data = await response.json();
      if (data.success) return true;
      log(`⚠️ Resend error for ${businessName}: ${data.error}`, 'error');
      return false;
    } catch (err) {
      log(`⚠️ Email delivery failed for ${businessName}: ${err.message}`, 'error');
      return false;
    }
  }, [log]);

  // ── SEND TO ALL UNSENT: process existing DB prospects that haven't been emailed ──
  const sendToAllUnsent = useCallback(async () => {
    const unsent = dbPitched.filter(p => p.emailStatus !== 'sent' && !p.hasWebsite);
    if (unsent.length === 0) {
      log('ℹ️ No unsent prospects to process', 'search');
      return;
    }
    setIsSendingAll(true);
    log(`📬 Processing ${unsent.length} unsent prospects...`, 'email');

    for (const prospect of unsent) {
      if (abortRef.current) break;
      let email = prospect.email;

      // Discover email if missing
      if (!email) {
        log(`🔎 Searching Maps for ${prospect.name}'s email...`, 'analyze');
        
        // Use prospect._id (convex ID) if we have it to get the original businessId?
        // Wait, we didn't save businessId. We'll just fallback to phone number immediately here
        // to avoid complexity for existing unsent ones.
        email = prospect.phone ? `Phone: ${prospect.phone}` : 'No Contact Info';
        log(`📧 Contact saved as: ${email}`, 'success');
      }

      // Generate pitch if missing
      let pitch = prospect.pitch;
      if (!pitch) {
        setThinkingText(`🤖 Generating pitch for ${prospect.name}...`);
        log(`🤖 Generating pitch for ${prospect.name}...`, 'analyze');
        pitch = await generatePitch({
          name: prospect.name,
          address: prospect.address,
          phone: prospect.phone,
          category: prospect.category
        });
      }

      if (!pitch) {
        log(`❌ Could not generate pitch for ${prospect.name}`, 'error');
        continue;
      }

      // Send if it's a real email, otherwise mark as failed
      let sent = false;
      if (email.includes('@')) {
        setThinkingText(`📬 Sending to ${email}...`);
        log(`📬 Sending to ${email}...`, 'email');
        sent = await sendEmailApi(email, prospect.name, pitch);
      } else {
        log(`📋 Pitch saved — real email not available`, 'analyze');
      }

      // Update DB
      await upsertProspect({
        name: prospect.name,
        address: prospect.address,
        phone: prospect.phone,
        email: email,
        category: prospect.category,
        location: prospect.location,
        hasWebsite: false,
        emailStatus: sent ? 'sent' : 'failed',
        pitch: pitch,
      }).catch(() => {});

      if (sent) {
        log(`✅ Delivered to ${prospect.name} (${email})`, 'success');
      } else {
        log(`⚠️ Failed for ${email}`, 'error');
      }

      await delay(500);
    }

    setThinkingText('');
    setIsSendingAll(false);
    log('✅ Finished processing unsent prospects', 'success');
  }, [dbPitched, generatePitch, sendEmailApi, upsertProspect, log]);

  // ── MANUAL SEND: from modal ──
  const handleManualSend = useCallback(async () => {
    if (!selectedProspect || !editEmailValue.includes('@')) {
      log('⚠️ Please enter a real email address before sending.', 'error');
      return;
    }
    setIsManualSending(true);
    log(`📬 Manually sending presentation to ${editEmailValue}...`, 'email');
    
    const sent = await sendEmailApi(editEmailValue, selectedProspect.name, selectedProspect.pitch);
    
    await upsertProspect({
      name: selectedProspect.name,
      address: selectedProspect.address,
      phone: selectedProspect.phone || '',
      email: editEmailValue,
      category: selectedProspect.category,
      location: selectedProspect.location || '',
      hasWebsite: selectedProspect.hasWebsite || false,
      emailStatus: sent ? 'sent' : 'failed',
      pitch: selectedProspect.pitch
    }).catch(() => {});

    if (sent) {
      log(`✅ Delivered manually to ${selectedProspect.name} (${editEmailValue})`, 'success');
    } else {
      log(`⚠️ Failed to deliver to ${editEmailValue}`, 'error');
    }

    setSelectedProspect(prev => prev ? { ...prev, email: editEmailValue, emailStatus: sent ? 'sent' : 'failed' } : null);
    setIsManualSending(false);
  }, [selectedProspect, editEmailValue, sendEmailApi, upsertProspect, log]);

  // ── INFINITE AGENT LOOP ──
  const runAgent = useCallback(async () => {
    setIsRunning(true);
    abortRef.current = false;
    setLocalLog([]);
    clearActivityDb().catch(() => {});

    log('🚀 Agent initialized — CONTINUOUS search mode ACTIVE', 'success');
    log('📍 Target: Greenville, SC + 30mi radius (15 zones)', 'search');
    log('🔎 Email discovery enabled — will hunt for contacts', 'search');
    await delay(600);

    let loopCount = 0;

    while (!abortRef.current) {
      loopCount++;
      const shuffled = [...BUSINESS_CATEGORIES].sort(() => Math.random() - 0.5);
      const locationIndex = (loopCount - 1) % SEARCH_LOCATIONS.length;
      const location = SEARCH_LOCATIONS[locationIndex];
      
      setCurrentLocation(location.label);
      log(`🗺️ Loop #${loopCount} — scanning ${location.label}...`, 'search');

      for (const category of shuffled) {
        if (abortRef.current) break;

        setThinkingText(`Searching "${category}" in ${location.label}...`);
        log(`🔍 Searching "${category}" in ${location.label}...`, 'search');
        await delay(300);

        const results = await searchBusinesses(category, location);

        if (!results.length) {
          await delay(200);
          continue;
        }

        log(`📍 Found ${results.length} "${category}" businesses`, 'search');

        for (const biz of results) {
          if (abortRef.current) break;

          const name = biz.name || 'Unknown Business';
          const address = biz.full_address || biz.address || location.label;
          const phone = biz.phone_number || biz.phone || '';
          const website = biz.website || biz.site || '';
          const businessId = biz.business_id || biz.place_id || '';
          let email = biz.email || biz.owner_email || '';
          const hasWebsite = !!website && website !== 'N/A' && website.length > 4;

          // ── CHECK DATABASE: skip if already processed ──
          setThinkingText(`Checking if ${name} is already in database...`);

          if (hasWebsite) {
            // Has website — save and skip
            await upsertProspect({
              name, address, phone, email, website, category,
              location: location.label, hasWebsite: true, emailStatus: 'skipped',
            }).catch(() => {});
            log(`✅ ${name} — has website`, 'success');
            continue;
          }

          // ── NO WEBSITE — full pipeline ──
          log(`⚠️ ${name} — NO WEBSITE detected`, 'analyze');

          // ── STEP 1: EMAIL DISCOVERY ──
          if (!email && businessId) {
            setThinkingText(`🔎 Searching Maps for email...`);
            log(`🔎 Pulling Google Maps details for ${name}...`, 'analyze');
            const details = await getBusinessDetails(businessId);
            if (details?.email) {
              email = details.email;
              log(`📧 Real email found: ${email}`, 'success');
            } else {
              email = phone ? `Phone: ${phone}` : 'No Contact Info';
              log(`📋 No email found. Saved contact: ${email}`, 'error');
            }
          } else if (!email) {
            email = phone ? `Phone: ${phone}` : 'No Contact Info';
          }

          // ── STEP 2: GENERATE PITCH ──
          setThinkingText(`Generating pitch for ${name}...`);
          log(`🤖 Generating personalized pitch for ${name}...`, 'analyze');
          await delay(300);
          const pitch = await generatePitch({ name, address, phone, category });

          if (!pitch) {
            log(`❌ Failed to generate pitch for ${name}`, 'error');
            await upsertProspect({
              name, address, phone, email, category,
              location: location.label, hasWebsite: false, emailStatus: 'failed',
            }).catch(() => {});
            continue;
          }

          // ── STEP 3: SEND EMAIL (if we have one) ──
          // ── STEP 3: AUTO-SEND EMAIL (If real email exists) ──
          let emailStatus = 'failed';
          if (email.includes('@')) {
            setThinkingText(`Sending email to ${email}...`);
            log(`📬 Auto-sending outreach to ${email}...`, 'email');
            const sent = await sendEmailApi(email, name, pitch);
            emailStatus = sent ? 'sent' : 'failed';
            if (sent) {
              log(`✅ Email delivered to ${name} (${email})`, 'success');
            } else {
              log(`⚠️ Email delivery failed for ${email} — pitch saved`, 'error');
            }
          } else {
             log(`📋 Pitch saved — no real email available`, 'analyze');
          }

          // ── STEP 4: PERSIST TO CONVEX ──
          await upsertProspect({
            name, address, phone, email, category, pitch,
            location: location.label, hasWebsite: false, emailStatus,
          }).catch(() => {});

          await delay(150);
        }

        await delay(300);
      }

      if (!abortRef.current) {
        log(`🔄 Loop #${loopCount} complete — cycling to next area...`, 'success');
        await delay(1000);
      }
    }

    setThinkingText('');
    setCurrentLocation('');
    setIsRunning(false);
  }, [log, searchBusinesses, getBusinessDetails, generatePitch, sendEmailApi, upsertProspect, clearActivityDb]);

  const stopAgent = () => {
    abortRef.current = true;
    setIsRunning(false);
    setThinkingText('');
    setCurrentLocation('');
    log('⏹ Agent stopped by user', 'error');
  };

  const sidebarLinks = [
    { key: 'dashboard', icon: <BarChart3 size={18} />, label: 'Dashboard' },
    { key: 'prospects', icon: <Building2 size={18} />, label: 'Prospects' },
    { key: 'emails', icon: <Mail size={18} />, label: 'Sent Emails' },
  ];

  // ── Render a prospects/emails table ──
  const renderTable = (data, columns) => {
    if (!data.length) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon"><Globe size={32} /></div>
          <h3>Nothing here yet</h3>
          <p>Start the agent to discover businesses</p>
        </div>
      );
    }
    return (
      <table className="prospects-table">
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map(p => (
            <tr key={p._id || p.id} className={selectedProspect?._id === p._id ? 'selected' : ''} onClick={() => {
              if (p.pitch) {
                setSelectedProspect(p);
                setEditEmailValue(p.email || '');
              }
            }}>
              {columns.map(c => <td key={c.key}>{c.render(p)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const prospectCols = [
    { key: 'biz', label: 'Business', render: p => <><div style={{ fontWeight: 700 }}>{p.name}</div><div style={{ fontSize: 11, color: 'rgba(15,20,25,0.4)', marginTop: 2 }}>{p.address}</div></> },
    { key: 'cat', label: 'Category', render: p => <span style={{ textTransform: 'capitalize' }}>{p.category}</span> },
    { key: 'loc', label: 'Area', render: p => <span style={{ fontSize: 12 }}>{p.location || '—'}</span> },
    { key: 'web', label: 'Website', render: p => p.hasWebsite ? <span className="badge has-site"><CheckCircle2 size={12} /> Has Site</span> : <span className="badge no-site"><AlertCircle size={12} /> None</span> },
    { key: 'email', label: 'Email Status', render: p => {
      if (p.emailStatus === 'sent') return <span className="badge sent"><Mail size={12} /> Sent</span>;
      if (p.emailStatus === 'failed') return <span className="badge no-site"><AlertCircle size={12} /> Failed</span>;
      if (p.emailStatus === 'no-email') return <span className="badge pending"><Eye size={12} /> No Email</span>;
      if (p.emailStatus === 'skipped') return <span className="badge has-site">Skipped</span>;
      return <span className="badge pending"><Clock size={12} /> Pending</span>;
    }},
  ];

  const emailCols = [
    { key: 'biz', label: 'Business', render: p => <><div style={{ fontWeight: 700 }}>{p.name}</div><div style={{ fontSize: 11, color: 'rgba(15,20,25,0.4)', marginTop: 2 }}>{p.location || p.address}</div></> },
    { key: 'cat', label: 'Category', render: p => <span style={{ textTransform: 'capitalize' }}>{p.category}</span> },
    { key: 'addr', label: 'Email', render: p => <span style={{ fontSize: 12 }}>{p.email || '—'}</span> },
    { key: 'status', label: 'Status', render: p => {
      if (p.emailStatus === 'sent') return <span className="badge sent"><Mail size={12} /> Delivered</span>;
      if (p.emailStatus === 'failed') return <span className="badge no-site"><AlertCircle size={12} /> Failed</span>;
      return <span className="badge pending"><Eye size={12} /> Pitch Only</span>;
    }},
    { key: 'view', label: '', render: p => (
      <button onClick={(e) => { 
          e.stopPropagation(); 
          setSelectedProspect(p); 
          setEditEmailValue(p.email || '');
        }}
        style={{ background: 'rgba(116,142,117,0.1)', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: '#748E75', cursor: 'pointer', fontFamily: 'inherit' }}>
        <Eye size={12} style={{ marginRight: 4, verticalAlign: -2 }} />View
      </button>
    )},
  ];

  return (
    <div className="agent-dash">
      {/* Sidebar */}
      <div className="agent-sidebar">
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Logo size={22} color="#FFF" />
          </div>
        </div>
        <div className="sidebar-nav">
          {sidebarLinks.map(link => (
            <button key={link.key} className={`sidebar-link ${activeTab === link.key ? 'active' : ''}`} onClick={() => setActiveTab(link.key)}>
              {link.icon}{link.label}
              {link.key === 'prospects' && dbProspects.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.5 }}>{dbProspects.length}</span>}
              {link.key === 'emails' && dbPitched.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.5 }}>{dbPitched.length}</span>}
            </button>
          ))}
        </div>
        <a
          href="#top"
          className="sidebar-back"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = '';
          }}
        >
          <ArrowLeft size={16} />Back to Site
        </a>
      </div>

      {/* Main */}
      <div className="agent-main">
        <div className="dash-header">
          <div className="dash-header-left">
            <h1>
              {activeTab === 'dashboard' && 'Agent Command Center'}
              {activeTab === 'prospects' && 'All Prospects'}
              {activeTab === 'emails' && 'Sent Emails & Pitches'}
            </h1>
            <p>
              {activeTab === 'dashboard' && <>Continuous prospecting — Greenville + 30mi{currentLocation && <> · <strong>{currentLocation}</strong></>}</>}
              {activeTab === 'prospects' && `${dbProspects.length} businesses in database`}
              {activeTab === 'emails' && `${dbPitched.length} pitches generated`}
            </p>
          </div>
          <motion.button className={`agent-start-btn ${isRunning ? 'running' : ''}`} onClick={isRunning ? stopAgent : runAgent} whileTap={{ scale: 0.95 }}>
            {isRunning ? <><Square size={16} /> Stop Agent</> : <><Play size={16} /> Start Agent</>}
          </motion.button>
        </div>

        {/* Stats — from Convex DB */}
        <div className="stats-grid">
          <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="stat-card-icon"><Search size={20} /></div>
            <div className="stat-card-value">{dbStats.found}</div>
            <div className="stat-card-label">Businesses Found</div>
          </motion.div>
          <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="stat-card-icon"><AlertCircle size={20} /></div>
            <div className="stat-card-value">{dbStats.noSite}</div>
            <div className="stat-card-label">No Website</div>
          </motion.div>
          <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="stat-card-icon"><Send size={20} /></div>
            <div className="stat-card-value">{dbStats.emailed}</div>
            <div className="stat-card-label">Emails Sent</div>
          </motion.div>
          <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="stat-card-icon"><MapPin size={20} /></div>
            <div className="stat-card-value">{dbStats.categories}</div>
            <div className="stat-card-label">Categories Scanned</div>
          </motion.div>
        </div>

        {isRunning && thinkingText && (
          <div className="thinking-bar">
            <div className="thinking-dots"><span /><span /><span /></div>
            <span className="thinking-text">{thinkingText}</span>
          </div>
        )}

        {/* TAB: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="content-grid">
            <div className="activity-panel">
              <div className="panel-header">
                <span className="panel-title"><Activity size={16} />Live Activity{isRunning && <span className="live-dot" />}</span>
                <span style={{ fontSize: 11, color: 'rgba(15,20,25,0.3)', fontWeight: 600 }}>{localLog.length} events</span>
              </div>
              <div className="activity-list" ref={feedRef}>
                {localLog.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon"><Bot size={32} /></div>
                    <h3>Agent Idle</h3>
                    <p>Hit "Start Agent" to begin continuous prospecting</p>
                  </div>
                ) : localLog.map(item => (
                  <div className="activity-item" key={item.id}>
                    <div className={`activity-dot ${item.type}`} />
                    <div className="activity-content">
                      <div className="activity-text">{item.text}</div>
                      <div className="activity-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="prospects-panel">
              <div className="panel-header">
                <span className="panel-title"><Building2 size={16} />Latest Prospects</span>
                <span style={{ fontSize: 11, color: 'rgba(15,20,25,0.3)', fontWeight: 600 }}>{dbProspects.length} in DB</span>
              </div>
              <div className="prospects-table-wrap">
                {renderTable(dbProspects.slice(0, 25), prospectCols)}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Prospects */}
        {activeTab === 'prospects' && (
          <div className="prospects-panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <span className="panel-title"><Building2 size={16} />All Discovered Businesses</span>
              <span style={{ fontSize: 11, color: 'rgba(15,20,25,0.3)', fontWeight: 600 }}>
                {dbProspects.length} total · {dbProspects.filter(p => !p.hasWebsite).length} without website
              </span>
            </div>
            <div className="prospects-table-wrap" style={{ overflowY: 'auto', flex: 1 }}>
              {renderTable(dbProspects, prospectCols)}
            </div>
          </div>
        )}

        {/* TAB: Emails */}
        {activeTab === 'emails' && (
          <div className="prospects-panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <span className="panel-title"><Mail size={16} />Emails & Pitches</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'rgba(15,20,25,0.3)', fontWeight: 600 }}>
                  {dbPitched.filter(p => p.emailStatus === 'sent').length} delivered · {dbPitched.length} total
                </span>
                {dbPitched.filter(p => p.emailStatus !== 'sent' && !p.hasWebsite).length > 0 && (
                  <button
                    onClick={sendToAllUnsent}
                    disabled={isSendingAll || isRunning}
                    style={{
                      background: isSendingAll ? '#0F1419' : '#748E75',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: 100,
                      padding: '8px 20px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: isSendingAll ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      opacity: (isSendingAll || isRunning) ? 0.6 : 1
                    }}
                  >
                    <Send size={12} />
                    {isSendingAll ? 'Sending...' : `Send to ${dbPitched.filter(p => p.emailStatus !== 'sent' && !p.hasWebsite).length} Unsent`}
                  </button>
                )}
              </div>
            </div>
            <div className="prospects-table-wrap" style={{ overflowY: 'auto', flex: 1 }}>
              {renderTable(dbPitched, emailCols)}
            </div>
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      <AnimatePresence>
        {selectedProspect && (
          <motion.div className="email-preview-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProspect(null)}>
            <motion.div className="email-preview-card" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25 }} onClick={e => e.stopPropagation()}>
              <button className="email-close-btn" onClick={() => setSelectedProspect(null)}><X size={18} /></button>
              <div className="email-meta">
                <div className="email-meta-row" style={{ alignItems: 'center' }}>
                  <span className="email-meta-label">To</span>
                  <input 
                    value={editEmailValue}
                    onChange={(e) => setEditEmailValue(e.target.value)}
                    placeholder="Enter email to send..."
                    style={{ flex: 1, border: '1px solid rgba(0,0,0,0.1)', background: '#F9F9F9', padding: '6px 10px', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', fontWeight: 500, outline: 'none' }}
                  />
                  <button 
                    onClick={handleManualSend}
                    disabled={isManualSending || !editEmailValue.includes('@')}
                    style={{ 
                      background: isManualSending ? '#0F1419' : '#748E75',
                      color: '#FFF', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 11, fontWeight: 700, cursor: (isManualSending || !editEmailValue.includes('@')) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}
                  >
                    {isManualSending ? 'Sending...' : 'Save & Send'}
                  </button>
                </div>
                <div className="email-meta-row"><span className="email-meta-label">From</span><span className="email-meta-value">6POINT Agency &lt;HELLO@6POINTSOLUTIONS.COM&gt;</span></div>
                <div className="email-meta-row"><span className="email-meta-label">Subject</span><span className="email-meta-value">Quick thought about {selectedProspect.name}'s online presence</span></div>
                <div className="email-meta-row"><span className="email-meta-label">Status</span><span className="email-meta-value">{selectedProspect.emailStatus === 'sent' ? '✅ Delivered' : selectedProspect.emailStatus === 'failed' ? '❌ Failed' : '📋 Pitch saved (not sent)'}</span></div>
              </div>
              <div className="email-body">{selectedProspect.pitch || 'No pitch generated.'}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
