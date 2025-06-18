"use client";

import DashboardLayout from "@/components/DashboardLayout";
import React, { useEffect, useState } from "react";

type AnalyticsResult = {
    id: string;
    summary: string;
    createdAt: string;
    // Add other fields as needed
};

const PAGE_SIZE = 10;

async function fetchAnalyticsResults(page: number, pageSize: number): Promise<{ results: AnalyticsResult[]; total: number }> {
    const res = await fetch(`/api/analytics-results?page=${page}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error('Failed to fetch analytics results');
    const data = await res.json();
    return { results: data.data, total: data.total };
}

const AnalyticsResultsPage: React.FC = () => {
    const [results, setResults] = useState<AnalyticsResult[]>([]);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchAnalyticsResults(page, PAGE_SIZE).then(({ results, total }) => {
            setResults(results);
            setTotal(total);
            setLoading(false);
        });
    }, [page]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

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
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {results.map((result) => (
                                <li key={result.id} style={{
                                    marginBottom: 20,
                                    borderRadius: 12,
                                    background: "linear-gradient(90deg, #e3eafe 0%, #f7f9fb 100%)",
                                    boxShadow: "0 2px 8px rgba(80,120,200,0.06)",
                                    padding: 20,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 6,
                                }}>
                                    <div style={{ fontWeight: 600, fontSize: 18, color: "#223366" }}>
                                        {result.summary}
                                    </div>
                                    <div style={{ fontSize: 13, color: "#6b7a99" }}>
                                        {new Date(result.createdAt).toLocaleString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 16 }}>
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
                        <span style={{ alignSelf: "center", fontWeight: 500, color: "#3358e0" }}>
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
                </div>
            </main>
        </DashboardLayout>
    );
};

export default AnalyticsResultsPage;