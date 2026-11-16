# API Reference

The backend provides a versioned REST API at `/api/v1`.

---

## 1. Health Check
`GET /api/v1/health`

### Response (200 OK)
```json
{
  "status": "ok",
  "version": "1.0.0",
  "environment": "development"
}
```

---

## 2. Capacity Calculation
`POST /api/v1/capacity`

Computes the usable payload capacity of a candidate carrier image without embedding.

### Request (Multipart Form Data)
| Field | Type | Description |
|---|---|---|
| `cover` | File | Lossless image file (PNG, BMP, TIFF) |
| `adaptive_config_id` | Integer (Form) | 1 (Conservative), 2 (Balanced), 3 (High Capacity) |

### Response (200 OK)
```json
{
  "width": 512,
  "height": 512,
  "format": "PNG",
  "total_pixels": 262144,
  "total_channels": 786432,
  "header_channels": 512,
  "usable_capacity_bits": 841280,
  "usable_capacity_bytes": 105160,
  "zero_bit_pixels": 45120,
  "one_bit_pixels": 182000,
  "two_bit_pixels": 35024,
  "adaptive_config_name": "Balanced",
  "warnings": []
}
```

---

## 3. Encode & Embed
`POST /api/v1/encode`

Encrypts and embeds a secret payload into the cover image.

### Request (Multipart Form Data)
| Field | Type | Description |
|---|---|---|
| `cover` | File | Lossless cover image |
| `payload_type` | String | `"text"` or `"file"` |
| `password` | String | Passphrase (minimum 8 characters) |
| `adaptive_config_id` | Integer | 1, 2, or 3 (default: 2) |
| `text_payload` | String (optional) | Secret text when `payload_type="text"` |
| `file_payload` | File (optional) | Secret file when `payload_type="file"` |

### Response (200 OK)
Returns a ZIP archive (`application/zip`) containing:
- `stego.png`: Lossless carrier image with hidden encrypted payload.
- `report.json`: Non-secret quality report and algorithm metadata.
- `README.txt`: Plain text operational notes.

---

## 4. Decode & Extract
`POST /api/v1/decode`

Extracts, authenticates, and decrypts hidden payload from a stego image.

### Request (Multipart Form Data)
| Field | Type | Description |
|---|---|---|
| `stego` | File | Lossless stego image |
| `password` | String | Secret passphrase |

### Response (200 OK)
Returns a ZIP archive (`application/zip`) containing:
- Recovered secret file or `recovered_message.txt`.
- `verification.json`: Cryptographic integrity report.

---

## 5. Image Quality Analysis
`POST /api/v1/analyze`

Computes objective quality metrics and generates visual heatmaps between cover and stego images.

### Request (Multipart Form Data)
| Field | Type | Description |
|---|---|---|
| `cover` | File | Original cover image |
| `stego` | File | Corresponding stego image |
| `adaptive_config_id` | Integer | Preset ID for feature map visualization |

### Response (200 OK)
```json
{
  "mse": 0.0084,
  "psnr": 68.8821,
  "psnr_display": "68.8821 dB",
  "ssim": 0.99986,
  "cover_entropy": 7.421,
  "stego_entropy": 7.423,
  "entropy_difference": 0.002,
  "changed_pixels": 4210,
  "changed_pixels_ratio": 0.016,
  "difference_heatmap_png_b64": "iVBORw0KGgo...",
  "score_map_png_b64": "iVBORw0KGgo...",
  "edge_map_png_b64": "iVBORw0KGgo..."
}
```

---

## 6. Empirical Benchmark
`POST /api/v1/benchmark`

Executes real-time comparative benchmark across payload sizes.
