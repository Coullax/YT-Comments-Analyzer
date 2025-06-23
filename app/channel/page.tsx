'use client';

import React, { useState, FormEvent } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    Button,
    Input,
    useToast,
    Card,
    CardBody,
    FormControl,
    FormLabel,
    Icon,
    InputGroup,
    InputLeftElement,
    Center,
    Spinner,
    SimpleGrid,
    Image,
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
import { MdVideoLibrary } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import AnalysisResult from '@/components/AnalysisResult';

interface AnalysisResponse {
    id: string;
    comments: Array<{
        text: string;
        author: string;
        likes: number;
        sentiment: {
            polarity: number;
            subjectivity: number;
        };
    }>;
    statistics: {
        total_comments: number;
        total_likes: number;
        average_likes: number;
    };
    sentiment_visualization: string;
    visualizations: any;
    ai_analysis: any;
    gemini_analysis: {
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
}

interface ErrorResponse {
    error: string;
    upgradeRequired?: boolean;
}

export default function YouTubeThumbnails() {
    const [channelUrl, setChannelUrl] = useState('');
    const [videoIds, setVideoIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [channelId, setChannelId] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState<ErrorResponse | null>(null);
    const [analysisId, setAnalysisId] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { data: session, status } = useSession();
    const toast = useToast();
    const router = useRouter();

    // Redirect if not authenticated
    React.useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setVideoIds([]);
        setChannelId(null);
        setLoading(true);

        // Validate channel URL
        if (!channelUrl.match(/youtube\.com\/(@[\w-]+|channel\/[\w-]+|user\/[\w-]+)$/)) {
            setError('Please enter a valid YouTube channel URL');
            setLoading(false);
            toast({
                title: 'Error',
                description: 'Please enter a valid YouTube channel URL',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        try {
            const response = await fetch('/api/youtube-channel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channelUrl }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch videos');
            }

            setVideoIds(data.videoIds || []);
            setChannelId(data.channelId || null);
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching videos');
            toast({
                title: 'Error',
                description: err.message || 'An error occurred while fetching videos',
                status: 'error',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVideoClick = async (videoId: string) => {
        setAnalysisResult(null);
        setAnalysisError(null);
        setAnalysisLoading(true);
        setAnalysisId('');
        onOpen();

        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const newAnalysisId = `analysis_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    video_url: videoUrl,
                    analysis_id: newAnalysisId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze video');
            }

            setAnalysisResult(data);
            setAnalysisId(data.id || newAnalysisId);
        } catch (err: any) {
            setAnalysisError({
                error: err.message || 'Failed to analyze video',
                upgradeRequired: err.message.includes('upgrade to PRO'),
            });
            toast({
                title: 'Error',
                description: err.message || 'Failed to analyze video',
                status: 'error',
                duration: 5000,
            });
        } finally {
            setAnalysisLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <Container maxW="container.xl" py={8}>
                <VStack spacing={8} align="center">
                    <Box textAlign="center">
                        <Heading size="lg" mb={2} color="#FF0000">
                            YouTube Channel Video Thumbnails
                        </Heading>
                        <Text color="gray.600">
                            Browse videos from a YouTube channel and analyze their comments
                        </Text>
                    </Box>

                    {/* Form */}
                    <Card boxShadow="lg" borderRadius="xl" bg="white" p={6} w="full" maxW="3xl">
                        <CardBody>
                            <form onSubmit={handleSubmit}>
                                <VStack spacing={6}>
                                    <FormControl>
                                        <FormLabel fontWeight="bold" color="#FF0000" fontSize="lg">
                                            <Icon as={MdVideoLibrary} color="#FF0000" mr={2} />
                                            YouTube Channel URL
                                        </FormLabel>
                                        <InputGroup size="lg">
                                            <InputLeftElement pointerEvents="none">
                                                <Icon as={MdVideoLibrary} color="#FF0000" boxSize={6} />
                                            </InputLeftElement>
                                            <Input
                                                type="url"
                                                name="channelUrl"
                                                placeholder="Paste a YouTube channel URL..."
                                                value={channelUrl}
                                                onChange={(e) => setChannelUrl(e.target.value)}
                                                isDisabled={loading}
                                                bgGradient="linear(to-r, #FFF, #F9F9F9)"
                                                borderColor="#FF0000"
                                                _focus={{ borderColor: '#FF0000', boxShadow: '0 0 0 2px #FF0000' }}
                                                fontSize="md"
                                                fontWeight={500}
                                                borderRadius="md"
                                                pl={12}
                                                py={6}
                                                transition="box-shadow 0.2s"
                                            />
                                        </InputGroup>
                                    </FormControl>
                                    <Button
                                        type="submit"
                                        bg="#FF0000"
                                        color="white"
                                        isLoading={loading}
                                        loadingText="Fetching..."
                                        size="lg"
                                        borderRadius="md"
                                        fontWeight={700}
                                        boxShadow="0 2px 8px rgba(255,0,0,0.10)"
                                        _hover={{ bg: '#CC0000' }}
                                        px={8}
                                    >
                                        🚀 Fetch Thumbnails
                                    </Button>
                                </VStack>
                            </form>
                        </CardBody>
                    </Card>

                    {/* Error Message */}
                    {error && (
                        <Card bg="red.50" w="full" maxW="3xl">
                            <CardBody>
                                <Text color="red.800">{error}</Text>
                            </CardBody>
                        </Card>
                    )}

                    {/* Thumbnails Grid */}
                    {videoIds.length > 0 && (
                        <Box w="full">
                            <Heading size="md" mb={4} color="#FF0000">
                                Videos from Channel{' '}
                                {channelId && (
                                    <a
                                        href={`https://www.youtube.com/channel/${channelId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#FF0000', textDecoration: 'underline' }}
                                    >
                                        (View Channel)
                                    </a>
                                )}
                            </Heading>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                {videoIds.map((videoId) => (
                                    <Card
                                        key={videoId}
                                        boxShadow="md"
                                        borderRadius="lg"
                                        overflow="hidden"
                                        cursor="pointer"
                                        _hover={{ boxShadow: 'lg', transform: 'scale(1.02)', transition: 'all 0.2s' }}
                                        onClick={() => handleVideoClick(videoId)}
                                    >
                                        <Image
                                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                            alt={`Thumbnail for video ${videoId}`}
                                            objectFit="cover"
                                            width="100%"
                                            height="auto"
                                        />
                                        <CardBody p={3}>
                                            <Text fontSize="sm" noOfLines={2}>
                                                Click to analyze comments
                                            </Text>
                                        </CardBody>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        </Box>
                    )}

                    {/* No Videos Message */}
                    {!loading && videoIds.length === 0 && !error && channelUrl && (
                        <Card bg="gray.50" w="full" maxW="3xl">
                            <CardBody>
                                <Text color="gray.600" textAlign="center">
                                    No videos found for this channel.
                                </Text>
                            </CardBody>
                        </Card>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <Center p={8}>
                            <VStack spacing={4}>
                                <Spinner size="xl" color="#FF0000" />
                                <Text color="gray.600">Fetching videos...</Text>
                            </VStack>
                        </Center>
                    )}

                    {/* Analysis Modal */}
                    <Modal isOpen={isOpen} onClose={onClose} size="full">
                        <ModalOverlay />
                        <ModalContent maxW="90%" borderRadius="xl">
                            <ModalHeader bg="#FF0000" color="white" borderTopRadius="xl">
                                Video Comment Analysis
                            </ModalHeader>
                            <ModalCloseButton color="white" />
                            <ModalBody p={6}>
                                {analysisLoading && (
                                    <Center p={8}>
                                        <VStack spacing={4}>
                                            <Spinner size="xl" color="#FF0000" />
                                            <Text color="gray.600">Analyzing video comments...</Text>
                                        </VStack>
                                    </Center>
                                )}
                                {analysisError && (
                                    <Card bg={analysisError.upgradeRequired ? 'orange.50' : 'red.50'} mb={4}>
                                        <CardBody>
                                            <VStack spacing={4}>
                                                <Text color={analysisError.upgradeRequired ? 'orange.800' : 'red.800'}>
                                                    {analysisError.error}
                                                </Text>
                                                {analysisError.upgradeRequired && (
                                                    <Button
                                                        colorScheme="orange"
                                                        onClick={() => router.push('/pricing')}
                                                    >
                                                        Upgrade to PRO
                                                    </Button>
                                                )}
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                )}
                                {analysisResult && !analysisLoading && (
                                    <AnalysisResult
                                        comments={analysisResult.comments || []}
                                        statistics={
                                            analysisResult.statistics || {
                                                total_comments: 0,
                                                total_likes: 0,
                                                average_likes: 0,
                                            }
                                        }
                                        visualizations={analysisResult.visualizations || {}}
                                        ai_analysis={
                                            analysisResult.ai_analysis || {
                                                sentiment_distribution: { positive: 0, neutral: 0, negative: 0 },
                                                comment_categories: {
                                                    questions: 0,
                                                    praise: 0,
                                                    suggestions: 0,
                                                    complaints: 0,
                                                    general: 0,
                                                },
                                                engagement_metrics: {
                                                    high_engagement: 0,
                                                    medium_engagement: 0,
                                                    low_engagement: 0,
                                                },
                                                key_topics: [],
                                                overall_analysis: {
                                                    sentiment: 'Not available',
                                                    engagement_level: 'Not available',
                                                    community_health: 'Not available',
                                                },
                                                recommendations: [],
                                            }
                                        }
                                        analysisId={analysisResult.id || analysisId}
                                    />
                                )}
                            </ModalBody>
                        </ModalContent>
                    </Modal>
                </VStack>
            </Container>
        </DashboardLayout>
    );
}