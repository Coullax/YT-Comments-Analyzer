# import os
# from typing import List, Dict
# from dotenv import load_dotenv
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import time
# import re
# import traceback
# import google.generativeai as genai
# import json
# from textblob import TextBlob
# import pandas as pd
# import matplotlib
# matplotlib.use('Agg')  # Use Agg backend to avoid GUI issues
# import matplotlib.pyplot as plt
# import seaborn as sns
# import io
# import base64
# from collections import Counter
# import numpy as np
# from wordcloud import WordCloud
# from googleapiclient.discovery import build
# from googleapiclient.errors import HttpError
#
# load_dotenv()
#
# # Configure YouTube API
# YOUTUBE_API_KEY = "AIzaSyAaCfO0i6W2K9NLgvU0h8NjQxAxPZ5qbF8"
# youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
#
# # Configure Gemini API
# GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyB_5IyMabHG-YXtflNm35H2YrcQP4fCXNs')
# genai.configure(api_key=GEMINI_API_KEY)
#
# # Configure the model
# generation_config = {
#     "temperature": 0.7,
#     "top_p": 0.8,
#     "top_k": 40,
#     "max_output_tokens": 2048,
# }
#
# safety_settings = [
#     {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
#     {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
#     {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
#     {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"}
# ]
#
# # Initialize the model with fallback options
# try:
#     model = genai.GenerativeModel("gemini-2.0-flash-exp",
#                                   generation_config=generation_config)
#     response = model.generate_content("Test")
#     if not response.text:
#         raise Exception("Model returned empty response")
# except Exception as e:
#     print(f"Warning: Error with primary model configuration: {str(e)}")
#     try:
#         model = genai.GenerativeModel("gemini-2.0-flash-exp")
#         response = model.generate_content("Test")
#         if not response.text:
#             raise Exception("Model returned empty response")
#     except Exception as e:
#         print(f"Error: Could not initialize model: {str(e)}")
#         model = None
#
# app = Flask(__name__)
# CORS(app)
#
# # Store comments in memory for chat functionality
# comment_store = {}
#
# @app.route("/health", methods=["GET"])
# def health_check():
#     return jsonify({"status": "healthy"}), 200
#
# def extract_video_id(url: str) -> str:
#     """Extract video ID from various YouTube URL formats"""
#     if "v=" in url:
#         return url.split("v=")[1].split("&")[0]
#     elif "youtu.be/" in url:
#         return url.split("youtu.be/")[1].split("?")[0]
#     raise ValueError("Invalid YouTube URL")
#
# def get_video_stats(video_id: str, max_retries: int = 3) -> Dict:
#     """Fetch video statistics (like count and comment count) using YouTube Data API"""
#     for attempt in range(max_retries):
#         try:
#             request = youtube.videos().list(
#                 part="statistics",
#                 id=video_id
#             )
#             response = request.execute()
#             if not response.get('items'):
#                 raise ValueError("Video not found")
#             stats = response['items'][0]['statistics']
#             return {
#                 "likeCount": int(stats.get('likeCount', 0)),
#                 "commentCount": int(stats.get('commentCount', 0)),
#                 "viewCount": int(stats.get('viewCount', 0))
#             }
#         except HttpError as e:
#             if e.resp.status == 403:
#                 raise ValueError("Access forbidden: Check API key or video restrictions")
#             elif e.resp.status == 404:
#                 raise ValueError("Video not found")
#             elif attempt == max_retries - 1:
#                 raise ValueError(f"Failed to fetch video stats after {max_retries} attempts: {str(e)}")
#             time.sleep(1)
#         except Exception as e:
#             if attempt == max_retries - 1:
#                 raise ValueError(f"Failed to fetch video stats: {str(e)}")
#             time.sleep(1)
#     return {"likeCount": 0, "commentCount": 0, "viewCount": 0}
#
# def get_video_comments(video_url: str, max_retries: int = 3) -> List[Dict]:
#     """Fetch comments and their replies using YouTube Data API"""
#     video_id = extract_video_id(video_url)
#     comments = []
#     max_comments = 100000000000000000000000000000
#     max_replies_per_comment = 100000000000000000000000000000
#
#     for attempt in range(max_retries):
#         try:
#             request = youtube.commentThreads().list(
#                 part="snippet,replies",
#                 videoId=video_id,
#                 maxResults=min(max_comments, 100),
#                 order="relevance",
#                 textFormat="plainText"
#             )
#
#             while request and len(comments) < max_comments:
#                 response = request.execute()
#
#                 for item in response['items']:
#                     top_comment = item['snippet']['topLevelComment']['snippet']
#                     comment_data = {
#                         "text": top_comment['textDisplay'],
#                         "author": top_comment['authorDisplayName'],
#                         "likes": top_comment['likeCount'],
#                         "publishedAt": top_comment['publishedAt'],
#                         "replies": []
#                     }
#
#                     if item['snippet']['totalReplyCount'] > 0 and 'replies' in item:
#                         reply_request = youtube.comments().list(
#                             part="snippet",
#                             parentId=item['snippet']['topLevelComment']['id'],
#                             maxResults=min(max_replies_per_comment, 100),
#                             textFormat="plainText"
#                         )
#                         reply_response = reply_request.execute()
#                         for reply_item in reply_response['items']:
#                             reply = reply_item['snippet']
#                             comment_data['replies'].append({
#                                 "text": reply['textDisplay'],
#                                 "author": reply['authorDisplayName'],
#                                 "likes": reply['likeCount'],
#                                 "publishedAt": reply['publishedAt']
#                             })
#                             if len(comment_data['replies']) >= max_replies_per_comment:
#                                 break
#
#                     comments.append(comment_data)
#                     if len(comments) >= max_comments:
#                         break
#
#                 if 'nextPageToken' in response and len(comments) < max_comments:
#                     request = youtube.commentThreads().list(
#                         part="snippet,replies",
#                         videoId=video_id,
#                         maxResults=min(max_comments - len(comments), 100),
#                         pageToken=response['nextPageToken'],
#                         order="relevance",
#                         textFormat="plainText"
#                     )
#                 else:
#                     break
#
#             return comments
#
#         except HttpError as e:
#             if e.resp.status == 403:
#                 return []  # Return empty list if comments are disabled
#             elif e.resp.status == 404:
#                 raise ValueError("Video not found")
#             elif attempt == max_retries - 1:
#                 raise ValueError(f"Failed to fetch comments after {max_retries} attempts: {str(e)}")
#             time.sleep(1)
#         except Exception as e:
#             if attempt == max_retries - 1:
#                 raise ValueError(f"Failed to fetch comments: {str(e)}")
#             time.sleep(1)
#
#     return []
#
# def analyze_sentiment(text: str) -> Dict:
#     """Analyze sentiment of text using TextBlob"""
#     analysis = TextBlob(text)
#     return {
#         'polarity': round(analysis.sentiment.polarity, 2),
#         'subjectivity': round(analysis.sentiment.subjectivity, 2)
#     }
#
# def create_sentiment_visualization(comments: List[Dict]) -> str:
#     """Create sentiment visualization and return as base64 string"""
#     all_texts = [comment['text'] for comment in comments]
#     for comment in comments:
#         all_texts.extend(reply['text'] for reply in comment.get('replies', []))
#     sentiments = [analyze_sentiment(text) for text in all_texts]
#     df = pd.DataFrame(sentiments)
#
#     plt.figure(figsize=(10, 6))
#     plt.scatter(df['polarity'], df['subjectivity'], alpha=0.5)
#     plt.xlabel('Polarity (Negative to Positive)')
#     plt.ylabel('Subjectivity (Objective to Subjective)')
#     plt.title('Comment Sentiment Analysis (Including Replies)')
#
#     buffer = io.BytesIO()
#     plt.savefig(buffer, format='png')
#     buffer.seek(0)
#     image_base64 = base64.b64encode(buffer.getvalue()).decode()
#     plt.close()
#
#     return image_base64
#
# def create_engagement_visualization(comments: List[Dict]) -> str:
#     """Create engagement distribution visualization"""
#     likes = [comment['likes'] for comment in comments]
#     for comment in comments:
#         likes.extend(reply['likes'] for reply in comment.get('replies', []))
#     plt.figure(figsize=(10, 6))
#     plt.hist(likes, bins=30, color='skyblue', edgecolor='black')
#     plt.xlabel('Number of Likes')
#     plt.ylabel('Frequency')
#     plt.title('Comment Engagement Distribution (Including Replies)')
#
#     buffer = io.BytesIO()
#     plt.savefig(buffer, format='png')
#     buffer.seek(0)
#     image_base64 = base64.b64encode(buffer.getvalue()).decode()
#     plt.close()
#
#     return image_base64
#
# def create_wordcloud_visualization(comments: List[Dict]) -> str:
#     """Create word cloud visualization from comments and replies"""
#     all_texts = [comment['text'] for comment in comments]
#     for comment in comments:
#         all_texts.extend(reply['text'] for reply in comment.get('replies', []))
#     text = ' '.join(all_texts)
#     wordcloud = WordCloud(width=800, height=400, background_color='white').generate(text)
#
#     plt.figure(figsize=(10, 5))
#     plt.imshow(wordcloud, interpolation='bilinear')
#     plt.axis('off')
#
#     buffer = io.BytesIO()
#     plt.savefig(buffer, format='png')
#     buffer.seek(0)
#     image_base64 = base64.b64encode(buffer.getvalue()).decode()
#     plt.close()
#
#     return image_base64
#
# def create_sentiment_timeline(comments: List[Dict]) -> str:
#     """Create sentiment over time visualization"""
#     all_texts = [(comment['text'], i) for i, comment in enumerate(comments)]
#     for comment in comments:
#         all_texts.extend((reply['text'], i) for i, reply in enumerate(comment.get('replies', [])))
#     sorted_texts = sorted(all_texts, key=lambda x: x[1])
#     sentiments = [analyze_sentiment(text)['polarity'] for text, _ in sorted_texts]
#     plt.figure(figsize=(12, 6))
#     plt.plot(range(len(sentiments)), sentiments, marker='o', linestyle='-', alpha=0.6)
#     plt.xlabel('Comment Sequence (Including Replies)')
#     plt.ylabel('Sentiment Polarity')
#     plt.title('Sentiment Timeline')
#     plt.grid(True, alpha=0.3)
#
#     buffer = io.BytesIO()
#     plt.savefig(buffer, format='png')
#     buffer.seek(0)
#     image_base64 = base64.b64encode(buffer.getvalue()).decode()
#     plt.close()
#
#     return image_base64
#
# def create_category_distribution(ai_analysis: Dict) -> str:
#     """Create category distribution visualization"""
#     categories = ai_analysis['comment_categories']
#     plt.figure(figsize=(10, 6))
#     plt.bar(categories.keys(), categories.values(), color='lightcoral')
#     plt.xlabel('Categories')
#     plt.ylabel('Number of Comments')
#     plt.title('Comment Category Distribution')
#     plt.xticks(rotation=45)
#
#     buffer = io.BytesIO()
#     plt.savefig(buffer, format='png')
#     buffer.seek(0)
#     image_base64 = base64.b64encode(buffer.getvalue()).decode()
#     plt.close()
#
#     return image_base64
#
# def perform_detailed_analysis(comments: List[Dict]) -> Dict:
#     """Analyze comments using Gemini API and return structured data for visualization"""
#     if not model:
#         print("AI model not available")
#         return create_default_section('all')
#
#     try:
#         comments_text = "Analyze these YouTube comments and their replies:\n\n"
#         for i, comment in enumerate(comments[:50], 1):
#             comments_text += f"Comment {i}:\n- Text: {comment['text']}\n- Likes: {comment['likes']}\n"
#             for j, reply in enumerate(comment.get('replies', [])[:5], 1):
#                 comments_text += f"  Reply {j}: {reply['text']} (Likes: {reply['likes']})\n"
#             comments_text += "\n"
#
#         prompt = f"""
#         {comments_text}
#
#         Provide a structured analysis in this exact JSON format:
#         {{
#             "sentiment_distribution": {{
#                 "positive": number,
#                 "neutral": number,
#                 "negative": number
#             }},
#             "comment_categories": {{
#                 "questions": number,
#                 "praise": number,
#                 "suggestions": number,
#                 "complaints": number,
#                 "general": number
#             }},
#             "engagement_metrics": {{
#                 "high_engagement": number,
#                 "medium_engagement": number,
#                 "low_engagement": number
#             }},
#             "key_topics": [
#                 {{"topic": "topic1", "count": number}},
#                 {{"topic": "topic2", "count": number}},
#                 {{"topic": "topic3", "count": number}}
#             ],
#             "overall_analysis": {{
#                 "sentiment": "text",
#                 "engagement_level": "text",
#                 "community_health": "text"
#             }},
#             "recommendations": [
#                 "recommendation1",
#                 "recommendation2",
#                 "recommendation3"
#             ],
#             "positiveInsights":[
#                 "Positive Insight 1",
#                 "Positive Insight 2",
#                 "Positive Insight 3"
#             ],
#         }}
#
#         Rules:
#         1. All numbers must be actual counts, not percentages
#         2. Each comment belongs to exactly one category
#         3. Engagement levels: high >100 likes, medium 10-100 likes, low <10 likes
#         4. Key topics should be specific themes mentioned frequently
#         5. Provide actionable recommendations
#         6. Include both top-level comments and replies in the analysis
#
#         Return ONLY the JSON object, no additional text.
#         """
#
#         max_retries = 3
#         for attempt in range(max_retries):
#             try:
#                 response = model.generate_content(prompt)
#                 if not response.text:
#                     raise ValueError("Empty response from model")
#
#                 cleaned_text = response.text.strip()
#                 if cleaned_text.startswith("```json"):
#                     cleaned_text = cleaned_text[7:-3]
#                 elif cleaned_text.startswith("```"):
#                     cleaned_text = cleaned_text[3:-3]
#
#                 cleaned_text = re.sub(r'^[^{]*', '', cleaned_text)
#                 cleaned_text = re.sub(r'[^}]*$', '', cleaned_text)
#
#                 result = json.loads(cleaned_text)
#
#                 required_keys = ['sentiment_distribution', 'comment_categories', 'engagement_metrics',
#                                  'key_topics', 'overall_analysis', 'recommendations']
#                 if all(key in result for key in required_keys):
#                     return result
#                 else:
#                     raise ValueError("Missing required keys in response")
#
#             except Exception as e:
#                 print(f"Attempt {attempt + 1} failed: {str(e)}")
#                 if attempt == max_retries - 1:
#                     raise
#                 time.sleep(1)
#
#         raise Exception("All retry attempts failed")
#
#     except Exception as e:
#         print(f"Error in AI analysis: {str(e)}")
#         print(traceback.format_exc())
#         return create_default_section('all')
#
# def create_default_section(section_name: str) -> Dict:
#     """Create default values for missing sections in AI analysis"""
#     all_defaults = {
#         "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
#         "comment_categories": {"questions": 0, "praise": 0, "suggestions": 0, "complaints": 0, "general": 0},
#         "engagement_metrics": {"high_engagement": 0, "medium_engagement": 0, "low_engagement": 0},
#         "key_topics": [{"topic": "No topics analyzed", "count": 0}],
#         "overall_analysis": {
#             "sentiment": "Analysis unavailable",
#             "engagement_level": "Analysis unavailable",
#             "community_health": "Analysis unavailable"
#         },
#         "recommendations": ["No recommendations available"]
#     }
#
#     if section_name == 'all':
#         return all_defaults
#     return all_defaults.get(section_name, {})
#
# @app.route("/api/chat", methods=["POST"])
# def chat():
#     try:
#         data = request.get_json()
#         if not data or "question" not in data or "analysis_id" not in data:
#             return jsonify({"error": "Missing required parameters"}), 400
#
#         if data["analysis_id"] not in comment_store:
#             return jsonify({"error": "No comments found for this analysis"}), 404
#
#         if not model:
#             return jsonify({"error": "AI model not available"}), 503
#
#         comments = comment_store[data["analysis_id"]]
#         comments_text = "Here are the YouTube comments and replies to analyze:\n\n"
#         for i, comment in enumerate(comments[:50], 1):
#             comments_text += f"Comment {i}:\n- Text: {comment['text']}\n- Likes: {comment['likes']}\n"
#             for j, reply in enumerate(comment.get('replies', [])[:5], 1):
#                 comments_text += f"  Reply {j}: {reply['text']} (Likes: {reply['likes']})\n"
#             comments_text += "\n"
#
#         prompt = f"""
#         Based on these YouTube comments and replies, please answer the following question:
#         Question: {data['question']}
#
#         Comments and Replies:
#         {comments_text}
#
#         Provide a detailed analysis in this exact JSON format:
#         {{
#             "answer": "detailed answer to the question",
#             "relevant_comments": ["comment1", "comment2"],
#             "confidence": "high/medium/low",
#             "additional_insights": "any additional relevant insights"
#         }}
#
#         Rules:
#         1. Base your answer solely on the provided comments and replies
#         2. Include 2-3 most relevant comments or replies that support your answer
#         3. Keep the response focused and specific
#         4. Return ONLY the JSON object, no additional text
#         """
#
#         max_retries = 3
#         last_error = None
#
#         for attempt in range(max_retries):
#             try:
#                 response = model.generate_content(prompt)
#                 if not response.text:
#                     raise ValueError("Empty response from model")
#
#                 cleaned_text = response.text.strip()
#                 if cleaned_text.startswith("```json"):
#                     cleaned_text = cleaned_text[7:-3]
#                 elif cleaned_text.startswith("```"):
#                     cleaned_text = cleaned_text[3:-3]
#
#                 cleaned_text = re.sub(r'^[^{]*', '', cleaned_text)
#                 cleaned_text = re.sub(r'[^}]*$', '', cleaned_text)
#
#                 result = json.loads(cleaned_text)
#
#                 required_keys = ['answer', 'relevant_comments', 'confidence', 'additional_insights']
#                 if all(key in result for key in required_keys):
#                     return jsonify(result)
#                 else:
#                     raise ValueError("Missing required keys in response")
#
#             except Exception as e:
#                 last_error = str(e)
#                 print(f"Chat attempt {attempt + 1} failed: {str(e)}")
#                 if attempt == max_retries - 1:
#                     break
#                 time.sleep(1)
#
#         return jsonify({
#             "error": "Failed to analyze the question",
#             "details": last_error,
#             "fallback_response": {
#                 "answer": "Sorry, I couldn't analyze the comments at this time. Please try again later.",
#                 "relevant_comments": [],
#                 "confidence": "low",
#                 "additional_insights": "Error occurred during analysis"
#             }
#         }), 500
#
#     except Exception as e:
#         print(traceback.format_exc())
#         return jsonify({
#             "error": "Chat analysis failed",
#             "details": str(e),
#             "fallback_response": {
#                 "answer": "An unexpected error occurred. Please try again later.",
#                 "relevant_comments": [],
#                 "confidence": "low",
#                 "additional_insights": "System error occurred"
#             }
#         }), 500
#
# @app.route("/api/analyze", methods=["POST"])
# def analyze_video():
#     try:
#         data = request.get_json()
#         if not data or "video_url" not in data or "analysis_id" not in data:
#             return jsonify({"error": "Missing required parameters", "status": "error"}), 400
#
#         video_id = extract_video_id(data["video_url"])
#
#         # Fetch video statistics
#         video_stats = get_video_stats(video_id)
#
#         # Fetch comments
#         comments = get_video_comments(data["video_url"])
#
#         if not comments and video_stats['commentCount'] == 0:
#             return jsonify({
#                 "error": "Comments are disabled or no comments found",
#                 "status": "error"
#             }), 404
#
#         # Store comments for chat functionality
#         comment_store[data["analysis_id"]] = comments
#
#         # Sort comments by likes (including replies in total engagement consideration)
#         def get_total_likes(comment):
#             return comment['likes'] + sum(reply['likes'] for reply in comment.get('replies', []))
#         sorted_comments = sorted(comments, key=get_total_likes, reverse=True)
#
#         # Calculate total fetched comments including replies
#         fetched_comments = len(sorted_comments)
#         for comment in sorted_comments:
#             fetched_comments += len(comment.get('replies', []))
#
#         # Use video_stats for total comment count, fallback to fetched count if API fails
#         total_comments = video_stats['commentCount'] if video_stats['commentCount'] > 0 else fetched_comments
#
#         # Basic statistics
#         total_likes = video_stats['likeCount']  # Use video like count
#         avg_likes = total_likes / total_comments if total_comments > 0 else 0
#
#         # Get AI analysis
#         ai_analysis = perform_detailed_analysis(sorted_comments)
#
#         # Create visualizations
#         visualizations = {
#             "sentiment_scatter": create_sentiment_visualization(sorted_comments),
#             "engagement_distribution": create_engagement_visualization(sorted_comments),
#             "wordcloud": create_wordcloud_visualization(sorted_comments),
#             "sentiment_timeline": create_sentiment_timeline(sorted_comments),
#             "category_distribution": create_category_distribution(ai_analysis)
#         }
#
#         # Add sentiment analysis to each comment and reply
#         for comment in sorted_comments:
#             comment['sentiment'] = analyze_sentiment(comment['text'])
#             for reply in comment.get('replies', []):
#                 reply['sentiment'] = analyze_sentiment(reply['text'])
#
#         # Calculate additional metrics
#         engagement_rates = {
#             "high_engagement_rate": (ai_analysis['engagement_metrics']['high_engagement'] / fetched_comments) * 100 if fetched_comments > 0 else 0,
#             "medium_engagement_rate": (ai_analysis['engagement_metrics']['medium_engagement'] / fetched_comments) * 100 if fetched_comments > 0 else 0,
#             "low_engagement_rate": (ai_analysis['engagement_metrics']['low_engagement'] / fetched_comments) * 100 if fetched_comments > 0 else 0
#         }
#
#         sentiment_metrics = {
#             "positive_rate": (ai_analysis['sentiment_distribution']['positive'] / fetched_comments) * 100 if fetched_comments > 0 else 0,
#             "neutral_rate": (ai_analysis['sentiment_distribution']['neutral'] / fetched_comments) * 100 if fetched_comments > 0 else 0,
#             "negative_rate": (ai_analysis['sentiment_distribution']['negative'] / fetched_comments) * 100 if fetched_comments > 0 else 0,
#             "average_sentiment": sum(c['sentiment']['polarity'] for c in sorted_comments) / fetched_comments if fetched_comments > 0 else 0
#         }
#
#         return jsonify({
#             "status": "success",
#             "id": data["analysis_id"],
#             "comments": sorted_comments,
#             "statistics": {
#                 "total_comments": total_comments,
#                 "total_likes": total_likes,
#                 "average_likes": round(avg_likes, 2),
#                 "engagement_rates": engagement_rates,
#                 "sentiment_metrics": sentiment_metrics,
#                 "view_count": video_stats['viewCount']
#             },
#             "visualizations": visualizations,
#             "ai_analysis": ai_analysis,
#             "error": None
#         })
#
#     except ValueError as e:
#         print(traceback.format_exc())
#         return jsonify({"error": str(e), "status": "error"}), 400
#     except Exception as e:
#         print(traceback.format_exc())
#         return jsonify({"error": "Internal server error", "status": "error", "details": str(e)}), 500
#
# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=8000, threaded=True)

import os
from typing import List, Dict
from dotenv import load_dotenv
from flask import Flask, request, jsonify,Response
from flask_cors import CORS
import time
import re
import traceback
import google.generativeai as genai
import json
from textblob import TextBlob
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from collections import Counter
import numpy as np
from wordcloud import WordCloud
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import subprocess
from io import BytesIO
from fastapi.responses import StreamingResponse
import cv2
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
    response = model.generate_content("Test")
    if not response.text:
        raise Exception("Model returned empty response")
except Exception as e:
    print(f"Warning: Error with primary model configuration: {str(e)}")
    try:
        model = genai.GenerativeModel("gemini-2.0-flash-exp")
        response = model.generate_content("Test")
        if not response.text:
            raise Exception("Model returned empty response")
    except Exception as e:
        print(f"Error: Could not initialize model: {str(e)}")
        model = None

app = Flask(__name__)
CORS(app)

# Store comments in memory for chat functionality
comment_store = {}

def parse_gemini_response(response_text):
    cleaned_text = response_text.strip()
    if cleaned_text.startswith("```json"):
        cleaned_text = cleaned_text[7:-3]
    elif cleaned_text.startswith("```"):
        cleaned_text = cleaned_text[3:-3]
    cleaned_text = re.sub(r'^[^{]*', '', cleaned_text)
    cleaned_text = re.sub(r'[^}]*$', '', cleaned_text)
    try:
        return json.loads(cleaned_text)
    except json.JSONDecodeError:
        return None

@app.route("/api/gemini", methods=["POST"])
def gemini_api():
    if not model:
        return jsonify({"error": "AI model not available"}), 503
    try:
        data = request.get_json()
        if not data or "prompt" not in data:
            return jsonify({"error": "Missing required parameter 'prompt'"}), 400
        prompt = data["prompt"]
        response = model.generate_content(prompt)
        if not response.text:
            return jsonify({"error": "No response from Gemini API"}), 500
        parsed_result = parse_gemini_response(response.text)
        if parsed_result is not None:
            return jsonify(parsed_result), 200
        else:
            return jsonify({"error": "Invalid JSON response from Gemini API"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"}), 200

def extract_video_id(url: str) -> str:
    if "v=" in url:
        return url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    raise ValueError("Invalid YouTube URL")

def get_video_stats(video_id: str, max_retries: int = 3) -> Dict:
    for attempt in range(max_retries):
        try:
            request = youtube.videos().list(
                part="statistics",
                id=video_id
            )
            response = request.execute()
            if not response.get('items'):
                raise ValueError("Video not found")
            stats = response['items'][0]['statistics']
            return {
                "likeCount": int(stats.get('likeCount', 0)),
                "commentCount": int(stats.get('commentCount', 0)),
                "viewCount": int(stats.get('viewCount', 0))
            }
        except HttpError as e:
            if e.resp.status == 403:
                raise ValueError("Access forbidden: Check API key or video restrictions")
            elif e.resp.status == 404:
                raise ValueError("Video not found")
            elif attempt == max_retries - 1:
                raise ValueError(f"Failed to fetch video stats after {max_retries} attempts: {str(e)}")
            time.sleep(1)
        except Exception as e:
            if attempt == max_retries - 1:
                raise ValueError(f"Failed to fetch video stats: {str(e)}")
            time.sleep(1)
    return {"likeCount": 0, "commentCount": 0, "viewCount": 0}

def get_video_comments(video_url: str, max_retries: int = 3) -> List[Dict]:
    video_id = extract_video_id(video_url)
    comments = []
    max_comments = 100000000000000000000000000000
    max_replies_per_comment = 100000000000000000000000000000
    for attempt in range(max_retries):
        try:
            request = youtube.commentThreads().list(
                part="snippet,replies",
                videoId=video_id,
                maxResults=min(max_comments, 100),
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
                    if item['snippet']['totalReplyCount'] > 0 and 'replies' in item:
                        reply_request = youtube.comments().list(
                            part="snippet",
                            parentId=item['snippet']['topLevelComment']['id'],
                            maxResults=min(max_replies_per_comment, 100),
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
                return []
            elif e.resp.status == 404:
                raise ValueError("Video not found")
            elif attempt == max_retries - 1:
                raise ValueError(f"Failed to fetch comments after {max_retries} attempts: {str(e)}")
            time.sleep(1)
        except Exception as e:
            if attempt == max_retries - 1:
                raise ValueError(f"Failed to fetch comments: {str(e)}")
            time.sleep(1)
    return []

def analyze_sentiment(text: str) -> Dict:
    analysis = TextBlob(text)
    return {
        'polarity': round(analysis.sentiment.polarity, 2),
        'subjectivity': round(analysis.sentiment.subjectivity, 2)
    }

def create_sentiment_visualization(comments: List[Dict]) -> str:
    all_texts = [comment['text'] for comment in comments]
    for comment in comments:
        all_texts.extend(reply['text'] for reply in comment.get('replies', []))
    sentiments = [analyze_sentiment(text) for text in all_texts]
    df = pd.DataFrame(sentiments)
    plt.figure(figsize=(10, 6))
    plt.scatter(df['polarity'], df['subjectivity'], alpha=0.5)
    plt.xlabel('Polarity (Negative to Positive)')
    plt.ylabel('Subjectivity (Objective to Subjective)')
    plt.title('Comment Sentiment Analysis (Including Replies)')
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    return image_base64

def create_engagement_visualization(comments: List[Dict]) -> str:
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
    all_texts = [(comment['text'], i) for i, comment in enumerate(comments)]
    for comment in comments:
        all_texts.extend((reply['text'], i) for i, reply in enumerate(comment.get('replies', [])))
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
    if not model:
        print("AI model not available")
        return create_default_section('all')
    try:
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
            ],
            "positiveInsights":[
                "Positive Insight 1",
                "Positive Insight 2",
                "Positive Insight 3"
            ],
            "futureImprovementsSuggests":[
                "suggestion 1",
                "suggestion 1",
                "suggestion 1"
            ],
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
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = model.generate_content(prompt)
                if not response.text:
                    raise ValueError("Empty response from model")
                parsed_result = parse_gemini_response(response.text)
                if parsed_result is not None:
                    return parsed_result
                else:
                    raise ValueError("Invalid JSON response from model")
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(1)
        raise Exception("All retry attempts failed")
    except Exception as e:
        print(f"Error in AI analysis: {str(e)}")
        print(traceback.format_exc())
        return create_default_section('all')

def create_default_section(section_name: str) -> Dict:
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

def extract_frame_from_video(youtube_url: str, time: str) -> BytesIO:
    """
    Extract a single frame from a YouTube video at the specified time using OpenCV.
    
    Args:
        youtube_url (str): The YouTube video URL.
        time (str): Time in HH:MM:SS format or seconds (e.g., "00:01:30" or "90").
    
    Returns:
        BytesIO: The extracted frame as a JPG image in a BytesIO buffer.
    
    Raises:
        ValueError: If the URL or time is invalid, or if extraction fails.
    """
    try:
        # Validate YouTube URL
        if not youtube_url.startswith(('https://www.youtube.com', 'https://youtu.be')):
            raise ValueError("Invalid YouTube URL")
        
        # Validate time format
        if not re.match(r'^(\d{2}:\d{2}:\d{2}|\d+)$', time):
            raise ValueError("Invalid time format. Use HH:MM:SS or seconds.")

        # Convert time to seconds
        if ":" in time:
            h, m, s = map(int, time.split(":"))
            seconds = h * 3600 + m * 60 + s
        else:
            seconds = int(time)

        # Get direct video URL using yt-dlp
        direct_url = subprocess.check_output(["yt-dlp", "-g", youtube_url]).decode().strip()

        # Initialize OpenCV video capture
        cap = cv2.VideoCapture(direct_url)
        if not cap.isOpened():
            raise ValueError("Failed to open video stream")

        # Set frame position (in seconds)
        cap.set(cv2.CAP_PROP_POS_MSEC, seconds * 1000)

        # Read the frame
        success, frame = cap.read()
        if not success:
            raise ValueError("Failed to extract frame at specified time")

        # Convert frame to JPG
        _, buffer = cv2.imencode(".jpg", frame)
        cap.release()

        return BytesIO(buffer.tobytes())

    except subprocess.CalledProcessError as e:
        raise ValueError(f"Failed to fetch video stream: {e.stderr.decode()}")
    except Exception as e:
        raise ValueError(f"Unexpected error during frame extraction: {str(e)}")
    

def get_video_transcript(video_id: str, start_time: str = None, end_time: str = None) -> str:
    """
    Fetch YouTube video transcript using YouTube Data API.
    Optionally filter by time range.
    """
    try:
        # Convert times to seconds
        def time_to_seconds(time_str):
            if not time_str:
                return None
            if ":" in time_str:
                h, m, s = map(int, time_str.split(":"))
                return h * 3600 + m * 60 + s
            return int(time_str)

        start_seconds = time_to_seconds(start_time)
        end_seconds = time_to_seconds(end_time)

        # Get available captions
        captions_response = youtube.captions().list(
            part="snippet",
            videoId=video_id
        ).execute()

        captions = captions_response.get("items", [])
        if not captions:
            raise ValueError("No captions available for this video")

        # Prefer auto-generated or English captions
        caption_id = None
        for caption in captions:
            if caption["snippet"]["language"] == "en" or caption["snippet"]["trackKind"] == "asr":
                caption_id = caption["id"]
                break
        if not caption_id:
            raise ValueError("No English or auto-generated captions found")

        # Download captions
        caption_response = youtube.captions().download(id=caption_id).execute()

        # Parse captions (assuming SRT format)
        transcript = []
        lines = caption_response.decode().split("\n\n")
        for line in lines:
            if not line.strip():
                continue
            parts = line.split("\n")
            if len(parts) < 3:
                continue
            timing = parts[1].split(" --> ")
            start = timing[0].replace(",", ".")
            start_secs = sum(float(x) * 60 ** i for i, x in enumerate(reversed(start.split(":"))))
            if start_seconds is not None and start_secs < start_seconds:
                continue
            if end_seconds is not None and start_secs > end_seconds:
                break
            transcript.append(" ".join(parts[2:]))

        return "\n".join(transcript) if transcript else "No transcript content found"

    except HttpError as e:
        raise ValueError(f"Failed to fetch transcript: {str(e)}")
    except Exception as e:
        raise ValueError(f"Unexpected error fetching transcript: {str(e)}")
    

def summarize_and_analyze_transcript(transcript: str, youtube_url: str) -> dict:
    """
    Use Gemini API to summarize and analyze the transcript.
    """
    try:
        prompt = (
            f"Below is the transcript of a YouTube video ({youtube_url}). "
            "Provide a detailed summary of the content, key points, and themes. "
            "Also, provide an analysis discussing the main themes, sentiment, and notable insights. "
            "Return the response in JSON format with the following structure:\n"
            "{\n"
            "  \"summary\": \"string\",\n"
            "  \"analysis\": \"string\"\n"
            "}\n\n"
            f"Transcript:\n{transcript}"
        )

        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Parse JSON response
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return {
                "summary": response_text,
                "analysis": "Analysis could not be parsed due to invalid JSON format"
            }

    except Exception as e:
        raise ValueError(f"Failed to summarize transcript: {str(e)}")

def summarize_video(youtube_url: str, start_time: str = None, end_time: str = None) -> dict:
    """
    Generate a summary, transcript, and analysis of a YouTube video using Gemini API.
    
    Args:
        youtube_url (str): The YouTube video URL.
        start_time (str, optional): Start time in HH:MM:SS or seconds.
        end_time (str, optional): End time in HH:MM:SS or seconds.
    
    Returns:
        dict: Contains summary, transcript, and analysis.
    """
    try:
        if not youtube_url.startswith(('https://www.youtube.com', 'https://youtu.be')):
            raise ValueError("Invalid YouTube URL")

        # Validate time formats if provided
        if start_time and not re.match(r'^(\d{2}:\d{2}:\d{2}|\d+)$', start_time):
            raise ValueError("Invalid start time format. Use HH:MM:SS or seconds.")
        if end_time and not re.match(r'^(\d{2}:\d{2}:\d{2}|\d+)$', end_time):
            raise ValueError("Invalid end time format. Use HH:MM:SS or seconds.")

        # Convert times to seconds if provided
        def time_to_seconds(time_str):
            if not time_str:
                return None
            if ":" in time_str:
                h, m, s = map(int, time_str.split(":"))
                return h * 3600 + m * 60 + s
            return int(time_str)

        start_seconds = time_to_seconds(start_time)
        end_seconds = time_to_seconds(end_time)

        # Initialize Gemini model

        # Build prompt
        prompt = (
            "Provide a detailed summary of the YouTube video, including key points and themes. "
            "Also, generate a transcript of the spoken content. "
            "Finally, provide an analysis of the video, discussing its main themes, sentiment, and any notable insights. "
        )
        if start_seconds is not None and end_seconds is not None:
            prompt += f"Focus on the segment from {start_time} to {end_time}."

        # Configure video metadata for clipping if specified
        video_metadata = {}
        if start_seconds is not None and end_seconds is not None:
            video_metadata = {
                "videoMetadata": {
                    "startOffset": {"seconds": start_seconds},
                    "endOffset": {"seconds": end_seconds}
                }
            }

        # Make API call
        response = model.generate_content([
            {"file_data": {"file_uri": youtube_url, "mime_type": "video/mp4"}},
            {"text": prompt}
        ], request_options=video_metadata if video_metadata else None)

        # Extract response text
        response_text = response.text

        # Parse response (assuming Gemini returns structured text; adjust based on actual response format)
        # This is a simplified parsing; you may need to adjust based on Gemini's output
        sections = response_text.split("\n\n")
        summary = sections[0] if len(sections) > 0 else "No summary provided."
        transcript = sections[1] if len(sections) > 1 else "No transcript provided."
        analysis = sections[2] if len(sections) > 2 else "No analysis provided."

        return {
            "summary": summary,
            "transcript": transcript,
            "analysis": analysis
        }

    except Exception as e:
        raise ValueError(f"Failed to summarize video: {str(e)}")

@app.route("/api/extract-frame", methods=["POST"])
def extract_frame():
    """
    API endpoint to extract a frame from a YouTube video.
    Expects JSON with 'youtube_url', 'time', and 'extraction_id' fields.
    Returns the extracted frame as a JPG image.
    """
    try:
        data = request.get_json()
        if not data or "youtube_url" not in data or "time" not in data:
            return jsonify({"error": "Missing required parameters 'youtube_url' or 'time'"}), 400
        
        youtube_url = data["youtube_url"]
        time = data["time"]
        # extraction_id is not used in this example but can be logged or stored

        # Extract frame
        image_buffer = extract_frame_from_video(youtube_url, time)

        # Return image as streaming response
        return Response(
            image_buffer.getvalue(),
            mimetype="image/jpeg",
            headers={"Content-Disposition": "inline; filename=frame.jpg"}
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
    
# @app.route("/api/summarize-video", methods=["POST"])
# def summarize_video_endpoint():
#     """
#     API endpoint to summarize a YouTube video, including transcript and analysis.
#     Expects JSON with 'youtube_url', optional 'start_time', 'end_time', and 'extraction_id'.
#     """
#     try:
#         data = request.get_json()
#         if not data or "youtube_url" not in data:
#             return jsonify({"error": "Missing required parameter 'youtube_url'"}), 400
        
#         youtube_url = data["youtube_url"]
#         start_time = data.get("start_time")
#         end_time = data.get("end_time")

#         # extraction_id is included but not used here; can be logged or stored

#         result = summarize_video(youtube_url, start_time, end_time)
#         return jsonify(result)
#     except ValueError as e:
#         return jsonify({"error": str(e)}), 400
#     except Exception as e:
#         print(traceback.format_exc())
#         return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route("/api/summarize-video", methods=["POST"])
def summarize_video():
    """
    API endpoint to fetch YouTube video transcript and generate summary and analysis.
    Expects JSON with 'youtube_url', optional 'start_time', 'end_time', and 'extraction_id'.
    """
    try:
        data = request.get_json()
        if not data or "youtube_url" not in data:
            return jsonify({"error": "Missing required parameter 'youtube_url'"}), 400
        
        youtube_url = data["youtube_url"]
        start_time = data.get("start_time")
        end_time = data.get("end_time")

        video_id = extract_video_id(youtube_url)
        transcript = get_video_transcript(video_id, start_time, end_time)
        if not transcript:
            return jsonify({"error": "No transcript available for this video"}), 404

        result = summarize_and_analyze_transcript(transcript, youtube_url)
        result["transcript"] = transcript  # Include transcript in response

        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
    

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
                parsed_result = parse_gemini_response(response.text)
                if parsed_result is not None:
                    return jsonify(parsed_result)
                else:
                    raise ValueError("Invalid JSON response from model")
            except Exception as e:
                last_error = str(e)
                print(f"Chat attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    break
                time.sleep(1)
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
        video_id = extract_video_id(data["video_url"])
        video_stats = get_video_stats(video_id)
        comments = get_video_comments(data["video_url"])
        if not comments and video_stats['commentCount'] == 0:
            return jsonify({
                "error": "Comments are disabled or no comments found",
                "status": "error"
            }), 404
        comment_store[data["analysis_id"]] = comments
        def get_total_likes(comment):
            return comment['likes'] + sum(reply['likes'] for reply in comment.get('replies', []))
        sorted_comments = sorted(comments, key=get_total_likes, reverse=True)
        fetched_comments = len(sorted_comments)
        for comment in sorted_comments:
            fetched_comments += len(comment.get('replies', []))
        total_comments = video_stats['commentCount'] if video_stats['commentCount'] > 0 else fetched_comments
        total_likes = video_stats['likeCount']
        avg_likes = total_likes / total_comments if total_comments > 0 else 0
        ai_analysis = perform_detailed_analysis(sorted_comments)
        visualizations = {
            "sentiment_scatter": create_sentiment_visualization(sorted_comments),
            "engagement_distribution": create_engagement_visualization(sorted_comments),
            "wordcloud": create_wordcloud_visualization(sorted_comments),
            "sentiment_timeline": create_sentiment_timeline(sorted_comments),
            "category_distribution": create_category_distribution(ai_analysis)
        }
        for comment in sorted_comments:
            comment['sentiment'] = analyze_sentiment(comment['text'])
            for reply in comment.get('replies', []):
                reply['sentiment'] = analyze_sentiment(reply['text'])
        engagement_rates = {
            "high_engagement_rate": (ai_analysis['engagement_metrics']['high_engagement'] / fetched_comments) * 100 if fetched_comments > 0 else 0,
            "medium_engagement_rate": (ai_analysis['engagement_metrics']['medium_engagement'] / fetched_comments) * 100 if fetched_comments > 0 else 0,
            "low_engagement_rate": (ai_analysis['engagement_metrics']['low_engagement'] / fetched_comments) * 100 if fetched_comments > 0 else 0
        }
        sentiment_metrics = {
            "positive_rate": (ai_analysis['sentiment_distribution']['positive'] / fetched_comments) * 100 if fetched_comments > 0 else 0,
            "neutral_rate": (ai_analysis['sentiment_distribution']['neutral'] / fetched_comments) * 100 if fetched_comments > 0 else 0,
            "negative_rate": (ai_analysis['sentiment_distribution']['negative'] / fetched_comments) * 100 if fetched_comments > 0 else 0,
            "average_sentiment": sum(c['sentiment']['polarity'] for c in sorted_comments) / fetched_comments if fetched_comments > 0 else 0
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
                "sentiment_metrics": sentiment_metrics,
                "view_count": video_stats['viewCount']
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
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)