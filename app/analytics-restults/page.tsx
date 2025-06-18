"use client";

import DashboardLayout from "@/components/DashboardLayout";
import React, { useEffect, useState } from "react";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {NextResponse} from "next/server";

type AnalyticsResult = {
    id: string;
    summary: string;
    createdAt: string;
    videoUrl: string;
    videoId: string;
    aiAnalysis: {
        comment_categories: Record<string, number>;
        engagement_metrics: Record<string, number>;
        key_topics: { topic: string; count: number }[];
        overall_analysis: {
            community_health: string;
            engagement_level: string;
            sentiment: string;
        };
        sentiment_distribution: Record<string, number>;
        recommendations: string[];
    };
};


const PAGE_SIZE = 10;

async function fetchAnalyticsResults(page: number, pageSize: number): Promise<{ results: AnalyticsResult[]; total: number }> {
    const res = await fetch(`/api/analytics-results?page=${page+1}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error('Failed to fetch analytics results');
    const data = await res.json();
    return { results: data.data, total: data.total };
}

const AnalyticsResultsPage: React.FC = () => {
    const [results, setResults] = useState<AnalyticsResult[]>([]);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedResult, setSelectedResult] = useState<AnalyticsResult | null>(null);


    useEffect(() => {
        setLoading(true);
        fetchAnalyticsResults(page, PAGE_SIZE).then(({ results, total }) => {
            setResults(results);
            setTotal(total);
            setLoading(false);
        });
    }, [page]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const Modal: React.FC<{ result: AnalyticsResult; onClose: () => void }> = ({ result, onClose }) => (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 1000,
            padding: 20
        }}>
            <div style={{
                background: "#ffffff", padding: 32, borderRadius: 16,
                maxWidth: 720, width: "100%", maxHeight: "90vh", overflowY: "auto",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)", position: "relative"
            }}>
                <button onClick={onClose} style={{
                    position: "absolute", top: 16, right: 16,
                    background: "#f2f2f2", border: "none", borderRadius: "50%",
                    width: 36, height: 36, fontSize: 20, fontWeight: "bold",
                    cursor: "pointer", color: "#333", transition: "background 0.2s"
                }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#e0e0e0")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#f2f2f2")}
                >×</button>

                <h2 style={{ marginTop: 0, fontSize: 24, fontWeight: 700 }}>🧠 Detailed Analysis</h2>

                <div style={{ marginBottom: 16 }}>
                    <p><strong>🎥 Video:</strong> <a href={result.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff", textDecoration: "none" }}>{result.videoId}</a></p>
                    <p><strong>📅 Date:</strong> {new Date(result.createdAt).toLocaleString()}</p>
                    <p><strong>😊 Sentiment:</strong> {result.aiAnalysis.overall_analysis.sentiment}</p>
                    <p><strong>💬 Community Health:</strong> {result.aiAnalysis.overall_analysis.community_health}</p>
                </div>

                <hr style={{ border: "1px solid #eee" }} />

                <Section title="📊 Sentiment Distribution" data={result.aiAnalysis.sentiment_distribution} />
                <Section title="🗂️ Comment Categories" data={result.aiAnalysis.comment_categories} />
                <Section title="📈 Engagement Metrics" data={result.aiAnalysis.engagement_metrics} />
                <Section title="🔑 Key Topics" dataArray={result.aiAnalysis.key_topics.map(t => `${t.topic}: ${t.count}`)} />
                <Section title="✅ Recommendations" dataArray={result.aiAnalysis.recommendations} />
            </div>
        </div>
    );

    const Section: React.FC<{ title: string; data?: Record<string, any>; dataArray?: string[] }> = ({ title, data, dataArray }) => (
        <div style={{ marginTop: 24 }}>
            <h4 style={{ fontSize: 18, marginBottom: 8, color: "#333" }}>{title}</h4>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
                {data
                    ? Object.entries(data).map(([k, v]) => <li key={k} style={{ marginBottom: 4 }}>{k}: <strong>{v}</strong></li>)
                    : dataArray?.map((item, i) => <li key={i} style={{ marginBottom: 4 }}>{item}</li>)
                }
            </ul>
        </div>
    );



    return (
        // <div style={{ display: "flex", minHeight: "100vh", background: "#f7f9fb" }}>
        //     {/* Sidebar */}
        //     <aside style={{
        //         width: 240,
        //         background: "linear-gradient(135deg, #4f8cff 0%, #3358e0 100%)",
        //         color: "#fff",
        //         display: "flex",
        //         flexDirection: "column",
        //         alignItems: "center",
        //         padding: "32px 0",
        //         boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
        //     }}>
        //         <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 40, letterSpacing: 1 }}>
        //             <span style={{ color: "#fff", letterSpacing: 2 }}>YT<span style={{ color: "#ffd700" }}>Summarize</span></span>
        //         </div>
        //         <nav style={{ width: "100%" }}>
        //             <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        //                 <li style={{ padding: "16px 32px", background: "rgba(255,255,255,0.08)", borderRadius: 8, margin: "0 16px 16px 16px", fontWeight: 500 }}>
        //                     <span role="img" aria-label="results" style={{ marginRight: 8 }}>📊</span> Analytics Results
        //                 </li>
        //                 <li style={{ padding: "12px 32px", margin: "0 16px", color: "#c7d2fe", cursor: "pointer" }}>
        //                     <span role="img" aria-label="dashboard" style={{ marginRight: 8 }}>🏠</span> Dashboard
        //                 </li>
        //                 <li style={{ padding: "12px 32px", margin: "0 16px", color: "#c7d2fe", cursor: "pointer" }}>
        //                     <span role="img" aria-label="pricing" style={{ marginRight: 8 }}>💳</span> Pricing
        //                 </li>
        //                 <li style={{ padding: "12px 32px", margin: "0 16px", color: "#c7d2fe", cursor: "pointer" }}>
        //                     <span role="img" aria-label="signout" style={{ marginRight: 8 }}>🚪</span> Sign Out
        //                 </li>
        //             </ul>
        //         </nav>
        //         <div style={{ flex: 1 }} />
        //         <div style={{ fontSize: 12, color: "#b3c0e0", marginBottom: 8 }}>© {new Date().getFullYear()} YT Summarize</div>
        //     </aside>
<DashboardLayout>
            {/* Main Content */}
            <main style={{ flex: 1, padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "100%", maxWidth: 700, background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(80,120,200,0.08)", padding: 32 }}>
                    <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#3358e0", letterSpacing: 1 }}>Previous Analytics Results</h2>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading...</div>
                    ) : results.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 40, color: "#bbb" }}>No analytics results found.</div>
                    ) : (
                        <ul style={{listStyle: "none", padding: 0, margin: 0}}>
                            {results.map((result) => {
                                const thumbnailUrl = `https://img.youtube.com/vi/${result.videoId}/0.jpg`;
                                return (
                                    <li key={result.id} onClick={() => setSelectedResult(result)} style={{
                                        display: "flex",
                                        gap: 20,
                                        background: "#fff",
                                        borderRadius: 12,
                                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                        padding: 16,
                                        cursor: "pointer",
                                        marginBottom: 20,
                                        transition: "transform 0.2s ease-in-out",
                                    }}>
                                        <img src={thumbnailUrl} alt="Thumbnail"
                                             style={{width: 480, height: 360, borderRadius: 8, objectFit: "cover"}}/>
                                        <div style={{flex: 1}}>
                                            {/*<h3 style={{margin: 0, color: "#223366"}}>{result.videoId}</h3>*/}
                                            {/*<p style={{*/}
                                            {/*    fontSize: 13,*/}
                                            {/*    color: "#6b7a99"*/}
                                            {/*}}>{new Date(result.createdAt).toLocaleString()}</p>*/}
                                            {/*<p style={{margin: "8px 0", fontSize: 14}}>*/}
                                            {/*    <strong>Sentiment:</strong> {result.aiAnalysis.overall_analysis.sentiment} |&nbsp;*/}
                                            {/*    <strong>Praise:</strong> {result.aiAnalysis.comment_categories.praise || 0} |&nbsp;*/}
                                            {/*    <strong>Complaints:</strong> {result.aiAnalysis.comment_categories.complaints || 0}*/}
                                            {/*</p>*/}
                                            <p style={{fontSize: 12, color: "#888"}}>Click to view full analysis →</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                    )}
                    <div style={{marginTop: 32, display: "flex", justifyContent: "center", gap: 16}}>
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            style={{
                                padding: "10px 20px",
                                borderRadius: 8,
                                border: "none",
                                background: page === 0 ? "#e3eafe" : "#4f8cff",
                                color: page === 0 ? "#b3c0e0" : "#fff",
                                fontWeight: 600,
                                cursor: page === 0 ? "not-allowed" : "pointer",
                                transition: "background 0.2s",
                            }}
                        >
                            ← Previous
                        </button>
                        <span style={{alignSelf: "center", fontWeight: 500, color: "#3358e0"}}>
                            Page {page + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            style={{
                                padding: "10px 20px",
                                borderRadius: 8,
                                border: "none",
                                background: page >= totalPages - 1 ? "#e3eafe" : "#4f8cff",
                                color: page >= totalPages - 1 ? "#b3c0e0" : "#fff",
                                fontWeight: 600,
                                cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                                transition: "background 0.2s",
                            }}
                        >
                            Next →
                        </button>
                    </div>
                    {selectedResult && (
                        <Modal result={selectedResult} onClose={() => setSelectedResult(null)} />
                    )}

                </div>
            </main>
</DashboardLayout>
    );
};

export default AnalyticsResultsPage;