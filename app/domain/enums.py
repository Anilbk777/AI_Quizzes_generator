from enum import Enum

class InputType(str, Enum):
    TOPIC = "topic"
    FILE = "file"
    YOUTUBE = "youtube"


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
