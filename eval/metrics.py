from typing import List


def mean(scores: List[float]) -> float:
    return sum(scores) / len(scores) if scores else 0.0


def passes_threshold(scores: List[float], threshold: float) -> bool:
    return mean(scores) >= threshold


FAITHFULNESS_THRESHOLD = 0.87
RELEVANCY_THRESHOLD = 0.84
