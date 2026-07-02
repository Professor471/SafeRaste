import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Clock, 
  MapPin, 
  Volume2, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Plus, 
  Sliders, 
  Trash2, 
  Activity, 
  Zap, 
  Eye, 
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import L from 'leaflet';

// Define initial coordinates for the map centered around Deccan Gymkhana in Pune, India
const MAP_CENTER = [18.5220, 73.8450];

const INITIAL_SEGMENTS = [
  {
    id: 'seg_jmroad',
    name: 'JM Road (Sambhaji Park side)',
    coordinates: [[18.52545,73.84762],[18.52573,73.84777],[18.52603,73.84723],[18.52621,73.84664],[18.52632,73.84586],[18.52638,73.84499],[18.52717,73.84499],[18.52716,73.8458],[18.52798,73.84578]],
    grid_cell: '18.526,-73.847'
  },
  {
    id: 'seg_fcroad',
    name: 'FC Road (near Goodluck Cafe)',
    coordinates: [[18.52147,73.8425],[18.52154,73.84336],[18.5214,73.84401],[18.52214,73.84424],[18.52244,73.84324],[18.52255,73.84251],[18.52261,73.84171],[18.52345,73.84184]],
    grid_cell: '18.522,-73.842'
  },
  {
    id: 'seg_apteroad',
    name: 'Apte Road (quiet stretch)',
    coordinates: [[18.52511,73.84402],[18.52518,73.84358],[18.52476,73.84349],[18.52489,73.84279],[18.52664,73.84314],[18.52676,73.84258]],
    grid_cell: '18.525,-73.843'
  }
];

const INITIAL_REPORTS = [
  {
    report_id: "rpt_jmroad_day_00",
    segment_id: "seg_jmroad",
    time_bucket: "day",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    signal: "Safe – high visibility, very crowded pedestrian traffic",
    severity: "low",
    note: "Very safe during the day, lots of students and shoppers.",
    left_light: "Grab a snack at the street vendors, very active area!"
  },
  {
    report_id: "rpt_jmroad_evening_01",
    segment_id: "seg_jmroad",
    time_bucket: "evening",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    signal: "felt fine; storefronts were open and the block was busy",
    severity: "low",
    note: "All shops are lit up, good foot traffic.",
    left_light: "Storefront lights illuminate the path nicely."
  },
  {
    report_id: "rpt_jmroad_night_02",
    segment_id: "seg_jmroad",
    time_bucket: "night",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    signal: "one dark block near the park; I felt uneasy and took an auto",
    severity: "high",
    note: "Uneasy near the park boundary as it gets very dark.",
    left_light: "Cross to the shop side of the street early, streetlights are better there."
  },
  {
    report_id: "rpt_fcroad_morning_03",
    segment_id: "seg_fcroad",
    time_bucket: "morning",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    signal: "student traffic, lots of people, and clear sight lines; felt safe",
    severity: "low",
    note: "Busy with college kids and morning walkers.",
    left_light: "Bustling morning energy here!"
  },
  {
    report_id: "rpt_fcroad_night_04",
    segment_id: "seg_fcroad",
    time_bucket: "night",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    signal: "busy cafes are well-lit; no direct issues noticed",
    severity: "low",
    note: "Restaurants are open late, very comforting presence.",
    left_light: "Walk near Goodluck Cafe, it's always active."
  },
  {
    report_id: "rpt_apteroad_night_05",
    segment_id: "seg_apteroad",
    time_bucket: "night",
    timestamp: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(), // 75 days ago (Stale!)
    signal: "completely dark, couple of bikes speeding through",
    severity: "high",
    note: "Pitch black, felt extremely unsafe walking back late.",
    left_light: "Avoid this path completely after sunset, walk around via FC Road instead."
  }
];

export default function App() {
  const [timeBucket, setTimeBucket] = useState('night'); // Default to night as it shows the most contrast
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [selectedSegment, setSelectedSegment] = useState(INITIAL_SEGMENTS[0]);
  const [isLogging, setIsLogging] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  
  // Logging Form State
  const [formSeverity, setFormSeverity] = useState('low');
  const [formSignal, setFormSignal] = useState('felt safe; well lit');
  const [formNote, setFormNote] = useState('');
  const [formLight, setFormLight] = useState('');
  const [isListening, setIsListening] = useState(false);

  const mapRef = useRef(null);
  const polylinesRef = useRef({});

  // Helper to add console logs (simulating Cognee lifecycle)
  const addLog = (op, code, data) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [
      { id: Date.now() + Math.random(), op, code, data, timestamp },
      ...prev
    ].slice(0, 15)); // Keep last 15
  };

  // Setup Map
  useEffect(() => {
    if (!mapRef.current) {
      // Initialize leaflet map
      mapRef.current = L.map('map-container', {
        zoomControl: false,
        attributionControl: false
      }).setView(MAP_CENTER, 15);

      // Premium CartoDB Dark Matter tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);
    }
  }, []);

  // Compute safety metrics with decay and score calculations
  const getSegmentScore = (segmentId, currentBucket, currentDaysElapsed) => {
    const segmentReports = reports.filter(r => r.segment_id === segmentId && r.time_bucket === currentBucket);
    
    let safeWeight = 0.0;
    let unsafeWeight = 0.0;
    const signals = [];
    const activeReports = [];

    segmentReports.forEach(report => {
      const reportDate = new Date(report.timestamp);
      // Calculate how old the report is in days, including fast-forwarded days
      const msDiff = Date.now() - reportDate.getTime();
      const actualAgeDays = msDiff / (1000 * 60 * 60 * 24);
      const simulatedAgeDays = actualAgeDays + currentDaysElapsed;

      // Temporal Decay calculation:
      let weight = 0.0;
      if (simulatedAgeDays <= 60) {
        weight = 1.0;
      } else if (simulatedAgeDays < 90) {
        weight = Math.max(0, 1.0 - ((simulatedAgeDays - 60) / 30.0));
      }
      
      // Calculate polarity
      const signalLower = report.signal.toLowerCase();
      const isUnsafe = signalLower.includes('unsafe') || signalLower.includes('uneasy') || 
                       signalLower.includes('dark') || signalLower.includes('poorly lit') ||
                       signalLower.includes('followed') || signalLower.includes('speeding');
      
      if (weight > 0) {
        activeReports.push({ ...report, simulatedAgeDays, weight });
        if (isUnsafe) {
          unsafeWeight += weight;
          if (!signals.includes('unsafe')) signals.push('unsafe');
        } else {
          safeWeight += weight;
          if (!signals.includes('safe')) signals.push('safe');
        }
      }
    });

    if (activeReports.length === 0) {
      return { status: 'neutral', confidence: 0, text: 'No recent reports', color: '#64748b', activeReports };
    }

    if (safeWeight > 0 && unsafeWeight > 0) {
      return { 
        status: 'mixed', 
        confidence: Math.round(Math.min(0.95, 0.45 + 0.1 * (safeWeight + unsafeWeight)) * 100), 
        text: 'Contradictory signals: Some users felt safe, others felt uneasy.', 
        color: '#f59e0b', // Amber/Yellow
        activeReports 
      };
    }

    const totalWeight = safeWeight + unsafeWeight;
    const confidence = Math.round(Math.min(0.95, 0.45 + (0.25 * totalWeight)) * 100);
    const status = safeWeight > 0 ? 'safe' : 'unsafe';
    const text = status === 'safe' 
      ? `Rated safe based on ${activeReports.length} consistent report(s).`
      : `Rated unsafe due to hazards reported recently.`;
    const color = status === 'safe' ? '#10b981' : '#ef4444'; // Emerald vs Crimson

    return { status, confidence, text, color, activeReports };
  };

  // Draw segment paths and register clicks
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous polylines
    Object.values(polylinesRef.current).forEach(polyline => {
      polyline.remove();
    });
    polylinesRef.current = {};

    INITIAL_SEGMENTS.forEach(seg => {
      const score = getSegmentScore(seg.id, timeBucket, daysElapsed);

      const polyline = L.polyline(seg.coordinates, {
        color: score.color,
        weight: selectedSegment?.id === seg.id ? 8 : 5,
        opacity: selectedSegment?.id === seg.id ? 1.0 : 0.7,
        lineCap: 'round',
        dashArray: score.status === 'mixed' ? '8, 8' : null
      }).addTo(mapRef.current);

      polyline.on('click', () => {
        setSelectedSegment(seg);
        
        // Trigger recall log simulation
        addLog(
          'recall()',
          `cognee.recall(query_text="${seg.name}", time_bucket="${timeBucket}")`,
          {
            street_segment: seg.name,
            time_bucket: timeBucket,
            status: score.status,
            confidence: `${score.confidence}%`,
            evidence: score.activeReports.map(r => r.signal)
          }
        );
      });

      polylinesRef.current[seg.id] = polyline;
    });
  }, [timeBucket, daysElapsed, reports, selectedSegment]);

  // Initial trigger for the log panel
  useEffect(() => {
    if (selectedSegment) {
      const score = getSegmentScore(selectedSegment.id, timeBucket, daysElapsed);
      addLog(
        'recall()',
        `cognee.recall(query_text="${selectedSegment.name}", time_bucket="${timeBucket}")`,
        {
          street_segment: selectedSegment.name,
          time_bucket: timeBucket,
          status: score.status,
          confidence: `${score.confidence}%`,
          evidence: score.activeReports.map(r => r.signal)
        }
      );
    }
  }, [selectedSegment]);

  // Handle Speech API voice input
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Speech recognition not supported, simulate it
      setIsListening(true);
      setTimeout(() => {
        const simulatedInputs = [
          "It felt safe. Streetlights are fully on and busy corner shops are open.",
          "Felt uneasy, there was a group of speeding scooters and poor lighting near the main gate.",
          "Extremely quiet night. Felt fine but walked fast. No problems noticed."
        ];
        const randomInput = simulatedInputs[Math.floor(Math.random() * simulatedInputs.length)];
        setFormSignal(randomInput);
        setFormSeverity(randomInput.toLowerCase().includes('uneasy') || randomInput.toLowerCase().includes('speeding') ? 'high' : 'low');
        setIsListening(false);
      }, 2000);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setFormSignal(speechToText);
      const textLower = speechToText.toLowerCase();
      if (textLower.includes('dark') || textLower.includes('uneasy') || textLower.includes('scared') || textLower.includes('unsafe') || textLower.includes('poorly lit')) {
        setFormSeverity('high');
      } else {
        setFormSeverity('low');
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Submit report to simulated Cognee graph memory
  const handleAddReport = (e) => {
    e.preventDefault();
    if (!selectedSegment) return;

    const newReport = {
      report_id: `rpt_${selectedSegment.id}_${Date.now()}`,
      segment_id: selectedSegment.id,
      time_bucket: timeBucket,
      timestamp: new Date().toISOString(),
      signal: formSignal,
      severity: formSeverity,
      note: formNote || formSignal,
      left_light: formLight || "Safe travels!"
    };

    const newReports = [...reports, newReport];
    setReports(newReports);
    setIsLogging(false);

    // Reset Form
    setFormNote('');
    setFormLight('');

    // Trigger Cognee remember() log
    addLog(
      'remember()',
      `cognee.remember(payload, dataset_name="saferaste_walks")`,
      {
        nodes: [
          { type: 'StreetSegment', name: selectedSegment.name, grid_cell: selectedSegment.grid_cell },
          { type: 'Report', report_id: newReport.report_id, signal: newReport.signal, severity: newReport.severity },
          { type: 'TimeOfDayBucket', value: timeBucket }
        ],
        edges: [
          { from: newReport.report_id, to: selectedSegment.name, type: 'about' },
          { from: newReport.report_id, to: timeBucket, type: 'occurred_at' }
        ]
      }
    );

    // Check if this triggers improve() confidence gain or contradiction warning
    setTimeout(() => {
      const segmentReports = newReports.filter(r => r.segment_id === selectedSegment.id && r.time_bucket === timeBucket);
      const isContradiction = segmentReports.some(r => r.severity === 'high') && segmentReports.some(r => r.severity === 'low');
      
      if (isContradiction) {
        addLog(
          'improve() [Contradiction]',
          `cognee.improve(dataset="saferaste_walks")`,
          {
            warning: "Contradictory route safety signals detected. Confidence metrics adjusted downwards.",
            segment: selectedSegment.name,
            time_bucket: timeBucket
          }
        );
      } else {
        addLog(
          'improve() [Agreement]',
          `cognee.improve(dataset="saferaste_walks")`,
          {
            status: "Multiple consistent signals received. Confidence score boosted.",
            segment: selectedSegment.name,
            time_bucket: timeBucket
          }
        );
      }
    }, 1200);
  };

  const handleSimulateDecay = (days) => {
    const nextDays = daysElapsed + days;
    setDaysElapsed(nextDays);
    
    addLog(
      'forget()',
      `cognee.forget(dataset="saferaste_walks", time_delta_days=${nextDays})`,
      {
        action: `Advanced virtual timeline by +${days} days (Total: ${nextDays} days)`,
        message: "Applying linear temporal decay. Reports >60 days lose weight; reports >90 days are forgotten."
      }
    );
  };

  const currentScore = selectedSegment ? getSegmentScore(selectedSegment.id, timeBucket, daysElapsed) : null;

  return (
    <div className="app-container">
      {/* Mobile/PWA Header */}
      <header className="app-header">
        <div className="logo-group">
          <Shield className="logo-icon" />
          <div>
            <h1>SafeRaste</h1>
            <p className="subtitle">Route Safety Memory Platform</p>
          </div>
        </div>
        <div className="status-pill">
          <Activity className="status-pulse" />
          <span>Memory Sync</span>
        </div>
      </header>

      {/* Main Grid: Responsive layout for mobile / desktop layout */}
      <main className="app-grid">
        
        {/* Map Panel */}
        <section className="card map-card">
          <div className="card-header flex-header">
            <span className="card-title"><MapPin size={16} /> Live Safety Heatmap</span>
            <span className="time-badge">{timeBucket.toUpperCase()} MODE</span>
          </div>
          <div id="map-container" className="map-view"></div>
          
          {/* Time Filter Overlay on Map */}
          <div className="map-overlay-controls">
            <div className="time-slider-container">
              <Clock size={16} className="text-muted" />
              <div className="time-selector">
                {['morning', 'afternoon', 'evening', 'night'].map(bucket => (
                  <button 
                    key={bucket}
                    className={`time-button ${timeBucket === bucket ? 'active' : ''}`}
                    onClick={() => {
                      setTimeBucket(bucket);
                      addLog('recall()', `cognee.recall(query_text="map_view", time_bucket="${bucket}")`, { action: `Refiltered active segments for ${bucket} bucket` });
                    }}
                  >
                    {bucket.charAt(0).toUpperCase() + bucket.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Info & Log Panel */}
        <section className="card info-card">
          {selectedSegment ? (
            <div className="segment-detail">
              <div className="segment-title-group">
                <span className="segment-label">SELECTED ROUTE SEGMENT</span>
                <h2>{selectedSegment.name}</h2>
                <div className="grid-badge">Grid Cell: {selectedSegment.grid_cell}</div>
              </div>

              {/* Dynamic Score Display */}
              <div className="score-widget" style={{ borderColor: currentScore.color + '33', background: `linear-gradient(135deg, #0d0e12 0%, ${currentScore.color}0a 100%)` }}>
                <div className="score-main">
                  <div className="score-circle" style={{ color: currentScore.color, boxShadow: `0 0 15px ${currentScore.color}22` }}>
                    <span className="score-val">{currentScore.confidence}%</span>
                    <span className="score-desc">Confidence</span>
                  </div>
                  <div className="score-meta">
                    <div className="score-badge" style={{ backgroundColor: currentScore.color + '1a', color: currentScore.color }}>
                      {currentScore.status.toUpperCase()}
                    </div>
                    <p className="score-text">{currentScore.text}</p>
                  </div>
                </div>
              </div>

              {/* Left Light: Human messages */}
              {currentScore.activeReports.length > 0 && (
                <div className="light-left-box">
                  <div className="light-title">
                    <Sparkles size={16} className="sparkle-icon" />
                    <span>Light Left For You</span>
                  </div>
                  <div className="light-carousel">
                    {currentScore.activeReports.map((report, idx) => (
                      <div key={report.report_id} className="light-slide">
                        <p className="light-text">"{report.left_light}"</p>
                        <span className="light-time">— anonymous, {report.simulatedAgeDays ? `${Math.round(report.simulatedAgeDays)}d ago` : 'just now'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="action-row">
                <button className="btn btn-primary" onClick={() => setIsLogging(true)}>
                  <Plus size={16} /> Log Route Safety
                </button>
                <div className="decay-quick-group">
                  <span className="decay-label">Simulate Decay:</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleSimulateDecay(30)}>+30 Days</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleSimulateDecay(90)}>+90 Days</button>
                </div>
              </div>

              {/* History / Active Reports List */}
              <div className="reports-section">
                <h3>Temporal Reports ({currentScore.activeReports.length} Active)</h3>
                {currentScore.activeReports.length === 0 ? (
                  <p className="text-muted text-center py-4">No active reports for this time-of-day bucket.</p>
                ) : (
                  <div className="reports-list">
                    {currentScore.activeReports.map(report => (
                      <div key={report.report_id} className="report-item">
                        <div className="report-item-header">
                          <span className={`badge ${report.severity === 'high' ? 'badge-danger' : 'badge-success'}`}>
                            {report.severity === 'high' ? 'High Concern' : 'Low Concern'}
                          </span>
                          <span className="report-time">
                            {Math.round(report.simulatedAgeDays)} days ago (Weight: {Math.round(report.weight * 100)}%)
                          </span>
                        </div>
                        <p className="report-signal">{report.signal}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="empty-state">
              <MapPin size={48} className="text-muted" />
              <p>Select a route segment on the map to view historical safety reports or log a new report.</p>
            </div>
          )}
        </section>

        {/* Memory Console Panel */}
        <section className="card console-card">
          <div className="card-header flex-header">
            <span className="card-title text-accent"><Activity size={16} /> Cognee Memory lifecycle Console</span>
            <button className="btn btn-link btn-sm" onClick={() => setConsoleLogs([])}>Clear</button>
          </div>
          <div className="console-view">
            {consoleLogs.length === 0 ? (
              <div className="console-empty">
                <p>Interactive graph database logs will appear here as you explore, log reports, or simulate decay.</p>
              </div>
            ) : (
              consoleLogs.map(log => (
                <div key={log.id} className="console-entry">
                  <div className="console-entry-header">
                    <span className="console-op">{log.op}</span>
                    <span className="console-time">{log.timestamp}</span>
                  </div>
                  <pre className="console-code"><code>{log.code}</code></pre>
                  <pre className="console-json"><code>{JSON.stringify(log.data, null, 2)}</code></pre>
                </div>
              ))
            )}
          </div>
        </section>

      </main>

      {/* Log Route Modal/Drawer Overlay */}
      {isLogging && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>Log Route Safety</h2>
              <button className="btn btn-close" onClick={() => setIsLogging(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddReport} className="log-form">
              <div className="form-group">
                <label className="form-label">Route Segment</label>
                <input type="text" className="form-input" value={selectedSegment?.name} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">Time of Day</label>
                <div className="time-badge-static">{timeBucket.toUpperCase()}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Severity Concern</label>
                <div className="segmented-control">
                  <button 
                    type="button" 
                    className={`segment-btn ${formSeverity === 'low' ? 'active' : ''}`}
                    onClick={() => setFormSeverity('low')}
                  >
                    Low Concern (Safe)
                  </button>
                  <button 
                    type="button" 
                    className={`segment-btn danger ${formSeverity === 'high' ? 'active' : ''}`}
                    onClick={() => setFormSeverity('high')}
                  >
                    High Concern (Uneasy)
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label flex-label">
                  <span>Safety Signal (Voice or Tag)</span>
                  <button 
                    type="button" 
                    className={`voice-btn ${isListening ? 'listening' : ''}`}
                    onClick={handleVoiceInput}
                  >
                    <Volume2 size={16} /> {isListening ? 'Listening...' : 'Simulate Voice'}
                  </button>
                </label>
                
                <input 
                  type="text" 
                  className="form-input" 
                  value={formSignal}
                  onChange={(e) => setFormSignal(e.target.value)}
                  placeholder="e.g. well lit, active storefronts, dark stretch..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Optional Details</label>
                <textarea 
                  className="form-input" 
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Describe your walk details..."
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Light Left for Next Woman (Tertiary flourish)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formLight}
                  onChange={(e) => setFormLight(e.target.value)}
                  placeholder="e.g. cross to library side early, guard is friendly"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsLogging(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Route Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
