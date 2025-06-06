import requests
import time
import sys

def test_server_health():
    print("Testing Python server health...")
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.ok
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Is it running?")
        return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def main():
    max_attempts = 3
    for attempt in range(max_attempts):
        print(f"\nAttempt {attempt + 1}/{max_attempts}")
        if test_server_health():
            print("Server is healthy!")
            sys.exit(0)
        if attempt < max_attempts - 1:
            print("Waiting 5 seconds before next attempt...")
            time.sleep(5)
    
    print("\nServer health check failed after all attempts")
    sys.exit(1)

if __name__ == "__main__":
    main() 