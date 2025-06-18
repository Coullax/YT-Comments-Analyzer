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
            backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
            <div style={{
                background: "#fff", padding: 24, borderRadius: 12,
                maxWidth: 700, width: "90%", maxHeight: "90vh", overflowY: "auto"
            }}>
                <button onClick={onClose} style={{
                    float: "right", background: "none", border: "none", fontSize: 24, cursor: "pointer"
                }}>×</button>

                <h2 style={{ marginTop: 0 }}>Detailed Analysis</h2>
                <p><strong>Video:</strong> <a href={result.videoUrl} target="_blank" rel="noopener noreferrer">{result.videoId}</a></p>
                <p><strong>Date:</strong> {new Date(result.createdAt).toLocaleString()}</p>
                <p><strong>Sentiment:</strong> {result.aiAnalysis.overall_analysis.sentiment}</p>
                <p><strong>Community Health:</strong> {result.aiAnalysis.overall_analysis.community_health}</p>

                <h4>Sentiment Distribution</h4>
                <ul>{Object.entries(result.aiAnalysis.sentiment_distribution).map(([k, v]) => <li key={k}>{k}: {v}</li>)}</ul>

                <h4>Comment Categories</h4>
                <ul>{Object.entries(result.aiAnalysis.comment_categories).map(([k, v]) => <li key={k}>{k}: {v}</li>)}</ul>

                <h4>Engagement Metrics</h4>
                <ul>{Object.entries(result.aiAnalysis.engagement_metrics).map(([k, v]) => <li key={k}>{k}: {v}</li>)}</ul>

                <h4>Key Topics</h4>
                <ul>{result.aiAnalysis.key_topics.map((t) => <li key={t.topic}>{t.topic}: {t.count}</li>)}</ul>

                <h4>Recommendations</h4>
                <ul>{result.aiAnalysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
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
                                            <h3 style={{margin: 0, color: "#223366"}}>{result.videoId}</h3>
                                            <p style={{
                                                fontSize: 13,
                                                color: "#6b7a99"
                                            }}>{new Date(result.createdAt).toLocaleString()}</p>
                                            <p style={{margin: "8px 0", fontSize: 14}}>
                                                <strong>Sentiment:</strong> {result.aiAnalysis.overall_analysis.sentiment} |&nbsp;
                                                <strong>Praise:</strong> {result.aiAnalysis.comment_categories.praise || 0} |&nbsp;
                                                <strong>Complaints:</strong> {result.aiAnalysis.comment_categories.complaints || 0}
                                            </p>
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