# Video Watermark Remover Telegram Bot

A Telegram bot that removes watermarks from videos using OpenCV inpainting.

## Features

- Remove watermarks from video files (MP4, AVI, MOV, MKV, WMV)
- Multiple watermark position presets (corners, center)
- Auto-detect watermark regions
- Custom region specification (x, y, width, height)
- Preserves original audio track
- Interactive inline keyboard for region selection

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` and follow the prompts
3. Copy the bot token you receive

### 2. Install Dependencies

```bash
# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Install FFmpeg (for audio preservation)

```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### 4. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your bot token
nano .env
```

Or set the environment variable directly:

```bash
export TELEGRAM_BOT_TOKEN="your-bot-token-here"
```

### 5. Run the Bot

```bash
python bot.py
```

## Usage

1. Start a chat with your bot on Telegram
2. Send `/start` to see the welcome message
3. Send a video file (as video or document)
4. Choose where the watermark is located:
   - **Top-Left / Top-Right / Bottom-Left / Bottom-Right**: Preset corner regions
   - **Center**: Center of the frame
   - **Auto-Detect**: Bot attempts to find the watermark automatically
   - **Custom Region**: Specify exact pixel coordinates (x y width height)
5. Wait for processing
6. Receive the cleaned video

## How It Works

The bot uses **OpenCV's inpainting algorithm** to remove watermarks:

1. A mask is created for the watermark region
2. Each video frame is processed using the Telea inpainting method
3. The algorithm fills in the masked area using surrounding pixel information
4. Audio is preserved from the original video using FFmpeg

## Limitations

- Maximum file size: 50 MB (Telegram API limit)
- Processing time depends on video length and resolution
- Best results with solid-color or semi-transparent watermarks
- Complex animated watermarks may not be fully removed
- Auto-detection works best with static watermarks on dynamic backgrounds

## Project Structure

```
watermark-remover-bot/
├── bot.py                 # Main Telegram bot logic
├── watermark_remover.py   # Video processing and watermark removal
├── requirements.txt       # Python dependencies
├── .env.example           # Example environment configuration
└── README.md              # This file
```
