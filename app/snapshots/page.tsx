'use client';
import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Container,
  useColorModeValue,
  Spinner,
  Divider,
  Badge,
  IconButton,
  Tooltip,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Textarea,
  Flex,
  Spacer,
  useDisclosure,
  Collapse,
  Stack
} from '@chakra-ui/react';
import { 
  FaYoutube, 
  FaDownload, 
  FaClock, 
  FaImage, 
  FaPlay,
  FaLink,
  FaExclamationTriangle,
  FaTextHeight,
  FaRobot,
  FaChevronDown,
  FaChevronUp,
  FaPlayCircle,
  FaStopCircle,
  
} from 'react-icons/fa';
import { MdRefresh, MdSummarize } from 'react-icons/md';
import { BiTimeFive } from 'react-icons/bi';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';

function FrameExtractor() {
  const [url, setUrl] = useState('');
  const [time, setTime] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [frameUrl, setFrameUrl] = useState<any>(null);
  const [frameBlob, setFrameBlob] = useState(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [frameLoading, setFrameLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const toast = useToast();

  // Disclosure for collapsible sections
  const { isOpen: isTranscriptOpen, onToggle: onTranscriptToggle } = useDisclosure();
  const { isOpen: isAnalysisOpen, onToggle: onAnalysisToggle } = useDisclosure();

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const handleExtractFrame = async (e:any) => {
    e.preventDefault();
    setError(null);
    setFrameUrl(null);
    setFrameBlob(null);
    setFrameLoading(true);
    
    try {
      const response = await axios.post('/api/extract-frame', {
        youtube_url: url,
        time,
      }, {
        responseType: 'blob',
      });
      
      const imageBlob = response.data;
      const imageUrl = URL.createObjectURL(imageBlob);
      setFrameUrl(imageUrl);
      setFrameBlob(imageBlob);
      
      toast({
        title: 'Frame extracted successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError('Failed to extract frame. Please check the URL and time.');
      toast({
        title: 'Extraction failed',
        description: 'Please check the URL and time format.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setFrameLoading(false);
    }
  };

  const handleSummarizeVideo = async (e:any) => {
    e.preventDefault();
    setError(null);
    setSummaryData(null);
    setSummaryLoading(true);

    try {
      const response = await axios.post('/api/summarize-video', {
        youtube_url: url,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
      });

      setSummaryData(response.data);
      toast({
        title: 'Video summarized successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError('Failed to summarize video. Please check the URL and times.');
      toast({
        title: 'Summarization failed',
        description: 'Please check the URL and time format.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDownload = () => {
    if (!frameBlob) return;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(frameBlob);
    link.download = `youtube-frame-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    toast({
      title: 'Frame downloaded!',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleReset = () => {
    setUrl('');
    setTime('');
    setStartTime('');
    setEndTime('');
    setFrameUrl(null);
    setError(null);
    setFrameBlob(null);
    setSummaryData(null);
    if (frameUrl) {
      URL.revokeObjectURL(frameUrl);
    }
  };

  return (
    <DashboardLayout>
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="6xl">
          <VStack spacing={8}>
            {/* Header */}
            <Card bg={cardBg} shadow="lg" borderRadius="xl" w="100%">
              <CardHeader textAlign="center" pb={4}>
                <VStack spacing={3}>
                  <HStack>
                    <FaYoutube size={36} color="#FF0000" />
                    <Heading size="xl" bgGradient="linear(to-r, red.400, red.600)" bgClip="text">
                      YouTube Frame Extractor & Summarizer
                    </Heading>
                  </HStack>
                  <Text color="gray.500" fontSize="md">
                    Extract frames and generate AI-powered summaries from YouTube videos
                  </Text>
                </VStack>
              </CardHeader>
            </Card>

            {/* Main Input */}
            <Card bg={cardBg} shadow="lg" borderRadius="xl" w="100%">
              <CardBody>
                <VStack spacing={6}>
                  <FormControl>
                    <FormLabel>
                      <HStack>
                        <FaLink />
                        <Text fontWeight="semibold">YouTube URL</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=video_id"
                      bg={inputBg}
                      border="2px"
                      borderColor={borderColor}
                      _hover={{ borderColor: 'red.300' }}
                      _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px red.500' }}
                      size="lg"
                      required
                    />
                  </FormControl>

                  <Tabs variant="soft-rounded" colorScheme="red" w="100%">
                    <TabList>
                      <Tab><FaImage /> Frame Extraction</Tab>
                      <Tab><FaRobot /> Video Summarization</Tab>
                    </TabList>
                    
                    <TabPanels>
                      {/* Frame Extraction Tab */}
                      <TabPanel px={0}>
                        <VStack spacing={6}>
                          <FormControl>
                            <FormLabel>
                              <HStack>
                                <FaClock />
                                <Text>Frame Timestamp</Text>
                              </HStack>
                            </FormLabel>
                            <Input
                              type="text"
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                              placeholder="00:01:30 or 90"
                              bg={inputBg}
                              border="2px"
                              borderColor={borderColor}
                              _hover={{ borderColor: 'red.300' }}
                              _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px red.500' }}
                              size="lg"
                            />
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              Format: HH:MM:SS (e.g., 00:01:30) or seconds (e.g., 90)
                            </Text>
                          </FormControl>

                          <HStack spacing={4} w="100%">
                            <Button
                              onClick={handleExtractFrame}
                              colorScheme="red"
                              size="lg"
                              leftIcon={frameLoading ? <Spinner size="sm" /> : <FaPlay />}
                              isLoading={frameLoading}
                              loadingText="Extracting..."
                              flex={1}
                              bg="red.500"
                              _hover={{ bg: 'red.600' }}
                              _active={{ bg: 'red.700' }}
                            >
                              Extract Frame
                            </Button>
                            
                            <Tooltip label="Reset form">
                              <IconButton
                                icon={<MdRefresh />}
                                onClick={handleReset}
                                variant="outline"
                                colorScheme="gray"
                                size="lg"
                                aria-label="Reset form"
                              />
                            </Tooltip>
                          </HStack>
                        </VStack>
                      </TabPanel>

                      {/* Video Summarization Tab */}
                      <TabPanel px={0}>
                        <VStack spacing={6}>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                            <FormControl>
                              <FormLabel>
                                <HStack>
                                  <FaPlayCircle />
                                  <Text>Start Time (Optional)</Text>
                                </HStack>
                              </FormLabel>
                              <Input
                                type="text"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                placeholder="00:00:00 or 0"
                                bg={inputBg}
                                border="2px"
                                borderColor={borderColor}
                                _hover={{ borderColor: 'purple.300' }}
                                _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                                size="lg"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>
                                <HStack>
                                  <FaStopCircle />
                                  <Text>End Time (Optional)</Text>
                                </HStack>
                              </FormLabel>
                              <Input
                                type="text"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                placeholder="00:02:00 or 120"
                                bg={inputBg}
                                border="2px"
                                borderColor={borderColor}
                                _hover={{ borderColor: 'purple.300' }}
                                _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                                size="lg"
                              />
                            </FormControl>
                          </SimpleGrid>

                          <Button
                            onClick={handleSummarizeVideo}
                            colorScheme="purple"
                            size="lg"
                            leftIcon={summaryLoading ? <Spinner size="sm" /> : <MdSummarize />}
                            isLoading={summaryLoading}
                            loadingText="Summarizing..."
                            w="100%"
                            bg="purple.500"
                            _hover={{ bg: 'purple.600' }}
                            _active={{ bg: 'purple.700' }}
                          >
                            Summarize Video
                          </Button>
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </VStack>
              </CardBody>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert status="error" borderRadius="xl" shadow="md">
                <AlertIcon as={FaExclamationTriangle} />
                <Box>
                  <AlertTitle>Operation Failed!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Results Grid */}
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8} w="100%">
              {/* Frame Result */}
              {frameUrl && (
                <Card bg={cardBg} shadow="lg" borderRadius="xl">
                  <CardHeader>
                    <Flex align="center">
                      <HStack>
                        <FaImage />
                        <Heading size="md">Extracted Frame</Heading>
                        <Badge colorScheme="green" variant="subtle">
                          Ready
                        </Badge>
                      </HStack>
                      <Spacer />
                      <Button
                        leftIcon={<FaDownload />}
                        onClick={handleDownload}
                        colorScheme="blue"
                        size="sm"
                        disabled={!frameBlob}
                      >
                        Download
                      </Button>
                    </Flex>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Box textAlign="center">
                      <Image
                        src={frameUrl}
                        alt="Extracted Frame"
                        maxW="100%"
                        h="auto"
                        borderRadius="lg"
                        shadow="md"
                        border="2px"
                        borderColor={borderColor}
                      />
                    </Box>
                  </CardBody>
                </Card>
              )}

              {/* Summary Result */}
              {summaryData && (
                <Card bg={cardBg} shadow="lg" borderRadius="xl">
                  <CardHeader>
                    <HStack>
                      <FaRobot />
                      <Heading size="md">Video Summary</Heading>
                      <Badge colorScheme="purple" variant="subtle">
                        AI Generated
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      {/* Main Summary */}
                      <Box>
                        <HStack mb={3}>
                          <MdSummarize />
                          <Text fontWeight="bold" fontSize="lg">Summary</Text>
                        </HStack>
                        <Box
                          bg={useColorModeValue('gray.50', 'gray.700')}
                          p={4}
                          borderRadius="lg"
                          border="1px"
                          borderColor={borderColor}
                        >
                          <Text color={textColor}>{summaryData.summary}</Text>
                        </Box>
                      </Box>

                      {/* Collapsible Transcript */}
                      <Box>
                        <Button
                          variant="ghost"
                          onClick={onTranscriptToggle}
                        //   leftIcon={<FaFileText />}
                          rightIcon={isTranscriptOpen ? <FaChevronUp /> : <FaChevronDown />}
                          size="sm"
                          w="100%"
                          justifyContent="space-between"
                        >
                          <Text>Transcript</Text>
                        </Button>
                        <Collapse in={isTranscriptOpen} animateOpacity>
                          <Box
                            mt={2}
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            p={4}
                            borderRadius="lg"
                            border="1px"
                            borderColor={borderColor}
                            maxH="300px"
                            overflowY="auto"
                          >
                            <Text color={textColor} fontSize="sm" whiteSpace="pre-wrap">
                              {summaryData.transcript}
                            </Text>
                          </Box>
                        </Collapse>
                      </Box>

                      {/* Collapsible Analysis */}
                      <Box>
                        <Button
                          variant="ghost"
                          onClick={onAnalysisToggle}
                        //   leftIcon={<FaAnalytics />}
                          rightIcon={isAnalysisOpen ? <FaChevronUp /> : <FaChevronDown />}
                          size="sm"
                          w="100%"
                          justifyContent="space-between"
                        >
                          <Text>Analysis</Text>
                        </Button>
                        <Collapse in={isAnalysisOpen} animateOpacity>
                          <Box
                            mt={2}
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            p={4}
                            borderRadius="lg"
                            border="1px"
                            borderColor={borderColor}
                            maxH="300px"
                            overflowY="auto"
                          >
                            <Text color={textColor} fontSize="sm" whiteSpace="pre-wrap">
                              {summaryData.analysis}
                            </Text>
                          </Box>
                        </Collapse>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    </DashboardLayout>
  );
}

export default FrameExtractor;