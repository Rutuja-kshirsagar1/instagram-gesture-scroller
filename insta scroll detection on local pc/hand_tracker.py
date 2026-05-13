import cv2
import mediapipe as mp


class HandTracker:
    def __init__(self,
                 mode=False,
                 max_hands=1,
                 detection_confidence=0.7,
                 tracking_confidence=0.7):

        self.mode = mode
        self.max_hands = max_hands
        self.detection_confidence = detection_confidence
        self.tracking_confidence = tracking_confidence

        self.mp_hands = mp.solutions.hands

        self.hands = self.mp_hands.Hands(
            static_image_mode=self.mode,
            max_num_hands=self.max_hands,
            min_detection_confidence=self.detection_confidence,
            min_tracking_confidence=self.tracking_confidence
        )

        self.mp_draw = mp.solutions.drawing_utils

    def detect_hands(self, frame, draw=True):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        self.results = self.hands.process(rgb_frame)

        if self.results.multi_hand_landmarks:
            for hand_landmarks in self.results.multi_hand_landmarks:

                if draw:
                    self.mp_draw.draw_landmarks(
                        frame,
                        hand_landmarks,
                        self.mp_hands.HAND_CONNECTIONS
                    )

        return frame

    def get_landmark_position(self, frame, landmark_id=8):
        h, w, _ = frame.shape

        if self.results.multi_hand_landmarks:
            hand_landmarks = self.results.multi_hand_landmarks[0]

            landmark = hand_landmarks.landmark[landmark_id]

            cx = int(landmark.x * w)
            cy = int(landmark.y * h)

            return cx, cy

        return None
    
    
