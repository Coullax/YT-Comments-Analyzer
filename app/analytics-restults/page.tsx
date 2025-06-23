//
// "use client";
//
// import DashboardLayout from "@/components/DashboardLayout";
// import React, { useEffect, useState } from "react";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { NextResponse } from "next/server";
// import AnalysisResult from "@/components/AnalysisResult";
// import {
//     Box,
//     Modal,
//     ModalOverlay,
//     ModalContent,
//     ModalHeader,
//     ModalCloseButton,
//     ModalBody,
//     useDisclosure,
// } from '@chakra-ui/react';
//
// type Comment = {
//     text: string;
//     author: string;
//     likes: number;
//     sentiment: {
//         polarity: number;
//         subjectivity: number;
//     };
//     publishedAt?: string;
//     replies?: Comment[];
// };
//
// type Statistics = {
//     total_comments: number;
//     total_likes: number;
//     average_likes: number;
//     engagement_rates?: {
//         high_engagement_rate: number;
//         medium_engagement_rate: number;
//         low_engagement_rate: number;
//     };
//     sentiment_metrics?: {
//         average_sentiment: number;
//         positive_rate: number;
//         neutral_rate: number;
//         negative_rate: number;
//     };
// };
//
// type AIAnalysis = {
//     sentiment_distribution: {
//         positive: number;
//         neutral: number;
//         negative: number;
//     };
//     comment_categories: {
//         questions: number;
//         praise: number;
//         suggestions: number;
//         complaints: number;
//         general: number;
//     };
//     engagement_metrics: {
//         high_engagement: number;
//         medium_engagement: number;
//         low_engagement: number;
//     };
//     key_topics: Array<{
//         topic: string;
//         count: number;
//     }>;
//     overall_analysis: {
//         sentiment: string;
//         engagement_level: string;
//         community_health: string;
//     };
//     recommendations: string[];
// };
//
// type Visualizations = {
//     sentiment_scatter?: string;
//     engagement_distribution?: string;
//     wordcloud?: string;
//     sentiment_timeline?: string;
//     category_distribution?: string;
// };
//
// type AnalyticsResult = {
//     id: string;
//     summary: string;
//     createdAt: string;
//     videoUrl: string;
//     videoId: string;
//     comments: Comment[];
//     statistics: Statistics;
//     visualizations: Visualizations;
//     aiAnalysis: AIAnalysis;
// };
//
// const PAGE_SIZE = 10;
//
// async function fetchAnalyticsResults(page: number, pageSize: number): Promise<{ results: AnalyticsResult[]; total: number }> {
//     const res = await fetch(`/api/analytics-results?page=${page + 1}&pageSize=${pageSize}`);
//     if (!res.ok) throw new Error('Failed to fetch analytics results');
//     const data = await res.json();
//     return { results: data.data, total: data.total };
// }
//
// const AnalyticsResultsPage: React.FC = () => {
//     const [results, setResults] = useState<AnalyticsResult[]>([]);
//     const [page, setPage] = useState(0);
//     const [total, setTotal] = useState(0);
//     const [loading, setLoading] = useState(false);
//     const { isOpen, onOpen, onClose } = useDisclosure();
//     const [selectedResult, setSelectedResult] = useState<AnalyticsResult | null>(null);
//
//     useEffect(() => {
//         setLoading(true);
//         fetchAnalyticsResults(page, PAGE_SIZE).then(({ results, total }) => {
//             setResults(results);
//             setTotal(total);
//             setLoading(false);
//         }).catch(error => {
//             console.error('Error fetching analytics:', error);
//             setLoading(false);
//         });
//     }, [page]);
//
//     const totalPages = Math.ceil(total / PAGE_SIZE);
//
//     return (
//         <DashboardLayout>
//             <main style={{ flex: 1, padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
//                 <div style={{ width: "100%", maxWidth: 1200, background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(80,120,200,0.08)", padding: 32 }}>
//                     <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#3358e0", letterSpacing: 1 }}>
//                         Previous Analytics Results
//                     </h2>
//                     {loading ? (
//                         <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading...</div>
//                     ) : results.length === 0 ? (
//                         <div style={{ textAlign: "center", padding: 40, color: "#bbb" }}>No analytics results found.</div>
//                     ) : (
//                         <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
//                             {results.map((result) => {
//                                 const thumbnailUrl = `https://img.youtube.com/vi/${result.videoId}/0.jpg`;
//                                 return (
//                                     <li
//                                         key={result.id}
//                                         onClick={() => {
//                                             setSelectedResult(result);
//                                             onOpen();
//                                         }}
//                                         style={{
//                                             display: "flex",
//                                             gap: 20,
//                                             background: "#fff",
//                                             borderRadius: 12,
//                                             boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
//                                             padding: 16,
//                                             cursor: "pointer",
//                                             marginBottom: 20,
//                                             transition: "transform 0.2s ease-in-out",
//                                         }}
//                                         onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
//                                         onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
//                                     >
//                                         <img
//                                             src={thumbnailUrl}
//                                             alt="Thumbnail"
//                                             style={{ width: 480, height: 360, borderRadius: 8, objectFit: "cover" }}
//                                         />
//                                     </li>
//                                 );
//                             })}
//                         </ul>
//                     )}
//                     <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 16 }}>
//                         <button
//                             onClick={() => setPage((p) => Math.max(0, p - 1))}
//                             disabled={page === 0}
//                             style={{
//                                 padding: "10px 20px",
//                                 borderRadius: 8,
//                                 border: "none",
//                                 background: page === 0 ? "#e3eafe" : "#4f8cff",
//                                 color: page === 0 ? "#b3c0e0" : "#fff",
//                                 fontWeight: 600,
//                                 cursor: page === 0 ? "not-allowed" : "pointer",
//                                 transition: "background 0.2s",
//                             }}
//                         >
//                             ← Previous
//                         </button>
//                         <span style={{ alignSelf: "center", fontWeight: 500, color: "#3358e0" }}>
//               Page {page + 1} of {totalPages}
//             </span>
//                         <button
//                             onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
//                             disabled={page >= totalPages - 1}
//                             style={{
//                                 padding: "10px 20px",
//                                 borderRadius: 8,
//                                 border: "none",
//                                 background: page >= totalPages - 1 ? "#e3eafe" : "#4f8cff",
//                                 color: page >= totalPages - 1 ? "#b3c0e0" : "#fff",
//                                 fontWeight: 600,
//                                 cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
//                                 transition: "background 0.2s",
//                             }}
//                         >
//                             Next →
//                         </button>
//                     </div>
//                 </div>
//
//                 {selectedResult && (
//                     <Modal isOpen={isOpen} onClose={onClose} size="full">
//                         <ModalOverlay backdropFilter="blur(10px)" />
//                         <ModalContent bg="transparent" maxW="90%" borderRadius="2xl">
//                             <ModalHeader color="blue.500">Video Analysis Details</ModalHeader>
//                             <ModalCloseButton color="white" />
//                             <ModalBody pb={6}>
//                                 <AnalysisResult
//                                     analysisId={selectedResult.id}
//                                     comments={selectedResult.comments}
//                                     statistics={selectedResult.statistics}
//                                     visualizations={selectedResult.visualizations}
//                                     ai_analysis={selectedResult.aiAnalysis}
//                                 />
//                             </ModalBody>
//                         </ModalContent>
//                     </Modal>
//                 )}
//             </main>
//         </DashboardLayout>
//     );
// };
//
// export default AnalyticsResultsPage;

'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    Button,
    SimpleGrid,
    Card,
    CardBody,
    Image,
    Center,
    Spinner,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useDisclosure,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import AnalysisResult from '@/components/AnalysisResult';

type Comment = {
    text: string;
    author: string;
    likes: number;
    sentiment: {
        polarity: number;
        subjectivity: number;
    };
    publishedAt?: string;
    replies?: Comment[];
};

type Statistics = {
    total_comments: number;
    total_likes: number;
    average_likes: number;
    engagement_rates?: {
        high_engagement_rate: number;
        medium_engagement_rate: number;
        low_engagement_rate: number;
    };
    sentiment_metrics?: {
        average_sentiment: number;
        positive_rate: number;
        neutral_rate: number;
        negative_rate: number;
    };
};

type AIAnalysis = {
    sentiment_distribution: {
        positive: number;
        neutral: number;
        negative: number;
    };
    comment_categories: {
        questions: number;
        praise: number;
        suggestions: number;
        complaints: number;
        general: number;
    };
    engagement_metrics: {
        high_engagement: number;
        medium_engagement: number;
        low_engagement: number;
    };
    key_topics: Array<{
        topic: string;
        count: number;
    }>;
    overall_analysis: {
        sentiment: string;
        engagement_level: string;
        community_health: string;
    };
    recommendations: string[];
};

type Visualizations = {
    sentiment_scatter?: string;
    engagement_distribution?: string;
    wordcloud?: string;
    sentiment_timeline?: string;
    category_distribution?: string;
};

type AnalyticsResult = {
    id: string;
    summary: string;
    createdAt: string;
    videoUrl: string;
    videoId: string;
    comments: Comment[];
    statistics: Statistics;
    visualizations: Visualizations;
    aiAnalysis: AIAnalysis;
};

const PAGE_SIZE = 10;

async function fetchAnalyticsResults(page: number, pageSize: number): Promise<{ results: AnalyticsResult[]; total: number }> {
    const res = await fetch(`/api/analytics-results?page=${page + 1}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error('Failed to fetch analytics results');
    const data = await res.json();
    return { results: data.data, total: data.total };
}

const AnalyticsResultsPage: React.FC = () => {
    const [results, setResults] = useState<AnalyticsResult[]>([]);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedResult, setSelectedResult] = useState<AnalyticsResult | null>(null);
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        setLoading(true);
        fetchAnalyticsResults(page, PAGE_SIZE)
            .then(({ results, total }) => {
                setResults(results);
                setTotal(total);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching analytics:', error);
                setLoading(false);
            });
    }, [page]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const handleThumbnailClick = (result: AnalyticsResult) => {
        setSelectedResult(result);
        onOpen();
    };

    return (
        <DashboardLayout>
            <Container maxW="container.xl" py={8}>
                <VStack spacing={8} align="center">
                    <Box textAlign="center">
                        <Heading size="lg" mb={2} color="#FF0000">
                            Previous Analytics Results
                        </Heading>
                        <Text color="gray.600">
                            View and revisit your analyzed YouTube video comment insights
                        </Text>
                    </Box>

                    {/* Results Grid */}
                    {loading ? (
                        <Center p={8}>
                            <VStack spacing={4}>
                                <Spinner size="xl" color="#FF0000" />
                                <Text color="gray.600">Loading analytics results...</Text>
                            </VStack>
                        </Center>
                    ) : results.length === 0 ? (
                        <Card bg="gray.50" w="full" maxW="3xl">
                            <CardBody>
                                <Text color="gray.600" textAlign="center">
                                    No analytics results found.
                                </Text>
                            </CardBody>
                        </Card>
                    ) : (
                        <Box w="full">
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                {results.map(result => (
                                    <Card
                                        key={result.id}
                                        boxShadow="md"
                                        borderRadius="lg"
                                        overflow="hidden"
                                        cursor="pointer"
                                        _hover={{ boxShadow: 'lg', transform: 'scale(1.02)', transition: 'all 0.2s' }}
                                        onClick={() => handleThumbnailClick(result)}
                                    >
                                        <Image
                                            src={`https://img.youtube.com/vi/${result.videoId}/hqdefault.jpg`}
                                            alt={`Thumbnail for video ${result.videoId}`}
                                            objectFit="cover"
                                            width="100%"
                                            height="auto"
                                        />
                                        <CardBody p={3}>
                                            <Text fontSize="sm" noOfLines={2} color="gray.600">
                                                Analyzed on {new Date(result.createdAt).toLocaleDateString()}
                                            </Text>
                                        </CardBody>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        </Box>
                    )}

                    {/* Pagination Controls */}
                    {!loading && results.length > 0 && (
                        <Box mt={8} display="flex" justifyContent="center" alignItems="center" gap={4}>
                            <Button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                isDisabled={page === 0}
                                bg="#FF0000"
                                color="white"
                                _hover={{ bg: '#CC0000' }}
                                _disabled={{ bg: 'gray.300', cursor: 'not-allowed' }}
                                borderRadius="md"
                                px={6}
                                fontWeight={600}
                            >
                                ← Previous
                            </Button>
                            <Text fontWeight={500} color="#FF0000">
                                Page {page + 1} of {totalPages}
                            </Text>
                            <Button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                isDisabled={page >= totalPages - 1}
                                bg="#FF0000"
                                color="white"
                                _hover={{ bg: '#CC0000' }}
                                _disabled={{ bg: 'gray.300', cursor: 'not-allowed' }}
                                borderRadius="md"
                                px={6}
                                fontWeight={600}
                            >
                                Next →
                            </Button>
                        </Box>
                    )}

                    {/* Analysis Modal */}
                    {selectedResult && (
                        <Modal isOpen={isOpen} onClose={onClose} size="full">
                            <ModalOverlay backdropFilter="blur(10px)" />
                            <ModalContent maxW="90%" borderRadius="xl">
                                <ModalHeader bg="#FF0000" color="white" borderTopRadius="xl">
                                    Video Analysis Details
                                </ModalHeader>
                                <ModalCloseButton color="white" />
                                <ModalBody pb={6}>
                                    <AnalysisResult
                                        analysisId={selectedResult.id}
                                        comments={selectedResult.comments}
                                        statistics={selectedResult.statistics}
                                        visualizations={selectedResult.visualizations}
                                        ai_analysis={selectedResult.aiAnalysis}
                                    />
                                </ModalBody>
                            </ModalContent>
                        </Modal>
                    )}
                </VStack>
            </Container>
        </DashboardLayout>
    );
};

export default AnalyticsResultsPage;
