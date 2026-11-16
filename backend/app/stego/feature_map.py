"""
Adaptive feature map computation for steganography.

REPRODUCIBILITY DESIGN:
  The analysis image is computed from the UPPER 6 BITS ONLY:
    analysis_rgb = rgb & 0xFC
  
  Since embedding modifies only the 1 or 2 LSBs of each channel,
  clearing those bits before analysis makes the feature map identical
  whether computed from the original cover or the resulting stego image.
  
  This is the key reproducibility invariant of the system.
"""
import numpy as np
from typing import Tuple, Dict

# Adaptive configuration presets
ADAPTIVE_CONFIGS = {
    0x01: {  # Conservative
        "name": "Conservative",
        "gradient_weight": 0.50,
        "variance_weight": 0.30,
        "edge_weight": 0.20,
        "low_threshold": 0.30,
        "high_threshold": 0.60,
        "low_bits": 0,
        "mid_bits": 1,
        "high_bits": 2,
    },
    0x02: {  # Balanced
        "name": "Balanced",
        "gradient_weight": 0.50,
        "variance_weight": 0.30,
        "edge_weight": 0.20,
        "low_threshold": 0.25,
        "high_threshold": 0.55,
        "low_bits": 0,
        "mid_bits": 1,
        "high_bits": 2,
    },
    0x03: {  # High Capacity
        "name": "High Capacity",
        "gradient_weight": 0.50,
        "variance_weight": 0.30,
        "edge_weight": 0.20,
        "low_threshold": 0.15,
        "high_threshold": 0.40,
        "low_bits": 0,
        "mid_bits": 1,
        "high_bits": 2,
    },
}


def make_stable_analysis_image(rgb_array: np.ndarray) -> np.ndarray:
    """
    Create the stable upper-six-bit analysis image.
    
    Clears the two least significant bits of each RGB channel.
    This makes the analysis image identical whether computed from
    the original cover image or the generated stego image,
    since embedding modifies only the 1 or 2 LSBs.
    
    Args:
        rgb_array: (H, W, 3) uint8 array
    
    Returns:
        (H, W, 3) uint8 array with 2 LSBs cleared
    """
    return rgb_array & np.uint8(0xFC)


def compute_grayscale(analysis_rgb: np.ndarray) -> np.ndarray:
    """
    Compute luminance from stable analysis RGB.
    Uses BT.601 weights.
    """
    r = analysis_rgb[:, :, 0].astype(np.float32)
    g = analysis_rgb[:, :, 1].astype(np.float32)
    b = analysis_rgb[:, :, 2].astype(np.float32)
    return 0.299 * r + 0.587 * g + 0.114 * b


def compute_sobel_gradient(gray: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Compute Sobel gradients and gradient magnitude.
    
    Args:
        gray: (H, W) float32 grayscale image
    
    Returns:
        (grad_x, grad_y, grad_magnitude) all float32
    """
    import cv2
    gray_uint8 = np.clip(gray, 0, 255).astype(np.uint8)
    grad_x = cv2.Sobel(gray_uint8, cv2.CV_32F, 1, 0, ksize=3)
    grad_y = cv2.Sobel(gray_uint8, cv2.CV_32F, 0, 1, ksize=3)
    grad_magnitude = np.sqrt(grad_x**2 + grad_y**2)
    return grad_x, grad_y, grad_magnitude


def compute_local_variance(gray: np.ndarray, kernel_size: int = 7) -> np.ndarray:
    """
    Compute local variance using box filter.
    
    Uses E[X^2] - E[X]^2 formulation for efficiency.
    
    Args:
        gray: (H, W) float32 grayscale image
        kernel_size: Neighborhood size (odd integer)
    
    Returns:
        (H, W) float32 local variance map
    """
    import cv2
    ksize = (kernel_size, kernel_size)
    mean = cv2.blur(gray, ksize)
    mean_sq = cv2.blur(gray**2, ksize)
    variance = mean_sq - mean**2
    return np.maximum(variance, 0.0)  # Clamp numerical negatives


def compute_canny_edges(gray: np.ndarray) -> np.ndarray:
    """
    Compute Canny edge map.
    
    Args:
        gray: (H, W) float32 grayscale image
    
    Returns:
        (H, W) uint8 binary edge map (0 or 255)
    """
    import cv2
    gray_uint8 = np.clip(gray, 0, 255).astype(np.uint8)
    edges = cv2.Canny(gray_uint8, threshold1=50, threshold2=150)
    return edges


def normalize_robust(arr: np.ndarray, low_pct: float = 1.0, high_pct: float = 99.0) -> np.ndarray:
    """
    Normalize array to [0, 1] using percentile clipping for robustness.
    Avoids division by zero for flat images.
    """
    low = np.percentile(arr, low_pct)
    high = np.percentile(arr, high_pct)
    if high - low < 1e-8:
        return np.zeros_like(arr, dtype=np.float32)
    clipped = np.clip(arr, low, high)
    normalized = (clipped - low) / (high - low)
    return normalized.astype(np.float32)


def compute_score_map(
    rgb_array: np.ndarray,
    config_id: int = 0x02,
) -> np.ndarray:
    """
    Compute adaptive score map from stable analysis image.
    
    score = w1 * norm_gradient + w2 * norm_variance + w3 * edge_indicator
    
    Args:
        rgb_array: (H, W, 3) uint8 original or stego image
        config_id: Adaptive configuration ID
    
    Returns:
        (H, W) float32 score map in [0, 1]
    """
    if config_id not in ADAPTIVE_CONFIGS:
        raise ValueError(f"Unsupported adaptive config ID: {config_id}")
    
    config = ADAPTIVE_CONFIGS[config_id]
    
    # Create stable upper-6-bit representation — same from cover or stego
    analysis_rgb = make_stable_analysis_image(rgb_array)
    
    # Grayscale
    gray = compute_grayscale(analysis_rgb)
    
    # Sobel gradient
    _, _, grad_magnitude = compute_sobel_gradient(gray)
    norm_gradient = normalize_robust(grad_magnitude)
    
    # Local variance
    variance_map = compute_local_variance(gray)
    norm_variance = normalize_robust(variance_map)
    
    # Canny edge indicator
    edges = compute_canny_edges(gray)
    edge_indicator = (edges > 0).astype(np.float32)
    
    # Weighted score
    score = (
        config["gradient_weight"] * norm_gradient
        + config["variance_weight"] * norm_variance
        + config["edge_weight"] * edge_indicator
    )
    
    # Clip to [0, 1]
    return np.clip(score, 0.0, 1.0).astype(np.float32)


def compute_bit_allocation_map(
    score_map: np.ndarray,
    config_id: int = 0x02,
) -> np.ndarray:
    """
    Convert score map to per-pixel bit allocation (0, 1, or 2 bits per channel).
    
    Args:
        score_map: (H, W) float32 scores in [0, 1]
        config_id: Adaptive configuration ID
    
    Returns:
        (H, W) uint8 array: 0, 1 or 2 bits per pixel per RGB channel
    """
    if config_id not in ADAPTIVE_CONFIGS:
        raise ValueError(f"Unsupported adaptive config ID: {config_id}")
    
    config = ADAPTIVE_CONFIGS[config_id]
    low_t = config["low_threshold"]
    high_t = config["high_threshold"]
    
    allocation = np.zeros(score_map.shape, dtype=np.uint8)
    allocation[score_map >= low_t] = config["mid_bits"]
    allocation[score_map >= high_t] = config["high_bits"]
    
    return allocation
