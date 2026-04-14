from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi, CouldNotRetrieveTranscript
from youtube_transcript_api._errors import IpBlocked
from app.strategies.base import InputStrategy
from app.core.logger import logger
from app.core.exceptions import QuizGenerationError, YouTubeAccessError


class YouTubeStrategy(InputStrategy):
    """
    Strategy for extracting transcripts from YouTube videos.
    Supports English transcripts (manual or auto-generated).
    """

    def process(self, url: str) -> str:
        logger.info(f"Processing YouTube URL: {url}")

        video_id = self._extract_video_id(url)
        if not video_id:
            logger.error(f"Failed to extract video ID from URL: {url}")
            raise QuizGenerationError(
                "Invalid YouTube URL. Could not extract video ID."
            )

        transcript_data = self._fetch_transcript(video_id)

        merged_text = " ".join(chunk.text for chunk in transcript_data)
        if not merged_text.strip():
            logger.error(f"Transcript is empty for video: {video_id}")
            raise QuizGenerationError("The retrieved YouTube transcript is empty.")

        logger.info(f"Transcript extracted successfully for video: {video_id}")
        return merged_text

    def _fetch_transcript(self, video_id: str):
        try:
            logger.info(f"Fetching transcript for video: {video_id}")
            return YouTubeTranscriptApi().fetch(video_id, languages=["en"])

        except IpBlocked as e:
            logger.error(f"IP blocked by YouTube for video: {video_id}")
            raise YouTubeAccessError(
                "YouTube is currently blocking requests from this server. "
                "This is a temporary network restriction. "
                "Please try again later or use a different internet connection."
            ) from e

        except CouldNotRetrieveTranscript as e:
            logger.error(f"Could not retrieve transcript for video: {video_id}")
            raise QuizGenerationError(
                "Could not retrieve transcript for this video. "
                "The video may not have English captions available, "
                "or captions may be disabled by the video owner."
            ) from e

    def _extract_video_id(self, url: str) -> str | None:
        if not url:
            return None

        parsed_url = urlparse(url)

        if parsed_url.hostname == "youtu.be":
            return parsed_url.path.strip("/")

        if parsed_url.hostname in ("www.youtube.com", "youtube.com"):
            if parsed_url.path == "/watch":
                query = parse_qs(parsed_url.query)
                return query.get("v", [None])[0]

            path_parts = parsed_url.path.strip("/").split("/")
            if len(path_parts) >= 2 and path_parts[0] in ("embed", "v", "shorts"):
                return path_parts[1]

        return None