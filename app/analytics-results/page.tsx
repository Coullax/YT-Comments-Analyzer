// 'use client';
//
// import React, { useEffect, useState } from 'react';
// import {
//     Box,
//     Container,
//     Heading,
//     Text,
//     VStack,
//     Button,
//     SimpleGrid,
//     Card,
//     CardBody,
//     Image,
//     Center,
//     Spinner,
//     Modal,
//     ModalOverlay,
//     ModalContent,
//     ModalHeader,
//     ModalCloseButton,
//     ModalBody,
//     useDisclosure,
//     useToast,
// } from '@chakra-ui/react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import DashboardLayout from '@/components/DashboardLayout';
// import AnalysisResult from '@/components/AnalysisResult';
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
//     positiveInsights: string[];
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
//     const { data: session, status } = useSession();
//     const router = useRouter();
//     const toast = useToast();
//
//     // Redirect if not authenticated
//     useEffect(() => {
//         if (status === 'unauthenticated') {
//             router.push('/');
//         }
//     }, [status, router]);
//
//     useEffect(() => {
//         setLoading(true);
//         fetchAnalyticsResults(page, PAGE_SIZE)
//             .then(({ results, total }) => {
//                 setResults(results);
//                 setTotal(total);
//                 setLoading(false);
//             })
//             .catch(error => {
//                 console.error('Error fetching analytics:', error);
//                 toast({
//                     title: 'Error',
//                     description: error.message || 'Failed to fetch analytics results',
//                     status: 'error',
//                     duration: 5000,
//                 });
//                 setLoading(false);
//             });
//     }, [page, toast]);
//
//     const totalPages = Math.ceil(total / PAGE_SIZE);
//
//     const handleThumbnailClick = (result: AnalyticsResult) => {
//         setSelectedResult(result);
//         onOpen();
//     };
//
//     return (
//         <DashboardLayout>
//             <Container maxW="container.xl" py={8}>
//                 <VStack spacing={8} align="center">
//                     <Box textAlign="center">
//                         <Heading size="lg" mb={2} color="#FF0000">
//                             Previous Analytics Results
//                         </Heading>
//                         <Text color="gray.600">
//                             View and revisit your analyzed YouTube video comment insights
//                         </Text>
//                     </Box>
//
//                     {/* Results Grid */}
//                     {loading ? (
//                         <Center p={8}>
//                             <VStack spacing={4}>
//                                 <Spinner size="xl" color="#FF0000" />
//                                 <Text color="gray.600">Loading analytics results...</Text>
//                             </VStack>
//                         </Center>
//                     ) : results.length === 0 ? (
//                         <Card bg="gray.50" w="full" maxW="3xl">
//                             <CardBody>
//                                 <Text color="gray.600" textAlign="center">
//                                     No analytics results found.
//                                 </Text>
//                             </CardBody>
//                         </Card>
//                     ) : (
//                         <Box w="full">
//                             <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
//                                 {results.map(result => (
//                                     <Card
//                                         key={result.id}
//                                         boxShadow="md"
//                                         borderRadius="lg"
//                                         overflow="hidden"
//                                         cursor="pointer"
//                                         _hover={{ boxShadow: 'lg', transform: 'scale(1.02)', transition: 'all 0.2s' }}
//                                         onClick={() => handleThumbnailClick(result)}
//                                     >
//                                         <Image
//                                             src={`https://img.youtube.com/vi/${result.videoId}/hqdefault.jpg`}
//                                             alt={`Thumbnail for video ${result.videoId}`}
//                                             objectFit="cover"
//                                             width="100%"
//                                             height="auto"
//                                         />
//                                         <CardBody p={3}>
//                                             <Text fontSize="sm" noOfLines={2} color="gray.600">
//                                                 Analyzed on {new Date(result.createdAt).toLocaleDateString()}
//                                             </Text>
//                                         </CardBody>
//                                     </Card>
//                                 ))}
//                             </SimpleGrid>
//                         </Box>
//                     )}
//
//                     {/* Pagination Controls */}
//                     {!loading && results.length > 0 && (
//                         <Box mt={8} display="flex" justifyContent="center" alignItems="center" gap={4}>
//                             <Button
//                                 onClick={() => setPage(p => Math.max(0, p - 1))}
//                                 isDisabled={page === 0}
//                                 bg="#FF0000"
//                                 color="white"
//                                 _hover={{ bg: '#CC0000' }}
//                                 _disabled={{ bg: 'gray.300', cursor: 'not-allowed' }}
//                                 borderRadius="md"
//                                 px={6}
//                                 fontWeight={600}
//                             >
//                                 ← Previous
//                             </Button>
//                             <Text fontWeight={500} color="#FF0000">
//                                 Page {page + 1} of {totalPages}
//                             </Text>
//                             <Button
//                                 onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
//                                 isDisabled={page >= totalPages - 1}
//                                 bg="#FF0000"
//                                 color="white"
//                                 _hover={{ bg: '#CC0000' }}
//                                 _disabled={{ bg: 'gray.300', cursor: 'not-allowed' }}
//                                 borderRadius="md"
//                                 px={6}
//                                 fontWeight={600}
//                             >
//                                 Next →
//                             </Button>
//                         </Box>
//                     )}
//
//                     {/* Analysis Modal */}
//                     {selectedResult && (
//                         <Modal isOpen={isOpen} onClose={onClose} size="full">
//                             <ModalOverlay backdropFilter="blur(10px)" />
//                             <ModalContent maxW="90%" borderRadius="xl">
//                                 <ModalHeader bg="#FF0000" color="white" borderTopRadius="xl">
//                                     Video Analysis Details
//                                 </ModalHeader>
//                                 <ModalCloseButton color="white" />
//                                 <ModalBody pb={6}>
//                                     <AnalysisResult
//                                         analysisId={selectedResult.id}
//                                         comments={selectedResult.comments}
//                                         statistics={selectedResult.statistics}
//                                         visualizations={selectedResult.visualizations}
//                                         ai_analysis={selectedResult.aiAnalysis}
//                                     />
//                                 </ModalBody>
//                             </ModalContent>
//                         </Modal>
//                     )}
//                 </VStack>
//             </Container>
//         </DashboardLayout>
//     );
// };
//
// export default AnalyticsResultsPage;



'use client';

import React, { useState } from 'react';
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
    useToast,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import AnalysisResult from '@/components/AnalysisResult';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEqual } from 'lodash';

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
    fetched_comments:any
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
    positiveInsights: string[];
    futureImprovementsSuggests:any
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

// Create a QueryClient instance
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
            // cacheTime: 30 * 60 * 1000, // Cache persists for 30 minutes
            retry: 1, // Retry failed requests once
        },
    },
});

async function fetchAnalyticsResults(page: number, pageSize: number): Promise<{ results: AnalyticsResult[]; total: number }> {
    const res = await fetch(`/api/analytics-results?page=${page + 1}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error('Failed to fetch analytics results');
    const data = await res.json();
    return { results: data.data, total: data.total };
}

const AnalyticsResultsContent: React.FC = () => {
    const [page, setPage] = useState(0);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedResult, setSelectedResult] = useState<AnalyticsResult | null>(null);
    const { data: session, status } = useSession();
    const router = useRouter();
    const toast = useToast();
    const queryClient = useQueryClient();

    // Redirect if not authenticated
    React.useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    // Fetch data using React Query
    const { data, isLoading, error } = useQuery({
        queryKey: ['analyticsResults', page], // Unique key for caching, changes with page
        queryFn: () => fetchAnalyticsResults(page, PAGE_SIZE),
        keepPreviousData: true, // Keep previous data while fetching new page
        refetchOnMount: 'always', // Always refetch when component mounts
        onSuccess: (newData : any) => {
            // Compare new data with cached data
            const cachedData = queryClient.getQueryData(['analyticsResults', page]);
            if (cachedData && !isEqual(cachedData, newData)) {
                // Update cache if data has changed
                queryClient.setQueryData(['analyticsResults', page], newData);
                toast({
                    title: 'Data Updated',
                    description: 'New analytics results have been loaded.',
                    status: 'info',
                    duration: 3000,
                });
            }
        },
    });

    // Handle error
    React.useEffect(() => {
        if (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch analytics results',
                status: 'error',
                duration: 5000,
            });
        }
    }, [error, toast]);

    const results = data?.results || [];
    const total = data?.total || 0;
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
                    {isLoading ? (
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
                                {results.map((result:any) => (
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
                    {!isLoading && results.length > 0 && (
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

// Wrap the component with QueryClientProvider
const AnalyticsResultsPage: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AnalyticsResultsContent />
        </QueryClientProvider>
    );
};

export default AnalyticsResultsPage;