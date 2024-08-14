import google.generativeai as genai
import requests
import time
import textwrap

def download_video(video_url, logger):
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

def upload_to_gemini(video_path, logger):
    """Uploads the video to Gemini and waits for it to be processed."""

    file = genai.upload_file(video_path, mime_type=None)
    logger.info(msg=f"File '{file.display_name}' uploaded to Gemini as: {file.uri}")

    while file.state.name == "PROCESSING":
        logger.info(msg=f"Processing video...")
        time.sleep(5)
        file = genai.get_file(file.name)
    return file


        
def gemini_get_score_tool():
    return genai.protos.FunctionDeclaration(
    name="gemini_get_score_tool",
    description=textwrap.dedent("""\
        Gets the final score of the evaluation.
        """),
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties = {
            'score': genai.protos.Schema(type=genai.protos.Type.INTEGER),
        }
    )
)