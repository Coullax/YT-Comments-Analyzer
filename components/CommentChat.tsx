import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  List,
  ListItem,
  ListIcon,
  Divider,
  useToast,
  Badge,
  IconButton,
  Collapse,
  Tooltip,
  useColorModeValue,
  Flex,
  Spacer,
  Textarea,
  Avatar,
  Container,
  useDisclosure,
  Fade,
  ScaleFade,
  SlideFade,
  Icon,
  // keyframes,
  chakra,
  shouldForwardProp,
} from '@chakra-ui/react';
import { 
  MdQuestionAnswer, 
  MdComment, 
  MdSend,
  MdExpandMore,
  MdExpandLess,
  MdRefresh,
  MdInfo,
  MdSmartToy,
  MdPerson,
  MdInsights,
  MdTrendingUp,
  MdAutoAwesome,
} from 'react-icons/md';

// Animated gradient background
// const gradientAnimation = keyframes`
//   0% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
//   100% { background-position: 0% 50%; }
// `;

const AnimatedGradient = chakra(Box, {
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'animate',
});

interface ChatResponse {
  answer: string;
  relevant_comments: string[];
  confidence: string;
  additional_insights: string;
  error?: string;
}

interface CommentChatProps {
  analysisId: string;
  initialQuestion?: string;
}

export default function CommentChat({ analysisId, initialQuestion }: CommentChatProps) {
  const [question, setQuestion] = useState(initialQuestion || '');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<ChatResponse[]>([]);
  const [showDetails, setShowDetails] = useState<{ [key: number]: boolean }>({});
  const toast = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Modern color scheme
  const bgGradient = useColorModeValue(
    'linear(135deg, blue.50 0%, purple.50 25%, pink.50 50%, orange.50 75%, yellow.50 100%)',
    'linear(135deg, blue.900 0%, purple.900 25%, pink.900 50%, orange.900 75%, yellow.900 100%)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses]);

  // If initialQuestion is provided, automatically submit it
  useEffect(() => {
    if (initialQuestion) {
      handleSubmit(new Event('submit') as any);
    }
  }, [initialQuestion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || !analysisId) {
      toast({
        title: 'Oops! 🤔',
        description: !question.trim() 
          ? 'Please enter a question to get started' 
          : 'Missing analysis ID. Please try analyzing the video again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          analysis_id: analysisId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResponses(prev => [...prev, { ...data, userQuestion: question.trim() }]);
      setQuestion('');
      setShowDetails(prev => ({ ...prev, [responses.length]: false }));
      
      toast({
        title: 'Got it! ✨',
        description: 'Your insights are ready',
        status: 'success',
        duration: 2000,
        position: 'top',
      });
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Something went wrong 😅',
        description: error instanceof Error ? error.message : 'Failed to get response',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (index: number) => {
    setShowDetails(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return 'green';
      case 'medium':
        return 'orange';
      case 'low':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getConfidenceEmoji = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return '🎯';
      case 'medium':
        return '📊';
      case 'low':
        return '🤷';
      default:
        return '📈';
    }
  };

  return (
    <Container maxW="full" p={0}>
      <Card
        bg={cardBg}
        shadow="2xl"
        // borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          bgGradient: 'linear(90deg, blue.400, purple.400, pink.400, orange.400)',
          // animation: `${gradientAnimation} 3s ease infinite`,
          backgroundSize: '400% 400%',
        }}
      >
        <CardHeader pb={0}>
          <HStack spacing={4}>
            <Box
              p={3}
              bg="gradient-to-br from-blue-400 to-purple-500"
              borderRadius="2xl"
              color="blue"
              shadow="lg"
            >
              <Icon as={MdAutoAwesome} w={6} h={6} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="lg" color={textColor} fontWeight="bold">
                AI Chat Assistant
              </Heading>
              <Text color={mutedColor} fontSize="sm">
                Ask questions about comments and get AI-powered insights
              </Text>
            </VStack>
            <Spacer />
            <Tooltip 
              label="Get intelligent insights from comment analysis" 
              placement="left"
              hasArrow
            >
              <IconButton
                aria-label="Info"
                icon={<MdInfo />}
                size="md"
                variant="ghost"
                borderRadius="xl"
                color={mutedColor}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              />
            </Tooltip>
          </HStack>
        </CardHeader>

        <CardBody pt={6}>
          <VStack spacing={6} align="stretch" height="650px">
            {/* Chat Messages Container */}
            <Box 
              flex="1" 
              overflowY="auto" 
              borderRadius="2xl"
              bg={useColorModeValue('gray.50', 'gray.900')}
              border="1px solid"
              borderColor={borderColor}
              position="relative"
              css={{
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: useColorModeValue('gray.300', 'gray.600'),
                  borderRadius: '3px',
                },
              }}
            >
              {responses.length === 0 ? (
                <VStack spacing={6} align="center" justify="center" height="100%" p={8}>
                  <AnimatedGradient
                    w={20}
                    h={20}
                    borderRadius="3xl"
                    bgGradient={bgGradient}
                    // animation={`${gradientAnimation} 3s ease infinite`}
                    backgroundSize="400% 400%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={MdSmartToy} w={10} h={10} color="white" />
                  </AnimatedGradient>
                  <VStack spacing={3}>
                    <Heading size="md" color={textColor} textAlign="center">
                      Ready to explore insights! 🚀
                    </Heading>
                    <Text color={mutedColor} textAlign="center" maxW="md">
                      Ask me anything about the comments - sentiment analysis, trending topics, 
                      user feedback patterns, or specific insights you're looking for.
                    </Text>
                  </VStack>
                  <HStack spacing={2} flexWrap="wrap" justify="center">
                    <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={1}>
                      💭 Sentiment Analysis
                    </Badge>
                    <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={3} py={1}>
                      📈 Trending Topics
                    </Badge>
                    <Badge colorScheme="pink" variant="subtle" borderRadius="full" px={3} py={1}>
                      🎯 Key Insights
                    </Badge>
                  </HStack>
                </VStack>
              ) : (
                <VStack spacing={6} align="stretch" p={6}>
                  {responses.map((response, index) => (
                    <SlideFade key={index} in={true} offsetY="20px">
                      <VStack align="stretch" spacing={4}>
                        {/* User Question */}
                        <HStack align="start" spacing={4}>
                          <Avatar
                            size="sm"
                            bg="blue.500"
                            icon={<MdPerson />}
                            color="white"
                          />
                          <Box
                            bg="blue.500"
                            color="white"
                            p={4}
                            borderRadius="2xl"
                            borderTopLeftRadius="md"
                            maxW="70%"
                            shadow="md"
                          >
                            <Text fontWeight="medium">
                              {(response as any).userQuestion || 'Question'}
                            </Text>
                          </Box>
                        </HStack>

                        {/* AI Response */}
                        <HStack align="start" spacing={4} justify="flex-end">
                          <Box
                            bg={cardBg}
                            border="1px solid"
                            borderColor={borderColor}
                            p={5}
                            borderRadius="2xl"
                            borderTopRightRadius="md"
                            maxW="85%"
                            shadow="lg"
                            position="relative"
                          >
                            <Text color={textColor} lineHeight="1.6" mb={4}>
                              {response.answer}
                            </Text>
                            
                            <HStack spacing={3} mb={3}>
                              <Badge 
                                colorScheme={getConfidenceColor(response.confidence)}
                                variant="subtle"
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontSize="xs"
                                fontWeight="bold"
                              >
                                {getConfidenceEmoji(response.confidence)} {response.confidence} Confidence
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                leftIcon={showDetails[index] ? <MdExpandLess /> : <MdExpandMore />}
                                onClick={() => toggleDetails(index)}
                                borderRadius="xl"
                                fontSize="xs"
                                color={mutedColor}
                                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                              >
                                {showDetails[index] ? 'Hide' : 'Show'} Details
                              </Button>
                            </HStack>

                            <Collapse in={showDetails[index]} animateOpacity>
                              <VStack align="stretch" spacing={5} pt={4}>
                                {response.relevant_comments.length > 0 && (
                                  <Box>
                                    <HStack mb={3}>
                                      <Icon as={MdComment} color="blue.500" />
                                      <Text fontWeight="bold" color={textColor}>
                                        Supporting Comments
                                      </Text>
                                    </HStack>
                                    <VStack spacing={3} align="stretch">
                                      {response.relevant_comments.map((comment, idx) => (
                                        <Box
                                          key={idx}
                                          p={4}
                                          bg={useColorModeValue('blue.50', 'blue.900')}
                                          borderRadius="xl"
                                          borderLeft="4px solid"
                                          borderLeftColor="blue.400"
                                        >
                                          <Text fontSize="sm" color={textColor}>
                                            "{comment}"
                                          </Text>
                                        </Box>
                                      ))}
                                    </VStack>
                                  </Box>
                                )}

                                {response.additional_insights && (
                                  <Box>
                                    <HStack mb={3}>
                                      <Icon as={MdInsights} color="purple.500" />
                                      <Text fontWeight="bold" color={textColor}>
                                        Additional Insights
                                      </Text>
                                    </HStack>
                                    <Box
                                      p={4}
                                      bg={useColorModeValue('purple.50', 'purple.900')}
                                      borderRadius="xl"
                                      borderLeft="4px solid"
                                      borderLeftColor="purple.400"
                                    >
                                      <Text fontSize="sm" color={textColor}>
                                        {response.additional_insights}
                                      </Text>
                                    </Box>
                                  </Box>
                                )}
                              </VStack>
                            </Collapse>
                          </Box>
                          <Avatar
                            size="sm"
                            bg="gradient-to-br from-purple-400 to-pink-400"
                            icon={<MdSmartToy />}
                            color="white"
                          />
                        </HStack>
                        
                        {index < responses.length - 1 && (
                          <Divider borderColor={borderColor} opacity={0.6} />
                        )}
                      </VStack>
                    </SlideFade>
                  ))}
                  <div ref={chatEndRef} />
                </VStack>
              )}
            </Box>

            {/* Input Form */}
            <Box
              as="form"
              onSubmit={handleSubmit}
              bg={cardBg}
              borderRadius="2xl"
              border="1px solid"
              borderColor={borderColor}
              p={2}
              shadow="lg"
            >
              <HStack spacing={3}>
                <Textarea
                  placeholder="Ask anything about the comments... 💭"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  isDisabled={loading}
                  resize="none"
                  rows={2}
                  border="none"
                  _focus={{ boxShadow: 'none' }}
                  fontSize="md"
                  color={textColor}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <IconButton
                  type="submit"
                  aria-label="Send message"
                  icon={<MdSend />}
                  isLoading={loading}
                  colorScheme="blue"
                  size="lg"
                  borderRadius="xl"
                  isDisabled={!question.trim()}
                  bg="gradient-to-r from-blue-500 to-purple-500"
                  color="blue"
                  _hover={{
                    bg: "gradient-to-r from-blue-600 to-purple-600",
                    transform: "translateY(-1px)",
                    shadow: "xl"
                  }}
                  _active={{
                    transform: "translateY(0px)"
                  }}
                  transition="all 0.2s"
                />
              </HStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}