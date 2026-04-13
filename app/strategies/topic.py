# services/input/topic_strategy.py

from .base import InputStrategy

class TopicStrategy(InputStrategy):
    """
    Strategy for processing topic input.
    """
    def process(self, data: str) -> str:
        return data.strip()

        
