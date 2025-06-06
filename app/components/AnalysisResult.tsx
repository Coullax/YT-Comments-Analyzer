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
  MdTrendingFlat
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
}

interface Statistics {
  total_comments: number;
  total_likes: number;
  average_likes: number;
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
}

interface AnalysisResultProps {
  comments: Comment[];
  statistics: Statistics;
  visualizations: string;
  ai_analysis: AIAnalysis;
  analysisId: string;
}

const SentimentBadge = ({ polarity }: { polarity: number }) => {
  let color = 'gray';
  let text = 'Neutral';

  if (polarity > 0.3) {
    color = 'green';
    text = 'Positive';
  } else if (polarity < -0.3) {
    color = 'red';
    text = 'Negative';
  }

  return <Badge colorScheme={color}>{text}</Badge>;
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
      initial={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <CardBody>
        <StatGroup>
          <Stat>
            <HStack>
              <Box color={color}>{icon}</Box>
              <StatLabel fontSize="lg">{label}</StatLabel>
            </HStack>
            <StatNumber id={`stat-value-${label}`} fontSize="3xl">{value}</StatNumber>
          </Stat>
        </StatGroup>
      </CardBody>
    </MotionCard>
  );
};

const AnimatedPieChart = ({ data }: { data: any }) => (
  <MotionBox
    height="400px"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
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
    height="400px"
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
  statistics = { total_comments: 0, total_likes: 0, average_likes: 0 },
  visualizations = '',
  ai_analysis = {
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
  },
  analysisId = '',
}: AnalysisResultProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  // Calculate percentages for sentiment distribution
  const totalSentiments = 
    ai_analysis.sentiment_distribution.positive +
    ai_analysis.sentiment_distribution.neutral +
    ai_analysis.sentiment_distribution.negative;
  
  const sentimentPercentages = {
    positive: ((ai_analysis.sentiment_distribution.positive / totalSentiments) * 100).toFixed(1),
    neutral: ((ai_analysis.sentiment_distribution.neutral / totalSentiments) * 100).toFixed(1),
    negative: ((ai_analysis.sentiment_distribution.negative / totalSentiments) * 100).toFixed(1),
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
    {
      category: 'High',
      value: ai_analysis.engagement_metrics.high_engagement,
    },
    {
      category: 'Medium',
      value: ai_analysis.engagement_metrics.medium_engagement,
    },
    {
      category: 'Low',
      value: ai_analysis.engagement_metrics.low_engagement,
    },
  ];

  const getSentimentIcon = (sentiment: string) => {
    switch(sentiment.toLowerCase()) {
      case 'predominantly positive':
        return MdSentimentSatisfied;
      case 'predominantly negative':
        return MdSentimentDissatisfied;
      default:
        return MdSentimentNeutral;
    }
  };

  return (
    <AnimatePresence>
      <Box>
        <Tabs 
          isFitted 
          variant="enclosed" 
          onChange={(index) => setActiveTab(index)}
          colorScheme="blue"
        >
          <TabList mb="1em">
            <Tab><HStack><MdInsights />Overview</HStack></Tab>
            <Tab><HStack><MdCategory />Analysis</HStack></Tab>
            <Tab><HStack><MdPeople />Comments</HStack></Tab>
            {analysisId && <Tab><HStack><MdChat />Chat</HStack></Tab>}
          </TabList>

          <TabPanels>
            {/* Overview Panel */}
            <TabPanel>
              <VStack spacing={6}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} width="full">
                  <AnimatedStat
                    label="Total Comments"
                    value={statistics.total_comments}
                    icon={<MdChat size={24} />}
                    color="blue.500"
                  />
                  <AnimatedStat
                    label="Total Likes"
                    value={statistics.total_likes}
                    icon={<MdThumbUp size={24} />}
                    color="green.500"
                  />
                  <AnimatedStat
                    label="Average Likes"
                    value={statistics.average_likes}
                    icon={<MdTrendingUp size={24} />}
                    color="purple.500"
                  />
                </SimpleGrid>

                <MotionCard
                  width="full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <CardHeader>
                    <Heading size="md">Sentiment Distribution</Heading>
                  </CardHeader>
                  <CardBody>
                    <AnimatedPieChart data={sentimentData} />
                  </CardBody>
                </MotionCard>

                {/* Community Health Card */}
                <MotionCard width="full">
                  <CardHeader>
                    <Heading size="md">Community Health Overview</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <VStack>
                        <Icon 
                          as={getSentimentIcon(ai_analysis.overall_analysis.sentiment)}
                          boxSize={12}
                          color="blue.500"
                        />
                        <Text fontWeight="bold">Sentiment</Text>
                        <Text>{ai_analysis.overall_analysis.sentiment}</Text>
                      </VStack>
                      <VStack>
                        <Icon as={MdTrendingUp} boxSize={12} color="green.500" />
                        <Text fontWeight="bold">Engagement</Text>
                        <Text>{ai_analysis.overall_analysis.engagement_level}</Text>
                      </VStack>
                      <VStack>
                        <Icon as={MdPeople} boxSize={12} color="purple.500" />
                        <Text fontWeight="bold">Community</Text>
                        <Text>{ai_analysis.overall_analysis.community_health}</Text>
                      </VStack>
                    </SimpleGrid>
                  </CardBody>
                </MotionCard>
              </VStack>
            </TabPanel>

            {/* Analysis Panel */}
            <TabPanel>
              <VStack spacing={6}>
                <MotionCard width="full">
                  <CardHeader>
                    <Heading size="md">Comment Categories</Heading>
                  </CardHeader>
                  <CardBody>
                    <AnimatedRadarChart data={categoryData} />
                  </CardBody>
                </MotionCard>

                <MotionCard width="full">
                  <CardHeader>
                    <Heading size="md">Engagement Distribution</Heading>
                  </CardHeader>
                  <CardBody>
                    <AnimatedBarChart data={engagementData} />
                  </CardBody>
                </MotionCard>

                {/* Key Topics */}
                <MotionCard width="full">
                  <CardHeader>
                    <Heading size="md">Key Topics</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      {ai_analysis.key_topics.map((topic, index) => (
                        <MotionCard key={index} variant="outline">
                          <CardBody>
                            <VStack>
                              <Text fontWeight="bold">{topic.topic}</Text>
                              <CircularProgress 
                                value={(topic.count / Math.max(...ai_analysis.key_topics.map(t => t.count))) * 100} 
                                color="blue.400"
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

                {/* Recommendations */}
                <MotionCard width="full">
                  <CardHeader>
                    <Heading size="md">Recommendations</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box>
                        <Heading size="sm" mb={4} color="green.500">Positive Insights</Heading>
                        <List spacing={3}>
                          {ai_analysis.recommendations
                            .filter(rec => rec.startsWith('Positive:'))
                            .map((rec, index) => (
                              <ListItem key={index}>
                                <HStack>
                                  <ListIcon as={MdCheckCircle} color="green.500" />
                                  <Text>{rec.replace('Positive:', '').trim()}</Text>
                                </HStack>
                              </ListItem>
                            ))}
                        </List>
                      </Box>
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
              </VStack>
            </TabPanel>

            {/* Comments Panel */}
            <TabPanel>
              <VStack spacing={4}>
                {comments.map((comment, index) => (
                  <MotionCard
                    key={index}
                    width="full"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <HStack width="full">
                          <Badge colorScheme="blue">{comment.author}</Badge>
                          <Spacer />
                          <HStack>
                            <MdThumbUp />
                            <Text>{comment.likes}</Text>
                          </HStack>
                        </HStack>
                        <Text>{comment.text}</Text>
                        <HStack width="full">
                          <Badge
                            colorScheme={
                              comment.sentiment?.polarity > 0.3 ? 'green' :
                              comment.sentiment?.polarity < -0.3 ? 'red' : 'gray'
                            }
                          >
                            Sentiment: {comment.sentiment?.polarity.toFixed(2)}
                          </Badge>
                          <Spacer />
                          <Button
                            size="sm"
                            leftIcon={<MdChat />}
                            onClick={() => {
                              setSelectedComment(comment);
                              onModalOpen();
                            }}
                          >
                            Discuss
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </MotionCard>
                ))}
              </VStack>

              {/* Comment Discussion Modal */}
              <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Discuss Comment</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody pb={6}>
                    {selectedComment && (
                      <VStack align="start" spacing={4}>
                        <Card width="full" variant="outline">
                          <CardBody>
                            <Text>{selectedComment.text}</Text>
                            <HStack mt={2}>
                              <Badge colorScheme="blue">{selectedComment.author}</Badge>
                              <Badge colorScheme="green">
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
            </TabPanel>

            {/* Chat Panel */}
            {analysisId && (
              <TabPanel>
                <CommentChat analysisId={analysisId} />
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>

        {/* Debug information */}
        {process.env.NODE_ENV === 'development' && (
          <Box mt={4} p={2} bg="gray.50" borderRadius="md" fontSize="sm">
            <Text color="gray.600">Analysis ID: {analysisId || 'None'}</Text>
          </Box>
        )}
      </Box>
    </AnimatePresence>
  );
} 