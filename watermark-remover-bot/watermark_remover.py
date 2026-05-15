"""
Video Watermark Removal Module.

Uses OpenCV inpainting to remove watermarks from video frames.
Supports predefined regions (corners, center) and custom regions.
"""

import logging
import os
import shutil
import subprocess
from typing import Optional, Tuple, Union

import cv2
import numpy as np

logger = logging.getLogger(__name__)

# Type alias for region specification
Region = Union[str, Tuple[int, int, int, int]]


def get_region_coords(
    frame_height: int, frame_width: int, region: Region
) -> Tuple[int, int, int, int]:
    """
    Convert a region name to pixel coordinates (x, y, width, height).

    Predefined regions cover approximately 15% of the frame in each dimension.
    """
    # Default watermark size relative to frame
    wm_width = int(frame_width * 0.15)
    wm_height = int(frame_height * 0.08)
    padding = 10

    if isinstance(region, tuple):
        return region

    region_map = {
        "top_left": (padding, padding, wm_width, wm_height),
        "top_right": (
            frame_width - wm_width - padding,
            padding,
            wm_width,
            wm_height,
        ),
        "bottom_left": (
            padding,
            frame_height - wm_height - padding,
            wm_width,
            wm_height,
        ),
        "bottom_right": (
            frame_width - wm_width - padding,
            frame_height - wm_height - padding,
            wm_width,
            wm_height,
        ),
        "center": (
            (frame_width - wm_width) // 2,
            (frame_height - wm_height) // 2,
            wm_width,
            wm_height,
        ),
    }

    return region_map.get(region, region_map["bottom_right"])


def detect_watermark_region(
    video_path: str,
) -> Optional[Tuple[int, int, int, int]]:
    """
    Attempt to auto-detect the watermark region in a video.

    Uses frame difference analysis to find static elements that persist
    across multiple frames (likely a watermark).

    Returns (x, y, width, height) or None if detection fails.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logger.error(f"Cannot open video: {video_path}")
        return None

    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if frame_count < 10:
        cap.release()
        return None

    # Sample frames evenly throughout the video
    sample_indices = np.linspace(0, frame_count - 1, min(20, frame_count), dtype=int)
    frames = []

    for idx in sample_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            frames.append(gray)

    cap.release()

    if len(frames) < 5:
        return None

    # Compute standard deviation across frames
    # Low std areas that are not uniform black/white are likely watermarks
    frame_stack = np.array(frames, dtype=np.float32)
    std_map = np.std(frame_stack, axis=0)
    mean_map = np.mean(frame_stack, axis=0)

    # Watermarks have low temporal variance but are not pure black/white
    watermark_mask = (std_map < 15) & (mean_map > 30) & (mean_map < 225)
    watermark_mask = watermark_mask.astype(np.uint8) * 255

    # Morphological operations to clean up the mask
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    watermark_mask = cv2.morphologyEx(watermark_mask, cv2.MORPH_CLOSE, kernel)
    watermark_mask = cv2.morphologyEx(watermark_mask, cv2.MORPH_OPEN, kernel)

    # Find contours
    contours, _ = cv2.findContours(
        watermark_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return None

    # Find the largest contour that could be a watermark
    # Filter by area: not too small, not too large
    frame_h, frame_w = frames[0].shape
    min_area = frame_h * frame_w * 0.001  # At least 0.1% of frame
    max_area = frame_h * frame_w * 0.15  # At most 15% of frame

    valid_contours = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if min_area <= area <= max_area:
            valid_contours.append(contour)

    if not valid_contours:
        return None

    # Get bounding box of the largest valid contour
    largest = max(valid_contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest)

    # Add padding
    padding = 5
    x = max(0, x - padding)
    y = max(0, y - padding)
    w = min(frame_w - x, w + 2 * padding)
    h = min(frame_h - y, h + 2 * padding)

    return (x, y, w, h)


def create_watermark_mask(
    frame: np.ndarray, region: Tuple[int, int, int, int]
) -> np.ndarray:
    """
    Create a binary mask for the watermark region.

    Uses edge detection and thresholding within the specified region
    to identify watermark pixels more precisely.
    """
    x, y, w, h = region
    frame_h, frame_w = frame.shape[:2]

    # Clamp coordinates
    x = max(0, min(x, frame_w - 1))
    y = max(0, min(y, frame_h - 1))
    w = min(w, frame_w - x)
    h = min(h, frame_h - y)

    mask = np.zeros((frame_h, frame_w), dtype=np.uint8)

    # Extract the region of interest
    roi = frame[y : y + h, x : x + w]

    if roi.size == 0:
        return mask

    # Convert to grayscale if needed
    if len(roi.shape) == 3:
        roi_gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    else:
        roi_gray = roi

    # Use adaptive thresholding to find watermark pixels
    # This works well for both light and dark watermarks
    thresh = cv2.adaptiveThreshold(
        roi_gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # Edge detection to find watermark boundaries
    edges = cv2.Canny(roi_gray, 50, 150)

    # Dilate edges to create a wider mask
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    edges_dilated = cv2.dilate(edges, kernel, iterations=2)

    # Combine threshold and edges for a better mask
    roi_mask = cv2.bitwise_or(thresh, edges_dilated)

    # Fill the entire region as the mask (simpler but effective approach)
    # The inpainting algorithm handles the blending
    mask[y : y + h, x : x + w] = 255

    return mask


def remove_watermark(
    input_path: str,
    output_path: str,
    region: Region,
    inpaint_radius: int = 5,
    method: str = "telea",
) -> bool:
    """
    Remove watermark from a video file.

    Args:
        input_path: Path to input video file.
        output_path: Path to save the output video.
        region: Watermark region - either a preset name or (x, y, w, h) tuple.
        inpaint_radius: Radius for inpainting algorithm.
        method: Inpainting method - 'telea' or 'ns' (Navier-Stokes).

    Returns:
        True if successful, False otherwise.
    """
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        logger.error(f"Cannot open input video: {input_path}")
        return False

    # Get video properties
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if fps <= 0:
        fps = 30.0

    # Get region coordinates
    region_coords = get_region_coords(frame_height, frame_width, region)
    logger.info(
        f"Processing video: {frame_width}x{frame_height}, "
        f"{fps}fps, {frame_count} frames"
    )
    logger.info(f"Watermark region: {region_coords}")

    # Select inpainting method
    if method == "ns":
        inpaint_method = cv2.INPAINT_NS
    else:
        inpaint_method = cv2.INPAINT_TELEA

    # Set up video writer
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

    if not out.isOpened():
        logger.error(f"Cannot create output video: {output_path}")
        cap.release()
        return False

    # Create the mask once (same region for all frames)
    mask = np.zeros((frame_height, frame_width), dtype=np.uint8)
    x, y, w, h = region_coords
    x = max(0, min(x, frame_width - 1))
    y = max(0, min(y, frame_height - 1))
    w = min(w, frame_width - x)
    h = min(h, frame_height - y)
    mask[y : y + h, x : x + w] = 255

    processed_frames = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Apply inpainting to remove watermark
        cleaned_frame = cv2.inpaint(frame, mask, inpaint_radius, inpaint_method)
        out.write(cleaned_frame)
        processed_frames += 1

        if processed_frames % 100 == 0:
            logger.info(f"Processed {processed_frames}/{frame_count} frames")

    cap.release()
    out.release()

    logger.info(f"Processing complete. {processed_frames} frames processed.")

    # Copy audio from original video using ffmpeg if available
    _copy_audio(input_path, output_path)

    return processed_frames > 0


def _copy_audio(input_path: str, output_path: str) -> None:
    """Copy audio from the original video to the processed video using ffmpeg."""
    if not shutil.which("ffmpeg"):
        logger.warning("ffmpeg not found. Output video will have no audio.")
        return

    temp_output = output_path + ".tmp.mp4"

    try:
        cmd = [
            "ffmpeg",
            "-y",
            "-i", output_path,
            "-i", input_path,
            "-c:v", "copy",
            "-c:a", "aac",
            "-map", "0:v:0",
            "-map", "1:a:0?",
            "-shortest",
            temp_output,
        ]
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=300
        )

        if result.returncode == 0 and os.path.exists(temp_output):
            os.replace(temp_output, output_path)
            logger.info("Audio copied successfully.")
        else:
            # If ffmpeg fails, keep the video without audio
            if os.path.exists(temp_output):
                os.remove(temp_output)
            logger.warning(f"Failed to copy audio: {result.stderr[:200]}")

    except (subprocess.TimeoutExpired, OSError) as e:
        logger.warning(f"Audio copy failed: {e}")
        if os.path.exists(temp_output):
            os.remove(temp_output)

