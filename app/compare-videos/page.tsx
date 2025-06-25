// 'use client';
//
// import React, { useState, useEffect } from 'react';
// import {
//     Box,
//     Container,
//     Heading,
//     Text,
//     VStack,
//     Button,
//     Input,
//     Select,
//     useToast,
//     Card,
//     CardBody,
//     FormControl,
//     FormLabel,
//     Center,
//     Spinner,
//     SimpleGrid,
//     List,
//     ListItem,
//     ListIcon,
// } from '@chakra-ui/react';
// import { useSession } from 'next-auth/react';
// import { MdCheck, MdClose } from 'react-icons/md';
// import DashboardLayout from '@/components/DashboardLayout';
//
// interface Analysis {
//     id: string;
//     videoUrl: string;
// }
//
// interface Comparison {
//     sentiment_comparison: string;
//     engagement_comparison: string;
//     key_topics: {
//         common: string[];
//         unique_to_video1: string[];
//         unique_to_video2: string[];
//     };
//     comment_categories_comparison: string;
//     community_health_comparison: string;
//     other_insights: string;
// }
//
// export default function CompareVideos() {
//     const { data: session, status } = useSession();
//     const [url1, setUrl1] = useState('');
//     const [analysis1, setAnalysis1] = useState('');
//     const [url2, setUrl2] = useState('');
//     const [analysis2, setAnalysis2] = useState('');
//     const [analyses, setAnalyses] = useState<Analysis[]>([]);
//     const [comparison, setComparison] = useState<Comparison | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const toast = useToast();
//
//     useEffect(() => {
//         if (status === 'authenticated') {
//             fetchAnalyses();
//         }
//     }, [status]);
//
//     const fetchAnalyses = async () => {
//         try {
//             const response = await fetch('/api/analyses');
//             if (!response.ok) {
//                 throw new Error('Failed to fetch analyses');
//             }
//             const data = await response.json();
//             setAnalyses(data.analyses || []);
//         } catch (err: any) {
//             toast({
//                 title: 'Error',
//                 description: err.message || 'Failed to fetch saved analyses',
//                 status: 'error',
//                 duration: 5000,
//             });
//         }
//     };
//
//     const handleCompare = async () => {
//         if (!session) {
//             toast({
//                 title: 'Error',
//                 description: 'You must be signed in to compare videos',
//                 status: 'error',
//                 duration: 5000,
//             });
//             return;
//         }
//
//         if ((!url1 && !analysis1) || (!url2 && !analysis2)) {
//             setError('Please provide at least one identifier (URL or analysis ID) for each video');
//             return;
//         }
//         setError(null);
//         setLoading(true);
//         setComparison(null);
//
//         try {
//             const response = await fetch('/api/compare-analytics', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     video_url1: url1,
//                     video_url2: url2,
//                     analysis_id1: analysis1,
//                     analysis_id2: analysis2,
//                 }),
//             });
//
//             if (!response.ok) {
//                 const data = await response.json();
//                 throw new Error(data.error || 'Comparison failed');
//             }
//
//             const data = await response.json();
//             setComparison(data.comparison);
//         } catch (err: any) {
//             setError(err.message || 'An error occurred while comparing videos');
//             toast({
//                 title: 'Error',
//                 description: err.message || 'An error occurred while comparing videos',
//                 status: 'error',
//                 duration: 5000,
//             });
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     return (
//         <DashboardLayout>
//             <Container maxW="container.xl" py={8}>
//                 <VStack spacing={8} align="center">
//                     <Box textAlign="center">
//                         <Heading size="lg" mb={2} color="#FF0000">
//                             Compare Two YouTube Videos
//                         </Heading>
//                         <Text color="gray.600">
//                             Enter URLs or select saved analyses to compare video comments
//                         </Text>
//                     </Box>
//
//                     <Card w="full" maxW="3xl">
//                         <CardBody>
//                             <VStack spacing={6}>
//                                 <FormControl>
//                                     <FormLabel>Video 1</FormLabel>
//                                     <Input
//                                         placeholder="Enter YouTube video URL"
//                                         value={url1}
//                                         onChange={(e) => setUrl1(e.target.value)}
//                                         mb={2}
//                                     />
//                                     <Select
//                                         placeholder="Or select saved analysis"
//                                         value={analysis1}
//                                         onChange={(e) => setAnalysis1(e.target.value)}
//                                     >
//                                         {analyses.map((a) => (
//                                             <option key={a.id} value={a.id}>
//                                                 {a.videoUrl}
//                                             </option>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//
//                                 <FormControl>
//                                     <FormLabel>Video 2</FormLabel>
//                                     <Input
//                                         placeholder="Enter YouTube video URL"
//                                         value={url2}
//                                         onChange={(e) => setUrl2(e.target.value)}
//                                         mb={2}
//                                     />
//                                     <Select
//                                         placeholder="Or select saved analysis"
//                                         value={analysis2}
//                                         onChange={(e) => setAnalysis2(e.target.value)}
//                                     >
//                                         {analyses.map((a) => (
//                                             <option key={a.id} value={a.id}>
//                                                 {a.videoUrl}
//                                             </option>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//
//                                 {error && (
//                                     <Text color="red.500">{error}</Text>
//                                 )}
//
//                                 <Button
//                                     onClick={handleCompare}
//                                     isLoading={loading}
//                                     loadingText="Comparing..."
//                                     colorScheme="red"
//                                     size="lg"
//                                 >
//                                     Compare
//                                 </Button>
//                             </VStack>
//                         </CardBody>
//                     </Card>
//
//                     {loading && (
//                         <Center p={8}>
//                             <VStack spacing={4}>
//                                 <Spinner size="xl" color="#FF0000" />
//                                 <Text color="gray.600">Comparing videos...</Text>
//                             </VStack>
//                         </Center>
//                     )}
//
//                     {comparison && (
//                         <Card w="full" maxW="3xl">
//                             <CardBody>
//                                 <VStack spacing={6} align="start">
//                                     <Heading size="md">Comparison Results</Heading>
//                                     <Box>
//                                         <Heading size="sm" mb={2}>Sentiment Comparison</Heading>
//                                         <Text>{comparison.sentiment_comparison}</Text>
//                                     </Box>
//                                     <Box>
//                                         <Heading size="sm" mb={2}>Engagement Comparison</Heading>
//                                         <Text>{comparison.engagement_comparison}</Text>
//                                     </Box>
//                                     <Box>
//                                         <Heading size="sm" mb={2}>Key Topics</Heading>
//                                         <List spacing={1}>
//                                             <ListItem>
//                                                 <ListIcon as={MdCheck} color="green.500" />
//                                                 Common: {comparison.key_topics.common.join(', ')}
//                                             </ListItem>
//                                             <ListItem>
//                                                 <ListIcon as={MdClose} color="red.500" />
//                                                 Unique to Video 1: {comparison.key_topics.unique_to_video1.join(', ')}
//                                             </ListItem>
//                                             <ListItem>
//                                                 <ListIcon as={MdClose} color="red.500" />
//                                                 Unique to Video 2: {comparison.key_topics.unique_to_video2.join(', ')}
//                                             </ListItem>
//                                         </List>
//                                     </Box>
//                                     <Box>
//                                         <Heading size="sm" mb={2}>Comment Categories Comparison</Heading>
//                                         <Text>{comparison.comment_categories_comparison}</Text>
//                                     </Box>
//                                     <Box>
//                                         <Heading size="sm" mb={2}>Community Health Comparison</Heading>
//                                         <Text>{comparison.community_health_comparison}</Text>
//                                     </Box>
//                                     <Box>
//                                         <Heading size="sm" mb={2}>Other Insights</Heading>
//                                         <Text>{comparison.other_insights}</Text>
//                                     </Box>
//                                 </VStack>
//                             </CardBody>
//                         </Card>
//                     )}
//                 </VStack>
//             </Container>
//         </DashboardLayout>
//     );
// }

'use client';

import React, { useState, useEffect } from 'react';
import {
    Box, Container, Heading, Text, VStack, Button, Input,
    Card, CardBody, FormControl, FormLabel, Center, Spinner,
    List, ListItem, ListIcon, Image, HStack, RadioGroup, Radio,
    Stack, useToast, Badge, Divider, Flex
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { MdCheck, MdClose, MdArrowDropDown } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';

interface Analysis {
    id: string;
    videoUrl: string;
    videoId: string;
}

interface Comparison {
    sentiment_comparison: string;
    engagement_comparison: string;
    key_topics: {
        common: string[];
        unique_to_video1: string[];
        unique_to_video2: string[];
    };
    comment_categories_comparison: string;
    community_health_comparison: string;
    other_insights: string;
}

const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|embed|watch|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
};

const getThumbnailUrl = (videoId: string) => `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

export default function CompareVideos() {
    const { data: session } = useSession();
    const [url1, setUrl1] = useState('');
    const [analysis1, setAnalysis1] = useState('');
    const [inputMode1, setInputMode1] = useState<'url' | 'analysis'>('url');
    const [url2, setUrl2] = useState('');
    const [analysis2, setAnalysis2] = useState('');
    const [inputMode2, setInputMode2] = useState<'url' | 'analysis'>('url');
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [comparison, setComparison] = useState<Comparison | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (session) fetchAnalyses();
    }, [session]);

    const fetchAnalyses = async () => {
        try {
            const res = await fetch('/api/analyses');
            if (!res.ok) throw new Error('Failed to fetch analyses');
            const data = await res.json();
            setAnalyses(data.analyses || []);
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.message || 'Failed to fetch saved analyses',
                status: 'error',
                isClosable: true,
            });
        }
    };

    const handleCompare = async () => {
        if (!session) {
            toast({
                title: 'Authentication Required',
                description: 'Please sign in to compare videos',
                status: 'warning',
                isClosable: true,
            });
            return;
        }

        const hasInput1 = inputMode1 === 'url' ? !!url1 : !!analysis1;
        const hasInput2 = inputMode2 === 'url' ? !!url2 : !!analysis2;
        
        if (!hasInput1 || !hasInput2) {
            toast({
                title: 'Input Required',
                description: 'Please provide inputs for both videos',
                status: 'error',
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        setComparison(null);

        try {
            const res = await fetch('/api/compare-analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    video_url1: inputMode1 === 'url' ? url1 : '',
                    video_url2: inputMode2 === 'url' ? url2 : '',
                    analysis_id1: inputMode1 === 'analysis' ? analysis1 : '',
                    analysis_id2: inputMode2 === 'analysis' ? analysis2 : '',
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Comparison failed');
            }

            const data = await res.json();
            setComparison(data.comparison);
        } catch (err: any) {
            toast({
                title: 'Comparison Error',
                description: err.message || 'An error occurred',
                status: 'error',
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <Container maxW="container.xl" py={8}>
                <VStack spacing={8} align="stretch">
                    <Box textAlign="center" mb={8}>
                        <Heading size="xl" mb={3} bgGradient="linear(to-r, red.600, red.400)" bgClip="text">
                            Compare Video Analytics
                        </Heading>
                        <Text fontSize="lg" color="gray.500">
                            Analyze and compare comment sentiment, engagement patterns, and community insights across YouTube videos
                        </Text>
                    </Box>

                    <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
                        {/* Video 1 Card */}
                        <Card flex={1} bg="white" boxShadow="lg" borderRadius="xl" borderTop="4px solid" borderColor="red.500">
                            <CardBody>
                                <VStack spacing={5} align="stretch">
                                    <Badge alignSelf="start" colorScheme="red" px={3} py={1} borderRadius="full">
                                        VIDEO 1
                                    </Badge>
                                    
                                    <RadioGroup 
                                        value={inputMode1} 
                                        onChange={(v) => {
                                            setInputMode1(v as any);
                                            v === 'url' ? setAnalysis1('') : setUrl1('');
                                        }}
                                        mb={3}
                                    >
                                        <Stack direction="row" spacing={5}>
                                            <Radio value="url" colorScheme="red">Enter URL</Radio>
                                            <Radio value="analysis" colorScheme="red">Saved Analysis</Radio>
                                        </Stack>
                                    </RadioGroup>
                                    
                                    {inputMode1 === 'url' ? (
                                        <>
                                            <FormControl>
                                                <Input
                                                    placeholder="Paste YouTube URL here"
                                                    value={url1}
                                                    onChange={(e) => setUrl1(e.target.value)}
                                                    size="lg"
                                                    focusBorderColor="red.500"
                                                    borderRadius="lg"
                                                />
                                            </FormControl>
                                            {url1 && extractVideoId(url1) && (
                                                <Box mt={2} borderRadius="lg" overflow="hidden" boxShadow="md">
                                                    <Image
                                                        src={getThumbnailUrl(extractVideoId(url1)!)}
                                                        alt="Video thumbnail"
                                                        objectFit="cover"
                                                    />
                                                </Box>
                                            )}
                                        </>
                                    ) : (
                                        <FormControl>
                                            <Box borderWidth={1} borderRadius="lg" p={3} bg="gray.50">
                                                {analysis1 ? (
                                                    <HStack spacing={3}>
                                                        <Image
                                                            src={getThumbnailUrl(analyses.find(a => a.id === analysis1)?.videoId || '')}
                                                            alt="Thumbnail"
                                                            boxSize="60px"
                                                            borderRadius="md"
                                                        />
                                                        <Text fontWeight="medium" isTruncated>
                                                            {analyses.find(a => a.id === analysis1)?.videoUrl}
                                                        </Text>
                                                    </HStack>
                                                ) : (
                                                    <Text color="gray.500">No analysis selected</Text>
                                                )}
                                            </Box>
                                            <Box mt={2} maxH="200px" overflowY="auto">
                                                {analyses.map((a) => (
                                                    <HStack 
                                                        key={a.id} 
                                                        p={2} 
                                                        borderRadius="md" 
                                                        bg={analysis1 === a.id ? 'red.50' : 'white'}
                                                        borderWidth={1}
                                                        borderColor={analysis1 === a.id ? 'red.200' : 'gray.100'}
                                                        cursor="pointer"
                                                        onClick={() => setAnalysis1(a.id)}
                                                        _hover={{ bg: 'gray.50' }}
                                                        mb={1}
                                                    >
                                                        <Image
                                                            src={getThumbnailUrl(a.videoId)}
                                                            alt="Thumbnail"
                                                            boxSize="150px"
                                                            borderRadius="sm"
                                                        />
                                                        <Text fontSize="sm" isTruncated flex={1}>
                                                            {a.videoUrl}
                                                        </Text>
                                                        {analysis1 === a.id && (
                                                            <Box color="red.500">
                                                                <MdCheck size={20} />
                                                            </Box>
                                                        )}
                                                    </HStack>
                                                ))}
                                                {analyses.length === 0 && (
                                                    <Center p={4} color="gray.500">
                                                        No saved analyses
                                                    </Center>
                                                )}
                                            </Box>
                                        </FormControl>
                                    )}
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* VS Separator */}
                        <Center flexShrink={0} position="relative" my={{ base: 2, lg: 0 }}>
                            <Box 
                                bg="red.500" 
                                color="white" 
                                px={4} 
                                py={2} 
                                borderRadius="full" 
                                fontWeight="bold"
                                fontSize="lg"
                                zIndex={1}
                            >
                                VS
                            </Box>
                            <Divider 
                                orientation="vertical" 
                                borderColor="red.200" 
                                borderWidth={2} 
                                position="absolute" 
                                height="100%"
                                display={{ base: 'none', lg: 'block' }}
                            />
                        </Center>

                        {/* Video 2 Card */}
                        <Card flex={1} bg="white" boxShadow="lg" borderRadius="xl" borderTop="4px solid" borderColor="blue.500">
                            <CardBody>
                                <VStack spacing={5} align="stretch">
                                    <Badge alignSelf="start" colorScheme="blue" px={3} py={1} borderRadius="full">
                                        VIDEO 2
                                    </Badge>
                                    
                                    <RadioGroup 
                                        value={inputMode2} 
                                        onChange={(v) => {
                                            setInputMode2(v as any);
                                            v === 'url' ? setAnalysis2('') : setUrl2('');
                                        }}
                                        mb={3}
                                    >
                                        <Stack direction="row" spacing={5}>
                                            <Radio value="url" colorScheme="blue">Enter URL</Radio>
                                            <Radio value="analysis" colorScheme="blue">Saved Analysis</Radio>
                                        </Stack>
                                    </RadioGroup>
                                    
                                    {inputMode2 === 'url' ? (
                                        <>
                                            <FormControl>
                                                <Input
                                                    placeholder="Paste YouTube URL here"
                                                    value={url2}
                                                    onChange={(e) => setUrl2(e.target.value)}
                                                    size="lg"
                                                    focusBorderColor="blue.500"
                                                    borderRadius="lg"
                                                />
                                            </FormControl>
                                            {url2 && extractVideoId(url2) && (
                                                <Box mt={2} borderRadius="lg" overflow="hidden" boxShadow="md">
                                                    <Image
                                                        src={getThumbnailUrl(extractVideoId(url2)!)}
                                                        alt="Video thumbnail"
                                                        objectFit="cover"
                                                    />
                                                </Box>
                                            )}
                                        </>
                                    ) : (
                                        <FormControl>
                                            <Box borderWidth={1} borderRadius="lg" p={3} bg="gray.50">
                                                {analysis2 ? (
                                                    <HStack spacing={3}>
                                                        <Image
                                                            src={getThumbnailUrl(analyses.find(a => a.id === analysis2)?.videoId || '')}
                                                            alt="Thumbnail"
                                                            boxSize="60px"
                                                            borderRadius="md"
                                                        />
                                                        <Text fontWeight="medium" isTruncated>
                                                            {analyses.find(a => a.id === analysis2)?.videoUrl}
                                                        </Text>
                                                    </HStack>
                                                ) : (
                                                    <Text color="gray.500">No analysis selected</Text>
                                                )}
                                            </Box>
                                            <Box mt={2} maxH="200px" overflowY="auto">
                                                {analyses.map((a) => (
                                                    <HStack 
                                                        key={a.id} 
                                                        p={2} 
                                                        borderRadius="md" 
                                                        bg={analysis2 === a.id ? 'blue.50' : 'white'}
                                                        borderWidth={1}
                                                        borderColor={analysis2 === a.id ? 'blue.200' : 'gray.100'}
                                                        cursor="pointer"
                                                        onClick={() => setAnalysis2(a.id)}
                                                        _hover={{ bg: 'gray.50' }}
                                                        mb={1}
                                                    >
                                                        <Image
                                                            src={getThumbnailUrl(a.videoId)}
                                                            alt="Thumbnail"
                                                            boxSize="50px"
                                                            borderRadius="sm"
                                                        />
                                                        <Text fontSize="sm" isTruncated flex={1}>
                                                            {a.videoUrl}
                                                        </Text>
                                                        {analysis2 === a.id && (
                                                            <Box color="blue.500">
                                                                <MdCheck size={20} />
                                                            </Box>
                                                        )}
                                                    </HStack>
                                                ))}
                                                {analyses.length === 0 && (
                                                    <Center p={4} color="gray.500">
                                                        No saved analyses
                                                    </Center>
                                                )}
                                            </Box>
                                        </FormControl>
                                    )}
                                </VStack>
                            </CardBody>
                        </Card>
                    </Flex>

                    <Center mt={6}>
                        <Button
                            onClick={handleCompare}
                            isLoading={loading}
                            loadingText="Analyzing..."
                            size="lg"
                            px={10}
                            py={6}
                            colorScheme="red"
                            borderRadius="full"
                            boxShadow="0 4px 16px rgba(255, 0, 0, 0.2)"
                            _hover={{ transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(255, 0, 0, 0.25)' }}
                            _active={{ transform: 'translateY(0)' }}
                        >
                            Compare Videos
                        </Button>
                    </Center>

                    {loading && (
                        <Center py={12}>
                            <VStack spacing={4}>
                                <Spinner size="xl" thickness="4px" color="red.500" />
                                <Text fontSize="lg" color="gray.600">
                                    Analyzing comments and generating insights...
                                </Text>
                            </VStack>
                        </Center>
                    )}

                    {comparison && (
                        <Card mt={8} bg="white" boxShadow="xl" borderRadius="2xl" overflow="hidden">
                            <Box bgGradient="linear(to-r, red.600, red.400)" p={4}>
                                <Heading size="md" color="white">Comparison Results</Heading>
                            </Box>
                            <CardBody>
                                <VStack spacing={8} align="stretch">
                                    <InsightSection 
                                        title="Sentiment Analysis" 
                                        content={comparison.sentiment_comparison} 
                                    />
                                    
                                    <InsightSection 
                                        title="Engagement Metrics" 
                                        content={comparison.engagement_comparison} 
                                    />
                                    
                                    <Box>
                                        <Heading size="sm" mb={4} color="gray.700">Key Topics Comparison</Heading>
                                        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
                                            <TopicList 
                                                title="Common Topics" 
                                                items={comparison.key_topics.common} 
                                                iconColor="green.500" 
                                            />
                                            <TopicList 
                                                title="Unique to Video 1" 
                                                items={comparison.key_topics.unique_to_video1} 
                                                iconColor="red.500" 
                                            />
                                            <TopicList 
                                                title="Unique to Video 2" 
                                                items={comparison.key_topics.unique_to_video2} 
                                                iconColor="blue.500" 
                                            />
                                        </Flex>
                                    </Box>
                                    
                                    <InsightSection 
                                        title="Comment Categories" 
                                        content={comparison.comment_categories_comparison} 
                                    />
                                    
                                    <InsightSection 
                                        title="Community Health" 
                                        content={comparison.community_health_comparison} 
                                    />
                                    
                                    <InsightSection 
                                        title="Additional Insights" 
                                        content={comparison.other_insights} 
                                    />
                                </VStack>
                            </CardBody>
                        </Card>
                    )}
                </VStack>
            </Container>
        </DashboardLayout>
    );
}

const InsightSection = ({ title, content }: { title: string; content: string }) => (
    <Box bg="gray.50" p={5} borderRadius="lg">
        <Heading size="sm" mb={3} color="gray.700">{title}</Heading>
        <Text lineHeight="tall">{content}</Text>
    </Box>
);

const TopicList = ({ title, items, iconColor }: { 
    title: string; 
    items: string[]; 
    iconColor: string 
}) => (
    <Box flex={1} minW="200px">
        <Heading size="xs" mb={2} color="gray.600">{title}</Heading>
        <List spacing={2}>
            {items.length > 0 ? (
                items.map((item, i) => (
                    <ListItem key={i} display="flex" alignItems="center">
                        <ListIcon as={MdCheck} color={iconColor} />
                        <Text fontSize="sm">{item}</Text>
                    </ListItem>
                ))
            ) : (
                <Text fontSize="sm" color="gray.500">No items</Text>
            )}
        </List>
    </Box>
);