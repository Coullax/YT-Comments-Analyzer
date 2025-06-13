import os
from typing import List, Dict
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS
import time
import re
import traceback
import google.generativeai as genai
import json
from textblob import TextBlob
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Use Agg backend to avoid GUI issues
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from collections import Counter
import numpy as np
from wordcloud import WordCloud
from datetime import datetime
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

load_dotenv()

# Configure YouTube API
YOUTUBE_API_KEY = "AIzaSyAaCfO0i6W2K9NLgvU0h8NjQxAxPZ5qbF8"
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyB_5IyMabHG-YXtflNm35H2YrcQP4fCXNs')
genai.configure(api_key=GEMINI_API_KEY)

# Configure the model
generation_config = {
    "temperature": 0.7,
    "top_p": 0.8,
    "top_k": 40,
    "max_output_tokens": 2048,
}

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"}
]

# Initialize the model with fallback options
try:
    model = genai.GenerativeModel("gemini-2.0-flash-exp",
                                generation_config=generation_config)
    # Test the model
    response = model.generate_content("Test")
    if not response.text:
        raise Exception("Model returned empty response")
except Exception as e:
    print(f"Warning: Error with primary model configuration: {str(e)}")
    try:
        # Try with minimal configuration
        model = genai.GenerativeModel("gemini-2.0-flash-exp")
        response = model.generate_content("Test")
        if not response.text:
            raise Exception("Model returned empty response")
    except Exception as e:
        print(f"Error: Could not initialize model: {str(e)}")
        model = None

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store comments in memory for chat functionality
comment_store = {}

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"}), 200

def extract_video_id(url: str) -> str:
    """Extract video ID from various YouTube URL formats"""
    if "v=" in url:
        return url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    raise ValueError("Invalid YouTube URL")

def get_video_comments(video_url: str, max_retries: int = 3) -> List[Dict]:
    """Fetch comments and their replies using YouTube Data API"""
    video_id = extract_video_id(video_url)
    comments = []
    max_comments = 100000000000000000000000000000
    max_replies_per_comment = 100000000000000000000000000000

    for attempt in range(max_retries):
        try:
            # Get top-level comments from YouTube API
            request = youtube.commentThreads().list(
                part="snippet,replies",
                videoId=video_id,
                maxResults=min(max_comments, 100),  # API limit is 100 per request
                order="relevance",
                textFormat="plainText"
            )

            while request and len(comments) < max_comments:
                response = request.execute()
                
                for item in response['items']:
                    top_comment = item['snippet']['topLevelComment']['snippet']
                    comment_data = {
                        "text": top_comment['textDisplay'],
                        "author": top_comment['authorDisplayName'],
                        "likes": top_comment['likeCount'],
                        "publishedAt": top_comment['publishedAt'],
                        "replies": []
                    }
                    
                    # Fetch replies if they exist
                    if item['snippet']['totalReplyCount'] > 0 and 'replies' in item:
                        reply_request = youtube.comments().list(
                            part="snippet",
                            parentId=item['snippet']['topLevelComment']['id'],
                            maxResults=min(max_replies_per_comment, 100),  # API limit is 100 per request
                            textFormat="plainText"
                        )
                        reply_response = reply_request.execute()
                        for reply_item in reply_response['items']:
                            reply = reply_item['snippet']
                            comment_data['replies'].append({
                                "text": reply['textDisplay'],
                                "author": reply['authorDisplayName'],
                                "likes": reply['likeCount'],
                                "publishedAt": reply['publishedAt']
                            })
                            if len(comment_data['replies']) >= max_replies_per_comment:
                                break

                    comments.append(comment_data)
                    if len(comments) >= max_comments:
                        break

                # Get the next page of comments
                if 'nextPageToken' in response and len(comments) < max_comments:
                    request = youtube.commentThreads().list(
                        part="snippet,replies",
                        videoId=video_id,
                        maxResults=min(max_comments - len(comments), 100),
                        pageToken=response['nextPageToken'],
                        order="relevance",
                        textFormat="plainText"
                    )
                else:
                    break

            return comments

        except HttpError as e:
            if e.resp.status == 403:
                raise ValueError("Comments are disabled for this video or API quota exceeded")
            elif e.resp.status == 404:
                raise ValueError("Video not found")
            elif attempt == max_retries - 1:
                raise ValueError(f"Failed to fetch comments after {max_retries} attempts: {str(e)}")
            time.sleep(1)  # Wait before retry
        except Exception as e:
            if attempt == max_retries - 1:
                raise ValueError(f"Failed to fetch comments: {str(e)}")
            time.sleep(1)  # Wait before retry

    return []  # Return empty list if all attempts fail but don't raise error

def analyze_sentiment(text: str) -> Dict:
    """Analyze sentiment of text using TextBlob"""
    analysis = TextBlob(text)
    return {
        'polarity': round(analysis.sentiment.polarity, 2),
        'subjectivity': round(analysis.sentiment.subjectivity, 2)
    }

def create_sentiment_visualization(comments: List[Dict]) -> str:
    """Create sentiment visualization and return as base64 string"""
    # Extract sentiments for all comments and replies
    all_texts = [comment['text'] for comment in comments]
    for comment in comments:
        all_texts.extend(reply['text'] for reply in comment.get('replies', []))
    sentiments = [analyze_sentiment(text) for text in all_texts]
    df = pd.DataFrame(sentiments)
    
    # Create the plot
    plt.figure(figsize=(10, 6))
    plt.scatter(df['polarity'], df['subjectivity'], alpha=0.5)
    plt.xlabel('Polarity (Negative to Positive)')
    plt.ylabel('Subjectivity (Objective to Subjective)')
    plt.title('Comment Sentiment Analysis (Including Replies)')
    
    # Save plot to base64 string
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    
    return image_base64

def create_engagement_visualization(comments: List[Dict]) -> str:
    """Create engagement distribution visualization"""
    likes = [comment['likes'] for comment in comments]
    for comment in comments:
        likes.extend(reply['likes'] for reply in comment.get('replies', []))
    plt.figure(figsize=(10, 6))
    plt.hist(likes, bins=30, color='skyblue', edgecolor='black')
    plt.xlabel('Number of Likes')
    plt.ylabel('Frequency')
    plt.title('Comment Engagement Distribution (Including Replies)')
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    
    return image_base64

def create_wordcloud_visualization(comments: List[Dict]) -> str:
    """Create word cloud visualization from comments and replies"""
    all_texts = [comment['text'] for comment in comments]
    for comment in comments:
        all_texts.extend(reply['text'] for reply in comment.get('replies', []))
    text = ' '.join(all_texts)
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate(text)
    
    plt.figure(figsize=(10, 5))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    
    return image_base64

def create_sentiment_timeline(comments: List[Dict]) -> str:
    """Create sentiment over time visualization"""
    all_texts = [(comment['text'], i) for i, comment in enumerate(comments)]
    for comment in comments:
        all_texts.extend((reply['text'], i) for i, reply in enumerate(comment.get('replies', [])))
    # Sort by sequence index and extract sentiments
    sorted_texts = sorted(all_texts, key=lambda x: x[1])
    sentiments = [analyze_sentiment(text)['polarity'] for text, _ in sorted_texts]
    plt.figure(figsize=(12, 6))
    plt.plot(range(len(sentiments)), sentiments, marker='o', linestyle='-', alpha=0.6)
    plt.xlabel('Comment Sequence (Including Replies)')
    plt.ylabel('Sentiment Polarity')
    plt.title('Sentiment Timeline')
    plt.grid(True, alpha=0.3)
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    
    return image_base64

def create_category_distribution(ai_analysis: Dict) -> str:
    """Create category distribution visualization"""
    categories = ai_analysis['comment_categories']
    plt.figure(figsize=(10, 6))
    plt.bar(categories.keys(), categories.values(), color='lightcoral')
    plt.xlabel('Categories')
    plt.ylabel('Number of Comments')
    plt.title('Comment Category Distribution')
    plt.xticks(rotation=45)
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    
    return image_base64

def perform_detailed_analysis(comments: List[Dict]) -> Dict:
    """Analyze comments using Gemini API and return structured data for visualization"""
    if not model:
        print("AI model not available")
        return create_default_section('all')
        
    try:
        # Format comments and replies for analysis
        comments_text = "Analyze these YouTube comments and their replies:\n\n"
        for i, comment in enumerate(comments[:50], 1):
            comments_text += f"Comment {i}:\n- Text: {comment['text']}\n- Likes: {comment['likes']}\n"
            for j, reply in enumerate(comment.get('replies', [])[:5], 1):
                comments_text += f"  Reply {j}: {reply['text']} (Likes: {reply['likes']})\n"
            comments_text += "\n"
        
        prompt = f"""
        {comments_text}

        Provide a structured analysis in this exact JSON format:
        {{
            "sentiment_distribution": {{
                "positive": number,
                "neutral": number,
                "negative": number
            }},
            "comment_categories": {{
                "questions": number,
                "praise": number,
                "suggestions": number,
                "complaints": number,
                "general": number
            }},
            "engagement_metrics": {{
                "high_engagement": number,
                "medium_engagement": number,
                "low_engagement": number
            }},
            "key_topics": [
                {{"topic": "topic1", "count": number}},
                {{"topic": "topic2", "count": number}},
                {{"topic": "topic3", "count": number}}
            ],
            "overall_analysis": {{
                "sentiment": "text",
                "engagement_level": "text",
                "community_health": "text"
            }},
            "recommendations": [
                "recommendation1",
                "recommendation2",
                "recommendation3"
            ]
        }}

        Rules:
        1. All numbers must be actual counts, not percentages
        2. Each comment belongs to exactly one category
        3. Engagement levels: high >100 likes, medium 10-100 likes, low <10 likes
        4. Key topics should be specific themes mentioned frequently
        5. Provide actionable recommendations
        6. Include both top-level comments and replies in the analysis

        Return ONLY the JSON object, no additional text.
        """

        # Generate response with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = model.generate_content(prompt)
                if not response.text:
                    raise ValueError("Empty response from model")
                
                # Clean the response text
                cleaned_text = response.text.strip()
                if cleaned_text.startswith("```json"):
                    cleaned_text = cleaned_text[7:-3]
                elif cleaned_text.startswith("```"):
                    cleaned_text = cleaned_text[3:-3]
                
                # Remove any non-JSON text
                cleaned_text = re.sub(r'^[^{]*', '', cleaned_text)
                cleaned_text = re.sub(r'[^}]*$', '', cleaned_text)
                
                result = json.loads(cleaned_text)
                
                # Validate required keys
                required_keys = ['sentiment_distribution', 'comment_categories', 'engagement_metrics', 
                               'key_topics', 'overall_analysis', 'recommendations']
                if all(key in result for key in required_keys):
                    return result
                else:
                    raise ValueError("Missing required keys in response")
                    
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(1)  # Wait before retry
                
        raise Exception("All retry attempts failed")
        
    except Exception as e:
        print(f"Error in AI analysis: {str(e)}")
        print(traceback.format_exc())
        return create_default_section('all')

def create_default_section(section_name: str) -> Dict:
    """Create default values for missing sections in AI analysis"""
    all_defaults = {
        "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
        "comment_categories": {"questions": 0, "praise": 0, "suggestions": 0, "complaints": 0, "general": 0},
        "engagement_metrics": {"high_engagement": 0, "medium_engagement": 0, "low_engagement": 0},
        "key_topics": [{"topic": "No topics analyzed", "count": 0}],
        "overall_analysis": {
            "sentiment": "Analysis unavailable",
            "engagement_level": "Analysis unavailable",
            "community_health": "Analysis unavailable"
        },
        "recommendations": ["No recommendations available"]
    }
    
    if section_name == 'all':
        return all_defaults
    return all_defaults.get(section_name, {})

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data or "question" not in data or "analysis_id" not in data:
            return jsonify({"error": "Missing required parameters"}), 400
            
        if data["analysis_id"] not in comment_store:
            return jsonify({"error": "No comments found for this analysis"}), 404

        if not model:
            return jsonify({"error": "AI model not available"}), 503

        comments = comment_store[data["analysis_id"]]
        comments_text = "Here are the YouTube comments and replies to analyze:\n\n"
        for i, comment in enumerate(comments[:50], 1):
            comments_text += f"Comment {i}:\n- Text: {comment['text']}\n- Likes: {comment['likes']}\n"
            for j, reply in enumerate(comment.get('replies', [])[:5], 1):
                comments_text += f"  Reply {j}: {reply['text']} (Likes: {reply['likes']})\n"
            comments_text += "\n"

        prompt = f"""
        Based on these YouTube comments and replies, please answer the following question:
        Question: {data['question']}

        Comments and Replies:
        {comments_text}

        Provide a detailed analysis in this exact JSON format:
        {{
            "answer": "detailed answer to the question",
            "relevant_comments": ["comment1", "comment2"],
            "confidence": "high/medium/low",
            "additional_insights": "any additional relevant insights"
        }}

        Rules:
        1. Base your answer solely on the provided comments and replies
        2. Include 2-3 most relevant comments or replies that support your answer
        3. Keep the response focused and specific
        4. Return ONLY the JSON object, no additional text
        """

        max_retries = 3
        last_error = None
        
        for attempt in range(max_retries):
            try:
                response = model.generate_content(prompt)
                if not response.text:
                    raise ValueError("Empty response from model")
                
                # Clean the response text
                cleaned_text = response.text.strip()
                if cleaned_text.startswith("```json"):
                    cleaned_text = cleaned_text[7:-3]
                elif cleaned_text.startswith("```"):
                    cleaned_text = cleaned_text[3:-3]
                
                # Remove any non-JSON text
                cleaned_text = re.sub(r'^[^{]*', '', cleaned_text)
                cleaned_text = re.sub(r'[^}]*$', '', cleaned_text)
                
                result = json.loads(cleaned_text)
                
                # Validate required keys
                required_keys = ['answer', 'relevant_comments', 'confidence', 'additional_insights']
                if all(key in result for key in required_keys):
                    return jsonify(result)
                else:
                    raise ValueError("Missing required keys in response")
                    
            except Exception as e:
                last_error = str(e)
                print(f"Chat attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    break
                time.sleep(1)  # Wait before retry
        
        # If all retries failed, return a structured error response
        return jsonify({
            "error": "Failed to analyze the question",
            "details": last_error,
            "fallback_response": {
                "answer": "Sorry, I couldn't analyze the comments at this time. Please try again later.",
                "relevant_comments": [],
                "confidence": "low",
                "additional_insights": "Error occurred during analysis"
            }
        }), 500

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({
            "error": "Chat analysis failed",
            "details": str(e),
            "fallback_response": {
                "answer": "An unexpected error occurred. Please try again later.",
                "relevant_comments": [],
                "confidence": "low",
                "additional_insights": "System error occurred"
            }
        }), 500

@app.route("/api/analyze", methods=["POST"])
def analyze_video():
    try:
        data = request.get_json()
        if not data or "video_url" not in data or "analysis_id" not in data:
            return jsonify({"error": "Missing required parameters", "status": "error"}), 400

        comments = get_video_comments(data["video_url"])
        
        if not comments:
            return jsonify({
                "error": "No comments were found or could be loaded",
                "status": "error"
            }), 404
        
        # Store comments for chat functionality
        comment_store[data["analysis_id"]] = comments
        
        # Sort comments by likes (including replies in total engagement consideration)
        def get_total_likes(comment):
            return comment['likes'] + sum(reply['likes'] for reply in comment.get('replies', []))
        sorted_comments = sorted(comments, key=get_total_likes, reverse=True)
        
        # Calculate total comments including replies
        total_comments = len(sorted_comments)  # Start with top-level comments
        for comment in sorted_comments:
            total_comments += len(comment.get('replies', []))  # Add number of replies

        # Basic statistics
        total_likes = sum(get_total_likes(c) for c in sorted_comments)
        avg_likes = total_likes / total_comments if total_comments > 0 else 0
        
        # Get AI analysis
        ai_analysis = perform_detailed_analysis(sorted_comments)
        
        # Create visualizations
        visualizations = {
            "sentiment_scatter": create_sentiment_visualization(sorted_comments),
            "engagement_distribution": create_engagement_visualization(sorted_comments),
            "wordcloud": create_wordcloud_visualization(sorted_comments),
            "sentiment_timeline": create_sentiment_timeline(sorted_comments),
            "category_distribution": create_category_distribution(ai_analysis)
        }
        
        # Add sentiment analysis to each comment and reply
        for comment in sorted_comments:
            comment['sentiment'] = analyze_sentiment(comment['text'])
            for reply in comment.get('replies', []):
                reply['sentiment'] = analyze_sentiment(reply['text'])
        
        # Calculate additional metrics
        engagement_rates = {
            "high_engagement_rate": (ai_analysis['engagement_metrics']['high_engagement'] / total_comments) * 100 if total_comments > 0 else 0,
            "medium_engagement_rate": (ai_analysis['engagement_metrics']['medium_engagement'] / total_comments) * 100 if total_comments > 0 else 0,
            "low_engagement_rate": (ai_analysis['engagement_metrics']['low_engagement'] / total_comments) * 100 if total_comments > 0 else 0
        }
        
        sentiment_metrics = {
            "positive_rate": (ai_analysis['sentiment_distribution']['positive'] / total_comments) * 100 if total_comments > 0 else 0,
            "neutral_rate": (ai_analysis['sentiment_distribution']['neutral'] / total_comments) * 100 if total_comments > 0 else 0,
            "negative_rate": (ai_analysis['sentiment_distribution']['negative'] / total_comments) * 100 if total_comments > 0 else 0,
            "average_sentiment": sum(c['sentiment']['polarity'] for c in sorted_comments) / total_comments if total_comments > 0 else 0
        }
    
        return jsonify({
            "status": "success",
            "id": data["analysis_id"],
            "comments": sorted_comments,
            "statistics": {
                "total_comments": total_comments,
                "total_likes": total_likes,
                "average_likes": round(avg_likes, 2),
                "engagement_rates": engagement_rates,
                "sentiment_metrics": sentiment_metrics
            },
            "visualizations": visualizations,
            "ai_analysis": ai_analysis,
            "error": None
        })
            
    except ValueError as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e), "status": "error"}), 400
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error", "status": "error", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, threaded=True)