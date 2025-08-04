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
    Flex,
    Badge,
    // keyframes,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MdVideoLibrary, MdAdd, MdPlayCircle } from 'react-icons/md';
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
    statistics: any
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

    // Animation for card hover
    // const pulse = keyframes`
    //     0% { transform: scale(1); }
    //     50% { transform: scale(1.03); }
    //     100% { transform: scale(1); }
    // `;

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
            <Container maxW="container.xl" py={12}>
                <VStack spacing={10} align="stretch">
                    <Box textAlign="center">
                        <Heading
                            size="2xl"
                            mb={4}
                            bgGradient="linear(to-r, red.500, orange.500)"
                            bgClip="text"
                            fontWeight="extrabold"
                        >
                            YouTube Video Explorer
                        </Heading>
                        <Text fontSize="lg" color="gray.500" maxW="2xl" mx="auto">
                            Discover and analyze videos from your favorite YouTube channels with ease
                        </Text>
                    </Box>

                    {/* Tabs for Channels */}
                    <Tabs
                        variant="unstyled"
                        w="full"
                        onChange={(index) => {
                            if (index < channels.length) {
                                setSelectedChannelId(channels[index].channelId);
                            } else {
                                setSelectedChannelId(null);
                                setVideoIds([]);
                            }
                        }}
                    >
                        <TabList
                            bg="gray.50"
                            borderRadius="full"
                            p={2}
                            display="flex"
                            justifyContent="center"
                            overflowX="auto"
                        >
                            {channels.map((channel) => (
                                <Tab
                                    key={channel.channelId}
                                    borderRadius="full"
                                    px={6}
                                    py={3}
                                    mx={1}
                                    fontWeight="semibold"
                                    color="gray.600"
                                    _selected={{
                                        bg: 'red.500',
                                        color: 'white',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                    _hover={{
                                        bg: 'red.100',
                                        color: 'red.800',
                                    }}
                                    transition="all 0.3s"
                                >
                                    {channel.channelUrl.includes('/@')
                                        ? channel.channelUrl.match(/@[\w-]+/)?.[0] || channel.channelId
                                        : channel.channelId}
                                    <Badge
                                        ml={2}
                                        colorScheme="red"
                                        borderRadius="full"
                                        px={2}
                                        fontSize="0.7em"
                                    >
                                        {videoIds.length}
                                    </Badge>
                                </Tab>
                            ))}
                            <Tab
                                borderRadius="full"
                                px={4}
                                py={3}
                                mx={1}
                                bg="red.500"
                                color="white"
                                _hover={{ bg: 'red.600' }}
                                transition="all 0.3s"
                            >
                                <Icon as={MdAdd} boxSize={5} />
                            </Tab>
                        </TabList>

                        <TabPanels mt={6}>
                            {channels.map((channel) => (
                                <TabPanel key={channel.channelId} p={0}>
                                    {/* Thumbnails Grid */}
                                    {videoIds.length > 0 && selectedChannelId === channel.channelId && (
                                        <Box>
                                            <Flex align="center" mb={6}>
                                                <Heading size="md" color="gray.700">
                                                    Videos from{' '}
                                                    <a
                                                        href={channel.channelUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            color: 'red.500',
                                                            textDecoration: 'none',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {channel.channelUrl.includes('/@')
                                                            ? channel.channelUrl.match(/@[\w-]+/)?.[0]
                                                            : channel.channelId}
                                                    </a>
                                                </Heading>
                                            </Flex>
                                            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                                                {videoIds.map((videoId) => (
                                                    <Card
                                                        key={videoId}
                                                        borderRadius="2xl"
                                                        overflow="hidden"
                                                        bg="white"
                                                        boxShadow="0 8px 24px rgba(0,0,0,0.05)"
                                                        cursor="pointer"
                                                        _hover={{
                                                            // animation: `${pulse} 0.5s ease-in-out`,
                                                            boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                                                        }}
                                                        onClick={() => handleVideoClick(videoId)}
                                                        transition="all 0.3s"
                                                    >
                                                        <Box position="relative">
                                                            <Image
                                                                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                                                alt={`Thumbnail for video ${videoId}`}
                                                                objectFit="cover"
                                                                width="100%"
                                                                height="200px"
                                                                borderTopRadius="2xl"
                                                            />
                                                            <Center
                                                                position="absolute"
                                                                top="0"
                                                                left="0"
                                                                right="0"
                                                                bottom="0"
                                                                bg="blackAlpha.400"
                                                                opacity={0}
                                                                _hover={{ opacity: 1 }}
                                                                transition="opacity 0.3s"
                                                            >
                                                                <Icon
                                                                    as={MdPlayCircle}
                                                                    boxSize={16}
                                                                    color="white"
                                                                />
                                                            </Center>
                                                        </Box>
                                                        <CardBody p={4}>
                                                            <Text
                                                                fontSize="sm"
                                                                color="gray.600"
                                                                fontWeight="medium"
                                                                noOfLines={2}
                                                            >
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
                                            <Card
                                                bg="gray.50"
                                                borderRadius="2xl"
                                                p={6}
                                                textAlign="center"
                                            >
                                                <CardBody>
                                                    <Text color="gray.500" fontSize="lg">
                                                        No videos found for this channel.
                                                    </Text>
                                                </CardBody>
                                            </Card>
                                        )}

                                    {/* Error Message */}
                                    {error && selectedChannelId === channel.channelId && (
                                        <Card bg="red.50" borderRadius="2xl" p={6}>
                                            <CardBody>
                                                <Text color="red.600" fontWeight="medium">
                                                    {error}
                                                </Text>
                                            </CardBody>
                                        </Card>
                                    )}

                                    {/* Loading State */}
                                    {loading && selectedChannelId === channel.channelId && (
                                        <Center py={12}>
                                            <VStack spacing={4}>
                                                <Spinner size="xl" color="red.500" thickness="4px" />
                                                <Text color="gray.500" fontSize="lg">
                                                    Fetching videos...
                                                </Text>
                                            </VStack>
                                        </Center>
                                    )}
                                </TabPanel>
                            ))}
                            <TabPanel p={0}>
                                {/* Add Channel Form */}
                                <Card
                                    borderRadius="2xl"
                                    bg="white"
                                    p={8}
                                    boxShadow="0 8px 24px rgba(0,0,0,0.05)"
                                    maxW="2xl"
                                    mx="auto"
                                >
                                    <CardBody>
                                        <form onSubmit={handleAddChannel}>
                                            <VStack spacing={6}>
                                                <FormControl>
                                                    <FormLabel
                                                        fontWeight="bold"
                                                        color="gray.700"
                                                        fontSize="lg"
                                                    >
                                                        <Icon
                                                            as={MdVideoLibrary}
                                                            color="red.500"
                                                            mr={2}
                                                            verticalAlign="middle"
                                                        />
                                                        Add YouTube Channel
                                                    </FormLabel>
                                                    <InputGroup size="lg">
                                                        <InputLeftElement pointerEvents="none">
                                                            <Icon
                                                                as={MdVideoLibrary}
                                                                color="red.500"
                                                                boxSize={6}
                                                            />
                                                        </InputLeftElement>
                                                        <Input
                                                            type="url"
                                                            name="channelUrl"
                                                            placeholder="Paste a YouTube channel URL..."
                                                            value={channelUrl}
                                                            onChange={(e) => setChannelUrl(e.target.value)}
                                                            bg="gray.50"
                                                            borderColor="gray.200"
                                                            borderRadius="lg"
                                                            _focus={{
                                                                borderColor: 'red.500',
                                                                boxShadow: '0 0 0 3px rgba(255,0,0,0.1)',
                                                            }}
                                                            fontSize="md"
                                                            fontWeight="medium"
                                                            pl={12}
                                                            py={6}
                                                            transition="all 0.3s"
                                                            _hover={{ borderColor: 'red.300' }}
                                                        />
                                                    </InputGroup>
                                                </FormControl>
                                                <Button
                                                    type="submit"
                                                    bgGradient="linear(to-r, red.500, orange.500)"
                                                    color="white"
                                                    isLoading={loading}
                                                    loadingText="Saving..."
                                                    size="lg"
                                                    borderRadius="lg"
                                                    fontWeight="bold"
                                                    px={8}
                                                    py={6}
                                                    boxShadow="0 4px 12px rgba(0,0,0,0.1)"
                                                    _hover={{
                                                        bgGradient: 'linear(to-r, red.600, orange.600)',
                                                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                                                    }}
                                                    transition="all 0.3s"
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
                        <Center py={12}>
                            <VStack spacing={4}>
                                <Spinner size="xl" color="red.500" thickness="4px" />
                                <Text color="gray.500" fontSize="lg">
                                    Loading saved channels...
                                </Text>
                            </VStack>
                        </Center>
                    )}

                    {/* No Channels Message */}
                    {!channelLoading && channels.length === 0 && (
                        <Card bg="gray.50" borderRadius="2xl" p={6} textAlign="center">
                            <CardBody>
                                <Text color="gray.500" fontSize="lg">
                                    No saved channels. Add a channel using the + tab.
                                </Text>
                            </CardBody>
                        </Card>
                    )}

                    {/* Analysis Modal */}
                    <Modal isOpen={isOpen} onClose={onClose} size="full">
                        <ModalOverlay bg="blackAlpha.700" />
                        <ModalContent maxW="8xl" borderRadius="2xl" overflow="hidden">
                            <ModalHeader
                                bgGradient="linear(to-r, red.500, orange.500)"
                                color="white"
                                borderTopRadius="2xl"
                                fontSize="xl"
                                fontWeight="bold"
                                py={4}
                            >
                                Video Comment Analysis
                            </ModalHeader>
                            <ModalCloseButton color="white" _hover={{ color: 'gray.200' }} />
                            <ModalBody p={8} bg="gray.50">
                                {analysisLoading && (
                                    <Center py={12}>
                                        <VStack spacing={4}>
                                            <Spinner size="xl" color="red.500" thickness="4px" />
                                            <Text color="gray.500" fontSize="lg">
                                                Analyzing video comments...
                                            </Text>
                                        </VStack>
                                    </Center>
                                )}
                                {analysisError && (
                                    <Card
                                        bg={analysisError.upgradeRequired ? 'orange.50' : 'red.50'}
                                        borderRadius="2xl"
                                        p={6}
                                        mb={6}
                                    >
                                        <CardBody>
                                            <VStack spacing={4}>
                                                <Text
                                                    color={
                                                        analysisError.upgradeRequired
                                                            ? 'orange.600'
                                                            : 'red.600'
                                                    }
                                                    fontWeight="medium"
                                                >
                                                    {analysisError.error}
                                                </Text>
                                                {analysisError.upgradeRequired && (
                                                    <Button
                                                        bgGradient="linear(to-r, orange.500, red.500)"
                                                        color="white"
                                                        borderRadius="lg"
                                                        _hover={{
                                                            bgGradient: 'linear(to-r, orange.600, red.600)',
                                                        }}
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