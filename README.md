# instagram-gesture-scroller

## folder 1 - insta scroll detection on local pc


⚡ Controls
☝️ Swipe Up

Moves to next reel.

👇 Swipe Down

Moves to previous reel.

🚀 How To Use
Run:
python main.py
Open Instagram Reels in browser.
Click once on reel screen.
Show hand gestures to webcam.
Control reels using gestures.

🔥 Performance Tips

✅ Use bright lighting
✅ Use plain background
✅ Keep camera stable
✅ Maintain proper distance from webcam

🌟 Example Workflow
Run project
Open Instagram reels
Show gesture to webcam
Reel changes automatically

📄 Requirements
opencv-python
mediapipe
numpy
pyautogui

## folder 2 -reel scroller chrome extension

chrome-extension/           
    ├── manifest.json
    ├── background.js          
    ├── content.js             
    ├── popup.html
    ├── popup.js    
    └── icons/
        ├── icon16.png
        ├── icon48.png
        └── icon128.png

🔥 how to add extension 

1. Open Chrome and go to: `chrome://extensions`
2. Enable **Developer mode** (toggle, top-right)
3. Click **"Load unpacked"**
4. Select the `chrome-extension/` folder
5. The extension card shows an **ID** like: `abcdefghijklmnopqrstuvwxyzabcdef`
6. **Copy this ID** — you'll need it dectection web page

🔥 how to use 

. Open `https://www.instagram.com/reels/` in a Chrome tab
2. Open detection page in another tab through popup 
3. In the detection page, enter your Extension ID and save it
4. Click "Enable Camera" and allow webcam access
5. Show an **open palm** → Instagram should scroll DOWN to next reel
6. Show a **fist** → Instagram should scroll UP to previous reel
7. Show a **peace sign** → Scrolling pauses (show again to resume)

The Chrome extension currently does not work properly. The popup opens and the detection page runs successfully, but Instagram Reels do not scroll due to browser security restrictions.

If you would like to contribute or improve the extension, feel free to do so.

For now, the code inside the first folder works efficiently and is the recommended version to use.
