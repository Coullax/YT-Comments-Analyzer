import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
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
  HStack,
  IconButton,
  Collapse,
  Tooltip,
  useColorModeValue,
  Flex,
  Spacer,
  Textarea,
} from '@chakra-ui/react';
import { 
  MdQuestionAnswer, 
  MdComment, 
  MdSend,
  MdExpandMore,
  MdExpandLess,
  MdRefresh,
  MdInfo,
} from 'react-icons/md';

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
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
        title: 'Error',
        description: !question.trim() 
          ? 'Please enter a question' 
          : 'Missing analysis ID. Please try analyzing the video again.',
        status: 'error',
        duration: 3000,
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

      setResponses(prev => [...prev, data]);
      setQuestion('');
      setShowDetails(prev => ({ ...prev, [responses.length]: false }));
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get response',
        status: 'error',
        duration: 5000,
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
        return 'yellow';
      case 'low':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Card>
      <CardHeader>
        <HStack>
          <Heading size="md">AI Chat Assistant</Heading>
          <Tooltip label="Ask questions about the comments and get AI-powered insights">
            <IconButton
              aria-label="Info"
              icon={<MdInfo />}
              size="sm"
              variant="ghost"
            />
          </Tooltip>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch" height="600px">
          {/* Chat Messages */}
          <Box 
            flex="1" 
            overflowY="auto" 
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
            p={4}
          >
            {responses.length === 0 ? (
              <VStack spacing={4} align="center" justify="center" height="100%">
                <MdQuestionAnswer size={48} color="gray" />
                <Text color="gray.500" textAlign="center">
                  Start asking questions about the comments!<br />
                  I can help you understand sentiment, trends, and insights.
                </Text>
              </VStack>
            ) : (
              <VStack spacing={4} align="stretch">
                {responses.map((response, index) => (
                  <Box key={index}>
                    {/* Question */}
                    <HStack 
                      bg="blue.50" 
                      p={3} 
                      borderRadius="md"
                      _dark={{ bg: 'blue.900' }}
                    >
                      <MdQuestionAnswer />
                      <Text fontWeight="bold">{question}</Text>
                    </HStack>

                    {/* Answer */}
                    <Box mt={2} p={3}>
                      <Text>{response.answer}</Text>
                      
                      <HStack mt={2} spacing={2}>
                        <Badge 
                          colorScheme={getConfidenceColor(response.confidence)}
                          variant="subtle"
                        >
                          Confidence: {response.confidence}
                        </Badge>
                        <IconButton
                          aria-label="Toggle details"
                          icon={showDetails[index] ? <MdExpandLess /> : <MdExpandMore />}
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleDetails(index)}
                        />
                      </HStack>

                      <Collapse in={showDetails[index]}>
                        <VStack align="stretch" mt={4} spacing={4}>
                          {response.relevant_comments.length > 0 && (
                            <Box>
                              <Text fontWeight="bold" mb={2}>Supporting Comments:</Text>
                              <List spacing={2}>
                                {response.relevant_comments.map((comment, idx) => (
                                  <ListItem key={idx}>
                                    <HStack align="start">
                                      <ListIcon as={MdComment} color="blue.500" mt={1} />
                                      <Text>{comment}</Text>
                                    </HStack>
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}

                          {response.additional_insights && (
                            <Box>
                              <Text fontWeight="bold" mb={2}>Additional Insights:</Text>
                              <Text color="gray.600" _dark={{ color: 'gray.300' }}>
                                {response.additional_insights}
                              </Text>
                            </Box>
                          )}
                        </VStack>
                      </Collapse>
                    </Box>
                    
                    {index < responses.length - 1 && (
                      <Divider my={4} borderColor={borderColor} />
                    )}
                  </Box>
                ))}
                <div ref={chatEndRef} />
              </VStack>
            )}
          </Box>

          {/* Input Form */}
          <form onSubmit={handleSubmit}>
            <HStack spacing={2}>
              <Textarea
                placeholder="Ask any question about the comments..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                isDisabled={loading}
                resize="none"
                rows={2}
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
                height="60px"
              />
            </HStack>
          </form>
        </VStack>
      </CardBody>
    </Card>
  );
} 