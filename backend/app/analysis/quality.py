"""
Image quality metrics for comparing cover and stego images.
All metrics are computed from actual numpy arrays — no fabricated values.
"""
import numpy as np
from typing import Dict, Any, Optional
import math


def compute_mse(cover: np.ndarray, stego: np.ndarray) -> float:
    """
    Mean Squared Error between cover and stego images.
    Uses float64 to prevent uint8 overflow.
    Lower MSE = less distortion.
    """
    if cover.shape != stego.shape:
        raise ValueError(f"Image shapes must match: {cover.shape} vs {stego.shape}")
    cover_f = cover.astype(np.float64)
    stego_f = stego.astype(np.float64)
    return float(np.mean((cover_f - stego_f) ** 2))


def compute_psnr(mse: float, max_val: float = 255.0) -> Optional[float]:
    """
    Peak Signal-to-Noise Ratio from MSE.
    Returns None for zero MSE (infinite PSNR).
    Higher PSNR = less distortion.
    """
    if mse <= 0.0:
        return None  # Infinite PSNR — images are identical
    return 10.0 * math.log10((max_val ** 2) / mse)


def compute_ssim(cover: np.ndarray, stego: np.ndarray) -> float:
    """
    Structural Similarity Index Measure.
    Uses skimage implementation with correct parameters for 8-bit RGB.
    Returns value in [-1, 1]; 1.0 = identical.
    """
    from skimage.metrics import structural_similarity
    
    if cover.shape != stego.shape:
        raise ValueError(f"Image shapes must match for SSIM: {cover.shape} vs {stego.shape}")
    
    h, w = cover.shape[:2]
    # Minimum dimension for default window
    min_dim = min(h, w)
    win_size = min(7, min_dim)
    if win_size % 2 == 0:
        win_size -= 1
    win_size = max(3, win_size)
    
    ssim_val = structural_similarity(
        cover,
        stego,
        data_range=255,
        channel_axis=2,
        win_size=win_size,
    )
    return float(ssim_val)


def compute_image_entropy(img: np.ndarray) -> float:
    """
    Compute Shannon entropy of pixel value distribution.
    Higher entropy = more complex/random pixel distribution.
    """
    flat = img.flatten().astype(np.uint8)
    hist, _ = np.histogram(flat, bins=256, range=(0, 256))
    hist = hist[hist > 0]
    total = hist.sum()
    probs = hist / total
    entropy = -np.sum(probs * np.log2(probs))
    return float(entropy)


def compute_changed_pixels(cover: np.ndarray, stego: np.ndarray) -> Dict[str, Any]:
    """
    Count and characterize changed pixels between cover and stego.
    """
    if cover.shape != stego.shape:
        raise ValueError("Shapes must match")
    
    diff = cover.astype(np.int16) - stego.astype(np.int16)
    pixel_changed = np.any(diff != 0, axis=2)
    channel_changed = diff != 0
    
    total_pixels = cover.shape[0] * cover.shape[1]
    total_channels = total_pixels * 3
    
    return {
        "changed_pixels": int(np.sum(pixel_changed)),
        "changed_pixels_ratio": float(np.sum(pixel_changed)) / total_pixels,
        "changed_channels": int(np.sum(channel_changed)),
        "changed_channels_ratio": float(np.sum(channel_changed)) / total_channels,
        "total_pixels": total_pixels,
        "total_channels": total_channels,
    }


def compute_edge_density(img: np.ndarray) -> float:
    """
    Compute fraction of pixels classified as edges using Canny.
    """
    import cv2
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    return float(np.mean(edges > 0))


def compute_rgb_histograms(img: np.ndarray) -> Dict[str, list]:
    """
    Compute normalized histograms for R, G, B channels.
    Returns 256-bin histograms.
    """
    result = {}
    channel_names = ['r', 'g', 'b']
    for i, name in enumerate(channel_names):
        channel = img[:, :, i].flatten()
        hist, edges = np.histogram(channel, bins=256, range=(0, 256))
        result[name] = hist.tolist()
    return result


def compute_full_quality_report(
    cover: np.ndarray,
    stego: np.ndarray,
    capacity_bits: int = 0,
    payload_bits: int = 0,
    encode_time: float = 0.0,
) -> Dict[str, Any]:
    """
    Compute all image quality metrics and return as a structured report.
    """
    mse = compute_mse(cover, stego)
    psnr = compute_psnr(mse)
    ssim = compute_ssim(cover, stego)
    cover_entropy = compute_image_entropy(cover)
    stego_entropy = compute_image_entropy(stego)
    changed = compute_changed_pixels(cover, stego)
    cover_edge_density = compute_edge_density(cover)
    stego_edge_density = compute_edge_density(stego)
    cover_hist = compute_rgb_histograms(cover)
    stego_hist = compute_rgb_histograms(stego)
    
    h, w = cover.shape[:2]
    
    report = {
        "image_dimensions": {"width": w, "height": h},
        "mse": mse,
        "psnr": psnr,  # None means infinite (identical images)
        "psnr_display": "∞ (identical)" if psnr is None else f"{psnr:.4f} dB",
        "ssim": ssim,
        "cover_entropy": cover_entropy,
        "stego_entropy": stego_entropy,
        "entropy_difference": stego_entropy - cover_entropy,
        **changed,
        "cover_edge_density": cover_edge_density,
        "stego_edge_density": stego_edge_density,
        "cover_rgb_histograms": cover_hist,
        "stego_rgb_histograms": stego_hist,
        "capacity_bits": capacity_bits,
        "payload_bits": payload_bits,
        "capacity_bytes": capacity_bits // 8,
        "payload_bytes": payload_bits // 8,
        "capacity_utilization": (payload_bits / capacity_bits) if capacity_bits > 0 else 0.0,
        "encode_time_seconds": encode_time,
    }
    return report
