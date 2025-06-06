import os
from typing import List, Dict
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from openai import OpenAI
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
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

load_dotenv()

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
    model = genai.GenerativeModel("gemini-pro",
                                generation_config=generation_config)
    # Test the model
    response = model.generate_content("Test")
    if not response.text:
        raise Exception("Model returned empty response")
except Exception as e:
    print(f"Warning: Error with primary model configuration: {str(e)}")
    try:
        # Try with minimal configuration
        model = genai.GenerativeModel("gemini-pro")
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
    if "v=" in url:
        return url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    raise ValueError("Invalid YouTube URL")

def setup_driver():
    try:
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        service = Service(ChromeDriverManager().install())
        return webdriver.Chrome(service=service, options=chrome_options)
    except Exception as e:
        print(f"Error setting up Chrome driver: {str(e)}")
        traceback.print_exc()
        raise ValueError("Failed to initialize Chrome driver. Make sure Chrome is installed.")

def get_video_comments(video_url: str, max_retries: int = 3) -> List[Dict]:
    for attempt in range(max_retries):
        driver = None
        try:
            driver = setup_driver()
            comments = []
            
            # Load the video page with timeout
            driver.set_page_load_timeout(30)  # 30 seconds timeout for page load
            driver.get(video_url)
            time.sleep(3)
            
            # Scroll to load comments
            last_height = driver.execute_script("return document.documentElement.scrollHeight")
            comment_count = 0
            max_comments = 100
            scroll_timeout = time.time() + 60  # 60 seconds maximum for scrolling
            
            while comment_count < max_comments and time.time() < scroll_timeout:
                driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight);")
                time.sleep(2)
                
                comment_elements = driver.find_elements(By.CSS_SELECTOR, "ytd-comment-thread-renderer")
                
                for element in comment_elements[comment_count:]:
                    try:
                        comment_text = element.find_element(By.CSS_SELECTOR, "#content-text").text
                        author = element.find_element(By.CSS_SELECTOR, "#author-text").text.strip()
                        like_element = element.find_elements(By.CSS_SELECTOR, "#vote-count-middle")
                        likes = 0
                        
                        if like_element:
                            likes_text = like_element[0].text
                            if 'K' in likes_text:
                                likes = int(float(likes_text.replace('K', '')) * 1000)
                            elif 'M' in likes_text:
                                likes = int(float(likes_text.replace('M', '')) * 1000000)
                            else:
                                likes = int(likes_text) if likes_text.strip() else 0
                        
                        comments.append({
                            "text": comment_text,
                            "author": author,
                            "likes": likes,
                            "publishedAt": ""
                        })
                        
                        comment_count += 1
                        if comment_count >= max_comments:
                            break
                    except Exception as e:
                        print(f"Error parsing comment: {str(e)}")
                        continue
                
                new_height = driver.execute_script("return document.documentElement.scrollHeight")
                if new_height == last_height:
                    break
                last_height = new_height
            
            return comments
            
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            print(traceback.format_exc())
            if attempt == max_retries - 1:
                raise ValueError(f"Failed to scrape comments after {max_retries} attempts: {str(e)}")
        finally:
            if driver:
                try:
                    driver.quit()
                except:
                    pass
    
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
    # Extract sentiments for all comments
    sentiments = [analyze_sentiment(comment['text']) for comment in comments]
    df = pd.DataFrame(sentiments)
    
    # Create the plot
    plt.figure(figsize=(10, 6))
    plt.scatter(df['polarity'], df['subjectivity'], alpha=0.5)
    plt.xlabel('Polarity (Negative to Positive)')
    plt.ylabel('Subjectivity (Objective to Subjective)')
    plt.title('Comment Sentiment Analysis')
    
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
    plt.figure(figsize=(10, 6))
    plt.hist(likes, bins=30, color='skyblue', edgecolor='black')
    plt.xlabel('Number of Likes')
    plt.ylabel('Frequency')
    plt.title('Comment Engagement Distribution')
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    
    return image_base64

def create_wordcloud_visualization(comments: List[Dict]) -> str:
    """Create word cloud visualization from comments"""
    text = ' '.join([comment['text'] for comment in comments])
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
    sentiments = [analyze_sentiment(comment['text'])['polarity'] for comment in comments]
    plt.figure(figsize=(12, 6))
    plt.plot(range(len(sentiments)), sentiments, marker='o', linestyle='-', alpha=0.6)
    plt.xlabel('Comment Sequence')
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
        # Format comments for analysis
        comments_text = "Analyze these YouTube comments:\n\n"
        for i, comment in enumerate(comments[:50], 1):
            comments_text += f"Comment {i}:\n- Text: {comment['text']}\n- Likes: {comment['likes']}\n\n"
        
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
        comments_text = "Here are the YouTube comments to analyze:\n\n"
        for i, comment in enumerate(comments[:50], 1):
            comments_text += f"Comment {i}:\n- Text: {comment['text']}\n- Likes: {comment['likes']}\n\n"

        prompt = f"""
        Based on these YouTube comments, please answer the following question:
        Question: {data['question']}

        Comments:
        {comments_text}

        Provide a detailed analysis in this exact JSON format:
        {{
            "answer": "detailed answer to the question",
            "relevant_comments": ["comment1", "comment2"],
            "confidence": "high/medium/low",
            "additional_insights": "any additional relevant insights"
        }}

        Rules:
        1. Base your answer solely on the provided comments
        2. Include 2-3 most relevant comments that support your answer
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
            return jsonify({"error": "Missing required parameters"}), 400

        comments = get_video_comments(data["video_url"])
        
        if not comments:
            return jsonify({
                "error": "No comments were found or could be loaded"
            }), 404
        
        # Store comments for chat functionality
        comment_store[data["analysis_id"]] = comments
        
        # Sort comments by likes
        sorted_comments = sorted(comments, key=lambda x: x['likes'], reverse=True)
        
        # Basic statistics
        total_comments = len(sorted_comments)
        total_likes = sum(c['likes'] for c in sorted_comments)
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
        
        # Add sentiment analysis to each comment
        for comment in sorted_comments:
            comment['sentiment'] = analyze_sentiment(comment['text'])
        
        # Calculate additional metrics
        engagement_rates = {
            "high_engagement_rate": (ai_analysis['engagement_metrics']['high_engagement'] / total_comments) * 100,
            "medium_engagement_rate": (ai_analysis['engagement_metrics']['medium_engagement'] / total_comments) * 100,
            "low_engagement_rate": (ai_analysis['engagement_metrics']['low_engagement'] / total_comments) * 100
        }
        
        sentiment_metrics = {
            "positive_rate": (ai_analysis['sentiment_distribution']['positive'] / total_comments) * 100,
            "neutral_rate": (ai_analysis['sentiment_distribution']['neutral'] / total_comments) * 100,
            "negative_rate": (ai_analysis['sentiment_distribution']['negative'] / total_comments) * 100,
            "average_sentiment": sum(c['sentiment']['polarity'] for c in sorted_comments) / total_comments
        }
    
        return jsonify({
            "status": "success",
            "comments": sorted_comments,
            "statistics": {
                "total_comments": total_comments,
                "total_likes": total_likes,
                "average_likes": round(avg_likes, 2),
                "engagement_rates": engagement_rates,
                "sentiment_metrics": sentiment_metrics
            },
            "ai_analysis": ai_analysis,
            "visualizations": visualizations
        })
            
    except ValueError as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, threaded=True) 