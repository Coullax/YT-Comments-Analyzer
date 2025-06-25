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
    Center,
    Spinner,
    List,
    ListItem,
    ListIcon,
    Image,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    HStack,
    RadioGroup,
    Radio,
    Stack,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { MdCheck, MdClose, MdArrowDropDown  } from 'react-icons/md';
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

// Utility function to extract videoId from YouTube URL
const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|embed|watch|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
};

export default function CompareVideos() {
    const { data: session, status } = useSession();
    const [url1, setUrl1] = useState('');
    const [analysis1, setAnalysis1] = useState('');
    const [inputMode1, setInputMode1] = useState<'url' | 'analysis'>('url');
    const [url2, setUrl2] = useState('');
    const [analysis2, setAnalysis2] = useState('');
    const [inputMode2, setInputMode2] = useState<'url' | 'analysis'>('url');
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [comparison, setComparison] = useState<Comparison | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    useEffect(() => {
        if (status === 'authenticated') {
            fetchAnalyses();
        }
    }, [status]);

    const fetchAnalyses = async () => {
        try {
            const response = await fetch('/api/analyses');
            if (!response.ok) {
                throw new Error('Failed to fetch analyses');
            }
            const data = await response.json();
            setAnalyses(data.analyses || []);
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.message || 'Failed to fetch saved analyses',
                status: 'error',
                duration: 5000,
            });
        }
    };

    const handleCompare = async () => {
        if (!session) {
            toast({
                title: 'Error',
                description: 'You must be signed in to compare videos',
                status: 'error',
                duration: 5000,
            });
            return;
        }

        // Validate inputs based on mode
        const hasInput1 = inputMode1 === 'url' ? !!url1 : !!analysis1;
        const hasInput2 = inputMode2 === 'url' ? !!url2 : !!analysis2;
        if (!hasInput1 || !hasInput2) {
            setError('Please provide a valid input for each video based on the selected mode');
            return;
        }

        setError(null);
        setLoading(true);
        setComparison(null);

        try {
            const response = await fetch('/api/compare-analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    video_url1: inputMode1 === 'url' ? url1 : '',
                    video_url2: inputMode2 === 'url' ? url2 : '',
                    analysis_id1: inputMode1 === 'analysis' ? analysis1 : '',
                    analysis_id2: inputMode2 === 'analysis' ? analysis2 : '',
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Comparison failed');
            }

            const data = await response.json();
            setComparison(data.comparison);
        } catch (err: any) {
            setError(err.message || 'An error occurred while comparing videos');
            toast({
                title: 'Error',
                description: err.message || 'An error occurred while comparing videos',
                status: 'error',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Get thumbnail URL for a video
    const getThumbnailUrl = (videoId: string) => `https://img.youtube.com/vi/${videoId}/default.jpg`;

    // Reset unused input when mode changes
    const handleInputMode1Change = (value: string) => {
        setInputMode1(value as 'url' | 'analysis');
        if (value === 'url') {
            setAnalysis1('');
        } else {
            setUrl1('');
        }
    };

    const handleInputMode2Change = (value: string) => {
        setInputMode2(value as 'url' | 'analysis');
        if (value === 'url') {
            setAnalysis2('');
        } else {
            setUrl2('');
        }
    };

    return (
        <DashboardLayout>
            <Container maxW="container.xl" py={8}>
                <VStack spacing={8} align="center">
                    <Box textAlign="center">
                        <Heading size="lg" mb={2} color="#FF0000">
                            Compare Two YouTube Videos
                        </Heading>
                        <Text color="gray.600">
                            Enter URLs or select saved analyses to compare video comments
                        </Text>
                    </Box>

                    <Card w="full" maxW="3xl">
                        <CardBody>
                            <VStack spacing={6}>
                                <FormControl>
                                    <FormLabel>Video 1</FormLabel>
                                    <RadioGroup onChange={handleInputMode1Change} value={inputMode1} mb={4}>
                                        <Stack direction="row" spacing={4}>
                                            <Radio value="url">Enter URL</Radio>
                                            <Radio value="analysis">Select Saved Analysis</Radio>
                                        </Stack>
                                    </RadioGroup>
                                    {inputMode1 === 'url' ? (
                                        <>
                                            <Input
                                                placeholder="Enter YouTube video URL"
                                                value={url1}
                                                onChange={(e) => setUrl1(e.target.value)}
                                                mb={2}
                                            />
                                            {url1 && extractVideoId(url1) && (
                                                <Image
                                                    src={getThumbnailUrl(extractVideoId(url1)!)}
                                                    alt="Video 1 thumbnail"
                                                    boxSize="120px"
                                                    objectFit="cover"
                                                    borderRadius="md"
                                                    mb={2}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <Menu>
                                            <MenuButton as={Button} rightIcon={<MdArrowDropDown  />} variant="outline" w="full" textAlign="left">
                                                {analysis1
                                                    ? analyses.find((a) => a.id === analysis1)?.videoUrl || 'Select saved analysis'
                                                    : 'Select saved analysis'}
                                            </MenuButton>
                                            <MenuList maxH="300px" overflowY="auto">
                                                {analyses.map((a) => (
                                                    <MenuItem
                                                        key={a.id}
                                                        onClick={() => setAnalysis1(a.id)}
                                                        isDisabled={analysis2 === a.id}
                                                    >
                                                        <HStack spacing={2}>
                                                            <Image
                                                                src={getThumbnailUrl(a.videoId)}
                                                                alt={`${a.videoUrl} thumbnail`}
                                                                boxSize="40px"
                                                                objectFit="cover"
                                                                borderRadius="sm"
                                                            />
                                                            <Text noOfLines={1} fontSize="sm">
                                                                {a.videoUrl}
                                                            </Text>
                                                        </HStack>
                                                    </MenuItem>
                                                ))}
                                                {analyses.length === 0 && (
                                                    <MenuItem isDisabled>No saved analyses available</MenuItem>
                                                )}
                                            </MenuList>
                                        </Menu>
                                    )}
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Video 2</FormLabel>
                                    <RadioGroup onChange={handleInputMode2Change} value={inputMode2} mb={4}>
                                        <Stack direction="row" spacing={4}>
                                            <Radio value="url">Enter URL</Radio>
                                            <Radio value="analysis">Select Saved Analysis</Radio>
                                        </Stack>
                                    </RadioGroup>
                                    {inputMode2 === 'url' ? (
                                        <>
                                            <Input
                                                placeholder="Enter YouTube video URL"
                                                value={url2}
                                                onChange={(e) => setUrl2(e.target.value)}
                                                mb={2}
                                            />
                                            {url2 && extractVideoId(url2) && (
                                                <Image
                                                    src={getThumbnailUrl(extractVideoId(url2)!)}
                                                    alt="Video 2 thumbnail"
                                                    boxSize="120px"
                                                    objectFit="cover"
                                                    borderRadius="md"
                                                    mb={2}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <Menu>
                                            <MenuButton as={Button} rightIcon={<MdArrowDropDown  />} variant="outline" w="full" textAlign="left">
                                                {analysis2
                                                    ? analyses.find((a) => a.id === analysis2)?.videoUrl || 'Select saved analysis'
                                                    : 'Select saved analysis'}
                                            </MenuButton>
                                            <MenuList maxH="300px" overflowY="auto">
                                                {analyses.map((a) => (
                                                    <MenuItem
                                                        key={a.id}
                                                        onClick={() => setAnalysis2(a.id)}
                                                        isDisabled={analysis1 === a.id}
                                                    >
                                                        <HStack spacing={2}>
                                                            <Image
                                                                src={getThumbnailUrl(a.videoId)}
                                                                alt={`${a.videoUrl} thumbnail`}
                                                                boxSize="40px"
                                                                objectFit="cover"
                                                                borderRadius="sm"
                                                            />
                                                            <Text noOfLines={1} fontSize="sm">
                                                                {a.videoUrl}
                                                            </Text>
                                                        </HStack>
                                                    </MenuItem>
                                                ))}
                                                {analyses.length === 0 && (
                                                    <MenuItem isDisabled>No saved analyses available</MenuItem>
                                                )}
                                            </MenuList>
                                        </Menu>
                                    )}
                                </FormControl>

                                {error && <Text color="red.500">{error}</Text>}

                                <Button
                                    onClick={handleCompare}
                                    isLoading={loading}
                                    loadingText="Comparing..."
                                    colorScheme="red"
                                    size="lg"
                                >
                                    Compare
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>

                    {loading && (
                        <Center p={8}>
                            <VStack spacing={4}>
                                <Spinner size="xl" color="#FF0000" />
                                <Text color="gray.600">Comparing videos...</Text>
                            </VStack>
                        </Center>
                    )}

                    {comparison && (
                        <Card w="full" maxW="3xl">
                            <CardBody>
                                <VStack spacing={6} align="start">
                                    <Heading size="md">Comparison Results</Heading>
                                    <Box>
                                        <Heading size="sm" mb={2}>Sentiment Comparison</Heading>
                                        <Text>{comparison.sentiment_comparison}</Text>
                                    </Box>
                                    <Box>
                                        <Heading size="sm" mb={2}>Engagement Comparison</Heading>
                                        <Text>{comparison.engagement_comparison}</Text>
                                    </Box>
                                    <Box>
                                        <Heading size="sm" mb={2}>Key Topics</Heading>
                                        <List spacing={1}>
                                            <ListItem>
                                                <ListIcon as={MdCheck} color="green.500" />
                                                Common: {comparison.key_topics.common.join(', ')}
                                            </ListItem>
                                            <ListItem>
                                                <ListIcon as={MdClose} color="red.500" />
                                                Unique to Video 1: {comparison.key_topics.unique_to_video1.join(', ')}
                                            </ListItem>
                                            <ListItem>
                                                <ListIcon as={MdClose} color="red.500" />
                                                Unique to Video 2: {comparison.key_topics.unique_to_video2.join(', ')}
                                            </ListItem>
                                        </List>
                                    </Box>
                                    <Box>
                                        <Heading size="sm" mb={2}>Comment Categories Comparison</Heading>
                                        <Text>{comparison.comment_categories_comparison}</Text>
                                    </Box>
                                    <Box>
                                        <Heading size="sm" mb={2}>Community Health Comparison</Heading>
                                        <Text>{comparison.community_health_comparison}</Text>
                                    </Box>
                                    <Box>
                                        <Heading size="sm" mb={2}>Other Insights</Heading>
                                        <Text>{comparison.other_insights}</Text>
                                    </Box>
                                </VStack>
                            </CardBody>
                        </Card>
                    )}
                </VStack>
            </Container>
        </DashboardLayout>
    );
}