import pyautogui
import time


class BrowserController:
    def __init__(self):
        pyautogui.FAILSAFE = False

    def next_reel(self):
        pyautogui.press("down")
        print("NEXT REEL")

    def previous_reel(self):
        pyautogui.press("up")
        print("PREVIOUS REEL")
        
    