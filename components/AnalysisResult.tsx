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
  Container,
  Avatar,
  AvatarGroup,
  Center,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useBreakpointValue,
  Stack,
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
  MdAnalytics,
  MdShowChart,
  MdComment,
  MdVisibility,
  MdShare,
  MdChatBubble,
  MdRobot,
  MdAlert,
} from 'react-icons/md';
import { IconType } from 'react-icons';
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
  fetched_comments: number;
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
  botComments: Array<{
    text: string;
    author: string;
  }>;
  scamComments: Array<{
    text: string;
    author: string;
  }>;
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
  let color = 'gray';
  let text = 'Neutral';
  let icon = MdSentimentNeutral;

  if (polarity > 0.3) {
    color = 'green';
    text = 'Positive';
    icon = MdSentimentSatisfied;
  } else if (polarity < -0.3) {
    color = 'red';
    text = 'Negative';
    icon = MdSentimentDissatisfied;
  }

  return (
      <Badge
          colorScheme={color}
          variant="subtle"
          px={3}
          py={1}
          borderRadius="full"
          fontWeight="semibold"
          fontSize="xs"
          display="flex"
          alignItems="center"
          gap={1}
      >
        <Icon as={icon} boxSize={3} />
        {text}
      </Badge>
  );
};

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const GlassmorphicCard = ({ children, ...props }: any) => (
    <Card
        bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)')}
        backdropFilter="blur(20px)"
        borderWidth="1px"
        borderColor={useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)')}
        shadow="2xl"
        borderRadius="2xl"
        overflow="hidden"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          bgGradient: 'linear(to-r, transparent, rgba(255,255,255,0.4), transparent)',
        }}
        {...props}
    >
      {children}
    </Card>
);

const AnimatedStat = ({ label, value, icon, color, gradient }: {
  label: string;
  value: number;
  icon: IconType;
  color: string;
  gradient: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const increment = value / 20;
      const counter = setInterval(() => {
        start += increment;
        if (start >= value) {
          setDisplayValue(value);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 50);
    }, 200);
    return () => clearTimeout(timer);
  }, [value]);

  return (
      <GlassmorphicCard
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          transition={{ duration: 0.5 }}
      >
        <CardBody p={6}>
          <VStack spacing={4} align="center">
            <Box
                p={4}
                borderRadius="full"
                bgGradient={gradient}
                color="white"
                shadow="lg"
            >
              <Icon as={icon} boxSize={8} />
            </Box>
            <VStack spacing={1} align="center">
              <Text
                  fontSize="3xl"
                  fontWeight="bold"
                  bgGradient={gradient}
                  bgClip="text"
                  lineHeight="1"
              >
                {displayValue.toLocaleString()}
              </Text>
              <Text
                  fontSize="sm"
                  color={useColorModeValue('gray.600', 'gray.400')}
                  fontWeight="medium"
                  textAlign="center"
              >
                {label}
              </Text>
            </VStack>
          </VStack>
        </CardBody>
      </GlassmorphicCard>
  );
};

const ModernVisualizationCard = ({ title, children, icon }: { title: string; children: React.ReactNode; icon: IconType }) => (
    <GlassmorphicCard
        as={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
    >
      <CardHeader pb={2}>
        <HStack spacing={3}>
          <Box
              p={2}
              borderRadius="lg"
              bgGradient="linear(135deg, blue.400, purple.500)"
              color="white"
          >
            <Icon as={icon} boxSize={5} />
          </Box>
          <Heading size="md" color={useColorModeValue('gray.800', 'white')}>
            {title}
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        {children}
      </CardBody>
    </GlassmorphicCard>
);

const AnimatedPieChart = ({ data }: { data: any }) => (
    <Box height="500px" position="relative">
      <ResponsivePie
          data={data}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.6}
          padAngle={1}
          cornerRadius={8}
          activeOuterRadiusOffset={12}
          borderWidth={0}
          colors={{ scheme: 'category10' }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor={useColorModeValue('#333', '#fff')}
          arcLinkLabelsThickness={3}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor="white"
          enableArcLinkLabels={true}
          motionConfig="gentle"
      />
    </Box>
);

const AnimatedBarChart = ({ data }: { data: any }) => (
    <Box height="400px" position="relative">
      <ResponsiveBar
          data={data}
          keys={['value']}
          indexBy="category"
          margin={{ top: 50, right: 60, bottom: 80, left: 80 }}
          padding={0.4}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'nivo' }}
          borderRadius={8}
          borderWidth={0}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 15,
            tickRotation: -45,
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 15,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor="white"
          animate={true}
          motionConfig="gentle"
      />
    </Box>
);

const CommentCard = ({ comment, index, onDiscuss }: { comment: Comment; index: number; onDiscuss: (comment: Comment) => void }) => (
    <MotionCard
        as={motion.div}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        bg={useColorModeValue('white', 'gray.800')}
        shadow="lg"
        borderRadius="xl"
        overflow="hidden"
        borderWidth="1px"
        borderColor={useColorModeValue('gray.100', 'gray.700')}
    >
      <CardBody p={6}>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" align="start">
            <HStack spacing={3}>
              <Avatar size="sm" name={comment.author} bg="blue.500" />
              <VStack align="start" spacing={0}>
                <Text fontWeight="semibold" fontSize="sm" color={useColorModeValue('gray.800', 'white')}>
                  {comment.author}
                </Text>
                <HStack spacing={1}>
                  <Icon as={MdThumbUp} boxSize={3} color="gray.400" />
                  <Text fontSize="xs" color="gray.500">{comment.likes}</Text>
                </HStack>
              </VStack>
            </HStack>
            <SentimentBadge polarity={comment.sentiment?.polarity || 0} />
          </HStack>

          <Text
              fontSize="md"
              lineHeight="1.6"
              color={useColorModeValue('gray.700', 'gray.300')}
          >
            {comment.text}
          </Text>

          <HStack justify="space-between" pt={2}>
            <Button
                size="sm"
                leftIcon={<MdChat />}
                onClick={() => onDiscuss(comment)}
                colorScheme="blue"
                variant="ghost"
                borderRadius="full"
                _hover={{ bg: 'blue.50' }}
            >
              Discuss
            </Button>
            {comment.publishedAt && (
                <Text fontSize="xs" color="gray.400">
                  {new Date(comment.publishedAt).toLocaleDateString()}
                </Text>
            )}
          </HStack>

          {comment.replies && comment.replies.length > 0 && (
              <Box ml={6} pt={3} borderLeft="2px solid" borderColor="gray.200" pl={4}>
                <VStack align="stretch" spacing={3}>
                  {comment.replies.slice(0, 3).map((reply, replyIndex) => (
                      <HStack key={replyIndex} spacing={3} align="start">
                        <Avatar size="xs" name={reply.author} bg="gray.400" />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontSize="xs" fontWeight="medium" color="gray.600">
                            {reply.author}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {reply.text}
                          </Text>
                        </VStack>
                        <SentimentBadge polarity={reply.sentiment?.polarity || 0} />
                      </HStack>
                  ))}
                  {comment.replies.length > 3 && (
                      <Text fontSize="xs" color="gray.500" ml={6}>
                        +{comment.replies.length - 3} more replies
                      </Text>
                  )}
                </VStack>
              </Box>
          )}
        </VStack>
      </CardBody>
    </MotionCard>
);

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
              onClick={() => alert(`Zoom feature for ${vizType} coming soon!`)}
              colorScheme="blue"
          />
        </Tooltip>
      </Box>
  );
};

export default function AnalysisResult({
                                         comments = [],
                                         statistics = { total_comments: 0, total_likes: 0, average_likes: 0, fetched_comments: 0 },
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
                                           botComments: [],
                                           scamComments: [],
                                         },
                                         analysisId = '',
                                       }: AnalysisResultProps) {
  const bgGradient = useColorModeValue(
      'linear(135deg, #667eea 0%, #764ba2 100%)',
      'linear(135deg, #1a202c 0%, #2d3748 100%)'
  );

  const [activeTab, setActiveTab] = useState(0);
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 6;
  const isMobile = useBreakpointValue({ base: true, md: false });

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const totalPages = Math.ceil(comments.length / commentsPerPage);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const sentimentData = [
    {
      id: 'Positive',
      label: 'Positive',
      value: ai_analysis.sentiment_distribution.positive,
      color: '#48BB78',
    },
    {
      id: 'Neutral',
      label: 'Neutral',
      value: ai_analysis.sentiment_distribution.neutral,
      color: '#A0AEC0',
    },
    {
      id: 'Negative',
      label: 'Negative',
      value: ai_analysis.sentiment_distribution.negative,
      color: '#F56565',
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

  const getSentimentIcon = (sentiment: string | undefined) => {
    switch (sentiment?.toLowerCase()) {
      case 'predominantly positive':
        return MdSentimentSatisfied;
      case 'predominantly negative':
        return MdSentimentDissatisfied;
      default:
        return MdSentimentNeutral;
    }
  };

  const openCommentDiscussion = (comment: Comment) => {
    setSelectedComment(comment);
    onModalOpen();
  };

  return (
      <Box
          minH="100vh"
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
          }}
      >
        <Container maxW="8xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Box textAlign="center" py={8}>
              <chakra.h1
                  fontSize={{ base: '3xl', md: '5xl' }}
                  fontWeight="bold"
                  color="white"
                  mb={4}
                  textShadow="2xl"
              >
                Video Analysis Dashboard
              </chakra.h1>
              <Text fontSize="xl" color="whiteAlpha.800" maxW="2xl" mx="auto">
                AI-powered insights from your YouTube video comments
              </Text>
            </Box>

            {/* Modern Tab System */}
            <GlassmorphicCard>
              <Tabs
                  variant="soft-rounded"
                  colorScheme="blue"
                  onChange={(index) => setActiveTab(index)}
              >
                <TabList
                    p={2}
                    bg={useColorModeValue('gray.50', 'gray.900')}
                    borderRadius="xl"
                    gap={2}
                    flexWrap="wrap"
                >
                  <Tab
                      _selected={{
                        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        shadow: 'lg'
                      }}
                      borderRadius="lg"
                      fontWeight="semibold"
                      px={6}
                      py={3}
                  >
                    <HStack spacing={2}>
                      <Icon as={MdAnalytics} />
                      <Text>Overview</Text>
                    </HStack>
                  </Tab>
                  <Tab
                      _selected={{
                        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        shadow: 'lg'
                      }}
                      borderRadius="lg"
                      fontWeight="semibold"
                      px={6}
                      py={3}
                  >
                    <HStack spacing={2}>
                      <Icon as={MdShowChart} />
                      <Text>Analysis</Text>
                    </HStack>
                  </Tab>
                  <Tab
                      _selected={{
                        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        shadow: 'lg'
                      }}
                      borderRadius="lg"
                      fontWeight="semibold"
                      px={6}
                      py={3}
                  >
                    <HStack spacing={2}>
                      <Icon as={MdComment} />
                      <Text>Comments</Text>
                    </HStack>
                  </Tab>
                  {analysisId && (
                      <Tab
                          _selected={{
                            bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            shadow: 'lg'
                          }}
                          borderRadius="lg"
                          fontWeight="semibold"
                          px={6}
                          py={3}
                      >
                        <HStack spacing={2}>
                          <Icon as={MdChat} />
                          <Text>Chat</Text>
                        </HStack>
                      </Tab>
                  )}
                </TabList>

                <TabPanels p={6}>
                  {/* Overview Panel */}
                  <TabPanel px={0}>
                    <VStack spacing={8} align="stretch">
                      {/* Stats Grid */}
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <AnimatedStat
                            label="Total Comments"
                            value={statistics.total_comments}
                            icon={MdComment}
                            color="blue.500"
                            gradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                        />
                        <AnimatedStat
                            label="Total Likes"
                            value={statistics.total_likes}
                            icon={MdThumbUp}
                            color="green.500"
                            gradient="linear(135deg, #56ab2f 0%, #a8e6cf 100%)"
                        />
                        <AnimatedStat
                            label="Average Likes"
                            value={Math.round(statistics.average_likes)}
                            icon={MdTrendingUp}
                            color="purple.500"
                            gradient="linear(135deg, #8360c3 0%, #2ebf91 100%)"
                        />
                      </SimpleGrid>

                      {/* Sentiment Chart */}
                      <ModernVisualizationCard title="Sentiment Distribution" icon={MdInsights}>
                        <AnimatedPieChart data={sentimentData} />
                      </ModernVisualizationCard>

                      {/* Community Health Overview */}
                      <ModernVisualizationCard title="Community Health" icon={MdPeople}>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                          <Center>
                            <VStack spacing={4}>
                              <Box
                                  p={4}
                                  borderRadius="full"
                                  bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                                  color="white"
                              >
                                <Icon as={getSentimentIcon(ai_analysis.overall_analysis.sentiment)} boxSize={8} />
                              </Box>
                              <VStack spacing={1}>
                                <Text fontWeight="bold" fontSize="lg">Sentiment</Text>
                                <Text color="gray.600" textAlign="center">
                                  {ai_analysis.overall_analysis.sentiment}
                                </Text>
                              </VStack>
                            </VStack>
                          </Center>
                          <Center>
                            <VStack spacing={4}>
                              <Box
                                  p={4}
                                  borderRadius="full"
                                  bgGradient="linear(135deg, #56ab2f 0%, #a8e6cf 100%)"
                                  color="white"
                              >
                                <Icon as={MdTrendingUp} boxSize={8} />
                              </Box>
                              <VStack spacing={1}>
                                <Text fontWeight="bold" fontSize="lg">Engagement</Text>
                                <Text color="gray.600" textAlign="center">
                                  {ai_analysis.overall_analysis.engagement_level}
                                </Text>
                              </VStack>
                            </VStack>
                          </Center>
                          <Center>
                            <VStack spacing={4}>
                              <Box
                                  p={4}
                                  borderRadius="full"
                                  bgGradient="linear(135deg, #8360c3 0%, #2ebf91 100%)"
                                  color="white"
                              >
                                <Icon as={MdPeople} boxSize={8} />
                              </Box>
                              <VStack spacing={1}>
                                <Text fontWeight="bold" fontSize="lg">Community</Text>
                                <Text color="gray.600" textAlign="center">
                                  {ai_analysis.overall_analysis.community_health}
                                </Text>
                              </VStack>
                            </VStack>
                          </Center>
                        </SimpleGrid>
                      </ModernVisualizationCard>
                    </VStack>
                  </TabPanel>

                  {/* Analysis Panel */}
                  <TabPanel px={0}>
                    <VStack spacing={8} align="stretch">
                      <ModernVisualizationCard title="Comment Categories" icon={MdCategory}>
                        <AnimatedBarChart data={categoryData} />
                      </ModernVisualizationCard>

                      {/* Key Topics */}
                      <ModernVisualizationCard title="Key Topics" icon={MdInsights}>
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                          {ai_analysis.key_topics.map((topic, index) => (
                              <GlassmorphicCard
                                  key={index}
                                  as={motion.div}
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                              >
                                <CardBody>
                                  <VStack spacing={3}>
                                    <Text fontWeight="bold" color="blue.500" textAlign="center">
                                      {topic.topic}
                                    </Text>
                                    <CircularProgress
                                        value={(topic.count / Math.max(...ai_analysis.key_topics.map(t => t.count), 1)) * 100}
                                        color="blue.400"
                                        thickness="8px"
                                        size="80px"
                                    >
                                      <CircularProgressLabel fontWeight="bold">
                                        {topic.count}
                                      </CircularProgressLabel>
                                    </CircularProgress>
                                  </VStack>
                                </CardBody>
                              </GlassmorphicCard>
                          ))}
                        </SimpleGrid>
                      </ModernVisualizationCard>

                      <ModernVisualizationCard title="Word Cloud" icon={MdInsights}>
                        {renderVisualization('wordcloud', visualizations.wordcloud)}
                      </ModernVisualizationCard>

                      <ModernVisualizationCard title="Sentiment Timeline" icon={MdInsights}>
                        {renderVisualization('sentiment_timeline', visualizations.sentiment_timeline)}
                      </ModernVisualizationCard>

                      {/* Bot and Scam Comments */}
                      <ModernVisualizationCard title="Bot and Scam Comments" icon={MdWarning}>
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                          <Box>
                            <Heading size="sm" mb={4} color="red.500">
                              🤖 Bot Comments
                            </Heading>
                            {ai_analysis.botComments.length > 0 ? (
                                <VStack spacing={3} align="stretch">
                                  {ai_analysis.botComments.map((comment, index) => (
                                      <Alert key={index} status="error" borderRadius="lg" variant="left-accent">
                                        <AlertIcon as={MdRobot} />
                                        <VStack align="start" spacing={1}>
                                          <Text fontSize="sm" fontWeight="medium">{comment.author}</Text>
                                          <Text fontSize="sm">{comment.text}</Text>
                                        </VStack>
                                      </Alert>
                                  ))}
                                </VStack>
                            ) : (
                                <Text color="gray.500">No bot comments detected</Text>
                            )}
                          </Box>
                          <Box>
                            <Heading size="sm" mb={4} color="orange.500">
                              ⚠️ Scam Comments
                            </Heading>
                            {ai_analysis.scamComments.length > 0 ? (
                                <VStack spacing={3} align="stretch">
                                  {ai_analysis.scamComments.map((comment, index) => (
                                      <Alert key={index} status="warning" borderRadius="lg" variant="left-accent">
                                        <AlertIcon as={MdAlert} />
                                        <VStack align="start" spacing={1}>
                                          <Text fontSize="sm" fontWeight="medium">{comment.author}</Text>
                                          <Text fontSize="sm">{comment.text}</Text>
                                        </VStack>
                                      </Alert>
                                  ))}
                                </VStack>
                            ) : (
                                <Text color="gray.500">No scam comments detected</Text>
                            )}
                          </Box>
                        </SimpleGrid>
                      </ModernVisualizationCard>

                      {/* Recommendations */}
                      <ModernVisualizationCard title="AI Recommendations" icon={MdCheckCircle}>
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                          {ai_analysis.positiveInsights?.length > 0 && (
                              <Box>
                                <Heading size="sm" mb={4} color="green.500">
                                  ✨ Positive Insights
                                </Heading>
                                <VStack spacing={3} align="stretch">
                                  {ai_analysis.positiveInsights.map((insight, index) => (
                                      <Alert key={index} status="success" borderRadius="lg" variant="left-accent">
                                        <AlertIcon />
                                        <AlertDescription fontSize="sm">{insight}</AlertDescription>
                                      </Alert>
                                  ))}
                                </VStack>
                              </Box>
                          )}

                          <Box>
                            <Heading size="sm" mb={4} color="orange.500">
                              🎯 Areas for Improvement
                            </Heading>
                            <VStack spacing={3} align="stretch">
                              {ai_analysis.recommendations.map((rec, index) => (
                                  <Alert key={index} status="warning" borderRadius="lg" variant="left-accent">
                                    <AlertIcon />
                                    <AlertDescription fontSize="sm">{rec}</AlertDescription>
                                  </Alert>
                              ))}
                            </VStack>
                          </Box>
                        </SimpleGrid>
                      </ModernVisualizationCard>
                    </VStack>
                  </TabPanel>

                  {/* Comments Panel */}
                  <TabPanel px={0}>
                    <VStack spacing={6} align="stretch">
                      <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <Heading size="lg" color={useColorModeValue('gray.800', 'white')}>
                            Comments Analysis
                          </Heading>
                          <Text color="gray.500">
                            Showing {indexOfFirstComment + 1}-{Math.min(indexOfLastComment, comments.length)} of {comments.length} comments
                          </Text>
                        </VStack>
                        {statistics?.fetched_comments && (
                            <Badge
                                fontSize="md"
                                colorScheme="blue"
                                variant="solid"
                                borderRadius="full"
                                px={4}
                                py={2}
                                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            >
                              {statistics.fetched_comments} Total Fetched
                            </Badge>
                        )}
                      </HStack>

                      {/* Comments Grid */}
                      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                        {comments
                            .slice(indexOfFirstComment, indexOfLastComment)
                            .map((comment, index) => (
                                <CommentCard
                                    key={index}
                                    comment={comment}
                                    index={index}
                                    onDiscuss={openCommentDiscussion}
                                />
                            ))}
                      </SimpleGrid>

                      {/* Pagination */}
                      {totalPages > 1 && (
                          <Center>
                            <HStack spacing={4}>
                              <Button
                                  onClick={prevPage}
                                  isDisabled={currentPage === 1}
                                  variant="outline"
                                  colorScheme="blue"
                                  borderRadius="full"
                                  leftIcon={<Icon as={MdExpandLess} transform="rotate(90deg)" />}
                              >
                                Previous
                              </Button>
                              <Text fontWeight="medium" color="gray.600">
                                {currentPage} of {totalPages}
                              </Text>
                              <Button
                                  onClick={nextPage}
                                  isDisabled={currentPage === totalPages}
                                  variant="outline"
                                  colorScheme="blue"
                                  borderRadius="full"
                                  rightIcon={<Icon as={MdExpandMore} transform="rotate(-90deg)" />}
                              >
                                Next
                              </Button>
                            </HStack>
                          </Center>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Chat Panel */}
                  {analysisId && (
                      <TabPanel px={0}>
                        <GlassmorphicCard>
                          <CommentChat analysisId={analysisId} />
                        </GlassmorphicCard>
                      </TabPanel>
                  )}
                </TabPanels>
              </Tabs>
            </GlassmorphicCard>
          </VStack>

          {/* Comment Discussion Modal */}
          <Modal isOpen={isModalOpen} onClose={onModalClose} size="2xl" isCentered>
            <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.600" />
            <ModalContent
                bg={useColorModeValue('white', 'gray.800')}
                borderRadius="2xl"
                shadow="2xl"
                mx={4}
            >
              <ModalHeader
                  borderTopRadius="2xl"
                  bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
              >
                <HStack spacing={3}>
                  <Icon as={MdChat} />
                  <Text>Discuss This Comment</Text>
                </HStack>
              </ModalHeader>
              <ModalCloseButton color="white" />
              <ModalBody p={6}>
                {selectedComment && (
                    <VStack spacing={6} align="stretch">
                      <GlassmorphicCard>
                        <CardBody>
                          <VStack align="start" spacing={4}>
                            <HStack spacing={3}>
                              <Avatar size="sm" name={selectedComment.author} bg="blue.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="semibold">{selectedComment.author}</Text>
                                <HStack spacing={2}>
                                  <Badge colorScheme="green" variant="subtle">
                                    {selectedComment.likes} likes
                                  </Badge>
                                  <SentimentBadge polarity={selectedComment.sentiment?.polarity || 0} />
                                </HStack>
                              </VStack>
                            </HStack>
                            <Text fontSize="lg" lineHeight="1.6">
                              {selectedComment.text}
                            </Text>
                          </VStack>
                        </CardBody>
                      </GlassmorphicCard>
                      <CommentChat
                          analysisId={analysisId}
                          initialQuestion={`What can you tell me about this comment: "${selectedComment.text}"?`}
                      />
                    </VStack>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        </Container>
      </Box>
  );
}