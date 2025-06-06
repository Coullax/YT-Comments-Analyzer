import React, { useState } from 'react';
import {
  Box,
  Input,
  Button,
  VStack,
  useToast,
  Text,
} from '@chakra-ui/react';
import AnalysisResult from './AnalysisResult';

interface AnalysisData {
  comments: any[];
  statistics: {
    total_comments: number;
    total_likes: number;
    average_likes: number;
  };
  sentiment_visualization: string;
  ai_analysis: any;
}

export default function VideoForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analysisId, setAnalysisId] = useState<string>('');
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a YouTube URL',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      // Generate a unique analysis ID using timestamp and random string
      const newAnalysisId = `analysis_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('Generated new analysis ID:', newAnalysisId);

      const response = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: url.trim(),
          analysis_id: newAnalysisId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze video');
      }

      // Set the analysis ID first
      setAnalysisId(newAnalysisId);
      // Then set the analysis data
      setAnalysisData(data);

      console.log('Analysis completed successfully with ID:', newAnalysisId);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze video',
        status: 'error',
        duration: 5000,
      });
      setAnalysisData(null);
      setAnalysisId(''); // Clear analysis ID on error
    } finally {
      setLoading(false);
    }
  };

  // Clear everything when URL changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (analysisData || analysisId) {
      setAnalysisData(null);
      setAnalysisId('');
    }
  };

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <Input
            placeholder="Enter YouTube video URL"
            value={url}
            onChange={handleUrlChange}
            isDisabled={loading}
          />
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            width="full"
          >
            Analyze Comments
          </Button>
        </VStack>
      </form>

      {loading && <Text mt={4}>Analyzing video comments...</Text>}

      {analysisData && analysisId && (
        <Box mt={8}>
          <AnalysisResult
            comments={analysisData.comments}
            statistics={analysisData.statistics}
            sentiment_visualization={analysisData.sentiment_visualization}
            ai_analysis={analysisData.ai_analysis}
            analysisId={analysisId}
          />
        </Box>
      )}

      {/* Debug information */}
      {process.env.NODE_ENV === 'development' && (
        <Box mt={4} p={4} bg="gray.100" borderRadius="md">
          <Text fontWeight="bold">Debug Info:</Text>
          <Text>Analysis ID: {analysisId || 'None'}</Text>
          <Text>Has Analysis Data: {analysisData ? 'Yes' : 'No'}</Text>
        </Box>
      )}
    </Box>
  );
} 