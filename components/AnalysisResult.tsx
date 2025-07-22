import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  List,
  ListItem,
  ListIcon,
  Divider,
  useColorModeValue,
  SimpleGrid,
  IconButton,
  Collapse,
  Button,
  Tooltip,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Spacer,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Icon,
  chakra,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveRadar } from '@nivo/radar';
import {
  MdThumbUp,
  MdInsights,
  MdTrendingUp,
  MdWarning,
  MdCheckCircle,
  MdInfo,
  MdChat,
  MdExpandMore,
  MdExpandLess,
  MdZoomIn,
  MdPeople,
  MdSentimentSatisfied,
  MdSentimentDissatisfied,
  MdSentimentNeutral,
  MdCategory,
  MdTrendingFlat,
} from 'react-icons/md';
import CommentChat from './CommentChat';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Pie, Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

interface Comment {
  text: string;
  author: string;
  likes: number;
  sentiment: {
    polarity: number;
    subjectivity: number;
  };
  publishedAt?: string;
  replies?: Comment[];
}

interface Statistics {
  total_comments: number;
  total_likes: number;
  average_likes: number;
  fetched_comments:number;
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
}

interface AIAnalysis {
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
  futureImprovementsSuggests: string[];
}

interface Visualizations {
  sentiment_scatter?: string;
  engagement_distribution?: string;
  wordcloud?: string;
  sentiment_timeline?: string;
  category_distribution?: string;
}

interface AnalysisResultProps {
  comments: Comment[];
  statistics: Statistics;
  visualizations: Visualizations;
  ai_analysis: AIAnalysis;
  analysisId: string;
}

const SentimentBadge = ({ polarity }: { polarity: number }) => {
  let color = 'gray.500';
  let text = 'Neutral';

  if (polarity > 0.3) {
    color = 'green.400';
    text = 'Positive';
  } else if (polarity < -0.3) {
    color = 'red.400';
    text = 'Negative';
  }

  return (
    <Badge
      colorScheme={color}
      px={3}
      py={1}
      borderRadius="full"
      fontWeight="medium"
    >
      {text}
    </Badge>
  );
};

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const AnimatedStat = ({ label, value, icon, color }: { label: string; value: number; icon: React.ReactElement; color: string }) => {
  const { contextSafe } = useGSAP();

  useEffect(() => {
    const animate = contextSafe(() => {
      gsap.from(`#stat-${label}`, {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "elastic.out(1, 0.5)",
      });
      gsap.to(`#stat-value-${label}`, {
        duration: 2,
        scrambleText: { text: value.toString() },
        ease: "power1.out",
      });
    });

    animate();
  }, [value, label]);

  return (
    <MotionCard
      id={`stat-${label}`}
    // bg={useColorModeValue('white', 'gray.700')}
    // borderRadius="2xl"
    // initial={{ scale: 0.9 }}
    // whileHover={{ scale: 1.05, boxShadow: "xl" }}
    // transition={{ duration: 0.3 }}
    >
      <CardBody>
        <StatGroup>
          <Stat>
            <HStack spacing={4}>
              <Box color={color} fontSize="2xl">{icon}</Box>
              <StatLabel fontSize="lg" color="gray.600">{label}</StatLabel>
            </HStack>
            <StatNumber id={`stat-value-${label}`} fontSize="4xl" color={color}>{value}</StatNumber>
          </Stat>
        </StatGroup>
      </CardBody>
    </MotionCard>
  );
};

const AnimatedPieChart = ({ data }: { data: any }) => (
  <MotionBox
    height="600px"
    bg={useColorModeValue('whiteAlpha.800', 'gray.800')}
    borderRadius="xl"
    p={4}
  // initial={{ opacity: 0, scale: 0.8 }}
  // animate={{ opacity: 1, scale: 1 }}
  // transition={{ duration: 0.5 }}
  >
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={{ from: 'color', modifiers: [] }}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: 'color' }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
      defs={[
        {
          id: 'dots',
          type: 'patternDots',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.3)',
          size: 4,
          padding: 1,
          stagger: true
        },
      ]}
      fill={[{ match: '*', id: 'dots' }]}
      motionConfig="wobbly"
    />
  </MotionBox>
);

const AnimatedBarChart = ({ data }: { data: any }) => (
  <MotionBox
    height="400px"
    bg={useColorModeValue('whiteAlpha.800', 'gray.800')}
    borderRadius="xl"
    p={4}
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <ResponsiveBar
      data={data}
      keys={['value']}
      indexBy="category"
      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
      padding={0.3}
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      colors={{ scheme: 'nivo' }}
      borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
      animate={true}
      motionConfig="wobbly"
    />
  </MotionBox>
);

const AnimatedRadarChart = ({ data }: { data: any }) => (
  <MotionBox
    height="600px"
    bg={useColorModeValue('whiteAlpha.800', 'gray.800')}
    borderRadius="xl"
    p={4}
    initial={{ opacity: 0, rotate: -180 }}
    animate={{ opacity: 1, rotate: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    <ResponsiveRadar
      data={data}
      keys={['value']}
      indexBy="category"
      maxValue="auto"
      margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
      curve="linearClosed"
      borderWidth={2}
      borderColor={{ from: 'color' }}
      gridLevels={5}
      gridShape="circular"
      gridLabelOffset={36}
      enableDots={true}
      dotSize={10}
      dotColor={{ theme: 'background' }}
      dotBorderWidth={2}
      dotBorderColor={{ from: 'color' }}
      enableDotLabel={true}
      dotLabel="value"
      dotLabelYOffset={-12}
      colors={{ scheme: 'nivo' }}
      fillOpacity={0.25}
      blendMode="multiply"
      animate={true}
      motionConfig="wobbly"
    />
  </MotionBox>
);

export default function AnalysisResult({
  comments = [],
  statistics = { total_comments: 0, total_likes: 0, average_likes: 0, fetched_comments:0 },
  visualizations = {},
  ai_analysis = {
    sentiment_distribution: { positive: 0, neutral: 0, negative: 0 },
    comment_categories: { questions: 0, praise: 0, suggestions: 0, complaints: 0, general: 0 },
    engagement_metrics: { high_engagement: 0, medium_engagement: 0, low_engagement: 0 },
    key_topics: [],
    overall_analysis: { sentiment: 'Not available', engagement_level: 'Not available', community_health: 'Not available' },
    recommendations: [],
    positiveInsights: [],
    futureImprovementsSuggests: [],
  },
  analysisId = '',
}: AnalysisResultProps) {
  const bgGradient = useColorModeValue(
    'linear(to-br, gray.50, white)',
    'linear(to-br, gray.900, gray.800)'
  );
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isExpanded, setIsExpanded] = useState({ overview: true, analysis: true, comments: true });
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5; // Adjust as needed
  
  // Pagination calculations
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const totalPages = Math.ceil(comments.length / commentsPerPage);
  
  // Pagination handlers
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  // Calculate percentages for sentiment distribution
  const totalSentiments =
    ai_analysis.sentiment_distribution.positive +
    ai_analysis.sentiment_distribution.neutral +
    ai_analysis.sentiment_distribution.negative;

  const sentimentPercentages = {
    positive: totalSentiments > 0 ? ((ai_analysis.sentiment_distribution.positive / totalSentiments) * 100).toFixed(1) : '0.0',
    neutral: totalSentiments > 0 ? ((ai_analysis.sentiment_distribution.neutral / totalSentiments) * 100).toFixed(1) : '0.0',
    negative: totalSentiments > 0 ? ((ai_analysis.sentiment_distribution.negative / totalSentiments) * 100).toFixed(1) : '0.0',
  };

  // Prepare data for visualizations
  const sentimentData = [
    {
      id: 'Positive',
      label: 'Positive',
      value: ai_analysis.sentiment_distribution.positive,
      color: 'rgb(72, 187, 120)',
    },
    {
      id: 'Neutral',
      label: 'Neutral',
      value: ai_analysis.sentiment_distribution.neutral,
      color: 'rgb(160, 174, 192)',
    },
    {
      id: 'Negative',
      label: 'Negative',
      value: ai_analysis.sentiment_distribution.negative,
      color: 'rgb(245, 101, 101)',
    },
  ];

  const categoryData = Object.entries(ai_analysis.comment_categories).map(([key, value]) => ({
    category: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
  }));

  const engagementData = [
    { category: 'High', value: ai_analysis.engagement_metrics.high_engagement },
    { category: 'Medium', value: ai_analysis.engagement_metrics.medium_engagement },
    { category: 'Low', value: ai_analysis.engagement_metrics.low_engagement },
  ];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'predominantly positive':
        return MdSentimentSatisfied;
      case 'predominantly negative':
        return MdSentimentDissatisfied;
      default:
        return MdSentimentNeutral;
    }
  };

  const renderVisualization = (vizType: string, base64Data?: string) => {
    if (!base64Data) return <Text color="gray.500">No {vizType} data available</Text>;
    return (
      <Box position="relative" w="100%" h="800px">
        <Image
          src={`data:image/png;base64,${base64Data}`}
          alt={`${vizType} visualization`}
          w="full"
          h="full"
          objectFit="contain"
          borderRadius="xl"
        />
        <Tooltip label={`Zoom into ${vizType}`}>
          <IconButton
            aria-label={`Zoom ${vizType}`}
            icon={<MdZoomIn />}
            size="sm"
            position="absolute"
            top={2}
            right={2}
            onClick={() => alert(`Zoom feature for ${vizType} coming soon!`)} // Placeholder for zoom functionality
            colorScheme="blue"
          />
        </Tooltip>
      </Box>
    );
  };

  const toggleSection = (section: string) => {
    // @ts-ignore
    setIsExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <AnimatePresence>
      <Box
        bgGradient={bgGradient}
        minH="100vh"
        p={6}
        color={textColor}
      >
        <chakra.h1
          fontSize="4xl"
          fontWeight="bold"
          textAlign="center"
          mb={8}
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
          textShadow="1px 1px 2px rgba(0, 0, 0, 0.1)"
        >
          Video Analysis Dashboard
        </chakra.h1>

        <Tabs
          isFitted
          variant="soft-rounded"
          colorScheme="blue"
          borderRadius="xl"
          overflow="hidden"
          onChange={(index) => setActiveTab(index)}
        >
          <TabList mb={4}>
            <Tab _selected={{ bg: 'blue.500', color: 'white' }}><HStack className='pl-4'><MdInsights /> Overview</HStack>Overview</Tab>
            <Tab _selected={{ bg: 'blue.500', color: 'white' }}><HStack><MdCategory /> Analysis</HStack>Analysis</Tab>
            <Tab _selected={{ bg: 'blue.500', color: 'white' }}><HStack><MdPeople /> Comments</HStack>Comments</Tab>
            {analysisId && <Tab _selected={{ bg: 'blue.500', color: 'white' }}><HStack><MdChat /> Chat</HStack>Chat</Tab>}
          </TabList>

          <TabPanels>
            {/* Overview Panel */}
            <TabPanel>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <VStack spacing={6} align="stretch">
                  <Box
                    p={6}
                    bg={cardBg}
                    borderRadius="2xl"

                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                  >
                    <HStack justify="space-between" mb={4}>
                      <Heading size="md" color="blue.500">Quick Stats</Heading>
                      <IconButton
                        aria-label="Toggle Overview"
                        icon={isExpanded.overview ? <MdExpandLess /> : <MdExpandMore />}
                        onClick={() => toggleSection('overview')}
                        colorScheme="blue"
                        size="sm"
                      />
                    </HStack>
                    <Collapse in={isExpanded.overview} animateOpacity>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <AnimatedStat
                          label="Total Comments"
                          value={statistics.total_comments}
                          icon={<MdChat />}
                          color="blue.500"
                        />
                        <AnimatedStat
                          label="Total Likes"
                          value={statistics.total_likes}
                          icon={<MdThumbUp />}
                          color="green.500"
                        />
                        <AnimatedStat
                          label="Average Likes"
                          value={statistics.average_likes}
                          icon={<MdTrendingUp />}
                          color="purple.500"
                        />
                      </SimpleGrid>
                    </Collapse>
                  </Box>

                  <MotionCard
                    bg={cardBg}
                    borderRadius="2xl"

                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <CardHeader>
                      <Heading size="md" color="blue.500">Sentiment Breakdown</Heading>
                    </CardHeader>
                    <CardBody >
                      <AnimatedPieChart data={sentimentData} />
                    </CardBody>
                  </MotionCard>

                  <MotionCard
                    bg={cardBg}
                    borderRadius="2xl"

                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <CardHeader>
                      <Heading size="md" color="blue.500">Sentiment Scatter</Heading>
                    </CardHeader>
                    <CardBody>
                      {renderVisualization('sentiment_scatter', visualizations.sentiment_scatter)}
                    </CardBody>
                  </MotionCard>

                  <MotionCard
                    bg={cardBg}
                    borderRadius="2xl"

                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <CardHeader>
                      <Heading size="md" color="blue.500">Community Insights</Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <VStack align="center" spacing={2}>
                          <Icon as={getSentimentIcon(ai_analysis.overall_analysis.sentiment)} boxSize={12} color="blue.500" />
                          <Text fontWeight="bold">Sentiment</Text>
                          <Text>{ai_analysis.overall_analysis.sentiment}</Text>
                        </VStack>
                        <VStack align="center" spacing={2}>
                          <Icon as={MdTrendingUp} boxSize={12} color="green.500" />
                          <Text fontWeight="bold">Engagement</Text>
                          <Text>{ai_analysis.overall_analysis.engagement_level}</Text>
                        </VStack>
                        <VStack align="center" spacing={2}>
                          <Icon as={MdPeople} boxSize={12} color="purple.500" />
                          <Text fontWeight="bold">Community</Text>
                          <Text>{ai_analysis.overall_analysis.community_health}</Text>
                        </VStack>
                      </SimpleGrid>
                    </CardBody>
                  </MotionCard>
                </VStack>
              </MotionBox>
            </TabPanel>

            {/* Analysis Panel */}
            <TabPanel>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <VStack spacing={6} align="stretch">
                  <Box
                    p={6}
                    bg={cardBg}
                    borderRadius="2xl"

                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                  >
                    <HStack justify="space-between" mb={4}>
                      <Heading size="md" color="blue.500">Detailed Analysis</Heading>
                      <IconButton
                        aria-label="Toggle Analysis"
                        icon={isExpanded.analysis ? <MdExpandLess /> : <MdExpandMore />}
                        onClick={() => toggleSection('analysis')}
                        colorScheme="blue"
                        size="sm"
                      />
                    </HStack>
                    <Collapse in={isExpanded.analysis} animateOpacity>
                      <MotionCard bg={cardBg} borderRadius="2xl" >
                        <CardHeader>
                          <Heading size="md" color="blue.500">Categories</Heading>
                        </CardHeader>
                        <CardBody>
                          <AnimatedRadarChart data={categoryData} />
                          {renderVisualization('category_distribution', visualizations.category_distribution)}
                        </CardBody>
                      </MotionCard>

                      <MotionCard bg={cardBg} borderRadius="2xl" >
                        <CardHeader>
                          <Heading size="md" color="blue.500">Engagement</Heading>
                        </CardHeader>
                        <CardBody>
                          <AnimatedBarChart data={engagementData} />
                          {renderVisualization('engagement_distribution', visualizations.engagement_distribution)}
                        </CardBody>
                      </MotionCard>

                      <MotionCard bg={cardBg} borderRadius="2xl" >
                        <CardHeader>
                          <Heading size="md" color="blue.500">Word Cloud</Heading>
                        </CardHeader>
                        <CardBody>
                          {renderVisualization('wordcloud', visualizations.wordcloud)}
                        </CardBody>
                      </MotionCard>

                      <MotionCard bg={cardBg} borderRadius="2xl" >
                        <CardHeader>
                          <Heading size="md" color="blue.500">Sentiment Timeline</Heading>
                        </CardHeader>
                        <CardBody>
                          {renderVisualization('sentiment_timeline', visualizations.sentiment_timeline)}
                        </CardBody>
                      </MotionCard>

                      <MotionCard bg={cardBg} borderRadius="2xl" >
                        <CardHeader>
                          <Heading size="md" color="blue.500">Key Topics</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                            {ai_analysis.key_topics.map((topic, index) => (
                              <MotionCard
                                key={index}
                                variant="outline"
                                bg={cardBg}
                                borderRadius="xl"
                                whileHover={{ scale: 1.05, boxShadow: "md" }}
                              >
                                <CardBody>
                                  <VStack align="center">
                                    <Text fontWeight="bold" color="blue.500">{topic.topic}</Text>
                                    <CircularProgress
                                      value={(topic.count / Math.max(...ai_analysis.key_topics.map(t => t.count), 1)) * 100}
                                      color="blue.400"
                                      thickness="10px"
                                    >
                                      <CircularProgressLabel>{topic.count}</CircularProgressLabel>
                                    </CircularProgress>
                                  </VStack>
                                </CardBody>
                              </MotionCard>
                            ))}
                          </SimpleGrid>
                        </CardBody>
                      </MotionCard>

                      <MotionCard bg={cardBg} borderRadius="2xl">
                        <CardHeader>
                          <Heading size="md" color="blue.500">Recommendations</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            {/* Positive Insights - only show if there are any */}
                            {ai_analysis?.positiveInsights?.length > 0 && (
                                <Box>
                                  <Heading size="sm" mb={4} color="green.500">Positive Insights</Heading>
                                  <List spacing={3}>
                                    {ai_analysis.positiveInsights.map((rec, index) => (
                                        <ListItem key={index}>
                                          <HStack>
                                            <ListIcon as={MdCheckCircle} color="green.500" />
                                            <Text>{rec}</Text>
                                          </HStack>
                                        </ListItem>
                                    ))}
                                  </List>
                                </Box>
                            )}

                            {/* Areas for Improvement */}
                            <Box>
                              <Heading size="sm" mb={4} color="red.500">Areas for Improvement</Heading>
                              <List spacing={3}>
                                {ai_analysis.recommendations
                                    .filter(rec => rec.startsWith('Negative:') || !rec.startsWith('Positive:'))
                                    .map((rec, index) => (
                                        <ListItem key={index}>
                                          <HStack>
                                            <ListIcon
                                                as={rec.startsWith('Negative:') ? MdWarning : MdInfo}
                                                color={rec.startsWith('Negative:') ? "red.500" : "blue.500"}
                                            />
                                            <Text>{rec.replace('Negative:', '').trim()}</Text>
                                          </HStack>
                                        </ListItem>
                                    ))}
                              </List>
                            </Box>
                          </SimpleGrid>
                        </CardBody>
                      </MotionCard>
                      {ai_analysis?.futureImprovementsSuggests?.length > 0 && (<MotionCard bg={cardBg} borderRadius="2xl">
                        <CardHeader>
                          <Heading size="md" color="blue.500">Improvement Suggestions</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            {/* Positive Insights - only show if there are any */}
                                <Box>
                                  <List spacing={3}>
                                    {ai_analysis.futureImprovementsSuggests.map((rec, index) => (
                                        <ListItem key={index}>
                                          <HStack>
                                            <ListIcon as={MdInfo} color="red.500" />
                                            <Text>{rec}</Text>
                                          </HStack>
                                        </ListItem>
                                    ))}
                                  </List>
                                </Box>
                          </SimpleGrid>
                        </CardBody>
                      </MotionCard>)}
                    </Collapse>
                  </Box>
                </VStack>
              </MotionBox>
            </TabPanel>

            {/* Comments Panel */}
            <TabPanel>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Box
                  p={6}
                  bg={cardBg}
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                >
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md" color="blue.500">
                      Comment Thread
                    </Heading>
                    <HStack spacing={2}>
                      <Tooltip label="Total comments fetched" placement="top">
                        <Badge
                            fontSize="md"
                            colorScheme="blue"
                            variant="solid"
                            borderRadius="full"
                            px={3}
                            py={1}
                            boxShadow="sm"
                            _hover={{ transform: 'scale(1.05)', boxShadow: 'md' }}
                            transition="all 0.2s"
                        >
                          {statistics.fetched_comments}
                        </Badge>
                      </Tooltip>
                      <IconButton
                          aria-label="Toggle Comments"
                          icon={isExpanded.comments ? <MdExpandLess /> : <MdExpandMore />}
                          onClick={() => toggleSection('comments')}
                          colorScheme="blue"
                          size="sm"
                      />
                    </HStack>
                  </HStack>
                  <Collapse in={isExpanded.comments} animateOpacity>
                    <VStack spacing={4}>
                      {comments
                        .slice(indexOfFirstComment, indexOfLastComment)
                        .map((comment, index) => (
                          <MotionCard
                            key={index}
                            width="full"
                            bg={cardBg}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, boxShadow: "lg" }}
                          >
                            <CardBody>
                              <VStack align="start" spacing={3}>
                                <HStack width="full" justify="space-between">
                                  <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                                    {comment.author}
                                  </Badge>
                                  <HStack spacing={1}>
                                    <MdThumbUp />
                                    <Text fontWeight="medium">{comment.likes}</Text>
                                  </HStack>
                                </HStack>
                                <Text fontSize="md" color={textColor}>{comment.text}</Text>
                                <HStack width="full" justify="space-between">
                                  <SentimentBadge polarity={comment.sentiment?.polarity || 0} />
                                  <Button
                                    size="sm"
                                    leftIcon={<MdChat />}
                                    onClick={() => {
                                      setSelectedComment(comment);
                                      onModalOpen();
                                    }}
                                    colorScheme="teal"
                                    variant="outline"
                                  >
                                    Discuss
                                  </Button>
                                </HStack>
                                {comment.replies && comment.replies.length > 0 && (
                                  <Collapse in={true} animateOpacity>
                                    <VStack align="start" mt={2} pl={6} borderLeft="2px solid" borderColor="gray.300">
                                      {comment.replies.map((reply, replyIndex) => (
                                        <HStack key={replyIndex} width="full" spacing={4}>
                                          <Badge colorScheme="gray" px={2} py={1} borderRadius="full">
                                            {reply.author}
                                          </Badge>
                                          <Text flex={1} fontSize="sm" color={textColor}>{reply.text}</Text>
                                          <SentimentBadge polarity={reply.sentiment?.polarity || 0} />
                                        </HStack>
                                      ))}
                                    </VStack>
                                  </Collapse>
                                )}
                              </VStack>
                            </CardBody>
                          </MotionCard>
                        ))}
                      {/* Pagination Controls */}
                      <HStack justify="center" spacing={4} mt={4}>
                        <Button
                          onClick={prevPage}
                          isDisabled={currentPage === 1}
                          colorScheme="gray"
                          variant="outline"
                        >
                          Previous
                        </Button>
                        <Text>
                          Page {currentPage} of {totalPages}
                        </Text>
                        <Button
                          onClick={nextPage}
                          isDisabled={currentPage === totalPages}
                          colorScheme="gray"
                          variant="outline"
                        >
                          Next
                        </Button>
                      </HStack>
                    </VStack>
                  </Collapse>
                </Box>

                {/* Comment Discussion Modal */}
                <Modal isOpen={isModalOpen} onClose={onModalClose} size="2xl" isCentered>
                  <ModalOverlay backdropFilter="blur(10px)" />
                  <ModalContent bg={cardBg} borderRadius="2xl" >
                    <ModalHeader color="blue.500">Discuss This Comment</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                      {selectedComment && (
                        <VStack align="start" spacing={6}>
                          <Card width="full" bg={useColorModeValue('gray.50', 'gray.600')} borderRadius="xl" >
                            <CardBody>
                              <Text fontSize="lg" color={textColor}>{selectedComment.text}</Text>
                              <HStack mt={4} spacing={4}>
                                <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                                  {selectedComment.author}
                                </Badge>
                                <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                                  {selectedComment.likes} likes
                                </Badge>
                              </HStack>
                            </CardBody>
                          </Card>
                          <CommentChat
                            analysisId={analysisId}
                            initialQuestion={`What can you tell me about this comment: "${selectedComment.text}"?`}
                          />
                        </VStack>
                      )}
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </MotionBox>
            </TabPanel>

            {/* Chat Panel */}
            {analysisId && (
              <TabPanel>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Box
                    p={6}
                    bg={cardBg}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                  >
                    <CommentChat analysisId={analysisId} />
                  </Box>
                </MotionBox>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>

        {/* Debug information */}
        {/* {process.env.NODE_ENV === 'development' && (
          <Box
            mt={6}
            p={4}
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderRadius="xl"
            boxShadow="md"
          >
            <Text color="gray.600">Analysis ID: {analysisId || 'None'}</Text>
          </Box>
        )} */}
      </Box>
    </AnimatePresence>
  );
}