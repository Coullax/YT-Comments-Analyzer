'use client';

import React, { useState, useEffect, FormEvent } from 'react';
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
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MdVideoLibrary, MdAdd } from 'react-icons/md';
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

interface Channel {
    id: string;
    channelUrl: string;
    channelId: string;
    createdAt: string;
    updatedAt: string;
}

export default function YouTubeThumbnails() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [videoIds, setVideoIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [channelLoading, setChannelLoading] = useState(false);
    const [channelUrl, setChannelUrl] = useState('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState<ErrorResponse | null>(null);
    const [analysisId, setAnalysisId] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { data: session, status } = useSession();
    const toast = useToast();
    const router = useRouter();

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    // Fetch saved channels on mount
    useEffect(() => {
        const fetchChannels = async () => {
            setChannelLoading(true);
            try {
                const response = await fetch('/api/youtube-channel');
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch channels');
                }
                setChannels(data.channels || []);
            } catch (err: any) {
                toast({
                    title: 'Error',
                    description: err.message || 'Failed to fetch saved channels',
                    status: 'error',
                    duration: 5000,
                });
            } finally {
                setChannelLoading(false);
            }
        };
        if (status === 'authenticated') {
            fetchChannels();
        }
    }, [status, toast]);

    // Fetch videos when a channel is selected
    useEffect(() => {
        if (selectedChannelId) {
            const selectedChannel = channels.find((channel) => channel.channelId === selectedChannelId);
            if (selectedChannel) {
                fetchVideos(selectedChannel.channelUrl);
            }
        }
    }, [selectedChannelId, channels]);

    const fetchVideos = async (channelUrl: string) => {
        setError(null);
        setVideoIds([]);
        setLoading(true);

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

    const handleAddChannel = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate channel URL
        if (!channelUrl.match(/youtube\.com\/(@[\w-]+|channel\/[\w-]+|user\/[\w-]+)$/)) {
            setError('Please enter a valid YouTube channel URL');
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
                body: JSON.stringify({ channelUrl, action: 'save' }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save channel');
            }

            setChannels([...channels, data.channel]);
            setChannelUrl('');
            toast({
                title: 'Success',
                description: 'Channel saved successfully',
                status: 'success',
                duration: 3000,
            });

            // Select the newly added channel
            setSelectedChannelId(data.channel.channelId);
        } catch (err: any) {
            setError(err.message || 'An error occurred while saving the channel');
            toast({
                title: 'Error',
                description: err.message || 'An error occurred while saving the channel',
                status: 'error',
                duration: 5000,
            });
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
                            Browse videos from your saved YouTube channels and analyze their comments
                        </Text>
                    </Box>

                    {/* Tabs for Channels */}
                    <Tabs
                        variant="soft-rounded"
                        colorScheme="red"
                        w="full"
                        maxW="3xl"
                        onChange={(index) => {
                            if (index < channels.length) {
                                setSelectedChannelId(channels[index].channelId);
                            } else {
                                setSelectedChannelId(null);
                                setVideoIds([]);
                            }
                        }}
                    >
                        <TabList overflowX="auto" pb={2}>
                            {channels.map((channel) => (
                                <Tab key={channel.channelId} fontWeight="medium">
                                    {channel.channelUrl.includes('/@')
                                        ? channel.channelUrl.match(/@[\w-]+/)?.[0] || channel.channelId
                                        : channel.channelId}
                                </Tab>
                            ))}
                            <Tab>
                                <Icon as={MdAdd} boxSize={5} />
                            </Tab>
                        </TabList>

                        <TabPanels>
                            {channels.map((channel) => (
                                <TabPanel key={channel.channelId} p={0} pt={4}>
                                    {/* Thumbnails Grid */}
                                    {videoIds.length > 0 && selectedChannelId === channel.channelId && (
                                        <Box w="full">
                                            <Heading size="md" mb={4} color="#FF0000">
                                                Videos from{' '}
                                                <a
                                                    href={channel.channelUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#FF0000', textDecoration: 'underline' }}
                                                >
                                                    {channel.channelUrl.includes('/@')
                                                        ? channel.channelUrl.match(/@[\w-]+/)?.[0]
                                                        : channel.channelId}
                                                </a>
                                            </Heading>
                                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                                {videoIds.map((videoId) => (
                                                    <Card
                                                        key={videoId}
                                                        boxShadow="md"
                                                        borderRadius="lg"
                                                        overflow="hidden"
                                                        cursor="pointer"
                                                        _hover={{
                                                            boxShadow: 'lg',
                                                            transform: 'scale(1.02)',
                                                            transition: 'all 0.2s',
                                                        }}
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
                                    {!loading &&
                                        videoIds.length === 0 &&
                                        selectedChannelId === channel.channelId &&
                                        !error && (
                                            <Card bg="gray.50" w="full" maxW="3xl">
                                                <CardBody>
                                                    <Text color="gray.600" textAlign="center">
                                                        No videos found for this channel.
                                                    </Text>
                                                </CardBody>
                                            </Card>
                                        )}

                                    {/* Error Message */}
                                    {error && selectedChannelId === channel.channelId && (
                                        <Card bg="red.50" w="full" maxW="3xl">
                                            <CardBody>
                                                <Text color="red.800">{error}</Text>
                                            </CardBody>
                                        </Card>
                                    )}

                                    {/* Loading State */}
                                    {loading && selectedChannelId === channel.channelId && (
                                        <Center p={8}>
                                            <VStack spacing={4}>
                                                <Spinner size="xl" color="#FF0000" />
                                                <Text color="gray.600">Fetching videos...</Text>
                                            </VStack>
                                        </Center>
                                    )}
                                </TabPanel>
                            ))}
                            <TabPanel p={0} pt={4}>
                                {/* Add Channel Form */}
                                <Card boxShadow="lg" borderRadius="xl" bg="white" p={6} w="full" maxW="3xl">
                                    <CardBody>
                                        <form onSubmit={handleAddChannel}>
                                            <VStack spacing={6}>
                                                <FormControl>
                                                    <FormLabel fontWeight="bold" color="#FF0000" fontSize="lg">
                                                        <Icon as={MdVideoLibrary} color="#FF0000" mr={2} />
                                                        Add YouTube Channel
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
                                                            bgGradient="linear(to-r, #FFF, #F9F9F9)"
                                                            borderColor="#FF0000"
                                                            _focus={{
                                                                borderColor: '#FF0000',
                                                                boxShadow: '0 0 0 2px #FF0000',
                                                            }}
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
                                                    loadingText="Saving..."
                                                    size="lg"
                                                    borderRadius="md"
                                                    fontWeight={700}
                                                    boxShadow="0 2px 8px rgba(255,0,0,0.10)"
                                                    _hover={{ bg: '#CC0000' }}
                                                    px={8}
                                                >
                                                    🚀 Add Channel
                                                </Button>
                                            </VStack>
                                        </form>
                                    </CardBody>
                                </Card>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>

                    {/* Loading State for Channels */}
                    {channelLoading && (
                        <Center p={8}>
                            <VStack spacing={4}>
                                <Spinner size="xl" color="#FF0000" />
                                <Text color="gray.600">Loading saved channels...</Text>
                            </VStack>
                        </Center>
                    )}

                    {/* No Channels Message */}
                    {!channelLoading && channels.length === 0 && (
                        <Card bg="gray.50" w="full" maxW="3xl">
                            <CardBody>
                                <Text color="gray.600" textAlign="center">
                                    No saved channels. Add a channel using the + tab.
                                </Text>
                            </CardBody>
                        </Card>
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