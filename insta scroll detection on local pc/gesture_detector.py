import time
from collections import deque


class GestureDetector:
    def __init__(self):

        # Store recent Y positions
        self.y_positions = deque(maxlen=7)

        # Swipe threshold
        self.swipe_threshold = 120

        # Cooldown system
        self.cooldown_time = 1.0
        self.last_trigger_time = 0

    def detect_swipe(self, y_position):

        current_time = time.time()

        self.y_positions.append(y_position)

        # Need enough positions first
        if len(self.y_positions) < 7:
            return None

        oldest_y = self.y_positions[0]
        newest_y = self.y_positions[-1]

        movement = oldest_y - newest_y

        # Cooldown check
        if current_time - self.last_trigger_time < self.cooldown_time:
            return None

        # Swipe Up Detection
        if movement > self.swipe_threshold:
            self.last_trigger_time = current_time
            self.y_positions.clear()
            return "SWIPE_UP"

        # Swipe Down Detection
        elif movement < -self.swipe_threshold:
            self.last_trigger_time = current_time
            self.y_positions.clear()
            return "SWIPE_DOWN"

        return None