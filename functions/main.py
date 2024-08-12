

# The Firebase Admin SDK to access Cloud Firestore.
from firebase_functions import firestore_fn, https_fn
from firebase_admin import initialize_app, firestore, storage
import os
import time
import mimetypes
import google.generativeai as genai
from dotenv import load_dotenv
import requests
load_dotenv() 
# Configure Gemini API
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
import logging
# Configure Gemini API

# Configure logging for Cloud Functions
logger = logging.getLogger('cloudfunctions.googleapis.com/cloud-functions')
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())

def get_mime_type(file_path, url):
    """Determine the MIME type of a file."""
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type is None:
        # If we can't determine from the file path, try from the URL
        mime_type, _ = mimetypes.guess_type(url)
    if mime_type is None:
        logger.warning(msg=f"Could not determine MIME type for {file_path} or {url}. Defaulting to video/mp4.")
        return "video/mp4"
    return mime_type

def download_video(video_url):
    """Downloads the video from the given URL."""
    logger.info(msg=f"Starting to download video from URL: {video_url}")
    response = requests.get(video_url, stream=True)
    response.raise_for_status()

    # Extract filename from URL or use a default name
    filename = "downloaded_video.mp4"
    if "?" in video_url:
        filename = video_url.split("?")[0].split("/")[-1]
    
    local_path = f'/tmp/{filename}'
    
    with open(local_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

    logger.info(msg=f"Video downloaded successfully to {local_path}")
    return local_path

def upload_to_gemini(video_path, video_url):
    """Uploads the video to Gemini and waits for it to be processed."""
    mime_type = get_mime_type(video_path, video_url)
    logger.info(msg=f"Uploading video to Gemini with MIME type: {mime_type}")

    file = genai.upload_file(video_path, mime_type=mime_type)
    logger.info(msg=f"File '{file.display_name}' uploaded to Gemini as: {file.uri}")

    # Wait for the file to be processed
    max_attempts = 13
    for attempt in range(max_attempts):
        file_info = genai.get_file(file.name)
        if file_info.state.name == "ACTIVE":
            logger.info(msg="File is now in ACTIVE state")
            return file
        logger.info(msg=f"File not yet active, waiting... (Attempt {attempt + 1}/{max_attempts})")
        time.sleep(10)  # Wait for 5 seconds before checking again

    raise Exception("File did not become active within the expected time")



db = firestore.Client()

@firestore_fn.on_document_created(document="submissions/{submissionsId}", timeout_sec=300)
def onsubmission(event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None]) -> None:
    """Listens for new documents to be added to submissions. Processes the video using Gemini API and updates the document with the score."""
    logger.info(msg="New submission document created. Starting processing.")
    
    video_url = event.data.get("videoUrl")
    if not video_url:
        logger.error(msg="No videoUrl found in the document")
        return

    competition_rules = event.data.get("competitionRules")
    if not competition_rules:
        logger.error(msg="No competitionRules found in the document")
        return
    logger.info(msg=f"Competition rules: {competition_rules}")

    local_video_path = None
    try:
        # Download the video
        local_video_path = download_video(video_url)

        # Upload the video to Gemini
        gemini_file = upload_to_gemini(local_video_path, video_url)

        # Create the Gemini model
        logger.info(msg="Creating Gemini model")
        generation_config = {
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 8192,
            "response_mime_type": "text/plain",
        }

        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=generation_config,
            system_instruction=competition_rules
        )

        # Start a chat session with Gemini
        logger.info(msg="Starting chat session with Gemini")
        chat_session = model.start_chat(
            history=[
                {
                    "role": "user",
                    "parts": [gemini_file],
                },
            ]
        )

        # Send a message to analyze the video
        logger.info(msg="Requesting video analysis from Gemini")
        response = chat_session.send_message("Follow the system rules to score the content provided as best as you can. Your answer should be a single integer number. Example: 23")

        response_text = response.text
        # Update the document with the score
        logger.info(msg=f"Received score from Gemini: {response_text}")
        event.data.reference.set({"score": int(response_text.strip())}, merge=True)
        logger.info(msg="Document updated successfully with score")

    
    except requests.RequestException as e:
        logger.exception(msg=f"Error downloading the video: {str(e)}")
        event.data.reference.update({"error": f"Video download failed: {str(e)}"})
    except Exception as e:
        logger.exception(msg=f"An error occurred during processing: {str(e)}")
        event.data.reference.update({"error": str(e)})
        logger.info(msg="Document updated with error information")
    finally:
        # Clean up the temporary file
        if local_video_path and os.path.exists(local_video_path):
            os.remove(local_video_path)
            logger.debug(msg=f"Temporary file {local_video_path} removed")

    logger.info(msg="Video processing completed")