import cv2
import time


class FPSCounter:
    def __init__(self):
        self.previous_time = 0

    def get_fps(self):
        current_time = time.time()

        fps = 1 / (current_time - self.previous_time + 0.0001)

        self.previous_time = current_time

        return int(fps)


def draw_text(frame, text, position, color=(0, 255, 0), scale=1):
    cv2.putText(
        frame,
        text,
        position,
        cv2.FONT_HERSHEY_SIMPLEX,
        scale,
        color,
        2
    )


def draw_center_line(frame):
    h, w, _ = frame.shape

    cv2.line(
        frame,
        (0, h // 2),
        (w, h // 2),
        (255, 0, 0),
        2
    )