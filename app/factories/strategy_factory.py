# services/input/strategy_factory.py

from app.domain.enums import InputType
from app.strategies.base import InputStrategy
from app.strategies.topic import TopicStrategy
from app.strategies.file import FileStrategy
# from app.strategies.youtube import YouTubeStrategy


class StrategyFactory:

    _strategies = {
        InputType.TOPIC: TopicStrategy,
        InputType.FILE: FileStrategy,
        # InputType.YOUTUBE: YouTubeStrategy,
    }

    @classmethod
    def get_strategy(cls, input_type: InputType) -> InputStrategy:
        strategy_class = cls._strategies.get(input_type)

        if not strategy_class:
            raise ValueError(f"Unsupported input type: {input_type}")

        return strategy_class()