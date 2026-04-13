# services/input/base_strategy.py

from abc import ABC, abstractmethod


class InputStrategy(ABC):

    @abstractmethod
    def process(self, data) -> str:
        """
        Returns extracted/normalized text
        """
        pass

