# The Firebase Admin SDK to access Cloud Firestore.
from firebase_functions import firestore_fn
from firebase_admin import firestore
import os
import google.generativeai as genai
import logging
from gemini.ai import download_video, upload_to_gemini, gemini_get_score_tool

from dotenv import load_dotenv
load_dotenv() 

# Configure Gemini API
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Configure logging for Cloud Functions
logger = logging.getLogger('cloudfunctions.googleapis.com/cloud-functions')
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())

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
        logger.info(msg=f"Downloadning file")
        local_video_path = download_video(video_url, logger)

        # Upload the video to Gemini
        logger.info(msg=f"Uploading file")
        gemini_file = upload_to_gemini(local_video_path, logger)

        # Create the Gemini model
        logger.info(msg="Creating Gemini model")
        model = model = genai.GenerativeModel(
            model_name='models/gemini-1.5-pro',
            tools = [gemini_get_score_tool()])


        # Send a message to analyze the video
        logger.info(msg="Requesting content evaluation from Gemini")
        result = model.generate_content([gemini_file, f"""
        Evaluate the content based on the provided rules. If content cant be evaluated return score 0:
        Rules:
        {competition_rules}
        """],
        # Force a function call
        tool_config={'function_calling_config':'ANY'})

        gemini_function_call = result.candidates[0].content.parts[0].function_call
        gemini_final_score = type(gemini_function_call).to_dict(gemini_function_call)['args']['score']

        # Update the document with the score
        logger.info(msg=f"Received score from Gemini: {gemini_final_score}")
        event.data.reference.set({"score": gemini_final_score}, merge=True)
        logger.info(msg="Document updated successfully with score")

    except Exception as e:
        logger.error(msg=f"Error while processing video: {e}")
        return

    logger.info(msg="Video processing completed")