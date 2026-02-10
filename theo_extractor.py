import os
import yaml
import sys
# Note: In a real environment, you'd run 'pip install youtube-transcript-api'
# from youtube_transcript_api import YouTubeTranscriptApi

class TheoExtractor:
    def __init__(self, config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            self.config = yaml.safe_all_load(f) if hasattr(yaml, 'safe_all_load') else yaml.safe_load(f)
        
        self.transcript_dir = self.config.get('output_settings', {}).get('transcript_dir', './raw_transcripts')
        os.makedirs(self.transcript_dir, exist_ok=True)

    def extract_transcript(self, video_url):
        video_id = self.get_video_id(video_url)
        print(f"[Theo] Extracting transcript for {video_id}...")
        
        # Simulation of extraction (since API needs install)
        # In real use: transcript = YouTubeTranscriptApi.get_transcript(video_id)
        mock_transcript = f"Raw transcript content for video {video_id}..."
        
        output_file = os.path.join(self.transcript_dir, f"{video_id}.txt")
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(mock_transcript)
        
        return output_file

    def get_video_id(self, url):
        if "v=" in url:
            return url.split("v=")[1].split("&")[0]
        return url.split("/")[-1]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python theo_extractor.py <config_path>")
        sys.exit(1)
        
    extractor = TheoExtractor(sys.argv[1])
    # For demo, we just print the readiness
    print("[Theo] Extractor initialized. Ready to harvest transcripts.")
