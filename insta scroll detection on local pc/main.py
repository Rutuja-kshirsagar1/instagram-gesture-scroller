import cv2
from hand_tracker import HandTracker
from gesture_detector import GestureDetector
from browser_controller import BrowserController
from utils import FPSCounter, draw_text, draw_center_line

# Initialize modules
tracker = HandTracker()
gesture_detector = GestureDetector()
browser_controller = BrowserController()
fps_counter = FPSCounter()


# Open webcam
cap = cv2.VideoCapture(0)

# Camera resolution
cap.set(3, 1280)
cap.set(4, 720)


while True:
    success, frame = cap.read()
    if not success:
        break

    # Mirror effect
    frame = cv2.flip(frame, 1)

    # Detect hands
    frame = tracker.detect_hands(frame)

    # Get index fingertip position
    position = tracker.get_landmark_position(frame, landmark_id=8)

    if position:
        x, y = position

        # Draw fingertip
        cv2.circle(frame, (x, y), 15, (0, 255, 255), cv2.FILLED)

        # Gesture detection
        gesture = gesture_detector.detect_swipe(y)

        if gesture == "SWIPE_UP":
            browser_controller.next_reel()

        elif gesture == "SWIPE_DOWN":
            browser_controller.previous_reel()

        # Display gesture text
        if gesture:
            draw_text(
                frame,
                gesture,
                (50, 100),
                (0, 0, 255),
                2
            )

    # Draw helper line
    draw_center_line(frame)

    # FPS display
    fps = fps_counter.get_fps()
    draw_text(frame, f"FPS: {fps}", (50, 50))

    # Instructions
    draw_text(frame, "Swipe Up = Next Reel", (50, 650))
    draw_text(frame, "Swipe Down = Previous Reel", (50, 690))

    # Show frame
    cv2.imshow("Instagram Gesture Controller", frame)

    # Exit key
    key = cv2.waitKey(1)

    if key == ord('q'):
        break
    


cap.release()
cv2.destroyAllWindows()