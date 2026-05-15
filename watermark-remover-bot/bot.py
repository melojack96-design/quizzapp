"""
Telegram Bot for Video Watermark Removal.

This bot accepts video files and removes watermarks using OpenCV inpainting.
Users can either let the bot auto-detect the watermark or specify a region manually.
"""

import os
import logging
import tempfile
import uuid

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ConversationHandler,
    ContextTypes,
    filters,
)

from watermark_remover import remove_watermark, detect_watermark_region

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# Conversation states
WAITING_VIDEO, WAITING_REGION, PROCESSING = range(3)

# Temp directory for processing
TEMP_DIR = os.path.join(tempfile.gettempdir(), "watermark_bot")
os.makedirs(TEMP_DIR, exist_ok=True)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Send welcome message when /start is issued."""
    await update.message.reply_text(
        "🎬 *Video Watermark Remover Bot*\n\n"
        "Send me a video and I'll remove the watermark for you!\n\n"
        "*How to use:*\n"
        "1. Send a video file (as document or video)\n"
        "2. Choose watermark position or specify custom region\n"
        "3. Wait for processing\n"
        "4. Get your clean video back!\n\n"
        "*Commands:*\n"
        "/start - Show this message\n"
        "/help - Show help\n"
        "/cancel - Cancel current operation",
        parse_mode="Markdown",
    )
    return WAITING_VIDEO


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send help message."""
    await update.message.reply_text(
        "📖 *Help*\n\n"
        "*Supported formats:* MP4, AVI, MOV, MKV, WMV\n"
        "*Max file size:* 50 MB (Telegram limit)\n\n"
        "*Watermark positions:*\n"
        "• Top-left\n"
        "• Top-right\n"
        "• Bottom-left\n"
        "• Bottom-right\n"
        "• Center\n"
        "• Auto-detect\n"
        "• Custom (specify x, y, width, height)\n\n"
        "*Tips:*\n"
        "• For best results, use videos with solid-color watermarks\n"
        "• Semi-transparent watermarks work but results may vary\n"
        "• Smaller watermarks give better results",
        parse_mode="Markdown",
    )


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Cancel the current operation."""
    context.user_data.clear()
    await update.message.reply_text("❌ Operation cancelled.")
    return ConversationHandler.END


async def receive_video(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handle received video file."""
    message = update.message

    # Get the file object (video or document)
    if message.video:
        file = message.video
        file_name = message.video.file_name or f"video_{uuid.uuid4().hex[:8]}.mp4"
    elif message.document:
        file = message.document
        file_name = message.document.file_name or f"video_{uuid.uuid4().hex[:8]}.mp4"
    else:
        await message.reply_text("❌ Please send a video file.")
        return WAITING_VIDEO

    # Check file extension
    valid_extensions = (".mp4", ".avi", ".mov", ".mkv", ".wmv")
    if not file_name.lower().endswith(valid_extensions):
        await message.reply_text(
            f"❌ Unsupported format. Please send a video in one of these formats: "
            f"{', '.join(valid_extensions)}"
        )
        return WAITING_VIDEO

    # Check file size (50MB Telegram limit)
    if file.file_size and file.file_size > 50 * 1024 * 1024:
        await message.reply_text("❌ File is too large. Maximum size is 50 MB.")
        return WAITING_VIDEO

    await message.reply_text("⬇️ Downloading video...")

    # Download the file
    telegram_file = await file.get_file()
    input_path = os.path.join(TEMP_DIR, f"input_{uuid.uuid4().hex[:8]}_{file_name}")
    await telegram_file.download_to_drive(input_path)

    context.user_data["input_path"] = input_path
    context.user_data["file_name"] = file_name

    # Ask user for watermark region
    keyboard = [
        [
            InlineKeyboardButton("↖️ Top-Left", callback_data="region_top_left"),
            InlineKeyboardButton("↗️ Top-Right", callback_data="region_top_right"),
        ],
        [
            InlineKeyboardButton("↙️ Bottom-Left", callback_data="region_bottom_left"),
            InlineKeyboardButton("↘️ Bottom-Right", callback_data="region_bottom_right"),
        ],
        [
            InlineKeyboardButton("⭕ Center", callback_data="region_center"),
        ],
        [
            InlineKeyboardButton("🔍 Auto-Detect", callback_data="region_auto"),
        ],
        [
            InlineKeyboardButton("✏️ Custom Region", callback_data="region_custom"),
        ],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await message.reply_text(
        "✅ Video received!\n\n"
        "Where is the watermark located?",
        reply_markup=reply_markup,
    )
    return WAITING_REGION


async def region_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handle watermark region selection."""
    query = update.callback_query
    await query.answer()

    region_choice = query.data.replace("region_", "")

    if region_choice == "custom":
        await query.edit_message_text(
            "✏️ *Custom Region*\n\n"
            "Send me the watermark region as:\n"
            "`x y width height`\n\n"
            "Where x,y is the top-left corner of the watermark.\n"
            "All values are in pixels.\n\n"
            "Example: `10 10 200 50`",
            parse_mode="Markdown",
        )
        return WAITING_REGION

    context.user_data["region_choice"] = region_choice

    await query.edit_message_text("⏳ Processing video... This may take a while.")

    # Process the video
    result = await process_video(update, context)
    return result


async def receive_custom_region(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> int:
    """Handle custom region input."""
    text = update.message.text.strip()

    try:
        parts = text.split()
        if len(parts) != 4:
            raise ValueError("Need exactly 4 values")
        x, y, w, h = int(parts[0]), int(parts[1]), int(parts[2]), int(parts[3])
        if any(v < 0 for v in [x, y, w, h]):
            raise ValueError("Values must be positive")
        context.user_data["custom_region"] = (x, y, w, h)
        context.user_data["region_choice"] = "custom"
    except (ValueError, IndexError):
        await update.message.reply_text(
            "❌ Invalid format. Please send 4 positive numbers separated by spaces.\n"
            "Example: `10 10 200 50`",
            parse_mode="Markdown",
        )
        return WAITING_REGION

    await update.message.reply_text("⏳ Processing video... This may take a while.")

    result = await process_video(update, context)
    return result


async def process_video(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Process the video and remove the watermark."""
    input_path = context.user_data.get("input_path")
    file_name = context.user_data.get("file_name", "output.mp4")
    region_choice = context.user_data.get("region_choice", "auto")
    custom_region = context.user_data.get("custom_region")

    if not input_path or not os.path.exists(input_path):
        if update.callback_query:
            await update.callback_query.edit_message_text(
                "❌ Error: Video file not found. Please send the video again."
            )
        else:
            await update.message.reply_text(
                "❌ Error: Video file not found. Please send the video again."
            )
        return ConversationHandler.END

    output_path = os.path.join(
        TEMP_DIR, f"output_{uuid.uuid4().hex[:8]}_{file_name}"
    )

    try:
        # Determine region
        if region_choice == "custom" and custom_region:
            region = custom_region
        elif region_choice == "auto":
            region = detect_watermark_region(input_path)
            if region is None:
                if update.callback_query:
                    await update.callback_query.edit_message_text(
                        "⚠️ Could not auto-detect watermark. "
                        "Please try specifying the region manually."
                    )
                else:
                    await update.message.reply_text(
                        "⚠️ Could not auto-detect watermark. "
                        "Please try specifying the region manually."
                    )
                return ConversationHandler.END
        else:
            region = region_choice

        # Remove watermark
        success = remove_watermark(input_path, output_path, region)

        if success and os.path.exists(output_path):
            # Send the processed video
            chat_id = (
                update.callback_query.message.chat_id
                if update.callback_query
                else update.message.chat_id
            )
            with open(output_path, "rb") as video_file:
                await context.bot.send_video(
                    chat_id=chat_id,
                    video=video_file,
                    caption="✅ Watermark removed successfully!",
                    supports_streaming=True,
                )
        else:
            error_msg = "❌ Failed to process video. Please try again."
            if update.callback_query:
                await update.callback_query.edit_message_text(error_msg)
            else:
                await update.message.reply_text(error_msg)

    except Exception as e:
        logger.error(f"Error processing video: {e}")
        error_msg = f"❌ An error occurred: {str(e)}"
        if update.callback_query:
            await update.callback_query.edit_message_text(error_msg)
        else:
            await update.message.reply_text(error_msg)

    finally:
        # Cleanup temp files
        for path in [input_path, output_path]:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except OSError:
                    pass
        context.user_data.clear()

    return ConversationHandler.END


def main() -> None:
    """Start the bot."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        logger.error(
            "TELEGRAM_BOT_TOKEN environment variable not set. "
            "Get a token from @BotFather on Telegram."
        )
        raise SystemExit(1)

    application = Application.builder().token(token).build()

    # Conversation handler for the watermark removal flow
    conv_handler = ConversationHandler(
        entry_points=[
            CommandHandler("start", start),
            MessageHandler(filters.VIDEO | filters.Document.ALL, receive_video),
        ],
        states={
            WAITING_VIDEO: [
                MessageHandler(filters.VIDEO | filters.Document.ALL, receive_video),
            ],
            WAITING_REGION: [
                CallbackQueryHandler(region_callback, pattern="^region_"),
                MessageHandler(
                    filters.TEXT & ~filters.COMMAND, receive_custom_region
                ),
            ],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )

    application.add_handler(conv_handler)
    application.add_handler(CommandHandler("help", help_command))

    logger.info("Bot started. Polling for updates...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
